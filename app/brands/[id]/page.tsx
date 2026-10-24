import Link from "next/link";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { ArrowLeft, ArrowUpRight, ClipboardList, ExternalLink } from "lucide-react";

import { BrandEditPanel } from "@/components/forms/brand-edit-panel";
import type { BrandFormValues } from "@/components/forms/brand-form";
import { StartAuditButton } from "@/components/audit/start-audit-button";
import { ConfidenceBadge } from "@/components/layout/confidence-badge";
import { PageHeader } from "@/components/layout/page-header";
import { RiskBadge } from "@/components/layout/risk-badge";
import { ScoreBadge } from "@/components/layout/score-badge";
import { StatusBadge } from "@/components/layout/status-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  WorkflowMetaGrid,
  WorkflowMetaItem,
} from "@/components/workflow/workflow-list-card";
import {
  formatBusinessModel,
  formatChannels,
  formatDate,
  formatMetricValue,
  formatMoney,
  formatNullable,
  toDecimalInputValue,
} from "@/lib/brands/format";
import { getBrandProfile } from "@/lib/brands/queries";
import { getActiveAuditTemplateSummary } from "@/lib/audits/queries";
import type {
  ConfidenceLevel as BadgeConfidenceLevel,
  RiskLevel as BadgeRiskLevel,
} from "@/types/audit";

export const dynamic = "force-dynamic";

type BrandProfile = NonNullable<Awaited<ReturnType<typeof getBrandProfile>>>;
type BrandAudit = BrandProfile["audits"][number];
type BrandMetric = BrandProfile["metrics"][number];

function toRiskBadgeValue(risk: string | null | undefined): BadgeRiskLevel | null {
  switch (risk) {
    case "STRONG":
      return "strong";
    case "NEEDS_IMPROVEMENT":
      return "needs-improvement";
    case "RISK_AREA":
      return "risk-area";
    case "CRITICAL_GAP":
      return "critical-gap";
    default:
      return null;
  }
}

function toConfidenceBadgeValue(
  confidence: string | null | undefined,
): BadgeConfidenceLevel | null {
  switch (confidence) {
    case "LOW":
      return "low";
    case "MEDIUM":
      return "medium";
    case "HIGH":
      return "high";
    default:
      return null;
  }
}

function DetailItem({
  label,
  value,
}: {
  label: string;
  value: ReactNode;
}) {
  return (
    <div className="space-y-1">
      <dt className="text-xs font-medium uppercase tracking-normal text-muted-foreground">
        {label}
      </dt>
      <dd className="break-words text-sm leading-6 text-foreground">{value}</dd>
    </div>
  );
}

function EmptyPreview({ title, description }: { title: string; description: string }) {
  return (
    <div className="flex min-h-40 flex-col items-center justify-center rounded-md border border-dashed p-6 text-center">
      <ClipboardList className="mb-3 h-6 w-6 text-muted-foreground" aria-hidden="true" />
      <p className="text-sm font-medium">{title}</p>
      <p className="mt-1 max-w-md text-sm leading-6 text-muted-foreground">{description}</p>
    </div>
  );
}

