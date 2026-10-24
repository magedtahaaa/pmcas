import Link from "next/link";
import { Activity, CheckCircle2, FileText, PencilLine, XCircle } from "lucide-react";

import { FindingSeverityBadge } from "@/components/findings/finding-severity-badge";
import { ConfidenceBadge } from "@/components/layout/confidence-badge";
import { EmptyState } from "@/components/layout/empty-state";
import { PageHeader } from "@/components/layout/page-header";
import { StatusBadge } from "@/components/layout/status-badge";
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
import { formatDate } from "@/lib/brands/format";
import { toBadgeConfidenceLevel, toWorkflowStatus } from "@/lib/audits/format";
import {
  auditSectionOptions,
  findingConfidenceOptions,
  findingSeverityOptions,
  findingStatusOptions,
} from "@/lib/findings/constants";
import { getFindingsWorkflowData, parseFindingFilters } from "@/lib/findings/queries";

export const dynamic = "force-dynamic";

function formatCount(value: number) {
  return new Intl.NumberFormat("en-US").format(value);
}

export default async function FindingsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const filters = parseFindingFilters(await searchParams);
  const { findings, counts, filterBrands } = await getFindingsWorkflowData(filters);

  return (
    <div className="space-y-8">
      <PageHeader
        title="Findings"
        description="Review, filter, and update findings across brands and audits while keeping consultant judgment in control."
        tone="findings"
      />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <FindingCounter icon={FileText} label="Total findings" value={counts.total} />
        <FindingCounter icon={Activity} label="Draft" value={counts.draft} />
        <FindingCounter icon={CheckCircle2} label="Accepted" value={counts.accepted} />
        <FindingCounter icon={PencilLine} label="Edited" value={counts.edited} />
        <FindingCounter icon={XCircle} label="Dismissed" value={counts.dismissed} />
      </section>

      <Card className="border-orange-300/85 bg-orange-50/80">
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <WorkflowFilterBar action="/findings">
            <WorkflowFilterSelect label="Status" name="status" value={filters.status}>
              <option value="">All statuses</option>
              {findingStatusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </WorkflowFilterSelect>

            <WorkflowFilterSelect label="Severity" name="severity" value={filters.severity}>
              <option value="">All severities</option>
              {findingSeverityOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </WorkflowFilterSelect>

            <WorkflowFilterSelect label="Confidence" name="confidence" value={filters.confidence}>
              <option value="">All confidence levels</option>
              {findingConfidenceOptions.map((option) => (
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
                <Link href="/findings">Clear</Link>
              </Button>
            </WorkflowFilterActions>
          </WorkflowFilterBar>
        </CardContent>
      </Card>

      <Card className="border-orange-300/85 bg-orange-50/80">
        <CardHeader>
          <CardTitle>Findings workflow</CardTitle>
        </CardHeader>
        <CardContent>
          {findings.length > 0 ? (
            <WorkflowList>
              {findings.map((finding) => {
                const confidence = toBadgeConfidenceLevel(finding.confidence);
                const status = toWorkflowStatus(finding.status);

                return (
                  <WorkflowItemCard
                    key={finding.id}
                    title={finding.title}
                    href={`/findings/${finding.id}`}
                    description={finding.description}
                    tone="findings"
                    badges={
                      <>
                        <FindingSeverityBadge severity={finding.severity} />
                        {confidence ? <ConfidenceBadge confidence={confidence} /> : null}
                        {status ? <StatusBadge status={status} /> : null}
                      </>
                    }
                  >
                    <WorkflowMetaGrid>
                      <WorkflowMetaItem label="Brand">
                        <Link
                          href={`/brands/${finding.brand.id}`}
                          className="font-medium hover:text-primary"
                        >
                          {finding.brand.name}
                        </Link>
                      </WorkflowMetaItem>
                      <WorkflowMetaItem label="Audit">
                        <Link href={`/audits/${finding.audit.id}`} className="hover:text-primary">
                          {finding.audit.title}
                        </Link>
                        <span className="block text-xs text-muted-foreground">
                          {formatDate(finding.audit.auditDate)}
                        </span>
                      </WorkflowMetaItem>
                      <WorkflowMetaItem label="Section">{finding.sectionName}</WorkflowMetaItem>
                      <WorkflowMetaItem label="Status">
                        {status ? <StatusBadge status={status} /> : "Not set"}
                      </WorkflowMetaItem>
                    </WorkflowMetaGrid>
                    <WorkflowSnippet label="Business impact">
                      {finding.businessImpact}
                    </WorkflowSnippet>
                  </WorkflowItemCard>
                );
              })}
            </WorkflowList>
          ) : (
            <EmptyState
              title="No findings match this view"
              description="No findings are available for the current filters. Use Clear in the filters card to reset the list."
              actionLabel="Clear filters"
              actionHref="/findings"
              tone="findings"
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function FindingCounter({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof FileText;
  label: string;
  value: number;
}) {
  return (
    <Card className="border-orange-300/85 bg-orange-50/80 transition-colors hover:border-orange-500/70">
      <CardContent className="flex items-center gap-4 p-5">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-orange-300 bg-orange-100 text-orange-950">
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
