export type Params = Record<string, unknown> | null;

export function asNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }
  return null;
}

export function asBigInt(value: unknown): bigint | null {
  if (typeof value === "bigint") {
    return value;
  }
  if (typeof value === "string" && /^-?\d+$/.test(value.trim())) {
    return BigInt(value.trim());
  }
  if (typeof value === "number" && Number.isInteger(value)) {
    return BigInt(value);
  }
  return null;
}

export function getParam(params: Params, key: string): unknown {
  return params ? params[key] : undefined;
}
