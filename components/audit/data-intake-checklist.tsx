"use client";

import { useId, useState, type ReactNode } from "react";
import { ChevronDown } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  getDataIntakeGroupStats,
  getItemDestinations,
  getItemMappingStatus,
  type DataIntakeChecklistGroup,
  type DataIntakeChecklistItem,
  type IntakeMappingStatus,
  type IntakePriority,
  type IntakeRequirement,
  type PMCASDestination,
} from "@/lib/audits/data-intake";
import { cn } from "@/lib/utils";

const categoryNavLabels: Record<string, string> = {
  "Business Context": "Business",
  "Paid Media": "Paid Media",
  "Website & Funnel": "Funnel",
  "Tracking & Measurement": "Tracking",
  "Customer Support & Objections": "Support",
  "PMCAS Entry Mapping": "Mapping",
  "Delivery Notes": "Delivery",
};

export function DataIntakeChecklist({ groups }: { groups: DataIntakeChecklistGroup[] }) {
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(groups.map((group) => [group.title, group.title === "Business Context"])),
  );

  return (
    <section className="space-y-5">
      <Card className="border-cyan-300/85 bg-cyan-50/80">
        <CardContent className="p-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="min-w-0">
              <p className="text-sm font-semibold text-cyan-950">Checklist categories</p>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">
                Business context opens first. Other categories stay collapsed until needed.
              </p>
            </div>
            <nav aria-label="Data intake categories" className="flex flex-wrap gap-2">
              {groups.map((group) => (
                <a
                  key={group.title}
                  href={`#${getCategoryAnchor(group.title)}`}
                  className="rounded-md border border-cyan-300 bg-background px-3 py-2 text-sm font-medium text-cyan-950 transition-colors hover:border-cyan-500 hover:bg-cyan-100"
                >
                  {categoryNavLabels[group.title] ?? group.title}
                </a>
              ))}
            </nav>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-5">
        {groups.map((group) => (
          <DataIntakeChecklistGroup
            key={group.title}
            group={group}
            isOpen={openGroups[group.title] ?? false}
            onToggle={() =>
              setOpenGroups((current) => ({
                ...current,
                [group.title]: !(current[group.title] ?? false),
              }))
            }
          />
        ))}
      </div>
    </section>
  );
}

