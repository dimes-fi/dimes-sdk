import type { Market } from "../types/aliases";

export type Side = "yes" | "no";

export interface SideEligibility {
  open: boolean;
  reasonCode: string | null;
}

export interface SidedEligibility {
  yes: SideEligibility;
  no: SideEligibility;
}

export function getSidedEligibility(market: Market): SidedEligibility {
  const sided = market.sidedEligibility;
  return {
    yes: {
      open: sided.yes.acceptingNewPositions,
      reasonCode: sided.yes.rejectionReasonCode ?? null,
    },
    no: {
      open: sided.no.acceptingNewPositions,
      reasonCode: sided.no.rejectionReasonCode ?? null,
    },
  };
}

export function defaultSide(eligibility: SidedEligibility): Side | null {
  if (eligibility.yes.open && eligibility.no.open) {
    return "yes";
  }
  if (eligibility.yes.open) {
    return "yes";
  }
  if (eligibility.no.open) {
    return "no";
  }
  return null;
}

export function isFullyOpen(eligibility: SidedEligibility): boolean {
  return eligibility.yes.open && eligibility.no.open;
}

export function isFullyClosed(eligibility: SidedEligibility): boolean {
  return !eligibility.yes.open && !eligibility.no.open;
}

export function rejectionReasonText(code: string | null | undefined): string {
  if (!code) {
    return "Not eligible for new positions";
  }
  const stripped = code
    .replace(/^quote_/i, "")
    .replaceAll("_", " ")
    .toLowerCase();
  return stripped.charAt(0).toUpperCase() + stripped.slice(1);
}

export function rejectionReasonShort(code: string | null | undefined): string {
  if (!code) {
    return "unavailable";
  }
  const stripped = code
    .replace(/^quote_/i, "")
    .replace(/_exceeded$/i, "")
    .replace(/_too_(low|high)$/i, "")
    .replaceAll("_", " ")
    .toLowerCase();
  return stripped;
}
