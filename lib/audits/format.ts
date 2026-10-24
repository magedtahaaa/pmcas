import type {
  ConfidenceLevel as BadgeConfidenceLevel,
  RiskLevel as BadgeRiskLevel,
  WorkflowStatus,
} from "@/types/audit";

export function formatAuditEnum(value: string | null | undefined) {
  if (!value) {
    return "Not set";
  }

  return value
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function formatScore(score: number | null | undefined) {
  if (score === null || score === undefined) {
    return "Not scored";
  }

  return `${Math.round(score)} / 100`;
}

export function toBadgeRiskLevel(risk: string | null | undefined): BadgeRiskLevel | null {
  switch (risk) {
    case "STRONG":
      return "strong";
    case "NEEDS_IMPROVEMENT":
      return "needs-improvement";
    case "RISK_AREA":
      return "risk-area";
    case "CRITICAL_GAP":
      return "critical-gap";
    default:
      return null;
  }
}

export function toBadgeConfidenceLevel(
  confidence: string | null | undefined,
): BadgeConfidenceLevel | null {
  switch (confidence) {
    case "LOW":
      return "low";
    case "MEDIUM":
      return "medium";
    case "HIGH":
      return "high";
    default:
      return null;
  }
}

export function toWorkflowStatus(status: string | null | undefined): WorkflowStatus | null {
  switch (status) {
    case "DRAFT":
      return "draft";
    case "ACCEPTED":
      return "accepted";
    case "EDITED":
      return "edited";
    case "DISMISSED":
      return "dismissed";
    case "IN_PROGRESS":
      return "in-progress";
    case "COMPLETED":
      return "completed";
    default:
      return null;
  }
}

export function stringifyJson(value: unknown) {
  if (value === null || value === undefined) {
    return "";
  }

  return JSON.stringify(value, null, 2);
}
