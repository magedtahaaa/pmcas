import type { ReactNode } from "react";
import { ChevronDown } from "lucide-react";

import { cn } from "@/lib/utils";

export function WorkflowFilterBar({
  action,
  children,
  className,
}: {
  action: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <form action={action} className={cn("flex flex-wrap items-end gap-4", className)}>
      {children}
    </form>
  );
}

export function WorkflowFilterSelect({
  label,
  name,
  value,
  children,
  className,
}: {
  label: string;
  name: string;
  value?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <label className={cn("min-w-52 flex-1 basis-52 space-y-2", className)}>
      <span className="text-sm font-medium text-foreground">{label}</span>
      <span className="relative block min-w-0">
        <select
          name={name}
          defaultValue={value ?? ""}
          className="flex h-10 w-full min-w-0 appearance-none truncate rounded-md border border-input bg-background py-2 pe-10 ps-3 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          {children}
        </select>
        <ChevronDown
          className="pointer-events-none absolute end-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden="true"
        />
      </span>
    </label>
  );
}

export function WorkflowFilterActions({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex min-w-52 flex-1 basis-52 flex-wrap items-end gap-2", className)}>
      {children}
    </div>
  );
}
