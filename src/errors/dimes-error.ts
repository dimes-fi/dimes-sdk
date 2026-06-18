import type { QuoteHint } from "../quote/quote-error-hints";
import { resolveFriendlyMessage } from "./error-messages";

export class DimesError extends Error {
  public readonly code: string;

  constructor(code: string, message: string) {
    super(message);
    this.name = "DimesError";
    this.code = code;
  }
}

export class DimesApiError extends DimesError {
  public readonly status: number;

  public readonly type: string | null;

  public readonly rawMessage: string;

  public readonly params: Record<string, unknown> | null;

  public readonly hint: QuoteHint | null;

  constructor(options: {
    status: number;
    code: string;
    type: string | null;
    message: string;
    params: Record<string, unknown> | null;
    hint?: QuoteHint | null;
  }) {
    const friendly = resolveFriendlyMessage(options.code, options.params) ?? options.message;
    super(options.code, friendly);
    this.name = "DimesApiError";
    this.status = options.status;
    this.type = options.type;
    this.rawMessage = options.message;
    this.params = options.params;
    this.hint = options.hint ?? null;
  }
}

export class DimesContractError extends DimesError {
  constructor(code: string, message: string) {
    super(code, message);
    this.name = "DimesContractError";
  }
}
