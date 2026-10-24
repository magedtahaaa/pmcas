import { Badge } from "@/components/ui/badge";

export function ScoreBadge({ score }: { score: number }) {
  return <Badge variant="outline">{Math.round(score)} / 100</Badge>;
}
