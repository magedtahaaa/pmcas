import { notFound } from "next/navigation";

import { AuditHeader } from "@/components/audit/audit-header";
import { AuditProgressCard } from "@/components/audit/audit-progress-card";
import {
  AuditSectionCard,
  type AuditSectionWorkspaceItem,
} from "@/components/audit/audit-section-card";
import { AuditSectionNav } from "@/components/audit/audit-section-nav";
import {
  FindingsPreview,
  type FindingPreviewItem,
} from "@/components/audit/findings-preview";
import {
  ExperimentsPreview,
  type ExperimentPreviewItem,
} from "@/components/audit/experiments-preview";
import {
  CreateExperimentPanel,
  CreateFindingPanel,
  CreateRecommendationPanel,
  type ManualAuditSectionOption,
  type ManualFindingOption,
  type ManualRecommendationOption,
} from "@/components/audit/manual-workflow-create-panel";
import {
  RecommendationsPreview,
  type RecommendationPreviewItem,
} from "@/components/audit/recommendations-preview";
import { AuditWorkspaceGroup } from "@/components/audit/audit-workspace-group";
import { formatScore } from "@/lib/audits/format";
import { formatMetricValue } from "@/lib/brands/format";
import { getAuditWorkspace } from "@/lib/audits/queries";
import { calculateAuditScoreSummary, type SectionScoreInput } from "@/lib/scoring";

export const dynamic = "force-dynamic";

