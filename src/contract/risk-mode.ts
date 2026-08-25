import type { Quote } from "../types";

/**
 * Whether this quote opens in committed mode — a fixed ladder of price-triggered unwinds,
 * backed by extra margin locked in the vault.
 *
 * Read from `riskMode`, the quote's own statement of the mode it was issued in, so a quote
 * issued before committed mode existed reads as adaptive. Asking for committed mode does not
 * guarantee getting it: when the market, price or leverage rules it out the request is rejected
 * with `quote_committed_risk_mode_unavailable`, and a partner without the beta feature enabled
 * is rejected with `beta_feature_not_enabled`.
 */
export function isCommittedQuote(quote: Quote): boolean {
  return quote.riskMode === "committed";
}
