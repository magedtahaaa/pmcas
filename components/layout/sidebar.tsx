"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  AlertTriangle,
  Building2,
  ClipboardCheck,
  ClipboardList,
  Download,
  FileText,
  FlaskConical,
  Gauge,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";

import { cn } from "@/lib/utils";

const navigationGroups = [
  {
    label: "Workspace",
    items: [
      { name: "Dashboard", href: "/dashboard", icon: Gauge },
      { name: "Brands", href: "/brands", icon: Building2 },
      { name: "Audits", href: "/audits", icon: ClipboardList },
    ],
  },
  {
    label: "Reports",
    items: [
      { name: "Audit Reviews", href: "/audit-reviews", icon: ClipboardCheck },
      { name: "Client Reports", href: "/reports", icon: FileText },
      { name: "Exports", href: "/exports", icon: Download },
    ],
  },
  {
    label: "Workflow",
    items: [
      { name: "Findings", href: "/findings", icon: AlertTriangle },
      { name: "Recommendations", href: "/recommendations", icon: ClipboardCheck },
      { name: "Experiments", href: "/experiments", icon: FlaskConical },
    ],
  },
];

export function Sidebar({
  isCollapsed,
  onToggle,
}: {
  isCollapsed: boolean;
  onToggle: () => void;
}) {
  const pathname = usePathname();
  const ToggleIcon = isCollapsed ? PanelLeftOpen : PanelLeftClose;

  return (
    <aside className="border-e border-border/80 bg-card md:sticky md:top-0 md:flex md:h-screen md:flex-col md:self-start md:overflow-hidden">
      <div
        className={cn(
          "flex h-16 shrink-0 items-center border-b border-border/80 px-5",
          isCollapsed && "md:justify-center md:px-3",
        )}
      >
        <Link
          href="/dashboard"
          className={cn("flex min-w-0 items-center gap-3", isCollapsed && "md:justify-center")}
          aria-label="PMCAS dashboard"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-md bg-primary text-primary-foreground shadow-sm shadow-primary/20">
            <BarChart3 className="h-5 w-5" aria-hidden="true" />
          </span>
          <span className={cn("min-w-0", isCollapsed && "md:sr-only")}>
            <span className="block text-sm font-semibold">PMCAS</span>
            <span className="block truncate text-xs text-muted-foreground">Audit system</span>
          </span>
        </Link>
      </div>

      <div className="border-b border-border/80 px-3 py-3 max-md:hidden">
        <button
          type="button"
          onClick={onToggle}
          aria-label={isCollapsed ? "Expand sidebar navigation" : "Collapse sidebar navigation"}
          className={cn(
            "flex w-full items-center gap-3 rounded-md border border-border/80 bg-background px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
            isCollapsed && "justify-center px-2",
          )}
        >
          <ToggleIcon className="h-4 w-4 shrink-0" aria-hidden="true" />
          <span className={cn("truncate", isCollapsed && "md:sr-only")}>
            {isCollapsed ? "Expand" : "Collapse"}
          </span>
        </button>
      </div>

      <nav
        className={cn(
          "flex gap-2 overflow-x-auto px-3 py-3 md:block md:flex-1 md:space-y-1 md:overflow-y-auto md:overflow-x-hidden",
          isCollapsed && "md:px-2",
        )}
      >
        {navigationGroups.map((group, groupIndex) => (
          <div key={group.label} className="contents md:block">
            {groupIndex > 0 && isCollapsed ? (
              <div className="mx-auto my-3 hidden h-px w-8 bg-border/80 md:block" aria-hidden="true" />
            ) : null}
            <p
              className={cn(
                "hidden px-3 pb-2 pt-4 text-[11px] font-semibold uppercase tracking-normal text-muted-foreground md:block",
                groupIndex === 0 && "md:pt-1",
                isCollapsed && "md:sr-only",
              )}
            >
              {group.label}
            </p>

            <div className="contents md:block md:space-y-1">
              {group.items.map((item) => {
                const isActive = isNavigationActive(pathname, item.href);
                const Icon = item.icon;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    title={isCollapsed ? item.name : undefined}
                    aria-label={isCollapsed ? item.name : undefined}
                    className={cn(
                      "flex min-w-max items-center gap-3 rounded-md border border-transparent px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring md:min-w-0",
                      isActive &&
                        "border-primary/60 bg-primary/15 text-primary shadow-sm shadow-primary/15 ring-1 ring-primary/15",
                      isCollapsed && "md:justify-center md:px-2",
                    )}
                  >
                    <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                    <span className={cn("truncate", isCollapsed && "md:sr-only")}>{item.name}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>
    </aside>
  );
}

function isNavigationActive(pathname: string, href: string) {
  if (href === "/dashboard") {
    return pathname === href || pathname === "/";
  }

  if (href === "/audit-reviews") {
    return pathname === href || (pathname.startsWith("/audits/") && pathname.endsWith("/summary"));
  }

  if (href === "/reports") {
    return pathname === href || (pathname.startsWith("/audits/") && pathname.endsWith("/report"));
  }

  if (href === "/audits") {
    return (
      pathname === href ||
      (pathname.startsWith("/audits/") &&
        !pathname.endsWith("/summary") &&
        !pathname.endsWith("/report"))
    );
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}