function DataIntakeChecklistGroup({
  group,
  isOpen,
  onToggle,
}: {
  group: DataIntakeChecklistGroup;
  isOpen: boolean;
  onToggle: () => void;
}) {
  const contentId = useId();
  const stats = getDataIntakeGroupStats(group);

  return (
    <Card
      id={getCategoryAnchor(group.title)}
      className="scroll-mt-24 overflow-hidden border-s-4 border-s-cyan-600 border-cyan-300/85 bg-background"
    >
      <CardHeader className="border-b border-cyan-300/80 bg-cyan-50/80 p-0">
        <button
          type="button"
          aria-expanded={isOpen}
          aria-controls={contentId}
          onClick={onToggle}
          className="flex w-full flex-col gap-4 p-5 text-start transition-colors hover:bg-cyan-100/65 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:flex-row sm:items-start sm:justify-between"
        >
          <span className="flex min-w-0 gap-3">
            <ChevronDown
              className={cn(
                "mt-0.5 h-5 w-5 shrink-0 text-cyan-900 transition-transform",
                isOpen && "rotate-180",
              )}
              aria-hidden="true"
            />
            <span className="min-w-0 space-y-1">
              <span className="block break-words text-base font-semibold leading-6 tracking-normal text-foreground">
                {group.title}
              </span>
              <span className="block text-sm leading-6 text-muted-foreground">
                {group.description}
              </span>
            </span>
          </span>
          <span className="flex shrink-0 flex-wrap gap-2 sm:justify-end">
            <HeaderBadge>{stats.totalItems} items</HeaderBadge>
            <HeaderBadge>{stats.requiredItems} required</HeaderBadge>
            {stats.criticalItems > 0 ? (
              <HeaderBadge tone="danger">{stats.criticalItems} critical</HeaderBadge>
            ) : null}
            <HeaderBadge tone="success">{stats.mappedItems} mapped</HeaderBadge>
            {stats.mappingGaps > 0 ? (
              <HeaderBadge tone="danger">{stats.mappingGaps} gaps</HeaderBadge>
            ) : null}
            <HeaderBadge>{isOpen ? "Expanded" : "Collapsed"}</HeaderBadge>
          </span>
        </button>
      </CardHeader>
      <CardContent id={contentId} hidden={!isOpen} className="p-5">
        <div className="grid gap-4 xl:grid-cols-2">
          {group.items.map((item) => (
            <ChecklistItemCard key={`${group.title}-${item.title}`} item={item} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function ChecklistItemCard({ item }: { item: DataIntakeChecklistItem }) {
  const mappingStatus = getItemMappingStatus(item);
  const destinations = getItemDestinations(item);

  return (
    <article className="flex h-full flex-col gap-4 rounded-md border border-slate-300 bg-slate-50/70 p-4 shadow-sm shadow-slate-950/5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h3 className="break-words text-sm font-semibold leading-6 text-foreground">
            {item.title}
          </h3>
          <p className="mt-1 text-sm leading-6 text-muted-foreground">{item.description}</p>
        </div>
        <div className="flex shrink-0 flex-wrap gap-2 sm:justify-end">
          <RequirementBadge requirement={item.requirement} />
          <PriorityBadge priority={item.priority} />
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <MappingStatusBadge status={mappingStatus} />
        <Badge variant="outline">{item.pmcasSection}</Badge>
      </div>

      <div className="space-y-2 rounded-md border border-slate-300 bg-background/90 p-3">
        <p className="text-xs font-medium uppercase tracking-normal text-muted-foreground">
          PMCAS destinations
        </p>
        {destinations.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {destinations.map((destination) => (
              <DestinationBadge key={destination} destination={destination} />
            ))}
          </div>
        ) : (
          <Badge variant="danger">Mapping Gap</Badge>
        )}
      </div>

      <details className="group rounded-md border border-slate-300 bg-background/90">
        <summary className="cursor-pointer list-none px-3 py-2 text-sm font-medium text-foreground marker:hidden">
          <span className="inline-flex items-center gap-2">
            <ChevronDown
              className="h-4 w-4 text-muted-foreground transition-transform group-open:rotate-180"
              aria-hidden="true"
            />
            View source and usage details
          </span>
        </summary>
        <div className="grid gap-3 border-t border-slate-300 p-3 text-sm leading-6 md:grid-cols-2">
          <Detail label="Source" value={item.source} />
          <Detail label="Access needed" value={item.accessNeeded} />
          <Detail label="Current PMCAS note" value={item.pmcasDestination} />
          <Detail label="Suggested use" value={item.suggestedUse} />
        </div>
      </details>
    </article>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <p className="text-xs font-medium uppercase tracking-normal text-muted-foreground">{label}</p>
      <p className="mt-1 break-words text-sm leading-6 text-foreground">{value}</p>
    </div>
  );
}

function HeaderBadge({
  children,
  tone = "neutral",
}: {
  children: ReactNode;
  tone?: "neutral" | "success" | "danger";
}) {
  return (
    <span
      className={cn(
        "inline-flex max-w-full items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold leading-5",
        tone === "success" && "border-emerald-500/60 bg-emerald-100 text-emerald-950",
        tone === "danger" && "border-red-500/60 bg-red-100 text-red-950",
        tone === "neutral" && "border-slate-300 bg-background text-slate-900",
      )}
    >
      {children}
    </span>
  );
}

function RequirementBadge({ requirement }: { requirement: IntakeRequirement }) {
  return (
    <Badge variant={requirement === "Required" ? "warning" : "neutral"}>
      {requirement}
    </Badge>
  );
}

function PriorityBadge({ priority }: { priority: IntakePriority }) {
  if (priority === "Critical") {
    return <Badge variant="danger">Critical</Badge>;
  }

  if (priority === "High") {
    return <Badge variant="warning">High</Badge>;
  }

  return <Badge variant="outline">Medium</Badge>;
}

function MappingStatusBadge({ status }: { status: IntakeMappingStatus }) {
  if (status === "Mapped") {
    return <Badge variant="success">Mapped</Badge>;
  }

  if (status === "Mapping Gap") {
    return <Badge variant="danger">Mapping Gap</Badge>;
  }

  return <Badge variant="neutral">Starter Item</Badge>;
}

function DestinationBadge({ destination }: { destination: PMCASDestination }) {
  if (destination === "Finding Evidence") {
    return <Badge variant="warning">{destination}</Badge>;
  }

  if (destination === "Recommendation Input" || destination === "Experiment Input") {
    return <Badge variant="success">{destination}</Badge>;
  }

  if (destination === "Delivery Notes" || destination === "Export Reference") {
    return <Badge variant="outline">{destination}</Badge>;
  }

  return <Badge variant="neutral">{destination}</Badge>;
}

function getCategoryAnchor(title: string) {
  return `intake-${title.toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}`;
}