function RelatedAuditCard({
  audit,
  isLatest,
}: {
  audit: BrandAudit;
  isLatest: boolean;
}) {
  const risk = toRiskBadgeValue(audit.overallRisk);
  const confidence = toConfidenceBadgeValue(audit.overallConfidence);

  return (
    <article className="rounded-md border border-border/80 bg-muted/10 p-4 shadow-sm shadow-slate-950/5 transition-colors hover:border-primary/30 hover:bg-muted/20">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0 flex-1 space-y-3">
          <div className="space-y-2">
            <Link
              href={`/audits/${audit.id}`}
              className="block break-words text-sm font-semibold leading-6 text-foreground hover:text-primary"
            >
              {audit.title}
            </Link>
            <div className="flex flex-wrap gap-2">
              {isLatest ? <Badge variant="neutral">Latest</Badge> : null}
              <StatusBadge status="draft" />
              {typeof audit.overallScore === "number" ? (
                <ScoreBadge score={audit.overallScore} />
              ) : (
                <Badge variant="neutral">No score</Badge>
              )}
              {risk ? <RiskBadge risk={risk} /> : <Badge variant="neutral">No risk</Badge>}
              {confidence ? (
                <ConfidenceBadge confidence={confidence} />
              ) : (
                <Badge variant="neutral">No confidence</Badge>
              )}
            </div>
          </div>

          <WorkflowMetaGrid className="sm:grid-cols-2 xl:grid-cols-3">
            <WorkflowMetaItem label="Audit date">{formatDate(audit.auditDate)}</WorkflowMetaItem>
            <WorkflowMetaItem label="Created">{formatDate(audit.createdAt)}</WorkflowMetaItem>
            <WorkflowMetaItem label="Status">
              <StatusBadge status="draft" />
            </WorkflowMetaItem>
          </WorkflowMetaGrid>

          {audit.summary ? (
            <p className="line-clamp-3 break-words text-sm leading-6 text-muted-foreground">
              {audit.summary}
            </p>
          ) : null}
        </div>

        <Button asChild variant="outline" size="sm" className="w-full shrink-0 sm:w-auto">
          <Link href={`/audits/${audit.id}`}>
            Open
            <ArrowUpRight className="ms-2 h-4 w-4" aria-hidden="true" />
          </Link>
        </Button>
      </div>
    </article>
  );
}

function BrandMetricCard({ metric }: { metric: BrandMetric }) {
  return (
    <article className="rounded-md border border-border/80 bg-muted/10 p-4 shadow-sm shadow-slate-950/5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 space-y-2">
          <p className="break-words text-sm font-semibold leading-6 text-foreground">
            {metric.name}
          </p>
          {metric.notes ? (
            <p className="line-clamp-3 break-words text-sm leading-6 text-muted-foreground">
              {metric.notes}
            </p>
          ) : null}
        </div>

        <div className="shrink-0 sm:text-end">
          <p className="break-words text-lg font-semibold leading-7">
            {formatMetricValue(metric.value)}
            {metric.unit ? (
              <span className="text-sm font-normal text-muted-foreground"> {metric.unit}</span>
            ) : null}
          </p>
        </div>
      </div>

      <WorkflowMetaGrid className="mt-4 sm:grid-cols-2 xl:grid-cols-2">
        <WorkflowMetaItem label="Source">{formatNullable(metric.source)}</WorkflowMetaItem>
        <WorkflowMetaItem label="Date">{formatDate(metric.date)}</WorkflowMetaItem>
      </WorkflowMetaGrid>
    </article>
  );
}

