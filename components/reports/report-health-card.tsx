import type { ReactNode } from "react";

import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { getVisualTone, type VisualTone } from "@/lib/ui/visual-system";

export function ReportHealthCard({
  label,
  value,
  helper,
  tone = "neutral",
  badge,
}: {
  label: string;
  value: ReactNode;
  helper?: string;
  tone?: VisualTone;
  badge?: ReactNode;
}) {
  const visualTone = getVisualTone(tone);

  return (
    <Card
      className={cn(
        "border-s-4",
        tone === "neutral" ? "border-s-border" : `${visualTone.accentBorderClass} ${visualTone.cardClass}`,
      )}
    >
      <CardContent className="space-y-3 p-4">
        <div className="flex items-start justify-between gap-3">
          <p className="text-xs font-medium uppercase tracking-normal text-muted-foreground">
            {label}
          </p>
          {badge}
        </div>
        <div className="break-words text-2xl font-semibold leading-8 text-foreground">
          {value}
        </div>
        {helper ? <p className="text-sm leading-6 text-muted-foreground">{helper}</p> : null}
      </CardContent>
    </Card>
  );
}
