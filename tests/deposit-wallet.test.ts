import { decodeFunctionData, getAddress } from "viem";
import { describe, expect, it } from "vitest";
import {
  buildDepositWalletBatch,
  buildPushFundedCreateCalls,
  buildRelayerAuthHeaders,
  buildRelayerSubmitPayload,
  buildRequestCloseCalls,
  buildRequestPartialCloseCalls,
  depositWalletFactoryAddress,
  getDepositWalletBatchTypedData,
} from "../src/contract/deposit-wallet";
import type { Quote } from "../src/types";

const vaultAddress = getAddress("0x5323fe5a5cd7eccc0ef96761c313e6fab4c324cd");
const pUsdAddress = getAddress("0xc011a7e12a19f7b1f670d46f03b03f3342e82dfb");
const depositWalletAddress = getAddress("0x95112e5392e0a03ad9290a04ea4e561dd7447355");
const ownerAddress = getAddress("0x89fa517528ad7aa188fcb7cee43a7c5b642a8327");

function mockQuote(overrides: Partial<Quote> = {}): Quote {
  return {
    polygonVaultContractAddress: vaultAddress,
    positionSeedHex: "0x0123456789abcdef0123456789abcdef",
    polymarketMarketId: "0x1111111111111111111111111111111111111111111111111111111111111111",
    polymarketTokenId: "12345",
    collateralUsdcUnits: "2000000",
    leverageBps: 20000,
    notionalUsdcUnits: "4000000",
    originationFeeBps: 100,
    lifetimeFeeAprBps: 2000,
    liquidationFeeBps: 250,
    expectedOpenTradingFeeUsdcUnits: "10000",
    contractSignature: "0xabcdef",
    signatureExpiry: "1700000000",
    totalUserAmountUsdcUnits: "2030000",
    ...overrides,
  } as Quote;
}

describe("buildPushFundedCreateCalls", () => {
  it("builds the 3-call batch in order: reserveDeposit, transfer, createPositionPushFunded", () => {
    const calls = buildPushFundedCreateCalls(mockQuote(), pUsdAddress);

    expect(calls).toHaveLength(3);

    const reserve = decodeFunctionData({
      abi: [
        {
          type: "function",
          name: "reserveDeposit",
          stateMutability: "nonpayable",
          inputs: [{ name: "expectedAmountUsdcUnits", type: "uint256" }],
          outputs: [],
        },
      ],
      data: calls[0].data,
    });
    expect(reserve.functionName).toBe("reserveDeposit");
    expect(reserve.args).toEqual([2030000n]);

    const transfer = decodeFunctionData({
      abi: [
        {
          type: "function",
          name: "transfer",
          stateMutability: "nonpayable",
          inputs: [
            { name: "to", type: "address" },
            { name: "amount", type: "uint256" },
          ],
          outputs: [{ name: "", type: "bool" }],
        },
      ],
      data: calls[1].data,
    });
    expect(transfer.functionName).toBe("transfer");
    expect(transfer.args[1]).toBe(2030000n);
  });

  it("targets the vault, pUSD, then the vault", () => {
    const calls = buildPushFundedCreateCalls(mockQuote(), pUsdAddress);
    expect(calls[0].target).toBe(vaultAddress);
    expect(calls[1].target).toBe(pUsdAddress);
    expect(calls[2].target).toBe(vaultAddress);
    expect(calls.every((call) => call.value === 0n)).toBe(true);
  });

  it("funds reservation and transfer with the same totalUserAmount", () => {
    const calls = buildPushFundedCreateCalls(mockQuote(), pUsdAddress);
    expect(calls[0].data.slice(10)).toBe(calls[1].data.slice(-64));
  });
});

describe("buildRequestCloseCalls", () => {
  it("builds a single requestClose call", () => {
    const positionKey = "0x2222222222222222222222222222222222222222222222222222222222222222";
    const calls = buildRequestCloseCalls(vaultAddress, positionKey);
    expect(calls).toHaveLength(1);
    expect(calls[0].target).toBe(vaultAddress);
    expect(calls[0].value).toBe(0n);
  });
});

