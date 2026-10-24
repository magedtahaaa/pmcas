import Link from "next/link";
import { ClipboardList } from "lucide-react";

import { AuditCategoryCard } from "@/components/audit/audit-category-card";
import { EmptyState } from "@/components/layout/empty-state";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { WorkflowList } from "@/components/workflow/workflow-list-card";
import { getAuditCategoryItems } from "@/lib/audits/queries";

export const dynamic = "force-dynamic";

export default async function AuditReviewsPage() {
  const audits = await getAuditCategoryItems();

  return (
    <div className="space-y-8">
      <PageHeader
        title="Audit Reviews"
        description="Select an audit and open its internal consultant summary view."
        tone="reports"
        actions={
          <Button asChild variant="outline">
            <Link href="/audits">All audits</Link>
          </Button>
        }
      />

      {audits.length === 0 ? (
        <EmptyState
          icon={ClipboardList}
          title="No audit reviews yet"
          description="Audit summaries become available after an audit is created."
          actionLabel="Go to brands"
          actionHref="/brands"
          tone="reports"
        />
      ) : (
        <Card className="border-slate-300 bg-slate-50/90">
          <CardHeader>
            <CardTitle>Available audit summaries</CardTitle>
            <CardDescription>
              Open the internal report view for any audit without adding record-specific sidebar links.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <WorkflowList>
              {audits.map((audit) => (
                <AuditCategoryCard
                  key={audit.id}
                  audit={audit}
                  primaryHref={`/audits/${audit.id}/summary`}
                  primaryLabel="Open summary"
                  tone="reports"
                  secondaryActions={[
                    {
                      href: `/audits/${audit.id}`,
                      label: "Workspace",
                    },
                    {
                      href: `/audits/${audit.id}/report`,
                      label: "Client report",
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
