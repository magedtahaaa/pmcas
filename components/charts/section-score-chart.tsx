"use client";

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from "recharts";

import { Badge } from "@/components/ui/badge";

export type SectionScoreChartDatum = {
  section: string;
  fullSectionName: string;
  score: number;
  isScored: boolean;
  scoreLabel: string;
  completionLabel: string;
};

export function SectionScoreChart({ data }: { data: SectionScoreChartDatum[] }) {
  const hasChartableScores = data.some((section) => section.isScored && section.score > 0);

  if (data.length === 0 || !hasChartableScores) {
    return (
      <div className="flex min-h-72 items-center justify-center rounded-md border border-dashed p-6 text-center">
        <p className="text-sm text-muted-foreground">No chartable section scores are available yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ left: -20, right: 12, top: 8, bottom: 0 }}>
            <XAxis
              dataKey="section"
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
            />
            <YAxis
              domain={[0, 100]}
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
            />
            <Bar dataKey="score" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="grid gap-3 md:grid-cols-2 2xl:grid-cols-3">
        {data.map((section) => (
          <div key={section.fullSectionName} className="min-w-0 rounded-md border p-3">
            <p className="break-words text-sm font-medium leading-5">{section.section}</p>
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
    </div>
  );
}
