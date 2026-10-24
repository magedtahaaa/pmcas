import { EmptyState } from "@/components/layout/empty-state";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export function ExperimentsTablePlaceholder() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Experiment backlog</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Hypothesis</TableHead>
              <TableHead>Primary metric</TableHead>
              <TableHead>Impact</TableHead>
              <TableHead>Confidence</TableHead>
              <TableHead>Effort</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody />
        </Table>
        <EmptyState
          title="No experiments yet"
          description="Accepted recommendations can later be converted into prioritized experiments."
        />
      </CardContent>
    </Card>
  );
}
