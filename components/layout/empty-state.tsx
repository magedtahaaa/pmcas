import Link from "next/link";
import { ClipboardList, type LucideIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { getVisualTone, type VisualTone } from "@/lib/ui/visual-system";

export function EmptyState({
  icon: Icon = ClipboardList,
  title,
  description,
  actionLabel,
  actionHref,
  tone = "neutral",
  marker,
}: {
  icon?: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
  tone?: VisualTone;
  marker?: string;
}) {
  const visualTone = getVisualTone(tone);
  const displayMarker = marker ?? (tone === "neutral" ? "" : visualTone.marker);

  return (
    <Card
      className={cn(
        "border-dashed bg-muted/10",
        tone !== "neutral" && visualTone.cardClass,
      )}
    >
      <CardContent className="flex min-h-64 flex-col items-center justify-center p-6 text-center">
        <div
          className={cn(
            "mb-4 flex h-12 w-12 items-center justify-center rounded-md border bg-background text-muted-foreground",
            tone !== "neutral" && visualTone.iconClass,
          )}
        >
          {displayMarker ? (
            <span className="text-xl" aria-hidden="true">
              {displayMarker}
            </span>
          ) : (
            <Icon className="h-6 w-6" aria-hidden="true" />
          )}
        </div>
        <h2 className="text-base font-semibold">{title}</h2>
        <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">{description}</p>
        {actionLabel && actionHref ? (
          <Button asChild className="mt-5">
            <Link href={actionHref}>{actionLabel}</Link>
          </Button>
        ) : null}
      </CardContent>
    </Card>
  );
}
