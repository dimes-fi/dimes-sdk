export { DimesClient } from "./dimes-client";

export type {
  DimesClientOptions,
  GetFeeRatesParams,
  GetMarketsParams,
  GetPositionsParams,
  MarketExpand,
  MarketSort,
  PositionStatus,
  // eslint-disable-next-line @typescript-eslint/no-deprecated -- back-compat re-export of deprecated type
  SearchMarketsParams,
} from "./dimes-client";

export { ApiKeyAuth, JwtAuth } from "./auth";

export type { AuthProvider, ApiKeyAuthOptions, JwtAuthOptions } from "./auth";
