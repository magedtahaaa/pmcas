"use client";

import { useEffect, useId, useState, type ReactNode } from "react";
import { ChevronDown } from "lucide-react";

import { cn } from "@/lib/utils";
import { getVisualTone, type VisualTone } from "@/lib/ui/visual-system";

const auditResponseUnsavedEvent = "pmcas:audit-response-unsaved-change";

type AuditResponseUnsavedEventDetail = {
  criteriaId: string;
  hasUnsavedChanges: boolean;
};

export function notifyAuditResponseUnsavedChange(
  criteriaId: string,
  hasUnsavedChanges: boolean,
) {
  if (typeof window === "undefined") {
    return;
  }

  window.dispatchEvent(
    new CustomEvent<AuditResponseUnsavedEventDetail>(auditResponseUnsavedEvent, {
      detail: {
        criteriaId,
        hasUnsavedChanges,
      },
    }),
  );
}

export function AuditWorkspaceGroup({
  title,
  summary,
  metadata = [],
  action,
  children,
  defaultOpen = true,
  watchUnsavedResponses = false,
  tone = "neutral",
  marker,
}: {
  title: string;
  summary?: string;
  metadata?: string[];
  action?: ReactNode;
  children: ReactNode;
  defaultOpen?: boolean;
  watchUnsavedResponses?: boolean;
  tone?: VisualTone;
  marker?: string;
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [dirtyResponseIds, setDirtyResponseIds] = useState<Set<string>>(() => new Set());
  const contentId = useId();
  const hasUnsavedResponses = dirtyResponseIds.size > 0;
  const visualTone = getVisualTone(tone);
  const displayMarker = marker ?? (tone === "neutral" ? "" : visualTone.marker);

  useEffect(() => {
    if (!watchUnsavedResponses) {
      return;
    }

    function handleUnsavedChange(event: Event) {
      const detail = (event as CustomEvent<AuditResponseUnsavedEventDetail>).detail;

      if (!detail?.criteriaId) {
        return;
      }

      setDirtyResponseIds((currentIds) => {
        const nextIds = new Set(currentIds);

        if (detail.hasUnsavedChanges) {
          nextIds.add(detail.criteriaId);
        } else {
          nextIds.delete(detail.criteriaId);
        }

        return nextIds;
      });
    }

    window.addEventListener(auditResponseUnsavedEvent, handleUnsavedChange);

    return () => {
      window.removeEventListener(auditResponseUnsavedEvent, handleUnsavedChange);
    };
  }, [watchUnsavedResponses]);

  return (
    <section
      className={cn(
        "overflow-hidden rounded-lg border text-card-foreground shadow-md shadow-slate-950/5",
        tone === "neutral" ? "border-border/80 bg-card" : visualTone.cardClass,
      )}
    >
      <div
        className={cn(
          "flex w-full flex-col gap-3 border-b border-border/80 p-5 text-start transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:flex-row sm:items-start sm:justify-between",
          tone === "neutral" ? "bg-muted/20 hover:bg-muted/40" : `${visualTone.headerClass} ${visualTone.hoverClass}`,
        )}
      >
        <button
          type="button"
          aria-expanded={isOpen}
          aria-controls={contentId}
          onClick={() => setIsOpen((currentValue) => !currentValue)}
          className="flex min-w-0 flex-1 gap-3 text-start focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <ChevronDown
            className={cn(
              "mt-0.5 h-5 w-5 shrink-0 text-muted-foreground transition-transform",
              isOpen && "rotate-180",
            )}
            aria-hidden="true"
          />
          {displayMarker ? (
            <span
              className={cn(
                "flex h-8 w-8 shrink-0 items-center justify-center rounded-md border text-base",
                visualTone.markerClass,
              )}
              aria-hidden="true"
            >
              {displayMarker}
            </span>
          ) : null}
          <span className="min-w-0 space-y-1">
            <span className="block break-words text-base font-semibold leading-6">{title}</span>
            {summary ? <span className="block text-sm leading-6 text-muted-foreground">{summary}</span> : null}
          </span>
        </button>

        <div className="flex shrink-0 flex-col gap-3 sm:items-end">
          <span className="flex flex-wrap gap-2 sm:justify-end">
            {hasUnsavedResponses ? <HeaderPill tone="warning">Unsaved changes</HeaderPill> : null}
            {metadata.map((item) => (
              <HeaderPill key={item}>{item}</HeaderPill>
            ))}
            <HeaderPill>{isOpen ? "Expanded" : "Collapsed"}</HeaderPill>
          </span>
          {action ? <div className="w-full sm:w-auto">{action}</div> : null}
        </div>
      </div>

      <div id={contentId} hidden={!isOpen} className="bg-muted/10 p-5 sm:p-6">
        {children}
      </div>
    </section>
  );
}

function HeaderPill({
  children,
  tone = "neutral",
}: {
  children: ReactNode;
  tone?: "neutral" | "warning";
}) {
  return (
    <span
      className={cn(
        "inline-flex max-w-full items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold leading-5",
        tone === "warning"
          ? "border-amber-500/70 bg-amber-100 text-amber-950"
          : "border-border bg-background text-foreground",
      )}
    >
      {children}
    </span>
  );
}
