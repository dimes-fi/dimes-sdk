import { decodeFunctionData, encodeFunctionData, getAddress } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { describe, expect, it } from "vitest";
import { vaultAbi } from "../src/contract/abi";
import { buildCreatePositionTx } from "../src/contract/build-tx";
import { buildPushFundedCreateCalls } from "../src/contract/deposit-wallet";
import { isProtocolV2Quote } from "../src/contract/protocol-version";
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
    polymarketMarketId: "0x1111111111111111111111111111111111111111111111111111111111111100",
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
    polymarketProtocolVersion: 2,
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

const baseFields = [
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
] as const;

const withVersionTypes = {
  CreatePositionWithVersion: [
    ...baseFields,
    { name: "protocolVersion", type: "uint8" },
    { name: "signatureExpiry", type: "uint256" },
  ],
} as const;

const withMarginAndVersionTypes = {
  CreatePositionWithMarginAndVersion: [
    ...baseFields,
    { name: "marginUsdcUnits", type: "uint256" },
    { name: "protocolVersion", type: "uint8" },
    { name: "signatureExpiry", type: "uint256" },
  ],
} as const;

function baseMessage(quote: Quote) {
  return {
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
  };
}

const pushFundedVersionedAbi = [
  {
    type: "function",
    name: "createPositionPushFundedWithVersion",
    stateMutability: "nonpayable",
    inputs: [
      ...baseFields.filter((field) => field.name !== "user"),
      { name: "protocolVersion", type: "uint8" },
      { name: "signature", type: "bytes" },
      { name: "signatureExpiry", type: "uint256" },
    ],
    outputs: [],
  },
  {
    type: "function",
    name: "createPositionPushFundedWithMarginAndVersion",
    stateMutability: "nonpayable",
    inputs: [
      ...baseFields.filter((field) => field.name !== "user"),
      { name: "marginUsdcUnits", type: "uint256" },
      { name: "protocolVersion", type: "uint8" },
      { name: "signature", type: "bytes" },
      { name: "signatureExpiry", type: "uint256" },
    ],
    outputs: [],
  },
] as const;

describe("isProtocolV2Quote", () => {
  it("reads version 2 as a Protocol V2 quote", () => {
    expect(isProtocolV2Quote(mockQuote())).toBe(true);
  });

  it("reads version 1 as a CTF quote", () => {
    expect(isProtocolV2Quote(mockQuote({ polymarketProtocolVersion: 1 }))).toBe(false);
  });

  it("reads a quote from an API that predates the field as a CTF quote", () => {
    const legacy = mockQuote();
    delete (legacy as Partial<Quote>).polymarketProtocolVersion;
    expect(isProtocolV2Quote(legacy)).toBe(false);
  });
});

describe("buildCreatePositionTx for a Protocol V2 quote", () => {
  it("builds createPositionWithVersion for an adaptive quote, with the version before the signature", () => {
    const tx = buildCreatePositionTx(mockQuote());
    expect(tx.functionName).toBe("createPositionWithVersion");
    expect(tx.args).toHaveLength(13);
    expect(tx.args[10]).toBe(2);
    expect(tx.args[11]).toBe("0xabcdef");
    expect(tx.args[12]).toBe(1700000000n);
  });

  it("builds createPositionWithMarginAndVersion for a committed quote, with margin then version", () => {
    const tx = buildCreatePositionTx(committedQuote());
    expect(tx.functionName).toBe("createPositionWithMarginAndVersion");
    expect(tx.args).toHaveLength(14);
    expect(tx.args[10]).toBe(670000n);
    expect(tx.args[11]).toBe(2);
    expect(tx.args[12]).toBe("0xabcdef");
    expect(tx.args[13]).toBe(1700000000n);
  });

  it("encodes both versioned calls against the bundled vault ABI", () => {
    const adaptive = buildCreatePositionTx(mockQuote());
    const committed = buildCreatePositionTx(committedQuote());
    expect(encodeFunctionData({ abi: vaultAbi, functionName: adaptive.functionName, args: adaptive.args })).toMatch(
      /^0x/,
    );
    expect(encodeFunctionData({ abi: vaultAbi, functionName: committed.functionName, args: committed.args })).toMatch(
      /^0x/,
    );
  });

  it("keeps the unversioned calls for a version 1 quote", () => {
    expect(buildCreatePositionTx(mockQuote({ polymarketProtocolVersion: 1 })).functionName).toBe("createPosition");
    expect(buildCreatePositionTx(committedQuote({ polymarketProtocolVersion: 1 })).functionName).toBe(
      "createPositionWithMargin",
    );
  });
});

