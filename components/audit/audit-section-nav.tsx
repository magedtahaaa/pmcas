"use client";

import { useEffect, useState } from "react";

import { formatScore, toBadgeConfidenceLevel, toBadgeRiskLevel } from "@/lib/audits/format";
import type { SectionScoreResult } from "@/lib/scoring";
import { ConfidenceBadge } from "@/components/layout/confidence-badge";
import { RiskBadge } from "@/components/layout/risk-badge";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function AuditSectionNav({
  sections,
}: {
  sections: Array<
    SectionScoreResult & {
      anchorId: string;
    }
  >;
}) {
  const [activeSectionId, setActiveSectionId] = useState(sections[0]?.sectionId ?? "");

  useEffect(() => {
    const sectionElements = sections
      .map((section) => document.getElementById(section.anchorId))
      .filter((element): element is HTMLElement => Boolean(element));

    if (sectionElements.length === 0) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const visibleEntry = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

        if (visibleEntry?.target.id) {
          const visibleSection = sections.find(
            (section) => section.anchorId === visibleEntry.target.id,
          );

          if (visibleSection) {
            setActiveSectionId(visibleSection.sectionId);
          }
        }
      },
      {
        rootMargin: "-20% 0px -65% 0px",
        threshold: [0.1, 0.25, 0.5],
      },
    );

    sectionElements.forEach((element) => observer.observe(element));

    return () => observer.disconnect();
  }, [sections]);

  function handleSectionClick(anchorId: string, sectionId: string) {
    setActiveSectionId(sectionId);

    window.setTimeout(() => {
      document.getElementById(anchorId)?.focus({ preventScroll: true });
    }, 100);
  }

  return (
    <Card className="border-cyan-300/85 bg-cyan-50/80 shadow-md shadow-slate-950/5">
      <CardHeader className="border-b border-cyan-300/85 bg-cyan-100/60 p-4">
        <CardTitle>Sections</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 p-3">
        {sections.map((section) => {
          const risk = toBadgeRiskLevel(section.riskLevel);
          const confidence = toBadgeConfidenceLevel(section.confidence);

          return (
            <a
              key={section.sectionId}
              href={`#${section.anchorId}`}
              aria-current={activeSectionId === section.sectionId ? "true" : undefined}
              onClick={() => handleSectionClick(section.anchorId, section.sectionId)}
              className={cn(
                "block rounded-md border border-border/80 bg-background p-2.5 shadow-sm shadow-slate-950/5 transition-colors hover:bg-muted/60",
                activeSectionId === section.sectionId &&
                  "border-primary/70 bg-primary/15 shadow-md shadow-primary/15 ring-1 ring-primary/15",
              )}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 space-y-1">
                  <p className="break-words text-sm font-medium leading-5">
                    {section.sectionName}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {section.answeredCriteria}/{section.totalCriteria} answered
                  </p>
                </div>
                <Badge variant="outline" className="shrink-0">
                  {formatScore(section.score)}
                </Badge>
              </div>
              <div className="mt-2 h-1 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-primary"
                  style={{ width: `${section.completionPercentage}%` }}
                />
              </div>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {risk ? <RiskBadge risk={risk} /> : <Badge variant="neutral">No risk</Badge>}
                {confidence ? (
                  <ConfidenceBadge confidence={confidence} />
                ) : (
                  <Badge variant="neutral">No confidence</Badge>
                )}
              </div>
            </a>
          );
        })}
      </CardContent>
    </Card>
  );
}
