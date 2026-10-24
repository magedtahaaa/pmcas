"use client";

import dynamic from "next/dynamic";

import type { SectionScoreChartDatum } from "@/components/charts/section-score-chart";
import { Badge } from "@/components/ui/badge";

const SectionScoreChart = dynamic<{ data: SectionScoreChartDatum[] }>(
  () => import("@/components/charts/section-score-chart").then((mod) => mod.SectionScoreChart),
  {
    ssr: false,
    loading: () => (
      <div className="flex min-h-72 items-center justify-center rounded-md border border-dashed p-6 text-center">
        <p className="text-sm text-muted-foreground">Loading section score preview...</p>
      </div>
    ),
  },
);

export function SectionScorePreview({ data = [] }: { data?: SectionScoreChartDatum[] }) {
  const hasScoredSections = data.some((section) => section.isScored);
  const hasChartableScores = data.some((section) => section.isScored && section.score > 0);

  if (data.length === 0) {
    return (
      <SectionScorePreviewState
        title="No audit sections available yet."
        description="Section scores will appear after an audit is created from an active template."
      />
    );
  }

  if (!hasScoredSections) {
    return (
      <SectionScorePreviewState
        title="Latest audit has no responses yet."
        description="Section scores will appear after criteria are answered."
        sections={data}
      />
    );
  }

  if (!hasChartableScores) {
    return (
      <SectionScorePreviewState
        title="Sections are scored at 0 / 100."
        description="The chart is hidden because every scored section is currently at the baseline."
        sections={data}
      />
    );
  }

  return <SectionScoreChart data={data} />;
}

function SectionScorePreviewState({
  title,
  description,
  sections,
}: {
  title: string;
  description: string;
  sections?: SectionScoreChartDatum[];
}) {
  return (
    <div className="space-y-4">
      <div className="rounded-md border border-dashed bg-muted/10 p-4">
        <p className="text-sm font-medium">{title}</p>
        <p className="mt-1 text-sm leading-6 text-muted-foreground">{description}</p>
      </div>

      {sections && sections.length > 0 ? (
        <div className="grid gap-3 md:grid-cols-2 2xl:grid-cols-3">
          {sections.map((section) => (
            <div
              key={section.fullSectionName}
              className="min-w-0 rounded-md border border-border/80 bg-muted/10 p-3"
            >
              <p className="break-words text-sm font-medium leading-5">
                {section.fullSectionName}
              </p>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <Badge variant={section.isScored ? "outline" : "neutral"}>
                  {section.scoreLabel}
                </Badge>
                <span className="text-xs leading-5 text-muted-foreground">
                  {section.completionLabel}
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
