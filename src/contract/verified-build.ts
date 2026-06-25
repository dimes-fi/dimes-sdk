import type { DimesClient } from "../client/dimes-client";
import type { Quote } from "../types";
import { buildCreatePositionTx, type CreatePositionTxData } from "./build-tx";
import { buildPushFundedCreateCalls, type DepositWalletCall } from "./deposit-wallet";
import { getCachedContractInfo, verifyQuoteSignature } from "./verify-signature";

/**
 * Verify a quote's signature against the on-chain authority (using the client's
 * cached `/contract-info`) and then build the `createPosition` transaction.
 *
 * Prefer this over the raw {@link buildCreatePositionTx} so a tampered or stale
 * quote fails fast in the client instead of reverting on-chain. Throws
 * `DimesContractError("invalid_signer")` if the signature does not verify.
 *
 * @param userAddress - the wallet that will submit the tx (the signed `user`,
 *   bound to `msg.sender` by the contract).
 */
export async function buildVerifiedCreatePositionTx(
  client: DimesClient,
  quote: Quote,
  userAddress: `0x${string}`,
): Promise<CreatePositionTxData> {
  await verifyQuoteSignature(client, quote, userAddress);
  return buildCreatePositionTx(quote);
}

/**
 * Verify a quote's signature (see {@link buildVerifiedCreatePositionTx}) and then
 * build the push-funded deposit-wallet calls. Prefer this over the raw
 * {@link buildPushFundedCreateCalls}: it resolves the correct pUSD token address from
 * the client's cached `GET /contract-info`, so the transfer can never target the wrong
 * stablecoin (e.g. USDC.e instead of pUSD).
 *
 * @param userAddress - the deposit wallet that will be `msg.sender` on-chain.
 * @param pUsdAddress - optional override for the pUSD (USDC) token address. Omit it to
 *   use the canonical address from `GET /contract-info`; only pass it to force a
 *   specific token.
 */
export async function buildVerifiedPushFundedCreateCalls(
  client: DimesClient,
  quote: Quote,
  userAddress: `0x${string}`,
  pUsdAddress?: string,
): Promise<DepositWalletCall[]> {
  await verifyQuoteSignature(client, quote, userAddress);

  const resolvedPusdAddress = pUsdAddress ?? (await getCachedContractInfo(client)).polygonUsdcTokenAddress;

  return buildPushFundedCreateCalls(quote, resolvedPusdAddress);
}
