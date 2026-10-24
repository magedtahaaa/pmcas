import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowUpRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { getVisualTone, type VisualTone } from "@/lib/ui/visual-system";

export function WorkflowList({ children }: { children: ReactNode }) {
  return <div className="space-y-4">{children}</div>;
}

export function WorkflowItemCard({
  title,
  href,
  description,
  badges,
  children,
  actionLabel = "Open",
  tone = "neutral",
}: {
  title: string;
  href: string;
  description?: ReactNode;
  badges?: ReactNode;
  children?: ReactNode;
  actionLabel?: string;
  tone?: VisualTone;
}) {
  const visualTone = getVisualTone(tone);

  return (
    <Card
      className={cn(
        "border-s-4 transition-colors",
        tone === "neutral"
          ? "border-s-border hover:border-primary/30 hover:bg-muted/15"
          : `${visualTone.accentBorderClass} ${visualTone.cardClass} ${visualTone.hoverClass}`,
      )}
    >
      <CardContent className="p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0 flex-1 space-y-4">
            <div className="space-y-2">
              <Link
                href={href}
                className="block break-words text-base font-semibold leading-6 text-foreground hover:text-primary"
              >
                {title}
              </Link>
              {description ? (
                <div className="line-clamp-3 max-w-5xl break-words text-sm leading-6 text-muted-foreground">
                  {description}
                </div>
              ) : null}
            </div>
            {badges ? <div className="flex flex-wrap gap-2">{badges}</div> : null}
            {children}
          </div>

          <Button asChild variant="outline" className="w-full shrink-0 sm:w-auto">
            <Link href={href}>
              {actionLabel}
              <ArrowUpRight className="ms-2 h-4 w-4" aria-hidden="true" />
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export function WorkflowMetaGrid({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <dl className={cn("grid gap-3 sm:grid-cols-2 xl:grid-cols-4", className)}>
      {children}
    </dl>
  );
}

export function WorkflowMetaItem({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="min-w-0 rounded-md border border-border/80 bg-muted/20 p-3">
      <dt className="text-xs font-medium uppercase tracking-normal text-muted-foreground">
        {label}
      </dt>
      <dd className="mt-1 break-words text-sm leading-6 text-foreground">{children}</dd>
    </div>
  );
}

export function WorkflowSnippet({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="rounded-md border border-border/70 bg-muted/25 p-3">
      <p className="text-xs font-medium uppercase tracking-normal text-muted-foreground">
        {label}
      </p>
      <div className="mt-1 line-clamp-3 break-words text-sm leading-6 text-muted-foreground">
        {children}
      </div>
    </div>
  );
}
