import { Badge } from "@/components/ui/badge";
import { formatAuditEnum } from "@/lib/audits/format";
import type { ExperimentStatusValue } from "@/lib/experiments/constants";

const experimentStatusConfig = {
  BACKLOG: { variant: "neutral", label: "Backlog" },
  PLANNED: { variant: "warning", label: "Planned" },
  RUNNING: { variant: "default", label: "Running" },
  COMPLETED: { variant: "success", label: "Completed" },
  PAUSED: { variant: "secondary", label: "Paused" },
  REJECTED: { variant: "danger", label: "Rejected" },
} as const;

export function ExperimentStatusBadge({ status }: { status: ExperimentStatusValue | string }) {
  const config =
    status in experimentStatusConfig
      ? experimentStatusConfig[status as ExperimentStatusValue]
      : null;

  return (
    <Badge variant={config?.variant ?? "neutral"}>
      {config?.label ?? formatAuditEnum(status)}
    </Badge>
  );
}