export default async function BrandProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [brand, activeAuditTemplate] = await Promise.all([
    getBrandProfile(id),
    getActiveAuditTemplateSummary(),
  ]);

  if (!brand) {
    notFound();
  }

  const latestAudit = brand.audits[0];
  const latestRisk = toRiskBadgeValue(latestAudit?.overallRisk);
  const latestConfidence = toConfidenceBadgeValue(latestAudit?.overallConfidence);
  const editValues: BrandFormValues & { id: string } = {
    id: brand.id,
    name: brand.name,
    industry: brand.industry,
    website: brand.website,
    market: brand.market,
    businessModel: brand.businessModel,
    monthlyAdSpend: toDecimalInputValue(brand.monthlyAdSpend),
    monthlyRevenue: toDecimalInputValue(brand.monthlyRevenue),
    averageOrderValue: toDecimalInputValue(brand.averageOrderValue),
    mainChannels: brand.mainChannels,
    mainGoal: brand.mainGoal,
    notes: brand.notes,
  };

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Brand profile"
        title={brand.name}
        description="Business context, financial baselines, related metrics, and audit history for this client."
        tone="brands"
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Button asChild variant="outline">
              <Link href="/brands">
                <ArrowLeft className="me-2 h-4 w-4" aria-hidden="true" />
                Back to brands
              </Link>
            </Button>
            <StartAuditButton brandId={brand.id} disabled={!activeAuditTemplate} />
            {latestAudit ? (
              <Button asChild>
                <Link href={`/audits/${latestAudit.id}`}>Open latest audit</Link>
              </Button>
            ) : (
              <Button type="button" disabled>
                Open latest audit
              </Button>
            )}
          </div>
        }
      />

      {!activeAuditTemplate ? (
        <Card>
          <CardContent className="py-4">
            <p className="text-sm font-medium">No active audit template is available.</p>
            <p className="mt-1 text-sm leading-6 text-muted-foreground">
              Activate a PMCAS audit template before creating a new audit for this brand.
            </p>
          </CardContent>
        </Card>
      ) : null}

      <section className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Monthly ad spend</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">{formatMoney(brand.monthlyAdSpend)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Monthly revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">{formatMoney(brand.monthlyRevenue)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Average order value</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">{formatMoney(brand.averageOrderValue)}</p>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_360px]">
        <Card>
          <CardHeader>
            <CardTitle>Brand overview</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="grid gap-5 md:grid-cols-2">
              <DetailItem label="Industry" value={formatNullable(brand.industry)} />
              <DetailItem label="Market" value={formatNullable(brand.market)} />
              <DetailItem label="Business model" value={formatBusinessModel(brand.businessModel)} />
              <DetailItem label="Created" value={formatDate(brand.createdAt)} />
              <DetailItem
                label="Website"
                value={
                  brand.website ? (
                    <a
                      href={brand.website}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex min-w-0 items-center gap-2 break-all text-primary hover:underline"
                    >
                      {brand.website}
                      <ExternalLink className="h-4 w-4" aria-hidden="true" />
                    </a>
                  ) : (
                    "Not set"
                  )
                }
              />
              <DetailItem label="Main channels" value={formatChannels(brand.mainChannels)} />
            </dl>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Latest audit</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {latestAudit ? (
              <>
                <div className="space-y-1">
                  <p className="text-sm font-medium">{latestAudit.title}</p>
                  <p className="text-sm text-muted-foreground">
                    Audit date: {formatDate(latestAudit.auditDate)}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {typeof latestAudit.overallScore === "number" ? (
                    <ScoreBadge score={latestAudit.overallScore} />
                  ) : (
                    <Badge variant="neutral">No score</Badge>
                  )}
                  {latestRisk ? <RiskBadge risk={latestRisk} /> : null}
                  {latestConfidence ? <ConfidenceBadge confidence={latestConfidence} /> : null}
                </div>
                {latestAudit.summary ? (
                  <p className="text-sm leading-6 text-muted-foreground">{latestAudit.summary}</p>
                ) : null}
              </>
            ) : (
              <EmptyPreview
                title="No audits yet"
                description="Start a new audit when the client context is ready."
              />
            )}
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Business context</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <DetailItem label="Main goal" value={formatNullable(brand.mainGoal)} />
            <DetailItem label="Notes" value={formatNullable(brand.notes)} />
            <div className="space-y-2">
              <p className="text-xs font-medium uppercase tracking-normal text-muted-foreground">
                Channel tags
              </p>
              {brand.mainChannels.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {brand.mainChannels.map((channel) => (
                    <Badge key={channel} variant="neutral">
                      {channel}
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No channels captured.</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Financial metrics</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="grid gap-5 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
              <DetailItem label="Ad spend" value={formatMoney(brand.monthlyAdSpend)} />
              <DetailItem label="Revenue" value={formatMoney(brand.monthlyRevenue)} />
              <DetailItem label="AOV" value={formatMoney(brand.averageOrderValue)} />
            </dl>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Related audits</CardTitle>
          </CardHeader>
          <CardContent>
            {brand.audits.length > 0 ? (
              <div className="space-y-3">
                {brand.audits.map((audit, index) => (
                  <RelatedAuditCard key={audit.id} audit={audit} isLatest={index === 0} />
                ))}
              </div>
            ) : (
              <EmptyPreview
                title="No related audits"
                description="New audits for this brand will appear here after they are created."
              />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Related brand metrics</CardTitle>
          </CardHeader>
          <CardContent>
            {brand.metrics.length > 0 ? (
              <div className="space-y-3">
                {brand.metrics.map((metric) => (
                  <BrandMetricCard key={metric.id} metric={metric} />
                ))}
              </div>
            ) : (
              <EmptyPreview
                title="No brand metrics"
                description="Manual KPI entries and imported metrics will appear here after capture."
              />
            )}
          </CardContent>
        </Card>
      </section>

      <BrandEditPanel brand={editValues} />
    </div>
  );
}
