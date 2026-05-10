import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { QrCode, Users, Printer, Download, CheckCircle2, IdCard, Search } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/page-header";
import { SCHOOL_NAME, SCHOOL_YEAR, fullName, allLearners, allSections } from "@/lib/school-data";
import { useRole } from "@/lib/role-context";

export const Route = createFileRoute("/id-cards")({
  component: IDCardsPage,
  head: () => ({ meta: [{ title: `ID Cards — ${SCHOOL_NAME} (EduCard Pro)` }] }),
});

function IDCardsPage() {
  const { role } = useRole();
  if (role === "student") return <StudentIDCard />;
  if (role === "teacher") return <TeacherIDCards />;
  return <PrincipalIDCards />;
}

/* ─── Mini ID card component ─────────────────────────────── */
function MiniIDCard({
  name, lrn, section, dept, gradient,
}: {
  name: string; lrn: string; section: string; dept: string; gradient: string;
}) {
  return (
    <div className="w-full overflow-hidden rounded-xl border bg-card shadow-sm transition-shadow hover:shadow-md">
      <div className="px-3 py-2 text-primary-foreground" style={{ background: gradient }}>
        <p className="truncate font-ui text-[9px] uppercase tracking-wider opacity-80">{SCHOOL_NAME}</p>
        <p className="text-xs font-semibold opacity-90">Learner ID · SY {SCHOOL_YEAR}</p>
      </div>
      <div className="flex gap-2 p-3">
        <div className="flex h-12 w-10 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
          <Users className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-xs font-semibold">{name}</p>
          <p className="truncate text-[10px] text-muted-foreground">{section}</p>
          <p className="mt-0.5 font-mono text-[9px] text-muted-foreground">{lrn}</p>
        </div>
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border bg-background">
          <QrCode className="h-6 w-6 text-muted-foreground" />
        </div>
      </div>
      <div className="flex items-center justify-between border-t bg-muted/30 px-3 py-1.5">
        <span className="font-ui text-[9px] uppercase tracking-wider text-muted-foreground">{dept}</span>
        <span className="font-ui text-[9px] uppercase tracking-wider text-muted-foreground">CR-80 Ready</span>
      </div>
    </div>
  );
}

