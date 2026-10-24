import { EmptyState } from "@/components/layout/empty-state";

export default function ExperimentNotFound() {
  return (
    <EmptyState
      title="Experiment not found"
      description="This experiment could not be found. It may have been removed or the link may be incorrect."
      actionLabel="Back to experiments"
      actionHref="/experiments"
      tone="experiments"
    />
  );
}
