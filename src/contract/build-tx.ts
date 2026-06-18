import type { Abi } from "viem";
import type { Offer } from "../types";
import { vaultAbi, erc20Abi } from "./abi";
import { toHex, toAddress } from "./evm";

export interface CreatePositionTxData {
  address: `0x${string}`;
  abi: Abi;
  functionName: "createPosition";
  args: readonly [
    `0x${string}`,
    `0x${string}`,
    bigint,
    bigint,
    number,
    bigint,
    number,
    number,
    number,
    bigint,
    `0x${string}`,
    bigint,
  ];
}

export interface ApproveTxData {
  address: `0x${string}`;
  abi: typeof erc20Abi;
  functionName: "approve";
  args: readonly [`0x${string}`, bigint];
}

export interface RequestCloseTxData {
  address: `0x${string}`;
  abi: Abi;
  functionName: "requestClose";
  args: readonly [`0x${string}`];
}

export function buildCreatePositionTx(offer: Offer): CreatePositionTxData {
  return {
    address: toAddress(offer.polygonVaultContractAddress),
    abi: vaultAbi,
    functionName: "createPosition",
    args: [
      toHex(offer.positionSeedHex),
      toHex(offer.polymarketMarketId),
      BigInt(offer.polymarketTokenId),
      BigInt(offer.collateralUsdcUnits),
      offer.leverageBps,
      BigInt(offer.notionalUsdcUnits),
      offer.originationFeeBps,
      offer.lifetimeFeeAprBps,
      offer.liquidationFeeBps,
      BigInt(offer.expectedOpenTradingFeeUsdcUnits),
      toHex(offer.contractSignature),
      BigInt(offer.signatureExpiry),
    ],
  };
}

export function buildApproveTx(usdcAddress: `0x${string}`, spender: `0x${string}`, amount: bigint): ApproveTxData {
  return {
    address: usdcAddress,
    abi: erc20Abi,
    functionName: "approve",
    args: [spender, amount],
  };
}

export function buildRequestCloseTx(vaultAddress: `0x${string}`, positionKey: `0x${string}`): RequestCloseTxData {
  return {
    address: vaultAddress,
    abi: vaultAbi,
    functionName: "requestClose",
    args: [positionKey],
  };
}
