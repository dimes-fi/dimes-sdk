const pipsPerUsd = 10_000;
const bpsPerUnit = 10_000;
const bpsPerPct = 100;
const minFillBpsMax = 5_000;
const centsFactor = 100;
const decimalPlaces = 2;

export const marketMovedCodes = new Set([
  "quote_slippage_too_high",
  "quote_insufficient_liquidity",
  "quote_entry_price_out_of_range",
  "quote_entry_bid_depth_too_low",
  "quote_entry_depth_too_low",
  "quote_entry_spread_too_wide",
]);

export type QuoteHint =
  | { kind: "use-max-collateral"; maxCollateralUsd: number; minCollateralUsd: number }
  | { kind: "raise-collateral"; minCollateralUsd: number }
  | { kind: "clamp-leverage"; maxLeverageBps?: number }
  | { kind: "raise-leverage"; minLeverageBps: number }
  | { kind: "raise-slippage"; currentSlippageBps: number; maxSlippageBps: number }
  | { kind: "raise-min-fill"; minFillBps: number }
  | { kind: "market-full" }
  | { kind: "insufficient-liquidity"; maxCollateralUsd: number; minCollateralUsd: number }
  | null;

type Params = Record<string, unknown> | null | undefined;

function num(params: Params, key: string): number | null {
  if (!params) {
    return null;
  }
  const raw = params[key];
  if (raw === null || raw === undefined) {
    return null;
  }
  // eslint-disable-next-line no-restricted-syntax
  const n = typeof raw === "string" ? Number(raw) : typeof raw === "number" ? raw : NaN;
  return Number.isFinite(n) ? n : null;
}

function pipsToUsd(pips: number): number {
  return pips / pipsPerUsd;
}

function notionalPipsToCollateralUsd(notionalPips: number, leverageBps: number): number | null {
  if (!Number.isFinite(leverageBps) || leverageBps <= 0) {
    return null;
  }
  return (notionalPips * bpsPerUnit) / leverageBps / pipsPerUsd;
}

function buildExhaustedHint(
  exhaustedKind: "market-full" | "insufficient-liquidity",
  maxCollateralUsd: number,
  minCollateralUsd: number,
): QuoteHint {
  if (exhaustedKind === "insufficient-liquidity") {
    return { kind: "insufficient-liquidity", maxCollateralUsd, minCollateralUsd };
  }
  return { kind: "market-full" };
}

function resolveMaxCollateralHint(
  params: Params,
  context: { leverageBps: number },
  capacityKey: string,
  exhaustedKind: "market-full" | "insufficient-liquidity",
): QuoteHint {
  const serverMaxCollateralPips = num(params, "maxSupportedCollateralUsdPips");
  const capacityPips = num(params, capacityKey);
  const minNotionalPips = num(params, "minNotionalUsdPips");

  const fromServer = serverMaxCollateralPips !== null ? pipsToUsd(serverMaxCollateralPips) : null;
  const fromCapacity = capacityPips !== null ? notionalPipsToCollateralUsd(capacityPips, context.leverageBps) : null;
  const maxCollateralUsd =
    fromServer !== null && fromCapacity !== null ? Math.min(fromServer, fromCapacity) : (fromServer ?? fromCapacity);

  const minCollateralUsd =
    minNotionalPips !== null ? notionalPipsToCollateralUsd(minNotionalPips, context.leverageBps) : null;

  if (maxCollateralUsd === null || minCollateralUsd === null) {
    return null;
  }
  if (maxCollateralUsd < minCollateralUsd) {
    return buildExhaustedHint(exhaustedKind, maxCollateralUsd, minCollateralUsd);
  }
  return { kind: "use-max-collateral", maxCollateralUsd, minCollateralUsd };
}

