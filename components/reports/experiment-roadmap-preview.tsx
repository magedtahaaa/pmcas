import Link from "next/link";
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
import { formatDate } from "@/lib/brands/format";

export type ExperimentRoadmapItem = {
  id: string;
  funnelStage: string;
  hypothesis: string;
  proposedChange: string;
  primaryMetric: string;
  secondaryMetric: string | null;
  impact: number;
  confidenceScore: number;
  ease: number;
  effort: number;
  priorityScore: number;
  status: string;
  deadline: Date | null;
  result: string | null;
  learning: string | null;
  recommendation: {
    id: string;
    title: string;
  } | null;
};

export function ExperimentRoadmapPreview({
  experiments,
}: {
  experiments: ExperimentRoadmapItem[];
}) {
  return (
    <Card className="border-s-4 border-s-purple-600 border-purple-300/85 bg-purple-50/80">
      <CardHeader>
        <CardTitle>Experiment roadmap preview</CardTitle>
        <p className="text-sm leading-6 text-muted-foreground">
          Highest-priority experiments connected to recommendations and learning next steps.
        </p>
      </CardHeader>
      <CardContent>
        {experiments.length > 0 ? (
          <WorkflowList>
            {experiments.map((experiment) => (
              <article
                key={experiment.id}
                className="rounded-md border border-purple-300/85 bg-background/90 p-4 shadow-sm shadow-slate-950/5"
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="min-w-0 flex-1 space-y-4">
                    <div className="space-y-2">
                      <Link
                        href={`/experiments/${experiment.id}`}
                        className="block break-words text-sm font-semibold leading-6 text-foreground hover:text-primary"
                      >
                        {experiment.hypothesis}
                      </Link>
                      {experiment.recommendation ? (
                        <p className="line-clamp-2 break-words text-xs leading-5 text-muted-foreground">
                          Related recommendation: {experiment.recommendation.title}
                        </p>
                      ) : null}
                      <div className="flex flex-wrap gap-2">
                        <ExperimentScoreBadge label="Impact" value={experiment.impact} />
                        <ExperimentScoreBadge label="Confidence" value={experiment.confidenceScore} />
                        <ExperimentScoreBadge label="Ease" value={experiment.ease} />
                        <Badge variant="outline">Priority: {experiment.priorityScore}</Badge>
                        <ExperimentStatusBadge status={experiment.status} />
                      </div>
                    </div>

                    <WorkflowMetaGrid className="sm:grid-cols-2 xl:grid-cols-4">
                      <WorkflowMetaItem label="Funnel stage">
                        {experiment.funnelStage}
                      </WorkflowMetaItem>
                      <WorkflowMetaItem label="Primary metric">
                        {experiment.primaryMetric}
                      </WorkflowMetaItem>
                      <WorkflowMetaItem label="Secondary metric">
                        {experiment.secondaryMetric ?? "Not set"}
                      </WorkflowMetaItem>
                      <WorkflowMetaItem label="Deadline">
                        {experiment.deadline ? formatDate(experiment.deadline) : "Not set"}
                      </WorkflowMetaItem>
                    </WorkflowMetaGrid>

                    <WorkflowSnippet label="Proposed change">
                      {experiment.proposedChange}
                    </WorkflowSnippet>
                    {experiment.result || experiment.learning ? (
                      <WorkflowSnippet label="Result / learning">
                        {[experiment.result, experiment.learning].filter(Boolean).join(" ")}
                      </WorkflowSnippet>
                    ) : null}
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
          <EmptyReportState
            title="No experiments created yet"
            description="Experiments will appear after accepted recommendations are prioritized for testing."
          />
        )}
      </CardContent>
    </Card>
  );
}

function EmptyReportState({ title, description }: { title: string; description: string }) {
  return (
    <div className="flex min-h-40 flex-col items-center justify-center rounded-md border border-dashed bg-background/70 p-6 text-center">
      <FlaskConical className="mb-3 h-6 w-6 text-muted-foreground" aria-hidden="true" />
      <p className="text-sm font-medium">{title}</p>
      <p className="mt-1 max-w-md text-sm leading-6 text-muted-foreground">{description}</p>
    </div>
  );
}
