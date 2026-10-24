import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import { ConfidenceBadge } from "@/components/layout/confidence-badge";
import { RiskBadge } from "@/components/layout/risk-badge";
import { ScoreBadge } from "@/components/layout/score-badge";
import { StatusBadge } from "@/components/layout/status-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  WorkflowItemCard,
  WorkflowMetaGrid,
  WorkflowMetaItem,
  WorkflowSnippet,
} from "@/components/workflow/workflow-list-card";
import {
  formatAuditEnum,
  toBadgeConfidenceLevel,
  toBadgeRiskLevel,
} from "@/lib/audits/format";
import { formatDate, formatNullable } from "@/lib/brands/format";
import type { VisualTone } from "@/lib/ui/visual-system";

export type AuditCategoryCardItem = {
  id: string;
  title: string;
  auditDate: Date;
  createdAt: Date;
  overallScore: number | null;
  overallRisk: string | null;
  overallConfidence: string | null;
  scalingReadiness: string | null;
  summary: string | null;
  brand: {
    id: string;
    name: string;
    industry: string | null;
    market: string | null;
  };
  _count: {
    responses: number;
    findings: number;
    recommendations: number;
    experiments: number;
    exports: number;
  };
};

export function AuditCategoryCard({
  audit,
  primaryHref,
  primaryLabel,
  secondaryActions,
  tone = "audits",
}: {
  audit: AuditCategoryCardItem;
  primaryHref: string;
  primaryLabel: string;
  secondaryActions?: Array<{
    href: string;
    label: string;
  }>;
  tone?: VisualTone;
}) {
  const risk = toBadgeRiskLevel(audit.overallRisk);
  const confidence = toBadgeConfidenceLevel(audit.overallConfidence);

  return (
    <WorkflowItemCard
      title={audit.title}
      href={primaryHref}
      actionLabel={primaryLabel}
      tone={tone}
      description={
        <>
          {audit.brand.name} · {formatDate(audit.auditDate)}
        </>
      }
      badges={
        <>
          {typeof audit.overallScore === "number" ? (
            <ScoreBadge score={audit.overallScore} />
          ) : (
            <Badge variant="neutral">Not scored</Badge>
          )}
          {risk ? <RiskBadge risk={risk} /> : <Badge variant="neutral">No risk</Badge>}
          {confidence ? (
            <ConfidenceBadge confidence={confidence} />
          ) : (
            <Badge variant="neutral">No confidence</Badge>
          )}
          <StatusBadge status="draft" />
          {audit.scalingReadiness ? (
            <Badge variant="outline">{formatAuditEnum(audit.scalingReadiness)}</Badge>
          ) : null}
        </>
      }
    >
      <WorkflowMetaGrid className="sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6">
        <WorkflowMetaItem label="Brand">{audit.brand.name}</WorkflowMetaItem>
        <WorkflowMetaItem label="Market">{formatNullable(audit.brand.market)}</WorkflowMetaItem>
        <WorkflowMetaItem label="Responses">{audit._count.responses}</WorkflowMetaItem>
        <WorkflowMetaItem label="Findings">{audit._count.findings}</WorkflowMetaItem>
        <WorkflowMetaItem label="Recommendations">{audit._count.recommendations}</WorkflowMetaItem>
        <WorkflowMetaItem label="Experiments">{audit._count.experiments}</WorkflowMetaItem>
      </WorkflowMetaGrid>

      {audit.summary ? <WorkflowSnippet label="Audit summary">{audit.summary}</WorkflowSnippet> : null}

      {secondaryActions && secondaryActions.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {secondaryActions.map((action) => (
            <Button key={action.href} asChild variant="outline" size="sm">
              <Link href={action.href}>
                {action.label}
                <ArrowUpRight className="ms-2 h-4 w-4" aria-hidden="true" />
              </Link>
            </Button>
          ))}
        </div>
      ) : null}
    </WorkflowItemCard>
  );
}
