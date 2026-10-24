import { Badge } from "@/components/ui/badge";

export function Topbar() {
  return (
    <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-border/80 bg-background/95 px-4 backdrop-blur sm:px-6 lg:px-8">
      <div className="min-w-0">
        <p className="truncate text-sm font-medium">Performance Marketing & Conversion Audit System</p>
        <p className="text-xs text-muted-foreground">Internal consulting workspace</p>
      </div>
      <Badge variant="neutral" className="ms-3 shrink-0">
        MVP workspace
      </Badge>
    </header>
  );
}
