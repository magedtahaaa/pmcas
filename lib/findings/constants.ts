export const findingStatusOptions = [
  { value: "DRAFT", label: "Draft" },
  { value: "ACCEPTED", label: "Accepted" },
  { value: "EDITED", label: "Edited" },
  { value: "DISMISSED", label: "Dismissed" },
] as const;

export const findingSeverityOptions = [
  { value: "CRITICAL", label: "Critical" },
  { value: "HIGH", label: "High" },
  { value: "MEDIUM", label: "Medium" },
  { value: "LOW", label: "Low" },
] as const;

export const findingConfidenceOptions = [
  { value: "LOW", label: "Low" },
  { value: "MEDIUM", label: "Medium" },
  { value: "HIGH", label: "High" },
] as const;

export const auditSectionOptions = [
  { value: "MEASUREMENT_DATA_AUDIT", label: "Measurement & Data Audit" },
  { value: "FUNNEL_LEAKAGE_AUDIT", label: "Funnel Leakage Audit" },
  { value: "CUSTOMER_MARKET_RESEARCH", label: "Customer & Market Research" },
  { value: "OFFER_PRICING_MESSAGING", label: "Offer, Pricing & Messaging Analysis" },
  { value: "BRAND_POSITIONING", label: "Brand Positioning Analysis" },
  { value: "CHANNEL_EXPANSION", label: "Channel Expansion & Growth Opportunities" },
  { value: "TEAM_WORKFLOW_ALIGNMENT", label: "Team Workflow & Internal Alignment" },
  { value: "EXPERIMENTATION_ROADMAP", label: "Experimentation Roadmap" },
] as const;

export type FindingStatusValue = (typeof findingStatusOptions)[number]["value"];
export type FindingSeverityValue = (typeof findingSeverityOptions)[number]["value"];
export type FindingConfidenceValue = (typeof findingConfidenceOptions)[number]["value"];
export type AuditSectionKeyValue = (typeof auditSectionOptions)[number]["value"];

export function isFindingStatus(value: string): value is FindingStatusValue {
  return findingStatusOptions.some((option) => option.value === value);
}

export function isFindingSeverity(value: string): value is FindingSeverityValue {
  return findingSeverityOptions.some((option) => option.value === value);
}

export function isFindingConfidence(value: string): value is FindingConfidenceValue {
  return findingConfidenceOptions.some((option) => option.value === value);
}

export function isAuditSectionKey(value: string): value is AuditSectionKeyValue {
  return auditSectionOptions.some((option) => option.value === value);
}

export function getAuditSectionName(sectionKey: string | null | undefined) {
  return auditSectionOptions.find((option) => option.value === sectionKey)?.label ?? "Not set";
}

export function getFindingSeverityRank(severity: string | null | undefined) {
  switch (severity) {
    case "CRITICAL":
      return 4;
    case "HIGH":
      return 3;
    case "MEDIUM":
      return 2;
    case "LOW":
      return 1;
    default:
      return 0;
  }
}
