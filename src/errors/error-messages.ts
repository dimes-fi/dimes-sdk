import { formatLeverage, formatBpsPct, formatFractionPct, formatPipsUsd } from "../utils/format";
import { type Params, getParam } from "../utils/parse";

type FriendlyEntry = string | ((params: Params) => string);

const minFillBpsMaxForMessage = 7_000;

const friendlyByCode: Record<string, FriendlyEntry> = {
  invalid_evm_address: "Invalid EVM address.",
  invalid_solana_address: "Invalid Solana address.",
  invalid_string_for_chain_address: "Invalid wallet address for the selected chain.",
  invalid_wallet_address: "Invalid wallet address.",
  customer_auth_invalid_wallet_address: "Invalid wallet address.",

  unauthorized: "Session expired. Please reconnect your wallet.",
  forbidden: "You do not have access to this resource.",

  beta_feature_not_enabled:
    "This is a beta feature and it is not enabled for your account. Contact us to have it enabled.",

  array_out_of_bounds: "Internal indexing error. Please try again.",
  batch_compute_not_available: "Cached pricing is temporarily unavailable. Try again shortly.",
  internal_server_error: "Something went wrong on our side. Please try again.",
  unexpected_error: "Something went wrong. Please try again.",
  provider_not_available: "Upstream provider is unavailable. Try again shortly.",
  request_already_in_progress: "A previous request is still in flight. Wait for it to complete and try again.",
  math_error: "A numeric calculation failed. Please try again.",
  invalid_number: "Invalid numeric value in request.",
  invalid_message: "Received an invalid upstream message.",
  invalid_filter_combination: "That combination of filters is not supported.",

  cancel_position_delay_not_elapsed: "Cancel delay has not elapsed yet. Try again shortly.",
  cancel_position_transaction_failed: "Cancel transaction failed on-chain.",
  cancel_position_not_found: "Position not found.",
  cancel_position_not_in_created_state: "This position can only be cancelled before it has filled.",
  cancel_position_not_on_polygon: "Cancel is only supported for Polygon positions.",
  customer_cancel_position_evm_only: "Cancel is only supported for EVM positions.",
  customer_cancel_position_not_cancellable: "This position can no longer be cancelled.",
  customer_cancel_position_not_owner: "You do not own this position.",
  customer_cancel_position_not_found: "Position not found.",

  circuit_breaker_price_divergence_tripped: "Trading is temporarily paused due to price divergence. Try again shortly.",

  customer_market_not_found: "Market not found.",
  customer_position_not_found: "Position not found.",
  customer_position_transactions_not_found: "Position not found.",

  close_position_transaction_failed: "Close transaction failed on-chain.",
  close_position_transaction_not_found: "Close transaction not found.",
  finalize_close_transaction_failed: "Finalising the close transaction failed.",
  close_no_open_position_transaction: "No open transaction found for this position.",
  close_no_request_close_transaction: "No close request found for this position.",
  close_polymarket_order_failed: "Polymarket close order failed.",
  close_polymarket_order_retry_failed: "Polymarket close order failed after retries.",
  close_position_already_closed: "This position is already closed.",
  close_position_has_no_tokens: "This position has no tokens to close.",
  close_position_not_found: "Position not found.",
  close_position_not_originated: "Position has not been originated yet — nothing to close.",

  exchange_order_submission_locked: "Order submission is temporarily locked. Try again shortly.",

  quote_partner_position_limit_exceeded: (params) => {
    const available = formatPipsUsd(getParam(params, "availableCapacityUsdPips"));
    return available
      ? `Partner position limit reached. Remaining capacity: ${available}.`
      : "Partner position limit reached. Try a smaller size.";
  },
  quote_user_position_limit_exceeded: (params) => {
    const available = formatPipsUsd(getParam(params, "availableCapacityUsdPips"));
    return available
      ? `You have reached your position limit on this market. Remaining capacity: ${available}.`
      : "You have reached your position limit on this market.";
  },
  quote_market_position_limit_exceeded: (params) => {
    const available = formatPipsUsd(getParam(params, "availableCapacityUsdPips"));
    return available
      ? `This market has reached its open-interest cap. Remaining capacity: ${available}.`
      : "This market has reached its open-interest cap. Try a smaller size or another market.";
  },
  quote_global_position_limit_exceeded: (params) => {
    const available = formatPipsUsd(getParam(params, "availableCapacityUsdPips"));
    return available
      ? `Global position limit reached. Remaining capacity: ${available}.`
      : "Global position limit reached. Try again shortly.";
  },
  quote_side_position_limit_exceeded: (params) => {
    const available = formatPipsUsd(getParam(params, "availableCapacityUsdPips"));
    return available
      ? `This side of the market is at its position limit. Remaining capacity: ${available}.`
      : "This side of the market is at its position limit. Try the other side or a smaller size.";
  },
  quote_side_capacity_exceeded: (params) => {
    const maxCollateral = formatPipsUsd(getParam(params, "maxSupportedCollateralUsdPips"));
    return maxCollateral
      ? `Not enough capacity on this side of the market. Max supported collateral at this size: ${maxCollateral}.`
      : "Not enough capacity on this side of the market for that size.";
  },
  quote_position_limit_exceeded: "Position limit reached for this request.",

  quote_insufficient_liquidity: "Not enough liquidity on the order book to fill this size.",
  quote_slippage_too_high: (params) => {
    const max = formatBpsPct(getParam(params, "maxSlippageBps"));
    const current = formatBpsPct(getParam(params, "currentSlippageBps"));
    if (max && current) {
      return `Required slippage ${current} exceeds your tolerance (${max}). Reduce size or raise tolerance.`;
    }
    if (max) {
      return `Required slippage exceeds your tolerance (${max}). Reduce size or raise tolerance.`;
    }
    return "Price would move too far to fill this order. Reduce size or raise your slippage tolerance.";
  },
  quote_event_not_started: "This event has not started yet. Trading opens at the scheduled start time.",
  quote_entry_bid_depth_too_low: "Order book depth on the entry side is too thin to open this position safely.",
  quote_entry_capacity_exceeded: "Entry size exceeds the market's available capacity.",
  quote_entry_depth_too_low: "Order book depth is too thin to open this position safely.",
  quote_entry_spread_too_wide: "Bid/ask spread is too wide to open right now. Try again shortly.",
  quote_entry_order_book_stale: "Order book data is stale. Refresh and try again.",
  quote_entry_price_stale: "Price data is stale. Refresh and try again.",
  quote_entry_crypto_price_stale: "Crypto price data is stale. Refresh and try again.",
  quote_entry_sport_data_stale: "Sport event data is stale. Refresh and try again.",
  quote_entry_volume_too_low: "Recent traded volume on this market is too low to open new positions.",
  quote_entry_top_holder_too_high: "A single trader holds too much of this market. Opening here is restricted.",
  quote_entry_price_out_of_range: "Current price is outside the range we can open at. Try again shortly.",
  quote_entry_exit_drop_too_high: "Exit liquidity is too thin to safely open this size.",
  quote_entry_market_too_elapsed: (params) => {
    const elapsed = formatFractionPct(getParam(params, "pctElapsed"));
    const max = formatFractionPct(getParam(params, "maxPctElapsed"));
    if (elapsed && max) {
      return `Market is ${elapsed} elapsed (max ${max}). Too close to resolution to open new positions.`;
    }
    return "Market is too close to resolution to open new positions.";
  },
  quote_entry_excluded_market_type: "This market type is not supported for leveraged positions.",
  quote_entry_excluded_sport: "This sport is not supported for leveraged positions.",
  quote_price_too_low: "Underlying price is too low to open a leveraged position.",
  quote_open_interest_unavailable: "Open-interest data is unavailable right now. Try again shortly.",

  quote_leverage_below_minimum: (params) => {
    const min = formatLeverage(getParam(params, "minLeverageBps"));
    const current = formatLeverage(getParam(params, "currentLeverageBps"));
    if (min && current) {
      return `Leverage ${current} is below the minimum allowed (${min}).`;
    }
    if (min) {
      return `Leverage is below the minimum allowed (${min}).`;
    }
    return "Leverage is below the minimum allowed for this market.";
  },
  quote_leverage_exceeds_maximum: (params) => {
    const max = formatLeverage(getParam(params, "maxLeverageBps"));
    const current = formatLeverage(getParam(params, "currentLeverageBps"));
    if (max && current) {
      return `Leverage ${current} is above the maximum allowed (${max}).`;
    }
    if (max) {
      return `Leverage is above the maximum allowed (${max}).`;
    }
    return "Leverage is above the maximum allowed for this market.";
  },
  quote_leverage_exceeds_collateral_floor: (params) => {
    const min = formatPipsUsd(getParam(params, "minCollateralUsdPips"));
    const current = formatPipsUsd(getParam(params, "currentCollateralUsdPips"));
    if (min && current) {
      return `Collateral ${current} is below the minimum ${min} required at this leverage. Raise collateral to at least ${min}.`;
    }
    if (min) {
      return `Collateral is below the minimum ${min} required at this leverage. Raise collateral to at least ${min}.`;
    }
    return "Collateral is below the minimum required at this leverage. Raise collateral.";
  },
  quote_leverage_exceeds_model_max: (params) => {
    const max = formatLeverage(getParam(params, "maxLeverageBps"));
    const current = formatLeverage(getParam(params, "currentLeverageBps"));
    if (max && current) {
      return `Leverage ${current} exceeds the risk-model limit (${max}) for this market.`;
    }
    if (max) {
      return `Leverage exceeds the risk-model limit (${max}) for this market.`;
    }
    return "Leverage exceeds the risk-model limit for this market.";
  },
  quote_leverage_too_high_for_price: (params) => {
    const current = formatLeverage(getParam(params, "currentLeverageBps"));
    const max = formatLeverage(getParam(params, "maxAcceptableLeverageBps"));
    if (current && max) {
      return `Leverage ${current} is too high for the current price. Maximum is ${max}.`;
    }
    if (current) {
      return `Leverage ${current} is too high for the current price. Reduce leverage.`;
    }
    return "Leverage is too high for the current price. Reduce leverage.";
  },
  quote_trading_window_closing: "Trading window is closing. Reduce leverage.",
  quote_hard_exit_too_close: "Trading window is closing. Reduce leverage.",
  quote_liquidation_not_viable: (params) => {
    const tolerance = formatBpsPct(getParam(params, "minTolerancePctBps"));
    return tolerance
      ? `Liquidation price is too close to entry (minimum buffer ${tolerance}). Reduce leverage.`
      : "Liquidation price is not viable at this leverage. Reduce leverage.";
  },

  quote_min_fill_bps_requires_fak: "Partial-fill request was malformed. Please re-quote.",
  quote_min_fill_bps_out_of_range: "Minimum fill must be between 20% and 70%.",
  quote_min_fill_bps_step_invalid: "Minimum fill must be set in 5% steps.",
  quote_min_fill_bps_below_floor: (params) => {
    const floorRaw = getParam(params, "floorMinFillBps");
    const floorPct = formatBpsPct(floorRaw);
    const limit = getParam(params, "boundBy") === "notional" ? "minimum order size" : "minimum collateral";
    const floorBeyondMax = typeof floorRaw === "number" && floorRaw > minFillBpsMaxForMessage;
    if (floorBeyondMax || !floorPct) {
      return `This trade is too small for a partial fill without falling below the ${limit}. Increase your trade size, or turn off partial fill to open atomically.`;
    }
    return `This trade is too small for that minimum fill — a partial fill could fall below the ${limit}. Raise the minimum fill to at least ${floorPct}, or increase your trade size.`;
  },
  quote_fak_order_type_disabled: "Partial fills are temporarily unavailable. Turn off partial fill to continue.",

  quote_market_not_active: "Market is not active.",
  quote_market_not_eligible: "Market is not eligible for leveraged trading.",
  quote_market_not_ready: "Market is not ready yet. Try again shortly.",
  quote_market_not_found: "Market not found.",
  quote_market_risk_too_high: "Market risk is too high right now. Try again later.",
  quote_market_unsupported_category: "This market category is not supported.",
  quote_market_unsupported_crypto_asset: "This market's underlying asset is not supported.",
  quote_market_unsupported_sport: "This sport is not supported.",
  quote_market_no_prices: "No price data available for this market.",
  quote_market_missing_polymarket_condition_id: "This market is missing required Polymarket data.",

  quote_polymarket_market_closed: "This Polymarket market is closed and not accepting new positions.",
  quote_polymarket_market_inactive: "This Polymarket market is inactive and not accepting new positions.",
  quote_polymarket_market_not_accepting_orders:
    "Polymarket is not accepting orders on this market right now. Try again shortly or pick another market.",
  quote_polymarket_missing_token: "This Polymarket market is missing a tradable outcome token.",
  quote_invalid_polymarket_wallet_address: "Invalid Polymarket wallet address.",
  quote_invalid_kalshi_wallet_address: "Invalid Kalshi wallet address.",

  kalshi_quote_market_closed: "This Kalshi market is closed.",

  quote_draft_not_found: "This quote has expired or does not exist. Please request a new quote.",

  quote_twap_data_stale: "Reference price (TWAP) is stale. Try again shortly.",
  quote_twap_data_unavailable: "Reference price (TWAP) is unavailable for this market.",
  quote_revision_required: "Quote needs to be refreshed before submitting.",
  quote_price_provider_not_found: "No price provider configured for this market.",

  notional_selector_insufficient_liquidity: "Not enough liquidity to fill an order of this size. Try a smaller size.",
  notional_selector_below_min_notional:
    "This side of the market doesn't have enough liquidity to support the minimum position size right now.",
  notional_selector_empty_order_book:
    "This side of the market has no available liquidity right now. Try again shortly.",
  notional_selector_pregame_insufficient_liquidity:
    "This market doesn't yet have enough pre-game liquidity to support a position. " +
    "Try again closer to the event start.",

  evm_gas_price_circuit_breaker: "EVM gas price is too high — trading is temporarily paused.",
  evm_gas_price_spike: "EVM gas price spiked. Try again shortly.",
  evm_simulation_failed: "Transaction simulation failed. The transaction would revert on-chain.",
  evm_receipt_timeout: "Transaction confirmation timed out. Check status before retrying.",
  evm_transaction_failed: "EVM transaction failed.",

  position_transition_conflicting_operation: "Another operation on this position is in progress. Try again shortly.",
  position_transition_invalid_state: "Position is not in a state that allows this action.",

  quote_creation_disabled: "Quote creation is temporarily disabled. Try again shortly.",

  quote_committed_plan_more_restrictive:
    "The committed deleveraging plan has moved against the terms you were shown. Refresh the quote to see the " +
    "current plan.",
  quote_committed_risk_mode_unavailable:
    "Committed mode isn't available for this position. Open it in adaptive mode instead.",
};

function humanizeCode(code: string): string {
  const spaced = code.replace(/_/g, " ");
  return spaced.charAt(0).toUpperCase() + spaced.slice(1);
}

export function resolveFriendlyMessage(code: string, params: Params): string | null {
  const entry = friendlyByCode[code];
  if (entry === undefined) {
    return null;
  }
  return typeof entry === "function" ? entry(params) : entry;
}

export function formatErrorMessage(code: string, params: Params): string {
  return resolveFriendlyMessage(code, params) ?? humanizeCode(code);
}