// eslint-disable-next-line complexity
export function quoteErrorHint(code: string | null, params: Params, context: { leverageBps: number }): QuoteHint {
  if (!code) {
    return null;
  }

  switch (code) {
    case "quote_side_capacity_exceeded":
    case "quote_user_position_limit_exceeded":
    case "quote_market_position_limit_exceeded":
    case "quote_side_position_limit_exceeded":
    case "quote_global_position_limit_exceeded":
    case "quote_partner_position_limit_exceeded":
      return resolveMaxCollateralHint(params, context, "availableCapacityUsdPips", "market-full");

    case "quote_insufficient_liquidity":
      return resolveMaxCollateralHint(params, context, "slippageMaxUsdPips", "market-full");

    case "notional_selector_insufficient_liquidity":
      return resolveMaxCollateralHint(params, context, "slippageMaxUsdPips", "insufficient-liquidity");

    case "quote_leverage_exceeds_collateral_floor": {
      const minCollateralPips = num(params, "minCollateralUsdPips");
      if (minCollateralPips === null) {
        return null;
      }
      return { kind: "raise-collateral", minCollateralUsd: pipsToUsd(minCollateralPips) };
    }

    case "quote_leverage_exceeds_maximum":
    case "quote_leverage_exceeds_model_max": {
      const maxLeverageBps = num(params, "maxLeverageBps");
      if (maxLeverageBps === null) {
        return null;
      }
      return { kind: "clamp-leverage", maxLeverageBps };
    }

    case "quote_leverage_too_high_for_price": {
      const maxLeverageBps = num(params, "maxAcceptableLeverageBps");
      if (maxLeverageBps === null) {
        return null;
      }
      return { kind: "clamp-leverage", maxLeverageBps };
    }

    case "quote_leverage_below_minimum": {
      const minLeverageBps = num(params, "minLeverageBps");
      if (minLeverageBps === null) {
        return null;
      }
      return { kind: "raise-leverage", minLeverageBps };
    }

    case "quote_min_fill_bps_below_floor": {
      const floorMinFillBps = num(params, "floorMinFillBps");
      if (floorMinFillBps === null || floorMinFillBps > minFillBpsMax) {
        return null;
      }
      return { kind: "raise-min-fill", minFillBps: floorMinFillBps };
    }

    case "quote_slippage_too_high": {
      const currentSlippageBps = num(params, "currentSlippageBps");
      const maxSlippageBps = num(params, "maxSlippageBps");
      if (currentSlippageBps === null || maxSlippageBps === null) {
        return null;
      }
      return { kind: "raise-slippage", currentSlippageBps, maxSlippageBps };
    }

    default:
      return null;
  }
}

export type CorrectedField = "collateral" | "leverage" | "slippage" | "minFill";

export type HintAdjustment =
  | {
      field: "collateral";
      fromValue: number;
      toValue: number;
      toLabel: string;
      reason: "max-collateral" | "min-collateral";
    }
  | {
      field: "leverage";
      fromValue: number;
      toValue: number;
      toLabel: string;
      reason: "clamp-max" | "raise-min";
    }
  | {
      field: "slippage";
      fromValue: number;
      toValue: number;
      toLabel: string;
      reason: "raise-slippage";
    }
  | {
      field: "minFill";
      fromValue: number;
      toValue: number;
      toLabel: string;
      reason: "raise-min-fill";
    }
  | null;

function formatUsd(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

function bpsToMultiplier(bps: number): string {
  return `${(bps / bpsPerUnit).toFixed(1).replace(/\.0$/, "")}x`;
}

// eslint-disable-next-line complexity
export function hintAdjustment(
  hint: QuoteHint,
  current: { collateralUsd: number; leverageBps: number; slippageBps: number; minFillBps?: number },
): HintAdjustment {
  if (!hint) {
    return null;
  }

  switch (hint.kind) {
    case "use-max-collateral": {
      const to = Math.max(0, Math.floor(hint.maxCollateralUsd * centsFactor) / centsFactor);
      if (to <= 0) {
        return null;
      }
      return {
        field: "collateral",
        fromValue: current.collateralUsd,
        toValue: to,
        toLabel: formatUsd(to),
        reason: "max-collateral",
      };
    }
    case "raise-collateral": {
      const to = Math.ceil(hint.minCollateralUsd * centsFactor) / centsFactor;
      if (to <= 0) {
        return null;
      }
      return {
        field: "collateral",
        fromValue: current.collateralUsd,
        toValue: to,
        toLabel: formatUsd(to),
        reason: "min-collateral",
      };
    }
    case "clamp-leverage": {
      if (hint.maxLeverageBps === undefined) {
        return null;
      }
      return {
        field: "leverage",
        fromValue: current.leverageBps,
        toValue: hint.maxLeverageBps,
        toLabel: bpsToMultiplier(hint.maxLeverageBps),
        reason: "clamp-max",
      };
    }
    case "raise-leverage":
      return {
        field: "leverage",
        fromValue: current.leverageBps,
        toValue: hint.minLeverageBps,
        toLabel: bpsToMultiplier(hint.minLeverageBps),
        reason: "raise-min",
      };
    case "raise-slippage":
      return {
        field: "slippage",
        fromValue: hint.currentSlippageBps,
        toValue: hint.maxSlippageBps,
        toLabel: `${(hint.maxSlippageBps / bpsPerPct).toFixed(decimalPlaces).replace(/\.?0+$/, "")}%`,
        reason: "raise-slippage",
      };
    case "raise-min-fill":
      return {
        field: "minFill",
        fromValue: current.minFillBps ?? 0,
        toValue: hint.minFillBps,
        toLabel: `${(hint.minFillBps / bpsPerPct).toFixed(decimalPlaces).replace(/\.?0+$/, "")}%`,
        reason: "raise-min-fill",
      };
    default:
      return null;
  }
}
