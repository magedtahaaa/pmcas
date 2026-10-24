import Link from "next/link";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { ArrowLeft, ExternalLink } from "lucide-react";

import { FindingSeverityBadge } from "@/components/findings/finding-severity-badge";
import { FindingEditForm } from "@/components/forms/finding-edit-form";
import { ConfidenceBadge } from "@/components/layout/confidence-badge";
import { PageHeader } from "@/components/layout/page-header";
import { StatusBadge } from "@/components/layout/status-badge";
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
import { formatDate } from "@/lib/brands/format";
import {
  formatAuditEnum,
  toBadgeConfidenceLevel,
  toWorkflowStatus,
} from "@/lib/audits/format";
import { getFindingDetail } from "@/lib/findings/queries";

export const dynamic = "force-dynamic";

export default async function FindingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const finding = await getFindingDetail(id);

  if (!finding) {
    notFound();
  }

  const confidence = toBadgeConfidenceLevel(finding.confidence);
  const status = toWorkflowStatus(finding.status);

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Finding detail"
        title={finding.title}
        description="Review evidence, related context, linked recommendations, and edit consultant-controlled finding fields."
        tone="findings"
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Button asChild variant="outline">
              <Link href="/findings">
                <ArrowLeft className="me-2 h-4 w-4" aria-hidden="true" />
                Back to findings
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link href={`/brands/${finding.brand.id}`}>Open brand</Link>
            </Button>
            <Button asChild>
              <Link href={`/audits/${finding.audit.id}`}>Open related audit</Link>
            </Button>
          </div>
        }
      />

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard label="Severity">
          <FindingSeverityBadge severity={finding.severity} />
        </SummaryCard>
        <SummaryCard label="Confidence">
          {confidence ? <ConfidenceBadge confidence={confidence} /> : "Not set"}
        </SummaryCard>
        <SummaryCard label="Status">
          {status ? <StatusBadge status={status} /> : "Not set"}
        </SummaryCard>
        <SummaryCard label="Recommendations">
          <Badge variant="outline">{finding.recommendationCount}</Badge>
        </SummaryCard>
      </section>

      <section className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_380px]">
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Finding context</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <DetailBlock label="Description" value={finding.description} />
              <DetailBlock label="Business impact" value={finding.businessImpact} />
              <DetailBlock label="Evidence summary" value={finding.evidenceSummary} />
              {finding.relatedMetricName || finding.relatedMetricValue ? (
                <DetailBlock
                  label="Related metric"
                  value={`${finding.relatedMetricName ?? "Metric"}: ${
                    finding.relatedMetricValue ?? "Not set"
                  }`}
                />
              ) : null}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Linked evidence</CardTitle>
            </CardHeader>
            <CardContent>
              {finding.evidenceItems.length > 0 ? (
                <div className="space-y-3">
                  {finding.evidenceItems.map((evidence) => (
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
                  No linked evidence items are attached yet. The finding evidence summary is still available above.
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Linked recommendations</CardTitle>
            </CardHeader>
            <CardContent>
              {finding.recommendations.length > 0 ? (
                <div className="overflow-x-auto rounded-md border border-border/80">
                  <Table className="min-w-[760px]">
                    <TableHeader>
                      <TableRow>
                        <TableHead>Recommendation</TableHead>
                        <TableHead>Priority</TableHead>
                        <TableHead>Owner</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Experiments</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {finding.recommendations.map((recommendation) => {
                        const recommendationStatus = toWorkflowStatus(recommendation.status);

                        return (
                          <TableRow key={recommendation.id}>
                            <TableCell>
                              <div className="w-72 space-y-1">
                                <Link
                                  href={`/recommendations/${recommendation.id}`}
                                  className="block whitespace-normal break-words font-medium hover:text-primary"
                                >
                                  {recommendation.title}
                                </Link>
                                <p className="line-clamp-3 whitespace-normal break-words text-xs leading-5 text-muted-foreground">
                                  {recommendation.expectedImpact}
                                </p>
                              </div>
                            </TableCell>
                            <TableCell>
                              <PriorityBadge priority={recommendation.priority} />
                            </TableCell>
                            <TableCell>
                              <span className="block w-36 whitespace-normal break-words">
                                {formatAuditEnum(recommendation.suggestedOwner)}
                              </span>
                            </TableCell>
                            <TableCell>
                              {recommendationStatus ? (
                                <StatusBadge status={recommendationStatus} />
                              ) : (
                                "Not set"
                              )}
                            </TableCell>
                            <TableCell>{recommendation.experimentCount}</TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <p className="rounded-md border border-dashed p-4 text-sm leading-6 text-muted-foreground">
                  No recommendations are linked to this finding yet.
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
                  <Link href={`/brands/${finding.brand.id}`} className="font-medium hover:text-primary">
                    {finding.brand.name}
                  </Link>
                }
              />
              <DetailBlock
                label="Audit"
                value={
                  <Link href={`/audits/${finding.audit.id}`} className="font-medium hover:text-primary">
                    {finding.audit.title}
                  </Link>
                }
              />
              <DetailBlock label="Audit date" value={formatDate(finding.audit.auditDate)} />
              <DetailBlock label="Audit section" value={finding.sectionName} />
              <DetailBlock label="Created" value={formatDate(finding.createdAt)} />
              <DetailBlock label="Updated" value={formatDate(finding.updatedAt)} />
              {finding.auditResponse ? (
                <DetailBlock
                  label="Linked criterion response"
                  value={`${finding.auditResponse.criteriaTitle} (${finding.auditResponse.score0To5} / 5)`}
                />
              ) : null}
            </CardContent>
          </Card>
        </aside>
      </section>

      <FindingEditForm
        finding={{
          id: finding.id,
          title: finding.title,
          description: finding.description,
          evidence: finding.evidenceSummary,
          businessImpact: finding.businessImpact,
          severity: finding.severity,
          confidence: finding.confidence,
          status: finding.status,
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

function PriorityBadge({ priority }: { priority: string }) {
  const variant =
    priority === "CRITICAL" ? "danger" : priority === "LOW" ? "neutral" : "warning";
  const className =
    priority === "HIGH" ? "border-blue-200 bg-blue-50 text-blue-700" : undefined;

  return (
    <Badge variant={variant} className={className}>
      {formatAuditEnum(priority)}
    </Badge>
  );
}
