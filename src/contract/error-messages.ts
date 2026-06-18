import {
  BaseError,
  ContractFunctionRevertedError,
  ContractFunctionExecutionError,
  UserRejectedRequestError,
  formatUnits,
} from "viem";
import { DimesContractError } from "../errors/dimes-error";

const USDC_DECIMALS = 6;
const BPS_PER_PCT = 100;

const fmtUsdc = (v: unknown): string => (typeof v === "bigint" ? `${formatUnits(v, USDC_DECIMALS)} USDC` : String(v));

const BPS_DECIMAL_PLACES = 2;

const fmtBps = (v: unknown): string => {
  if (typeof v === "bigint") {
    return `${(Number(v) / BPS_PER_PCT).toFixed(BPS_DECIMAL_PLACES)}%`;
  }
  if (typeof v === "number") {
    return `${(v / BPS_PER_PCT).toFixed(BPS_DECIMAL_PLACES)}%`;
  }
  return String(v);
};

type Formatter = (args: readonly unknown[] | undefined) => string;

/* eslint-disable no-magic-numbers -- array-length guards on contract error args */
const friendlyByErrorName: Record<string, Formatter> = {
  InvalidSignature: () => "Quote signature is invalid. Refresh and try again.",
  SignatureExpired: () => "Quote has expired. Refresh and try again.",
  TokenIdMismatch: () => "Quote token mismatch. Refresh and try again.",

  InsufficientCapital: () => "Pool is short on capital right now. Try a smaller size.",
  UserCapitalExceeded: (a) =>
    a && a.length >= 4
      ? `You'd exceed your account cap of ${fmtUsdc(a[3])} (current ${fmtUsdc(a[1])}, requested ${fmtUsdc(a[2])}).`
      : "You'd exceed your account capital cap.",
  MarketCapitalExceeded: (a) =>
    a && a.length >= 4
      ? `Market is at capacity (cap ${fmtUsdc(a[3])}, requested ${fmtUsdc(a[2])}).`
      : "Market is at capacity.",
  TotalCapitalExceeded: (a) =>
    a && a.length >= 3
      ? `Protocol is at capacity (cap ${fmtUsdc(a[2])}, requested ${fmtUsdc(a[1])}).`
      : "Protocol is at capacity.",
  TokenCapitalExceeded: () => "This outcome is at capacity.",

  InvalidLeverage: (a) => (a && a.length >= 1 ? `Invalid leverage (${fmtBps(a[0])}).` : "Invalid leverage."),
  CollateralBelowMinimum: (a) =>
    a && a.length >= 2
      ? `Collateral ${fmtUsdc(a[0])} is below the minimum of ${fmtUsdc(a[1])}.`
      : "Collateral is below the minimum.",
  InvalidCollateral: (a) =>
    a && a.length >= 1 ? `Invalid collateral amount (${fmtUsdc(a[0])}).` : "Invalid collateral amount.",
  InvalidNotional: (a) => (a && a.length >= 1 ? `Invalid notional (${fmtUsdc(a[0])}).` : "Invalid notional."),
  ZeroAmount: () => "Amount cannot be zero.",
  ZeroAddress: () => "Address cannot be zero.",

  PositionAlreadyExists: () => "A position with this seed already exists.",
  PositionNotFound: () => "Position not found.",
  PositionAlreadyFinalized: () => "Position is already finalized.",
  InvalidPositionState: () => "Position is in the wrong state for this action.",
  NotPositionOwner: () => "You're not the owner of this position.",

  NewPositionsPaused: () => "New positions are paused.",
  UserActionsPaused: () => "User actions are temporarily paused.",
  EmergencyOnlyMode: () => "Protocol is in emergency-only mode.",
  ServerHalted: () => "Protocol is halted. Try again later.",

  NoTokensToClose: () => "Position has no tokens to close.",
  InvalidProceeds: () => "Invalid proceeds amount.",
  InvalidMarketOutcome: () => "Invalid market outcome.",
  InvalidTokensToSell: () => "Invalid token amount to sell.",
  InvalidTargetLeverage: () => "Target leverage must be lower than current.",

  CancelDelayNotElapsed: () => "Cancel delay has not elapsed yet.",
  CancelDelayTooLong: () => "Cancel delay exceeds the maximum allowed.",

  SafeERC20FailedOperation: () => "Token transfer failed.",
  UnauthorizedTokenSender: () => "Unauthorized token sender.",
  CannotRescueOperationalToken: () => "Cannot rescue operational tokens.",

  ERC20InsufficientBalance: () => "Insufficient USDC balance.",
  ERC20InsufficientAllowance: () => "Insufficient USDC allowance. Approve and try again.",
};
/* eslint-enable no-magic-numbers */

