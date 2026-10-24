import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowUpRight, Download, FileText } from "lucide-react";

import { ExperimentRoadmapPreview } from "@/components/reports/experiment-roadmap-preview";
import { PriorityFindingsPreview } from "@/components/reports/priority-findings-preview";
import { ReportHealthCard } from "@/components/reports/report-health-card";
import { SectionScoreSummary } from "@/components/reports/section-score-summary";
import { TopRecommendationsPreview } from "@/components/reports/top-recommendations-preview";
import { ConfidenceBadge } from "@/components/layout/confidence-badge";
import { PageHeader } from "@/components/layout/page-header";
import { RiskBadge } from "@/components/layout/risk-badge";
import { ScoreBadge } from "@/components/layout/score-badge";
import { StatusBadge } from "@/components/layout/status-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toBadgeConfidenceLevel, toBadgeRiskLevel } from "@/lib/audits/format";
import { formatDate } from "@/lib/brands/format";
import { buildAuditReportModel } from "@/lib/reports/audit-report";
import { getAuditReport } from "@/lib/reports/queries";

export const dynamic = "force-dynamic";

export default async function AuditSummaryPage({
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
  const isIncomplete = report.scoreSummary.completionPercentage < 100;

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow={`${audit.brand.name} · ${formatDate(audit.auditDate)}`}
        title={`${audit.title} Report`}
        description="Consultant-readable audit summary for score health, risk areas, findings, recommendations, experiments, and next actions."
        tone="reports"
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Button asChild variant="outline">
              <Link href={`/audits/${audit.id}`}>
                <ArrowLeft className="me-2 h-4 w-4" aria-hidden="true" />
                Audit Workspace
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link href={`/exports?auditId=${encodeURIComponent(audit.id)}`}>
                <Download className="me-2 h-4 w-4" aria-hidden="true" />
                Export Center
              </Link>
            </Button>
            <Button asChild>
              <Link href={`/audits/${audit.id}/report`}>
                <FileText className="me-2 h-4 w-4" aria-hidden="true" />
                Client-ready report
              </Link>
            </Button>
            <StatusBadge status="draft" />
          </div>
        }
      />

      <Card className="border-s-4 border-s-slate-600 border-slate-300 bg-slate-50/90">
        <CardHeader className="gap-2">
          <div className="flex items-start gap-3">
            <span
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-slate-300 bg-slate-100 text-slate-900"
              aria-hidden="true"
            >
              <FileText className="h-5 w-5" />
            </span>
            <div className="min-w-0">
              <CardTitle>Executive summary</CardTitle>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">
                Rule-based summary generated from current audit scores and workflow data.
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {isIncomplete ? (
            <div className="rounded-md border border-amber-400/80 bg-amber-100 p-3 text-sm leading-6 text-amber-950">
              This audit is {report.scoreSummary.completionPercentage}% complete. Treat score and
              risk interpretation as directional until remaining criteria are answered.
            </div>
          ) : null}
          <ul className="space-y-3">
            {report.executiveSummary.map((summaryItem) => (
              <li
                key={summaryItem}
                className="rounded-md border border-border/80 bg-background/85 p-3 text-sm leading-6 text-foreground"
              >
                {summaryItem}
              </li>
            ))}
          </ul>
          {audit.summary ? (
            <div className="rounded-md border border-border/80 bg-background/85 p-4">
              <p className="text-xs font-medium uppercase tracking-normal text-muted-foreground">
                Captured audit summary
              </p>
              <p className="mt-2 break-words text-sm leading-6 text-muted-foreground">
                {audit.summary}
              </p>
            </div>
          ) : null}
        </CardContent>
      </Card>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <ReportHealthCard
          label="Overall score"
          value={
            report.overallScore !== null ? (
              <ScoreBadge score={report.overallScore} />
            ) : (
              <Badge variant="neutral">Not scored yet</Badge>
            )
          }
          helper="Weighted average of scored PMCAS sections."
          tone="audits"
        />
        <ReportHealthCard
          label="Completion"
          value={`${report.scoreSummary.completionPercentage}%`}
          helper={`${report.scoreSummary.answeredCriteria} of ${report.scoreSummary.totalCriteria} criteria answered.`}
          tone={isIncomplete ? "findings" : "audits"}
        />
        <ReportHealthCard
          label="Overall confidence"
          value={
            overallConfidence ? (
              <ConfidenceBadge confidence={overallConfidence} />
            ) : (
              <Badge variant="neutral">No confidence</Badge>
            )
          }
          helper="Confidence reflects the evidence strength behind scored responses."
          tone="neutral"
        />
        <ReportHealthCard
          label="Scaling readiness"
          value={audit.scalingReadiness ? "Captured" : "Not captured"}
          helper={audit.scalingReadiness ?? "Add a scaling readiness note in the audit workspace."}
          tone={audit.scalingReadiness ? "recommendations" : "neutral"}
        />
        <ReportHealthCard
          label="Findings"
          value={audit.findings.length}
          helper={`${report.criticalOrHighFindings.length} critical/high findings.`}
          tone="findings"
        />
        <ReportHealthCard
          label="Recommendations"
          value={audit.recommendations.length}
          helper="Action items tied to audit findings."
          tone="recommendations"
        />
        <ReportHealthCard
          label="Experiments"
          value={audit.experiments.length}
          helper="Prioritized tests and operational actions."
          tone="experiments"
        />
        <ReportHealthCard
          label="Risk level"
          value={
            overallRisk ? (
              <RiskBadge risk={overallRisk} />
            ) : (
              <Badge variant="neutral">No risk yet</Badge>
            )
          }
          helper="Derived from the current overall audit score."
          tone="audits"
        />
      </section>

      <SectionScoreSummary auditId={audit.id} sections={report.sections} />

      <Card className="border-s-4 border-s-red-600 border-red-300/80 bg-red-50/75">
        <CardHeader>
          <CardTitle>Highest-risk sections</CardTitle>
          <p className="text-sm leading-6 text-muted-foreground">
            Sections sorted by PMCAS risk level using the same score summary as the workspace and
            exports.
          </p>
        </CardHeader>
        <CardContent>
          {report.highestRiskSections.length > 0 ? (
            <div className="grid gap-4 lg:grid-cols-2">
              {report.highestRiskSections.map((section) => {
                const risk = toBadgeRiskLevel(section.riskLevel);

                return (
                  <article
                    key={section.sectionId}
                    className="rounded-md border border-red-300/80 bg-background/90 p-4 shadow-sm shadow-slate-950/5"
                  >
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div className="min-w-0 space-y-2">
                        <Link
                          href={`/audits/${audit.id}#section-${section.sectionId}`}
                          className="block break-words text-sm font-semibold leading-6 hover:text-primary"
                        >
                          {section.sectionName}
                        </Link>
                        <p className="text-sm leading-6 text-muted-foreground">
                          {getRiskReason(section.riskLevel)}
                        </p>
                      </div>
                      <div className="flex shrink-0 flex-wrap gap-2 sm:justify-end">
                        {section.score !== null ? <ScoreBadge score={section.score} /> : null}
                        {risk ? <RiskBadge risk={risk} /> : null}
                        <Badge variant="outline">
                          {section.answeredCriteria}/{section.totalCriteria} answered
                        </Badge>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="rounded-md border border-dashed bg-background/70 p-6 text-center">
              <p className="text-sm font-medium">No highest-risk sections yet</p>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">
                Risk areas will appear after criteria responses are scored.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <PriorityFindingsPreview findings={report.priorityFindings} />

      <TopRecommendationsPreview recommendations={report.topRecommendations} />

      <ExperimentRoadmapPreview experiments={report.experimentPreview} />

      <Card className="border-s-4 border-s-cyan-600 border-cyan-300/85 bg-cyan-50/80">
        <CardHeader>
          <CardTitle>Suggested next action</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
          <div className="space-y-3">
            <p className="text-sm leading-6 text-muted-foreground">
              Review critical findings, prioritize the top recommendations, confirm which
              experiments should move forward, then download the Full Audit Workbook for review or
              sharing.
            </p>
            <div className="flex flex-wrap gap-2">
              <Badge variant="warning">Review critical findings</Badge>
              <Badge variant="success">Prioritize recommendations</Badge>
              <Badge variant="outline">Prepare workbook output</Badge>
            </div>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row lg:flex-col">
            <Button asChild>
              <Link href={`/exports?auditId=${encodeURIComponent(audit.id)}`}>
                Download workbook
                <ArrowUpRight className="ms-2 h-4 w-4" aria-hidden="true" />
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link href={`/audits/${audit.id}`}>Back to workspace</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function getRiskReason(riskLevel: string | null) {
  switch (riskLevel) {
    case "CRITICAL_GAP":
      return "This area is likely blocking reliable scaling decisions and should be reviewed first.";
    case "RISK_AREA":
      return "This area may be creating material friction or unreliable performance interpretation.";
    case "NEEDS_IMPROVEMENT":
      return "This area has gaps that should be addressed before it is treated as stable.";
    case "STRONG":
      return "This area appears comparatively stable, but it remains part of the risk ordering.";
    default:
      return "This section needs more scored responses before risk can be interpreted.";
  }
}
