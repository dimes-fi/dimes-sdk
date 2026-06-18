import { recoverTypedDataAddress, getAddress } from "viem";
import type { DimesClient } from "../client/dimes-client";
import { DimesContractError } from "../errors/dimes-error";
import type { ContractInfo, Offer } from "../types";
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

export async function recoverCreatePositionSigner(offer: Offer, userAddress: `0x${string}`): Promise<`0x${string}`> {
  return recoverTypedDataAddress({
    domain: {
      name: "LeveragedPredictionVaultV1",
      version: "1",
      chainId: Number(offer.evmChainId),
      verifyingContract: toAddress(offer.polygonVaultContractAddress),
    },
    types: createPositionTypes,
    primaryType: "CreatePosition",
    message: {
      positionSeed: toHex(offer.positionSeedHex),
      user: userAddress,
      marketId: toHex(offer.polymarketMarketId),
      tokenId: BigInt(offer.polymarketTokenId),
      collateralUsdcUnits: BigInt(offer.collateralUsdcUnits),
      leverageBps: offer.leverageBps,
      notionalUsdcUnits: BigInt(offer.notionalUsdcUnits),
      originationFeeBps: offer.originationFeeBps,
      lifetimeFeeAprBps: offer.lifetimeFeeAprBps,
      liquidationFeeBps: offer.liquidationFeeBps,
      venueFeeUsdcUnits: BigInt(offer.expectedOpenTradingFeeUsdcUnits),
      signatureExpiry: BigInt(offer.signatureExpiry),
    },
    signature: toHex(offer.contractSignature),
  });
}

export function resolveExpectedSigner(apiSigner: string | undefined): `0x${string}` | undefined {
  return apiSigner ? getAddress(apiSigner) : undefined;
}

const contractInfoCache = new WeakMap<DimesClient, ContractInfo>();

export async function verifyOfferSignature(
  client: DimesClient,
  offer: Offer,
  userAddress: `0x${string}`,
): Promise<void> {
  let info = contractInfoCache.get(client);
  if (!info) {
    info = await client.getContractInfo();
    contractInfoCache.set(client, info);
  }

  const recoveredSigner = await recoverCreatePositionSigner(offer, userAddress);
  const expectedSigner = getAddress(info.polygonSignerAddress);

  if (recoveredSigner !== expectedSigner) {
    throw new DimesContractError(
      "invalid_signer",
      `Recovered signer ${recoveredSigner} does not match expected authority ${expectedSigner}`,
    );
  }
}
