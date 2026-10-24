import { prisma } from "@/lib/db/prisma";
import { formatAuditEnum } from "@/lib/audits/format";
import { calculateAuditScoreSummary, type SectionScoreInput } from "@/lib/scoring";
import { buildCsv, type CsvDataset, type CsvRow } from "@/lib/export/csv";
import {
  AUDIT_CSV_EXPORT_DEFINITIONS,
  getAuditCsvExportDefinition,
  type AuditCsvExportType,
} from "@/lib/export/definitions";

export type AuditCsvExportResult = {
  csv: string;
  fileName: string;
  rowCount: number;
  exportType: AuditCsvExportType;
};

export type AuditExportDatasetResult = {
  audit: {
    id: string;
    title: string;
    auditDate: Date;
    brandName: string;
  };
  datasets: Record<AuditCsvExportType, CsvDataset>;
};

export async function buildAuditCsvExport({
  auditId,
  exportType,
}: {
  auditId: string;
  exportType: AuditCsvExportType;
}): Promise<AuditCsvExportResult | null> {
  const exportData = await buildAuditExportDatasets(auditId);

  if (!exportData) {
    return null;
  }

  const definition = getAuditCsvExportDefinition(exportType);
  const exportSlug = definition?.slug ?? exportType.toLowerCase();
  const fileName = buildExportFileName({
    exportSlug,
    auditTitle: exportData.audit.title,
    auditId: exportData.audit.id,
    extension: "csv",
  });
  const { columns, rows } = exportData.datasets[exportType];

  return {
    csv: buildCsv({ columns, rows }),
    fileName,
    rowCount: rows.length,
    exportType,
  };
}

export async function buildAuditExportDatasets(
  auditId: string,
): Promise<AuditExportDatasetResult | null> {
  const audit = await getAuditExportData(auditId);

  if (!audit) {
    return null;
  }

  const scoreSummary = buildAuditScoreSummary(audit);

  return {
    audit: {
      id: audit.id,
      title: audit.title,
      auditDate: audit.auditDate,
      brandName: audit.brand.name,
    },
    datasets: buildAllExportDatasets(audit, scoreSummary),
  };
}

export async function recordAuditCsvExport({
  auditId,
  exportType,
  fileName,
  rowCount,
}: {
  auditId: string;
  exportType: AuditCsvExportType;
  fileName: string;
  rowCount: number;
}) {
  return prisma.export.create({
    data: {
      auditId,
      exportType,
      fileName,
      rowCount,
      notes: "Generated from PMCAS Export Center CSV download.",
    },
  });
}

async function getAuditExportData(auditId: string) {
  return prisma.audit.findUnique({
    where: {
      id: auditId,
    },
    include: {
      brand: {
        select: {
          id: true,
          name: true,
        },
      },
      template: {
        include: {
          sections: {
            orderBy: {
              sortOrder: "asc",
            },
            include: {
              criteria: {
                orderBy: {
                  sortOrder: "asc",
                },
                select: {
                  id: true,
                  weight: true,
                },
              },
            },
          },
        },
      },
      responses: {
        select: {
          criteriaId: true,
          score0To5: true,
          confidence: true,
        },
      },
      findings: {
        orderBy: {
          createdAt: "desc",
        },
      },
      recommendations: {
        orderBy: {
          createdAt: "desc",
        },
        include: {
          finding: {
            select: {
              title: true,
            },
          },
        },
      },
      experiments: {
        orderBy: [
          {
            priorityScore: "desc",
          },
          {
            createdAt: "desc",
          },
        ],
        include: {
          recommendation: {
            select: {
              title: true,
            },
          },
        },
      },
    },
  });
}

type AuditExportData = NonNullable<Awaited<ReturnType<typeof getAuditExportData>>>;
type AuditExportScoreSummary = ReturnType<typeof buildAuditScoreSummary>;

