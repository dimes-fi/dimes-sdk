import { encodeFunctionData } from "viem";
import type { Offer } from "../types";
import { vaultAbi } from "./abi";
import { toAddress, toHex, type Address, type Hex } from "./evm";

/**
 * Helpers for opening and closing positions from a Polymarket **deposit wallet** (DW).
 *
 * Deposit wallets cannot use the legacy `approve` + `createPosition` path: the Polymarket
 * relayer blocks `approve` to non-whitelisted spenders. Instead the DW submits an atomic
 * batch through Polymarket's deposit-wallet factory:
 *
 *   1. `vault.reserveDeposit(totalUserAmount)`  — snapshot the vault pUSD balance
 *   2. `pUSD.transfer(vault, totalUserAmount)`   — push the funds directly
 *   3. `vault.createPositionPushFunded(...)`     — verify the balance delta + create
 *
 * Closing follows the same batch mechanics with a single inner call, `requestClose`.
 */

/** Polymarket deposit-wallet factory (the `proxy` entrypoint), Polygon mainnet. */
export const depositWalletFactoryAddress: Address = "0x00000000000Fb5C9ADea0298D729A0CB3823Cc07";

/** Base URL of Polymarket's v2 relayer. */
export const polymarketRelayerBaseUrl = "https://relayer-v2.polymarket.com";

/** A single inner call inside a deposit-wallet batch. */
export interface DepositWalletCall {
  target: Address;
  value: bigint;
  data: Hex;
}

/** The EIP-712 `Batch` struct signed by the deposit-wallet owner. */
export interface DepositWalletBatch {
  wallet: Address;
  nonce: bigint;
  deadline: bigint;
  calls: DepositWalletCall[];
}

/** EIP-712 type definitions for the deposit-wallet `Batch` signature. */
export const depositWalletBatchTypes = {
  Batch: [
    { name: "wallet", type: "address" },
    { name: "nonce", type: "uint256" },
    { name: "deadline", type: "uint256" },
    { name: "calls", type: "Call[]" },
  ],
  Call: [
    { name: "target", type: "address" },
    { name: "value", type: "uint256" },
    { name: "data", type: "bytes" },
  ],
} as const;

const reserveDepositAbi = [
  {
    type: "function",
    name: "reserveDeposit",
    stateMutability: "nonpayable",
    inputs: [{ name: "expectedAmountUsdcUnits", type: "uint256" }],
    outputs: [],
  },
] as const;

const createPositionPushFundedAbi = [
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
] as const;

const erc20TransferAbi = [
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
] as const;

/**
 * Build the three inner calls for a push-funded `createPosition`.
 *
 * The relayer submits these atomically; `offer.totalUserAmountUsdcUnits` is the
 * contract-ready amount (collateral + fees) used for both the reservation and the transfer.
 *
 * @param offer - the signed offer returned by the quote endpoint
 * @param pUsdAddress - the pUSD (USDC) token address (from `GET /contract-info`)
 */
export function buildPushFundedCreateCalls(offer: Offer, pUsdAddress: string): DepositWalletCall[] {
  const vaultAddress = toAddress(offer.polygonVaultContractAddress);
  const totalUserAmountUsdcUnits = BigInt(offer.totalUserAmountUsdcUnits);

  const reserveDepositData = encodeFunctionData({
    abi: reserveDepositAbi,
    functionName: "reserveDeposit",
    args: [totalUserAmountUsdcUnits],
  });

  const transferData = encodeFunctionData({
    abi: erc20TransferAbi,
    functionName: "transfer",
    args: [vaultAddress, totalUserAmountUsdcUnits],
  });

  const createPositionData = encodeFunctionData({
    abi: createPositionPushFundedAbi,
    functionName: "createPositionPushFunded",
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
  });

  return [
    { target: vaultAddress, value: 0n, data: reserveDepositData },
    { target: toAddress(pUsdAddress), value: 0n, data: transferData },
    { target: vaultAddress, value: 0n, data: createPositionData },
  ];
}

/**
 * Build the single inner call for a deposit-wallet `requestClose`.
 *
 * @param vaultAddress - the vault contract address
 * @param positionKey - the `on_chain_position_key` field from `GET /positions`
 */
export function buildRequestCloseCalls(vaultAddress: string, positionKey: string): DepositWalletCall[] {
  const closeData = encodeFunctionData({
    abi: vaultAbi,
    functionName: "requestClose",
    args: [toHex(positionKey)],
  });

  return [{ target: toAddress(vaultAddress), value: 0n, data: closeData }];
}

interface BuildBatchParams {
  depositWalletAddress: string;
  /** Current `nonce()` read from the deposit wallet. */
  nonce: bigint;
  /** Unix-seconds deadline after which the relayer may no longer submit the batch. */
  deadline: bigint;
  calls: DepositWalletCall[];
}

