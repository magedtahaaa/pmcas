import { EmptyState } from "@/components/layout/empty-state";
import { StatusBadge } from "@/components/layout/status-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export function FindingsTablePlaceholder() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Findings table</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Finding</TableHead>
              <TableHead>Section</TableHead>
              <TableHead>Severity</TableHead>
              <TableHead>Confidence</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody />
        </Table>
        <EmptyState
          title="No findings yet"
          description="Draft findings will appear here after audit criteria and evidence capture are implemented."
        />
        <div className="sr-only">
          <StatusBadge status="draft" />
        </div>
      </CardContent>
    </Card>
  );
}
