import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { QrCode, Users, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { allLearners, fullName, SCHOOL_NAME, SCHOOL_YEAR } from "@/lib/school-data";

export const Route = createFileRoute("/id-cards")({
  component: IdCardsPage,
  head: () => ({
    meta: [
      { title: "Learner ID Cards — EduCard Pro" },
      { name: "description", content: "Preview and print learner ID cards keyed by LRN." },
    ],
  }),
});

const ids = allLearners.slice(0, 8);

function IdCardsPage() {
  return (
    <>
      <PageHeader title="Learner ID Cards" subtitle="LRN-based identification · Preview & print" />
      <main className="space-y-6 p-4 sm:p-6">
        <div className="flex items-center justify-between">
          <p className="font-ui text-sm uppercase tracking-wider text-muted-foreground">{ids.length} cards ready to print</p>
          <Button size="sm" style={{ background: "var(--gradient-primary)" }}>
            <Printer className="h-4 w-4" /> Print batch
          </Button>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {ids.map((l) => (
            <Card
              key={l.learner.lrn}
              className="overflow-hidden border-0 shadow-[var(--shadow-elegant)]"
            >
              <div
                className="px-4 py-3 text-primary-foreground"
                style={{ background: "var(--gradient-primary)" }}
              >
                <div className="flex items-center justify-between">
                  <p className="text-[10px] uppercase tracking-widest opacity-80">{SCHOOL_NAME}</p>
                  <Badge variant="secondary" className="text-[10px]">{l.department.key}</Badge>
                </div>
                <p className="text-sm font-semibold">Learner Identification Card</p>
              </div>
              <CardContent className="p-0">
                <div className="flex gap-4 p-4">
                  <div className="flex h-24 w-20 items-center justify-center rounded-md bg-muted text-muted-foreground">
                    <Users className="h-8 w-8" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="truncate text-base font-semibold">{fullName(l.learner)}</p>
                    <p className="truncate text-sm text-muted-foreground">{l.sectionLabel}</p>
                    <p className="mt-1 text-[11px] uppercase tracking-wide text-muted-foreground">
                      LRN
                    </p>
                    <p className="font-mono text-sm font-semibold tracking-wider">
                      {l.learner.lrn}
                    </p>
                    <p className="text-xs text-muted-foreground">SY {SCHOOL_YEAR}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between border-t bg-muted/40 px-4 py-3">
                  <div className="text-xs text-muted-foreground">Scan LRN to verify</div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-md border bg-background">
                    <QrCode className="h-7 w-7" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </>
  );
}
