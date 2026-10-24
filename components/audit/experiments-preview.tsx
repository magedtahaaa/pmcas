import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowUpRight, FlaskConical } from "lucide-react";

import { ExperimentScoreBadge } from "@/components/experiments/experiment-score-badge";
import { ExperimentStatusBadge } from "@/components/experiments/experiment-status-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  WorkflowList,
  WorkflowMetaGrid,
  WorkflowMetaItem,
  WorkflowSnippet,
} from "@/components/workflow/workflow-list-card";
import { formatAuditEnum } from "@/lib/audits/format";
import { formatDate } from "@/lib/brands/format";

export type ExperimentPreviewItem = {
  id: string;
  funnelStage: string;
  hypothesis: string;
  proposedChange: string;
  primaryMetric: string;
  impact: number;
  confidenceScore: number;
  effort: number;
  priorityScore: number;
  owner: string;
  status: string;
  deadline: Date | null;
  recommendation: {
    title: string;
  } | null;
};

export function ExperimentsPreview({
  experiments,
  embedded = false,
  emptyAction,
}: {
  experiments: ExperimentPreviewItem[];
  embedded?: boolean;
  emptyAction?: ReactNode;
}) {
  const content = (
    <CardContent className={embedded ? "p-0" : undefined}>
      {experiments.length > 0 ? (
        <WorkflowList>
          {experiments.map((experiment) => (
            <article
              key={experiment.id}
              className="rounded-md border border-s-4 border-purple-300/85 border-s-purple-600 bg-purple-50/80 p-4 shadow-sm shadow-slate-950/5 transition-colors hover:border-purple-500/70 hover:bg-purple-100/65"
            >
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="min-w-0 flex-1 space-y-4">
                  <div className="space-y-2">
                    <Link
                      href={`/experiments/${experiment.id}`}
                      className="block break-words text-sm font-semibold leading-6 text-foreground hover:text-primary"
                    >
                      {experiment.proposedChange || experiment.hypothesis}
                    </Link>
                    <p className="line-clamp-2 break-words text-xs leading-5 text-muted-foreground">
                      Recommendation: {experiment.recommendation?.title ?? "Not linked"}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="outline">Priority: {experiment.priorityScore}</Badge>
                      <ExperimentStatusBadge status={experiment.status} />
                      <ExperimentScoreBadge label="Impact" value={experiment.impact} />
                      <ExperimentScoreBadge
                        label="Confidence"
                        value={experiment.confidenceScore}
                      />
                      <Badge variant="neutral">Effort: {experiment.effort}/5</Badge>
                    </div>
                  </div>

                  <WorkflowMetaGrid className="sm:grid-cols-2 xl:grid-cols-4">
                    <WorkflowMetaItem label="Funnel stage">
                      {experiment.funnelStage}
                    </WorkflowMetaItem>
                    <WorkflowMetaItem label="Primary metric">
                      {experiment.primaryMetric}
                    </WorkflowMetaItem>
                    <WorkflowMetaItem label="Owner">
                      {formatAuditEnum(experiment.owner)}
                    </WorkflowMetaItem>
                    <WorkflowMetaItem label="Deadline">
                      {experiment.deadline ? formatDate(experiment.deadline) : "Not set"}
                    </WorkflowMetaItem>
                  </WorkflowMetaGrid>

                  <WorkflowSnippet label="Hypothesis">{experiment.hypothesis}</WorkflowSnippet>
                </div>

                <Button asChild variant="outline" size="sm" className="w-full shrink-0 sm:w-auto">
                  <Link href={`/experiments/${experiment.id}`}>
                    Open experiment
                    <ArrowUpRight className="ms-2 h-4 w-4" aria-hidden="true" />
                  </Link>
                </Button>
              </div>
            </article>
          ))}
        </WorkflowList>
      ) : (
        <div className="flex min-h-40 flex-col items-center justify-center rounded-md border border-dashed bg-muted/10 p-6 text-center">
          <FlaskConical className="mb-3 h-6 w-6 text-muted-foreground" aria-hidden="true" />
          <p className="text-sm font-medium">No experiments yet</p>
          <p className="mt-1 max-w-md text-sm leading-6 text-muted-foreground">
            Experiments will appear after recommendations are prioritized for testing.
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
        <CardTitle>Experiments</CardTitle>
        <p className="text-sm leading-6 text-muted-foreground">
          Prioritized tests and operational actions linked to this audit.
        </p>
      </CardHeader>
      {content}
    </Card>
  );
}
