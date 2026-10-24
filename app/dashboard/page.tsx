import Link from "next/link";
import {
  Activity,
  ArrowUpRight,
  Building2,
  ClipboardCheck,
  FlaskConical,
  Target,
} from "lucide-react";

import { SectionScorePreview } from "@/components/charts/section-score-preview";
import { DashboardMetricCard } from "@/components/dashboard/dashboard-metric-card";
import { ConfidenceBadge } from "@/components/layout/confidence-badge";
import { EmptyState } from "@/components/layout/empty-state";
import { PageHeader } from "@/components/layout/page-header";
import { RiskBadge } from "@/components/layout/risk-badge";
import { ScoreBadge } from "@/components/layout/score-badge";
import { StatusBadge } from "@/components/layout/status-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDate, formatNullable } from "@/lib/brands/format";
import { formatScore, toBadgeConfidenceLevel, toBadgeRiskLevel } from "@/lib/audits/format";
import { getDashboardSummary } from "@/lib/dashboard/queries";

export const dynamic = "force-dynamic";

function formatCount(value: number) {
  return new Intl.NumberFormat("en-US").format(value);
}

function NotAvailableLabel({ children }: { children: string }) {
  return <span className="text-xs text-muted-foreground">{children}</span>;
}

function InlineEmptyState({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="flex min-h-48 flex-col items-center justify-center rounded-md border border-dashed bg-muted/10 p-6 text-center">
      <p className="text-sm font-medium">{title}</p>
      <p className="mt-1 max-w-md text-sm leading-6 text-muted-foreground">{description}</p>
    </div>
  );
}