function buildAuditScoreSummary(audit: AuditExportData) {
  const responsesByCriteriaId = new Map(
    audit.responses.map((response) => [response.criteriaId, response]),
  );
  const sectionScoreInputs: SectionScoreInput[] = audit.template.sections.map((section) => ({
    id: section.id,
    name: section.name,
    weight: section.weight,
    criteria: section.criteria.map((criterion) => {
      const response = responsesByCriteriaId.get(criterion.id);

      return {
        id: criterion.id,
        weight: criterion.weight,
        response: response
          ? {
              score0To5: response.score0To5,
              confidence: response.confidence,
            }
          : null,
      };
    }),
  }));

  return calculateAuditScoreSummary(sectionScoreInputs);
}

function buildAllExportDatasets(
  audit: AuditExportData,
  scoreSummary: AuditExportScoreSummary,
): Record<AuditCsvExportType, CsvDataset> {
  return AUDIT_CSV_EXPORT_DEFINITIONS.reduce(
    (datasets, definition) => {
      datasets[definition.type] = buildRowsForExportType(audit, scoreSummary, definition.type);
      return datasets;
    },
    {} as Record<AuditCsvExportType, CsvDataset>,
  );
}

function buildRowsForExportType(
  audit: AuditExportData,
  scoreSummary: AuditExportScoreSummary,
  exportType: AuditCsvExportType,
): CsvDataset {
  switch (exportType) {
    case "AUDIT_SUMMARY":
      return buildAuditSummaryRows(audit, scoreSummary);
    case "SECTION_SCORES":
      return buildSectionScoreRows(audit, scoreSummary);
    case "FINDINGS":
      return buildFindingRows(audit);
    case "RECOMMENDATIONS":
      return buildRecommendationRows(audit);
    case "EXPERIMENTS":
      return buildExperimentRows(audit);
  }
}

function buildAuditSummaryRows(audit: AuditExportData, scoreSummary: AuditExportScoreSummary) {
  const rows: CsvRow[] = [
    {
      auditId: audit.id,
      auditTitle: audit.title,
      brandName: audit.brand.name,
      auditDate: formatDate(audit.auditDate),
      overallScore: formatNumber(scoreSummary.overallScore ?? audit.overallScore),
      overallConfidence: formatAuditEnum(scoreSummary.overallConfidence ?? audit.overallConfidence),
      scalingReadiness: audit.scalingReadiness,
      completionPercentage: scoreSummary.completionPercentage,
      totalFindings: audit.findings.length,
      totalRecommendations: audit.recommendations.length,
      totalExperiments: audit.experiments.length,
      highestRiskSections: scoreSummary.highestRiskSections
        .map((section) => `${section.sectionName} (${formatAuditEnum(section.riskLevel)})`)
        .join("; "),
      summary: audit.summary,
    },
  ];

  return {
    columns: [
      { key: "auditId", header: "Audit ID" },
      { key: "auditTitle", header: "Audit Title" },
      { key: "brandName", header: "Brand Name" },
      { key: "auditDate", header: "Audit Date" },
      { key: "overallScore", header: "Overall Score" },
      { key: "overallConfidence", header: "Overall Confidence" },
      { key: "scalingReadiness", header: "Scaling Readiness" },
      { key: "completionPercentage", header: "Completion Percentage" },
      { key: "totalFindings", header: "Total Findings" },
      { key: "totalRecommendations", header: "Total Recommendations" },
      { key: "totalExperiments", header: "Total Experiments" },
      { key: "highestRiskSections", header: "Highest-Risk Sections" },
      { key: "summary", header: "Summary" },
    ],
    rows,
  };
}

