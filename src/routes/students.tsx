import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  Search, Users, GraduationCap, AlertTriangle, CheckCircle2, QrCode, BookOpen, School,
  X, Calendar, FileText, IdCard, UserPlus, Trash2, Download,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PageHeader } from "@/components/page-header";
import { toast } from "sonner";
import { 
  SCHOOL_NAME, 
  SCHOOL_YEAR, 
  SF2_TARGET, 
  fullName, 
  allLearners, 
  allSections,
  gradeRecords,
  attendanceLogs,
  conductLogs,
  idPrintHistory,
  departments,
} from "@/lib/school-data";
import { useRole } from "@/lib/role-context";

export const Route = createFileRoute("/students")({
  component: StudentsPage,
  head: () => ({ meta: [{ title: `Students — ${SCHOOL_NAME} (EduCard Pro)` }] }),
});

type DeptFilter = "all" | "JHS" | "SHS";

function StudentsPage() {
  const { role } = useRole();
  if (role === "student") return <StudentProfile />;
  if (role === "teacher") return <TeacherRoster />;
  return <AdminRoster />;
}

/* ─── Admin: full roster with enrollment management ──────── */
function AdminRoster() {
  const [search, setSearch] = useState("");
  const [dept, setDept] = useState<DeptFilter>("all");
  const [selectedLrn, setSelectedLrn] = useState<string | null>(null);
  const [enrollDialogOpen, setEnrollDialogOpen] = useState(false);
  const [selectedStudents, setSelectedStudents] = useState<Set<string>>(new Set());
  
  // Enroll Student Form State
  const [enrollForm, setEnrollForm] = useState({
    lrn: "",
    firstName: "",
    middleInitial: "",
    lastName: "",
    gradeLevel: "",
    section: "",
  });

  const filtered = allLearners.filter((l) => {
    const matchDept = dept === "all" || l.department.key === dept;
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      fullName(l.learner).toLowerCase().includes(q) ||
      l.learner.lrn.includes(q) ||
      l.sectionLabel.toLowerCase().includes(q);
    return matchDept && matchSearch;
  });

  const atRisk = allLearners.filter((l) => l.status === "At Risk").length;

  const selectedStudent = selectedLrn ? allLearners.find(l => l.learner.lrn === selectedLrn) : null;
  const studentGrades = selectedLrn ? gradeRecords.filter(g => g.lrn === selectedLrn) : [];
  const studentAttendance = selectedLrn ? attendanceLogs.filter(a => a.lrn === selectedLrn) : [];
  const studentConduct = selectedLrn ? conductLogs.filter(c => c.lrn === selectedLrn) : [];
  const studentIdHistory = selectedLrn ? idPrintHistory.filter(i => i.lrn === selectedLrn) : [];

  const availableSections = enrollForm.gradeLevel 
    ? departments
        .flatMap(d => d.grades)
        .find(g => g.level.toString() === enrollForm.gradeLevel)
        ?.sections || []
    : [];

  const handleEnrollStudent = () => {
    if (!enrollForm.lrn || !enrollForm.firstName || !enrollForm.lastName || !enrollForm.gradeLevel || !enrollForm.section) {
      toast.error("Please fill in all required fields");
      return;
    }
    
    if (enrollForm.lrn.length !== 12) {
      toast.error("LRN must be 12 digits");
      return;
    }

    toast.success("Student enrolled successfully", {
      description: "ID card queued for printing",
    });
    
    setEnrollForm({
      lrn: "",
      firstName: "",
      middleInitial: "",
      lastName: "",
      gradeLevel: "",
      section: "",
    });
    setEnrollDialogOpen(false);
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedStudents(new Set(filtered.map(l => l.learner.lrn)));
    } else {
      setSelectedStudents(new Set());
    }
  };

  const handleSelectStudent = (lrn: string, checked: boolean) => {
    const newSelected = new Set(selectedStudents);
    if (checked) {
      newSelected.add(lrn);
    } else {
      newSelected.delete(lrn);
    }
    setSelectedStudents(newSelected);
  };

  const handleBulkAction = (action: "print-ids" | "export" | "delete") => {
    const count = selectedStudents.size;
    if (count === 0) return;

    switch (action) {
      case "print-ids":
        toast.success(`${count} ID cards queued for printing`);
        break;
      case "export":
        toast.success(`Exported ${count} student records`);
        break;
      case "delete":
        toast.success(`${count} students removed from roster`);
        break;
    }
    setSelectedStudents(new Set());
  };

  return (
    <>
      <PageHeader title="Students" subtitle={`Enrollment & Records · ${SCHOOL_NAME} · SY ${SCHOOL_YEAR}`} />
      <main className="space-y-6 p-4 sm:p-6">
        <section className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {[
            { label: "Total Enrolled", value: allLearners.length, icon: Users, accent: "text-chart-3" },
            { label: "On Track", value: allLearners.length - atRisk, icon: CheckCircle2, accent: "text-chart-2" },
            { label: "At Risk", value: atRisk, icon: AlertTriangle, accent: "text-destructive" },
            { label: "Sections", value: allSections.length, icon: School, accent: "text-chart-1" },
          ].map((m) => (
            <Card key={m.label} className="border-border/60">
              <CardContent className="flex items-start justify-between gap-3 p-5">
                <div>
                  <p className="font-ui text-xs font-medium uppercase tracking-wide text-muted-foreground">{m.label}</p>
                  <p className="mt-1 text-2xl font-semibold">{m.value}</p>
                </div>
                <div className={`rounded-xl bg-muted p-3 ${m.accent}`}>
                  <m.icon className="h-5 w-5" />
                </div>
              </CardContent>
            </Card>
          ))}
        </section>

        <Card>
          <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="text-base">Student Records</CardTitle>
              <p className="mt-0.5 text-xs text-muted-foreground">SF1 Enrollment & LRN Management</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Button
                size="sm"
                onClick={() => setEnrollDialogOpen(true)}
                className="bg-primary"
              >
                <UserPlus className="mr-2 h-4 w-4" />
                Enroll Student
              </Button>
              {(["all", "JHS", "SHS"] as DeptFilter[]).map((d) => (
                <button
                  key={d}
                  onClick={() => setDept(d)}
                  className={`rounded-full px-3 py-1 font-ui text-xs uppercase tracking-wider transition-colors ${
                    dept === d ? "bg-primary text-primary-foreground" : "border bg-card text-muted-foreground hover:bg-muted"
                  }`}
                >
                  {d === "all" ? "All Depts" : d}
                </button>
              ))}
              <div className="relative">
                <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Name or LRN…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="h-8 w-44 pl-8 text-sm"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <Checkbox
                        checked={selectedStudents.size === filtered.length && filtered.length > 0}
                        onCheckedChange={handleSelectAll}
                      />
                    </TableHead>
                    <TableHead>LRN</TableHead>
                    <TableHead>Learner</TableHead>
                    <TableHead>Section</TableHead>
                    <TableHead>Dept</TableHead>
                    <TableHead className="text-right">GPA</TableHead>
                    <TableHead className="text-right">Attendance</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((l) => (
                    <TableRow 
                      key={l.learner.lrn} 
                      className="cursor-pointer hover:bg-muted/40"
                      onClick={(e) => {
                        if ((e.target as HTMLElement).closest('button, input[type="checkbox"]')) return;
                        setSelectedLrn(l.learner.lrn);
                      }}
                    >
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <Checkbox
                          checked={selectedStudents.has(l.learner.lrn)}
                          onCheckedChange={(checked) => handleSelectStudent(l.learner.lrn, checked as boolean)}
                        />
                      </TableCell>
                      <TableCell className="font-mono text-xs text-muted-foreground">{l.learner.lrn}</TableCell>
                      <TableCell className="font-medium whitespace-nowrap">{fullName(l.learner)}</TableCell>
                      <TableCell className="text-sm text-muted-foreground whitespace-nowrap">{l.sectionLabel}</TableCell>
                      <TableCell>
                        <span className={`rounded-full px-2 py-0.5 font-ui text-[10px] uppercase tracking-wider ${
                          l.department.key === "JHS" ? "bg-primary/10 text-primary" : "bg-chart-1/10 text-chart-1"
                        }`}>
                          {l.department.key}
                        </span>
                      </TableCell>
                      <TableCell className={`text-right font-semibold ${l.learner.gpa < 75 ? "text-destructive" : ""}`}>
                        {l.learner.gpa}
                      </TableCell>
                      <TableCell className={`text-right font-semibold ${l.learner.attendanceRate < SF2_TARGET ? "text-destructive" : ""}`}>
                        {l.learner.attendanceRate.toFixed(1)}%
                      </TableCell>
                      <TableCell>
                        <Badge variant={l.status === "At Risk" ? "destructive" : "secondary"}>{l.status}</Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                  {filtered.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={8} className="py-8 text-center text-sm text-muted-foreground">
                        No learners match your search.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
            <p className="mt-3 text-xs text-muted-foreground">{filtered.length} of {allLearners.length} learners shown</p>
          </CardContent>
        </Card>

        {/* Bulk Actions Bar */}
        {selectedStudents.size > 0 && (
          <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 animate-in slide-in-from-bottom-4">
            <Card className="border-2 shadow-lg">
              <CardContent className="flex items-center gap-4 p-4">
                <div className="flex items-center gap-2">
                  <Checkbox checked={true} />
                  <span className="text-sm font-medium">{selectedStudents.size} selected</span>
                </div>
                <div className="h-6 w-px bg-border" />
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleBulkAction("print-ids")}
                  >
                    <IdCard className="mr-2 h-4 w-4" />
                    Print IDs
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleBulkAction("export")}
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Export
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleBulkAction("delete")}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Remove
                  </Button>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setSelectedStudents(new Set())}
                >
                  <X className="h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Student Detail Sheet */}
        <Sheet open={!!selectedLrn} onOpenChange={(open) => !open && setSelectedLrn(null)}>
          <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
            {selectedStudent && (
              <>
                <SheetHeader>
                  <SheetTitle>{fullName(selectedStudent.learner)}</SheetTitle>
                  <p className="text-sm text-muted-foreground">{selectedStudent.sectionLabel}</p>
                </SheetHeader>

                <div className="mt-6 space-y-6">
                  {/* Student Info Card */}
                  <Card>
                    <CardContent className="pt-6">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="font-ui text-[10px] uppercase tracking-wide text-muted-foreground">LRN</p>
                          <p className="font-mono text-sm font-semibold">{selectedStudent.learner.lrn}</p>
                        </div>
                        <div>
                          <p className="font-ui text-[10px] uppercase tracking-wide text-muted-foreground">GPA</p>
                          <p className="text-sm font-semibold">{selectedStudent.learner.gpa}</p>
                        </div>
                        <div>
                          <p className="font-ui text-[10px] uppercase tracking-wide text-muted-foreground">Attendance</p>
                          <p className="text-sm font-semibold">{selectedStudent.learner.attendanceRate.toFixed(1)}%</p>
                        </div>
                        <div>
                          <p className="font-ui text-[10px] uppercase tracking-wide text-muted-foreground">Status</p>
                          <Badge variant={selectedStudent.status === "At Risk" ? "destructive" : "secondary"}>
                            {selectedStudent.status}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Tabs */}
                  <Tabs defaultValue="grades" className="w-full">
                    <TabsList className="grid w-full grid-cols-4">
                      <TabsTrigger value="grades">
                        <GraduationCap className="mr-2 h-4 w-4" />
                        Grades
                      </TabsTrigger>
                      <TabsTrigger value="attendance">
                        <Calendar className="mr-2 h-4 w-4" />
                        Attendance
                      </TabsTrigger>
                      <TabsTrigger value="conduct">
                        <FileText className="mr-2 h-4 w-4" />
                        Conduct
                      </TabsTrigger>
                      <TabsTrigger value="id-card">
                        <IdCard className="mr-2 h-4 w-4" />
                        ID Card
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="grades" className="space-y-4">
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-base">3rd Quarter Grades</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Subject</TableHead>
                                <TableHead className="text-center">Q1</TableHead>
                                <TableHead className="text-center">Q2</TableHead>
                                <TableHead className="text-center">Q3</TableHead>
                                <TableHead className="text-center">Q4</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {studentGrades.map((g) => (
                                <TableRow key={g.subject}>
                                  <TableCell className="font-medium">{g.subject}</TableCell>
                                  <TableCell className="text-center">{g.grades.q1}</TableCell>
                                  <TableCell className="text-center">{g.grades.q2}</TableCell>
                                  <TableCell className="text-center font-semibold">{g.grades.q3}</TableCell>
                                  <TableCell className="text-center text-muted-foreground">
                                    {g.grades.q4 ?? "—"}
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </CardContent>
                      </Card>
                    </TabsContent>

                    <TabsContent value="attendance" className="space-y-4">
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-base">Recent Attendance</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            {studentAttendance.length === 0 ? (
                              <p className="text-sm text-muted-foreground">No attendance records found</p>
                            ) : (
                              studentAttendance.map((a, i) => (
                                <div key={i} className="flex items-center justify-between rounded-lg border p-3">
                                  <div>
                                    <p className="text-sm font-medium">{a.date}</p>
                                    <p className="text-xs text-muted-foreground">
                                      {a.timeIn && a.timeOut ? `${a.timeIn} - ${a.timeOut}` : "No time recorded"}
                                    </p>
                                  </div>
                                  <Badge variant={
                                    a.status === "present" ? "secondary" :
                                    a.status === "late" ? "outline" :
                                    "destructive"
                                  }>
                                    {a.status}
                                  </Badge>
                                </div>
                              ))
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    </TabsContent>

                    <TabsContent value="conduct" className="space-y-4">
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-base">Conduct Records</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            {studentConduct.length === 0 ? (
                              <p className="text-sm text-muted-foreground">No conduct records found</p>
                            ) : (
                              studentConduct.map((c, i) => (
                                <div key={i} className="rounded-lg border p-3">
                                  <div className="flex items-start justify-between gap-2">
                                    <div className="flex-1">
                                      <p className="text-sm font-medium">{c.item}</p>
                                      <p className="text-xs text-muted-foreground mt-1">
                                        {c.date} · {c.recordedBy}
                                      </p>
                                    </div>
                                    <Badge variant={
                                      c.type === "Positive" ? "secondary" :
                                      c.type === "Note" ? "outline" :
                                      "destructive"
                                    }>
                                      {c.type}
                                    </Badge>
                                  </div>
                                </div>
                              ))
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    </TabsContent>

                    <TabsContent value="id-card" className="space-y-4">
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-base">ID Card History</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            {studentIdHistory.length === 0 ? (
                              <p className="text-sm text-muted-foreground">No ID card history found</p>
                            ) : (
                              studentIdHistory.map((h, i) => (
                                <div key={i} className="flex items-center justify-between rounded-lg border p-3">
                                  <div>
                                    <p className="text-sm font-medium">{h.type === "original" ? "Original ID" : "Reprint"}</p>
                                    <p className="text-xs text-muted-foreground">
                                      {h.printedAt} · {h.printedBy}
                                    </p>
                                    {h.reprintReason && (
                                      <p className="text-xs text-muted-foreground mt-1">
                                        Reason: {h.reprintReason}
                                      </p>
                                    )}
                                  </div>
                                  <Badge variant="outline">{h.type}</Badge>
                                </div>
                              ))
                            )}
                          </div>
                          <Button className="mt-4 w-full" variant="outline">
                            <IdCard className="mr-2 h-4 w-4" />
                            Request Reprint
                          </Button>
                        </CardContent>
                      </Card>
                    </TabsContent>
                  </Tabs>
                </div>
              </>
            )}
          </SheetContent>
        </Sheet>

        {/* Enroll Student Dialog */}
        <Dialog open={enrollDialogOpen} onOpenChange={setEnrollDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Enroll New Student</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="lrn">LRN (12 digits) *</Label>
                <Input
                  id="lrn"
                  placeholder="123456789012"
                  value={enrollForm.lrn}
                  onChange={(e) => setEnrollForm({ ...enrollForm, lrn: e.target.value })}
                  maxLength={12}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name *</Label>
                  <Input
                    id="firstName"
                    value={enrollForm.firstName}
                    onChange={(e) => setEnrollForm({ ...enrollForm, firstName: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="middleInitial">Middle Initial</Label>
                  <Input
                    id="middleInitial"
                    maxLength={1}
                    value={enrollForm.middleInitial}
                    onChange={(e) => setEnrollForm({ ...enrollForm, middleInitial: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name *</Label>
                <Input
                  id="lastName"
                  value={enrollForm.lastName}
                  onChange={(e) => setEnrollForm({ ...enrollForm, lastName: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="gradeLevel">Grade Level *</Label>
                  <Select
                    value={enrollForm.gradeLevel}
                    onValueChange={(value) => setEnrollForm({ ...enrollForm, gradeLevel: value, section: "" })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select grade" />
                    </SelectTrigger>
                    <SelectContent>
                      {[7, 8, 9, 10, 11, 12].map((grade) => (
                        <SelectItem key={grade} value={grade.toString()}>
                          Grade {grade}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="section">Section *</Label>
                  <Select
                    value={enrollForm.section}
                    onValueChange={(value) => setEnrollForm({ ...enrollForm, section: value })}
                    disabled={!enrollForm.gradeLevel}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select section" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableSections.map((section) => (
                        <SelectItem key={section.id} value={section.id}>
                          {section.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setEnrollDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleEnrollStudent}>
                <UserPlus className="mr-2 h-4 w-4" />
                Enroll Student
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </main>
    </>
  );
}

/* ─── Teacher: class roster ──────────────────────────────── */
function TeacherRoster() {
  const mySection = allSections.find((s) => s.section.id === "g7-sampaguita")!;
  const learners = mySection.section.learners;
  const classGpa = (learners.reduce((a, l) => a + l.gpa, 0) / learners.length).toFixed(1);
  const classAtt = (learners.reduce((a, l) => a + l.attendanceRate, 0) / learners.length).toFixed(1);
  const [selectedLrn, setSelectedLrn] = useState<string | null>(null);

  const selectedStudent = selectedLrn ? allLearners.find(l => l.learner.lrn === selectedLrn) : null;
  const studentGrades = selectedLrn ? gradeRecords.filter(g => g.lrn === selectedLrn) : [];
  const studentConduct = selectedLrn ? conductLogs.filter(c => c.lrn === selectedLrn) : [];

  return (
    <>
      <PageHeader title="My Students" subtitle={`${mySection.label} · Ms. Aurora Aquino · SY ${SCHOOL_YEAR}`} />
      <main className="space-y-6 p-4 sm:p-6">
        <section className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {[
            { label: "Class Size", value: learners.length, icon: Users, accent: "text-chart-3" },
            { label: "On Track", value: learners.filter(l => l.attendanceRate >= SF2_TARGET && l.gpa >= 75).length, icon: CheckCircle2, accent: "text-chart-2" },
            { label: "At Risk", value: learners.filter(l => l.attendanceRate < SF2_TARGET || l.gpa < 75).length, icon: AlertTriangle, accent: "text-destructive" },
            { label: "Avg GPA", value: classGpa, icon: GraduationCap, accent: "text-chart-1" },
          ].map((m) => (
            <Card key={m.label} className="border-border/60">
              <CardContent className="flex items-start justify-between gap-3 p-5">
                <div>
                  <p className="font-ui text-xs font-medium uppercase tracking-wide text-muted-foreground">{m.label}</p>
                  <p className="mt-1 text-2xl font-semibold">{m.value}</p>
                </div>
                <div className={`rounded-xl bg-muted p-3 ${m.accent}`}>
                  <m.icon className="h-5 w-5" />
                </div>
              </CardContent>
            </Card>
          ))}
        </section>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Grade 7 — Sampaguita</CardTitle>
            <p className="text-xs text-muted-foreground">Class avg {classGpa} GPA · {classAtt}% attendance · SF2 target {SF2_TARGET}%</p>
          </CardHeader>
          <CardContent className="space-y-3">
            {learners.map((l, i) => {
              const atRisk = l.attendanceRate < SF2_TARGET || l.gpa < 75;
              return (
                <div 
                  key={l.lrn} 
                  className={`flex items-center gap-4 rounded-xl border p-4 cursor-pointer transition-colors ${atRisk ? "border-destructive/30 bg-destructive/5" : "bg-card hover:bg-muted/40"}`}
                  onClick={() => setSelectedLrn(l.lrn)}
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold text-sm">
                    #{i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold">{fullName(l)}</p>
                    <p className="font-mono text-xs text-muted-foreground">LRN: {l.lrn}</p>
                  </div>
                  <div className="hidden sm:flex gap-6 text-right text-sm">
                    <div>
                      <p className="font-ui text-[10px] uppercase text-muted-foreground">GPA</p>
                      <p className={`font-semibold ${l.gpa < 75 ? "text-destructive" : ""}`}>{l.gpa}</p>
                    </div>
                    <div>
                      <p className="font-ui text-[10px] uppercase text-muted-foreground">Attendance</p>
                      <p className={`font-semibold ${l.attendanceRate < SF2_TARGET ? "text-destructive" : ""}`}>{l.attendanceRate.toFixed(1)}%</p>
                    </div>
                  </div>
                  <Badge variant={atRisk ? "destructive" : "secondary"}>{atRisk ? "At Risk" : "On Track"}</Badge>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Teacher Student Detail Sheet - Grades & Conduct only */}
        <Sheet open={!!selectedLrn} onOpenChange={(open) => !open && setSelectedLrn(null)}>
          <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
            {selectedStudent && (
              <>
                <SheetHeader>
                  <SheetTitle>{fullName(selectedStudent.learner)}</SheetTitle>
                  <p className="text-sm text-muted-foreground">{selectedStudent.sectionLabel}</p>
                </SheetHeader>

                <div className="mt-6 space-y-6">
                  <Card>
                    <CardContent className="pt-6">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="font-ui text-[10px] uppercase tracking-wide text-muted-foreground">LRN</p>
                          <p className="font-mono text-sm font-semibold">{selectedStudent.learner.lrn}</p>
                        </div>
                        <div>
                          <p className="font-ui text-[10px] uppercase tracking-wide text-muted-foreground">GPA</p>
                          <p className="text-sm font-semibold">{selectedStudent.learner.gpa}</p>
                        </div>
                        <div>
                          <p className="font-ui text-[10px] uppercase tracking-wide text-muted-foreground">Attendance</p>
                          <p className="text-sm font-semibold">{selectedStudent.learner.attendanceRate.toFixed(1)}%</p>
                        </div>
                        <div>
                          <p className="font-ui text-[10px] uppercase tracking-wide text-muted-foreground">Status</p>
                          <Badge variant={selectedStudent.status === "At Risk" ? "destructive" : "secondary"}>
                            {selectedStudent.status}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Tabs defaultValue="grades" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="grades">
                        <GraduationCap className="mr-2 h-4 w-4" />
                        Grades
                      </TabsTrigger>
                      <TabsTrigger value="conduct">
                        <FileText className="mr-2 h-4 w-4" />
                        Conduct
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="grades" className="space-y-4">
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-base">3rd Quarter Grades</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Subject</TableHead>
                                <TableHead className="text-center">Q1</TableHead>
                                <TableHead className="text-center">Q2</TableHead>
                                <TableHead className="text-center">Q3</TableHead>
                                <TableHead className="text-center">Q4</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {studentGrades.map((g) => (
                                <TableRow key={g.subject}>
                                  <TableCell className="font-medium">{g.subject}</TableCell>
                                  <TableCell className="text-center">{g.grades.q1}</TableCell>
                                  <TableCell className="text-center">{g.grades.q2}</TableCell>
                                  <TableCell className="text-center font-semibold">{g.grades.q3}</TableCell>
                                  <TableCell className="text-center text-muted-foreground">
                                    {g.grades.q4 ?? "—"}
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </CardContent>
                      </Card>
                    </TabsContent>

                    <TabsContent value="conduct" className="space-y-4">
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-base">Conduct Records</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            {studentConduct.length === 0 ? (
                              <p className="text-sm text-muted-foreground">No conduct records found</p>
                            ) : (
                              studentConduct.map((c, i) => (
                                <div key={i} className="rounded-lg border p-3">
                                  <div className="flex items-start justify-between gap-2">
                                    <div className="flex-1">
                                      <p className="text-sm font-medium">{c.item}</p>
                                      <p className="text-xs text-muted-foreground mt-1">
                                        {c.date} · {c.recordedBy}
                                      </p>
                                    </div>
                                    <Badge variant={
                                      c.type === "Positive" ? "secondary" :
                                      c.type === "Note" ? "outline" :
                                      "destructive"
                                    }>
                                      {c.type}
                                    </Badge>
                                  </div>
                                </div>
                              ))
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    </TabsContent>
                  </Tabs>
                </div>
              </>
            )}
          </SheetContent>
        </Sheet>
      </main>
    </>
  );
}

/* ─── Student: own profile ───────────────────────────────── */
function StudentProfile() {
  const myRecord = allLearners.find((l) => l.learner.lrn === "136728140987")!;
  const l = myRecord.learner;
  const classmates = myRecord.section.learners.filter((m) => m.lrn !== l.lrn);
  const [attendanceSheetOpen, setAttendanceSheetOpen] = useState(false);
  const myAttendance = attendanceLogs.filter(a => a.lrn === l.lrn);

  return (
    <>
      <PageHeader title="My Profile" subtitle={`${fullName(l)} · ${myRecord.sectionLabel} · SY ${SCHOOL_YEAR}`} />
      <main className="space-y-6 p-4 sm:p-6">
        <Card className="overflow-hidden">
          <div className="h-28 w-full" style={{ background: "linear-gradient(135deg, oklch(0.65 0.18 30), oklch(0.78 0.16 80))" }} />
          <CardContent className="relative pt-0">
            <div className="-mt-10 flex items-end gap-4 pb-4">
              <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl border-4 border-background bg-muted shadow-md text-muted-foreground">
                <Users className="h-9 w-9" />
              </div>
              <div className="flex-1 min-w-0 pb-1">
                <h2 className="text-xl font-bold">{fullName(l)}</h2>
                <p className="text-sm text-muted-foreground">{myRecord.sectionLabel} · SY {SCHOOL_YEAR}</p>
              </div>
              <div className="hidden sm:flex items-center gap-2 rounded-full bg-chart-2/10 px-3 py-1.5 text-xs font-semibold text-chart-2">
                <CheckCircle2 className="h-3.5 w-3.5" /> On Track
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 border-t pt-4 sm:grid-cols-4">
              {[
                { label: "LRN", value: l.lrn, mono: true },
                { label: "GPA (Q3)", value: l.gpa.toString() },
                { label: "Attendance", value: `${l.attendanceRate.toFixed(1)}%`, clickable: true },
                { label: "Class Rank", value: `#1 of ${myRecord.section.learners.length}` },
              ].map((f) => (
                <div 
                  key={f.label}
                  className={f.clickable ? "cursor-pointer hover:bg-muted/50 rounded p-2 -m-2" : ""}
                  onClick={f.clickable ? () => setAttendanceSheetOpen(true) : undefined}
                >
                  <p className="font-ui text-[10px] uppercase tracking-wide text-muted-foreground">{f.label}</p>
                  <p className={`mt-0.5 text-sm font-semibold ${f.mono ? "font-mono" : ""}`}>{f.value}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2 text-base"><BookOpen className="h-4 w-4" /> Classmates</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {classmates.map((m) => (
                <div key={m.lrn} className="flex items-center gap-3 rounded-lg border bg-card p-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
                    <Users className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{fullName(m)}</p>
                    <p className="font-mono text-xs text-muted-foreground">LRN: {m.lrn}</p>
                  </div>
                  <p className="text-xs text-muted-foreground">GPA {m.gpa}</p>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2 text-base"><QrCode className="h-4 w-4" /> Quick ID</CardTitle></CardHeader>
            <CardContent className="flex items-center gap-6">
              <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-xl border bg-muted">
                <QrCode className="h-12 w-12 text-muted-foreground" />
              </div>
              <div className="space-y-1.5 text-sm">
                <p><span className="text-muted-foreground">Name: </span><span className="font-semibold">{fullName(l)}</span></p>
                <p><span className="text-muted-foreground">LRN: </span><span className="font-mono font-semibold">{l.lrn}</span></p>
                <p><span className="text-muted-foreground">Section: </span>{myRecord.sectionLabel}</p>
                <p><span className="text-muted-foreground">School: </span>{SCHOOL_NAME}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Student Attendance History Sheet */}
        <Sheet open={attendanceSheetOpen} onOpenChange={setAttendanceSheetOpen}>
          <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
            <SheetHeader>
              <SheetTitle>My Attendance History</SheetTitle>
              <p className="text-sm text-muted-foreground">
                {l.attendanceRate.toFixed(1)}% attendance rate
              </p>
            </SheetHeader>

            <div className="mt-6 space-y-2">
              {myAttendance.length === 0 ? (
                <p className="text-sm text-muted-foreground">No attendance records found</p>
              ) : (
                myAttendance.map((a, i) => (
                  <div key={i} className="flex items-center justify-between rounded-lg border p-3">
                    <div>
                      <p className="text-sm font-medium">{a.date}</p>
                      <p className="text-xs text-muted-foreground">
                        {a.timeIn && a.timeOut ? `${a.timeIn} - ${a.timeOut}` : "No time recorded"}
                      </p>
                    </div>
                    <Badge variant={
                      a.status === "present" ? "secondary" :
                      a.status === "late" ? "outline" :
                      "destructive"
                    }>
                      {a.status}
                    </Badge>
                  </div>
                ))
              )}
            </div>
          </SheetContent>
        </Sheet>
      </main>
    </>
  );
}
