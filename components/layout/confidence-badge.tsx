import { Badge } from "@/components/ui/badge";
import type { ConfidenceLevel } from "@/types/audit";

const confidenceConfig = {
  low: { label: "Low confidence", variant: "neutral" },
  medium: { label: "Medium confidence", variant: "warning" },
  high: { label: "High confidence", variant: "success" },
} as const;

export function ConfidenceBadge({ confidence }: { confidence: ConfidenceLevel }) {
  const config = confidenceConfig[confidence];

  return <Badge variant={config.variant}>{config.label}</Badge>;
}
