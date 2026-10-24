import Link from "next/link";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { ArrowLeft, ExternalLink } from "lucide-react";

import { ExperimentScoreBadge } from "@/components/experiments/experiment-score-badge";
import { ExperimentStatusBadge } from "@/components/experiments/experiment-status-badge";
import { FindingSeverityBadge } from "@/components/findings/finding-severity-badge";
import { ExperimentEditForm } from "@/components/forms/experiment-edit-form";
import { ConfidenceBadge } from "@/components/layout/confidence-badge";
import { PageHeader } from "@/components/layout/page-header";
import { StatusBadge } from "@/components/layout/status-badge";
import { RecommendationPriorityBadge } from "@/components/recommendations/recommendation-priority-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatAuditEnum, toBadgeConfidenceLevel, toWorkflowStatus } from "@/lib/audits/format";
import { formatDate } from "@/lib/brands/format";
import { getExperimentDetail } from "@/lib/experiments/queries";

export const dynamic = "force-dynamic";

export default async function ExperimentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const experiment = await getExperimentDetail(id);

  if (!experiment) {
    notFound();
  }

  const recommendationConfidence = toBadgeConfidenceLevel(experiment.recommendation?.confidence);
  const recommendationStatus = toWorkflowStatus(experiment.recommendation?.status);
  const findingConfidence = toBadgeConfidenceLevel(experiment.finding?.confidence);
  const findingStatus = toWorkflowStatus(experiment.finding?.status);

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Experiment detail"
        title={experiment.hypothesis}
        description="Review experiment context, scoring, related recommendation and finding, results, learnings, and editable workflow fields."
        tone="experiments"
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Button asChild variant="outline">
              <Link href="/experiments">
                <ArrowLeft className="me-2 h-4 w-4" aria-hidden="true" />
                Back to experiments
              </Link>
            </Button>
            {experiment.recommendation ? (
              <Button asChild variant="outline">
                <Link href={`/recommendations/${experiment.recommendation.id}`}>
                  Open recommendation
                </Link>
              </Button>
            ) : null}
            {experiment.finding ? (
              <Button asChild variant="outline">
                <Link href={`/findings/${experiment.finding.id}`}>Open finding</Link>
              </Button>
            ) : null}
            <Button asChild variant="outline">
              <Link href={`/brands/${experiment.brand.id}`}>Open brand</Link>
            </Button>
            <Button asChild>
              <Link href={`/audits/${experiment.audit.id}`}>Open related audit</Link>
            </Button>
          </div>
        }
      />

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-6">
        <SummaryCard label="Status">
          <ExperimentStatusBadge status={experiment.status} />
        </SummaryCard>
        <SummaryCard label="Primary metric">{experiment.primaryMetric}</SummaryCard>
        <SummaryCard label="Impact">
          <ExperimentScoreBadge label="Impact" value={experiment.impact} />
        </SummaryCard>
        <SummaryCard label="Confidence">
          <ExperimentScoreBadge label="Confidence" value={experiment.confidenceScore} />
        </SummaryCard>
        <SummaryCard label="Effort">
          <ExperimentScoreBadge label="Effort" value={experiment.effort} />
        </SummaryCard>
        <SummaryCard label="Priority">
          <Badge variant="outline">{experiment.priorityScore}</Badge>
        </SummaryCard>
      </section>

      <section className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_380px]">
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Experiment context</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <DetailBlock label="Hypothesis" value={experiment.hypothesis} />
              <DetailBlock label="Problem observed" value={experiment.problemObserved} />
              <DetailBlock label="Evidence" value={experiment.evidence} />
              <DetailBlock label="Proposed change" value={experiment.proposedChange} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Result and learning</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <DetailBlock
                label="Result"
                value={experiment.result || "No result captured yet."}
              />
              <DetailBlock
                label="Learning"
                value={experiment.learning || "No learning captured yet."}
              />
              <DetailBlock
                label="Next action"
                value={experiment.nextAction || "No next action captured yet."}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Related recommendation</CardTitle>
            </CardHeader>
            <CardContent>
              {experiment.recommendation ? (
                <div className="space-y-5">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0 space-y-1">
                      <Link
                        href={`/recommendations/${experiment.recommendation.id}`}
                        className="text-sm font-medium hover:text-primary"
                      >
                        {experiment.recommendation.title}
                      </Link>
                      <p className="text-sm leading-6 text-muted-foreground">
                        {experiment.recommendation.expectedImpact}
                      </p>
                    </div>
                    <Button asChild variant="outline" size="sm">
                      <Link href={`/recommendations/${experiment.recommendation.id}`}>
                        Open recommendation
                      </Link>
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {experiment.recommendation.priority ? (
                      <RecommendationPriorityBadge priority={experiment.recommendation.priority} />
                    ) : null}
                    {recommendationConfidence ? (
                      <ConfidenceBadge confidence={recommendationConfidence} />
                    ) : null}
                    {recommendationStatus ? <StatusBadge status={recommendationStatus} /> : null}
                    {experiment.recommendation.suggestedOwner ? (
                      <Badge variant="neutral">
                        {formatAuditEnum(experiment.recommendation.suggestedOwner)}
                      </Badge>
                    ) : null}
                  </div>
                </div>
              ) : (
                <p className="rounded-md border border-dashed p-4 text-sm leading-6 text-muted-foreground">
                  This experiment is not linked to a recommendation.
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Related finding</CardTitle>
            </CardHeader>
            <CardContent>
              {experiment.finding ? (
                <div className="space-y-5">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0 space-y-1">
                      <Link
                        href={`/findings/${experiment.finding.id}`}
                        className="text-sm font-medium hover:text-primary"
                      >
                        {experiment.finding.title}
                      </Link>
                      {experiment.finding.description ? (
                        <p className="text-sm leading-6 text-muted-foreground">
                          {experiment.finding.description}
                        </p>
                      ) : null}
                    </div>
                    <Button asChild variant="outline" size="sm">
                      <Link href={`/findings/${experiment.finding.id}`}>Open finding</Link>
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {experiment.finding.severity ? (
                      <FindingSeverityBadge severity={experiment.finding.severity} />
                    ) : null}
                    {findingConfidence ? <ConfidenceBadge confidence={findingConfidence} /> : null}
                    {findingStatus ? <StatusBadge status={findingStatus} /> : null}
                  </div>
                  {experiment.finding.businessImpact ? (
                    <DetailBlock
                      label="Finding business impact"
                      value={experiment.finding.businessImpact}
                    />
                  ) : null}
                </div>
              ) : (
                <p className="rounded-md border border-dashed p-4 text-sm leading-6 text-muted-foreground">
                  No linked finding context is available for this experiment.
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Linked evidence</CardTitle>
            </CardHeader>
            <CardContent>
              {experiment.evidenceItems.length > 0 ? (
                <div className="space-y-3">
                  {experiment.evidenceItems.map((evidence) => (
                    <div key={evidence.id} className="rounded-md border border-border/80 bg-muted/10 p-3">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-sm font-medium">{evidence.title}</p>
                          {evidence.description ? (
                            <p className="mt-1 text-sm leading-6 text-muted-foreground">
                              {evidence.description}
                            </p>
                          ) : null}
                        </div>
                        {evidence.url ? (
                          <Button asChild variant="outline" size="sm">
                            <a href={evidence.url} target="_blank" rel="noreferrer">
                              Open
                              <ExternalLink className="ms-2 h-4 w-4" aria-hidden="true" />
                            </a>
                          </Button>
                        ) : null}
                      </div>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {evidence.source ? <Badge variant="neutral">{evidence.source}</Badge> : null}
                        {evidence.metricName ? (
                          <Badge variant="outline">
                            {evidence.metricName}
                            {evidence.metricValue ? `: ${evidence.metricValue}` : ""}
                          </Badge>
                        ) : null}
                        <Badge variant="neutral">{formatDate(evidence.createdAt)}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="rounded-md border border-dashed p-4 text-sm leading-6 text-muted-foreground">
                  No linked evidence items are attached to this experiment yet.
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        <aside className="space-y-4 xl:sticky xl:top-6 xl:self-start">
          <Card>
            <CardHeader>
              <CardTitle>Related context</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <DetailBlock
                label="Brand"
                value={
                  <Link
                    href={`/brands/${experiment.brand.id}`}
                    className="font-medium hover:text-primary"
                  >
                    {experiment.brand.name}
                  </Link>
                }
              />
              <DetailBlock
                label="Audit"
                value={
                  <Link
                    href={`/audits/${experiment.audit.id}`}
                    className="font-medium hover:text-primary"
                  >
                    {experiment.audit.title}
                  </Link>
                }
              />
              <DetailBlock label="Audit date" value={formatDate(experiment.audit.auditDate)} />
              <DetailBlock label="Audit section" value={experiment.sectionName} />
              <DetailBlock label="Owner" value={formatAuditEnum(experiment.owner)} />
              <DetailBlock label="Ease" value={`${experiment.ease} / 5`} />
              <DetailBlock
                label="Secondary metric"
                value={experiment.secondaryMetric || "Not set"}
              />
              <DetailBlock
                label="Deadline"
                value={experiment.deadline ? formatDate(experiment.deadline) : "Not set"}
              />
              <DetailBlock label="Created" value={formatDate(experiment.createdAt)} />
              <DetailBlock label="Updated" value={formatDate(experiment.updatedAt)} />
            </CardContent>
          </Card>
        </aside>
      </section>

      <ExperimentEditForm
        key={`${experiment.id}-${experiment.updatedAt.toISOString()}`}
        experiment={{
          id: experiment.id,
          funnelStage: experiment.funnelStage,
          problemObserved: experiment.problemObserved,
          evidence: experiment.evidence,
          hypothesis: experiment.hypothesis,
          proposedChange: experiment.proposedChange,
          primaryMetric: experiment.primaryMetric,
          secondaryMetric: experiment.secondaryMetric ?? "",
          impact: experiment.impact,
          confidenceScore: experiment.confidenceScore,
          ease: experiment.ease,
          effort: experiment.effort,
          owner: experiment.owner,
          status: experiment.status,
          result: experiment.result ?? "",
          learning: experiment.learning ?? "",
          nextAction: experiment.nextAction ?? "",
          deadline: toDateInputValue(experiment.deadline),
        }}
      />
    </div>
  );
}

function SummaryCard({ label, children }: { label: string; children: ReactNode }) {
  return (
    <Card className="transition-colors hover:border-primary/25">
      <CardContent className="space-y-2 p-5">
        <p className="text-xs font-medium uppercase tracking-normal text-muted-foreground">
          {label}
        </p>
        <div className="min-w-0 break-words text-sm font-medium">{children}</div>
      </CardContent>
    </Card>
  );
}

function DetailBlock({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="space-y-1">
      <p className="text-xs font-medium uppercase tracking-normal text-muted-foreground">
        {label}
      </p>
      <div className="break-words text-sm leading-6 text-foreground">{value}</div>
    </div>
  );
}

function toDateInputValue(value: Date | null) {
  return value ? value.toISOString().slice(0, 10) : "";
}
