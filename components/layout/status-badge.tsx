import { Badge } from "@/components/ui/badge";

const statusConfig = {
  draft: { label: "Draft", variant: "neutral" },
  accepted: { label: "Accepted", variant: "success" },
  edited: { label: "Edited", variant: "warning" },
  dismissed: { label: "Dismissed", variant: "secondary" },
  "in-progress": { label: "In progress", variant: "warning" },
  completed: { label: "Completed", variant: "success" },
  exported: { label: "Exported", variant: "default" },
} as const;

export function StatusBadge({ status }: { status: keyof typeof statusConfig }) {
  const config = statusConfig[status];

  return <Badge variant={config.variant}>{config.label}</Badge>;
}
