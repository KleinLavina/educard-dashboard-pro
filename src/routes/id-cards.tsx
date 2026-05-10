import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { QrCode, Users, Printer, Download, CheckCircle2, IdCard, Search, FileText, AlertCircle, Clock, CheckCheck, Upload, Palette } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/page-header";
import { SCHOOL_NAME, SCHOOL_YEAR, fullName, allLearners, allSections, idPrintHistory, idReprintRequests } from "@/lib/school-data";
import { useRole } from "@/lib/role-context";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

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
  const [reprintDialogOpen, setReprintDialogOpen] = useState(false);
  const [printHistoryOpen, setPrintHistoryOpen] = useState(false);
  const [templateEditorOpen, setTemplateEditorOpen] = useState(false);
  const [selectedLrn, setSelectedLrn] = useState<string | null>(null);
  const [reprintReason, setReprintReason] = useState("");
  const [customReason, setCustomReason] = useState("");

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

  function handleRequestReprint(lrn: string) {
    setSelectedLrn(lrn);
    setReprintDialogOpen(true);
  }

  function handleSubmitReprint() {
    if (!reprintReason) {
      toast.error("Please select a reason for reprint");
      return;
    }
    if (reprintReason === "other" && !customReason.trim()) {
      toast.error("Please provide a custom reason");
      return;
    }
    const reason = reprintReason === "other" ? customReason : reprintReason;
    const student = allLearners.find(l => l.learner.lrn === selectedLrn);
    toast.success(`Reprint request submitted for ${student ? fullName(student.learner) : "student"} — Reason: ${reason}`);
    setReprintDialogOpen(false);
    setReprintReason("");
    setCustomReason("");
    setSelectedLrn(null);
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
            { label: "Reprint Requests", value: idReprintRequests.filter(r => r.status === "pending").length, accent: "text-chart-1" },
          ].map((m) => (
            <Card key={m.label} className="border-border/60">
              <CardContent className="p-5">
                <p className="font-ui text-xs font-medium uppercase tracking-wide text-muted-foreground">{m.label}</p>
                <p className={`mt-1 text-2xl font-semibold ${m.accent}`}>{m.value}</p>
              </CardContent>
            </Card>
          ))}
        </section>

        {/* Reprint Requests Card */}
        <Card>
          <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="text-base">Reprint Requests</CardTitle>
              <p className="text-xs text-muted-foreground">{idReprintRequests.filter(r => r.status === "pending").length} pending requests</p>
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={() => setPrintHistoryOpen(true)}>
                <FileText className="h-4 w-4" /> Print History
              </Button>
              <Button size="sm" variant="outline" onClick={() => setTemplateEditorOpen(true)}>
                <Palette className="h-4 w-4" /> Template Editor
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {idReprintRequests.length === 0 ? (
              <div className="py-8 text-center text-sm text-muted-foreground">
                No reprint requests yet
              </div>
            ) : (
              <div className="space-y-3">
                {idReprintRequests.map((req, idx) => (
                  <div key={idx} className="flex items-center justify-between rounded-lg border bg-card p-4">
                    <div className="flex-1">
                      <p className="font-semibold">{req.studentName}</p>
                      <p className="text-sm text-muted-foreground">{req.section} · LRN: {req.lrn}</p>
                      <div className="mt-1 flex items-center gap-2">
                        <Badge variant={req.reason === "Lost" ? "destructive" : "secondary"} className="text-xs">
                          {req.reason}
                        </Badge>
                        <span className="text-xs text-muted-foreground">Requested: {req.requestedAt}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {req.status === "pending" ? (
                        <>
                          <Badge variant="outline" className="text-orange-500">
                            <Clock className="mr-1 h-3 w-3" /> Pending
                          </Badge>
                          <Button size="sm" onClick={() => toast.success(`Approved reprint for ${req.studentName}`)}>
                            Approve
                          </Button>
                        </>
                      ) : (
                        <Badge variant="outline" className="text-chart-2">
                          <CheckCheck className="mr-1 h-3 w-3" /> Approved
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

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
                  <div className="mt-2 flex gap-2">
                    <button
                      onClick={() => togglePrint(l.learner.lrn)}
                      className={`flex-1 rounded-lg border py-1.5 font-ui text-[11px] uppercase tracking-wider transition-colors ${
                        printed.has(l.learner.lrn)
                          ? "border-chart-2/40 bg-chart-2/10 text-chart-2"
                          : "border-border/60 bg-card text-muted-foreground hover:bg-muted"
                      }`}
                    >
                      {printed.has(l.learner.lrn) ? "✓ Printed" : "Mark Printed"}
                    </button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-auto px-2 py-1.5 text-[11px]"
                      onClick={() => handleRequestReprint(l.learner.lrn)}
                    >
                      Reprint
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </main>

      {/* Reprint Request Dialog */}
      <Dialog open={reprintDialogOpen} onOpenChange={setReprintDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Request ID Card Reprint</DialogTitle>
            <DialogDescription>
              Submit a reprint request for this student's ID card
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Reason for Reprint</Label>
              <Select value={reprintReason} onValueChange={setReprintReason}>
                <SelectTrigger>
                  <SelectValue placeholder="Select reason..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="lost">Lost</SelectItem>
                  <SelectItem value="damaged">Damaged</SelectItem>
                  <SelectItem value="renewal">Renewal</SelectItem>
                  <SelectItem value="photo_update">Photo Update</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {reprintReason === "other" && (
              <div className="space-y-2">
                <Label>Custom Reason</Label>
                <Textarea
                  placeholder="Describe the reason for reprint..."
                  value={customReason}
                  onChange={(e) => setCustomReason(e.target.value)}
                  rows={3}
                />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setReprintDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmitReprint}>
              Submit Request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Print History Sheet */}
      <Sheet open={printHistoryOpen} onOpenChange={setPrintHistoryOpen}>
        <SheetContent className="w-full sm:max-w-2xl">
          <SheetHeader>
            <SheetTitle>ID Card Print History</SheetTitle>
            <SheetDescription>
              Complete history of all ID card prints and reprints
            </SheetDescription>
          </SheetHeader>
          <div className="mt-6 space-y-3">
            {idPrintHistory.map((record, idx) => {
              const student = allLearners.find(l => l.learner.lrn === record.lrn);
              return (
                <Card key={idx}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="font-semibold">{student ? fullName(student.learner) : "Unknown Student"}</p>
                        <p className="text-sm text-muted-foreground">LRN: {record.lrn}</p>
                        <div className="mt-2 flex items-center gap-2">
                          <Badge variant={record.type === "original" ? "default" : "secondary"}>
                            {record.type === "original" ? "Original" : "Reprint"}
                          </Badge>
                          {record.reprintReason && (
                            <Badge variant="outline">{record.reprintReason}</Badge>
                          )}
                        </div>
                        <p className="mt-2 text-xs text-muted-foreground">
                          Printed by {record.printedBy} on {record.printedAt}
                        </p>
                      </div>
                      <Button size="sm" variant="outline">
                        <Download className="h-3 w-3" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </SheetContent>
      </Sheet>

      {/* Template Editor Dialog */}
      <Dialog open={templateEditorOpen} onOpenChange={setTemplateEditorOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>ID Card Template Editor</DialogTitle>
            <DialogDescription>
              Customize the ID card design for SY {SCHOOL_YEAR}
            </DialogDescription>
          </DialogHeader>
          <Tabs defaultValue="design" className="mt-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="design">Design</TabsTrigger>
              <TabsTrigger value="layout">Layout</TabsTrigger>
              <TabsTrigger value="preview">Preview</TabsTrigger>
            </TabsList>
            <TabsContent value="design" className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Background Image</Label>
                <div className="flex gap-2">
                  <Input type="file" accept="image/*" />
                  <Button variant="outline">
                    <Upload className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">Recommended: 1012 × 638px (CR-80 at 300 DPI)</p>
              </div>
              <div className="space-y-2">
                <Label>School Logo</Label>
                <div className="flex gap-2">
                  <Input type="file" accept="image/*" />
                  <Button variant="outline">
                    <Upload className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Primary Color</Label>
                <div className="flex gap-2">
                  <Input type="color" defaultValue="#3b82f6" className="h-10 w-20" />
                  <Input type="text" defaultValue="#3b82f6" className="flex-1" />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Text Color</Label>
                <div className="flex gap-2">
                  <Input type="color" defaultValue="#ffffff" className="h-10 w-20" />
                  <Input type="text" defaultValue="#ffffff" className="flex-1" />
                </div>
              </div>
            </TabsContent>
            <TabsContent value="layout" className="space-y-4 py-4">
              <div className="rounded-lg border bg-muted/30 p-4">
                <p className="text-sm text-muted-foreground">
                  Layout customization coming soon. Current layout follows DepEd CR-80 standard with fixed positions for photo, name, LRN, and QR code.
                </p>
              </div>
            </TabsContent>
            <TabsContent value="preview" className="py-4">
              <div className="flex justify-center">
                <div className="w-full max-w-sm">
                  <MiniIDCard
                    name="Juan M. Dela Cruz"
                    lrn="136728140987"
                    section="Grade 7 - Sampaguita"
                    dept="JHS"
                    gradient="var(--gradient-primary)"
                  />
                </div>
              </div>
            </TabsContent>
          </Tabs>
          <DialogFooter>
            <Button variant="outline" onClick={() => setTemplateEditorOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => { toast.success("Template saved successfully"); setTemplateEditorOpen(false); }}>
              Save Template
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

/* ─── Teacher: section ID cards ──────────────────────────── */
function TeacherIDCards() {
  const mySection = allSections.find((s) => s.section.id === "g7-sampaguita")!;
  const [printed, setPrinted] = useState(false);
  const [reprintDialogOpen, setReprintDialogOpen] = useState(false);
  const [selectedLrn, setSelectedLrn] = useState<string | null>(null);
  const [reprintReason, setReprintReason] = useState("");
  const [customReason, setCustomReason] = useState("");

  function handleRequestReprint(lrn: string) {
    setSelectedLrn(lrn);
    setReprintDialogOpen(true);
  }

  function handleSubmitReprint() {
    if (!reprintReason) {
      toast.error("Please select a reason for reprint");
      return;
    }
    if (reprintReason === "other" && !customReason.trim()) {
      toast.error("Please provide a custom reason");
      return;
    }
    const reason = reprintReason === "other" ? customReason : reprintReason;
    const student = mySection.section.learners.find(l => l.lrn === selectedLrn);
    toast.success(`Reprint request submitted for ${student ? fullName(student) : "student"} — Pending admin approval`);
    setReprintDialogOpen(false);
    setReprintReason("");
    setCustomReason("");
    setSelectedLrn(null);
  }

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
                <div key={l.lrn}>
                  <MiniIDCard
                    name={fullName(l)}
                    lrn={l.lrn}
                    section={mySection.label}
                    dept="JHS"
                    gradient="var(--gradient-accent)"
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    className="mt-2 w-full"
                    onClick={() => handleRequestReprint(l.lrn)}
                  >
                    Request Reprint
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </main>

      {/* Reprint Request Dialog */}
      <Dialog open={reprintDialogOpen} onOpenChange={setReprintDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Request ID Card Reprint</DialogTitle>
            <DialogDescription>
              Submit a reprint request to the admin for approval
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Reason for Reprint</Label>
              <Select value={reprintReason} onValueChange={setReprintReason}>
                <SelectTrigger>
                  <SelectValue placeholder="Select reason..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="lost">Lost</SelectItem>
                  <SelectItem value="damaged">Damaged</SelectItem>
                  <SelectItem value="renewal">Renewal</SelectItem>
                  <SelectItem value="photo_update">Photo Update</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {reprintReason === "other" && (
              <div className="space-y-2">
                <Label>Custom Reason</Label>
                <Textarea
                  placeholder="Describe the reason for reprint..."
                  value={customReason}
                  onChange={(e) => setCustomReason(e.target.value)}
                  rows={3}
                />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setReprintDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmitReprint}>
              Submit Request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

/* ─── Student: personal ID card ──────────────────────────── */
function StudentIDCard() {
  const myRecord = allLearners.find((l) => l.learner.lrn === "136728140987")!;
  const l = myRecord.learner;
  const [photoUploadOpen, setPhotoUploadOpen] = useState(false);
  const [reprintDialogOpen, setReprintDialogOpen] = useState(false);
  const [reprintReason, setReprintReason] = useState("");
  const [customReason, setCustomReason] = useState("");

  function handlePhotoUpload() {
    toast.success("Photo uploaded successfully — ID card will be regenerated");
    setPhotoUploadOpen(false);
  }

  function handleSubmitReprint() {
    if (!reprintReason) {
      toast.error("Please select a reason for reprint");
      return;
    }
    if (reprintReason === "other" && !customReason.trim()) {
      toast.error("Please provide a custom reason");
      return;
    }
    const reason = reprintReason === "other" ? customReason : reprintReason;
    toast.success(`Reprint request submitted — Reason: ${reason}. Pending admin approval.`);
    setReprintDialogOpen(false);
    setReprintReason("");
    setCustomReason("");
  }

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
          <Button variant="outline" onClick={() => setPhotoUploadOpen(true)}>
            <Upload className="h-4 w-4" /> Update Photo
          </Button>
          <Button variant="outline" onClick={() => setReprintDialogOpen(true)}>
            <Printer className="h-4 w-4" /> Request Reprint
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

      {/* Photo Upload Dialog */}
      <Dialog open={photoUploadOpen} onOpenChange={setPhotoUploadOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update ID Photo</DialogTitle>
            <DialogDescription>
              Upload a new photo for your ID card. Photo will be reviewed before printing.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Photo Requirements</Label>
              <div className="rounded-lg border bg-muted/30 p-4 text-sm">
                <ul className="list-inside list-disc space-y-1 text-muted-foreground">
                  <li>Recent photo (taken within last 6 months)</li>
                  <li>Plain white or light-colored background</li>
                  <li>Face clearly visible, no sunglasses or hats</li>
                  <li>File format: JPG or PNG</li>
                  <li>Maximum file size: 2MB</li>
                  <li>Recommended: 600 × 800 pixels</li>
                </ul>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Upload Photo</Label>
              <Input type="file" accept="image/jpeg,image/png" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPhotoUploadOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handlePhotoUpload}>
              Upload Photo
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reprint Request Dialog */}
      <Dialog open={reprintDialogOpen} onOpenChange={setReprintDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Request ID Card Reprint</DialogTitle>
            <DialogDescription>
              Submit a reprint request to the admin for approval
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Reason for Reprint</Label>
              <Select value={reprintReason} onValueChange={setReprintReason}>
                <SelectTrigger>
                  <SelectValue placeholder="Select reason..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="lost">Lost</SelectItem>
                  <SelectItem value="damaged">Damaged</SelectItem>
                  <SelectItem value="renewal">Renewal</SelectItem>
                  <SelectItem value="photo_update">Photo Update</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {reprintReason === "other" && (
              <div className="space-y-2">
                <Label>Custom Reason</Label>
                <Textarea
                  placeholder="Describe the reason for reprint..."
                  value={customReason}
                  onChange={(e) => setCustomReason(e.target.value)}
                  rows={3}
                />
              </div>
            )}
            <div className="rounded-lg border border-orange-500/30 bg-orange-500/10 p-3 text-sm text-orange-600">
              <div className="flex gap-2">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                <p>Reprint requests require admin approval. You will be notified once approved.</p>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setReprintDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmitReprint}>
              Submit Request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
