import { Badge } from "@/components/ui/badge";
import type { RiskLevel } from "@/types/audit";

const riskConfig = {
  strong: { label: "Strong", variant: "success" },
  "needs-improvement": { label: "Needs improvement", variant: "warning" },
  "risk-area": { label: "Risk area", variant: "warning" },
  "critical-gap": { label: "Critical gap", variant: "danger" },
} as const;

export function RiskBadge({ risk }: { risk: RiskLevel }) {
  const config = riskConfig[risk];

  return <Badge variant={config.variant}>{config.label}</Badge>;
}
