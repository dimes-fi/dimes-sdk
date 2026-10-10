export { vaultAbi, erc20Abi } from "./abi";

export { toHex, toAddress } from "./evm";

export type { Hex, Address } from "./evm";

export { buildCreatePositionTx, buildApproveTx, buildRequestCloseTx, buildRequestPartialCloseTx } from "./build-tx";

export type {
  CreatePositionTxData,
  CreatePositionWithMarginTxData,
  CreatePositionWithVersionTxData,
  CreatePositionWithMarginAndVersionTxData,
  OpenPositionTxData,
  ApproveTxData,
  RequestCloseTxData,
  RequestPartialCloseTxData,
} from "./build-tx";

export { isCommittedQuote } from "./risk-mode";

export { isProtocolV2Quote, polymarketProtocolVersions } from "./protocol-version";

export {
  depositWalletFactoryAddress,
  polymarketRelayerBaseUrl,
  depositWalletBatchTypes,
  buildPushFundedCreateCalls,
  buildRequestCloseCalls,
  buildRequestPartialCloseCalls,
  buildDepositWalletBatch,
  getDepositWalletBatchTypedData,
  buildRelayerSubmitPayload,
  buildRelayerAuthHeaders,
} from "./deposit-wallet";

export type { DepositWalletCall, DepositWalletBatch } from "./deposit-wallet";

export {
  recoverCreatePositionSigner,
  resolveExpectedSigner,
  assertQuoteSigner,
  verifyQuoteSignature,
  getCachedContractInfo,
} from "./verify-signature";

export { buildVerifiedCreatePositionTx, buildVerifiedPushFundedCreateCalls } from "./verified-build";

// eslint-disable-next-line @typescript-eslint/no-deprecated -- re-export of intentional back-compat alias
export { verifyOfferSignature } from "./verify-signature";

export { formatContractError } from "./error-messages";
