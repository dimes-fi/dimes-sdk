import { getAddress } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { describe, expect, it } from "vitest";
import type { DimesClient } from "../src/client/dimes-client";
import { buildCreatePositionTx } from "../src/contract/build-tx";
import { buildPushFundedCreateCalls } from "../src/contract/deposit-wallet";
import { toAddress, toHex } from "../src/contract/evm";
import { buildVerifiedCreatePositionTx, buildVerifiedPushFundedCreateCalls } from "../src/contract/verified-build";
import type { Quote } from "../src/types";

const vaultAddress = getAddress("0x5323fe5a5cd7eccc0ef96761c313e6fab4c324cd");
const pUsdAddress = getAddress("0xc011a7e12a19f7b1f670d46f03b03f3342e82dfb");
const userAddress = getAddress("0x89fa517528ad7aa188fcb7cee43a7c5b642a8327");
const signer = privateKeyToAccount("0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d");

const createPositionTypes = {
  CreatePosition: [
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
    { name: "signatureExpiry", type: "uint256" },
  ],
} as const;

function baseQuote(overrides: Partial<Quote> = {}): Quote {
  return {
    evmChainId: 137,
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
    contractSignature: "0x00",
    signatureExpiry: "1700000000",
    totalUserAmountUsdcUnits: "2030000",
    ...overrides,
  } as Quote;
}

async function signedQuote(overrides: Partial<Quote> = {}): Promise<Quote> {
  const q = baseQuote(overrides);
  const signature = await signer.signTypedData({
    domain: {
      name: "LeveragedPredictionVaultV1",
      version: "1",
      chainId: Number(q.evmChainId),
      verifyingContract: toAddress(q.polygonVaultContractAddress),
    },
    types: createPositionTypes,
    primaryType: "CreatePosition",
    message: {
      positionSeed: toHex(q.positionSeedHex),
      user: userAddress,
      marketId: toHex(q.polymarketMarketId),
      tokenId: BigInt(q.polymarketTokenId),
      collateralUsdcUnits: BigInt(q.collateralUsdcUnits),
      leverageBps: q.leverageBps,
      notionalUsdcUnits: BigInt(q.notionalUsdcUnits),
      originationFeeBps: q.originationFeeBps,
      lifetimeFeeAprBps: q.lifetimeFeeAprBps,
      liquidationFeeBps: q.liquidationFeeBps,
      venueFeeUsdcUnits: BigInt(q.expectedOpenTradingFeeUsdcUnits),
      signatureExpiry: BigInt(q.signatureExpiry),
    },
  });
  return baseQuote({ ...overrides, contractSignature: signature });
}

function clientWithSigner(address: string): DimesClient {
  return {
    getContractInfo: () => Promise.resolve({ polygonSignerAddress: address, polygonUsdcTokenAddress: pUsdAddress }),
  } as unknown as DimesClient;
}

describe("buildVerifiedCreatePositionTx", () => {
  it("returns the built tx when the signature verifies against the contract authority", async () => {
    const quote = await signedQuote();
    const tx = await buildVerifiedCreatePositionTx(clientWithSigner(signer.address), quote, userAddress);
    expect(tx).toStrictEqual(buildCreatePositionTx(quote));
  });

  it("throws invalid_signer when the recovered signer is not the contract authority", async () => {
    const quote = await signedQuote();
    const wrongAuthority = "0x000000000000000000000000000000000000dead";
    await expect(buildVerifiedCreatePositionTx(clientWithSigner(wrongAuthority), quote, userAddress)).rejects.toThrow(
      /invalid_signer|does not match/i,
    );
  });
});

describe("buildVerifiedPushFundedCreateCalls", () => {
  it("returns the push-funded calls when the signature verifies", async () => {
    const quote = await signedQuote();
    const client = clientWithSigner(signer.address);
    const calls = await buildVerifiedPushFundedCreateCalls(client, quote, userAddress, pUsdAddress);
    expect(calls).toStrictEqual(buildPushFundedCreateCalls(quote, pUsdAddress));
  });

  it("resolves the pUSD address from contract-info when none is passed", async () => {
    const quote = await signedQuote();
    const client = clientWithSigner(signer.address);
    const calls = await buildVerifiedPushFundedCreateCalls(client, quote, userAddress);
    expect(calls).toStrictEqual(buildPushFundedCreateCalls(quote, pUsdAddress));
  });

  it("throws when the signature does not verify", async () => {
    const quote = await signedQuote();
    await expect(
      buildVerifiedPushFundedCreateCalls(clientWithSigner(userAddress), quote, userAddress, pUsdAddress),
    ).rejects.toThrow();
  });
});