export default async function DashboardPage() {
  const dashboard = await getDashboardSummary();
  const latestAudit = dashboard.recentAudits[0];
  const sectionScorePreview = dashboard.sectionScorePreview;
  const sectionScoreChartData =
    sectionScorePreview?.sections.map((section) => ({
      section: section.shortName,
      fullSectionName: section.sectionName,
      score: section.chartScore,
      isScored: section.score !== null,
      scoreLabel: formatScore(section.score),
      completionLabel: `${section.answeredCriteria}/${section.totalCriteria} answered`,
    })) ?? [];

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="PMCAS"
        title="Consulting dashboard"
        description="A foundation view for brand audits, draft findings, recommendations, and experiments."
        tone="dashboard"
        actions={
          <Button asChild>
            <Link href="/brands/new">Create brand</Link>
          </Button>
        }
      />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <DashboardMetricCard
          icon={Target}
          label="Brands"
          value={formatCount(dashboard.counts.activeBrands)}
          description="Total brands. Active status is not modeled yet."
          tone="brands"
        />
        <DashboardMetricCard
          icon={ClipboardCheck}
          label="Open audits"
          value={formatCount(dashboard.counts.openAudits)}
          description="All audits are treated as draft until audit status exists."
          tone="audits"
        />
        <DashboardMetricCard
          icon={Activity}
          label="Draft findings"
          value={formatCount(dashboard.counts.draftFindings)}
          description={`${formatCount(dashboard.counts.acceptedFindings)} accepted, ${formatCount(
            dashboard.counts.totalFindings,
          )} total`}
          tone="findings"
        />
        <DashboardMetricCard
          icon={FlaskConical}
          label="Experiments"
          value={formatCount(dashboard.counts.experiments)}
          description={`${formatCount(dashboard.counts.recommendations)} recommendations tracked`}
          tone="experiments"
        />
      </section>

      <section className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_420px]">
        <Card className="border-cyan-300/85 bg-cyan-50/80">
          <CardHeader>
            <CardTitle>Section score preview</CardTitle>
            {sectionScorePreview ? (
              <CardDescription>
                Latest audit: {sectionScorePreview.auditTitle} for {sectionScorePreview.brandName}
              </CardDescription>
            ) : (
              <CardDescription>Latest audit section scores will appear here.</CardDescription>
            )}
          </CardHeader>
          <CardContent>
            {sectionScorePreview ? (
              <SectionScorePreview data={sectionScoreChartData} />
            ) : (
              <InlineEmptyState
                title="No audit scores yet"
                description="Create an audit and answer criteria to build a section score preview."
              />
            )}
          </CardContent>
        </Card>

        <Card className="border-cyan-300/85 bg-cyan-50/80">
          <CardHeader>
            <CardTitle>Recent audit activity</CardTitle>
            <CardDescription>Newest audits across all brands.</CardDescription>
          </CardHeader>
          <CardContent>
            {dashboard.recentAudits.length > 0 ? (
              <div className="space-y-3">
                {dashboard.recentAudits.map((audit) => {
                  const risk = toBadgeRiskLevel(audit.overallRisk);
                  const confidence = toBadgeConfidenceLevel(audit.overallConfidence);

                  return (
                    <div
                      key={audit.id}
                      className="rounded-md border border-border/80 bg-muted/10 p-3 transition-colors hover:border-primary/25 hover:bg-muted/20"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 space-y-1">
                          <Link
                            href={`/audits/${audit.id}`}
                            className="line-clamp-2 text-sm font-medium leading-5 hover:text-primary"
                          >
                            {audit.title}
                          </Link>
                          <p className="break-words text-xs text-muted-foreground">
                            {audit.brand.name} - {formatDate(audit.auditDate)}
                          </p>
                        </div>
                        <Button asChild variant="outline" size="sm" className="shrink-0">
                          <Link href={`/audits/${audit.id}`}>
                            Open
                            <ArrowUpRight className="ms-2 h-4 w-4" aria-hidden="true" />
                          </Link>
                        </Button>
                      </div>

                      <div className="mt-3 flex flex-wrap gap-2">
                        {typeof audit.overallScore === "number" ? (
                          <ScoreBadge score={audit.overallScore} />
                        ) : (
                          <Badge variant="neutral">No score</Badge>
                        )}
                        {risk ? <RiskBadge risk={risk} /> : null}
                        {confidence ? <ConfidenceBadge confidence={confidence} /> : null}
                        <StatusBadge status={audit.status} />
                      </div>

                      <p className="mt-3 text-xs leading-5 text-muted-foreground">
                        {audit.counts.responses} responses - {audit.counts.findings} findings -{" "}
                        {audit.counts.recommendations} recommendations
                      </p>
                    </div>
                  );
                })}
              </div>
            ) : (
              <InlineEmptyState
                title="No recent audit activity"
                description="Create a brand profile and start an audit when client context is ready."
              />
            )}
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-4 lg:grid-cols-[360px_minmax(0,1fr)]">
        <Card className="border-blue-300/80 bg-blue-50/80">
          <CardHeader>
            <CardTitle>Quick actions</CardTitle>
            <CardDescription>Common dashboard shortcuts.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button asChild className="w-full justify-start">
              <Link href="/brands/new">
                <Building2 className="me-2 h-4 w-4" aria-hidden="true" />
                Create brand
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full justify-start">
              <Link href="/brands">Go to brands</Link>
            </Button>
            {latestAudit ? (
              <Button asChild variant="outline" className="w-full justify-start">
                <Link href={`/audits/${latestAudit.id}`}>Open latest audit</Link>
              </Button>
            ) : (
              <Button type="button" variant="outline" className="w-full justify-start" disabled>
                Open latest audit
              </Button>
            )}
            {dashboard.counts.completedAudits === null ? (
              <NotAvailableLabel>Completed audit status is not available in the MVP schema.</NotAvailableLabel>
            ) : null}
          </CardContent>
        </Card>

        {dashboard.latestBrandActivity.length > 0 ? (
          <Card className="border-indigo-300/80 bg-indigo-50/80">
            <CardHeader>
              <CardTitle>Latest brand activity</CardTitle>
              <CardDescription>Recently updated brand profiles.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                {dashboard.latestBrandActivity.map((brand) => (
                  <Link
                    key={brand.id}
                    href={`/brands/${brand.id}`}
                    className="rounded-md border border-border/80 bg-muted/10 p-3 transition-colors hover:border-primary/25 hover:bg-muted/20"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="line-clamp-2 break-words text-sm font-medium">
                          {brand.name}
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {formatNullable(brand.market)}
                        </p>
                      </div>
                      <Badge variant="neutral">{brand.counts.audits} audits</Badge>
                    </div>
                    <p className="mt-3 text-xs leading-5 text-muted-foreground">
                      {formatNullable(brand.industry)} - Updated {formatDate(brand.updatedAt)}
                    </p>
                    <p className="mt-1 text-xs leading-5 text-muted-foreground">
                      {brand.counts.metrics} metrics captured
                    </p>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        ) : (
          <EmptyState
            title="No brand activity"
            description="Create a brand profile to start tracking consulting activity."
            actionLabel="Create brand"
            actionHref="/brands/new"
            tone="brands"
          />
        )}
      </section>
    </div>
  );
}
