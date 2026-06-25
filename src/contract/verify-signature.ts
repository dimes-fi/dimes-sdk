import { recoverTypedDataAddress, getAddress } from "viem";
import type { DimesClient } from "../client/dimes-client";
import { DimesContractError } from "../errors/dimes-error";
import type { ContractInfo, Quote } from "../types";
import { toHex, toAddress } from "./evm";

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

export async function recoverCreatePositionSigner(quote: Quote, userAddress: `0x${string}`): Promise<`0x${string}`> {
  return recoverTypedDataAddress({
    domain: {
      name: "LeveragedPredictionVaultV1",
      version: "1",
      chainId: Number(quote.evmChainId),
      verifyingContract: toAddress(quote.polygonVaultContractAddress),
    },
    types: createPositionTypes,
    primaryType: "CreatePosition",
    message: {
      positionSeed: toHex(quote.positionSeedHex),
      user: userAddress,
      marketId: toHex(quote.polymarketMarketId),
      tokenId: BigInt(quote.polymarketTokenId),
      collateralUsdcUnits: BigInt(quote.collateralUsdcUnits),
      leverageBps: quote.leverageBps,
      notionalUsdcUnits: BigInt(quote.notionalUsdcUnits),
      originationFeeBps: quote.originationFeeBps,
      lifetimeFeeAprBps: quote.lifetimeFeeAprBps,
      liquidationFeeBps: quote.liquidationFeeBps,
      venueFeeUsdcUnits: BigInt(quote.expectedOpenTradingFeeUsdcUnits),
      signatureExpiry: BigInt(quote.signatureExpiry),
    },
    signature: toHex(quote.contractSignature),
  });
}

export function resolveExpectedSigner(apiSigner: string | undefined): `0x${string}` | undefined {
  return apiSigner ? getAddress(apiSigner) : undefined;
}

/**
 * Recover the quote's contract signer and assert it matches `expectedSigner`,
 * throwing `DimesContractError("invalid_signer")` on mismatch.
 *
 * Use this when you already hold the authorized signer address (e.g. from a cached
 * `GET /contract-info` query) and don't want to plumb a {@link DimesClient} through.
 * {@link verifyQuoteSignature} is the client-based convenience that fetches and caches
 * the signer for you, then delegates here.
 */
export async function assertQuoteSigner(
  quote: Quote,
  userAddress: `0x${string}`,
  expectedSigner: `0x${string}`,
): Promise<void> {
  const recoveredSigner = await recoverCreatePositionSigner(quote, userAddress);
  const expected = getAddress(expectedSigner);

  if (recoveredSigner !== expected) {
    throw new DimesContractError(
      "invalid_signer",
      `Recovered signer ${recoveredSigner} does not match expected authority ${expected}`,
    );
  }
}

const contractInfoCache = new WeakMap<DimesClient, ContractInfo>();

/**
 * Fetch `GET /contract-info` once per {@link DimesClient} and cache it. Use this to read
 * any on-chain config (signer, vault, pUSD token address) without re-hitting the API.
 */
export async function getCachedContractInfo(client: DimesClient): Promise<ContractInfo> {
  let info = contractInfoCache.get(client);
  if (!info) {
    info = await client.getContractInfo();
    contractInfoCache.set(client, info);
  }

  return info;
}

export async function verifyQuoteSignature(
  client: DimesClient,
  quote: Quote,
  userAddress: `0x${string}`,
): Promise<void> {
  const info = await getCachedContractInfo(client);

  await assertQuoteSigner(quote, userAddress, getAddress(info.polygonSignerAddress));
}

/** @deprecated Renamed to {@link verifyQuoteSignature}. Kept as an alias for backward compatibility. */
// eslint-disable-next-line no-restricted-syntax -- intentional deprecated alias
export const verifyOfferSignature = verifyQuoteSignature;
