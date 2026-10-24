import Link from "next/link";
import {
  Activity,
  CheckCircle2,
  ClipboardCheck,
  ListChecks,
  PlayCircle,
  XCircle,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { ConfidenceBadge } from "@/components/layout/confidence-badge";
import { EmptyState } from "@/components/layout/empty-state";
import { PageHeader } from "@/components/layout/page-header";
import { StatusBadge } from "@/components/layout/status-badge";
import { RecommendationPriorityBadge } from "@/components/recommendations/recommendation-priority-badge";
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
import { formatAuditEnum, toBadgeConfidenceLevel, toWorkflowStatus } from "@/lib/audits/format";
import { formatDate } from "@/lib/brands/format";
import { auditSectionOptions } from "@/lib/findings/constants";
import {
  recommendationOwnerOptions,
  recommendationPriorityOptions,
  recommendationStatusOptions,
} from "@/lib/recommendations/constants";
import {
  getRecommendationsWorkflowData,
  parseRecommendationFilters,
} from "@/lib/recommendations/queries";

export const dynamic = "force-dynamic";

function formatCount(value: number) {
  return new Intl.NumberFormat("en-US").format(value);
}

export default async function RecommendationsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const filters = parseRecommendationFilters(await searchParams);
  const { recommendations, counts, filterBrands } =
    await getRecommendationsWorkflowData(filters);

  return (
    <div className="space-y-8">
      <PageHeader
        title="Recommendations"
        description="Manage consultant-approved action items tied to findings, audits, brands, and future experiments."
        tone="recommendations"
      />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-6">
        <RecommendationCounter icon={ClipboardCheck} label="Total" value={counts.total} />
        <RecommendationCounter icon={Activity} label="Draft" value={counts.draft} />
        <RecommendationCounter icon={CheckCircle2} label="Accepted" value={counts.accepted} />
        <RecommendationCounter icon={PlayCircle} label="In progress" value={counts.inProgress} />
        <RecommendationCounter icon={ListChecks} label="Completed" value={counts.completed} />
        <RecommendationCounter icon={XCircle} label="Dismissed" value={counts.dismissed} />
      </section>

      <Card className="border-emerald-300/85 bg-emerald-50/80">
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <WorkflowFilterBar action="/recommendations">
            <WorkflowFilterSelect label="Status" name="status" value={filters.status}>
              <option value="">All statuses</option>
              {recommendationStatusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </WorkflowFilterSelect>

            <WorkflowFilterSelect label="Priority" name="priority" value={filters.priority}>
              <option value="">All priorities</option>
              {recommendationPriorityOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </WorkflowFilterSelect>

            <WorkflowFilterSelect label="Owner" name="owner" value={filters.owner}>
              <option value="">All owners</option>
              {recommendationOwnerOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </WorkflowFilterSelect>

            <WorkflowFilterSelect label="Brand" name="brandId" value={filters.brandId}>
              <option value="">All brands</option>
              {filterBrands.map((brand) => (
                <option key={brand.id} value={brand.id}>
                  {brand.name}
                </option>
              ))}
            </WorkflowFilterSelect>

            <WorkflowFilterSelect
              label="Section"
              name="sectionKey"
              value={filters.sectionKey}
              className="basis-full md:basis-[28rem] md:flex-[2_1_28rem]"
            >
              <option value="">All sections</option>
              {auditSectionOptions.map((section) => (
                <option key={section.value} value={section.value}>
                  {section.label}
                </option>
              ))}
            </WorkflowFilterSelect>

            <WorkflowFilterActions>
              <Button type="submit" className="min-w-24 flex-1">
                Apply
              </Button>
              <Button asChild variant="outline" className="min-w-24 flex-1">
                <Link href="/recommendations">Clear</Link>
              </Button>
            </WorkflowFilterActions>
          </WorkflowFilterBar>
        </CardContent>
      </Card>

      <Card className="border-emerald-300/85 bg-emerald-50/80">
        <CardHeader>
          <CardTitle>Recommendations workflow</CardTitle>
        </CardHeader>
        <CardContent>
          {recommendations.length > 0 ? (
            <WorkflowList>
              {recommendations.map((recommendation) => {
                const status = toWorkflowStatus(recommendation.status);
                const confidence = toBadgeConfidenceLevel(recommendation.confidence);

                return (
                  <WorkflowItemCard
                    key={recommendation.id}
                    title={recommendation.title}
                    href={`/recommendations/${recommendation.id}`}
                    description={recommendation.rationale}
                    tone="recommendations"
                    badges={
                      <>
                        <RecommendationPriorityBadge priority={recommendation.priority} />
                        {status ? <StatusBadge status={status} /> : null}
                        {confidence ? <ConfidenceBadge confidence={confidence} /> : null}
                      </>
                    }
                  >
                    <WorkflowMetaGrid>
                      <WorkflowMetaItem label="Brand">
                        <Link
                          href={`/brands/${recommendation.brand.id}`}
                          className="font-medium hover:text-primary"
                        >
                          {recommendation.brand.name}
                        </Link>
                      </WorkflowMetaItem>
                      <WorkflowMetaItem label="Audit">
                        <Link
                          href={`/audits/${recommendation.audit.id}`}
                          className="hover:text-primary"
                        >
                          {recommendation.audit.title}
                        </Link>
                        <span className="block text-xs text-muted-foreground">
                          {formatDate(recommendation.audit.auditDate)}
                        </span>
                      </WorkflowMetaItem>
                      <WorkflowMetaItem label="Section">
                        {recommendation.sectionName}
                      </WorkflowMetaItem>
                      <WorkflowMetaItem label="Linked finding">
                        <Link
                          href={`/findings/${recommendation.finding.id}`}
                          className="hover:text-primary"
                        >
                          {recommendation.finding.title}
                        </Link>
                      </WorkflowMetaItem>
                      <WorkflowMetaItem label="Owner">
                        {formatAuditEnum(recommendation.suggestedOwner)}
                      </WorkflowMetaItem>
                      <WorkflowMetaItem label="Experiments">
                        {recommendation.experimentCount}
                      </WorkflowMetaItem>
                    </WorkflowMetaGrid>
                    <WorkflowSnippet label="Expected impact">
                      {recommendation.expectedImpact}
                    </WorkflowSnippet>
                  </WorkflowItemCard>
                );
              })}
            </WorkflowList>
          ) : (
            <EmptyState
              title="No recommendations match this view"
              description="No recommendations are available for the current filters. Use Clear in the filters card to reset the list."
              actionLabel="Clear filters"
              actionHref="/recommendations"
              tone="recommendations"
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function RecommendationCounter({
  icon: Icon,
  label,
  value,
}: {
  icon: LucideIcon;
  label: string;
  value: number;
}) {
  return (
    <Card className="border-emerald-300/85 bg-emerald-50/80 transition-colors hover:border-emerald-500/70">
      <CardContent className="flex items-center gap-4 p-5">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-emerald-300 bg-emerald-100 text-emerald-900">
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
