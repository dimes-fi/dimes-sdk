import {
  BaseError,
  ContractFunctionRevertedError,
  ContractFunctionExecutionError,
  UserRejectedRequestError,
} from "viem";
import { describe, it, expect } from "vitest";
import { formatContractError } from "../src/contract/error-messages";
import { DimesContractError } from "../src/errors/dimes-error";

// Helper to create a ContractFunctionRevertedError-like object that viem's walk() will find.
// viem's BaseError.walk checks instanceof, so we need real class instances.

function makeRevertedError(errorName: string, args?: readonly unknown[], raw?: string) {
  // ContractFunctionRevertedError needs specific construction.
  // We'll create a BaseError that wraps a properly shaped revert error.
  const revertError = Object.create(ContractFunctionRevertedError.prototype) as ContractFunctionRevertedError;
  Object.defineProperty(revertError, "data", {
    value: { errorName, args },
    configurable: true,
  });
  Object.defineProperty(revertError, "raw", {
    value: raw,
    configurable: true,
  });
  Object.defineProperty(revertError, "message", {
    value: `Contract function reverted: ${errorName}`,
    configurable: true,
  });
  Object.defineProperty(revertError, "name", {
    value: "ContractFunctionRevertedError",
    configurable: true,
  });

  // Wrap in a BaseError so walk() works
  const base = new BaseError(`Contract call reverted`, { cause: revertError });
  return base;
}

function makeRevertedBySelector(selector: string) {
  const revertError = Object.create(ContractFunctionRevertedError.prototype) as ContractFunctionRevertedError;
  Object.defineProperty(revertError, "data", {
    value: { errorName: undefined, args: undefined },
    configurable: true,
  });
  Object.defineProperty(revertError, "raw", {
    value: selector,
    configurable: true,
  });
  Object.defineProperty(revertError, "message", {
    value: "Unknown contract error",
    configurable: true,
  });
  Object.defineProperty(revertError, "shortMessage", {
    value: "Unknown contract error",
    configurable: true,
  });
  Object.defineProperty(revertError, "name", {
    value: "ContractFunctionRevertedError",
    configurable: true,
  });

  return new BaseError("Contract call reverted", { cause: revertError });
}

describe("formatContractError", () => {
  it("known error name produces friendly message", () => {
    const err = makeRevertedError("InvalidSignature");
    const result = formatContractError(err);
    expect(result).toBeInstanceOf(DimesContractError);
    expect(result.code).toBe("InvalidSignature");
    expect(result.message).toBe("Quote signature is invalid. Refresh and try again.");
  });

  it("known error name with args (UserCapitalExceeded with 4 bigint args)", () => {
    const err = makeRevertedError("UserCapitalExceeded", [
      0n, // arg0 (unused in message)
      1000000n, // current
      500000n, // requested
      2000000n, // cap
    ]);
    const result = formatContractError(err);
    expect(result.code).toBe("UserCapitalExceeded");
    expect(result.message).toContain("2 USDC"); // cap
    expect(result.message).toContain("1 USDC"); // current
    expect(result.message).toContain("0.5 USDC"); // requested
  });

  it("unknown error name produces humanized name", () => {
    const err = makeRevertedError("SomeNewWeirdError");
    const result = formatContractError(err);
    expect(result.code).toBe("SomeNewWeirdError");
    expect(result.message).toBe("Some New Weird Error");
  });

  it("known selector produces friendly message", () => {
    // 0xe450d38c = ERC20InsufficientBalance selector
    const err = makeRevertedBySelector("0xe450d38c");
    const result = formatContractError(err);
    expect(result.message).toBe("Insufficient USDC balance.");
  });

  it("UserRejectedRequestError produces 'Transaction rejected in wallet.'", () => {
    const rejection = Object.create(UserRejectedRequestError.prototype) as UserRejectedRequestError;
    Object.defineProperty(rejection, "message", { value: "User rejected", configurable: true });
    Object.defineProperty(rejection, "name", { value: "UserRejectedRequestError", configurable: true });

    const err = new BaseError("User rejected the request.", { cause: rejection });
    const result = formatContractError(err);
    expect(result.code).toBe("UserRejected");
    expect(result.message).toBe("Transaction rejected in wallet.");
  });

  it("ContractFunctionExecutionError uses shortMessage", () => {
    const execError = Object.create(ContractFunctionExecutionError.prototype) as ContractFunctionExecutionError;
    Object.defineProperty(execError, "shortMessage", {
      value: "Execution reverted for an unknown reason.",
      configurable: true,
    });
    Object.defineProperty(execError, "message", {
      value: "Long detailed message\nwith multiple lines",
      configurable: true,
    });
    Object.defineProperty(execError, "name", {
      value: "ContractFunctionExecutionError",
      configurable: true,
    });

    const err = new BaseError("Execution failed", { cause: execError });
    const result = formatContractError(err);
    expect(result.code).toBe("execution_error");
    expect(result.message).toBe("Execution reverted for an unknown reason.");
  });

  it("non-viem Error uses error message", () => {
    const err = new Error("Something went wrong on-chain");
    const result = formatContractError(err);
    expect(result).toBeInstanceOf(DimesContractError);
    expect(result.code).toBe("error");
    expect(result.message).toBe("Something went wrong on-chain");
  });

  it("non-error input returns 'Transaction failed.'", () => {
    const result = formatContractError(null);
    expect(result).toBeInstanceOf(DimesContractError);
    expect(result.message).toBe("Transaction failed.");

    const result2 = formatContractError(undefined);
    expect(result2.message).toBe("Transaction failed.");
  });
});
