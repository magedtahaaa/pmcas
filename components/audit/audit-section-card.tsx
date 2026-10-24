import {
  formatAuditEnum,
  formatScore,
  toBadgeConfidenceLevel,
  toBadgeRiskLevel,
  toWorkflowStatus,
} from "@/lib/audits/format";
import type { SectionScoreResult } from "@/lib/scoring";
import Link from "next/link";
import { ConfidenceBadge } from "@/components/layout/confidence-badge";
import { RiskBadge } from "@/components/layout/risk-badge";
import { ScoreBadge } from "@/components/layout/score-badge";
import { StatusBadge } from "@/components/layout/status-badge";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  CriteriaResponseCard,
  type CriteriaResponseCardCriterion,
  type CriteriaResponseCardEvidence,
  type CriteriaResponseCardResponse,
} from "@/components/audit/criteria-response-card";
import type { FindingPreviewItem } from "@/components/audit/findings-preview";
import type { RecommendationPreviewItem } from "@/components/audit/recommendations-preview";
import type { ReactNode } from "react";

export type AuditSectionWorkspaceItem = {
  id: string;
  sectionKey: string;
  name: string;
  description: string | null;
  criteria: Array<
    CriteriaResponseCardCriterion & {
      response: CriteriaResponseCardResponse | null;
      evidenceItems: CriteriaResponseCardEvidence[];
    }
  >;
};

export function AuditSectionCard({
  auditId,
  anchorId,
  section,
  score,
  findings,
  recommendations,
}: {
  auditId: string;
  anchorId: string;
  section: AuditSectionWorkspaceItem;
  score: SectionScoreResult;
  findings: FindingPreviewItem[];
  recommendations: RecommendationPreviewItem[];
}) {
  const risk = toBadgeRiskLevel(score.riskLevel);
  const confidence = toBadgeConfidenceLevel(score.confidence);

  return (
    <section id={anchorId} tabIndex={-1} className="scroll-mt-24 focus:outline-none">
      <Card className="overflow-hidden border-cyan-300/85 shadow-md shadow-slate-950/5">
        <CardHeader className="gap-4 border-b border-cyan-300/85 bg-cyan-100/55 sm:flex-row sm:items-start sm:justify-between sm:space-y-0">
          <div className="space-y-2">
            <CardTitle className="text-lg">{section.name}</CardTitle>
            {section.description ? (
              <p className="max-w-3xl text-sm leading-6 text-muted-foreground">
                {section.description}
              </p>
            ) : null}
            <p className="text-xs font-medium uppercase tracking-normal text-muted-foreground">
              {formatAuditEnum(section.sectionKey)}
            </p>
          </div>
          <div className="flex min-w-0 flex-wrap gap-2 sm:justify-end">
            {score.score !== null ? <ScoreBadge score={score.score} /> : <Badge variant="neutral">{formatScore(null)}</Badge>}
            {risk ? <RiskBadge risk={risk} /> : <Badge variant="neutral">No risk</Badge>}
            {confidence ? (
              <ConfidenceBadge confidence={confidence} />
            ) : (
              <Badge variant="neutral">No confidence</Badge>
            )}
            <Badge variant="outline">
              {score.answeredCriteria} / {score.totalCriteria} answered
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-6 bg-background p-5 sm:p-6">
          <div className="grid gap-4 md:grid-cols-3">
            <SummaryTile label="Section score" value={formatScore(score.score)} />
            <SummaryTile label="Completion" value={`${score.completionPercentage}%`} />
            <SummaryTile label="Criteria" value={`${section.criteria.length}`} />
          </div>

          <div className="space-y-4 rounded-lg border border-border/70 bg-muted/20 p-3 sm:p-4">
            {section.criteria.map((criterion) => (
              <CriteriaResponseCard
                key={criterion.id}
                auditId={auditId}
                criterion={criterion}
                response={criterion.response}
                evidenceItems={criterion.evidenceItems}
              />
            ))}
          </div>

          <div className="grid gap-4 border-t pt-5 xl:grid-cols-2">
            <SectionPreview
              title="Section findings"
              emptyText="No findings are linked to this section yet."
              items={findings.map((finding) => ({
                id: finding.id,
                title: finding.title,
                href: `/findings/${finding.id}`,
                badges: [
                  <SeverityBadge key="severity" severity={finding.severity} />,
                  toWorkflowStatus(finding.status) ? (
                    <StatusBadge key="status" status={toWorkflowStatus(finding.status)!} />
                  ) : null,
                  toBadgeConfidenceLevel(finding.confidence) ? (
                    <ConfidenceBadge
                      key="confidence"
                      confidence={toBadgeConfidenceLevel(finding.confidence)!}
                    />
                  ) : null,
                ],
              }))}
            />
            <SectionPreview
              title="Section recommendations"
              emptyText="No recommendations are linked to this section yet."
              items={recommendations.map((recommendation) => ({
                id: recommendation.id,
                title: recommendation.title,
                href: `/recommendations/${recommendation.id}`,
                badges: [
                  <PriorityBadge key="priority" priority={recommendation.priority} />,
                  <Badge key="owner" variant="neutral">
                    {formatAuditEnum(recommendation.suggestedOwner)}
                  </Badge>,
                  toBadgeConfidenceLevel(recommendation.confidence) ? (
                    <ConfidenceBadge
                      key="confidence"
                      confidence={toBadgeConfidenceLevel(recommendation.confidence)!}
                    />
                  ) : null,
                  toWorkflowStatus(recommendation.status) ? (
                    <StatusBadge key="status" status={toWorkflowStatus(recommendation.status)!} />
                  ) : null,
                ],
              }))}
            />
          </div>
        </CardContent>
      </Card>
    </section>
  );
}

function SummaryTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-border/80 bg-muted/30 p-4 shadow-sm shadow-slate-950/5">
      <p className="text-xs font-medium uppercase tracking-normal text-muted-foreground">
        {label}
      </p>
      <p className="mt-2 text-lg font-semibold">{value}</p>
    </div>
  );
}

function SectionPreview({
  title,
  emptyText,
  items,
}: {
  title: string;
  emptyText: string;
  items: Array<{ id: string; title: string; href?: string; badges: ReactNode[] }>;
}) {
  const visibleItems = items.slice(0, 3);
  const hiddenCount = items.length - visibleItems.length;

  return (
    <div className="rounded-lg border border-border/80 bg-muted/20 p-4 shadow-sm shadow-slate-950/5">
      <div className="flex items-center justify-between gap-3 border-b pb-3">
        <p className="text-sm font-semibold">{title}</p>
        {items.length > 0 ? <Badge variant="outline">{items.length}</Badge> : null}
      </div>
      {items.length > 0 ? (
        <div className="mt-4 space-y-3">
          {visibleItems.map((item) => (
            <div key={item.id} className="rounded-md border bg-background p-3">
              {item.href ? (
                <Link
                  href={item.href}
                  className="block break-words text-sm font-medium leading-5 hover:text-primary"
                >
                  {item.title}
                </Link>
              ) : (
                <p className="break-words text-sm font-medium leading-5">{item.title}</p>
              )}
              <div className="mt-2 flex flex-wrap gap-2">
                {item.badges.filter(Boolean)}
              </div>
            </div>
          ))}
          {hiddenCount > 0 ? (
            <p className="text-xs text-muted-foreground">
              View all in the full preview below · {hiddenCount} more
            </p>
          ) : null}
        </div>
      ) : (
        <p className="mt-3 text-sm text-muted-foreground">{emptyText}</p>
      )}
    </div>
  );
}

function SeverityBadge({ severity }: { severity: string }) {
  const variant =
    severity === "CRITICAL" ? "danger" : severity === "LOW" ? "neutral" : "warning";
  const className =
    severity === "HIGH" ? "border-orange-500/60 bg-orange-100 text-orange-950" : undefined;

  return (
    <Badge variant={variant} className={className}>
      {formatAuditEnum(severity)}
    </Badge>
  );
}

function PriorityBadge({ priority }: { priority: string }) {
  const variant =
    priority === "CRITICAL" ? "danger" : priority === "LOW" ? "neutral" : "warning";
  const className =
    priority === "HIGH" ? "border-orange-500/60 bg-orange-100 text-orange-950" : undefined;

  return (
    <Badge variant={variant} className={className}>
      {formatAuditEnum(priority)}
    </Badge>
  );
}
