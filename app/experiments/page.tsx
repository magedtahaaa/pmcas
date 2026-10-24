import Link from "next/link";
import {
  Activity,
  CheckCircle2,
  FlaskConical,
  ListChecks,
  PauseCircle,
  PlayCircle,
  XCircle,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { ExperimentScoreBadge } from "@/components/experiments/experiment-score-badge";
import { ExperimentStatusBadge } from "@/components/experiments/experiment-status-badge";
import { EmptyState } from "@/components/layout/empty-state";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  WorkflowFilterActions,
  WorkflowFilterBar,
  WorkflowFilterSelect,
} from "@/components/workflow/workflow-filter-select";
import {
  WorkflowItemCard,
  WorkflowList,
  WorkflowMetaGrid,
  WorkflowMetaItem,
  WorkflowSnippet,
} from "@/components/workflow/workflow-list-card";
import { formatAuditEnum } from "@/lib/audits/format";
import { formatDate } from "@/lib/brands/format";
import {
  experimentScoreOptions,
  experimentStatusOptions,
} from "@/lib/experiments/constants";
import {
  getExperimentsWorkflowData,
  parseExperimentFilters,
} from "@/lib/experiments/queries";

export const dynamic = "force-dynamic";

function formatCount(value: number) {
  return new Intl.NumberFormat("en-US").format(value);
}

