import type { Abi } from "viem";
import type { Quote } from "../types";
import { vaultAbi, erc20Abi } from "./abi";
import { toHex, toAddress } from "./evm";
import { isProtocolV2Quote } from "./protocol-version";
import { isCommittedQuote } from "./risk-mode";

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

export interface CreatePositionWithMarginTxData {
  address: `0x${string}`;
  abi: Abi;
  functionName: "createPositionWithMargin";
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
    bigint,
    `0x${string}`,
    bigint,
  ];
}

export interface CreatePositionWithVersionTxData {
  address: `0x${string}`;
  abi: Abi;
  functionName: "createPositionWithVersion";
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
    number,
    `0x${string}`,
    bigint,
  ];
}

export interface CreatePositionWithMarginAndVersionTxData {
  address: `0x${string}`;
  abi: Abi;
  functionName: "createPositionWithMarginAndVersion";
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
    bigint,
    number,
    `0x${string}`,
    bigint,
  ];
}

/**
 * What {@link buildCreatePositionTx} returns: the plain call for an adaptive quote, the
 * margin-bearing call for a committed one, and their `...Version` twins for a Polymarket
 * Protocol V2 quote.
 */
export type OpenPositionTxData =
  | CreatePositionTxData
  | CreatePositionWithMarginTxData
  | CreatePositionWithVersionTxData
  | CreatePositionWithMarginAndVersionTxData;

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

/**
 * Build the vault call that opens the position this quote was signed for.
 *
 * The quote names its own mode in `riskMode`: a committed-mode quote
 * is signed over a different EIP-712 type and opens through `createPositionWithMargin`, which
 * pulls `marginUsdcUnits` on top of collateral and fees. A Polymarket Protocol V2 quote
 * (`polymarketProtocolVersion` 2) is signed over a type that also carries the version and opens
 * through `createPositionWithVersion` / `createPositionWithMarginAndVersion`. Submitting one
 * quote's signature to another entry point always reverts, so the call is read off the quote
 * rather than left to the caller.
 *
 * `quote.totalUserAmountUsdcUnits` already includes the margin — approve that amount.
 */
export function buildCreatePositionTx(quote: Quote): OpenPositionTxData {
  const address = toAddress(quote.polygonVaultContractAddress);

  const commonArgs = [
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
  ] as const;

  if (isProtocolV2Quote(quote)) {
    if (isCommittedQuote(quote)) {
      return {
        address,
        abi: vaultAbi,
        functionName: "createPositionWithMarginAndVersion",
        args: [
          ...commonArgs,
          BigInt(quote.marginUsdcUnits),
          quote.polymarketProtocolVersion,
          toHex(quote.contractSignature),
          BigInt(quote.signatureExpiry),
        ],
      };
    }

    return {
      address,
      abi: vaultAbi,
      functionName: "createPositionWithVersion",
      args: [
        ...commonArgs,
        quote.polymarketProtocolVersion,
        toHex(quote.contractSignature),
        BigInt(quote.signatureExpiry),
      ],
    };
  }

  if (isCommittedQuote(quote)) {
    return {
      address,
      abi: vaultAbi,
      functionName: "createPositionWithMargin",
      args: [
        ...commonArgs,
        BigInt(quote.marginUsdcUnits),
        toHex(quote.contractSignature),
        BigInt(quote.signatureExpiry),
      ],
    };
  }

  return {
    address,
    abi: vaultAbi,
    functionName: "createPosition",
    args: [...commonArgs, toHex(quote.contractSignature), BigInt(quote.signatureExpiry)],
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