/* ─── Principal: batch manager ────────────────────────────── */
function PrincipalIDCards() {
  const [search, setSearch] = useState("");
  const [printed, setPrinted] = useState<Set<string>>(new Set());
  const [batchDone, setBatchDone] = useState(false);

  const filtered = allLearners.filter((l) => {
    const q = search.toLowerCase();
    return !q || fullName(l.learner).toLowerCase().includes(q) || l.learner.lrn.includes(q);
  });

  function togglePrint(lrn: string) {
    setPrinted((p) => {
      const n = new Set(p);
      n.has(lrn) ? n.delete(lrn) : n.add(lrn);
      return n;
    });
  }

  return (
    <>
      <PageHeader title="ID Cards" subtitle={`Batch management · ${SCHOOL_NAME} · SY ${SCHOOL_YEAR}`} />
      <main className="space-y-6 p-4 sm:p-6">
        <section className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {[
            { label: "Total Cards", value: allLearners.length, accent: "text-chart-3" },
            { label: "Printed", value: printed.size, accent: "text-chart-2" },
            { label: "Pending", value: allLearners.length - printed.size, accent: "text-orange-500" },
            { label: "Sections", value: allSections.length, accent: "text-chart-1" },
          ].map((m) => (
            <Card key={m.label} className="border-border/60">
              <CardContent className="p-5">
                <p className="font-ui text-xs font-medium uppercase tracking-wide text-muted-foreground">{m.label}</p>
                <p className={`mt-1 text-2xl font-semibold ${m.accent}`}>{m.value}</p>
              </CardContent>
            </Card>
          ))}
        </section>

        <Card>
          <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="text-base">ID Card Print Queue</CardTitle>
              <p className="text-xs text-muted-foreground">CR-80 · 300 DPI · PVC-ready output</p>
            </div>
            <div className="flex gap-2">
              <div className="relative">
                <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Name or LRN…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="h-8 w-40 pl-8 text-sm"
                />
              </div>
              <Button
                size="sm"
                style={{ background: "var(--gradient-primary)" }}
                onClick={() => { setPrinted(new Set(allLearners.map((l) => l.learner.lrn))); setBatchDone(true); }}
              >
                <Printer className="h-4 w-4" /> Print All
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {batchDone && (
              <div className="mb-4 flex items-center gap-2 rounded-lg border border-chart-2/30 bg-chart-2/10 px-4 py-3 text-sm text-chart-2">
                <CheckCircle2 className="h-4 w-4" /> Batch print job sent — {allLearners.length} cards queued.
              </div>
            )}
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filtered.map((l) => (
                <div key={l.learner.lrn} className="relative">
                  <MiniIDCard
                    name={fullName(l.learner)}
                    lrn={l.learner.lrn}
                    section={l.sectionLabel}
                    dept={l.department.key}
                    gradient={l.department.key === "JHS" ? "var(--gradient-primary)" : "var(--gradient-accent)"}
                  />
                  <button
                    onClick={() => togglePrint(l.learner.lrn)}
                    className={`mt-2 w-full rounded-lg border py-1.5 font-ui text-[11px] uppercase tracking-wider transition-colors ${
                      printed.has(l.learner.lrn)
                        ? "border-chart-2/40 bg-chart-2/10 text-chart-2"
                        : "border-border/60 bg-card text-muted-foreground hover:bg-muted"
                    }`}
                  >
                    {printed.has(l.learner.lrn) ? "✓ Printed" : "Mark Printed"}
                  </button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </main>
    </>
  );
}

/* ─── Teacher: section ID cards ──────────────────────────── */
function TeacherIDCards() {
  const mySection = allSections.find((s) => s.section.id === "g7-sampaguita")!;
  const [printed, setPrinted] = useState(false);

  return (
    <>
      <PageHeader title="ID Cards" subtitle={`${mySection.label} · Ms. Aurora Aquino · SY ${SCHOOL_YEAR}`} />
      <main className="space-y-6 p-4 sm:p-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-3">
            <div>
              <CardTitle className="text-base">Grade 7 — Sampaguita ID Cards</CardTitle>
              <p className="text-xs text-muted-foreground">3 learner cards · CR-80 PVC format</p>
            </div>
            <Button size="sm" style={{ background: "var(--gradient-accent)" }} onClick={() => setPrinted(true)}>
              <Printer className="h-4 w-4" /> Print Section
            </Button>
          </CardHeader>
          <CardContent>
            {printed && (
              <div className="mb-4 flex items-center gap-2 rounded-lg border border-chart-2/30 bg-chart-2/10 px-4 py-3 text-sm text-chart-2">
                <CheckCircle2 className="h-4 w-4" /> Print job sent — 3 cards for Grade 7 Sampaguita.
              </div>
            )}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {mySection.section.learners.map((l) => (
                <MiniIDCard
                  key={l.lrn}
                  name={fullName(l)}
                  lrn={l.lrn}
                  section={mySection.label}
                  dept="JHS"
                  gradient="var(--gradient-accent)"
                />
              ))}
            </div>
          </CardContent>
        </Card>
      </main>
    </>
  );
}

/* ─── Student: personal ID card ──────────────────────────── */
function StudentIDCard() {
  const myRecord = allLearners.find((l) => l.learner.lrn === "136728140987")!;
  const l = myRecord.learner;

  return (
    <>
      <PageHeader title="My ID Card" subtitle={`${fullName(l)} · ${myRecord.sectionLabel} · SY ${SCHOOL_YEAR}`} />
      <main className="flex flex-col items-center gap-6 p-4 sm:p-8">
        {/* Full-size CR-80 card preview */}
        <div className="w-full max-w-sm">
          <p className="mb-3 font-ui text-xs uppercase tracking-widest text-muted-foreground text-center">Preview · CR-80 Format · 85.6 × 54 mm</p>
          <div className="w-full overflow-hidden rounded-2xl border shadow-[var(--shadow-elegant)]">
            <div
              className="px-5 py-4 text-primary-foreground"
              style={{ background: "linear-gradient(135deg, oklch(0.65 0.18 30), oklch(0.78 0.16 80))" }}
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-ui text-[11px] uppercase tracking-widest opacity-80">{SCHOOL_NAME}</p>
                  <p className="mt-0.5 text-sm font-semibold">Learner Identification Card</p>
                </div>
                <IdCard className="h-5 w-5 opacity-60" />
              </div>
            </div>

            <div className="flex gap-5 p-5">
              <div className="flex h-28 w-24 shrink-0 items-center justify-center rounded-xl bg-muted text-muted-foreground">
                <Users className="h-12 w-12" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-lg font-bold leading-tight">{fullName(l)}</p>
                <p className="mt-1 text-sm text-muted-foreground">{myRecord.sectionLabel}</p>
                <p className="text-sm text-muted-foreground">{myRecord.department.label}</p>
                <div className="mt-3 space-y-1">
                  <div>
                    <p className="font-ui text-[9px] uppercase tracking-widest text-muted-foreground">Learner Reference Number</p>
                    <p className="font-mono text-sm font-bold tracking-widest">{l.lrn}</p>
                  </div>
                  <div>
                    <p className="font-ui text-[9px] uppercase tracking-widest text-muted-foreground">School Year</p>
                    <p className="text-sm font-semibold">SY {SCHOOL_YEAR}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between border-t bg-muted/40 px-5 py-4">
              <div>
                <p className="font-ui text-[9px] uppercase tracking-widest text-muted-foreground">Scan to verify attendance</p>
                <p className="mt-0.5 font-ui text-[10px] text-muted-foreground">EduCard Pro · DepEd SF2 Compliant</p>
              </div>
              <div className="flex h-16 w-16 items-center justify-center rounded-xl border bg-background">
                <QrCode className="h-10 w-10" />
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap justify-center gap-3">
          <Button
            style={{ background: "linear-gradient(135deg, oklch(0.65 0.18 30), oklch(0.78 0.16 80))" }}
            className="text-white"
          >
            <Download className="h-4 w-4" /> Download PDF
          </Button>
          <Button variant="outline">
            <Printer className="h-4 w-4" /> Print Card
          </Button>
        </div>

        {/* Details card */}
        <Card className="w-full max-w-sm">
          <CardHeader><CardTitle className="text-base">Card Details</CardTitle></CardHeader>
          <CardContent className="space-y-3 text-sm">
            {[
              { label: "Full Name", value: fullName(l) },
              { label: "LRN", value: l.lrn, mono: true },
              { label: "Section", value: myRecord.sectionLabel },
              { label: "Department", value: myRecord.department.label },
              { label: "School", value: SCHOOL_NAME },
              { label: "School Year", value: `SY ${SCHOOL_YEAR}` },
              { label: "Format", value: "CR-80 · 85.6 × 54 mm · 300 DPI" },
            ].map((f) => (
              <div key={f.label} className="flex justify-between gap-2">
                <span className="text-muted-foreground shrink-0">{f.label}</span>
                <span className={`text-right font-medium ${f.mono ? "font-mono" : ""}`}>{f.value}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </main>
    </>
  );
}
