import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowUpRight, ClipboardList } from "lucide-react";

import { formatAuditEnum, toBadgeConfidenceLevel, toWorkflowStatus } from "@/lib/audits/format";
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

export type FindingPreviewItem = {
  id: string;
  title: string;
  sectionKey: string;
  severity: string;
  confidence: string;
  status: string;
  businessImpact: string;
};

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

export function FindingsPreview({
  findings,
  embedded = false,
  emptyAction,
}: {
  findings: FindingPreviewItem[];
  embedded?: boolean;
  emptyAction?: ReactNode;
}) {
  const content = (
    <CardContent className={embedded ? "p-0" : undefined}>
      {findings.length > 0 ? (
        <WorkflowList>
          {findings.map((finding) => {
            const confidence = toBadgeConfidenceLevel(finding.confidence);
            const status = toWorkflowStatus(finding.status);

            return (
              <article
                key={finding.id}
                className="rounded-md border border-s-4 border-orange-300/85 border-s-orange-600 bg-orange-50/80 p-4 shadow-sm shadow-slate-950/5 transition-colors hover:border-orange-500/70 hover:bg-orange-100/65"
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
                        <SeverityBadge severity={finding.severity} />
                        {confidence ? <ConfidenceBadge confidence={confidence} /> : null}
                        {status ? <StatusBadge status={status} /> : null}
                      </div>
                    </div>

                    <WorkflowMetaGrid className="sm:grid-cols-2 xl:grid-cols-3">
                      <WorkflowMetaItem label="Section">
                        {formatAuditEnum(finding.sectionKey)}
                      </WorkflowMetaItem>
                      <WorkflowMetaItem label="Severity">
                        <SeverityBadge severity={finding.severity} />
                      </WorkflowMetaItem>
                      <WorkflowMetaItem label="Status">
                        {status ? <StatusBadge status={status} /> : "Not set"}
                      </WorkflowMetaItem>
                    </WorkflowMetaGrid>

                    <WorkflowSnippet label="Business impact">
                      {finding.businessImpact}
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
        <div className="flex min-h-40 flex-col items-center justify-center rounded-md border border-dashed bg-muted/10 p-6 text-center">
          <ClipboardList className="mb-3 h-6 w-6 text-muted-foreground" aria-hidden="true" />
          <p className="text-sm font-medium">No findings yet</p>
          <p className="mt-1 max-w-md text-sm leading-6 text-muted-foreground">
            Existing audit findings will appear here once they are captured manually.
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
        <CardTitle>Findings</CardTitle>
        <p className="text-sm leading-6 text-muted-foreground">
          Problems and opportunities currently linked to this audit.
        </p>
      </CardHeader>
      {content}
    </Card>
  );
}
