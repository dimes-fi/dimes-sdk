import { type Hex, type Address, isHex, isAddress, getAddress } from "viem";
import { DimesError } from "../errors/dimes-error";

export type { Hex, Address };

export function toHex(value: string): Hex {
  if (!isHex(value)) {
    const HEX_PREVIEW_LENGTH = 10;
    throw new DimesError(
      "invalid_hex",
      `Expected hex string starting with 0x, got: ${value.slice(0, HEX_PREVIEW_LENGTH)}`,
    );
  }

  return value;
}

export function toAddress(value: string): Address {
  if (!isAddress(value)) {
    throw new DimesError("invalid_address", `Invalid EVM address: ${value}`);
  }

  return getAddress(value);
}