describe("buildRequestPartialCloseCalls", () => {
  const positionKey = "0x2222222222222222222222222222222222222222222222222222222222222222";

  it("builds a single requestPartialClose call carrying the slice", () => {
    const calls = buildRequestPartialCloseCalls(vaultAddress, positionKey, 5_000_000n);
    expect(calls).toHaveLength(1);
    expect(calls[0].target).toBe(vaultAddress);
    expect(calls[0].value).toBe(0n);

    const decoded = decodeFunctionData({
      abi: [
        {
          type: "function",
          name: "requestPartialClose",
          stateMutability: "nonpayable",
          inputs: [
            { name: "positionKey", type: "bytes32" },
            { name: "closeTokenUnits", type: "uint256" },
          ],
          outputs: [],
        },
      ],
      data: calls[0].data,
    });
    expect(decoded.functionName).toBe("requestPartialClose");
    expect(decoded.args).toEqual([positionKey, 5_000_000n]);
  });
});

describe("buildDepositWalletBatch / typed data", () => {
  it("assembles a batch and EIP-712 typed data for signing", () => {
    const calls = buildRequestCloseCalls(
      vaultAddress,
      "0x2222222222222222222222222222222222222222222222222222222222222222",
    );
    const batch = buildDepositWalletBatch({
      depositWalletAddress,
      nonce: 7n,
      deadline: 1900000000n,
      calls,
    });

    expect(batch.wallet).toBe(depositWalletAddress);
    expect(batch.nonce).toBe(7n);

    const typedData = getDepositWalletBatchTypedData(batch);
    expect(typedData.primaryType).toBe("Batch");
    expect(typedData.domain).toEqual({
      name: "DepositWallet",
      version: "1",
      chainId: 137,
      verifyingContract: depositWalletAddress,
    });
  });
});

describe("buildRelayerSubmitPayload", () => {
  it("builds the WALLET-typed relayer body", () => {
    const calls = buildPushFundedCreateCalls(mockQuote(), pUsdAddress);
    const batch = buildDepositWalletBatch({
      depositWalletAddress,
      nonce: 3n,
      deadline: 1900000000n,
      calls,
    });
    const payload = buildRelayerSubmitPayload({
      ownerAddress,
      batch,
      signature: "0xdeadbeef",
    });

    expect(payload.type).toBe("WALLET");
    expect(payload.to).toBe(depositWalletFactoryAddress);
    expect(payload.from).toBe(ownerAddress);
    expect(payload.nonce).toBe("3");
    expect(payload.depositWalletParams.depositWallet).toBe(depositWalletAddress);
    expect(payload.depositWalletParams.deadline).toBe("1900000000");
    expect(payload.depositWalletParams.calls).toHaveLength(3);
    expect(payload.depositWalletParams.calls[0].value).toBe("0");
  });
});

describe("buildRelayerAuthHeaders", () => {
  it("computes deterministic HMAC headers for a fixed timestamp", async () => {
    const headers = await buildRelayerAuthHeaders({
      apiKey: "test-key",
      apiSecret: btoa("test-secret"),
      apiPassphrase: "test-pass",
      body: '{"hello":"world"}',
      timestamp: "1700000000",
    });

    expect(headers.POLY_BUILDER_API_KEY).toBe("test-key");
    expect(headers.POLY_BUILDER_TIMESTAMP).toBe("1700000000");
    expect(headers.POLY_BUILDER_PASSPHRASE).toBe("test-pass");
    expect(headers.POLY_BUILDER_SIGNATURE).toMatch(/^[A-Za-z0-9_=-]+$/);

    const again = await buildRelayerAuthHeaders({
      apiKey: "test-key",
      apiSecret: btoa("test-secret"),
      apiPassphrase: "test-pass",
      body: '{"hello":"world"}',
      timestamp: "1700000000",
    });
    expect(again.POLY_BUILDER_SIGNATURE).toBe(headers.POLY_BUILDER_SIGNATURE);
  });
});
