import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function BrandsLoading() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Brands"
        description="Loading client profiles and business context."
        tone="brands"
      />

      <Card>
        <CardHeader>
          <CardTitle>Client profiles</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="h-12 rounded-md bg-muted" />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
