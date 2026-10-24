"use client";

import { useEffect, useState } from "react";

import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import { cn } from "@/lib/utils";

const SIDEBAR_STORAGE_KEY = "pmcas:sidebar-collapsed";

export function AppShell({ children }: { children: React.ReactNode }) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  useEffect(() => {
    const frameId = window.requestAnimationFrame(() => {
      let storedValue: string | null = null;

      try {
        storedValue = window.localStorage.getItem(SIDEBAR_STORAGE_KEY);
      } catch {
        storedValue = null;
      }

      if (storedValue === "true") {
        setIsSidebarCollapsed(true);
      }
    });

    return () => {
      window.cancelAnimationFrame(frameId);
    };
  }, []);

  function toggleSidebar() {
    setIsSidebarCollapsed((currentValue) => {
      const nextValue = !currentValue;

      try {
        window.localStorage.setItem(SIDEBAR_STORAGE_KEY, String(nextValue));
      } catch {
        // The layout still works if browser storage is unavailable.
      }

      return nextValue;
    });
  }

  return (
    <div
      className={cn(
        "min-h-screen bg-background md:grid md:items-start md:transition-[grid-template-columns] md:duration-200 md:ease-out",
        isSidebarCollapsed
          ? "md:grid-cols-[84px_minmax(0,1fr)]"
          : "md:grid-cols-[280px_minmax(0,1fr)]",
      )}
    >
      <Sidebar isCollapsed={isSidebarCollapsed} onToggle={toggleSidebar} />
      <div className="min-w-0 md:min-h-screen">
        <Topbar />
        <main className="mx-auto w-full max-w-[1520px] px-4 py-8 sm:px-6 lg:px-8">
          {children}
        </main>
      </div>
    </div>
  );
}
