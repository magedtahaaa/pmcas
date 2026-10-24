import Link from "next/link";
import { ArrowLeft, ClipboardList, FileText } from "lucide-react";

import { formatDate } from "@/lib/brands/format";
import { toBadgeConfidenceLevel, toBadgeRiskLevel } from "@/lib/audits/format";
import { ConfidenceBadge } from "@/components/layout/confidence-badge";
import { PageHeader } from "@/components/layout/page-header";
import { RiskBadge } from "@/components/layout/risk-badge";
import { ScoreBadge } from "@/components/layout/score-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export function AuditHeader({
  auditTitle,
  brandId,
  brandName,
  auditDate,
  overallScore,
  overallRiskLevel,
  overallConfidence,
  scalingReadiness,
  dataIntakeHref,
  reportHref,
}: {
  auditTitle: string;
  brandId: string;
  brandName: string;
  auditDate: Date;
  overallScore: number | null;
  overallRiskLevel: string | null;
  overallConfidence: string | null;
  scalingReadiness: string | null;
  dataIntakeHref?: string;
  reportHref?: string;
}) {
  const risk = toBadgeRiskLevel(overallRiskLevel);
  const confidence = toBadgeConfidenceLevel(overallConfidence);

  return (
    <PageHeader
      eyebrow={`${brandName} · ${formatDate(auditDate)}`}
      title={auditTitle}
      description="Criteria responses, evidence, findings, recommendations, and dynamic section scores for this audit."
      tone="audits"
      actions={
        <div className="flex flex-wrap items-center gap-2">
          <Button asChild variant="outline">
            <Link href={`/brands/${brandId}`}>
              <ArrowLeft className="me-2 h-4 w-4" aria-hidden="true" />
              Back to brand
            </Link>
          </Button>
          {dataIntakeHref ? (
            <Button asChild variant="outline">
              <Link href={dataIntakeHref}>
                <ClipboardList className="me-2 h-4 w-4" aria-hidden="true" />
                Data intake
              </Link>
            </Button>
          ) : null}
          {reportHref ? (
            <Button asChild variant="outline">
              <Link href={reportHref}>
                <FileText className="me-2 h-4 w-4" aria-hidden="true" />
                View report
              </Link>
            </Button>
          ) : null}
          {overallScore !== null ? <ScoreBadge score={overallScore} /> : <Badge variant="neutral">Not scored</Badge>}
          {risk ? <RiskBadge risk={risk} /> : null}
          {confidence ? <ConfidenceBadge confidence={confidence} /> : null}
          <Badge variant={scalingReadiness ? "warning" : "neutral"}>
            {scalingReadiness ? "Scaling readiness noted" : "No scaling readiness"}
          </Badge>
        </div>
      }
    />
  );
}
