import { EmptyState } from "@/components/layout/empty-state";

export default function RecommendationNotFoundPage() {
  return (
    <EmptyState
      title="Recommendation not found"
      description="This recommendation may have been removed or the link may be incorrect."
      actionLabel="Back to recommendations"
      actionHref="/recommendations"
      tone="recommendations"
    />
  );
}
