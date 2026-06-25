import type { Abi } from "viem";
import type { Quote } from "../types";
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

export interface RequestPartialCloseTxData {
  address: `0x${string}`;
  abi: Abi;
  functionName: "requestPartialClose";
  args: readonly [`0x${string}`, bigint];
}

export function buildCreatePositionTx(quote: Quote): CreatePositionTxData {
  return {
    address: toAddress(quote.polygonVaultContractAddress),
    abi: vaultAbi,
    functionName: "createPosition",
    args: [
      toHex(quote.positionSeedHex),
      toHex(quote.polymarketMarketId),
      BigInt(quote.polymarketTokenId),
      BigInt(quote.collateralUsdcUnits),
      quote.leverageBps,
      BigInt(quote.notionalUsdcUnits),
      quote.originationFeeBps,
      quote.lifetimeFeeAprBps,
      quote.liquidationFeeBps,
      BigInt(quote.expectedOpenTradingFeeUsdcUnits),
      toHex(quote.contractSignature),
      BigInt(quote.signatureExpiry),
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

export function buildRequestPartialCloseTx(
  vaultAddress: `0x${string}`,
  positionKey: `0x${string}`,
  closeTokenUnits: bigint,
): RequestPartialCloseTxData {
  return {
    address: vaultAddress,
    abi: vaultAbi,
    functionName: "requestPartialClose",
    args: [positionKey, closeTokenUnits],
  };
}
