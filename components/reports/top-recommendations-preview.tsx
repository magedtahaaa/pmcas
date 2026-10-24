import Link from "next/link";
import { ArrowUpRight, ClipboardCheck } from "lucide-react";

import { RecommendationPriorityBadge } from "@/components/recommendations/recommendation-priority-badge";
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
import { formatAuditEnum, toWorkflowStatus } from "@/lib/audits/format";

export type TopRecommendationItem = {
  id: string;
  title: string;
  rationale: string;
  expectedImpact: string;
  effort: number;
  priority: string;
  suggestedOwner: string;
  status: string;
  finding: {
    id: string;
    title: string;
    sectionKey: string;
  };
};

export function TopRecommendationsPreview({
  recommendations,
}: {
  recommendations: TopRecommendationItem[];
}) {
  return (
    <Card className="border-s-4 border-s-emerald-600 border-emerald-300/85 bg-emerald-50/80">
      <CardHeader>
        <CardTitle>Top recommendations</CardTitle>
        <p className="text-sm leading-6 text-muted-foreground">
          Highest-priority action items tied to the audit findings.
        </p>
      </CardHeader>
      <CardContent>
        {recommendations.length > 0 ? (
          <WorkflowList>
            {recommendations.map((recommendation) => {
              const status = toWorkflowStatus(recommendation.status);

              return (
                <article
                  key={recommendation.id}
                  className="rounded-md border border-emerald-300/85 bg-background/90 p-4 shadow-sm shadow-slate-950/5"
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
                          Related finding: {recommendation.finding.title}
                        </p>
                        <div className="flex flex-wrap gap-2">
                          <RecommendationPriorityBadge priority={recommendation.priority} />
                          <Badge variant="neutral">
                            Owner: {formatAuditEnum(recommendation.suggestedOwner)}
                          </Badge>
                          {status ? <StatusBadge status={status} /> : null}
                        </div>
                      </div>

                      <WorkflowMetaGrid className="sm:grid-cols-2 xl:grid-cols-4">
                        <WorkflowMetaItem label="Section">
                          {formatAuditEnum(recommendation.finding.sectionKey)}
                        </WorkflowMetaItem>
                        <WorkflowMetaItem label="Effort">
                          {recommendation.effort}
                        </WorkflowMetaItem>
                        <WorkflowMetaItem label="Priority">
                          <RecommendationPriorityBadge priority={recommendation.priority} />
                        </WorkflowMetaItem>
                        <WorkflowMetaItem label="Status">
                          {status ? <StatusBadge status={status} /> : "Not set"}
                        </WorkflowMetaItem>
                      </WorkflowMetaGrid>

                      <WorkflowSnippet label="Expected impact">
                        {recommendation.expectedImpact}
                      </WorkflowSnippet>
                      <WorkflowSnippet label="Rationale">
                        {recommendation.rationale}
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
          <EmptyReportState
            title="No recommendations created yet"
            description="Recommendations will appear after audit findings are translated into action items."
          />
        )}
      </CardContent>
    </Card>
  );
}

function EmptyReportState({ title, description }: { title: string; description: string }) {
  return (
    <div className="flex min-h-40 flex-col items-center justify-center rounded-md border border-dashed bg-background/70 p-6 text-center">
      <ClipboardCheck className="mb-3 h-6 w-6 text-muted-foreground" aria-hidden="true" />
      <p className="text-sm font-medium">{title}</p>
      <p className="mt-1 max-w-md text-sm leading-6 text-muted-foreground">{description}</p>
    </div>
  );
}
