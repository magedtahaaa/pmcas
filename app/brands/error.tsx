"use client";

import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function BrandsError({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Brands"
        description="Something blocked the brand workspace from loading."
        tone="brands"
      />

      <Card>
        <CardContent className="flex min-h-64 flex-col items-center justify-center text-center">
          <h2 className="text-base font-semibold">Brands could not load</h2>
          <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">
            Check that the local database is running, then try again.
          </p>
          <Button type="button" className="mt-5" onClick={reset}>
            Try again
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
