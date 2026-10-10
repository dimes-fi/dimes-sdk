import type { Quote } from "../types";

/**
 * The Polymarket share ledgers a quote can be issued on, numbered as the vault numbers them:
 * `1` is the Conditional Tokens contract (CTF), `2` is Polymarket Protocol V2 (PositionManager).
 */
export const polymarketProtocolVersions = {
  ctf: 1,
  positionManager: 2,
} as const;

/**
 * Whether this quote is for a Polymarket Protocol V2 market.
 *
 * A version 2 quote is signed over a separate EIP-712 type carrying `protocolVersion`, and opens
 * through the `...WithVersion` / `...WithMarginAndVersion` entry points; the create functions without
 * a version reject it. A quote from an API that predates the field reads as version 1.
 */
export function isProtocolV2Quote(quote: Quote): boolean {
  return quote.polymarketProtocolVersion === polymarketProtocolVersions.positionManager;
}
