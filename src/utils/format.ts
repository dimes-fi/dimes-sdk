import { asNumber, asBigInt } from "./parse";

const BPS_PER_UNIT = 10_000;
const BPS_PER_PCT = 100;
const FRACTION_TO_PCT = 100;
const PIPS_PER_USD = 1_000_000n;
const ROUNDING_OFFSET = 5_000n;
const CENTS_DIVISOR = 10_000n;
const CENTS_PAD = 2;

export function formatLeverage(value: unknown): string | null {
  const n = asNumber(value);
  if (n === null) {
    return null;
  }
  return `${(n / BPS_PER_UNIT).toLocaleString(undefined, { maximumFractionDigits: 2 })}x`;
}

export function formatBpsPct(value: unknown): string | null {
  const n = asNumber(value);
  if (n === null) {
    return null;
  }
  return `${(n / BPS_PER_PCT).toLocaleString(undefined, { maximumFractionDigits: 2 })}%`;
}

export function formatFractionPct(value: unknown): string | null {
  const n = asNumber(value);
  if (n === null) {
    return null;
  }
  return `${(n * FRACTION_TO_PCT).toLocaleString(undefined, { maximumFractionDigits: 1 })}%`;
}

export function formatPipsUsd(value: unknown): string | null {
  const big = asBigInt(value);
  if (big === null) {
    return null;
  }
  const negative = big < 0n;
  const absUnits = negative ? -big : big;
  const whole = absUnits / PIPS_PER_USD;
  const frac = absUnits % PIPS_PER_USD;
  const cents = (frac + ROUNDING_OFFSET) / CENTS_DIVISOR;
  const formatted = `$${whole.toLocaleString()}.${cents.toString().padStart(CENTS_PAD, "0")}`;
  return negative ? `-${formatted}` : formatted;
}
