import { EmptyState } from "@/components/layout/empty-state";

export default function FindingNotFoundPage() {
  return (
    <EmptyState
      title="Finding not found"
      description="This finding may have been removed or the link may be incorrect."
      actionLabel="Back to findings"
      actionHref="/findings"
      tone="findings"
    />
  );
}