/** Assemble a `DepositWalletBatch` ready for EIP-712 signing. */
export function buildDepositWalletBatch(params: BuildBatchParams): DepositWalletBatch {
  return {
    wallet: toAddress(params.depositWalletAddress),
    nonce: params.nonce,
    deadline: params.deadline,
    calls: params.calls,
  };
}

/** EIP-712 typed-data payload for a deposit-wallet `Batch` signature. */
export interface DepositWalletBatchTypedData {
  domain: { name: string; version: string; chainId: number; verifyingContract: Address };
  types: typeof depositWalletBatchTypes;
  primaryType: "Batch";
  message: DepositWalletBatch;
}

/**
 * Produce the EIP-712 typed-data object for a batch, ready to pass to a signer
 * (viem `signTypedData`, ethers `signTypedData`, etc.). The owner of the deposit
 * wallet must sign this.
 */
export function getDepositWalletBatchTypedData(batch: DepositWalletBatch): DepositWalletBatchTypedData {
  return {
    domain: {
      name: "DepositWallet",
      version: "1",
      chainId: 137,
      verifyingContract: batch.wallet,
    },
    types: depositWalletBatchTypes,
    primaryType: "Batch",
    message: batch,
  };
}

interface RelayerSubmitPayload {
  type: "WALLET";
  from: Address;
  to: Address;
  nonce: string;
  signature: Hex;
  depositWalletParams: {
    depositWallet: Address;
    deadline: string;
    calls: { target: Address; value: string; data: Hex }[];
  };
}

interface BuildRelayerPayloadParams {
  /** The deposit-wallet owner EOA that produced `signature`. */
  ownerAddress: string;
  batch: DepositWalletBatch;
  /** The EIP-712 signature over `getDepositWalletBatchTypedData(batch)`. */
  signature: Hex;
}

/**
 * Build the JSON body for `POST {polymarketRelayerBaseUrl}/submit`.
 *
 * Stringify the result and send it with headers from {@link buildRelayerAuthHeaders}.
 */
export function buildRelayerSubmitPayload(params: BuildRelayerPayloadParams): RelayerSubmitPayload {
  return {
    type: "WALLET",
    from: toAddress(params.ownerAddress),
    to: depositWalletFactoryAddress,
    nonce: params.batch.nonce.toString(),
    signature: params.signature,
    depositWalletParams: {
      depositWallet: params.batch.wallet,
      deadline: params.batch.deadline.toString(),
      calls: params.batch.calls.map((call) => ({
        target: call.target,
        value: call.value.toString(),
        data: call.data,
      })),
    },
  };
}

interface BuildRelayerHeadersParams {
  /** Polymarket builder API key. */
  apiKey: string;
  /** Polymarket builder API secret (base64). */
  apiSecret: string;
  /** Polymarket builder API passphrase. */
  apiPassphrase: string;
  /** The exact request body string sent to `/submit` (the value passed to `fetch`). */
  body: string;
  /** Unix-seconds timestamp; defaults to now. Must match the request time. */
  timestamp?: string;
}

function base64ToBytes(value: string): ArrayBuffer {
  const binary = atob(value);
  const buffer = new ArrayBuffer(binary.length);
  const bytes = new Uint8Array(buffer);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return buffer;
}

function bytesToBase64Url(bytes: ArrayBuffer): string {
  let binary = "";
  const view = new Uint8Array(bytes);
  for (const byte of view) {
    binary += String.fromCharCode(byte);
  }
  return btoa(binary).replaceAll("+", "-").replaceAll("/", "_");
}

/**
 * Compute the HMAC-signed headers for a relayer `/submit` request.
 *
 * The relayer authenticates each call with an HMAC-SHA256 over
 * `timestamp + "POST" + "/submit" + body`, keyed by the base64-decoded API secret,
 * encoded as base64url. Uses the Web Crypto API (works in Node 20+ and browsers).
 */
export async function buildRelayerAuthHeaders(params: BuildRelayerHeadersParams): Promise<Record<string, string>> {
  const msPerSecond = 1000;
  const timestamp = params.timestamp ?? Math.floor(Date.now() / msPerSecond).toString();
  const key = await crypto.subtle.importKey(
    "raw",
    base64ToBytes(params.apiSecret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const encoded = new TextEncoder().encode(`${timestamp}POST/submit${params.body}`);
  const message = new Uint8Array(encoded).buffer;
  const signature = await crypto.subtle.sign("HMAC", key, message);

  return {
    "Content-Type": "application/json",
    POLY_BUILDER_API_KEY: params.apiKey,
    POLY_BUILDER_TIMESTAMP: timestamp,
    POLY_BUILDER_PASSPHRASE: params.apiPassphrase,
    POLY_BUILDER_SIGNATURE: bytesToBase64Url(signature),
  };
}
