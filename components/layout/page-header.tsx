import { ReactNode } from "react";

import { cn } from "@/lib/utils";
import { getVisualTone, type VisualTone } from "@/lib/ui/visual-system";

export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
  tone = "neutral",
  marker,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
  tone?: VisualTone;
  marker?: string;
}) {
  const visualTone = getVisualTone(tone);
  const displayMarker = marker ?? (tone === "neutral" ? "" : visualTone.marker);

  return (
    <div
      className={cn(
        "flex min-w-0 flex-col gap-4 rounded-lg border p-5 shadow-sm shadow-slate-950/5 xl:flex-row xl:items-start xl:justify-between",
        tone === "neutral" ? "border-border/80 bg-card" : visualTone.headerClass,
      )}
    >
      <div className="flex min-w-0 max-w-3xl flex-1 gap-3">
        {displayMarker ? (
          <span
            className={cn(
              "mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-md border text-lg",
              visualTone.markerClass,
            )}
            aria-hidden="true"
          >
            {displayMarker}
          </span>
        ) : null}
        <div className="min-w-0 space-y-1">
        {eyebrow ? (
          <p
            className={cn(
              "text-xs font-semibold uppercase tracking-normal",
              tone === "neutral" ? "text-primary" : visualTone.textClass,
            )}
          >
            {eyebrow}
          </p>
        ) : null}
        <h1 className="break-words text-2xl font-semibold tracking-normal text-foreground">
          {title}
        </h1>
        {description ? <p className="text-sm leading-6 text-muted-foreground">{description}</p> : null}
        </div>
      </div>
      {actions ? (
        <div className="flex w-full flex-wrap items-center gap-2 xl:w-auto xl:max-w-[55%] xl:shrink-0 xl:justify-end">
          {actions}
        </div>
      ) : null}
    </div>
  );
}
