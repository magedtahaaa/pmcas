"use client";

import Link from "next/link";

import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function BrandProfileError({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Brand profile"
        title="Brand could not load"
        description="Something blocked the selected brand profile from loading."
        tone="brands"
        actions={
          <Button asChild variant="outline">
            <Link href="/brands">Back to brands</Link>
          </Button>
        }
      />

      <Card>
        <CardContent className="flex min-h-64 flex-col items-center justify-center text-center">
          <h2 className="text-base font-semibold">Profile unavailable</h2>
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
