import { describe, it, expect } from "vitest";
import { toHex, toAddress } from "../src/contract/evm";
import { DimesError } from "../src/errors/dimes-error";

describe("toHex", () => {
  it("returns valid hex string unchanged", () => {
    const hex = "0x1234abcd";
    expect(toHex(hex)).toBe(hex);
  });

  it("throws DimesError for non-hex string", () => {
    expect(() => toHex("not-hex")).toThrow(DimesError);
    expect(() => toHex("not-hex")).toThrow(/Expected hex string/);
  });
});

describe("toAddress", () => {
  it("returns checksummed address for valid address", () => {
    // All lowercase valid address
    const addr = "0xd8da6bf26964af9d7eed9e03e53415d37aa96045";
    const result = toAddress(addr);
    // viem's getAddress returns EIP-55 checksummed
    expect(result).toBe("0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045");
  });

  it("throws DimesError for invalid address", () => {
    expect(() => toAddress("0xinvalid")).toThrow(DimesError);
    expect(() => toAddress("0xinvalid")).toThrow(/Invalid EVM address/);
  });
});
