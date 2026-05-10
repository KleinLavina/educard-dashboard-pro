import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  FileText, Download, Calendar, Users, TrendingUp, BarChart3, PieChart,
  FileSpreadsheet, Filter, Search, CheckCircle2, Clock, AlertCircle,
  GraduationCap, CalendarCheck, IdCard, Bell, ChevronRight, Eye,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/page-header";
import { SCHOOL_NAME, SCHOOL_YEAR, allLearners, allSections, gradeRecords, attendanceLogs, SF2_TARGET, schoolCalendar } from "@/lib/school-data";
import { useRole } from "@/lib/role-context";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { BarChart, Bar, LineChart, Line, PieChart as RechartsPie, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

export const Route = createFileRoute("/reports")({
  component: ReportsPage,
  head: () => ({ meta: [{ title: `Reports & Analytics — ${SCHOOL_NAME} (EduCard Pro)` }] }),
});

function ReportsPage() {
  const { role } = useRole();
  
  if (role === "principal") return <PrincipalReports />;
  if (role === "teacher") return <TeacherReports />;
  return <StudentReports />;
}

/* ─── Principal: Comprehensive Reports ──────────────────── */
function PrincipalReports() {
  const [generateDialogOpen, setGenerateDialogOpen] = useState(false);
  const [previewDialogOpen, setPreviewDialogOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState<string | null>(null);
  const [reportType, setReportType] = useState("");
  const [reportPeriod, setReportPeriod] = useState("");
  const [reportFormat, setReportFormat] = useState("pdf");

  // Calculate analytics
  const totalStudents = allLearners.length;
  const avgAttendance = allLearners.reduce((sum, l) => sum + l.learner.attendanceRate, 0) / totalStudents;
  const avgGPA = allLearners.reduce((sum, l) => sum + l.learner.gpa, 0) / totalStudents;
  const atRiskCount = allLearners.filter(l => l.status === "At Risk").length;
  const sectionsCount = allSections.length;
  const belowTargetCount = allSections.filter(s => s.belowTarget).length;

  // Grade distribution data
  const gradeDistribution = [
    { range: "90-100", count: allLearners.filter(l => l.learner.gpa >= 90).length, color: "#10b981" },
    { range: "85-89", count: allLearners.filter(l => l.learner.gpa >= 85 && l.learner.gpa < 90).length, color: "#3b82f6" },
    { range: "80-84", count: allLearners.filter(l => l.learner.gpa >= 80 && l.learner.gpa < 85).length, color: "#8b5cf6" },
    { range: "75-79", count: allLearners.filter(l => l.learner.gpa >= 75 && l.learner.gpa < 80).length, color: "#f59e0b" },
    { range: "Below 75", count: allLearners.filter(l => l.learner.gpa < 75).length, color: "#ef4444" },
  ];

  // Attendance trend data (mock quarterly)
  const attendanceTrend = [
    { quarter: "Q1", rate: 94.2 },
    { quarter: "Q2", rate: 95.1 },
    { quarter: "Q3", rate: avgAttendance },
  ];

  // Department comparison
  const departmentData = [
    { name: "JHS", students: allLearners.filter(l => l.department.key === "JHS").length, avgGPA: 87.5, attendance: 95.2 },
    { name: "SHS", students: allLearners.filter(l => l.department.key === "SHS").length, avgGPA: 86.8, attendance: 93.8 },
  ];

  const reportTemplates = [
    {
      id: "sf1",
      title: "SF1 - School Register",
      description: "Complete enrollment records for Division Office",
      icon: FileText,
      category: "DepEd Forms",
      frequency: "Quarterly",
      lastGenerated: "May 1, 2026",
    },
    {
      id: "sf2",
      title: "SF2 - Daily Attendance Report",
      description: "Daily attendance tracking and SF2 compliance",
      icon: CalendarCheck,
      category: "DepEd Forms",
      frequency: "Daily/Monthly",
      lastGenerated: "Today",
    },
    {
      id: "sf10",
      title: "SF10 - Learner's Permanent Record",
      description: "Individual student academic records",
      icon: GraduationCap,
      category: "DepEd Forms",
      frequency: "Per Quarter",
      lastGenerated: "Apr 30, 2026",
    },
    {
      id: "enrollment",
      title: "Enrollment Summary",
      description: "Student enrollment by grade level and section",
      icon: Users,
      category: "School Reports",
      frequency: "As Needed",
      lastGenerated: "May 5, 2026",
    },
    {
      id: "grades",
      title: "Grade Distribution Report",
      description: "Academic performance analysis by section",
      icon: BarChart3,
      category: "School Reports",
      frequency: "Per Quarter",
      lastGenerated: "May 3, 2026",
    },
    {
      id: "attendance-summary",
      title: "Attendance Summary",
      description: "Attendance rates and trends analysis",
      icon: TrendingUp,
      category: "School Reports",
      frequency: "Monthly",
      lastGenerated: "May 1, 2026",
    },
    {
      id: "id-cards",
      title: "ID Card Print Log",
      description: "ID card printing and reprint history",
      icon: IdCard,
      category: "Operations",
      frequency: "As Needed",
      lastGenerated: "May 8, 2026",
    },
    {
      id: "notifications",
      title: "Parent Notification Log",
      description: "Messenger and SMS notification history",
      icon: Bell,
      category: "Operations",
      frequency: "Monthly",
      lastGenerated: "Today",
    },
  ];

  function handleGenerateReport() {
    if (!reportType || !reportPeriod) {
      toast.error("Please select report type and period");
      return;
    }
    const report = reportTemplates.find(r => r.id === reportType);
    toast.success(`Generating ${report?.title} (${reportFormat.toUpperCase()})...`);
    setGenerateDialogOpen(false);
    setTimeout(() => {
      toast.success(`Report generated successfully`);
    }, 2000);
  }

  function handlePreviewReport(reportId: string) {
    setSelectedReport(reportId);
    setPreviewDialogOpen(true);
  }

  return (
    <>
      <PageHeader
        title="Reports & Analytics"
        subtitle={`${SCHOOL_NAME} · SY ${SCHOOL_YEAR}`}
      />
      <main className="space-y-6 p-4 sm:p-6">
        {/* Analytics Overview */}
        <section className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {[
            { label: "Total Students", value: totalStudents, accent: "text-chart-3", icon: Users },
            { label: "Avg Attendance", value: `${avgAttendance.toFixed(1)}%`, accent: avgAttendance >= SF2_TARGET ? "text-chart-2" : "text-orange-500", icon: CalendarCheck },
            { label: "Avg GPA", value: avgGPA.toFixed(1), accent: "text-chart-1", icon: GraduationCap },
            { label: "At Risk", value: atRiskCount, accent: atRiskCount > 0 ? "text-destructive" : "text-chart-2", icon: AlertCircle },
          ].map((m) => (
            <Card key={m.label} className="border-border/60">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-ui text-xs font-medium uppercase tracking-wide text-muted-foreground">{m.label}</p>
                    <p className={`mt-1 text-2xl font-semibold ${m.accent}`}>{m.value}</p>
                  </div>
                  <m.icon className={`h-8 w-8 ${m.accent} opacity-20`} />
                </div>
              </CardContent>
            </Card>
          ))}
        </section>

        {/* Analytics Charts */}
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Grade Distribution</CardTitle>
              <p className="text-xs text-muted-foreground">Current quarter performance breakdown</p>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={gradeDistribution}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                  <XAxis dataKey="range" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                    {gradeDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Attendance Trend</CardTitle>
              <p className="text-xs text-muted-foreground">Quarterly attendance rate progression</p>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={attendanceTrend}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                  <XAxis dataKey="quarter" tick={{ fontSize: 12 }} />
                  <YAxis domain={[90, 100]} tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Line type="monotone" dataKey="rate" stroke="#10b981" strokeWidth={2} dot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Department Comparison */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Department Comparison</CardTitle>
            <p className="text-xs text-muted-foreground">JHS vs SHS performance metrics</p>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2">
              {departmentData.map((dept) => (
                <div key={dept.name} className="rounded-lg border bg-muted/30 p-4">
                  <p className="text-lg font-bold">{dept.name}</p>
                  <div className="mt-3 space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Students</span>
                      <span className="font-semibold">{dept.students}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Avg GPA</span>
                      <span className="font-semibold">{dept.avgGPA}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Attendance</span>
                      <span className="font-semibold">{dept.attendance}%</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Report Templates */}
        <Card>
          <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="text-base">Report Templates</CardTitle>
              <p className="text-xs text-muted-foreground">Generate DepEd forms and school reports</p>
            </div>
            <Button onClick={() => setGenerateDialogOpen(true)}>
              <FileText className="h-4 w-4" /> Generate Report
            </Button>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="all">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="all">All Reports</TabsTrigger>
                <TabsTrigger value="deped">DepEd Forms</TabsTrigger>
                <TabsTrigger value="school">School Reports</TabsTrigger>
              </TabsList>
              <TabsContent value="all" className="mt-4 space-y-3">
                {reportTemplates.map((report) => (
                  <ReportCard key={report.id} report={report} onPreview={handlePreviewReport} />
                ))}
              </TabsContent>
              <TabsContent value="deped" className="mt-4 space-y-3">
                {reportTemplates.filter(r => r.category === "DepEd Forms").map((report) => (
                  <ReportCard key={report.id} report={report} onPreview={handlePreviewReport} />
                ))}
              </TabsContent>
              <TabsContent value="school" className="mt-4 space-y-3">
                {reportTemplates.filter(r => r.category !== "DepEd Forms").map((report) => (
                  <ReportCard key={report.id} report={report} onPreview={handlePreviewReport} />
                ))}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </main>

      {/* Generate Report Dialog */}
      <Dialog open={generateDialogOpen} onOpenChange={setGenerateDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Generate Report</DialogTitle>
            <DialogDescription>
              Select report type, period, and format
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Report Type</Label>
              <Select value={reportType} onValueChange={setReportType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select report..." />
                </SelectTrigger>
                <SelectContent>
                  {reportTemplates.map((report) => (
                    <SelectItem key={report.id} value={report.id}>
                      {report.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Period</Label>
              <Select value={reportPeriod} onValueChange={setReportPeriod}>
                <SelectTrigger>
                  <SelectValue placeholder="Select period..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="q1">Quarter 1 (2025-08-26 to 2025-10-17)</SelectItem>
                  <SelectItem value="q2">Quarter 2 (2025-10-21 to 2025-12-19)</SelectItem>
                  <SelectItem value="q3">Quarter 3 (2026-01-12 to 2026-03-27)</SelectItem>
                  <SelectItem value="q4">Quarter 4 (2026-04-07 to 2026-05-30)</SelectItem>
                  <SelectItem value="sy">Full School Year (SY {SCHOOL_YEAR})</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Format</Label>
              <Select value={reportFormat} onValueChange={setReportFormat}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pdf">PDF Document</SelectItem>
                  <SelectItem value="excel">Excel Spreadsheet</SelectItem>
                  <SelectItem value="csv">CSV File</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setGenerateDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleGenerateReport}>
              <Download className="h-4 w-4" /> Generate
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Preview Dialog */}
      <Dialog open={previewDialogOpen} onOpenChange={setPreviewDialogOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Report Preview</DialogTitle>
            <DialogDescription>
              {reportTemplates.find(r => r.id === selectedReport)?.title}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="rounded-lg border bg-muted/30 p-8 text-center">
              <FileText className="mx-auto h-16 w-16 text-muted-foreground" />
              <p className="mt-4 text-sm text-muted-foreground">
                Report preview will be displayed here
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPreviewDialogOpen(false)}>
              Close
            </Button>
            <Button>
              <Download className="h-4 w-4" /> Download
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

/* ─── Report Card Component ─────────────────────────────── */
function ReportCard({ report, onPreview }: { report: any; onPreview: (id: string) => void }) {
  return (
    <div className="flex items-center justify-between rounded-lg border bg-card p-4">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <report.icon className="h-5 w-5" />
        </div>
        <div className="flex-1">
          <p className="font-semibold text-sm">{report.title}</p>
          <p className="text-xs text-muted-foreground mt-0.5">{report.description}</p>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <Badge variant="outline" className="text-xs">{report.category}</Badge>
            <Badge variant="secondary" className="text-xs">{report.frequency}</Badge>
            <span className="text-xs text-muted-foreground">Last: {report.lastGenerated}</span>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Button size="sm" variant="outline" onClick={() => onPreview(report.id)}>
          <Eye className="h-4 w-4" />
        </Button>
        <Button size="sm" onClick={() => toast.success(`Downloading ${report.title}...`)}>
          <Download className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

/* ─── Teacher: Class Reports ────────────────────────────── */
function TeacherReports() {
  return (
    <>
      <PageHeader
        title="Class Reports"
        subtitle={`Grade 7 - Sampaguita · Ms. Aurora Aquino · SY ${SCHOOL_YEAR}`}
      />
      <main className="space-y-6 p-4 sm:p-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Available Reports</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              { title: "Class Attendance Summary", desc: "Weekly and monthly attendance for your section" },
              { title: "Grade Distribution", desc: "Performance breakdown by subject" },
              { title: "Student Progress Report", desc: "Individual student performance tracking" },
            ].map((report, idx) => (
              <div key={idx} className="flex items-center justify-between rounded-lg border bg-card p-4">
                <div>
                  <p className="font-semibold text-sm">{report.title}</p>
                  <p className="text-xs text-muted-foreground">{report.desc}</p>
                </div>
                <Button size="sm">
                  <Download className="h-4 w-4" /> Download
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      </main>
    </>
  );
}

/* ─── Student: Personal Reports ─────────────────────────── */
function StudentReports() {
  return (
    <>
      <PageHeader
        title="My Reports"
        subtitle={`${SCHOOL_NAME} · SY ${SCHOOL_YEAR}`}
      />
      <main className="space-y-6 p-4 sm:p-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Available Reports</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              { title: "Report Card - Q3", desc: "Third quarter grades and performance" },
              { title: "Attendance Record", desc: "Complete attendance history" },
              { title: "Academic Transcript", desc: "All quarters cumulative record" },
            ].map((report, idx) => (
              <div key={idx} className="flex items-center justify-between rounded-lg border bg-card p-4">
                <div>
                  <p className="font-semibold text-sm">{report.title}</p>
                  <p className="text-xs text-muted-foreground">{report.desc}</p>
                </div>
                <Button size="sm">
                  <Download className="h-4 w-4" /> Download
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      </main>
    </>
  );
}
