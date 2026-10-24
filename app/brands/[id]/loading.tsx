import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function BrandProfileLoading() {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Brand profile"
        title="Loading brand"
        description="Loading business context, metrics, and audit history."
        tone="brands"
      />

      <section className="grid gap-4 md:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <Card key={index}>
            <CardHeader>
              <CardTitle>Loading</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-8 rounded-md bg-muted" />
            </CardContent>
          </Card>
        ))}
      </section>
    </div>
  );
}