export default async function AuditWorkspacePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const audit = await getAuditWorkspace(id);

  if (!audit) {
    notFound();
  }

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
  const findings: FindingPreviewItem[] = audit.findings.map((finding) => ({
    id: finding.id,
    title: finding.title,
    sectionKey: finding.sectionKey,
    severity: finding.severity,
    confidence: finding.confidence,
    status: finding.status,
    businessImpact: finding.businessImpact,
  }));
  const findingOptions: ManualFindingOption[] = audit.findings.map((finding) => ({
    id: finding.id,
    title: finding.title,
    sectionKey: finding.sectionKey,
  }));
  const recommendations: RecommendationPreviewItem[] = audit.recommendations.map(
    (recommendation) => ({
      id: recommendation.id,
      title: recommendation.title,
      priority: recommendation.priority,
      suggestedOwner: recommendation.suggestedOwner,
      confidence: recommendation.confidence,
      status: recommendation.status,
      expectedImpact: recommendation.expectedImpact,
      finding: {
        sectionKey: recommendation.finding.sectionKey,
        title: recommendation.finding.title,
      },
    }),
  );
  const recommendationOptions: ManualRecommendationOption[] = audit.recommendations.map(
    (recommendation) => ({
      id: recommendation.id,
      title: recommendation.title,
    }),
  );
  const experiments: ExperimentPreviewItem[] = audit.experiments.map((experiment) => ({
    id: experiment.id,
    funnelStage: experiment.funnelStage,
    hypothesis: experiment.hypothesis,
    proposedChange: experiment.proposedChange,
    primaryMetric: experiment.primaryMetric,
    impact: experiment.impact,
    confidenceScore: experiment.confidenceScore,
    effort: experiment.effort,
    priorityScore: experiment.priorityScore,
    owner: experiment.owner,
    status: experiment.status,
    deadline: experiment.deadline,
    recommendation: experiment.recommendation
      ? {
          title: experiment.recommendation.title,
        }
      : null,
  }));
  const sectionOptions: ManualAuditSectionOption[] = audit.template.sections.map((section) => ({
    sectionKey: section.sectionKey,
    name: section.name,
  }));
  const workspaceSections: AuditSectionWorkspaceItem[] = audit.template.sections.map((section) => ({
    id: section.id,
    sectionKey: section.sectionKey,
    name: section.name,
    description: section.description,
    criteria: section.criteria.map((criterion) => {
      const response = responsesByCriteriaId.get(criterion.id);

      return {
        id: criterion.id,
        title: criterion.title,
        description: criterion.description,
        weight: criterion.weight,
        scoringGuidance: criterion.scoringGuidance,
        evidenceRequired: criterion.evidenceRequired,
        ruleKey: criterion.ruleKey,
        response: response
          ? {
              id: response.id,
              score0To5: response.score0To5,
              normalizedScore: response.normalizedScore,
              riskLevel: response.riskLevel,
              confidence: response.confidence,
              notes: response.notes,
              responseData: response.responseData,
            }
          : null,
        evidenceItems:
          response?.evidenceItems.map((evidence) => ({
            id: evidence.id,
            title: evidence.title,
            description: evidence.description,
            source: evidence.source,
            url: evidence.url,
            fileReference: evidence.fileReference,
            metricName: evidence.metricName,
            metricValue: evidence.metricValue ? formatMetricValue(evidence.metricValue) : null,
          })) ?? [],
      };
    }),
  }));
  const sectionNavItems = scoreSummary.sectionScores.map((sectionScore) => ({
    ...sectionScore,
    anchorId: getSectionAnchorId(sectionScore.sectionId),
  }));
  const sectionAnchors = Object.fromEntries(
    sectionNavItems.map((section) => [section.sectionId, section.anchorId]),
  );
  const displayedOverallScore = scoreSummary.overallScore ?? audit.overallScore;
  const displayedOverallRisk = scoreSummary.overallRiskLevel ?? audit.overallRisk;
  const displayedOverallConfidence =
    scoreSummary.overallConfidence ?? audit.overallConfidence;
  const highestRiskSection = scoreSummary.highestRiskSections[0];
  const highSeverityFindings = findings.filter(
    (finding) => finding.severity === "CRITICAL" || finding.severity === "HIGH",
  ).length;
  const highPriorityRecommendations = recommendations.filter(
    (recommendation) =>
      recommendation.priority === "CRITICAL" || recommendation.priority === "HIGH",
  ).length;
  const activeExperiments = experiments.filter(
    (experiment) => experiment.status === "PLANNED" || experiment.status === "RUNNING",
  ).length;

  return (
    <div className="space-y-8">
      <AuditHeader
        auditTitle={audit.title}
        brandId={audit.brand.id}
        brandName={audit.brand.name}
        auditDate={audit.auditDate}
        overallScore={displayedOverallScore}
        overallRiskLevel={displayedOverallRisk}
        overallConfidence={displayedOverallConfidence}
        scalingReadiness={audit.scalingReadiness}
        dataIntakeHref={`/audits/${audit.id}/data-intake`}
        reportHref={`/audits/${audit.id}/summary`}
      />

      <AuditWorkspaceGroup
        title="Audit Sections"
        summary="Review the 8 PMCAS framework sections, update criteria responses, and track live score changes."
        tone="audits"
        metadata={[
          `${workspaceSections.length} sections`,
          `${scoreSummary.completionPercentage}% complete`,
          formatScore(displayedOverallScore),
          highestRiskSection
            ? `Highest risk: ${highestRiskSection.sectionName}`
            : "No scored risk yet",
        ]}
        watchUnsavedResponses
      >
        <div className="grid gap-6 xl:grid-cols-[280px_minmax(0,1fr)] 2xl:grid-cols-[300px_minmax(0,1fr)]">
          <aside className="space-y-4 xl:sticky xl:top-20 xl:self-start">
            <AuditProgressCard
              summary={scoreSummary}
              auditSummary={audit.summary}
              scalingReadiness={audit.scalingReadiness}
              sectionAnchors={sectionAnchors}
            />
            <AuditSectionNav sections={sectionNavItems} />
          </aside>

          <main className="space-y-8">
            {workspaceSections.map((section) => {
              const score = sectionScoresById.get(section.id);

              if (!score) {
                return null;
              }

              return (
                <AuditSectionCard
                  key={section.id}
                  auditId={audit.id}
                  anchorId={getSectionAnchorId(section.id)}
                  section={section}
                  score={score}
                  findings={findings.filter((finding) => finding.sectionKey === section.sectionKey)}
                  recommendations={recommendations.filter(
                    (recommendation) => recommendation.finding.sectionKey === section.sectionKey,
                  )}
                />
              );
            })}
          </main>
        </div>
      </AuditWorkspaceGroup>

      <AuditWorkspaceGroup
        title="Findings"
        summary="Review audit findings linked to this workspace."
        tone="findings"
        metadata={[
          `${findings.length} total`,
          `${highSeverityFindings} critical/high`,
        ]}
      >
        {findings.length > 0 ? (
          <div className="mb-5">
            <CreateFindingPanel auditId={audit.id} sections={sectionOptions} />
          </div>
        ) : null}
        <FindingsPreview
          findings={findings}
          embedded
          emptyAction={
            <CreateFindingPanel
              auditId={audit.id}
              sections={sectionOptions}
              buttonLabel="Add first finding"
            />
          }
        />
      </AuditWorkspaceGroup>

      <AuditWorkspaceGroup
        title="Recommendations"
        summary="Review recommendations tied to findings and consultant action."
        tone="recommendations"
        metadata={[
          `${recommendations.length} total`,
          `${highPriorityRecommendations} critical/high priority`,
        ]}
      >
        {recommendations.length > 0 ? (
          <div className="mb-5">
            <CreateRecommendationPanel auditId={audit.id} findings={findingOptions} />
          </div>
        ) : null}
        <RecommendationsPreview
          recommendations={recommendations}
          embedded
          emptyAction={
            <CreateRecommendationPanel
              auditId={audit.id}
              findings={findingOptions}
              buttonLabel="Add first recommendation"
            />
          }
        />
      </AuditWorkspaceGroup>

      <AuditWorkspaceGroup
        title="Experiments"
        summary="Review experiments and operational tests connected to audit recommendations."
        tone="experiments"
        metadata={[
          `${experiments.length} total`,
          `${activeExperiments} planned/running`,
        ]}
      >
        {experiments.length > 0 ? (
          <div className="mb-5">
            <CreateExperimentPanel auditId={audit.id} recommendations={recommendationOptions} />
          </div>
        ) : null}
        <ExperimentsPreview
          experiments={experiments}
          embedded
          emptyAction={
            <CreateExperimentPanel
              auditId={audit.id}
              recommendations={recommendationOptions}
              buttonLabel="Add first experiment"
            />
          }
        />
      </AuditWorkspaceGroup>
    </div>
  );
}

function getSectionAnchorId(sectionId: string) {
  return `section-${sectionId}`;
}