function buildSectionScoreRows(audit: AuditExportData, scoreSummary: AuditExportScoreSummary) {
  const scoresBySectionId = new Map(
    scoreSummary.sectionScores.map((sectionScore) => [sectionScore.sectionId, sectionScore]),
  );
  const rows: CsvRow[] = audit.template.sections.map((section) => {
    const score = scoresBySectionId.get(section.id);

    return {
      auditId: audit.id,
      auditTitle: audit.title,
      brandName: audit.brand.name,
      sectionKey: formatAuditEnum(section.sectionKey),
      sectionName: section.name,
      sectionScore: formatNumber(score?.score),
      riskLevel: formatAuditEnum(score?.riskLevel),
      confidenceLevel: formatAuditEnum(score?.confidence),
      sectionWeight: section.weight,
      criteriaCount: score?.totalCriteria ?? section.criteria.length,
      answeredCriteriaCount: score?.answeredCriteria ?? 0,
      completionPercentage: score?.completionPercentage ?? 0,
    };
  });

  return {
    columns: [
      { key: "auditId", header: "Audit ID" },
      { key: "auditTitle", header: "Audit Title" },
      { key: "brandName", header: "Brand Name" },
      { key: "sectionKey", header: "Section Key" },
      { key: "sectionName", header: "Section Name" },
      { key: "sectionScore", header: "Section Score" },
      { key: "riskLevel", header: "Risk Level" },
      { key: "confidenceLevel", header: "Confidence Level" },
      { key: "sectionWeight", header: "Section Weight" },
      { key: "criteriaCount", header: "Criteria Count" },
      { key: "answeredCriteriaCount", header: "Answered Criteria Count" },
      { key: "completionPercentage", header: "Completion Percentage" },
    ],
    rows,
  };
}

function buildFindingRows(audit: AuditExportData) {
  const rows: CsvRow[] = audit.findings.map((finding) => ({
    auditId: audit.id,
    auditTitle: audit.title,
    brandName: audit.brand.name,
    sectionKey: formatAuditEnum(finding.sectionKey),
    findingTitle: finding.title,
    findingDescription: finding.description,
    evidence: finding.evidence,
    severity: formatAuditEnum(finding.severity),
    confidence: formatAuditEnum(finding.confidence),
    businessImpact: finding.businessImpact,
    relatedMetricName: finding.relatedMetricName,
    relatedMetricValue: decimalToString(finding.relatedMetricValue),
    status: formatAuditEnum(finding.status),
    createdDate: formatDateTime(finding.createdAt),
    updatedDate: formatDateTime(finding.updatedAt),
  }));

  return {
    columns: [
      { key: "auditId", header: "Audit ID" },
      { key: "auditTitle", header: "Audit Title" },
      { key: "brandName", header: "Brand Name" },
      { key: "sectionKey", header: "Section Key" },
      { key: "findingTitle", header: "Finding Title" },
      { key: "findingDescription", header: "Finding Description" },
      { key: "evidence", header: "Evidence" },
      { key: "severity", header: "Severity" },
      { key: "confidence", header: "Confidence" },
      { key: "businessImpact", header: "Business Impact" },
      { key: "relatedMetricName", header: "Related Metric Name" },
      { key: "relatedMetricValue", header: "Related Metric Value" },
      { key: "status", header: "Status" },
      { key: "createdDate", header: "Created Date" },
      { key: "updatedDate", header: "Updated Date" },
    ],
    rows,
  };
}

function buildRecommendationRows(audit: AuditExportData) {
  const rows: CsvRow[] = audit.recommendations.map((recommendation) => ({
    auditId: audit.id,
    auditTitle: audit.title,
    brandName: audit.brand.name,
    relatedFindingTitle: recommendation.finding.title,
    recommendationTitle: recommendation.title,
    rationale: recommendation.rationale,
    expectedImpact: recommendation.expectedImpact,
    effort: recommendation.effort,
    priority: formatAuditEnum(recommendation.priority),
    suggestedOwner: formatAuditEnum(recommendation.suggestedOwner),
    status: formatAuditEnum(recommendation.status),
    createdDate: formatDateTime(recommendation.createdAt),
    updatedDate: formatDateTime(recommendation.updatedAt),
  }));

  return {
    columns: [
      { key: "auditId", header: "Audit ID" },
      { key: "auditTitle", header: "Audit Title" },
      { key: "brandName", header: "Brand Name" },
      { key: "relatedFindingTitle", header: "Related Finding Title" },
      { key: "recommendationTitle", header: "Recommendation Title" },
      { key: "rationale", header: "Rationale" },
      { key: "expectedImpact", header: "Expected Impact" },
      { key: "effort", header: "Effort" },
      { key: "priority", header: "Priority" },
      { key: "suggestedOwner", header: "Suggested Owner" },
      { key: "status", header: "Status" },
      { key: "createdDate", header: "Created Date" },
      { key: "updatedDate", header: "Updated Date" },
    ],
    rows,
  };
}

