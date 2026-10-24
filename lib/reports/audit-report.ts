import { formatAuditEnum, formatScore } from "@/lib/audits/format";
import { calculateAuditScoreSummary, type SectionScoreInput } from "@/lib/scoring";
import type { AuditReportRecord } from "@/lib/reports/queries";

export type AuditReportModel = ReturnType<typeof buildAuditReportModel>;

export function buildAuditReportModel(audit: AuditReportRecord) {
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
  const scoreSummary = calculateAuditScoreSummary(sectionScoreInputs);
  const sectionScoresById = new Map(
    scoreSummary.sectionScores.map((sectionScore) => [sectionScore.sectionId, sectionScore]),
  );
  const sections = audit.template.sections.map((section) => ({
    id: section.id,
    sectionKey: section.sectionKey,
    name: section.name,
    description: section.description,
    score: sectionScoresById.get(section.id) ?? null,
  }));
  const overallScore = scoreSummary.overallScore ?? audit.overallScore;
  const overallRiskLevel = scoreSummary.overallRiskLevel ?? audit.overallRisk;
  const overallConfidence = scoreSummary.overallConfidence ?? audit.overallConfidence;
  const criticalOrHighFindings = audit.findings.filter(
    (finding) => finding.severity === "CRITICAL" || finding.severity === "HIGH",
  );
  const priorityFindings = buildPriorityFindings(audit.findings);
  const topRecommendations = [...audit.recommendations]
    .sort((a, b) => getPriorityRank(a.priority) - getPriorityRank(b.priority))
    .slice(0, 5);
  const experimentPreview = [...audit.experiments]
    .sort((a, b) => {
      if (b.priorityScore !== a.priorityScore) return b.priorityScore - a.priorityScore;
      if (b.impact !== a.impact) return b.impact - a.impact;
      return b.confidenceScore - a.confidenceScore;
    })
    .slice(0, 5);

  return {
    scoreSummary,
    sections,
    overallScore,
    overallRiskLevel,
    overallConfidence,
    highestRiskSections: scoreSummary.highestRiskSections.slice(0, 4),
    criticalOrHighFindings,
    priorityFindings,
    topRecommendations,
    experimentPreview,
    executiveSummary: buildExecutiveSummary({
      audit,
      overallScore,
      overallConfidence,
      completionPercentage: scoreSummary.completionPercentage,
      answeredCriteria: scoreSummary.answeredCriteria,
      totalCriteria: scoreSummary.totalCriteria,
      highestRiskSections: scoreSummary.highestRiskSections.slice(0, 3),
      criticalOrHighFindingsCount: criticalOrHighFindings.length,
      recommendationsCount: audit.recommendations.length,
      experimentsCount: audit.experiments.length,
    }),
  };
}

function buildPriorityFindings(findings: AuditReportRecord["findings"]) {
  const sorted = [...findings].sort(
    (a, b) => getSeverityRank(a.severity) - getSeverityRank(b.severity),
  );
  const criticalOrHigh = sorted.filter(
    (finding) => finding.severity === "CRITICAL" || finding.severity === "HIGH",
  );

  if (criticalOrHigh.length > 0) {
    return criticalOrHigh.slice(0, 5);
  }

  const mediumFindings = sorted.filter((finding) => finding.severity === "MEDIUM");

  return (mediumFindings.length > 0 ? mediumFindings : sorted).slice(0, 5);
}

function buildExecutiveSummary({
  audit,
  overallScore,
  overallConfidence,
  completionPercentage,
  answeredCriteria,
  totalCriteria,
  highestRiskSections,
  criticalOrHighFindingsCount,
  recommendationsCount,
  experimentsCount,
}: {
  audit: AuditReportRecord;
  overallScore: number | null;
  overallConfidence: string | null;
  completionPercentage: number;
  answeredCriteria: number;
  totalCriteria: number;
  highestRiskSections: Array<{ sectionName: string; riskLevel: string | null }>;
  criticalOrHighFindingsCount: number;
  recommendationsCount: number;
  experimentsCount: number;
}) {
  const summary: string[] = [];

  if (overallScore === null) {
    summary.push("This audit is not fully scored yet, so the report should be treated as a partial diagnostic view.");
  } else {
    summary.push(
      `The current directional audit score is ${formatScore(overallScore)} with ${formatAuditEnum(
        overallConfidence,
      ).toLowerCase()} confidence.`,
    );
  }

  summary.push(
    `Criteria completion is ${completionPercentage}% (${answeredCriteria} of ${totalCriteria} checks answered).`,
  );

  if (audit.scalingReadiness) {
    summary.push(`Scaling readiness note: ${audit.scalingReadiness}`);
  } else {
    summary.push("Scaling readiness has not been captured yet.");
  }

  if (highestRiskSections.length > 0) {
    summary.push(
      `Highest-risk sections: ${highestRiskSections
        .map((section) => `${section.sectionName} (${formatAuditEnum(section.riskLevel)})`)
        .join(", ")}.`,
    );
  } else {
    summary.push("No scored high-risk sections are available yet.");
  }

  summary.push(
    `${criticalOrHighFindingsCount} critical/high findings, ${recommendationsCount} recommendations, and ${experimentsCount} experiments are currently linked to this audit.`,
  );

  return summary;
}

function getSeverityRank(severity: string) {
  switch (severity) {
    case "CRITICAL":
      return 1;
    case "HIGH":
      return 2;
    case "MEDIUM":
      return 3;
    case "LOW":
      return 4;
    default:
      return 5;
  }
}

function getPriorityRank(priority: string) {
  switch (priority) {
    case "CRITICAL":
      return 1;
    case "HIGH":
      return 2;
    case "MEDIUM":
      return 3;
    case "LOW":
      return 4;
    default:
      return 5;
  }
}
