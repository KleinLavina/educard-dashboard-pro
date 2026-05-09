import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { QrCode, Users, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/id-cards")({
  component: IdCardsPage,
  head: () => ({
    meta: [
      { title: "ID Cards — EduCard Pro" },
      { name: "description", content: "Preview and manage student identification cards." },
    ],
  }),
});

const ids = [
  { name: "Juan Dela Cruz", grade: "Grade 7 — Sampaguita", id: "2026-0487" },
  { name: "Maria Santos", grade: "Grade 8 — Rosal", id: "2026-0312" },
  { name: "Andrea Mercado", grade: "Grade 10 — Ilang-Ilang", id: "2026-0145" },
  { name: "Liza Bautista", grade: "Grade 11 — STEM", id: "2026-0067" },
];

function IdCardsPage() {
  return (
    <>
      <PageHeader title="ID Cards" subtitle="Preview, print, and reissue student IDs" />
      <main className="space-y-6 p-4 sm:p-6">
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">{ids.length} IDs ready to print</p>
          <Button size="sm" style={{ background: "var(--gradient-primary)" }}>
            <Printer className="h-4 w-4" /> Print batch
          </Button>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {ids.map((s) => (
            <Card
              key={s.id}
              className="overflow-hidden border-0 shadow-[var(--shadow-elegant)]"
            >
              <div
                className="px-4 py-3 text-primary-foreground"
                style={{ background: "var(--gradient-primary)" }}
              >
                <p className="text-[10px] uppercase tracking-widest opacity-80">St. Mary's Academy</p>
                <p className="text-sm font-semibold">Student Identification Card</p>
              </div>
              <CardContent className="p-0">
                <div className="flex gap-4 p-4">
                  <div className="flex h-24 w-20 items-center justify-center rounded-md bg-muted text-muted-foreground">
                    <Users className="h-8 w-8" />
                  </div>
                  <div className="flex-1">
                    <p className="text-base font-semibold">{s.name}</p>
                    <p className="text-sm text-muted-foreground">{s.grade}</p>
                    <p className="mt-1 font-mono text-xs text-muted-foreground">ID: {s.id}</p>
                    <p className="text-xs text-muted-foreground">SY 2025–2026</p>
                  </div>
                </div>
                <div className="flex items-center justify-between border-t bg-muted/40 px-4 py-3">
                  <div className="text-xs text-muted-foreground">Scan to verify</div>
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
