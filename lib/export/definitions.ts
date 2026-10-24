import type { ExportType } from "@prisma/client";

export type AuditCsvExportType = Exclude<ExportType, "ACTION_PLAN">;

export type AuditCsvExportDefinition = {
  type: AuditCsvExportType;
  slug: string;
  name: string;
  description: string;
  includes: string[];
};

export type AuditXlsxReportDefinition = {
  downloadType: string;
  exportType: AuditCsvExportType;
  slug: string;
  name: string;
  description: string;
  includes: string[];
};

export const FULL_AUDIT_WORKBOOK_DOWNLOAD_TYPE = "full-workbook";

export const FULL_AUDIT_WORKBOOK_DEFINITION = {
  type: FULL_AUDIT_WORKBOOK_DOWNLOAD_TYPE,
  slug: "full-audit-workbook",
  name: "Full Audit Workbook",
  description:
    "Download the complete audit as one formatted Excel workbook with separate sheets for Summary, Sections, Findings, Recommendations, and Experiments.",
  includes: [
    "Formatted .xlsx workbook",
    "Five separate sheets",
    "Headers, filters, and freeze panes",
    "Google Sheets upload-compatible",
  ],
} as const;

export const DEFAULT_WORKBOOK_FORMATTING_RULES = [
  "Full Audit Workbook is the default professional export",
  "Individual XLSX reports use the same formatting standard",
  "CSV exports remain raw and unformatted",
  "Professional metadata block on every sheet",
  "Report-style Summary sheet layout",
  "Bold header row",
  "Header background color",
  "Readable header text",
  "No-wrap table headers",
  "Frozen table header row where supported",
  "Auto filter where supported",
  "Sensible column widths",
  "Centered body alignment",
  "Wrapped text for long text columns",
  "Top vertical alignment for long text rows",
  "Medium #666666 table and metadata borders",
  "Readable date format such as May 11th 2026",
  "Readable date/time format such as May 11th 2026, 2:25 PM",
  "Consistent font size",
  "Clear sheet names",
  "Semantic styling for status, risk, severity, priority, and confidence",
  "Multiple worksheets for multi-category exports",
] as const;

export const AUDIT_XLSX_REPORT_DEFINITIONS = [
  {
    downloadType: "audit-summary-xlsx",
    exportType: "AUDIT_SUMMARY",
    slug: "audit-summary-report",
    name: "Audit Summary Report",
    description: "Professional one-sheet summary report with audit context, key metrics, risk areas, and executive summary.",
    includes: ["Audit information", "Key metrics", "Highest-risk sections", "Executive summary"],
  },
  {
    downloadType: "section-scores-xlsx",
    exportType: "SECTION_SCORES",
    slug: "section-scores-report",
    name: "Section Scores Report",
    description: "Formatted section score report with risk, confidence, and criteria completion by PMCAS section.",
    includes: ["Section scores", "Risk levels", "Confidence", "Criteria completion"],
  },
  {
    downloadType: "findings-xlsx",
    exportType: "FINDINGS",
    slug: "findings-report",
    name: "Findings Report",
    description: "Formatted findings report with evidence, severity, confidence, impact, and workflow status.",
    includes: ["Finding context", "Evidence", "Severity", "Business impact", "Status"],
  },
  {
    downloadType: "recommendations-xlsx",
    exportType: "RECOMMENDATIONS",
    slug: "recommendations-report",
    name: "Recommendations Report",
    description: "Formatted recommendations report with rationale, expected impact, owner, priority, and status.",
    includes: ["Related findings", "Rationale", "Expected impact", "Owner", "Priority"],
  },
  {
    downloadType: "experiments-xlsx",
    exportType: "EXPERIMENTS",
    slug: "experiments-report",
    name: "Experiments Report",
    description: "Formatted experiment backlog report with hypotheses, metrics, scores, status, and learning fields.",
    includes: ["Hypotheses", "Proposed changes", "Metrics", "Priority scores", "Learning"],
  },
] as const satisfies readonly AuditXlsxReportDefinition[];

export const AUDIT_CSV_EXPORT_DEFINITIONS = [
  {
    type: "AUDIT_SUMMARY",
    slug: "audit-summary",
    name: "Audit Summary",
    description: "One-row overview of the selected audit, score, completion, and output counts.",
    includes: [
      "Audit metadata",
      "Overall score and confidence",
      "Completion",
      "Finding, recommendation, and experiment counts",
    ],
  },
  {
    type: "SECTION_SCORES",
    slug: "section-scores",
    name: "Section Scores",
    description: "One row per PMCAS audit section with score, risk, confidence, and progress.",
    includes: ["Section key and name", "Score and risk", "Confidence", "Criteria progress"],
  },
  {
    type: "FINDINGS",
    slug: "findings",
    name: "Findings",
    description: "All findings linked to the selected audit with evidence and workflow status.",
    includes: ["Finding context", "Evidence", "Severity", "Confidence", "Business impact"],
  },
  {
    type: "RECOMMENDATIONS",
    slug: "recommendations",
    name: "Recommendations",
    description: "Action recommendations tied to audit findings and owner/priority fields.",
    includes: ["Related finding", "Rationale", "Expected impact", "Owner", "Priority"],
  },
  {
    type: "EXPERIMENTS",
    slug: "experiments",
    name: "Experiments",
    description: "Experiment backlog items with hypotheses, metrics, ICE-style scores, and results.",
    includes: ["Hypothesis", "Proposed change", "Primary metric", "Priority score", "Learning"],
  },
] as const satisfies readonly AuditCsvExportDefinition[];

export function parseAuditCsvExportType(value: string | null) {
  return (
    AUDIT_CSV_EXPORT_DEFINITIONS.find((definition) => definition.type === value)?.type ?? null
  );
}

export function getAuditCsvExportDefinition(type: AuditCsvExportType) {
  return AUDIT_CSV_EXPORT_DEFINITIONS.find((definition) => definition.type === type);
}

export function parseAuditXlsxReportDownloadType(value: string | null) {
  return (
    AUDIT_XLSX_REPORT_DEFINITIONS.find((definition) => definition.downloadType === value) ?? null
  );
}

export function getAuditXlsxReportDefinition(exportType: AuditCsvExportType) {
  return AUDIT_XLSX_REPORT_DEFINITIONS.find((definition) => definition.exportType === exportType);
}
