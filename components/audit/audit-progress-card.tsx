import { formatScore, toBadgeRiskLevel } from "@/lib/audits/format";
import type { AuditScoreSummary } from "@/lib/scoring";
import { RiskBadge } from "@/components/layout/risk-badge";
import { ScoreBadge } from "@/components/layout/score-badge";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function AuditProgressCard({
  summary,
  auditSummary,
  scalingReadiness,
  sectionAnchors,
}: {
  summary: AuditScoreSummary;
  auditSummary: string | null;
  scalingReadiness: string | null;
  sectionAnchors: Record<string, string>;
}) {
  return (
    <Card className="border-cyan-300/85 bg-cyan-50/80 shadow-md shadow-slate-950/5">
      <CardHeader className="border-b border-cyan-300/85 bg-cyan-100/60 p-4">
        <CardTitle>Audit progress</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 p-4">
        <div className="rounded-md border border-border/80 bg-muted/20 p-3">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium">{summary.completionPercentage}% complete</span>
              <span className="text-muted-foreground">
                {summary.answeredCriteria} / {summary.totalCriteria} criteria
              </span>
            </div>
            <div className="h-2 rounded-full bg-muted">
              <div
                className="h-2 rounded-full bg-primary"
                style={{ width: `${summary.completionPercentage}%` }}
              />
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {summary.overallScore !== null ? (
            <ScoreBadge score={summary.overallScore} />
          ) : (
            <Badge variant="neutral">{formatScore(null)}</Badge>
          )}
          {summary.overallRiskLevel ? (
            <RiskBadge risk={toBadgeRiskLevel(summary.overallRiskLevel) ?? "critical-gap"} />
          ) : null}
        </div>

        <div className="space-y-2 rounded-md border border-orange-300/85 bg-orange-50/85 p-3">
          <p className="text-xs font-medium uppercase tracking-normal text-muted-foreground">
            Highest-risk sections
          </p>
          {summary.highestRiskSections.length > 0 ? (
            <div className="space-y-2">
              {summary.highestRiskSections.slice(0, 3).map((section) => {
                const risk = toBadgeRiskLevel(section.riskLevel);
                const anchorId = sectionAnchors[section.sectionId];

                return (
                  <a
                    key={section.sectionId}
                    href={anchorId ? `#${anchorId}` : undefined}
                    className="block rounded-md border border-border/80 bg-muted/20 px-3 py-2 transition-colors hover:bg-muted/60"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <span className="min-w-0 break-words text-sm font-medium leading-5">
                        {section.sectionName}
                      </span>
                      {risk ? <RiskBadge risk={risk} /> : null}
                    </div>
                    <div className="mt-2 flex items-center justify-between gap-3 text-xs text-muted-foreground">
                      <span>{formatScore(section.score)}</span>
                      <span>
                        {section.answeredCriteria}/{section.totalCriteria} answered ·{" "}
                        {section.completionPercentage}%
                      </span>
                    </div>
                  </a>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No scored sections yet.</p>
          )}
        </div>

        {scalingReadiness ? (
          <div className="space-y-1 rounded-md border border-border/80 bg-background p-3">
            <p className="text-xs font-medium uppercase tracking-normal text-muted-foreground">
              Scaling readiness
            </p>
            <p className="line-clamp-4 text-sm leading-6 text-muted-foreground">
              {scalingReadiness}
            </p>
          </div>
        ) : null}

        {auditSummary ? (
          <div className="space-y-1 rounded-md border border-border/80 bg-background p-3">
            <p className="text-xs font-medium uppercase tracking-normal text-muted-foreground">
              Audit summary
            </p>
            <p className="line-clamp-4 text-sm leading-6 text-muted-foreground">
              {auditSummary}
            </p>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
