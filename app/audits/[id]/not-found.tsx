import Link from "next/link";

import { EmptyState } from "@/components/layout/empty-state";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";

export default function AuditWorkspaceNotFound() {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Audit workspace"
        title="Audit not found"
        description="The requested audit does not exist in the local PMCAS database."
        tone="audits"
        actions={
          <Button asChild variant="outline">
            <Link href="/brands">Back to brands</Link>
          </Button>
        }
      />

      <EmptyState
        title="No matching audit"
        description="Return to a brand profile and open an existing audit from the audit preview."
        actionLabel="View brands"
        actionHref="/brands"
        tone="audits"
      />
    </div>
  );
}
