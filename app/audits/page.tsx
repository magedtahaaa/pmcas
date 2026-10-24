import Link from "next/link";
import { ClipboardCheck, PlusCircle } from "lucide-react";

import { AuditCategoryCard } from "@/components/audit/audit-category-card";
import { EmptyState } from "@/components/layout/empty-state";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { WorkflowList } from "@/components/workflow/workflow-list-card";
import { getAuditCategoryItems } from "@/lib/audits/queries";

export const dynamic = "force-dynamic";

export default async function AuditsPage() {
  const audits = await getAuditCategoryItems();

  return (
    <div className="space-y-8">
      <PageHeader
        title="Audits"
        description="Browse every PMCAS audit across brands and open the diagnostic workspace."
        tone="audits"
        actions={
          <Button asChild>
            <Link href="/brands">
              <PlusCircle className="me-2 h-4 w-4" aria-hidden="true" />
              Start from brand
            </Link>
          </Button>
        }
      />

      {audits.length === 0 ? (
        <EmptyState
          icon={ClipboardCheck}
          title="No audits yet"
          description="Open a brand profile and start a PMCAS audit when the client context is ready."
          actionLabel="Go to brands"
          actionHref="/brands"
          tone="audits"
        />
      ) : (
        <Card className="border-cyan-300/85 bg-cyan-50/80">
          <CardHeader>
            <CardTitle>Audit workspaces</CardTitle>
            <CardDescription>
              {audits.length} audit{audits.length === 1 ? "" : "s"} available across all brands.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <WorkflowList>
              {audits.map((audit) => (
                <AuditCategoryCard
                  key={audit.id}
                  audit={audit}
                  primaryHref={`/audits/${audit.id}`}
                  primaryLabel="Open workspace"
                  secondaryActions={[
                    {
                      href: `/audits/${audit.id}/summary`,
                      label: "View summary",
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