export default async function ExperimentsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const filters = parseExperimentFilters(await searchParams);
  const { experiments, counts, filterBrands, primaryMetrics } =
    await getExperimentsWorkflowData(filters);

  return (
    <div className="space-y-8">
      <PageHeader
        title="Experiments"
        description="Manage prioritized tests and operational actions tied to recommendations, audits, brands, and measurable learning."
        tone="experiments"
      />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-7">
        <ExperimentCounter icon={FlaskConical} label="Total" value={counts.total} />
        <ExperimentCounter icon={Activity} label="Backlog" value={counts.backlog} />
        <ExperimentCounter icon={ListChecks} label="Planned" value={counts.planned} />
        <ExperimentCounter icon={PlayCircle} label="Running" value={counts.running} />
        <ExperimentCounter icon={CheckCircle2} label="Completed" value={counts.completed} />
        <ExperimentCounter icon={PauseCircle} label="Paused" value={counts.paused} />
        <ExperimentCounter icon={XCircle} label="Rejected" value={counts.rejected} />
      </section>

      <Card className="border-purple-300/85 bg-purple-50/80">
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <WorkflowFilterBar action="/experiments">
            <WorkflowFilterSelect label="Status" name="status" value={filters.status}>
              <option value="">All statuses</option>
              {experimentStatusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </WorkflowFilterSelect>

            <ScoreFilterSelect
              label="Impact"
              name="impact"
              value={filters.impact}
              emptyLabel="All impact levels"
            />
            <ScoreFilterSelect
              label="Confidence"
              name="confidenceScore"
              value={filters.confidenceScore}
              emptyLabel="All confidence levels"
            />
            <ScoreFilterSelect
              label="Effort"
              name="effort"
              value={filters.effort}
              emptyLabel="All effort levels"
            />

            <WorkflowFilterSelect label="Brand" name="brandId" value={filters.brandId}>
              <option value="">All brands</option>
              {filterBrands.map((brand) => (
                <option key={brand.id} value={brand.id}>
                  {brand.name}
                </option>
              ))}
            </WorkflowFilterSelect>

            <WorkflowFilterSelect
              label="Primary metric"
              name="primaryMetric"
              value={filters.primaryMetric}
              className="basis-full md:basis-[28rem] md:flex-[2_1_28rem]"
            >
              <option value="">All primary metrics</option>
              {primaryMetrics.map((metric) => (
                <option key={metric} value={metric}>
                  {metric}
                </option>
              ))}
            </WorkflowFilterSelect>

            <WorkflowFilterActions>
              <Button type="submit" className="min-w-24 flex-1">
                Apply
              </Button>
              <Button asChild variant="outline" className="min-w-24 flex-1">
                <Link href="/experiments">Clear</Link>
              </Button>
            </WorkflowFilterActions>
          </WorkflowFilterBar>
        </CardContent>
      </Card>

      <Card className="border-purple-300/85 bg-purple-50/80">
        <CardHeader>
          <CardTitle>Experiments workflow</CardTitle>
        </CardHeader>
        <CardContent>
          {experiments.length > 0 ? (
            <WorkflowList>
              {experiments.map((experiment) => (
                <WorkflowItemCard
                  key={experiment.id}
                  title={experiment.hypothesis}
                  href={`/experiments/${experiment.id}`}
                  description={experiment.problemObserved}
                  tone="experiments"
                  badges={
                    <>
                      <ExperimentStatusBadge status={experiment.status} />
                      <ExperimentScoreBadge label="Impact" value={experiment.impact} />
                      <ExperimentScoreBadge
                        label="Confidence"
                        value={experiment.confidenceScore}
                      />
                      <ExperimentScoreBadge label="Effort" value={experiment.effort} />
                      <Badge variant="outline">Priority: {experiment.priorityScore}</Badge>
                    </>
                  }
                >
                  <WorkflowMetaGrid>
                    <WorkflowMetaItem label="Funnel stage">
                      {experiment.funnelStage}
                    </WorkflowMetaItem>
                    <WorkflowMetaItem label="Primary metric">
                      {experiment.primaryMetric}
                    </WorkflowMetaItem>
                    <WorkflowMetaItem label="Secondary metric">
                      {experiment.secondaryMetric || "Not set"}
                    </WorkflowMetaItem>
                    <WorkflowMetaItem label="Recommendation">
                      {experiment.recommendation ? (
                        <Link
                          href={`/recommendations/${experiment.recommendation.id}`}
                          className="hover:text-primary"
                        >
                          {experiment.recommendation.title}
                        </Link>
                      ) : (
                        "Not linked"
                      )}
                    </WorkflowMetaItem>
                    <WorkflowMetaItem label="Brand">
                      <Link
                        href={`/brands/${experiment.brand.id}`}
                        className="font-medium hover:text-primary"
                      >
                        {experiment.brand.name}
                      </Link>
                    </WorkflowMetaItem>
                    <WorkflowMetaItem label="Audit">
                      <Link href={`/audits/${experiment.audit.id}`} className="hover:text-primary">
                        {experiment.audit.title}
                      </Link>
                      <span className="block text-xs text-muted-foreground">
                        {formatDate(experiment.audit.auditDate)}
                      </span>
                    </WorkflowMetaItem>
                    <WorkflowMetaItem label="Owner">
                      {formatAuditEnum(experiment.owner)}
                    </WorkflowMetaItem>
                    <WorkflowMetaItem label="Section">{experiment.sectionName}</WorkflowMetaItem>
                  </WorkflowMetaGrid>
                  <WorkflowSnippet label="Result / learning">
                    {experiment.result || experiment.learning || "No result or learning captured yet."}
                  </WorkflowSnippet>
                </WorkflowItemCard>
              ))}
            </WorkflowList>
          ) : (
            <EmptyState
              title="No experiments match this view"
              description="No experiments are available for the current filters. Use Clear in the filters card to reset the list."
              actionLabel="Clear filters"
              actionHref="/experiments"
              tone="experiments"
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function ExperimentCounter({
  icon: Icon,
  label,
  value,
}: {
  icon: LucideIcon;
  label: string;
  value: number;
}) {
  return (
    <Card className="border-purple-300/85 bg-purple-50/80 transition-colors hover:border-purple-500/70">
      <CardContent className="flex items-center gap-4 p-5">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-purple-300 bg-purple-100 text-purple-900">
          <Icon className="h-5 w-5" aria-hidden="true" />
        </div>
        <div>
          <p className="text-sm font-medium text-muted-foreground">{label}</p>
          <p className="text-2xl font-semibold tracking-normal">{formatCount(value)}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function ScoreFilterSelect({
  label,
  name,
  value,
  emptyLabel,
}: {
  label: string;
  name: string;
  value?: number;
  emptyLabel: string;
}) {
  return (
    <WorkflowFilterSelect label={label} name={name} value={value ? String(value) : undefined}>
      <option value="">{emptyLabel}</option>
      {experimentScoreOptions.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </WorkflowFilterSelect>
  );
}
