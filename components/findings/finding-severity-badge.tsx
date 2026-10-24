import { Badge } from "@/components/ui/badge";
import { formatAuditEnum } from "@/lib/audits/format";

export function FindingSeverityBadge({ severity }: { severity: string }) {
  const variant =
    severity === "CRITICAL" ? "danger" : severity === "LOW" ? "neutral" : "warning";
  const className =
    severity === "HIGH" ? "border-orange-500/60 bg-orange-100 text-orange-950" : undefined;

  return (
    <Badge variant={variant} className={className}>
      {formatAuditEnum(severity)}
    </Badge>
  );
}
