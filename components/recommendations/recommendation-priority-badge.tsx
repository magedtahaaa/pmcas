import { Badge } from "@/components/ui/badge";
import { formatAuditEnum } from "@/lib/audits/format";

export function RecommendationPriorityBadge({ priority }: { priority: string }) {
  const variant =
    priority === "CRITICAL" ? "danger" : priority === "LOW" ? "neutral" : "warning";
  const className =
    priority === "HIGH" ? "border-orange-500/60 bg-orange-100 text-orange-950" : undefined;

  return (
    <Badge variant={variant} className={className}>
      {formatAuditEnum(priority)}
    </Badge>
  );
}