function buildExperimentRows(audit: AuditExportData) {
  const rows: CsvRow[] = audit.experiments.map((experiment) => ({
    auditId: audit.id,
    auditTitle: audit.title,
    brandName: audit.brand.name,
    relatedRecommendationTitle: experiment.recommendation?.title,
    funnelStage: experiment.funnelStage,
    problemObserved: experiment.problemObserved,
    evidence: experiment.evidence,
    hypothesis: experiment.hypothesis,
    proposedChange: experiment.proposedChange,
    primaryMetric: experiment.primaryMetric,
    secondaryMetric: experiment.secondaryMetric,
    impact: experiment.impact,
    confidenceScore: experiment.confidenceScore,
    ease: experiment.ease,
    effort: experiment.effort,
    priorityScore: experiment.priorityScore,
    owner: formatAuditEnum(experiment.owner),
    status: formatAuditEnum(experiment.status),
    result: experiment.result,
    learning: experiment.learning,
    nextAction: experiment.nextAction,
    deadline: experiment.deadline ? formatDate(experiment.deadline) : "",
    createdDate: formatDateTime(experiment.createdAt),
    updatedDate: formatDateTime(experiment.updatedAt),
  }));

  return {
    columns: [
      { key: "auditId", header: "Audit ID" },
      { key: "auditTitle", header: "Audit Title" },
      { key: "brandName", header: "Brand Name" },
      { key: "relatedRecommendationTitle", header: "Related Recommendation Title" },
      { key: "funnelStage", header: "Funnel Stage" },
      { key: "problemObserved", header: "Problem Observed" },
      { key: "evidence", header: "Evidence" },
      { key: "hypothesis", header: "Hypothesis" },
      { key: "proposedChange", header: "Proposed Change" },
      { key: "primaryMetric", header: "Primary Metric" },
      { key: "secondaryMetric", header: "Secondary Metric" },
      { key: "impact", header: "Impact" },
      { key: "confidenceScore", header: "Confidence Score" },
      { key: "ease", header: "Ease" },
      { key: "effort", header: "Effort" },
      { key: "priorityScore", header: "Priority Score" },
      { key: "owner", header: "Owner" },
      { key: "status", header: "Status" },
      { key: "result", header: "Result" },
      { key: "learning", header: "Learning" },
      { key: "nextAction", header: "Next Action" },
      { key: "deadline", header: "Deadline" },
      { key: "createdDate", header: "Created Date" },
      { key: "updatedDate", header: "Updated Date" },
    ],
    rows,
  };
}

export function buildExportFileName({
  exportSlug,
  auditTitle,
  auditId,
  extension,
}: {
  exportSlug: string;
  auditTitle: string;
  auditId: string;
  extension: "csv" | "xlsx";
}) {
  const auditSlug = slugify(auditTitle) || auditId;
  const dateStamp = new Date().toISOString().slice(0, 10);

  return `pmcas-${exportSlug}-${auditSlug}-${dateStamp}.${extension}`;
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 80);
}

function formatNumber(value: number | null | undefined) {
  if (value === null || value === undefined) {
    return "";
  }

  return Math.round(value * 100) / 100;
}

function formatDate(value: Date) {
  return value.toISOString().slice(0, 10);
}

function formatDateTime(value: Date) {
  return value.toISOString();
}

function decimalToString(value: { toString: () => string } | null | undefined) {
  return value?.toString() ?? "";
}