describe("buildPushFundedCreateCalls for a Protocol V2 quote", () => {
  it("uses createPositionPushFundedWithVersion for an adaptive quote", () => {
    const calls = buildPushFundedCreateCalls(mockQuote(), pUsdAddress);
    const created = decodeFunctionData({ abi: pushFundedVersionedAbi, data: calls[2].data });

    expect(calls[2].data.slice(0, 10)).toBe("0xe5fe1bc6");
    expect(created.functionName).toBe("createPositionPushFundedWithVersion");
    expect(created.args[10]).toBe(2);
  });

  it("uses createPositionPushFundedWithMarginAndVersion and pushes the margin-inclusive total", () => {
    const calls = buildPushFundedCreateCalls(committedQuote(), pUsdAddress);
    const created = decodeFunctionData({ abi: pushFundedVersionedAbi, data: calls[2].data });
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

    expect(calls[2].data.slice(0, 10)).toBe("0xa1b3f5ba");
    expect(created.functionName).toBe("createPositionPushFundedWithMarginAndVersion");
    expect(created.args[10]).toBe(670000n);
    expect(created.args[11]).toBe(2);
    expect(reserve.args).toEqual([2700000n]);
  });
});

describe("recoverCreatePositionSigner for a Protocol V2 quote", () => {
  it("recovers an adaptive quote against the with-version type", async () => {
    const account = privateKeyToAccount(signerKey);
    const quote = mockQuote();
    const signature = await account.signTypedData({
      domain,
      types: withVersionTypes,
      primaryType: "CreatePositionWithVersion",
      message: { ...baseMessage(quote), protocolVersion: 2, signatureExpiry: BigInt(quote.signatureExpiry) },
    });

    const recovered = await recoverCreatePositionSigner(mockQuote({ contractSignature: signature }), userAddress);
    expect(recovered).toBe(account.address);
  });

  it("recovers a committed quote against the with-margin-and-version type", async () => {
    const account = privateKeyToAccount(signerKey);
    const quote = committedQuote();
    const signature = await account.signTypedData({
      domain,
      types: withMarginAndVersionTypes,
      primaryType: "CreatePositionWithMarginAndVersion",
      message: {
        ...baseMessage(quote),
        marginUsdcUnits: BigInt(quote.marginUsdcUnits),
        protocolVersion: 2,
        signatureExpiry: BigInt(quote.signatureExpiry),
      },
    });

    const recovered = await recoverCreatePositionSigner(committedQuote({ contractSignature: signature }), userAddress);
    expect(recovered).toBe(account.address);
  });

  it("does not recover the signer when a version 2 signature is read as a version 1 quote", async () => {
    const account = privateKeyToAccount(signerKey);
    const quote = mockQuote();
    const signature = await account.signTypedData({
      domain,
      types: withVersionTypes,
      primaryType: "CreatePositionWithVersion",
      message: { ...baseMessage(quote), protocolVersion: 2, signatureExpiry: BigInt(quote.signatureExpiry) },
    });

    const recovered = await recoverCreatePositionSigner(
      mockQuote({ contractSignature: signature, polymarketProtocolVersion: 1 }),
      userAddress,
    );
    expect(recovered).not.toBe(account.address);
  });
});
