export const auditSections = [
  "Measurement & Data Audit",
  "Funnel Leakage Audit",
  "Customer & Market Research",
  "Offer, Pricing & Messaging Analysis",
  "Brand Positioning Analysis",
  "Channel Expansion & Growth Opportunities",
  "Team Workflow & Internal Alignment",
  "Experimentation Roadmap",
] as const;

export type AuditSectionName = (typeof auditSections)[number];

export type ConfidenceLevel = "low" | "medium" | "high";

export type RiskLevel = "strong" | "needs-improvement" | "risk-area" | "critical-gap";

export type WorkflowStatus =
  | "draft"
  | "accepted"
  | "edited"
  | "dismissed"
  | "in-progress"
  | "completed"
  | "exported";
