import type { LucideIcon } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { getVisualTone, type VisualTone } from "@/lib/ui/visual-system";

export function DashboardMetricCard({
  icon: Icon,
  label,
  value,
  description,
  tone = "dashboard",
  marker,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  description?: string;
  tone?: VisualTone;
  marker?: string;
}) {
  const visualTone = getVisualTone(tone);
  const displayMarker = marker ?? (tone === "neutral" ? "" : visualTone.marker);

  return (
    <Card className={cn("transition-colors", visualTone.cardClass, visualTone.hoverClass)}>
      <CardContent className="flex items-center gap-4 p-5">
        <div
          className={cn(
            "flex h-11 w-11 shrink-0 items-center justify-center rounded-md border",
            visualTone.iconClass,
          )}
        >
          <Icon className="h-5 w-5" aria-hidden="true" />
        </div>
        <div className="min-w-0">
          <p className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground">
            {displayMarker ? <span aria-hidden="true">{displayMarker}</span> : null}
            {label}
          </p>
          <p className="break-words text-2xl font-semibold tracking-normal">{value}</p>
          {description ? (
            <p className="mt-1 text-xs leading-5 text-muted-foreground">{description}</p>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}
