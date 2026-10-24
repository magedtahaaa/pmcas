import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { createBrandAction } from "@/app/brands/actions";
import { BrandForm } from "@/components/forms/brand-form";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";

export default function NewBrandPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="Create brand"
        description="Capture the first layer of client context before data imports and audits."
        tone="brands"
        actions={
          <Button asChild variant="outline">
            <Link href="/brands">
              <ArrowLeft className="me-2 h-4 w-4" aria-hidden="true" />
              Back to brands
            </Link>
          </Button>
        }
      />

      <BrandForm action={createBrandAction} submitLabel="Create brand" />
    </div>
  );
}
