import Link from "next/link";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { ArrowLeft, ExternalLink } from "lucide-react";

import { RecommendationEditForm } from "@/components/forms/recommendation-edit-form";
import { ExperimentStatusBadge } from "@/components/experiments/experiment-status-badge";
import { FindingSeverityBadge } from "@/components/findings/finding-severity-badge";
import { ConfidenceBadge } from "@/components/layout/confidence-badge";
import { PageHeader } from "@/components/layout/page-header";
import { StatusBadge } from "@/components/layout/status-badge";
import { RecommendationPriorityBadge } from "@/components/recommendations/recommendation-priority-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  formatAuditEnum,
  toBadgeConfidenceLevel,
  toWorkflowStatus,
} from "@/lib/audits/format";
import { formatDate } from "@/lib/brands/format";
import { getRecommendationDetail } from "@/lib/recommendations/queries";

export const dynamic = "force-dynamic";

export default async function RecommendationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const recommendation = await getRecommendationDetail(id);

  if (!recommendation) {
    notFound();
  }

  const confidence = toBadgeConfidenceLevel(recommendation.confidence);
  const status = toWorkflowStatus(recommendation.status);
  const findingConfidence = toBadgeConfidenceLevel(recommendation.finding.confidence);
  const findingStatus = toWorkflowStatus(recommendation.finding.status);

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Recommendation detail"
        title={recommendation.title}
        description="Review recommended action context, linked finding evidence, experiments, and editable workflow fields."
        tone="recommendations"
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Button asChild variant="outline">
              <Link href="/recommendations">
                <ArrowLeft className="me-2 h-4 w-4" aria-hidden="true" />
                Back to recommendations
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link href={`/findings/${recommendation.finding.id}`}>Open related finding</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href={`/brands/${recommendation.brand.id}`}>Open brand</Link>
            </Button>
            <Button asChild>
              <Link href={`/audits/${recommendation.audit.id}`}>Open related audit</Link>
            </Button>
          </div>
        }
      />

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-5">
        <SummaryCard label="Priority">
          <RecommendationPriorityBadge priority={recommendation.priority} />
        </SummaryCard>
        <SummaryCard label="Status">
          {status ? <StatusBadge status={status} /> : "Not set"}
        </SummaryCard>
        <SummaryCard label="Owner">
          <Badge variant="neutral">{formatAuditEnum(recommendation.suggestedOwner)}</Badge>
        </SummaryCard>
        <SummaryCard label="Confidence">
          {confidence ? <ConfidenceBadge confidence={confidence} /> : "Not set"}
        </SummaryCard>
        <SummaryCard label="Experiments">
          <Badge variant="outline">{recommendation.experimentCount}</Badge>
        </SummaryCard>
      </section>

      <section className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_380px]">
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recommendation context</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <DetailBlock label="Rationale" value={recommendation.rationale} />
              <DetailBlock label="Expected impact" value={recommendation.expectedImpact} />
              <DetailBlock label="Effort" value={`${recommendation.effort} / 5`} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Linked finding</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0 space-y-1">
                  <Link
                    href={`/findings/${recommendation.finding.id}`}
                    className="text-sm font-medium hover:text-primary"
                  >
                    {recommendation.finding.title}
                  </Link>
                  <p className="text-sm leading-6 text-muted-foreground">
                    {recommendation.finding.description}
                  </p>
                </div>
                <Button asChild variant="outline" size="sm">
                  <Link href={`/findings/${recommendation.finding.id}`}>Open finding</Link>
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                <FindingSeverityBadge severity={recommendation.finding.severity} />
                {findingConfidence ? <ConfidenceBadge confidence={findingConfidence} /> : null}
                {findingStatus ? <StatusBadge status={findingStatus} /> : null}
              </div>
              <DetailBlock label="Finding business impact" value={recommendation.finding.businessImpact} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Linked evidence</CardTitle>
            </CardHeader>
            <CardContent>
              {recommendation.evidenceItems.length > 0 ? (
                <div className="space-y-3">
                  {recommendation.evidenceItems.map((evidence) => (
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
                  No linked evidence items are attached to this recommendation yet.
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Linked experiments</CardTitle>
            </CardHeader>
            <CardContent>
              {recommendation.experiments.length > 0 ? (
                <div className="overflow-x-auto rounded-md border border-border/80">
                  <Table className="min-w-[820px]">
                    <TableHeader>
                      <TableRow>
                        <TableHead>Experiment</TableHead>
                        <TableHead>Primary metric</TableHead>
                        <TableHead>Owner</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Priority</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {recommendation.experiments.map((experiment) => (
                        <TableRow key={experiment.id}>
                          <TableCell>
                            <div className="w-72 space-y-1">
                              <Link
                                href={`/experiments/${experiment.id}`}
                                className="block whitespace-normal break-words font-medium hover:text-primary"
                              >
                                {experiment.funnelStage}
                              </Link>
                              <p className="line-clamp-3 whitespace-normal break-words text-xs leading-5 text-muted-foreground">
                                {experiment.hypothesis}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <span className="block w-48 whitespace-normal break-words">
                              {experiment.primaryMetric}
                            </span>
                          </TableCell>
                          <TableCell>
                            <span className="block w-36 whitespace-normal break-words">
                              {formatAuditEnum(experiment.owner)}
                            </span>
                          </TableCell>
                          <TableCell>
                            <ExperimentStatusBadge status={experiment.status} />
                          </TableCell>
                          <TableCell>{experiment.priorityScore}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <p className="rounded-md border border-dashed p-4 text-sm leading-6 text-muted-foreground">
                  No experiments are linked to this recommendation yet.
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
                    href={`/brands/${recommendation.brand.id}`}
                    className="font-medium hover:text-primary"
                  >
                    {recommendation.brand.name}
                  </Link>
                }
              />
              <DetailBlock
                label="Audit"
                value={
                  <Link
                    href={`/audits/${recommendation.audit.id}`}
                    className="font-medium hover:text-primary"
                  >
                    {recommendation.audit.title}
                  </Link>
                }
              />
              <DetailBlock label="Audit date" value={formatDate(recommendation.audit.auditDate)} />
              <DetailBlock label="Audit section" value={recommendation.sectionName} />
              <DetailBlock label="Created" value={formatDate(recommendation.createdAt)} />
              <DetailBlock label="Updated" value={formatDate(recommendation.updatedAt)} />
            </CardContent>
          </Card>
        </aside>
      </section>

      <RecommendationEditForm
        key={`${recommendation.id}-${recommendation.updatedAt.toISOString()}`}
        recommendation={{
          id: recommendation.id,
          title: recommendation.title,
          rationale: recommendation.rationale,
          expectedImpact: recommendation.expectedImpact,
          effort: recommendation.effort,
          priority: recommendation.priority,
          suggestedOwner: recommendation.suggestedOwner,
          confidence: recommendation.confidence,
          status: recommendation.status,
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
