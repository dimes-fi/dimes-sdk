import { decodeFunctionData, getAddress } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { describe, expect, it } from "vitest";
import { buildCreatePositionTx } from "../src/contract/build-tx";
import { buildPushFundedCreateCalls } from "../src/contract/deposit-wallet";
import { isCommittedQuote } from "../src/contract/risk-mode";
import { recoverCreatePositionSigner } from "../src/contract/verify-signature";
import type { Quote } from "../src/types";

const vaultAddress = getAddress("0x5323fe5a5cd7eccc0ef96761c313e6fab4c324cd");
const pUsdAddress = getAddress("0xc011a7e12a19f7b1f670d46f03b03f3342e82dfb");
const userAddress = getAddress("0x89fa517528ad7aa188fcb7cee43a7c5b642a8327");
const signerKey = "0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d" as const;

function mockQuote(overrides: Partial<Quote> = {}): Quote {
  return {
    evmChainId: "137",
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
    riskMode: "adaptive",
    marginUsdcUnits: "0",
    totalUserAmountUsdcUnits: "2030000",
    ...overrides,
  } as Quote;
}

function committedQuote(overrides: Partial<Quote> = {}): Quote {
  return mockQuote({
    riskMode: "committed",
    marginUsdcUnits: "670000",
    totalUserAmountUsdcUnits: "2700000",
    ...overrides,
  });
}

const domain = {
  name: "LeveragedPredictionVaultV1",
  version: "1",
  chainId: 137,
  verifyingContract: vaultAddress,
} as const;

const withMarginTypes = {
  CreatePositionWithMargin: [
    { name: "positionSeed", type: "bytes16" },
    { name: "user", type: "address" },
    { name: "marketId", type: "bytes32" },
    { name: "tokenId", type: "uint256" },
    { name: "collateralUsdcUnits", type: "uint256" },
    { name: "leverageBps", type: "uint32" },
    { name: "notionalUsdcUnits", type: "uint256" },
    { name: "originationFeeBps", type: "uint16" },
    { name: "lifetimeFeeAprBps", type: "uint16" },
    { name: "liquidationFeeBps", type: "uint16" },
    { name: "venueFeeUsdcUnits", type: "uint256" },
    { name: "marginUsdcUnits", type: "uint256" },
    { name: "signatureExpiry", type: "uint256" },
  ],
} as const;

describe("isCommittedQuote", () => {
  it("reads the mode off the quote", () => {
    expect(isCommittedQuote(committedQuote())).toBe(true);
    expect(isCommittedQuote(mockQuote())).toBe(false);
  });

  it("treats a quote issued before committed mode existed as adaptive", () => {
    const legacy = mockQuote();
    delete (legacy as Partial<Quote>).riskMode;
    expect(isCommittedQuote(legacy)).toBe(false);
  });
});

describe("buildCreatePositionTx", () => {
  it("builds createPosition for an adaptive quote", () => {
    const tx = buildCreatePositionTx(mockQuote());
    expect(tx.functionName).toBe("createPosition");
    expect(tx.args).toHaveLength(12);
  });

  it("builds createPositionWithMargin for a committed quote, with margin before the signature", () => {
    const tx = buildCreatePositionTx(committedQuote());
    expect(tx.functionName).toBe("createPositionWithMargin");
    expect(tx.args).toHaveLength(13);
    expect(tx.args[10]).toBe(670000n);
    expect(tx.args[11]).toBe("0xabcdef");
    expect(tx.args[12]).toBe(1700000000n);
  });
});