const friendlyBySelector: Record<string, string> = {
  "0xe450d38c": "Insufficient USDC balance.",
  "0xfb8f41b2": "Insufficient USDC allowance. Approve and try again.",
  "0x96c6fd1e": "Invalid token sender (zero address).",
  "0xec442f05": "Invalid token receiver (zero address).",
  "0xe602df05": "Invalid token approver (zero address).",
  "0x94280d62": "Invalid spender (zero address).",
  "0x03dee4c5": "Insufficient token balance for transfer.",
  "0x01a83514": "Invalid ERC-1155 sender (zero address).",
  "0x57f447ce": "Invalid ERC-1155 receiver.",
  "0xe237d922": "Missing ERC-1155 approval.",
  "0x3e31884e": "Invalid ERC-1155 approver (zero address).",
  "0xced3e100": "Invalid ERC-1155 operator (zero address).",
  "0x5b059991": "ERC-1155 array length mismatch.",
};

const HEX_SELECTOR_LENGTH = 10;

function humanizeName(name: string): string {
  const spaced = name.replace(/([a-z0-9])([A-Z])/g, "$1 $2");
  return spaced.charAt(0).toUpperCase() + spaced.slice(1);
}

function firstLine(s: string): string {
  const i = s.indexOf("\n");
  return (i === -1 ? s : s.slice(0, i)).trim();
}

// eslint-disable-next-line complexity
export function formatContractError(err: unknown): DimesContractError {
  if (!err) {
    return new DimesContractError("unknown", "Transaction failed.");
  }

  if (err instanceof BaseError) {
    const rejected = err.walk((e) => e instanceof UserRejectedRequestError);
    if (rejected) {
      return new DimesContractError("UserRejected", "Transaction rejected in wallet.");
    }

    const reverted = err.walk(
      (e) => e instanceof ContractFunctionRevertedError,
    ) as ContractFunctionRevertedError | null;
    if (reverted) {
      const errorName = reverted.data?.errorName;
      const args = reverted.data?.args;
      if (errorName) {
        const fmt = friendlyByErrorName[errorName];
        const message = fmt ? fmt(args) : humanizeName(errorName);
        return new DimesContractError(errorName, message);
      }
      const raw = reverted.raw;
      const selector = raw && raw.length >= HEX_SELECTOR_LENGTH ? raw.slice(0, HEX_SELECTOR_LENGTH) : undefined;
      const selectorMessage = selector ? friendlyBySelector[selector] : undefined;
      return new DimesContractError(
        selector ?? "unknown_revert",
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        selectorMessage ?? reverted.shortMessage ?? "Contract reverted.",
      );
    }

    const exec = err.walk((e) => e instanceof ContractFunctionExecutionError) as ContractFunctionExecutionError | null;
    if (exec?.shortMessage) {
      return new DimesContractError("execution_error", firstLine(exec.shortMessage));
    }

    if (err.shortMessage) {
      return new DimesContractError("base_error", firstLine(err.shortMessage));
    }
    return new DimesContractError("base_error", firstLine(err.message));
  }

  if (err instanceof Error) {
    return new DimesContractError("error", firstLine(err.message));
  }
  return new DimesContractError("unknown", "Transaction failed.");
}
