import Link from "next/link";
import type { ReactNode } from "react";

import { ConfidenceBadge } from "@/components/layout/confidence-badge";
import { RiskBadge } from "@/components/layout/risk-badge";
import { ScoreBadge } from "@/components/layout/score-badge";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatAuditEnum, formatScore, toBadgeConfidenceLevel, toBadgeRiskLevel } from "@/lib/audits/format";
import type { SectionScoreResult } from "@/lib/scoring";

export type ReportSectionScoreItem = {
  id: string;
  sectionKey: string;
  name: string;
  description: string | null;
  score: SectionScoreResult | null;
};

export function SectionScoreSummary({
  auditId,
  sections,
}: {
  auditId: string;
  sections: ReportSectionScoreItem[];
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Section score breakdown</CardTitle>
        <p className="text-sm leading-6 text-muted-foreground">
          All 8 PMCAS sections with live score, risk, confidence, and criteria completion.
        </p>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 xl:grid-cols-2">
          {sections.map((section) => {
            const risk = toBadgeRiskLevel(section.score?.riskLevel);
            const confidence = toBadgeConfidenceLevel(section.score?.confidence);

            return (
              <article
                key={section.id}
                className="rounded-lg border border-cyan-300/85 bg-cyan-50/80 p-4 shadow-sm shadow-slate-950/5"
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="min-w-0 space-y-2">
                    <Link
                      href={`/audits/${auditId}#section-${section.id}`}
                      className="block break-words text-sm font-semibold leading-6 text-foreground hover:text-primary"
                    >
                      {section.name}
                    </Link>
                    <p className="text-xs font-medium uppercase tracking-normal text-muted-foreground">
                      {formatAuditEnum(section.sectionKey)}
                    </p>
                    {section.description ? (
                      <p className="line-clamp-2 break-words text-sm leading-6 text-muted-foreground">
                        {section.description}
                      </p>
                    ) : null}
                  </div>
                  <div className="flex shrink-0 flex-wrap gap-2 lg:justify-end">
                    {section.score?.score !== null && section.score?.score !== undefined ? (
                      <ScoreBadge score={section.score.score} />
                    ) : (
                      <Badge variant="neutral">{formatScore(null)}</Badge>
                    )}
                    {risk ? <RiskBadge risk={risk} /> : <Badge variant="neutral">No risk</Badge>}
                    {confidence ? (
                      <ConfidenceBadge confidence={confidence} />
                    ) : (
                      <Badge variant="neutral">No confidence</Badge>
                    )}
                  </div>
                </div>

                <dl className="mt-4 grid gap-3 sm:grid-cols-3">
                  <Metric label="Criteria">
                    {section.score?.totalCriteria ?? 0}
                  </Metric>
                  <Metric label="Answered">
                    {section.score?.answeredCriteria ?? 0}
                  </Metric>
                  <Metric label="Completion">
                    {section.score?.completionPercentage ?? 0}%
                  </Metric>
                </dl>
              </article>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

function Metric({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="rounded-md border border-border/80 bg-background/80 p-3">
      <dt className="text-xs font-medium uppercase tracking-normal text-muted-foreground">
        {label}
      </dt>
      <dd className="mt-1 text-sm font-semibold leading-6 text-foreground">{children}</dd>
    </div>
  );
}
