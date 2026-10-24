import Link from "next/link";

import { PageHeader } from "@/components/layout/page-header";
import { EmptyState } from "@/components/layout/empty-state";
import { Button } from "@/components/ui/button";

export default function BrandNotFound() {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Brand profile"
        title="Brand not found"
        description="The requested brand profile does not exist in the local PMCAS database."
        tone="brands"
        actions={
          <Button asChild variant="outline">
            <Link href="/brands">Back to brands</Link>
          </Button>
        }
      />

      <EmptyState
        title="No matching brand"
        description="Return to the brand list and open an existing client profile."
        actionLabel="View brands"
        actionHref="/brands"
        tone="brands"
      />
    </div>
  );
}
