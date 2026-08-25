// This file is auto-generated from customer-openapi.json — DO NOT EDIT
// Regenerate with: pnpm run generate:types
export interface paths {
  "/v1/prediction-markets/tokens": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /**
     * Create a customer JWT
     * @description Issues a short-lived JWT bound to the caller's wallet address for use on customer endpoints.
     */
    post: operations["CustomerAuthController_createToken"];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/v1/prediction-markets/contract-info": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /**
     * Get on-chain contract info
     * @description Returns the chain IDs and contract addresses needed to construct on-chain transactions.
     */
    get: operations["CustomerContractInfoController_getContractInfo"];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/v1/prediction-markets/fee-rates": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /**
     * Get fee rates
     * @description Returns the protocol fee schedule (origination tiers, lifetime APR, liquidation fee) and this partner's fee components, so callers can compute offer math client-side. Pass `ticker` to also include a market's venue fee fields.
     */
    get: operations["CustomerFeeController_getFeeRates"];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/v1/prediction-markets/fee-reports": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /**
     * Get a fee report for a hypothetical position
     * @description Returns the fee breakdown, an at-entry liquidation price estimate, and the gross/net maximum gain for a hypothetical position from notional + leverage, using the market's fee rates from the database. Does not create an offer and does not sign anything.
     */
    post: operations["CustomerFeeController_createFeeReport"];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/v1/prediction-markets/partner-limits": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /**
     * Get partner trading limits
     * @description Returns the calling partner's aggregate trading limit and current usage.
     */
    get: operations["CustomerLimitController_getPartnerLimits"];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/v1/prediction-markets/user-limits": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /**
     * Get user trading limits
     * @description Returns the authenticated user's aggregate trading limit and current usage.
     */
    get: operations["CustomerLimitController_getUserLimits"];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/v1/prediction-markets/markets": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /**
     * List markets
     * @description Paginated list of available prediction markets. Pass `query` to perform a free-text search across market tickers and titles.
     */
    get: operations["CustomerMarketController_listMarkets"];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/v1/prediction-markets/markets/search": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /**
     * Search markets (deprecated)
     * @deprecated
     * @description Deprecated — use `GET /v1/prediction-markets/markets?query=<term>` instead. Paginated free-text search across market tickers and titles.
     */
    get: operations["CustomerMarketController_searchMarkets"];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/v1/prediction-markets/markets/{ticker}": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /**
     * Get market by ticker
     * @description Fetch a single market by its ticker identifier.
     */
    get: operations["CustomerMarketController_getMarketByTicker"];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/v1/prediction-markets/positions": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /**
     * List customer positions
     * @description Paginated list of the authenticated customer's open and closed positions.
     */
    get: operations["CustomerPositionController_listPositions"];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/v1/prediction-markets/sample-events": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /**
     * Emit every WebSocket event with mock data
     * @description Emits one of every WebSocket event type, one per second, to the caller's own WebSocket connection so an integration can be exercised without waiting for real position activity. Authenticate with a partner API key to emit onto the partner positions gateway, or with a customer JWT to emit onto the user positions gateway (which additionally receives the `notification` events). The payloads are fixed mock data — no position is created and nothing is persisted. Limited to one request every 30 seconds.
     */
    post: operations["CustomerSampleEventController_createSampleEvents"];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/v1/prediction-markets/offers": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    post: operations["CustomerOfferController_createOffer"];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/v1/prediction-markets/draft-offers": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    post: operations["CustomerOfferController_createDraftOffer"];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/v1/prediction-markets/quotes": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    post: operations["CustomerOfferController_createQuote"];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/v1/prediction-markets/draft-quotes": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    post: operations["CustomerOfferController_createDraftQuote"];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/v1/prediction-markets/positions/{position_id}": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /**
     * Get position by ID
     * @description Fetch a single position (open or closed) by its position ID.
     */
    get: operations["CustomerPositionController_getPositionById"];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/v1/prediction-markets/positions/{position_id}/partial-closes": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /**
     * List position partial-close history
     * @description Returns each executed partial close for a position, in chronological order, with the tokens sold, the average realized sale price, the sale proceeds, the protocol capital repaid, the owner payout, and the remaining position size after the close. Only partial closes that finalized on chain are returned.
     */
    get: operations["CustomerPartialCloseHistoryController_listPartialCloses"];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/v1/prediction-markets/positions/{position_id}/transactions": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /**
     * List on-chain transactions for a position
     * @description Returns every on-chain transaction tied to a position, grouped by operation type, including the nested exchange (CLOB/DEX) fill hashes. Only transactions that landed and finalized on chain are returned.
     */
    get: operations["CustomerPositionTransactionsController_listPositionTransactions"];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/v1/prediction-markets/positions/{position_id}/unwinds": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /**
     * List position unwind history
     * @deprecated
     * @description Returns the executed unwind (deleveraging) history for a specific position, in chronological order. Deprecated — prefer `expand=unwinds` on `GET /positions` or `GET /positions/{id}` to fetch unwinds inline with the position(s) in a single request.
     */
    get: operations["CustomerPositionUnwindController_listPositionUnwinds"];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/v1/prediction-markets/promoted-quotes/{draft_offer_id}": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    post: operations["CustomerOfferController_createPromotedQuote"];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/v1/prediction-markets/promoted-offers/{draft_offer_id}": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    post: operations["CustomerOfferController_createPromotedOffer"];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
}
export type webhooks = Record<string, never>;
export interface components {
  schemas: {
    CreateTokenBody: {
      /**
       * @description Customer wallet address (Solana public key or EVM address)
       * @example 0x1234567890123456789012345678901234567890
       */
      wallet_address: string;
    };
    CreateTokenResult: {
      /** @description JWT authentication token */
      token: string;
      /**
       * @description ISO 8601 timestamp when token expires
       * @example 2025-01-15T10:35:00.000Z
       */
      expires_at: string;
    };
    CustomerContractInfo: {
      /**
       * @description EVM chain ID
       * @example 137
       */
      evm_chain_id: string;
      /**
       * @description Checksummed address of the authorized offer signer on Polygon
       * @example 0x70997970C51812dc3A010C7d01b50e0d17dc79C8
       */
      polygon_signer_address: string;
      /**
       * @description Checksummed address of the stablecoin (pUSD) token that collateral must be transferred in. Use this when building the push deposit transfer — sending any other token (e.g. USDC.e) will fail.
       * @example 0xC011a7E12a19f7B1f670d46F03B03f3342E82DFB
       */
      polygon_usdc_token_address: string;
      /**
       * @description Checksummed address of the vault contract on Polygon
       * @example 0x9965507D1a55bcC2695C58ba16FB37d819B0A4dc
       */
      polygon_vault_contract_address: string;
    };
    CustomerOriginationFeeTier: {
      /**
       * @description Upper leverage bound (inclusive) in basis points for this tier. The last tier is the catch-all.
       * @example 40000
       */
      max_leverage_bps: number;
      /**
       * @description Protocol origination fee in basis points applied at or below this tier's leverage bound.
       * @example 200
       */
      fee_bps: number;
    };
    CustomerFeeRatesMarket: {
      /**
       * @description Market ticker
       * @example TRUMP-2024-WIN
       */
      ticker: string;
      /**
       * @description Polymarket venue trading fee rate in basis points (`feeRateBps`).
       * @example 0
       */
      polymarket_trading_fee_bps: number;
      /**
       * @description Polymarket fee-curve exponent (`feeExponent`). `1` for the standard quadratic curve.
       * @example 1
       */
      polymarket_fee_exponent: number;
    };
    CustomerFeeRates: {
      /** @description Per-market venue fee fields. Only present when the request includes a `ticker` query parameter. */
      market?: components["schemas"]["CustomerFeeRatesMarket"];
      /** @description Leverage-tiered protocol origination fee schedule. Resolve a leverage to its fee by picking the first tier whose `maxLeverageBps >= leverageBps` (the last tier is the catch-all). */
      origination_fee_tiers: components["schemas"]["CustomerOriginationFeeTier"][];
      /**
       * @description Maximum combined (protocol + partner) origination fee in basis points enforced on-chain.
       * @example 1000
       */
      contract_max_origination_fee_bps: number;
      /**
       * @description Lifetime fee APR in basis points
       * @example 2000
       */
      lifetime_fee_apr_bps: number;
      /**
       * @description Liquidation fee in basis points
       * @example 250
       */
      liquidation_fee_bps: number;
      /**
       * @description This partner's origination fee component in basis points, added to the protocol tier fee. `0` by default.
       * @example 0
       */
      partner_origination_fee_bps: number;
      /**
       * @description This partner's Polymarket builder taker fee in basis points (flat percentage of notional). `0` by default.
       * @example 0
       */
      partner_trading_fee_bps: number;
    };
    FeeReportBody: {
      /**
       * @description Leverage in basis points (20000 = 2x, 100000 = 10x). Must be divisible by 2500. Maximum 10x.
       * @example 50000
       */
      leverage_bps: number;
      /**
       * @description Market ticker
       * @example TRUMP-2024-WIN
       */
      market_ticker: string;
      /**
       * @description Notional amount in USD pips (10,000 pips = $1.00)
       * @example 50000
       */
      notional_amount_usd_pips: string;
      /**
       * @description Market side (yes or no)
       * @enum {string}
       */
      effective_side: "yes" | "no";
      /**
       * @description Effective-side entry price in USD pips (10000 pips = $1) to compute against. When omitted, the market's current reference price is used. Provide it to compute deterministically against a known price.
       * @example 5100
       */
      entry_price_usd_pips?: string;
    };
    CustomerFeeReport: {
      /**
       * @description Market ticker
       * @example TRUMP-2024-WIN
       */
      market_ticker: string;
      /**
       * @description Market side
       * @enum {string}
       */
      effective_side: "yes" | "no";
      /**
       * @description Leverage in basis points (20000 = 2x)
       * @example 20000
       */
      leverage_bps: number;
      /**
       * @description Entry price used for the computation, in USD pips
       * @example 5100
       */
      entry_price_usd_pips: string;
      /**
       * @description Notional in USD pips (10000 pips = $1)
       * @example 500000
       */
      notional_amount_usd_pips: string;
      /**
       * @description Notional in USDC units (1,000,000 = 1 USDC)
       * @example 50000000
       */
      notional_usdc_units: string;
      /**
       * @description Collateral in USDC units
       * @example 25000000
       */
      collateral_usdc_units: string;
      /**
       * @description Combined origination fee in basis points
       * @example 200
       */
      origination_fee_bps: number;
      /**
       * @description Origination fee in USDC units
       * @example 1000000
       */
      origination_fee_usdc_units: string;
      /**
       * @description Protocol component of the origination fee in basis points
       * @example 200
       */
      protocol_origination_fee_bps: number;
      /**
       * @description Partner component of the origination fee in basis points
       * @example 0
       */
      partner_origination_fee_bps: number;
      /**
       * @description Polymarket venue trading fee rate in basis points (`feeRateBps`).
       * @example 0
       */
      polymarket_trading_fee_bps: number;
      /**
       * @description Partner Polymarket builder taker fee in basis points (flat percentage of notional).
       * @example 0
       */
      partner_trading_fee_bps: number;
      /**
       * @description Expected venue trading fee in USDC units charged to open the position (protocol venue fee + partner builder fee), computed from notional and entry price.
       * @example 2204118
       */
      expected_open_trading_fee_usdc_units: string;
      /**
       * @description Total amount the user must provide to open, in USDC units.
       * @example 28204118
       */
      total_user_amount_usdc_units: string;
      /**
       * @description Deterministic at-entry liquidation price ESTIMATE in USD pips (10000 pips = $1): `entry * (L-1)/L * (1 + liquidationFeeBps/10000)`. This is a closed-form estimate; the binding offer uses a TWAP/inference-based price that may differ.
       * @example 2629
       */
      estimated_liquidation_price_usd_pips: string;
      /**
       * @description Gross maximum gain in USDC units: full value on a win (settlement at $1) minus notional, before fees. Profit over principal; may be negative.
       * @example 48039215
       */
      gross_max_gain_usdc_units: string;
      /**
       * @description Net maximum gain in USDC units: grossMaxGain minus the open trading fee and the origination fee. Assumes a win via settlement (no exit trading fee) and excludes lifetime fees, so it is an upper bound. May be negative.
       * @example 44835097
       */
      net_max_gain_usdc_units: string;
    };
    CustomerLimit: {
      /**
       * @description Total limit formatted as USD
       * @example 1000.00
       */
      limit_usd: string;
      /**
       * @description Total limit in USD pips (10000 pips = $1)
       * @example 10000000
       */
      limit_usd_pips: string;
      /**
       * @description Remaining available limit formatted as USD
       * @example 750.00
       */
      remaining_usd: string;
      /**
       * @description Remaining available limit in USD pips
       * @example 7500000
       */
      remaining_usd_pips: string;
      /**
       * @description Current usage formatted as USD
       * @example 250.00
       */
      usage_usd: string;
      /**
       * @description Current usage in USD pips
       * @example 2500000
       */
      usage_usd_pips: string;
    };
    CustomerOriginationTier: {
      /**
       * @description Origination fee in basis points for this tier
       * @example 100
       */
      fee_bps: number;
      /**
       * @description Maximum leverage in basis points for this tier
       * @example 20000
       */
      max_leverage_bps: number;
    };
    CustomerFees: {
      /**
       * @description Lifetime fee APR in basis points
       * @example 500
       */
      lifetime_apr_bps: number;
      /**
       * @description Liquidation fee in basis points
       * @example 200
       */
      liquidation_bps: number;
      /** @description Origination fee tiers by leverage */
      origination_tiers: components["schemas"]["CustomerOriginationTier"][];
    };
    CustomerMaxMarketLeveragePerNotional: {
      /**
       * @description Maximum market leverage in basis points when the position notional is $100
       * @example 100000
       */
      at100_usd_bps: number;
      /**
       * @description Maximum market leverage in basis points when the position notional is $500
       * @example 80000
       */
      at500_usd_bps: number;
      /**
       * @description Maximum market leverage in basis points when the position notional is $1,000
       * @example 60000
       */
      at1000_usd_bps: number;
      /**
       * @description Maximum market leverage in basis points when the position notional is $10,000
       * @example 30000
       */
      at10000_usd_bps: number;
    };
    CustomerSidedMaxMarketLeveragePerNotional: {
      /** @description Per-notional max market leverage for the YES side */
      yes: components["schemas"]["CustomerMaxMarketLeveragePerNotional"];
      /** @description Per-notional max market leverage for the NO side */
      no: components["schemas"]["CustomerMaxMarketLeveragePerNotional"];
    };
    CustomerLeverage: {
      /**
       * @deprecated
       * @description Deprecated: use maxYesBps and maxNoBps. Populated as min(maxYesBps, maxNoBps) for backwards compatibility.
       * @example 50000
       */
      max_bps: number;
      /** @description Max market leverage per side, broken out by position notional. Slippage grows with notional, so larger notionals have lower max leverage. The UI slider should publish the leverage that matches the user's selected notional. */
      max_market_leverage_per_notional: components["schemas"]["CustomerSidedMaxMarketLeveragePerNotional"];
      /**
       * @description Maximum leverage in basis points for the NO side
       * @example 50000
       */
      max_no_bps: number;
      /**
       * @description Maximum leverage in basis points for the YES side
       * @example 50000
       */
      max_yes_bps: number;
      /**
       * @description Minimum leverage in basis points
       * @example 10000
       */
      min_bps: number;
      /**
       * @description Leverage step increment in basis points
       * @example 1000
       */
      step_bps: number;
    };
    CustomerMarketPolymarket: {
      /**
       * @description Polymarket market slug, matching the slug in Polymarket URLs and Gamma API responses.
       * @example will-trump-win-the-2024-election
       */
      slug: string;
      /**
       * @description Polymarket CTF condition ID for this market. Use it to look the market up on Polymarket's CLOB and Gamma APIs. Null for the small number of markets where Polymarket has not exposed a condition ID.
       * @example 0xabc123def4567890abc123def4567890abc123def4567890abc123def4567890
       */
      condition_id?: string | null;
      /**
       * @description Polymarket CLOB token ID for the NO outcome (the ERC1155 position token ID).
       * @example 71321045679252212594626385532706912750332728571942532289631379312455583992563
       */
      no_token_id: string;
      /**
       * @description Polymarket CLOB token ID for the YES outcome (the ERC1155 position token ID).
       * @example 21742633143463906290569050155826241533067272736897614950488156847949938836455
       */
      yes_token_id: string;
    };
    CustomerSideEligibility: {
      /**
       * @description Whether this market is accepting new positions on this side
       * @example true
       */
      accepting_new_positions: boolean;
      /**
       * @description Reason code if this side is not accepting new positions; null when accepting
       * @example QUOTE_MARKET_NOT_ELIGIBLE
       */
      rejection_reason_code?: string | null;
    };
    CustomerSidedEligibility: {
      /** @description Eligibility for the YES side */
      yes: components["schemas"]["CustomerSideEligibility"];
      /** @description Eligibility for the NO side */
      no: components["schemas"]["CustomerSideEligibility"];
    };
    CustomerMarketPrices: {
      /**
       * @description NO side ask price formatted as USD
       * @example 0.51
       */
      no_ask_price_usd: string;
      /**
       * @description NO side ask price in USD pips (10000 pips = $1)
       * @example 5100
       */
      no_ask_price_usd_pips: string;
      /**
       * @description NO side bid price formatted as USD
       * @example 0.49
       */
      no_bid_price_usd: string;
      /**
       * @description NO side bid price in USD pips (10000 pips = $1)
       * @example 4900
       */
      no_bid_price_usd_pips: string;
      /**
       * @description YES side ask price formatted as USD
       * @example 0.51
       */
      yes_ask_price_usd: string;
      /**
       * @description YES side ask price in USD pips (10000 pips = $1)
       * @example 5100
       */
      yes_ask_price_usd_pips: string;
      /**
       * @description YES side bid price formatted as USD
       * @example 0.49
       */
      yes_bid_price_usd: string;
      /**
       * @description YES side bid price in USD pips (10000 pips = $1)
       * @example 4900
       */
      yes_bid_price_usd_pips: string;
    };
    CustomerMarket: {
      /**
       * @description Market category
       * @example politics
       */
      category: string;
      /** @description Fee configuration */
      fees: components["schemas"]["CustomerFees"];
      /**
       * @description Market ID
       * @example dm_mkt_abc123
       */
      id: string;
      /** @description Leverage configuration */
      leverage: components["schemas"]["CustomerLeverage"];
      /**
       * @description Prediction market provider
       * @enum {string}
       */
      provider: "polymarket";
      /**
       * @description Current market status
       * @enum {string}
       */
      status: "active" | "amended" | "closed" | "determined" | "disputed" | "finalized" | "inactive" | "initialized";
      /**
       * @description Market tags for filtering
       * @example [
       *       "politics",
       *       "election"
       *     ]
       */
      tags: string[];
      /** @description Polymarket identifiers for this market, for mapping our markets onto Polymarket data feeds. Always present (all live markets are Polymarket-sourced). */
      polymarket: components["schemas"]["CustomerMarketPolymarket"];
      /**
       * @deprecated
       * @description Deprecated: use `polymarket.slug`. Market ticker sourced from the upstream trading venue.
       * @example will-trump-win-the-2024-election
       */
      ticker: string;
      /** @description Market title */
      title?: string;
      /** @description Latest bid/ask prices for YES and NO sides. Only present when the request includes `expand=prices`. */
      prices?: components["schemas"]["CustomerMarketPrices"] | null;
      /**
       * @description Whether this market is accepting new positions
       * @example true
       */
      accepting_new_positions: boolean;
      /**
       * @description ISO 8601 timestamp when market closes
       * @example 2025-01-20T12:00:00.000Z
       */
      close_time?: string;
      /**
       * @description ISO 8601 timestamp when this market was first discovered and listed on the platform
       * @example 2025-01-10T08:00:00.000Z
       */
      discovered_at: string;
      /**
       * @description ISO 8601 timestamp of the latest time a new position can be opened in this market
       * @example 2025-01-20T11:30:00.000Z
       */
      latest_enter_at?: string;
      /**
       * @description Minimum collateral amount formatted as USD
       * @example 0.02
       */
      min_collateral_usd: string;
      /**
       * @description Minimum collateral amount in USD pips (10000 pips = $1)
       * @example 200000
       */
      min_collateral_usd_pips: string;
      /**
       * @description Minimum notional amount formatted as USD
       * @example 5.00
       */
      min_notional_usd: string;
      /**
       * @description Minimum notional amount in USD pips (10000 pips = $1)
       * @example 50000
       */
      min_notional_usd_pips: string;
      /**
       * @description Where this market sits on the road to settlement. `none` — still trading, nothing pending. `awaiting_resolution` — the market has closed and the outcome is decided, but the prediction market provider has not yet published the result on chain, so nothing can be redeemed yet. `settling` — the result is published and open positions are being settled. `voided` — the market was voided and every token pays out at $0.50. `unresolved_upstream` — the market disappeared from the provider before publishing a result and may never resolve.
       * @example none
       * @enum {string}
       */
      settlement_state: "awaiting_resolution" | "none" | "settling" | "unresolved_upstream" | "voided";
      /**
       * @description Capacity-limited maximum notional for NO side formatted as USD
       * @example 50.00
       */
      capacity_max_notional_no_usd?: string | null;
      /**
       * @description Capacity-limited maximum notional for NO side in USD pips (10000 pips = $1)
       * @example 500000000
       */
      capacity_max_notional_no_usd_pips?: string | null;
      /**
       * @description Capacity-limited maximum notional for YES side formatted as USD
       * @example 50.00
       */
      capacity_max_notional_yes_usd?: string | null;
      /**
       * @description Capacity-limited maximum notional for YES side in USD pips (10000 pips = $1)
       * @example 500000000
       */
      capacity_max_notional_yes_usd_pips?: string | null;
      /**
       * @description Maximum notional available for NO side formatted as USD. Bounded by slippage, capacity, the partner's remaining position limit, and the per-user position limit (assuming a user with no open positions).
       * @example 50.00
       */
      max_notional_no_usd?: string;
      /**
       * @description Maximum notional available for NO side in USD pips (10000 pips = $1). Bounded by slippage, capacity, the partner's remaining position limit, and the per-user position limit (assuming a user with no open positions).
       * @example 500000000
       */
      max_notional_no_usd_pips?: string;
      /**
       * @description Maximum notional available for YES side formatted as USD. Bounded by slippage, capacity, the partner's remaining position limit, and the per-user position limit (assuming a user with no open positions).
       * @example 50.00
       */
      max_notional_yes_usd?: string;
      /**
       * @description Maximum notional available for YES side in USD pips (10000 pips = $1). Bounded by slippage, capacity, the partner's remaining position limit, and the per-user position limit (assuming a user with no open positions).
       * @example 500000000
       */
      max_notional_yes_usd_pips?: string;
      /**
       * @description Slippage-limited maximum notional for NO side formatted as USD
       * @example 50.00
       */
      slippage_max_notional_no_usd?: string | null;
      /**
       * @description Slippage-limited maximum notional for NO side in USD pips (10000 pips = $1)
       * @example 500000000
       */
      slippage_max_notional_no_usd_pips?: string | null;
      /**
       * @description Slippage-limited maximum notional for YES side formatted as USD
       * @example 50.00
       */
      slippage_max_notional_yes_usd?: string | null;
      /**
       * @description Slippage-limited maximum notional for YES side in USD pips (10000 pips = $1)
       * @example 500000000
       */
      slippage_max_notional_yes_usd_pips?: string | null;
      /**
       * @description Reason code if market is not accepting new positions
       * @example QUOTE_MARKET_NOT_ELIGIBLE
       */
      rejection_reason_code?: string;
      /** @description Per-side eligibility. A market may accept positions on one side while rejecting the other (e.g. thin opposite-side liquidity, side max-leverage below the floor). */
      sided_eligibility: components["schemas"]["CustomerSidedEligibility"];
      /** @description Subtitle for the YES outcome */
      yes_sub_title?: string;
    };
    CustomerPositionEntry: {
      /**
       * @description Entry collateral formatted as USD
       * @example 2.50
       */
      collateral_usd: string;
      /**
       * @description Entry collateral in USD pips (10000 pips = $1)
       * @example 25000
       */
      collateral_usd_pips: string;
      /**
       * @description Entry leverage in basis points (20000 = 2x)
       * @example 20000
       */
      leverage_bps: number;
      /**
       * @description Risk mode the position was opened in. adaptive: the live risk engine manages leverage. committed: the position follows the planned unwinds fixed at quote time.
       * @example adaptive
       * @enum {string}
       */
      risk_mode: "adaptive" | "committed";
      /**
       * @description Extra margin locked in the vault on top of collateral, in USDC units (1,000,000 units = 1 USDC). Zero on adaptive positions.
       * @example 0
       */
      locked_margin_usdc_units: string;
      /**
       * @description Entry notional formatted as USD
       * @example 5.00
       */
      notional_usd: string;
      /**
       * @description Entry notional in USD pips
       * @example 50000
       */
      notional_usd_pips: string;
      /**
       * @description Time in milliseconds from position creation to on-chain open confirmation. Null until the position is fully opened on chain.
       * @example 12500
       */
      open_latency_ms?: number | null;
      /**
       * @description ISO 8601 timestamp when position was opened
       * @example 2025-01-15T10:30:00.000Z
       */
      opened_at?: string;
      /**
       * @description Combined origination fee in basis points. `protocolOriginationFeeBps + partnerOriginationFeeBps === originationFeeBps`.
       * @example 100
       */
      origination_fee_bps: number;
      /**
       * @description Protocol portion of the origination fee in basis points. `protocolOriginationFeeBps + partnerOriginationFeeBps === originationFeeBps`.
       * @example 80
       */
      protocol_origination_fee_bps: number;
      /**
       * @description Partner portion of the origination fee in basis points. `protocolOriginationFeeBps + partnerOriginationFeeBps === originationFeeBps`.
       * @example 20
       */
      partner_origination_fee_bps: number;
      /**
       * @description Origination fee formatted as USD
       * @example 0.05
       */
      origination_fee_usd: string;
      /**
       * @description Origination fee in USD pips
       * @example 500
       */
      origination_fee_usd_pips: string;
      /**
       * @description Entry price formatted as USD
       * @example 0.50
       */
      price_usd: string;
      /**
       * @description Entry price in USD pips
       * @example 5000
       */
      price_usd_pips: string;
      /**
       * @description Effective entry price (actual fill price on the prediction market) formatted as USD. Null until the fill is recorded on chain.
       * @example 0.5025
       */
      effective_entry_price_usd?: string | null;
      /**
       * @description Effective entry price in USD pips. Null until the fill is recorded on chain.
       * @example 5025
       */
      effective_entry_price_usd_pips?: string | null;
      /**
       * @description Execution slippage between the offer's indicative entry price and the actual fill price, in basis points. Signed: positive means the fill was worse than the quote, negative means the fill was better. Null until the fill is recorded on chain.
       * @example 50
       */
      effective_slippage_bps?: number | null;
      /**
       * @description Original position token units delivered when the position opened (1000000 units = 1 token). Unlike `current.positionTokenUnits` (the live, possibly partially-closed survivor), this is the fixed size credited at open and is the basis for the partial-close minimum. Null until the open fill is recorded on chain.
       * @example 10000000
       */
      position_token_units?: string | null;
      /**
       * @description How much of the requested size was actually filled when the position opened, in basis points (10000 = 100%). Computed as actual open notional / requested notional and FROZEN at open — it does NOT change when the position is partially closed. Use this for an 'opened at X% of requested' badge. Null until the open fill is recorded on chain.
       * @example 9657
       */
      initial_fill_bps?: number | null;
    };
    CustomerPositionFailure: {
      /**
       * @description Failure reason code
       * @example price_exceeded_tolerance
       */
      reason: string;
    };
    CustomerPositionUnwind: {
      /**
       * @description executed: an unwind that landed on-chain, as recorded by the deleveraging itself. planned: a committed-mode rung that fires if the price reaches triggerPriceUsdPips. triggered: a committed-mode rung whose trigger price was reached, stamped with executedAt. superseded: a committed-mode rung that can no longer fire because a partial close already took the position below its target leverage. Rung rows (planned, triggered, superseded) are the signed ladder and are only returned when the request asks for them; they describe what was promised, while executed rows describe what actually happened.
       * @example executed
       * @enum {string}
       */
      status: "executed" | "planned" | "superseded" | "triggered";
      /**
       * @description The market signal that triggered the risk-model inference behind this unwind (e.g. `spread_blowout`, `depth_decay`, `price_drop_severe`). Null for unwinds not tied to an inference run, such as manually triggered deleveraging.
       * @example spread_blowout
       * @enum {string|null}
       */
      reason?:
        | "activity_surge"
        | "cancel_acceleration"
        | "crypto_move"
        | "depth_decay"
        | "depth_drain"
        | "depth_entry_drain"
        | "game_start"
        | "large_holder"
        | "last_trade_divergence"
        | "lead_change"
        | "post_hard_exit_losing"
        | "position_exposure"
        | "price_drop_full_exit"
        | "price_drop_moderate"
        | "price_drop_severe"
        | "price_drop_warning"
        | "spread_blowout"
        | "spread_spike"
        | "spread_warning"
        | "stale_refresh"
        | "unknown"
        | null;
      /**
       * @description Leverage after unwind in basis points (20000 = 2x)
       * @example 30000
       */
      after_leverage_bps: number;
      /**
       * @description Leverage before unwind in basis points (20000 = 2x)
       * @example 60000
       */
      before_leverage_bps: number;
      /**
       * @description ISO 8601 timestamp when the unwind was executed on-chain. Null on planned unwinds, which have not happened yet.
       * @example 2025-06-02T14:30:00.000Z
       */
      executed_at?: string | null;
      /**
       * @description Price at which this planned unwind fires, in USD pips (10000 pips = $1). Null on executed unwinds.
       * @example 4200
       */
      trigger_price_usd_pips?: string | null;
      /**
       * @description Human-readable explanation of `reason` — a customer-facing sentence describing the market condition that triggered this deleverage. Null whenever `reason` is null.
       * @example The bid-ask spread widened sharply beyond its recent baseline, signalling thinning liquidity.
       */
      reason_detail?: string | null;
    };
    CustomerPositionUnwindList: {
      data: components["schemas"]["CustomerPositionUnwind"][];
      has_more: boolean;
      total_count?: number;
      /**
       * @description Current leverage of the position in basis points (20000 = 2x), null if not yet calculated
       * @example 30000
       */
      current_leverage_bps: number | null;
      /**
       * @description ISO 8601 timestamp when the position was opened on-chain (null if not yet opened)
       * @example 2025-06-01T12:00:00.000Z
       */
      originated_at: string | null;
      /**
       * @description Leverage at position origination in basis points (20000 = 2x)
       * @example 60000
       */
      origination_leverage_bps: number;
    };
    CustomerCloseAttempt: {
      /**
       * @description Outcome of the close attempt. `deferred` means the close could not complete yet and was postponed.
       * @enum {string}
       */
      outcome: "deferred";
      /**
       * @description Why the close was deferred. `awaiting_settlement`: the market resolved before the position could be sold, so the remaining tokens will be redeemed when the market settles rather than sold on the order book.
       * @enum {string}
       */
      reason: "awaiting_settlement";
      /**
       * @description ISO-8601 timestamp of when the close was requested.
       * @example 2026-06-15T17:27:11.736Z
       */
      deferred_at: string;
    };
    CustomerPendingOperation: {
      /**
       * @description The lifecycle operation currently in flight on this position. Present whenever the position is mid-operation (open, close, partial close, unwind, liquidate, or settle); null when the position is at rest. Note `status` stays `open` throughout a `partial_close`, so this is the only signal a slice is in flight after a reload.
       * @enum {string}
       */
      type: "open" | "close" | "partial_close" | "unwind" | "liquidate" | "settle";
      /**
       * @description Sub-state of the operation: `requested` (submitted, not yet executing), `initiated` (executing on the venue), `pending` (tokens withdrawn, finalizing on chain), `awaiting_settlement` (a close deferred until the market settles). Null when the operation has no distinct phase.
       * @example initiated
       * @enum {string|null}
       */
      phase?: "requested" | "initiated" | "pending" | "awaiting_settlement" | null;
      /**
       * @description Token units involved in the in-flight operation (1000000 units = 1 token). For `partial_close` this is the slice being closed; for `close`/`liquidate` the units withdrawn; for the awaiting-settlement close the remaining tokens. Null when the operation carries no specific token amount.
       * @example 5000000
       */
      token_units?: string | null;
    };
    CustomerPositionCurrent: {
      /**
       * @description Current book-value leverage in basis points (20000 = 2x)
       * @example 18000
       */
      book_leverage_bps: number;
      /**
       * @description Current collateral formatted as USD
       * @example 2.50
       */
      collateral_usd: string;
      /**
       * @description Current collateral in USD pips
       * @example 25000
       */
      collateral_usd_pips: string;
      /**
       * @description Effective collateral formatted as USD
       * @example 2.45
       */
      effective_collateral_usd: string;
      /**
       * @description Effective collateral after fees in USD pips
       * @example 24500
       */
      effective_collateral_usd_pips: string;
      /**
       * @deprecated
       * @description Current leverage in basis points
       * @example 18000
       */
      leverage_bps: number;
      /**
       * @description Current market-value leverage in basis points, computed from the live oracle price. Null when the position is insolvent (equity <= 0).
       * @example 19500
       */
      market_leverage_bps?: number | null;
      /**
       * @description Current mark price formatted as USD
       * @example 0.55
       */
      mark_price_usd: string;
      /**
       * @description Current mark price in USD pips
       * @example 5500
       */
      mark_price_usd_pips: string;
      /**
       * @description Unrealized PnL net of all fees (origination + pending lifetime + accrued venue) as return on equity in basis points
       * @example 1800
       */
      net_unrealized_pnl_bps: number;
      /**
       * @description Unrealized PnL net of all fees (origination + pending lifetime + accrued venue) formatted as USD
       * @example 0.45
       */
      net_unrealized_pnl_usd: string;
      /**
       * @description Unrealized PnL net of all fees (origination + pending lifetime + accrued venue) in USD pips (can be negative)
       * @example 4500
       */
      net_unrealized_pnl_usd_pips: string;
      /**
       * @description Current notional formatted as USD
       * @example 5.50
       */
      notional_usd: string;
      /**
       * @description Current notional in USD pips
       * @example 55000
       */
      notional_usd_pips: string;
      /**
       * @description Smallest partial-close slice the contract will accept right now, in token units (1000000 units = 1 token): `max(5 tokens, 20% of the original opened size)`. Null when the position is not partial-closeable (an operation is already in flight, the open fill isn't recorded yet, or the survivor is below the minimum).
       * @example 5000000
       */
      min_partial_close_token_units?: string | null;
      /**
       * @description Largest partial-close slice allowed right now, in token units (1000000 units = 1 token): the full survivor size currently held (`positionTokenUnits`). Null when the position is not partial-closeable.
       * @example 10000000
       */
      max_partial_close_token_units?: string | null;
      /**
       * @description Position token units held (1000000 units = 1 token)
       * @example 10000000
       */
      position_token_units: string;
      /**
       * @description Fraction of the originally opened size still held, in basis points (10000 = 100%). Computed as current token units / original opened token units. This LEGITIMATELY DECREASES after each partial close (e.g. 7000 = 70% remaining after a 30% close) and is not a fill problem. Null until the open fill is recorded on chain.
       * @example 7000
       */
      remaining_bps?: number | null;
      /**
       * @description Total position value formatted as USD
       * @example 3.00
       */
      position_value_usd: string;
      /**
       * @description Total position value in USD pips
       * @example 30000
       */
      position_value_usd_pips: string;
      /**
       * @description Unrealized PnL as return on equity in basis points (1000 = 10%)
       * @example 2000
       */
      unrealized_pnl_bps: number;
      /**
       * @description Unrealized PnL formatted as USD
       * @example 0.50
       */
      unrealized_pnl_usd: string;
      /**
       * @description Unrealized PnL in USD pips (can be negative)
       * @example 5000
       */
      unrealized_pnl_usd_pips: string;
    };
    CustomerPositionOpenFees: {
      /**
       * @description Accrued lifetime fee formatted as USD
       * @example 0.01
       */
      accrued_lifetime_fee_usd: string;
      /**
       * @description Accrued lifetime fee in USD pips
       * @example 100
       */
      accrued_lifetime_fee_usd_pips: string;
      /**
       * @description Venue (Polymarket) trading fees paid so far on this position, summed across open and any force-unwind exchange transactions, formatted as USD.
       * @example 0.02
       */
      accrued_venue_fee_usd: string;
      /**
       * @description Venue trading fees paid so far on this position in USD pips.
       * @example 200
       */
      accrued_venue_fee_usd_pips: string;
      /**
       * @description Lifetime fee APR in basis points
       * @example 500
       */
      lifetime_apr_bps: number;
      /**
       * @description Pending lifetime fee formatted as USD
       * @example 0.005
       */
      pending_lifetime_fee_usd: string;
      /**
       * @description Pending lifetime fee in USD pips
       * @example 50
       */
      pending_lifetime_fee_usd_pips: string;
      /**
       * @description Sum of all fees accrued or owed so far (origination + accrued lifetime + pending lifetime + accrued venue), formatted as USD. Mirrors closed positions' `fees.totalFeesUsd`.
       * @example 0.085
       */
      total_fees_usd: string;
      /**
       * @description Sum of all fees accrued or owed so far (origination + accrued lifetime + pending lifetime + accrued venue) in USD pips.
       * @example 850
       */
      total_fees_usd_pips: string;
    };
    CustomerPositionRisk: {
      /**
       * @description Current liquidation price formatted as USD
       * @example 0.35
       */
      current_liquidation_price_usd: string;
      /**
       * @description Current liquidation price in USD pips
       * @example 3500
       */
      current_liquidation_price_usd_pips: string;
      /**
       * @description Margin health 0-10000 (10000 at entry, 0 at liquidation)
       * @example 7500
       */
      health_bps: number;
      /**
       * @description Buffer to liquidation in basis points
       * @example 500
       */
      liquidation_buffer_bps: number;
      /**
       * @description Liquidation fee in basis points
       * @example 200
       */
      liquidation_fee_bps: number;
      /**
       * @description Dollar distance to liquidation formatted as USD
       * @example 0.50
       */
      margin_buffer_usd: string;
      /**
       * @description Dollar distance to liquidation in USD pips
       * @example 5000
       */
      margin_buffer_usd_pips: string;
    };
    CustomerPositionTiming: {
      /** @description Whether settlement is pending (market resolved or voided, settlement not yet executed) */
      is_settlement_pending: boolean;
      /** @description Whether the market was voided (closed with no winner, 50/50 payout at $0.50 per token) */
      is_voided: boolean;
      /**
       * @description ISO 8601 timestamp when market closes
       * @example 2025-01-20T12:00:00.000Z
       */
      market_close_time?: string;
      /**
       * @description Market status from the prediction market provider. When 'determined' or 'finalized', mark price reflects the settlement outcome ($1 or $0)
       * @example active
       * @enum {string}
       */
      market_status:
        | "active"
        | "amended"
        | "closed"
        | "determined"
        | "disputed"
        | "finalized"
        | "inactive"
        | "initialized";
      /**
       * @description Where this market sits on the road to settlement. `none` — still trading, nothing pending. `awaiting_resolution` — the market has closed and the outcome is decided, but the prediction market provider has not yet published the result on chain, so nothing can be redeemed yet. `settling` — the result is published and we are settling the position. `voided` — the market was voided and every token pays out at $0.50. `unresolved_upstream` — the market disappeared from the provider before publishing a result and may never resolve.
       * @example awaiting_resolution
       * @enum {string}
       */
      settlement_state: "awaiting_resolution" | "none" | "settling" | "unresolved_upstream" | "voided";
      /**
       * @description Minutes until market closes
       * @example 1440
       */
      time_to_close_minutes?: number;
    };
    CustomerOpenPosition: {
      /** @description Entry details */
      entry: components["schemas"]["CustomerPositionEntry"];
      /** @description Failure details if the position failed */
      failure?: components["schemas"]["CustomerPositionFailure"];
      /**
       * @description Position ID
       * @example dm_pos_abc123
       */
      id: string;
      /**
       * @description Prediction market provider
       * @enum {string}
       */
      provider: "polymarket";
      /**
       * @description Market side
       * @enum {string}
       */
      side: "yes" | "no";
      /**
       * @description Simplified position status. A position that was deleveraged almost entirely and then force-sold for a trivial remainder reports 'settled' once the market resolves against it. The 'status' query parameter still filters on the underlying mechanism, so such a position is returned by status=liquidated.
       * @enum {string}
       */
      status:
        | "pending"
        | "open"
        | "unwinding"
        | "closing"
        | "settling"
        | "closed"
        | "settled"
        | "liquidated"
        | "cancelled";
      /** @description Inline unwind history. Only present when the request includes `expand=unwinds`; omitted otherwise. */
      unwinds?: components["schemas"]["CustomerPositionUnwindList"] | null;
      /** @description Current position state */
      current: components["schemas"]["CustomerPositionCurrent"];
      /** @description Fee details for open position */
      fees: components["schemas"]["CustomerPositionOpenFees"];
      /** @description Risk metrics */
      risk: components["schemas"]["CustomerPositionRisk"];
      /** @description Timing information */
      timing: components["schemas"]["CustomerPositionTiming"];
      /**
       * @description Time-weighted average structural leverage in basis points over position lifetime (20000 = 2x)
       * @example 84000
       */
      effective_leverage_bps: number;
      /**
       * @description Market ticker identifier
       * @example TRUMP-2024-WIN
       */
      market_ticker: string;
      /** @description Market title */
      market_title?: string;
      /** @description On-chain position key (bytes32) for requestClose", example: "0xabc123... */
      on_chain_position_key: string;
      /**
       * @description Wallet address (Solana public key or EVM address)
       * @example 7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU
       */
      wallet_address: string;
      /** @description The committed-mode ladder this position was opened on: one row per planned unwind, each with a status of planned, triggered or superseded. Only present when the request includes `expand=planned_unwinds`; omitted otherwise, and empty on adaptive positions. */
      planned_unwinds?: components["schemas"]["CustomerPositionUnwindList"] | null;
      /**
       * @deprecated
       * @description Deprecated — use `pendingOperation` (a deferred close now surfaces as `{ type: 'close', phase: 'awaiting_settlement' }`). Details of a close request that could not complete and was deferred. Null unless the customer requested a close that is now waiting on market settlement to redeem the remaining tokens.
       */
      close_attempt?: components["schemas"]["CustomerCloseAttempt"] | null;
      /** @description The lifecycle operation currently in flight on this position, or null when the position is at rest. Survives reload (unlike the ephemeral websocket events), so a UI can show that a close / partial close / unwind / settle is in progress after re-fetching REST. */
      pending_operation?: components["schemas"]["CustomerPendingOperation"] | null;
    };
    CustomerPositionClosedFees: {
      /**
       * @description Lifetime fee APR in basis points
       * @example 500
       */
      lifetime_apr_bps: number;
      /**
       * @deprecated
       * @description Deprecated — use `entry.originationFeeBps`. Same value, kept for backwards compatibility.
       * @example 100
       */
      origination_fee_bps: number;
      /**
       * @deprecated
       * @description Deprecated — use `entry.protocolOriginationFeeBps`. Same value, kept for backwards compatibility.
       * @example 80
       */
      protocol_origination_fee_bps: number;
      /**
       * @deprecated
       * @description Deprecated — use `entry.partnerOriginationFeeBps`. Same value, kept for backwards compatibility.
       * @example 20
       */
      partner_origination_fee_bps: number;
      /**
       * @deprecated
       * @description Deprecated — use `entry.originationFeeUsd`. Same value, kept for backwards compatibility.
       * @example 0.05
       */
      origination_fee_usd: string;
      /**
       * @deprecated
       * @description Deprecated — use `entry.originationFeeUsdPips`. Same value, kept for backwards compatibility.
       * @example 500
       */
      origination_fee_usd_pips: string;
      /**
       * @description Total blended fees formatted as USD
       * @example 0.085
       */
      total_fees_usd: string;
      /**
       * @description Total blended fees (origination + lifetime + liquidation + venue) in USD pips
       * @example 850
       */
      total_fees_usd_pips: string;
      /**
       * @description Total lifetime fee formatted as USD
       * @example 0.015
       */
      total_lifetime_fee_usd: string;
      /**
       * @description Total lifetime fee collected in USD pips
       * @example 150
       */
      total_lifetime_fee_usd_pips: string;
      /**
       * @description Total venue (Polymarket) trading fees collected across the position lifetime (open + close/liquidation/settle + force-unwind), formatted as USD.
       * @example 0.02
       */
      total_venue_fee_usd: string;
      /**
       * @description Total venue trading fees collected across the position lifetime in USD pips.
       * @example 200
       */
      total_venue_fee_usd_pips: string;
    };
    CustomerPositionResult: {
      /**
       * @description ISO 8601 timestamp when position was closed
       * @example 2025-01-16T14:30:00.000Z
       */
      closed_at: string;
      /**
       * @description Collected lifetime fee formatted as USD
       * @example 0.015
       */
      collected_lifetime_fee_usd: string;
      /**
       * @description Collected lifetime fee in USD pips
       * @example 150
       */
      collected_lifetime_fee_usd_pips: string;
      /**
       * @description Collected liquidation fee formatted as USD
       * @example 0.00
       */
      collected_liquidation_fee_usd: string;
      /**
       * @description Collected liquidation fee in USD pips
       * @example 0
       */
      collected_liquidation_fee_usd_pips: string;
      /**
       * @description Volume-weighted notional realized across all unwinds and the final close, formatted as USD. Null for reverted or cancelled positions.
       * @example 5.25
       */
      exit_notional_usd?: string | null;
      /**
       * @description Exit notional in USD pips. Null for reverted or cancelled positions.
       * @example 52500
       */
      exit_notional_usd_pips?: string | null;
      /**
       * @description Realized PnL net of all fees (origination + lifetime + liquidation + venue) as return on equity in basis points
       * @example 1700
       */
      net_realized_pnl_bps: number;
      /**
       * @description Realized PnL net of all fees (origination + lifetime + liquidation + venue) formatted as USD
       * @example 0.435
       */
      net_realized_pnl_usd: string;
      /**
       * @description Realized PnL net of all fees (origination + lifetime + liquidation + venue) in USD pips (can be negative)
       * @example 4350
       */
      net_realized_pnl_usd_pips: string;
      /**
       * @description Proceeds formatted as USD
       * @example 3.00
       */
      proceeds_usd: string;
      /**
       * @description Proceeds returned to user in USD pips
       * @example 30000
       */
      proceeds_usd_pips: string;
      /**
       * @description Realized PnL formatted as USD
       * @example 0.50
       */
      realized_pnl_usd: string;
      /**
       * @description Realized PnL in USD pips (can be negative)
       * @example 5000
       */
      realized_pnl_usd_pips: string;
    };
    CustomerClosedPosition: {
      /** @description Entry details */
      entry: components["schemas"]["CustomerPositionEntry"];
      /** @description Failure details if the position failed */
      failure?: components["schemas"]["CustomerPositionFailure"];
      /**
       * @description Position ID
       * @example dm_pos_abc123
       */
      id: string;
      /**
       * @description Prediction market provider
       * @enum {string}
       */
      provider: "polymarket";
      /**
       * @description Market side
       * @enum {string}
       */
      side: "yes" | "no";
      /**
       * @description Simplified position status. A position that was deleveraged almost entirely and then force-sold for a trivial remainder reports 'settled' once the market resolves against it. The 'status' query parameter still filters on the underlying mechanism, so such a position is returned by status=liquidated.
       * @enum {string}
       */
      status:
        | "pending"
        | "open"
        | "unwinding"
        | "closing"
        | "settling"
        | "closed"
        | "settled"
        | "liquidated"
        | "cancelled";
      /** @description Inline unwind history. Only present when the request includes `expand=unwinds`; omitted otherwise. */
      unwinds?: components["schemas"]["CustomerPositionUnwindList"] | null;
      /** @description Fee details for closed position */
      fees: components["schemas"]["CustomerPositionClosedFees"];
      /** @description Position result/outcome */
      result: components["schemas"]["CustomerPositionResult"];
      /**
       * @description Time-weighted average structural leverage in basis points over position lifetime (20000 = 2x)
       * @example 84000
       */
      effective_leverage_bps: number;
      /**
       * @description Market ticker identifier
       * @example TRUMP-2024-WIN
       */
      market_ticker: string;
      /** @description Market title */
      market_title?: string;
      /** @description On-chain position key (bytes32) for requestClose", example: "0xabc123... */
      on_chain_position_key: string;
      /**
       * @description Wallet address (Solana public key or EVM address)
       * @example 7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU
       */
      wallet_address: string;
      /** @description The committed-mode ladder this position was opened on: one row per planned unwind, each with a status of planned, triggered or superseded. Only present when the request includes `expand=planned_unwinds`; omitted otherwise, and empty on adaptive positions. */
      planned_unwinds?: components["schemas"]["CustomerPositionUnwindList"] | null;
      /**
       * @description Reason the position was closed. Reports 'settled' for a position that was deleveraged almost entirely and then force-sold for a trivial remainder on a market that resolved against it.
       * @enum {string}
       */
      close_reason: "cancelled" | "closed" | "liquidated" | "reverted" | "settled";
      /**
       * @description Why the position was reverted before it opened. Non-null only when `close_reason` is `reverted`: `exchange_unavailable` (the prediction-market venue was temporarily unavailable — safe to retry), `slippage_exceeded` (price moved beyond tolerance before the order filled), or `unknown`.
       * @enum {string|null}
       */
      revert_reason?: "exchange_unavailable" | "slippage_exceeded" | "unknown" | null;
    };
    CustomerPartialClose: {
      /**
       * @description ISO 8601 timestamp when the partial close settled on-chain
       * @example 2026-07-01T14:59:28.000Z
       */
      executed_at: string;
      /**
       * @description Token units sold in this partial close (1000000 units = 1 token)
       * @example 94590000
       */
      sold_token_units: string;
      /**
       * @description Average realized sale price for this partial close, in USD pips (10000 = $1.00)
       * @example 2838
       */
      average_sale_price_usd_pips: string;
      /**
       * @description Average realized sale price formatted as USD
       * @example 0.28
       */
      average_sale_price_usd: string;
      /**
       * @description Gross sale proceeds received for the sold slice, in USD pips (10000 = $1.00)
       * @example 268468
       */
      sale_proceeds_usd_pips: string;
      /**
       * @description Gross sale proceeds formatted as USD
       * @example 26.85
       */
      sale_proceeds_usd: string;
      /**
       * @description Protocol capital repaid from the sale proceeds, in USD pips (10000 = $1.00)
       * @example 144859
       */
      capital_repaid_usd_pips: string;
      /**
       * @description Protocol capital repaid formatted as USD
       * @example 14.49
       */
      capital_repaid_usd: string;
      /**
       * @description Amount paid out to the position owner from the sale proceeds, in USD pips (10000 = $1.00)
       * @example 123608
       */
      user_payout_usd_pips: string;
      /**
       * @description Owner payout formatted as USD
       * @example 12.36
       */
      user_payout_usd: string;
      /**
       * @description Position token units still held after this partial close (1000000 units = 1 token)
       * @example 220720000
       */
      remaining_position_token_units: string;
      /**
       * @description Book leverage after this partial close in basis points (20000 = 2x). Null if not recorded on-chain.
       * @example 19999
       */
      new_leverage_bps: number | null;
    };
    CustomerPartialCloseList: {
      data: components["schemas"]["CustomerPartialClose"][];
      has_more: boolean;
      total_count?: number;
    };
    PositionTransactionEntry: {
      /**
       * @description On-chain hashes of the exchange (CLOB/DEX) fills nested under this transaction. Present only for transaction types that route through an exchange (open, close, liquidation, settle, force_unwind).
       * @example [
       *       "0xddc31a8f7d2e4c0b9a1e5f3c8b6d4a2e0f9c7b5a3d1e8f6c4b2a0d9e7f5c3b1a"
       *     ]
       */
      exchange_transaction_hashes?: string[];
      /**
       * @description On-chain transaction hash (EVM transaction hash or Solana signature).
       * @example 0xffe5e3d042e9bf100fd01ad7a8d4de5d7fd20632df62e319d50275673e42e410
       */
      transaction_hash: string;
    };
    PositionTransactionGroup: {
      /** @description The on-chain transactions in this group, in execution order. */
      transactions: components["schemas"]["PositionTransactionEntry"][];
    };
    PositionTransactions: {
      /** @description Transactions that cancelled the position before it opened. */
      cancel: components["schemas"]["PositionTransactionGroup"];
      /** @description Transactions that closed the position on chain, including the finalize-close transaction. */
      close: components["schemas"]["PositionTransactionGroup"];
      /** @description Transactions that liquidated the position on chain, including the finalize-liquidation transaction. */
      liquidation: components["schemas"]["PositionTransactionGroup"];
      /** @description Transactions that opened the position on chain, including the finalize-open transaction. */
      open: components["schemas"]["PositionTransactionGroup"];
      /** @description Transactions that redeemed settled position tokens on chain. */
      redemption: components["schemas"]["PositionTransactionGroup"];
      /** @description Transactions that reverted a failed open back to the protocol. */
      revert: components["schemas"]["PositionTransactionGroup"];
      /** @description Transactions that settled the position on chain, including the finalize-settle transaction. */
      settle: components["schemas"]["PositionTransactionGroup"];
      /** @description The close request transaction the position owner submitted on chain. */
      cancel_request: components["schemas"]["PositionTransactionGroup"];
      /** @description Transactions that force-unwound (deleveraged) the position on chain, including the finalize-unwind transaction. */
      force_unwind: components["schemas"]["PositionTransactionGroup"];
    };
    CustomerSampleEvents: {
      /**
       * @description Total number of events that will be delivered over the WebSocket connection.
       * @example 19
       */
      event_count: number;
      /**
       * @description Delay between two consecutive events, in milliseconds.
       * @example 1000
       */
      interval_ms: number;
    };
    CreateOfferBody: {
      /**
       * @description Leverage in basis points (20000 = 2x, 100000 = 10x). Must be divisible by 2500. Maximum 10x.
       * @example 50000
       */
      leverage_bps: number;
      /**
       * @description Market ticker
       * @example TRUMP-2024-WIN
       */
      market_ticker: string;
      /**
       * @description Notional amount in USD pips (10,000 pips = $1.00)
       * @example 50000
       */
      notional_amount_usd_pips: string;
      /**
       * @description Market side (yes or no)
       * @enum {string}
       */
      effective_side: "yes" | "no";
      /**
       * @description Maximum acceptable slippage in basis points (100 bps = 1%). Must be between 1% and 10%.
       * @example 200
       */
      slippage_bps: number;
      /**
       * @description Prediction market provider
       * @default polymarket
       * @example polymarket
       * @enum {string}
       */
      pm_provider: "kalshi" | "polymarket";
      /**
       * @description If true, the order may fill less than the requested notional (down to minFillBps) and the position opens at the actual fill size. If false or omitted, the order is atomic — fully filled or rejected.
       * @default false
       * @example true
       */
      allow_partial_fill: boolean;
      /**
       * @description Minimum fill the user will accept, in basis points. Only valid when allowPartialFill=true (rejected otherwise). Must be in [2000, 7000] and divisible by 500 (5% steps). Capped from below by max(2000, ceil(MIN_COLLATERAL × 10000 / requestedCollateral)).
       * @example 5000
       */
      min_fill_bps?: number;
      /**
       * @description Risk mode for the resulting position. adaptive: the live risk engine manages leverage. committed: the quote carries a fixed set of price-triggered unwinds and the user posts extra margin. A committed request is answered in committed mode or not at all — when the market, price or leverage rules the mode out, the quote is rejected with QUOTE_COMMITTED_RISK_MODE_UNAVAILABLE carrying the reason. Take a draft quote first to see whether the mode is on offer.
       * @default adaptive
       * @example committed
       * @enum {string}
       */
      risk_mode: "adaptive" | "committed";
    };
    CommittedUnwindUnavailableReason: {
      /**
       * @description Machine-readable reason committed mode cannot be offered for this quote
       * @example cryptoMarket
       * @enum {string}
       */
      code:
        | "cryptoMarket"
        | "illegibleMarginTooLarge"
        | "illegibleTooManyUnwinds"
        | "invertedRiskBands"
        | "lateGameSoccer"
        | "notOfferedOnDeskQuotes";
      /** @description Human-readable explanation of the same reason */
      message: string;
    };
    PlannedUnwind: {
      /**
       * @description Order in which this unwind fires, starting at 0
       * @example 0
       */
      sequence: number;
      /**
       * @description Price at which this unwind fires, in USD pips (10000 pips = $1)
       * @example 4200
       */
      trigger_price_usd_pips: string;
      /**
       * @description Book leverage the position is unwound to when this fires, in basis points (10000 = 1x)
       * @example 15000
       */
      target_leverage_bps: number;
      /**
       * @description Estimated token units sold to reach the target (1000000 units = 1 token). An estimate only — the executed amount depends on the fill.
       * @example 30000000
       */
      token_units_to_sell_estimate: string;
    };
    CommittedUnwinds: {
      /** @description Whether committed mode can be offered for this quote */
      available: boolean;
      /** @description Why committed mode is unavailable. Null when it is available. */
      unavailable_reason?: components["schemas"]["CommittedUnwindUnavailableReason"] | null;
      /**
       * @description Extra margin the user must post on top of collateral, in USDC units (1000000 units = 1 USDC)
       * @example 67000000
       */
      margin_required_usdc_units?: string | null;
      /**
       * @description Price at which selling the remaining tokens repays the loan in full, in USD pips
       * @example 2700
       */
      debt_clear_price_usd_pips?: string | null;
      /** @description The pre-committed unwinds, in the order they fire. Empty when committed mode is unavailable. */
      planned_unwinds?: components["schemas"]["PlannedUnwind"][] | null;
    };
    CustomerOfferMaxGain: {
      /**
       * @description Gross max gain (profit before fees) formatted as USD
       * @example 1.90
       */
      gross_max_gain_usd: string;
      /**
       * @description Gross max gain in USD pips (10000 pips = $1)
       * @example 19000
       */
      gross_max_gain_usd_pips: string;
      /**
       * @description Gross max gain in USDC units (1,000,000 units = 1 USDC). May be negative.
       * @example 1900000
       */
      gross_max_gain_usdc_units: string;
      /**
       * @description Net max gain (profit after fees) formatted as USD
       * @example 1.40
       */
      net_max_gain_usd: string;
      /**
       * @description Net max gain in USD pips (10000 pips = $1)
       * @example 14000
       */
      net_max_gain_usd_pips: string;
      /**
       * @description Net max gain in USDC units (1,000,000 units = 1 USDC). May be negative.
       * @example 1400000
       */
      net_max_gain_usdc_units: string;
    };
    CustomerOffer: {
      /**
       * @description Offer ID
       * @example dm_off_abc123
       */
      id: string;
      /**
       * @description Prediction market provider
       * @enum {string}
       */
      provider: "polymarket";
      /**
       * @description Wallet address (Solana public key or EVM address)
       * @example 7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU
       */
      authority_public_key: string;
      /**
       * @description Current liquidation price formatted as USD
       * @example 0.35
       */
      current_liquidation_price_usd: string;
      /**
       * @description Current liquidation price in USD pips (10000 pips = $1). Position will be liquidated if market price reaches this level.
       * @example 3500
       */
      current_liquidation_price_usd_pips: string;
      /**
       * @description Entry price on the offer's effective side, formatted as USD
       * @example 0.50
       */
      entry_price_usd: string;
      /**
       * @description Entry price on the offer's effective side, in USD pips (10000 pips = $1)
       * @example 5000
       */
      entry_price_usd_pips: string;
      /**
       * @description Collateral in USDC units (1,000,000 units = 1 USDC). Contract-ready value for createPosition.
       * @example 2500000
       */
      collateral_usdc_units: string;
      /**
       * @description Chain ID for EVM signature
       * @example 137
       */
      evm_chain_id: string;
      /**
       * @description On-chain bytes32 Polymarket market identifier
       * @example 0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890
       */
      polymarket_market_id: string;
      /** @description EIP-191 signature for contract create position */
      contract_signature: string;
      /**
       * @description Polymarket ERC1155 conditional token ID for the selected side
       * @example 52114319501245915516055106046884209969926127482827954674443846427813813222426
       */
      polymarket_token_id: string;
      /**
       * @description Vault contract address on Polygon
       * @example 0x1234567890123456789012345678901234567890
       */
      polygon_vault_contract_address: string;
      /**
       * @description Vault function this quote's signature authorizes. createPositionWithMargin for committed quotes, createPosition otherwise. A signature for one will not authorize the other.
       * @example createPosition
       * @enum {string}
       */
      polygon_vault_function_name: "createPosition" | "createPositionWithMargin";
      /**
       * @description Risk mode this quote was issued in. A committed request is answered in committed mode or rejected, so this only reports adaptive when adaptive was asked for.
       * @example adaptive
       * @enum {string}
       */
      risk_mode: "adaptive" | "committed";
      /** @description Committed-unwind mode for this quote: the pre-committed unwinds and the extra margin they require, or the reason the mode cannot be offered. */
      committed_unwinds?: components["schemas"]["CommittedUnwinds"];
      /**
       * @description Extra margin locked in the vault on top of collateral, in USDC units (1,000,000 units = 1 USDC). Zero on adaptive quotes. Included in totalUserAmountUsdcUnits.
       * @example 0
       */
      margin_usdc_units: string;
      /**
       * @description Expected trading fee formatted as USD
       * @example 0.02
       */
      expected_open_trading_fee_usd: string;
      /**
       * @description Expected trading fee in USD pips
       * @example 225
       */
      expected_open_trading_fee_usd_pips: string;
      /**
       * @description Expected open trading fee in USDC units (1,000,000 units = 1 USDC). Contract-ready value.
       * @example 20000
       */
      expected_open_trading_fee_usdc_units: string;
      /**
       * @description ISO 8601 timestamp when offer expires
       * @example 2025-01-15T10:35:00.000Z
       */
      expires_at: string;
      /**
       * @description Leverage in basis points (20000 = 2x)
       * @example 20000
       */
      leverage_bps: number;
      /**
       * @description Lifetime fee APR in basis points
       * @example 2000
       */
      lifetime_fee_apr_bps: number;
      /**
       * @description Liquidation fee in basis points
       * @example 250
       */
      liquidation_fee_bps: number;
      /**
       * @description Market ticker identifier
       * @example TRUMP-2024-WIN
       */
      market_ticker: string;
      /**
       * @description Minimum expected position tokens after accounting for slippage (1000000 units = 1 token)
       * @example 9900000
       */
      min_expected_position_token_units: string;
      /**
       * @description Notional amount formatted as USD
       * @example 5.00
       */
      notional_amount_usd: string;
      /**
       * @description Notional amount in USD pips (10000 pips = $1)
       * @example 50000
       */
      notional_amount_usd_pips: string;
      /**
       * @description Notional amount in USDC units (1,000,000 units = 1 USDC). Contract-ready value for createPosition.
       * @example 5000000
       */
      notional_usdc_units: string;
      /**
       * @description Origination fee in basis points
       * @example 100
       */
      origination_fee_bps: number;
      /**
       * @description Origination fee formatted as USD
       * @example 0.05
       */
      origination_fee_usd: string;
      /**
       * @description Origination fee in USD pips
       * @example 500
       */
      origination_fee_usd_pips: string;
      /**
       * @description Origination fee in USDC units (1,000,000 units = 1 USDC). Contract-ready value; on Polymarket the contract pulls collateral + originationFee from the user at createPosition.
       * @example 50000
       */
      origination_fee_usdc_units: string;
      /**
       * @description Protocol component of the origination fee in basis points. `protocolOriginationFeeBps + partnerOriginationFeeBps === originationFeeBps`.
       * @example 100
       */
      protocol_origination_fee_bps: number;
      /**
       * @description Protocol component of the origination fee formatted as USD
       * @example 0.04
       */
      protocol_origination_fee_usd: string;
      /**
       * @description Protocol component of the origination fee in USD pips (10000 pips = $1)
       * @example 400
       */
      protocol_origination_fee_usd_pips: string;
      /**
       * @description Protocol component of the origination fee in USDC units (1,000,000 units = 1 USDC).
       * @example 40000
       */
      protocol_origination_fee_usdc_units: string;
      /**
       * @description Partner component of the origination fee in basis points. `protocolOriginationFeeBps + partnerOriginationFeeBps === originationFeeBps`.
       * @example 25
       */
      partner_origination_fee_bps: number;
      /**
       * @description Partner component of the origination fee formatted as USD
       * @example 0.01
       */
      partner_origination_fee_usd: string;
      /**
       * @description Partner component of the origination fee in USD pips (10000 pips = $1)
       * @example 100
       */
      partner_origination_fee_usd_pips: string;
      /**
       * @description Partner component of the origination fee in USDC units (1,000,000 units = 1 USDC).
       * @example 10000
       */
      partner_origination_fee_usdc_units: string;
      /**
       * @description Polymarket venue trading fee rate in basis points. Applied to expectedOpenTradingFeeUsdcUnits.
       * @example 100
       */
      polymarket_trading_fee_bps: number;
      /**
       * @description Partner trading fee rate in basis points — the partner's Polymarket builder fee, a flat percentage of the traded notional included in expectedOpenTradingFeeUsdcUnits. `0` when the partner has no builder fee.
       * @example 100
       */
      partner_trading_fee_bps: number;
      /**
       * @description Partner trading fee formatted as USD
       * @example 0.50
       */
      partner_trading_fee_usd: string;
      /**
       * @description Partner trading fee in USD pips (10000 pips = $1)
       * @example 5000
       */
      partner_trading_fee_usd_pips: string;
      /**
       * @description Partner trading fee in USDC units (1,000,000 units = 1 USDC), included in expectedOpenTradingFeeUsdcUnits.
       * @example 500000
       */
      partner_trading_fee_usdc_units: string;
      /**
       * @description Position seed for on-chain account derivation
       * @example abc123
       */
      position_seed: string;
      /**
       * @description Position seed as 0x-prefixed bytes16 hex. Contract-ready value for createPosition.
       * @example 0xa1b2c3d4e5f67890abcdef1234567890
       */
      position_seed_hex: string;
      /**
       * @description On-chain position key (bytes32) that will be derived when the position is created. Matches on_chain_position_key on the position response — use it to link an offer to its future position.
       * @example 0x1a2b3c4d5e6f7890abcdef1234567890abcdef1234567890abcdef1234567890
       */
      on_chain_position_key: string;
      /**
       * @description Market side (yes or no)
       * @enum {string}
       */
      effective_side: "yes" | "no";
      /** @description Unix timestamp when signature expires */
      signature_expiry: string;
      /**
       * @description Slippage tolerance in basis points
       * @example 200
       */
      slippage_bps: number;
      /**
       * @description Whether the user opted into partial fills. When true, the position may open at less than the requested notional (down to minFillBps). When false or omitted, the order is atomic — fully filled or rejected.
       * @example true
       */
      allow_partial_fill?: boolean;
      /**
       * @description Minimum fill the user accepted in basis points. Only meaningful when allowPartialFill=true. Capped from below by max(2000, ceil(MIN_COLLATERAL × 10000 / requestedCollateral)).
       * @example 5000
       */
      min_fill_bps?: number;
      /** @description Base64-encoded Solana transaction (present for Solana markets only) */
      swap_transaction?: string;
      /** @description Expected maximum gain on a win (profit over principal). Only present when the request includes `expand=max_gain`; omitted otherwise. Assumes settlement at $1.00 (no exit trading fee) and excludes time-based lifetime fees, so it is an upper bound. */
      max_gain?: components["schemas"]["CustomerOfferMaxGain"];
      /**
       * @description Total amount user must provide formatted as USD
       * @example 2.73
       */
      total_user_amount_usd: string;
      /**
       * @description Total amount user must provide in USD pips
       * @example 27250
       */
      total_user_amount_usd_pips: string;
      /**
       * @description Total amount user must transfer at position creation in USDC units (1,000,000 units = 1 USDC). Contract-ready value = collateral + originationFee + expected open trading fee + committed-mode margin.
       * @example 2730000
       */
      total_user_amount_usdc_units: string;
    };
    PromoteOfferBody: {
      /**
       * @description Risk mode for the promoted offer. The draft carries the committed unwinds it was quoted with; this chooses whether the promoted offer opens on them. Omitted means adaptive.
       * @default adaptive
       * @example committed
       * @enum {string}
       */
      risk_mode: "adaptive" | "committed";
    };
  };
  responses: never;
  parameters: never;
  requestBodies: never;
  headers: never;
  pathItems: never;
}
export type $defs = Record<string, never>;
export interface operations {
  CustomerAuthController_createToken: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody: {
      content: {
        "application/json": components["schemas"]["CreateTokenBody"];
      };
    };
    responses: {
      201: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["CreateTokenResult"];
        };
      };
    };
  };
  CustomerContractInfoController_getContractInfo: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["CustomerContractInfo"];
        };
      };
    };
  };
  CustomerFeeController_getFeeRates: {
    parameters: {
      query?: {
        /** @description Market ticker. When provided, the response includes that market's venue fee fields. */
        ticker?: string;
      };
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["CustomerFeeRates"];
        };
      };
    };
  };
  CustomerFeeController_createFeeReport: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody: {
      content: {
        "application/json": components["schemas"]["FeeReportBody"];
      };
    };
    responses: {
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["CustomerFeeReport"];
        };
      };
    };
  };
  CustomerLimitController_getPartnerLimits: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["CustomerLimit"];
        };
      };
    };
  };
  CustomerLimitController_getUserLimits: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["CustomerLimit"];
        };
      };
    };
  };
  CustomerMarketController_listMarkets: {
    parameters: {
      query?: {
        /** @description Maximum number of results to return (1-100) */
        limit?: number;
        /** @description Cursor for forward pagination. Mutually exclusive with endingBefore. */
        starting_after?: string;
        /** @description Cursor for backward pagination. Mutually exclusive with startingAfter. */
        ending_before?: string;
        /** @description Comma-separated list of additional fields to include in the response. Allowed values: total_count, prices. */
        expand?: string;
        /** @description Sort order for results. 'ticker_asc' sorts alphabetically, 'depth_desc' sorts by market depth (largest first), 'discovered_at_desc' sorts by discovery date (newest markets first). */
        sort?: "ticker_asc" | "depth_desc" | "discovered_at_desc";
        /** @description Filter for markets currently accepting new positions */
        accepting_new_positions?: boolean;
        /** @description Filter markets by category */
        category?: "crypto" | "sport";
        /** @description Filter markets by prediction market provider */
        provider?: "polymarket";
        /** @description Filter markets by status */
        status?: "active" | "closed" | "determined" | "finalized" | "disputed";
        /** @description Free-text search query matched against market ticker and title */
        query?: string;
      };
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": {
            data: components["schemas"]["CustomerMarket"][];
            has_more: boolean;
            /** @description Total matching records. Present only when expand=total_count. */
            total_count?: number;
          };
        };
      };
    };
  };
  CustomerMarketController_searchMarkets: {
    parameters: {
      query: {
        /** @description Maximum number of results to return (1-100) */
        limit?: number;
        /** @description Cursor for forward pagination. Mutually exclusive with endingBefore. */
        starting_after?: string;
        /** @description Cursor for backward pagination. Mutually exclusive with startingAfter. */
        ending_before?: string;
        /** @description Comma-separated list of additional fields to include in the response. Allowed values: total_count, prices. */
        expand?: string;
        /** @description Sort order for results. 'ticker_asc' sorts alphabetically, 'depth_desc' sorts by market depth (largest first), 'discovered_at_desc' sorts by discovery date (newest markets first). */
        sort?: "ticker_asc" | "depth_desc" | "discovered_at_desc";
        /** @description Filter for markets currently accepting new positions */
        accepting_new_positions?: boolean;
        /** @description Filter markets by category */
        category?: "crypto" | "sport";
        /** @description Filter markets by prediction market provider */
        provider?: "polymarket";
        /** @description Filter markets by status */
        status?: "active" | "closed" | "determined" | "finalized" | "disputed";
        /** @description Free-text search query matched against market ticker and title */
        query: string;
      };
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": {
            data: components["schemas"]["CustomerMarket"][];
            has_more: boolean;
            /** @description Total matching records. Present only when expand=total_count. */
            total_count?: number;
          };
        };
      };
    };
  };
  CustomerMarketController_getMarketByTicker: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        /** @description Market ticker identifier */
        ticker: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["CustomerMarket"];
        };
      };
    };
  };
  CustomerPositionController_listPositions: {
    parameters: {
      query?: {
        /** @description Maximum number of results to return (1-100) */
        limit?: number;
        /** @description Cursor for forward pagination. Mutually exclusive with endingBefore. */
        starting_after?: string;
        /** @description Cursor for backward pagination. Mutually exclusive with startingAfter. */
        ending_before?: string;
        /** @description Comma-separated list of additional fields to include in the response. Allowed values: unwinds, planned_unwinds, total_count. */
        expand?: string;
        /** @description Field to sort positions by */
        sort_by?: "created_at" | "closed_at";
        /** @description Sort direction */
        sort_direction?: "asc" | "desc";
        /** @description Filter positions by a single status. Mutually exclusive with `state`. */
        status?: "open" | "unwinding" | "pending" | "closing" | "closed" | "settled" | "liquidated";
        /** @description Filter positions by lifecycle group: `active` (open + unwinding + pending + closing + settling) or `inactive` (closed + settled + liquidated + cancelled). Mutually exclusive with `status`. */
        state?: "active" | "inactive";
        /** @description Filter positions by market ticker */
        ticker?: string;
        /** @description Filter positions by on-chain position token id */
        token_id?: string;
      };
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": {
            data: (components["schemas"]["CustomerOpenPosition"] | components["schemas"]["CustomerClosedPosition"])[];
            has_more: boolean;
            /** @description Total matching records. Present only when expand=total_count. */
            total_count?: number;
          };
        };
      };
    };
  };
  CustomerSampleEventController_createSampleEvents: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      202: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["CustomerSampleEvents"];
        };
      };
    };
  };
  CustomerOfferController_createOffer: {
    parameters: {
      query?: {
        /** @description Comma-separated list of additional fields to include in the response. Allowed values: max_gain. */
        expand?: string;
      };
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody: {
      content: {
        "application/json": components["schemas"]["CreateOfferBody"];
      };
    };
    responses: {
      201: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["CustomerOffer"];
        };
      };
    };
  };
  CustomerOfferController_createDraftOffer: {
    parameters: {
      query?: {
        /** @description Comma-separated list of additional fields to include in the response. Allowed values: max_gain. */
        expand?: string;
      };
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody: {
      content: {
        "application/json": components["schemas"]["CreateOfferBody"];
      };
    };
    responses: {
      201: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["CustomerOffer"];
        };
      };
    };
  };
  CustomerOfferController_createQuote: {
    parameters: {
      query?: {
        /** @description Comma-separated list of additional fields to include in the response. Allowed values: max_gain. */
        expand?: string;
      };
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody: {
      content: {
        "application/json": components["schemas"]["CreateOfferBody"];
      };
    };
    responses: {
      201: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["CustomerOffer"];
        };
      };
    };
  };
  CustomerOfferController_createDraftQuote: {
    parameters: {
      query?: {
        /** @description Comma-separated list of additional fields to include in the response. Allowed values: max_gain. */
        expand?: string;
      };
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody: {
      content: {
        "application/json": components["schemas"]["CreateOfferBody"];
      };
    };
    responses: {
      201: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["CustomerOffer"];
        };
      };
    };
  };
  CustomerPositionController_getPositionById: {
    parameters: {
      query?: {
        /** @description Comma-separated list of related sub-resources to embed inline in the response. Allowed values: unwinds, planned_unwinds. */
        expand?: string;
      };
      header?: never;
      path: {
        /** @description Position identifier */
        position_id: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json":
            | components["schemas"]["CustomerOpenPosition"]
            | components["schemas"]["CustomerClosedPosition"];
        };
      };
    };
  };
  CustomerPartialCloseHistoryController_listPartialCloses: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        /** @description Position identifier */
        position_id: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["CustomerPartialCloseList"];
        };
      };
    };
  };
  CustomerPositionTransactionsController_listPositionTransactions: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        /** @description Position identifier */
        position_id: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["PositionTransactions"];
        };
      };
    };
  };
  CustomerPositionUnwindController_listPositionUnwinds: {
    parameters: {
      query?: {
        /** @description Which unwinds to return. executed (default): only unwinds that already happened. planned: the committed-mode ladder — every rung the position was opened on, whatever its own status (planned, triggered or superseded), not only the rungs whose status is planned. all: both, ladder rows last. */
        status?: "executed" | "planned" | "all";
      };
      header?: never;
      path: {
        /** @description Position identifier */
        position_id: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["CustomerPositionUnwindList"];
        };
      };
    };
  };
  CustomerOfferController_createPromotedQuote: {
    parameters: {
      query?: {
        /** @description Comma-separated list of additional fields to include in the response. Allowed values: max_gain. */
        expand?: string;
      };
      header?: never;
      path: {
        draft_offer_id: string;
      };
      cookie?: never;
    };
    requestBody: {
      content: {
        "application/json": components["schemas"]["PromoteOfferBody"];
      };
    };
    responses: {
      201: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["CustomerOffer"];
        };
      };
    };
  };
  CustomerOfferController_createPromotedOffer: {
    parameters: {
      query?: {
        /** @description Comma-separated list of additional fields to include in the response. Allowed values: max_gain. */
        expand?: string;
      };
      header?: never;
      path: {
        draft_offer_id: string;
      };
      cookie?: never;
    };
    requestBody: {
      content: {
        "application/json": components["schemas"]["PromoteOfferBody"];
      };
    };
    responses: {
      201: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["CustomerOffer"];
        };
      };
    };
  };
}
