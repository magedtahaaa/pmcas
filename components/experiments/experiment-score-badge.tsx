import { Badge } from "@/components/ui/badge";

function getScoreVariant(value: number) {
  if (value >= 4) {
    return "success";
  }

  if (value === 3) {
    return "warning";
  }

  return "neutral";
}

export function ExperimentScoreBadge({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return <Badge variant={getScoreVariant(value)}>{`${label}: ${value}/5`}</Badge>;
}
