import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowUpRight, ClipboardCheck } from "lucide-react";

import {
  formatAuditEnum,
  toBadgeConfidenceLevel,
  toWorkflowStatus,
} from "@/lib/audits/format";
import { ConfidenceBadge } from "@/components/layout/confidence-badge";
import { StatusBadge } from "@/components/layout/status-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  WorkflowList,
  WorkflowMetaGrid,
  WorkflowMetaItem,
  WorkflowSnippet,
} from "@/components/workflow/workflow-list-card";

export type RecommendationPreviewItem = {
  id: string;
  title: string;
  priority: string;
  suggestedOwner: string;
  confidence: string;
  status: string;
  expectedImpact: string;
  finding: {
    sectionKey: string;
    title: string;
  };
};

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

export function RecommendationsPreview({
  recommendations,
  embedded = false,
  emptyAction,
}: {
  recommendations: RecommendationPreviewItem[];
  embedded?: boolean;
  emptyAction?: ReactNode;
}) {
  const content = (
    <CardContent className={embedded ? "p-0" : undefined}>
      {recommendations.length > 0 ? (
        <WorkflowList>
          {recommendations.map((recommendation) => {
            const confidence = toBadgeConfidenceLevel(recommendation.confidence);
            const status = toWorkflowStatus(recommendation.status);

            return (
              <article
                key={recommendation.id}
                className="rounded-md border border-s-4 border-emerald-300/85 border-s-emerald-600 bg-emerald-50/80 p-4 shadow-sm shadow-slate-950/5 transition-colors hover:border-emerald-500/70 hover:bg-emerald-100/65"
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="min-w-0 flex-1 space-y-4">
                    <div className="space-y-2">
                      <Link
                        href={`/recommendations/${recommendation.id}`}
                        className="block break-words text-sm font-semibold leading-6 text-foreground hover:text-primary"
                      >
                        {recommendation.title}
                      </Link>
                      <p className="line-clamp-2 break-words text-xs leading-5 text-muted-foreground">
                        From: {recommendation.finding.title}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        <PriorityBadge priority={recommendation.priority} />
                        {confidence ? <ConfidenceBadge confidence={confidence} /> : null}
                        {status ? <StatusBadge status={status} /> : null}
                      </div>
                    </div>

                    <WorkflowMetaGrid className="sm:grid-cols-2 xl:grid-cols-4">
                      <WorkflowMetaItem label="Section">
                        {formatAuditEnum(recommendation.finding.sectionKey)}
                      </WorkflowMetaItem>
                      <WorkflowMetaItem label="Owner">
                        {formatAuditEnum(recommendation.suggestedOwner)}
                      </WorkflowMetaItem>
                      <WorkflowMetaItem label="Priority">
                        <PriorityBadge priority={recommendation.priority} />
                      </WorkflowMetaItem>
                      <WorkflowMetaItem label="Status">
                        {status ? <StatusBadge status={status} /> : "Not set"}
                      </WorkflowMetaItem>
                    </WorkflowMetaGrid>

                    <WorkflowSnippet label="Expected impact">
                      {recommendation.expectedImpact}
                    </WorkflowSnippet>
                  </div>

                  <Button asChild variant="outline" size="sm" className="w-full shrink-0 sm:w-auto">
                    <Link href={`/recommendations/${recommendation.id}`}>
                      Open recommendation
                      <ArrowUpRight className="ms-2 h-4 w-4" aria-hidden="true" />
                    </Link>
                  </Button>
                </div>
              </article>
            );
          })}
        </WorkflowList>
      ) : (
        <div className="flex min-h-40 flex-col items-center justify-center rounded-md border border-dashed bg-muted/10 p-6 text-center">
          <ClipboardCheck className="mb-3 h-6 w-6 text-muted-foreground" aria-hidden="true" />
          <p className="text-sm font-medium">No recommendations yet</p>
          <p className="mt-1 max-w-md text-sm leading-6 text-muted-foreground">
            Recommendations tied to audit findings will appear here when available.
          </p>
          {emptyAction ? <div className="mt-4">{emptyAction}</div> : null}
        </div>
      )}
    </CardContent>
  );

  if (embedded) {
    return content;
  }

  return (
    <Card>
      <CardHeader className="gap-1">
        <CardTitle>Recommendations</CardTitle>
        <p className="text-sm leading-6 text-muted-foreground">
          Action items tied to audit findings and ready for consultant review.
        </p>
      </CardHeader>
      {content}
    </Card>
  );
}
