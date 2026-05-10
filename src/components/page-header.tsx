import { SidebarTrigger } from "@/components/ui/sidebar";
import { Calendar, Search } from "lucide-react";
import { Input } from "@/components/ui/input";

export function PageHeader({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  return (
    <header className="sticky top-0 z-30 border-b bg-background/80 backdrop-blur-xl">
      <div className="flex h-16 items-center gap-3 px-4 sm:px-6">
        <SidebarTrigger />
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-base font-semibold">{title}</h1>
          {subtitle && (
            <p className="truncate text-xs text-muted-foreground">{subtitle}</p>
          )}
        </div>
        <div className="relative hidden md:block">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search students, classes…"
            className="h-9 w-64 pl-8"
          />
        </div>
        <div className="hidden items-center gap-2 rounded-md border bg-card px-3 py-1.5 font-ui text-xs uppercase tracking-wider text-muted-foreground sm:flex">
          <Calendar className="h-3.5 w-3.5" />
          May 9, 2026
        </div>
      </div>
    </header>
  );
}
