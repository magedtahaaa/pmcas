import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AuditWorkspaceLoading() {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Audit workspace"
        title="Loading audit"
        description="Loading criteria, responses, findings, and recommendations."
        tone="audits"
      />

      <div className="grid gap-6 xl:grid-cols-[280px_minmax(0,1fr)] 2xl:grid-cols-[300px_minmax(0,1fr)]">
        <Card>
          <CardHeader>
            <CardTitle>Audit progress</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="h-10 rounded-md bg-muted" />
            ))}
          </CardContent>
        </Card>

        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, index) => (
            <Card key={index}>
              <CardHeader>
                <CardTitle>Loading section</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-32 rounded-md bg-muted" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
