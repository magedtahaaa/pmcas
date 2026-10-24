import Link from "next/link";
import { FileText } from "lucide-react";

import { AuditCategoryCard } from "@/components/audit/audit-category-card";
import { EmptyState } from "@/components/layout/empty-state";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { WorkflowList } from "@/components/workflow/workflow-list-card";
import { getAuditCategoryItems } from "@/lib/audits/queries";

export const dynamic = "force-dynamic";

export default async function ReportsPage() {
  const audits = await getAuditCategoryItems();

  return (
    <div className="space-y-8">
      <PageHeader
        title="Client Reports"
        description="Select an audit and open its polished client-ready report output."
        tone="reports"
        actions={
          <Button asChild variant="outline">
            <Link href="/audit-reviews">Audit reviews</Link>
          </Button>
        }
      />

      {audits.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No client reports yet"
          description="Client-ready report pages become available after an audit is created."
          actionLabel="Go to brands"
          actionHref="/brands"
          tone="reports"
        />
      ) : (
        <Card className="border-slate-300 bg-slate-50/90">
          <CardHeader>
            <CardTitle>Available client reports</CardTitle>
            <CardDescription>
              Open a presentation-friendly report for any audit. Specific report pages stay outside
              the sidebar until selected here.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <WorkflowList>
              {audits.map((audit) => (
                <AuditCategoryCard
                  key={audit.id}
                  audit={audit}
                  primaryHref={`/audits/${audit.id}/report`}
                  primaryLabel="Open report"
                  tone="reports"
                  secondaryActions={[
                    {
                      href: `/audits/${audit.id}/summary`,
                      label: "Summary",
                    },
                    {
                      href: `/exports?auditId=${encodeURIComponent(audit.id)}`,
                      label: "Exports",
                    },
                  ]}
                />
              ))}
            </WorkflowList>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
