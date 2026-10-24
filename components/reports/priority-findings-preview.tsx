import Link from "next/link";
import { ArrowUpRight, ClipboardList } from "lucide-react";

import { FindingSeverityBadge } from "@/components/findings/finding-severity-badge";
import { ConfidenceBadge } from "@/components/layout/confidence-badge";
import { StatusBadge } from "@/components/layout/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  WorkflowList,
  WorkflowMetaGrid,
  WorkflowMetaItem,
  WorkflowSnippet,
} from "@/components/workflow/workflow-list-card";
import { formatAuditEnum, toBadgeConfidenceLevel, toWorkflowStatus } from "@/lib/audits/format";

export type PriorityFindingItem = {
  id: string;
  title: string;
  sectionKey: string;
  severity: string;
  confidence: string;
  status: string;
  businessImpact: string;
  evidence: string;
};

export function PriorityFindingsPreview({ findings }: { findings: PriorityFindingItem[] }) {
  return (
    <Card className="border-s-4 border-s-orange-600 border-orange-300/85 bg-orange-50/80">
      <CardHeader>
        <CardTitle>Critical / high findings</CardTitle>
        <p className="text-sm leading-6 text-muted-foreground">
          The most important findings by severity. If no critical or high findings exist, medium
          findings are shown first.
        </p>
      </CardHeader>
      <CardContent>
        {findings.length > 0 ? (
          <WorkflowList>
            {findings.map((finding) => {
              const confidence = toBadgeConfidenceLevel(finding.confidence);
              const status = toWorkflowStatus(finding.status);

              return (
                <article
                  key={finding.id}
                  className="rounded-md border border-orange-300/85 bg-background/90 p-4 shadow-sm shadow-slate-950/5"
                >
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="min-w-0 flex-1 space-y-4">
                      <div className="space-y-2">
                        <Link
                          href={`/findings/${finding.id}`}
                          className="block break-words text-sm font-semibold leading-6 text-foreground hover:text-primary"
                        >
                          {finding.title}
                        </Link>
                        <div className="flex flex-wrap gap-2">
                          <FindingSeverityBadge severity={finding.severity} />
                          {confidence ? <ConfidenceBadge confidence={confidence} /> : null}
                          {status ? <StatusBadge status={status} /> : null}
                        </div>
                      </div>

                      <WorkflowMetaGrid className="sm:grid-cols-2 xl:grid-cols-3">
                        <WorkflowMetaItem label="Section">
                          {formatAuditEnum(finding.sectionKey)}
                        </WorkflowMetaItem>
                        <WorkflowMetaItem label="Severity">
                          <FindingSeverityBadge severity={finding.severity} />
                        </WorkflowMetaItem>
                        <WorkflowMetaItem label="Status">
                          {status ? <StatusBadge status={status} /> : "Not set"}
                        </WorkflowMetaItem>
                      </WorkflowMetaGrid>

                      <WorkflowSnippet label="Business impact">
                        {finding.businessImpact}
                      </WorkflowSnippet>
                      <WorkflowSnippet label="Evidence">
                        {finding.evidence}
                      </WorkflowSnippet>
                    </div>

                    <Button asChild variant="outline" size="sm" className="w-full shrink-0 sm:w-auto">
                      <Link href={`/findings/${finding.id}`}>
                        Open finding
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
            title="No findings recorded yet"
            description="Findings will appear here after audit criteria and evidence are captured."
          />
        )}
      </CardContent>
    </Card>
  );
}

function EmptyReportState({ title, description }: { title: string; description: string }) {
  return (
    <div className="flex min-h-40 flex-col items-center justify-center rounded-md border border-dashed bg-background/70 p-6 text-center">
      <ClipboardList className="mb-3 h-6 w-6 text-muted-foreground" aria-hidden="true" />
      <p className="text-sm font-medium">{title}</p>
      <p className="mt-1 max-w-md text-sm leading-6 text-muted-foreground">{description}</p>
    </div>
  );
}
