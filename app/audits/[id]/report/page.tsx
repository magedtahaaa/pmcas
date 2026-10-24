import Link from "next/link";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { ArrowLeft, Download, FileText } from "lucide-react";

import { ExperimentScoreBadge } from "@/components/experiments/experiment-score-badge";
import { ExperimentStatusBadge } from "@/components/experiments/experiment-status-badge";
import { FindingSeverityBadge } from "@/components/findings/finding-severity-badge";
import { ConfidenceBadge } from "@/components/layout/confidence-badge";
import { PageHeader } from "@/components/layout/page-header";
import { RiskBadge } from "@/components/layout/risk-badge";
import { ScoreBadge } from "@/components/layout/score-badge";
import { StatusBadge } from "@/components/layout/status-badge";
import { RecommendationPriorityBadge } from "@/components/recommendations/recommendation-priority-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatAuditEnum, formatScore, toBadgeConfidenceLevel, toBadgeRiskLevel, toWorkflowStatus } from "@/lib/audits/format";
import { formatDate } from "@/lib/brands/format";
import { buildAuditReportModel } from "@/lib/reports/audit-report";
import { getAuditReport } from "@/lib/reports/queries";

export const dynamic = "force-dynamic";

export default async function ClientReadyAuditReportPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const audit = await getAuditReport(id);

  if (!audit) {
    notFound();
  }

  const report = buildAuditReportModel(audit);
  const overallRisk = toBadgeRiskLevel(report.overallRiskLevel);
  const overallConfidence = toBadgeConfidenceLevel(report.overallConfidence);
  const priorityFindings = report.priorityFindings.slice(0, 6);
  const topRecommendations = report.topRecommendations.slice(0, 6);
  const roadmapExperiments = report.experimentPreview.slice(0, 6);
  const readiness = getClientReadiness({
    overallRiskLevel: report.overallRiskLevel,
    overallScore: report.overallScore,
    scalingReadiness: audit.scalingReadiness,
  });
  const clientSummary = buildClientSummary({
    overallScore: report.overallScore,
    overallConfidence: report.overallConfidence,
    readinessLabel: readiness.label,
    completionPercentage: report.scoreSummary.completionPercentage,
    highestRiskSections: report.highestRiskSections,
    criticalHighFindingsCount: report.criticalOrHighFindings.length,
    recommendationsCount: audit.recommendations.length,
    experimentsCount: audit.experiments.length,
  });
  const actionPlan = buildActionPlan({
    completionPercentage: report.scoreSummary.completionPercentage,
    criticalHighFindingsCount: report.criticalOrHighFindings.length,
    topRecommendations,
    roadmapExperiments,
  });

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Client-ready audit report"
        title={`${audit.brand.name} PMCAS Report`}
        description="Presentation-ready audit output built from the current scored responses, findings, recommendations, and experiments."
        tone="reports"
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Button asChild variant="outline">
              <Link href={`/audits/${audit.id}/summary`}>
                <ArrowLeft className="me-2 h-4 w-4" aria-hidden="true" />
                Audit Summary
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link href={`/audits/${audit.id}`}>Audit Workspace</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href={`/exports?auditId=${encodeURIComponent(audit.id)}`}>
                <Download className="me-2 h-4 w-4" aria-hidden="true" />
                Export Center
              </Link>
            </Button>
            <StatusBadge status="draft" />
          </div>
        }
      />

      <Card className="overflow-hidden border-slate-300 bg-slate-50/90">
        <CardHeader className="border-b border-slate-300 bg-background/90">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="min-w-0 space-y-2">
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline">Client-ready audit report</Badge>
                <Badge variant="neutral">{audit.brand.name}</Badge>
                <Badge variant="outline">{formatDate(audit.auditDate)}</Badge>
                <StatusBadge status="draft" />
              </div>
              <CardTitle className="max-w-4xl text-2xl leading-8">{audit.title}</CardTitle>
              <p className="max-w-4xl text-sm leading-6 text-muted-foreground">
                This report is rule-based and uses the current PMCAS audit data without
                AI-generated claims. Scores are directional and should be read together with
                confidence and completion.
              </p>
            </div>
            <span
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-md border border-slate-300 bg-slate-100 text-slate-900"
              aria-hidden="true"
            >
              <FileText className="h-6 w-6" />
            </span>
          </div>
        </CardHeader>
        <CardContent className="grid gap-5 p-5 xl:grid-cols-[minmax(0,1fr)_340px]">
          <div className="rounded-md border border-border/80 bg-background p-5">
            <p className="text-xs font-medium uppercase tracking-normal text-muted-foreground">
              Executive summary
            </p>
            <p className="mt-3 text-base leading-7 text-foreground">{clientSummary}</p>
          </div>
          <div className="space-y-3 rounded-md border border-slate-300 bg-slate-100/70 p-4">
            <p className="text-xs font-medium uppercase tracking-normal text-muted-foreground">
              Report context
            </p>
            <MetaLine label="Brand" value={audit.brand.name} />
            <MetaLine label="Audit" value={audit.title} />
            <MetaLine label="Readiness" value={readiness.label} />
          </div>
        </CardContent>
      </Card>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <HealthTile label="Overall score" tone="audits">
          {report.overallScore !== null ? (
            <ScoreBadge score={report.overallScore} />
          ) : (
            <Badge variant="neutral">Not scored yet</Badge>
          )}
        </HealthTile>
        <HealthTile label="Readiness" tone={readiness.tone}>
          <Badge variant={readiness.variant}>{readiness.label}</Badge>
        </HealthTile>
        <HealthTile label="Completion" tone={report.scoreSummary.completionPercentage < 100 ? "findings" : "audits"}>
          {report.scoreSummary.completionPercentage}%
        </HealthTile>
        <HealthTile label="Confidence" tone="neutral">
          {overallConfidence ? (
            <ConfidenceBadge confidence={overallConfidence} />
          ) : (
            <Badge variant="neutral">No confidence</Badge>
          )}
        </HealthTile>
        <HealthTile label="Critical/high findings" tone="findings">
          {report.criticalOrHighFindings.length}
        </HealthTile>
        <HealthTile label="Recommendations" tone="recommendations">
          {audit.recommendations.length}
        </HealthTile>
        <HealthTile label="Experiments" tone="experiments">
          {audit.experiments.length}
        </HealthTile>
        <HealthTile label="Risk state" tone={overallRisk ? "findings" : "neutral"}>
          {overallRisk ? <RiskBadge risk={overallRisk} /> : <Badge variant="neutral">No risk yet</Badge>}
        </HealthTile>
      </section>

      <Card className="border-s-4 border-s-cyan-600 border-cyan-300/85 bg-cyan-50/80">
        <CardHeader>
          <CardTitle>Key diagnosis</CardTitle>
          <p className="text-sm leading-6 text-muted-foreground">
            The main risk pattern based on scored sections and finding severity.
          </p>
        </CardHeader>
        <CardContent className="grid gap-4 xl:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
          <div className="space-y-3">
            <p className="text-xs font-medium uppercase tracking-normal text-muted-foreground">
              Highest-risk sections
            </p>
            {report.highestRiskSections.length > 0 ? (
              <div className="space-y-3">
                {report.highestRiskSections.slice(0, 4).map((section) => {
                  const risk = toBadgeRiskLevel(section.riskLevel);
                  const confidence = toBadgeConfidenceLevel(section.confidence);

                  return (
                    <div
                      key={section.sectionId}
                      className="rounded-md border border-cyan-300/85 bg-background/90 p-4 shadow-sm shadow-slate-950/5"
                    >
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                        <div className="min-w-0">
                          <p className="break-words text-sm font-semibold leading-6">
                            {section.sectionName}
                          </p>
                          <p className="text-sm leading-6 text-muted-foreground">
                            {getRiskReason(section.riskLevel)}
                          </p>
                        </div>
                        <div className="flex shrink-0 flex-wrap gap-2 sm:justify-end">
                          {section.score !== null ? <ScoreBadge score={section.score} /> : null}
                          {risk ? <RiskBadge risk={risk} /> : null}
                          {confidence ? <ConfidenceBadge confidence={confidence} /> : null}
                          <Badge variant="outline">
                            {section.answeredCriteria}/{section.totalCriteria} answered
                          </Badge>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <EmptyBlock
                title="No scored risk areas yet"
                description="Highest-risk sections will appear after criteria responses are scored."
              />
            )}
          </div>

          <div className="space-y-3 rounded-md border border-cyan-300/85 bg-background/90 p-4">
            <p className="text-xs font-medium uppercase tracking-normal text-muted-foreground">
              What the data suggests
            </p>
            <div className="rounded-md border border-border/80 bg-muted/15 p-3">
              <p className="text-sm leading-6 text-foreground">{getDiagnosisText(report)}</p>
            </div>
            <div className="border-t pt-3">
              <p className="text-xs font-medium uppercase tracking-normal text-muted-foreground">
                Why this matters
              </p>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">
                These areas determine whether the consultant can confidently scale spend, improve
                conversion flow, and prioritize action without relying on unsupported assumptions.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <ReportSection
        title="Critical findings"
        description="Highest-severity findings first, limited to the most important client discussion points."
        toneClass="border-s-orange-600 border-orange-300/85 bg-orange-50/80"
      >
        {priorityFindings.length > 0 ? (
          <div className="grid gap-4">
            {priorityFindings.map((finding, index) => {
              const confidence = toBadgeConfidenceLevel(finding.confidence);
              const status = toWorkflowStatus(finding.status);

              return (
                <article
                  key={finding.id}
                  className="rounded-md border border-orange-300/85 bg-background/95 p-4 shadow-sm shadow-slate-950/5"
                >
                  <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_280px]">
                    <div className="min-w-0 space-y-3">
                      <div className="space-y-1">
                        <p className="text-xs font-medium uppercase tracking-normal text-muted-foreground">
                          Finding {index + 1} · {formatAuditEnum(finding.sectionKey)}
                        </p>
                        <p className="break-words text-base font-semibold leading-6">
                          {finding.title}
                        </p>
                      </div>
                      <Snippet label="Business impact">{finding.businessImpact}</Snippet>
                      <Snippet label="Evidence">{finding.evidence}</Snippet>
                    </div>
                    <div className="space-y-3 rounded-md border border-orange-300/85 bg-orange-50/85 p-3">
                      <p className="text-xs font-medium uppercase tracking-normal text-muted-foreground">
                        Client discussion priority
                      </p>
                      <div className="flex flex-wrap gap-2">
                        <FindingSeverityBadge severity={finding.severity} />
                        {confidence ? <ConfidenceBadge confidence={confidence} /> : null}
                        {status ? <StatusBadge status={status} /> : null}
                      </div>
                      <MetaLine label="Section" value={formatAuditEnum(finding.sectionKey)} />
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <EmptyBlock
            title="No critical findings recorded yet"
            description="Critical and high findings will appear after audit findings are captured."
          />
        )}
      </ReportSection>

      <ReportSection
        title="Priority recommendations"
        description="Top priority recommendations derived from existing findings."
        toneClass="border-s-emerald-600 border-emerald-300/85 bg-emerald-50/80"
      >
        {topRecommendations.length > 0 ? (
          <div className="grid gap-4">
            {topRecommendations.map((recommendation, index) => {
              const status = toWorkflowStatus(recommendation.status);

              return (
                <article
                  key={recommendation.id}
                  className="rounded-md border border-emerald-300/85 bg-background/95 p-4 shadow-sm shadow-slate-950/5"
                >
                  <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_300px]">
                    <div className="min-w-0 space-y-3">
                      <div className="space-y-1">
                        <p className="text-xs font-medium uppercase tracking-normal text-muted-foreground">
                          Action item {index + 1}
                        </p>
                        <p className="break-words text-base font-semibold leading-6">
                          {recommendation.title}
                        </p>
                      </div>
                      <Snippet label="Expected impact">{recommendation.expectedImpact}</Snippet>
                      <Snippet label="Related finding">{recommendation.finding.title}</Snippet>
                    </div>
                    <div className="space-y-3 rounded-md border border-emerald-300/85 bg-emerald-50/85 p-3">
                      <p className="text-xs font-medium uppercase tracking-normal text-muted-foreground">
                        Delivery context
                      </p>
                      <div className="flex flex-wrap gap-2">
                        <RecommendationPriorityBadge priority={recommendation.priority} />
                        {status ? <StatusBadge status={status} /> : null}
                      </div>
                      <MetaLine
                        label="Owner"
                        value={formatAuditEnum(recommendation.suggestedOwner)}
                      />
                      <MetaLine label="Effort" value={`${recommendation.effort}/5`} />
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <EmptyBlock
            title="No recommendations created yet"
            description="Recommendations will appear once findings are translated into action items."
          />
        )}
      </ReportSection>

      <ReportSection
        title="Experiment roadmap"
        description="Concise preview of prioritized experiments and operational actions."
        toneClass="border-s-purple-600 border-purple-300/85 bg-purple-50/80"
      >
        {roadmapExperiments.length > 0 ? (
          <div className="grid gap-4">
            {roadmapExperiments.map((experiment, index) => (
              <article
                key={experiment.id}
                className="rounded-md border border-purple-300/85 bg-background/95 p-4 shadow-sm shadow-slate-950/5"
              >
                <div className="grid gap-4 xl:grid-cols-[88px_minmax(0,1fr)_320px]">
                  <div className="flex h-12 w-12 items-center justify-center rounded-md border border-purple-300 bg-purple-100 text-sm font-semibold text-purple-900">
                    {index + 1}
                  </div>
                  <div className="min-w-0 space-y-3">
                    <div className="space-y-1">
                      <p className="text-xs font-medium uppercase tracking-normal text-muted-foreground">
                        Roadmap item
                      </p>
                      <p className="break-words text-base font-semibold leading-6">
                        {experiment.proposedChange || experiment.hypothesis}
                      </p>
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <MetaLine label="Funnel stage" value={experiment.funnelStage} />
                      <MetaLine label="Primary metric" value={experiment.primaryMetric} />
                    </div>
                  </div>
                  <div className="space-y-3 rounded-md border border-purple-300/85 bg-purple-50/85 p-3">
                    <p className="text-xs font-medium uppercase tracking-normal text-muted-foreground">
                      Priority signals
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="outline">Priority: {experiment.priorityScore}</Badge>
                      <ExperimentStatusBadge status={experiment.status} />
                      <ExperimentScoreBadge label="Impact" value={experiment.impact} />
                      <ExperimentScoreBadge label="Confidence" value={experiment.confidenceScore} />
                      <Badge variant="neutral">Effort: {experiment.effort}/5</Badge>
                    </div>
                    <MetaLine
                      label="Deadline"
                      value={experiment.deadline ? formatDate(experiment.deadline) : "Not set"}
                    />
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <EmptyBlock
            title="No experiments created yet"
            description="Experiment previews will appear after recommendations are prioritized for testing."
          />
        )}
      </ReportSection>

      <Card className="border-s-4 border-s-slate-600 border-slate-300 bg-slate-50/90">
        <CardHeader>
          <CardTitle>Suggested action plan</CardTitle>
          <p className="text-sm leading-6 text-muted-foreground">
            Simple next steps derived from the current findings, recommendations, and experiments.
          </p>
        </CardHeader>
        <CardContent className="grid gap-4 lg:grid-cols-3">
          {actionPlan.map((item) => (
            <div key={item.label} className="rounded-md border bg-background/90 p-4 shadow-sm shadow-slate-950/5">
              <div className="flex items-center gap-2">
                <Badge variant="outline">{item.step}</Badge>
                <p className="text-xs font-medium uppercase tracking-normal text-muted-foreground">
                  {item.label}
                </p>
              </div>
              <p className="mt-2 text-sm leading-6 text-foreground">{item.value}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

function HealthTile({
  label,
  tone,
  children,
}: {
  label: string;
  tone: "audits" | "findings" | "recommendations" | "experiments" | "neutral";
  children: ReactNode;
}) {
  const toneClass = {
    audits: "border-s-cyan-600 border-cyan-300/85 bg-cyan-50/80",
    findings: "border-s-orange-600 border-orange-300/85 bg-orange-50/80",
    recommendations: "border-s-emerald-600 border-emerald-300/85 bg-emerald-50/80",
    experiments: "border-s-purple-600 border-purple-300/85 bg-purple-50/80",
    neutral: "border-s-slate-400 border-border/80 bg-card",
  }[tone];

  return (
    <Card className={`border-s-4 ${toneClass}`}>
      <CardContent className="space-y-3 p-4">
        <p className="text-xs font-medium uppercase tracking-normal text-muted-foreground">
          {label}
        </p>
        <div className="break-words text-2xl font-semibold leading-8">{children}</div>
      </CardContent>
    </Card>
  );
}

function ReportSection({
  title,
  description,
  toneClass,
  children,
}: {
  title: string;
  description: string;
  toneClass: string;
  children: ReactNode;
}) {
  return (
    <Card className={`border-s-4 ${toneClass}`}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <p className="text-sm leading-6 text-muted-foreground">{description}</p>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

function MetaLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-border/80 bg-muted/20 p-3">
      <p className="text-xs font-medium uppercase tracking-normal text-muted-foreground">
        {label}
      </p>
      <p className="mt-1 break-words text-sm leading-6 text-foreground">{value}</p>
    </div>
  );
}

function Snippet({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="rounded-md border border-border/80 bg-muted/20 p-3">
      <p className="text-xs font-medium uppercase tracking-normal text-muted-foreground">
        {label}
      </p>
      <p className="mt-1 line-clamp-3 break-words text-sm leading-6 text-muted-foreground">
        {children}
      </p>
    </div>
  );
}

function EmptyBlock({ title, description }: { title: string; description: string }) {
  return (
    <div className="rounded-md border border-dashed bg-background/70 p-6 text-center">
      <p className="text-sm font-medium">{title}</p>
      <p className="mt-1 text-sm leading-6 text-muted-foreground">{description}</p>
    </div>
  );
}

function buildClientSummary({
  overallScore,
  overallConfidence,
  readinessLabel,
  completionPercentage,
  highestRiskSections,
  criticalHighFindingsCount,
  recommendationsCount,
  experimentsCount,
}: {
  overallScore: number | null;
  overallConfidence: string | null;
  readinessLabel: string;
  completionPercentage: number;
  highestRiskSections: Array<{ sectionName: string; riskLevel: string | null }>;
  criticalHighFindingsCount: number;
  recommendationsCount: number;
  experimentsCount: number;
}) {
  const scoreText =
    overallScore === null
      ? "The audit is not fully scored yet, so conclusions should be treated as a partial diagnostic"
      : `The audit currently scores ${formatScore(overallScore)} with ${formatAuditEnum(
          overallConfidence,
        ).toLowerCase()} confidence`;
  const riskText =
    highestRiskSections.length > 0
      ? `The main risk areas are ${highestRiskSections
          .slice(0, 3)
          .map((section) => `${section.sectionName} (${formatAuditEnum(section.riskLevel)})`)
          .join(", ")}`
      : "The main risk areas are not available until more criteria are scored";

  return `${scoreText}. The current readiness signal is ${readinessLabel.toLowerCase()}, with ${completionPercentage}% of criteria completed. ${riskText}. The report includes ${criticalHighFindingsCount} critical/high findings, ${recommendationsCount} recommendations, and ${experimentsCount} experiments to guide the next action discussion.`;
}

function getDiagnosisText(report: ReturnType<typeof buildAuditReportModel>) {
  if (report.highestRiskSections.length === 0) {
    return "The diagnosis is incomplete because no scored risk sections are available yet.";
  }

  const sectionNames = report.highestRiskSections
    .slice(0, 3)
    .map((section) => section.sectionName)
    .join(", ");

  return `The current audit points to ${sectionNames} as the main areas to review before treating the account as ready to scale. This is supported by ${report.criticalOrHighFindings.length} critical/high findings and ${report.topRecommendations.length} prioritized recommendations.`;
}

function getRiskReason(riskLevel: string | null) {
  switch (riskLevel) {
    case "CRITICAL_GAP":
      return "Critical gap: this area can block confident scaling decisions.";
    case "RISK_AREA":
      return "Risk area: this area may create material friction or unreliable interpretation.";
    case "NEEDS_IMPROVEMENT":
      return "Needs improvement: this area should be tightened before it is treated as stable.";
    case "STRONG":
      return "Strong: this area is comparatively stable but still included in the report view.";
    default:
      return "More scored responses are needed before risk can be interpreted.";
  }
}

function buildActionPlan({
  completionPercentage,
  criticalHighFindingsCount,
  topRecommendations,
  roadmapExperiments,
}: {
  completionPercentage: number;
  criticalHighFindingsCount: number;
  topRecommendations: Array<{ title: string }>;
  roadmapExperiments: Array<{ primaryMetric: string; proposedChange: string }>;
}) {
  const firstRecommendation = topRecommendations[0]?.title;
  const firstExperiment = roadmapExperiments[0];

  return [
    {
      step: "Step 1",
      label: "Immediate actions",
      value:
        criticalHighFindingsCount > 0
          ? "Review the critical/high findings and confirm which blockers must be addressed before scaling decisions."
          : "Review the current findings and complete any missing criteria before presenting final conclusions.",
    },
    {
      step: "Step 2",
      label: "Short-term actions",
      value: firstRecommendation
        ? `Prioritize the top recommendation: ${firstRecommendation}.`
        : "Create recommendations from accepted findings before defining the next action sequence.",
    },
    {
      step: "Step 3",
      label: "Next measurement step",
      value: firstExperiment
        ? `Track ${firstExperiment.primaryMetric} for the proposed change: ${firstExperiment.proposedChange}.`
        : completionPercentage < 100
          ? "Complete unanswered criteria so section scores and confidence can be interpreted more reliably."
          : "Select the primary metric for the next approved experiment before implementation.",
    },
  ];
}

function getClientReadiness({
  overallRiskLevel,
  overallScore,
  scalingReadiness,
}: {
  overallRiskLevel: string | null;
  overallScore: number | null;
  scalingReadiness: string | null;
}) {
  const capturedValue = scalingReadiness?.trim();

  if (capturedValue && !isGenericReadinessValue(capturedValue)) {
    const normalizedValue = capturedValue.toUpperCase().replace(/\s+/g, "_");

    if (
      normalizedValue.includes("BLOCK") ||
      normalizedValue.includes("NOT_READY") ||
      normalizedValue.includes("NOT_TO_SCALE")
    ) {
      return {
        label: formatAuditEnum(capturedValue),
        tone: "findings" as const,
        variant: "danger" as const,
      };
    }

    if (
      normalizedValue.includes("CAUTION") ||
      normalizedValue.includes("INTERVENTION") ||
      normalizedValue.includes("NEED")
    ) {
      return {
        label: formatAuditEnum(capturedValue),
        tone: "findings" as const,
        variant: "warning" as const,
      };
    }

    return {
      label: formatAuditEnum(capturedValue),
      tone: "recommendations" as const,
      variant: "success" as const,
    };
  }

  if (overallRiskLevel === "CRITICAL_GAP" || (overallScore !== null && overallScore < 40)) {
    return {
      label: "Scaling Blocked",
      tone: "findings" as const,
      variant: "danger" as const,
    };
  }

  if (overallRiskLevel === "RISK_AREA" || (overallScore !== null && overallScore < 60)) {
    return {
      label: "Needs Intervention",
      tone: "findings" as const,
      variant: "warning" as const,
    };
  }

  if (overallRiskLevel === "NEEDS_IMPROVEMENT" || (overallScore !== null && overallScore < 80)) {
    return {
      label: "Ready With Caution",
      tone: "audits" as const,
      variant: "warning" as const,
    };
  }

  if (overallRiskLevel === "STRONG" || (overallScore !== null && overallScore >= 80)) {
    return {
      label: "Ready to Scale",
      tone: "recommendations" as const,
      variant: "success" as const,
    };
  }

  return {
    label: "Readiness Not Assessed",
    tone: "neutral" as const,
    variant: "neutral" as const,
  };
}

function isGenericReadinessValue(value: string) {
  return ["CAPTURED", "NOT_CAPTURED", "NOT CAPTURED", "TRUE", "FALSE", "YES", "NO"].includes(
    value.trim().toUpperCase(),
  );
}