describe("buildPushFundedCreateCalls", () => {
  it("uses createPositionPushFundedWithMargin and pushes the margin-inclusive total", () => {
    const calls = buildPushFundedCreateCalls(committedQuote(), pUsdAddress);
    expect(calls).toHaveLength(3);

    const created = decodeFunctionData({
      abi: [
        {
          type: "function",
          name: "createPositionPushFundedWithMargin",
          stateMutability: "nonpayable",
          inputs: [
            { name: "positionSeed", type: "bytes16" },
            { name: "marketId", type: "bytes32" },
            { name: "tokenId", type: "uint256" },
            { name: "collateralUsdcUnits", type: "uint256" },
            { name: "leverageBps", type: "uint32" },
            { name: "notionalUsdcUnits", type: "uint256" },
            { name: "originationFeeBps", type: "uint16" },
            { name: "lifetimeFeeAprBps", type: "uint16" },
            { name: "liquidationFeeBps", type: "uint16" },
            { name: "venueFeeUsdcUnits", type: "uint256" },
            { name: "marginUsdcUnits", type: "uint256" },
            { name: "signature", type: "bytes" },
            { name: "signatureExpiry", type: "uint256" },
          ],
          outputs: [],
        },
      ],
      data: calls[2].data,
    });

    expect(created.functionName).toBe("createPositionPushFundedWithMargin");
    expect(created.args[10]).toBe(670000n);

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
    expect(reserve.args).toEqual([2700000n]);
  });

  it("still uses the plain push-funded call for an adaptive quote", () => {
    const calls = buildPushFundedCreateCalls(mockQuote(), pUsdAddress);
    const created = decodeFunctionData({
      abi: [
        {
          type: "function",
          name: "createPositionPushFunded",
          stateMutability: "nonpayable",
          inputs: [
            { name: "positionSeed", type: "bytes16" },
            { name: "marketId", type: "bytes32" },
            { name: "tokenId", type: "uint256" },
            { name: "collateralUsdcUnits", type: "uint256" },
            { name: "leverageBps", type: "uint32" },
            { name: "notionalUsdcUnits", type: "uint256" },
            { name: "originationFeeBps", type: "uint16" },
            { name: "lifetimeFeeAprBps", type: "uint16" },
            { name: "liquidationFeeBps", type: "uint16" },
            { name: "venueFeeUsdcUnits", type: "uint256" },
            { name: "signature", type: "bytes" },
            { name: "signatureExpiry", type: "uint256" },
          ],
          outputs: [],
        },
      ],
      data: calls[2].data,
    });
    expect(created.functionName).toBe("createPositionPushFunded");
  });
});

describe("recoverCreatePositionSigner", () => {
  it("recovers a committed quote against the with-margin type", async () => {
    const account = privateKeyToAccount(signerKey);
    const quote = committedQuote();
    const signature = await account.signTypedData({
      domain,
      types: withMarginTypes,
      primaryType: "CreatePositionWithMargin",
      message: {
        positionSeed: quote.positionSeedHex as `0x${string}`,
        user: userAddress,
        marketId: quote.polymarketMarketId as `0x${string}`,
        tokenId: BigInt(quote.polymarketTokenId),
        collateralUsdcUnits: BigInt(quote.collateralUsdcUnits),
        leverageBps: quote.leverageBps,
        notionalUsdcUnits: BigInt(quote.notionalUsdcUnits),
        originationFeeBps: quote.originationFeeBps,
        lifetimeFeeAprBps: quote.lifetimeFeeAprBps,
        liquidationFeeBps: quote.liquidationFeeBps,
        venueFeeUsdcUnits: BigInt(quote.expectedOpenTradingFeeUsdcUnits),
        marginUsdcUnits: BigInt(quote.marginUsdcUnits),
        signatureExpiry: BigInt(quote.signatureExpiry),
      },
    });

    const recovered = await recoverCreatePositionSigner(committedQuote({ contractSignature: signature }), userAddress);
    expect(recovered).toBe(account.address);
  });

  it("does not recover the signer when the same signature is read as an adaptive quote", async () => {
    const account = privateKeyToAccount(signerKey);
    const quote = committedQuote();
    const signature = await account.signTypedData({
      domain,
      types: withMarginTypes,
      primaryType: "CreatePositionWithMargin",
      message: {
        positionSeed: quote.positionSeedHex as `0x${string}`,
        user: userAddress,
        marketId: quote.polymarketMarketId as `0x${string}`,
        tokenId: BigInt(quote.polymarketTokenId),
        collateralUsdcUnits: BigInt(quote.collateralUsdcUnits),
        leverageBps: quote.leverageBps,
        notionalUsdcUnits: BigInt(quote.notionalUsdcUnits),
        originationFeeBps: quote.originationFeeBps,
        lifetimeFeeAprBps: quote.lifetimeFeeAprBps,
        liquidationFeeBps: quote.liquidationFeeBps,
        venueFeeUsdcUnits: BigInt(quote.expectedOpenTradingFeeUsdcUnits),
        marginUsdcUnits: BigInt(quote.marginUsdcUnits),
        signatureExpiry: BigInt(quote.signatureExpiry),
      },
    });

    const recovered = await recoverCreatePositionSigner(
      mockQuote({ contractSignature: signature, riskMode: "adaptive" }),
      userAddress,
    );
    expect(recovered).not.toBe(account.address);
  });
});
