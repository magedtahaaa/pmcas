import { ConfidenceBadge } from "@/components/layout/confidence-badge";
import { RiskBadge } from "@/components/layout/risk-badge";
import { ScoreBadge } from "@/components/layout/score-badge";
import { StatusBadge } from "@/components/layout/status-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { auditSections } from "@/types/audit";

export function AuditSectionList() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>8-section PMCAS framework</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-3 md:grid-cols-2">
        {auditSections.map((section, index) => (
          <div key={section} className="rounded-md border bg-background p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold text-primary">Section {index + 1}</p>
                <h3 className="mt-1 text-sm font-semibold">{section}</h3>
              </div>
              <StatusBadge status="draft" />
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <ScoreBadge score={0} />
              <RiskBadge risk="critical-gap" />
              <ConfidenceBadge confidence="low" />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
