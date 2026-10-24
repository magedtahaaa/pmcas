import Link from "next/link";
import { ArrowUpRight, PlusCircle } from "lucide-react";

import { EmptyState } from "@/components/layout/empty-state";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  WorkflowList,
  WorkflowMetaGrid,
  WorkflowMetaItem,
  WorkflowSnippet,
} from "@/components/workflow/workflow-list-card";
import { formatBusinessModel } from "@/lib/brands/constants";
import { formatDate, formatMoney, formatNullable } from "@/lib/brands/format";
import { getBrands } from "@/lib/brands/queries";

export const dynamic = "force-dynamic";

type BrandListItem = Awaited<ReturnType<typeof getBrands>>[number];

export default async function BrandsPage() {
  const brands = await getBrands();

  return (
    <div className="space-y-8">
      <PageHeader
        title="Brands"
        description="Manage client profiles, business context, metrics, imports, and audit history."
        tone="brands"
        actions={
          <Button asChild>
            <Link href="/brands/new">
              <PlusCircle className="me-2 h-4 w-4" aria-hidden="true" />
              New brand
            </Link>
          </Button>
        }
      />

      {brands.length === 0 ? (
        <EmptyState
          icon={PlusCircle}
          title="No brands yet"
          description="Add the first client or brand profile to begin the PMCAS workflow."
          actionLabel="Create brand"
          actionHref="/brands/new"
          tone="brands"
        />
      ) : (
        <Card className="border-indigo-300/80 bg-indigo-50/80">
          <CardHeader className="gap-1">
            <CardTitle>Client profiles</CardTitle>
            <p className="text-sm leading-6 text-muted-foreground">
              {brands.length} brand{brands.length === 1 ? "" : "s"} available for audit work.
            </p>
          </CardHeader>
          <CardContent>
            <WorkflowList>
              {brands.map((brand) => (
                <BrandListCard key={brand.id} brand={brand} />
              ))}
            </WorkflowList>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function BrandListCard({ brand }: { brand: BrandListItem }) {
  return (
    <article className="rounded-md border border-s-4 border-indigo-300/80 border-s-indigo-600 bg-indigo-50/80 p-5 shadow-sm shadow-slate-950/5 transition-colors hover:border-indigo-500/70 hover:bg-indigo-100/65">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0 flex-1 space-y-4">
          <div className="space-y-2">
            <Link
              href={`/brands/${brand.id}`}
              className="block break-words text-base font-semibold leading-6 text-foreground hover:text-primary"
            >
              {brand.name}
            </Link>
            <div className="flex flex-wrap gap-2">
              <Badge variant="neutral">{formatBusinessModel(brand.businessModel)}</Badge>
              <ContextBadge label="Industry" value={brand.industry} />
              <ContextBadge label="Market" value={brand.market} />
            </div>
          </div>

          <WorkflowMetaGrid className="sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
            <WorkflowMetaItem label="Monthly ad spend">
              {formatMoney(brand.monthlyAdSpend)}
            </WorkflowMetaItem>
            <WorkflowMetaItem label="Monthly revenue">
              {formatMoney(brand.monthlyRevenue)}
            </WorkflowMetaItem>
            <WorkflowMetaItem label="AOV">
              {formatMoney(brand.averageOrderValue)}
            </WorkflowMetaItem>
            <WorkflowMetaItem label="Audits">{brand._count.audits}</WorkflowMetaItem>
            <WorkflowMetaItem label="Metrics">{brand._count.metrics}</WorkflowMetaItem>
            <WorkflowMetaItem label="Created">{formatDate(brand.createdAt)}</WorkflowMetaItem>
          </WorkflowMetaGrid>

          <div className="rounded-md border border-border/70 bg-muted/25 p-3">
            <p className="text-xs font-medium uppercase tracking-normal text-muted-foreground">
              Main channels
            </p>
            <ChannelTags channels={brand.mainChannels} />
          </div>

          <WorkflowSnippet label="Main goal">{formatNullable(brand.mainGoal)}</WorkflowSnippet>
        </div>

        <Button asChild variant="outline" className="w-full shrink-0 sm:w-auto">
          <Link href={`/brands/${brand.id}`}>
            Open profile
            <ArrowUpRight className="ms-2 h-4 w-4" aria-hidden="true" />
          </Link>
        </Button>
      </div>
    </article>
  );
}

function ContextBadge({
  label,
  value,
}: {
  label: string;
  value: string | null | undefined;
}) {
  const displayValue = value?.trim();

  return (
    <Badge variant={displayValue ? "outline" : "neutral"}>
      {displayValue || `${label} not set`}
    </Badge>
  );
}

function ChannelTags({ channels }: { channels: string[] }) {
  if (channels.length === 0) {
    return <p className="mt-1 text-sm text-muted-foreground">No channels captured.</p>;
  }

  return (
    <div className="mt-2 flex flex-wrap gap-2">
      {channels.map((channel) => (
        <Badge key={channel} variant="neutral">
          {channel}
        </Badge>
      ))}
    </div>
  );
}
