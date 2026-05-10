import { useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  Users,
  GraduationCap,
  CalendarCheck,
  Bell,
  MessageCircle,
  CheckCircle2,
  AlertTriangle,
  Clock,
  TrendingUp,
  Smartphone,
  Mail,
  BellOff,
  BellRing,
  Scan,
  Download,
  FileText,
  Calendar,
  Send,
  Eye,
  BarChart3,
  Award,
  Target,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PageHeader } from "@/components/page-header";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import {
  SCHOOL_NAME,
  SCHOOL_YEAR,
  fullName,
  allLearners,
  gradeRecords,
  SUBJECTS_JHS,
  teacherContacts,
  SF2_TARGET,
} from "@/lib/school-data";

// Mock data for parent's children
const myChildren = [
  allLearners.find((l) => l.learner.lrn === "136728140987")!, // Juan
  allLearners.find((l) => l.learner.lrn === "136728140989")!, // Bea
];

const attendanceHistory = [
  { week: "Wk 1", juan: 100, bea: 100 },
  { week: "Wk 2", juan: 100, bea: 100 },
  { week: "Wk 3", juan: 80, bea: 100 },
  { week: "Wk 4", juan: 100, bea: 100 },
  { week: "Wk 5", juan: 100, bea: 100 },
  { week: "Wk 6", juan: 96.4, bea: 97.1 },
];

const recentNotifications = [
  {
    icon: CalendarCheck,
    title: "Juan arrived at school",
    text: "Time-in scanned at 7:38 AM",
    time: "2h ago",
    tone: "ok",
    child: "Juan",
  },
  {
    icon: GraduationCap,
    title: "New grade posted - Bea",
    text: "Math 3rd Quarter: 90 - On Track",
    time: "5h ago",
    tone: "ok",
    child: "Bea",
  },
  {
    icon: CalendarCheck,
    title: "Bea arrived at school",
    text: "Time-in scanned at 7:42 AM",
    time: "Today",
    tone: "ok",
    child: "Bea",
  },
  {
    icon: Bell,
    title: "SF2 report reminder",
    text: "3rd Quarter SF2 will be reviewed on May 15",
    time: "Yesterday",
    tone: "info",
    child: "Both",
  },
];

const conductRecords = [
  {
    child: "Juan",
    date: "May 5",
    item: "Participated in Science Lab",
    type: "Positive",
  },
  {
    child: "Bea",
    date: "May 3",
    item: "Excellent class participation",
    type: "Positive",
  },
  {
    child: "Juan",
    date: "Apr 28",
    item: "Submitted project on time",
    type: "Positive",
  },
  {
    child: "Juan",
    date: "Apr 12",
    item: "Late arrival — 8:15 AM",
    type: "Note",
  },
];

export function ParentView() {
  const [activeChild, setActiveChild] = useState(0);
  const [notificationSettings, setNotificationSettings] = useState({
    messenger: true,
    sms: false,
    gradeAlerts: true,
    attendanceAlerts: true,
    conductAlerts: true,
    absenceAlerts: true,
  });
  const [messageTeacherOpen, setMessageTeacherOpen] = useState(false);
  const [reportCardOpen, setReportCardOpen] = useState(false);
  const [attendanceCalendarOpen, setAttendanceCalendarOpen] = useState(false);
  const [performanceAnalysisOpen, setPerformanceAnalysisOpen] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState("");
  const [message, setMessage] = useState("");

  const activeChildData = myChildren[activeChild];
  const activeChildName = fullName(activeChildData.learner);

  // Filter data by active child
  const childNotifications = recentNotifications.filter(
    (n) => n.child === activeChildName || n.child === "Both"
  );
  const childConductRecords = conductRecords.filter(
    (c) => c.child === activeChildName
  );
  const childGrades = gradeRecords.filter(
    (g) => g.lrn === activeChildData.learner.lrn
  );

  // Calculate grade statistics
  const gradeStats = {
    highest: Math.max(...childGrades.map(g => g.grades.q3)),
    lowest: Math.min(...childGrades.map(g => g.grades.q3)),
    average: childGrades.reduce((sum, g) => sum + g.grades.q3, 0) / childGrades.length,
    improving: childGrades.filter(g => g.grades.q3 > g.grades.q2).length,
    declining: childGrades.filter(g => g.grades.q3 < g.grades.q2).length,
  };

  // Subject performance data for chart
  const subjectPerformance = childGrades.map(g => ({
    subject: g.subject,
    q1: g.grades.q1,
    q2: g.grades.q2,
    q3: g.grades.q3,
  }));

  const handleSimulateScan = (childName: string) => {
    const now = new Date();
    const timeString = now.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });

    toast.success(`${childName} arrived at school`, {
      description: `Time-in scanned at ${timeString}`,
      icon: <CalendarCheck className="h-4 w-4" />,
    });
  };

  function handleSendMessage() {
    if (!selectedTeacher || !message.trim()) {
      toast.error("Please select a teacher and enter a message");
      return;
    }
    const teacher = teacherContacts.find(t => t.teacher === selectedTeacher);
    toast.success(`Message sent to ${teacher?.teacher}`);
    setMessageTeacherOpen(false);
    setSelectedTeacher("");
    setMessage("");
  }

  return (
    <>
      <PageHeader
        title="Parent Portal"
        subtitle={`Maria Dela Cruz · ${SCHOOL_NAME} · SY ${SCHOOL_YEAR}`}
      />
      <main className="space-y-6 p-4 sm:p-6">
        {/* Hero Section */}
        <section
          className="relative overflow-hidden rounded-2xl p-6 text-primary-foreground shadow-[var(--shadow-elegant)]"
          style={{
            background:
              "linear-gradient(135deg, oklch(0.60 0.15 150), oklch(0.75 0.12 170))",
          }}
        >
          <div className="absolute -right-12 -top-12 h-48 w-48 rounded-full bg-white/10 blur-2xl" />
          <div className="relative flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="font-ui text-xs font-medium uppercase tracking-widest opacity-80">
                Magandang umaga, Mrs. Dela Cruz
              </p>
              <h2 className="mt-1 text-2xl font-semibold sm:text-3xl">
                My Family · {myChildren.length} {myChildren.length === 1 ? 'Student' : 'Students'} Enrolled
              </h2>
              <p className="mt-2 text-sm opacity-90">
                {myChildren.filter(c => c.status === "On Track").length === myChildren.length 
                  ? "All children have excellent attendance and grades this quarter."
                  : `${myChildren.filter(c => c.status === "On Track").length} of ${myChildren.length} students on track this quarter.`}
              </p>
            </div>
            <div className="flex gap-2">
              <div className="rounded-lg bg-white/15 px-3 py-2 text-center backdrop-blur">
                <p className="font-ui text-[10px] uppercase tracking-wider opacity-80">
                  Quarter
                </p>
                <p className="text-sm font-semibold">3rd</p>
              </div>
              <div className="rounded-lg bg-white/15 px-3 py-2 text-center backdrop-blur">
                <p className="font-ui text-[10px] uppercase tracking-wider opacity-80">
                  Messages
                </p>
                <p className="text-sm font-semibold">1 New</p>
              </div>
            </div>
          </div>
        </section>

        {/* Family Overview Section */}
        <section>
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="font-ui text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                My Family
              </h3>
              <p className="mt-1 text-xs text-muted-foreground">
                {myChildren.length} {myChildren.length === 1 ? 'student' : 'students'} enrolled in {SCHOOL_NAME}
              </p>
            </div>
            <div className="flex gap-2">
              {myChildren.map((child, idx) => (
                <button
                  key={child.learner.lrn}
                  onClick={() => setActiveChild(idx)}
                  className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                    activeChild === idx
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  }`}
                >
                  {child.learner.firstName}
                </button>
              ))}
            </div>
          </div>

          {/* Family Statistics Cards */}
          <div className="mb-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-950">
                    <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Total Students</p>
                    <p className="text-xl font-bold">{myChildren.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100 dark:bg-green-950">
                    <Award className="h-5 w-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Average GPA</p>
                    <p className="text-xl font-bold">
                      {(myChildren.reduce((sum, c) => sum + c.learner.gpa, 0) / myChildren.length).toFixed(2)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100 dark:bg-purple-950">
                    <CalendarCheck className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Avg Attendance</p>
                    <p className="text-xl font-bold">
                      {(myChildren.reduce((sum, c) => sum + c.learner.attendanceRate, 0) / myChildren.length).toFixed(1)}%
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-100 dark:bg-orange-950">
                    <Target className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">On Track</p>
                    <p className="text-xl font-bold">
                      {myChildren.filter(c => c.status === "On Track").length}/{myChildren.length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Active Child Card */}
          <Card className="overflow-hidden">
            <CardContent className="p-0">
              <div
                className="h-24 w-full"
                style={{
                  background:
                    "linear-gradient(135deg, oklch(0.60 0.15 150), oklch(0.75 0.12 170))",
                }}
              />
              <div className="relative px-5 pb-5">
                <div className="-mt-10 flex items-end gap-4">
                  <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl border-4 border-background bg-muted shadow-md">
                    <Users className="h-9 w-9 text-muted-foreground" />
                  </div>
                  <div className="flex-1 pb-1">
                    <h4 className="text-lg font-bold">
                      {fullName(activeChildData.learner)}
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      {activeChildData.sectionLabel}
                    </p>
                  </div>
                  <Badge
                    variant={activeChildData.status === "On Track" ? "secondary" : "destructive"}
                    className="mb-1"
                  >
                    {activeChildData.status}
                  </Badge>
                </div>
                <div className="mt-4 grid grid-cols-3 gap-4 border-t pt-4">
                  <div>
                    <p className="font-ui text-[10px] uppercase tracking-wide text-muted-foreground">
                      GPA
                    </p>
                    <p className="text-lg font-semibold">
                      {activeChildData.learner.gpa}
                    </p>
                  </div>
                  <div>
                    <p className="font-ui text-[10px] uppercase tracking-wide text-muted-foreground">
                      Attendance
                    </p>
                    <p className="text-lg font-semibold">
                      {activeChildData.learner.attendanceRate.toFixed(1)}%
                    </p>
                  </div>
                  <div>
                    <p className="font-ui text-[10px] uppercase tracking-wide text-muted-foreground">
                      LRN
                    </p>
                    <p className="font-mono text-xs font-semibold">
                      {activeChildData.learner.lrn}
                    </p>
                  </div>
                </div>
                <div className="mt-4 grid gap-2 sm:grid-cols-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleSimulateScan(fullName(activeChildData.learner))}
                  >
                    <Scan className="mr-2 h-4 w-4" />
                    Simulate Scan
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setMessageTeacherOpen(true)}
                  >
                    <Send className="mr-2 h-4 w-4" />
                    Message Teacher
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setReportCardOpen(true)}
                  >
                    <FileText className="mr-2 h-4 w-4" />
                    Report Card
                  </Button>
                </div>
                <div className="mt-2 grid gap-2 sm:grid-cols-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setAttendanceCalendarOpen(true)}
                  >
                    <Calendar className="mr-2 h-4 w-4" />
                    Attendance Calendar
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPerformanceAnalysisOpen(true)}
                  >
                    <BarChart3 className="mr-2 h-4 w-4" />
                    Performance Analysis
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* All Students Enrolled Section */}
        <section>
          <div className="mb-4">
            <h3 className="font-ui text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              All Students Enrolled
            </h3>
            <p className="mt-1 text-xs text-muted-foreground">
              Complete overview of all your children at {SCHOOL_NAME}
            </p>
          </div>
          
          <div className="grid gap-4 sm:grid-cols-2">
            {myChildren.map((child, idx) => {
              const childGradesData = gradeRecords.filter(g => g.lrn === child.learner.lrn);
              const avgGrade = childGradesData.length > 0 
                ? (childGradesData.reduce((sum, g) => sum + g.grades.q3, 0) / childGradesData.length).toFixed(1)
                : "N/A";
              
              return (
                <Card 
                  key={child.learner.lrn} 
                  className={`cursor-pointer transition-all hover:shadow-lg ${
                    activeChild === idx ? 'ring-2 ring-primary' : ''
                  }`}
                  onClick={() => setActiveChild(idx)}
                >
                  <CardContent className="p-5">
                    <div className="flex items-start gap-4">
                      <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 text-white shadow-md">
                        <span className="text-2xl font-bold">
                          {child.learner.firstName.charAt(0)}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-base truncate">
                              {fullName(child.learner)}
                            </h4>
                            <p className="text-sm text-muted-foreground truncate">
                              {child.sectionLabel}
                            </p>
                          </div>
                          <Badge
                            variant={child.status === "On Track" ? "secondary" : "destructive"}
                            className="shrink-0"
                          >
                            {child.status}
                          </Badge>
                        </div>
                        
                        <div className="mt-3 grid grid-cols-3 gap-3 text-center">
                          <div className="rounded-lg bg-muted/50 p-2">
                            <p className="text-xs text-muted-foreground">GPA</p>
                            <p className="text-sm font-bold">{child.learner.gpa}</p>
                          </div>
                          <div className="rounded-lg bg-muted/50 p-2">
                            <p className="text-xs text-muted-foreground">Avg</p>
                            <p className="text-sm font-bold">{avgGrade}</p>
                          </div>
                          <div className="rounded-lg bg-muted/50 p-2">
                            <p className="text-xs text-muted-foreground">Attend</p>
                            <p className="text-sm font-bold">{child.learner.attendanceRate.toFixed(0)}%</p>
                          </div>
                        </div>

                        <div className="mt-3 flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1 h-8 text-xs"
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveChild(idx);
                              setReportCardOpen(true);
                            }}
                          >
                            <FileText className="mr-1 h-3 w-3" />
                            Report
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1 h-8 text-xs"
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveChild(idx);
                              setMessageTeacherOpen(true);
                            }}
                          >
                            <Send className="mr-1 h-3 w-3" />
                            Message
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>

        {/* Grades Table for Active Child */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              {activeChildName}'s Grades — 3rd Quarter
            </CardTitle>
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
                {childGrades.map((g) => (
                  <TableRow key={g.subject}>
                    <TableCell className="font-medium">{g.subject}</TableCell>
                    <TableCell className="text-center">{g.grades.q1}</TableCell>
                    <TableCell className="text-center">{g.grades.q2}</TableCell>
                    <TableCell className="text-center font-semibold">
                      {g.grades.q3}
                    </TableCell>
                    <TableCell className="text-center text-muted-foreground">
                      {g.grades.q4 ?? "—"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Attendance Chart */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Attendance History</CardTitle>
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <TrendingUp className="h-3.5 w-3.5" /> Last 6 weeks
            </span>
          </CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={attendanceHistory}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis
                  dataKey="week"
                  stroke="var(--color-muted-foreground)"
                  fontSize={11}
                />
                <YAxis
                  domain={[70, 100]}
                  stroke="var(--color-muted-foreground)"
                  fontSize={11}
                  unit="%"
                />
                <Tooltip
                  contentStyle={{
                    background: "var(--color-background)",
                    border: "1px solid var(--color-border)",
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="juan"
                  stroke="var(--color-chart-1)"
                  strokeWidth={2.5}
                  dot={{ r: 4 }}
                  name="Juan"
                />
                <Line
                  type="monotone"
                  dataKey="bea"
                  stroke="var(--color-chart-3)"
                  strokeWidth={2.5}
                  dot={{ r: 4 }}
                  name="Bea"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Recent Notifications & Conduct Records - Filtered by Active Child */}
        <section className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                Recent Notifications — {activeChildName}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {childNotifications.map((n, i) => (
                <div
                  key={i}
                  className="flex items-start gap-3 rounded-lg border bg-card p-3"
                >
                  <div
                    className={`rounded-md p-2 shrink-0 ${
                      n.tone === "ok"
                        ? "bg-chart-2/10 text-chart-2"
                        : "bg-primary/10 text-primary"
                    }`}
                  >
                    <n.icon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-medium leading-snug">{n.title}</p>
                      <Badge variant="outline" className="shrink-0 text-[10px]">
                        {n.child}
                      </Badge>
                    </div>
                    <p className="mt-0.5 text-xs text-muted-foreground">{n.text}</p>
                    <p className="mt-1 flex items-center gap-1 text-[11px] text-muted-foreground">
                      <Clock className="h-3 w-3" /> {n.time}
                    </p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                Conduct Records — {activeChildName}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {childConductRecords.map((c, i) => (
                <div
                  key={i}
                  className="flex items-start gap-3 rounded-lg border bg-card p-3"
                >
                  <div
                    className={`rounded-md p-2 shrink-0 ${
                      c.type === "Positive"
                        ? "bg-chart-2/10 text-chart-2"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {c.type === "Positive" ? (
                      <CheckCircle2 className="h-4 w-4" />
                    ) : (
                      <AlertTriangle className="h-4 w-4" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-medium">{c.item}</p>
                      <Badge variant="outline" className="shrink-0 text-[10px]">
                        {c.child}
                      </Badge>
                    </div>
                    <div className="mt-1 flex items-center gap-2">
                      <p className="text-xs text-muted-foreground">{c.date}</p>
                      <Badge
                        variant={c.type === "Positive" ? "secondary" : "outline"}
                        className="text-[10px]"
                      >
                        {c.type}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </section>

        {/* Notification Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <BellRing className="h-4 w-4" /> Notification Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Smartphone className="h-5 w-5 text-primary" />
                  <div>
                    <Label htmlFor="messenger" className="text-sm font-medium">
                      Facebook Messenger
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      Free instant notifications
                    </p>
                  </div>
                </div>
                <Switch
                  id="messenger"
                  checked={notificationSettings.messenger}
                  onCheckedChange={(checked) =>
                    setNotificationSettings((prev) => ({
                      ...prev,
                      messenger: checked,
                    }))
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-primary" />
                  <div>
                    <Label htmlFor="sms" className="text-sm font-medium">
                      SMS Fallback
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      ₱0.50 per message
                    </p>
                  </div>
                </div>
                <Switch
                  id="sms"
                  checked={notificationSettings.sms}
                  onCheckedChange={(checked) =>
                    setNotificationSettings((prev) => ({ ...prev, sms: checked }))
                  }
                />
              </div>
            </div>

            <div className="border-t pt-4">
              <h4 className="mb-3 font-ui text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Alert Types
              </h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label htmlFor="gradeAlerts" className="text-sm">
                    Grade Notifications
                  </Label>
                  <Switch
                    id="gradeAlerts"
                    checked={notificationSettings.gradeAlerts}
                    onCheckedChange={(checked) =>
                      setNotificationSettings((prev) => ({
                        ...prev,
                        gradeAlerts: checked,
                      }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="attendanceAlerts" className="text-sm">
                    Attendance Alerts
                  </Label>
                  <Switch
                    id="attendanceAlerts"
                    checked={notificationSettings.attendanceAlerts}
                    onCheckedChange={(checked) =>
                      setNotificationSettings((prev) => ({
                        ...prev,
                        attendanceAlerts: checked,
                      }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="conductAlerts" className="text-sm">
                    Conduct Alerts
                  </Label>
                  <Switch
                    id="conductAlerts"
                    checked={notificationSettings.conductAlerts}
                    onCheckedChange={(checked) =>
                      setNotificationSettings((prev) => ({
                        ...prev,
                        conductAlerts: checked,
                      }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="absenceAlerts" className="text-sm">
                    Prolonged Absence Alerts
                  </Label>
                  <Switch
                    id="absenceAlerts"
                    checked={notificationSettings.absenceAlerts}
                    onCheckedChange={(checked) =>
                      setNotificationSettings((prev) => ({
                        ...prev,
                        absenceAlerts: checked,
                      }))
                    }
                  />
                </div>
              </div>
            </div>

            <Button variant="outline" className="w-full">
              <BellOff className="mr-2 h-4 w-4" />
              Mute All Notifications (24 hours)
            </Button>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Performance Summary — {activeChildName}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-4">
              <div className="rounded-lg border bg-muted/30 p-3">
                <div className="flex items-center gap-2">
                  <Award className="h-4 w-4 text-chart-2" />
                  <p className="text-xs text-muted-foreground">Highest</p>
                </div>
                <p className="mt-1 text-2xl font-bold text-chart-2">{gradeStats.highest}</p>
              </div>
              <div className="rounded-lg border bg-muted/30 p-3">
                <div className="flex items-center gap-2">
                  <Target className="h-4 w-4 text-chart-1" />
                  <p className="text-xs text-muted-foreground">Average</p>
                </div>
                <p className="mt-1 text-2xl font-bold">{gradeStats.average.toFixed(1)}</p>
              </div>
              <div className="rounded-lg border bg-muted/30 p-3">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-chart-2" />
                  <p className="text-xs text-muted-foreground">Improving</p>
                </div>
                <p className="mt-1 text-2xl font-bold text-chart-2">{gradeStats.improving}</p>
              </div>
              <div className="rounded-lg border bg-muted/30 p-3">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-orange-500" />
                  <p className="text-xs text-muted-foreground">Needs Focus</p>
                </div>
                <p className="mt-1 text-2xl font-bold text-orange-500">{gradeStats.declining}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>

      {/* Message Teacher Dialog */}
      <Dialog open={messageTeacherOpen} onOpenChange={setMessageTeacherOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Message Teacher</DialogTitle>
            <DialogDescription>
              Send a message to {activeChildName}'s teacher
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Select Teacher</Label>
              <Select value={selectedTeacher} onValueChange={setSelectedTeacher}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a teacher..." />
                </SelectTrigger>
                <SelectContent>
                  {teacherContacts.filter(t => t.children?.includes(activeChildData.learner.firstName)).map((teacher) => (
                    <SelectItem key={teacher.teacher} value={teacher.teacher}>
                      {teacher.teacher} - {teacher.subject}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Message</Label>
              <Textarea
                placeholder="Type your message here..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={6}
              />
              <p className="text-xs text-muted-foreground">
                {message.length} / 500 characters
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setMessageTeacherOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSendMessage}>
              <Send className="h-4 w-4" /> Send Message
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Report Card Dialog */}
      <Dialog open={reportCardOpen} onOpenChange={setReportCardOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Report Card - Q3</DialogTitle>
            <DialogDescription>
              {activeChildName} · {activeChildData.sectionLabel} · SY {SCHOOL_YEAR}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="rounded-lg border bg-muted/30 p-6">
              <div className="mb-4 text-center">
                <h3 className="text-lg font-bold">{SCHOOL_NAME}</h3>
                <p className="text-sm text-muted-foreground">Third Quarter Report Card</p>
              </div>
              <div className="mb-4 grid gap-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Student Name:</span>
                  <span className="font-semibold">{activeChildName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">LRN:</span>
                  <span className="font-mono font-semibold">{activeChildData.learner.lrn}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Section:</span>
                  <span className="font-semibold">{activeChildData.sectionLabel}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">General Average:</span>
                  <span className="text-lg font-bold text-primary">{gradeStats.average.toFixed(1)}</span>
                </div>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Subject</TableHead>
                    <TableHead className="text-center">Q3 Grade</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {childGrades.map((g) => (
                    <TableRow key={g.subject}>
                      <TableCell>{g.subject}</TableCell>
                      <TableCell className="text-center font-semibold">{g.grades.q3}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setReportCardOpen(false)}>
              Close
            </Button>
            <Button onClick={() => toast.success("Downloading report card...")}>
              <Download className="h-4 w-4" /> Download PDF
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Attendance Calendar Dialog */}
      <Dialog open={attendanceCalendarOpen} onOpenChange={setAttendanceCalendarOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Attendance Calendar</DialogTitle>
            <DialogDescription>
              {activeChildName}'s attendance for the current quarter
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold">Current Rate: {activeChildData.learner.attendanceRate.toFixed(1)}%</p>
                <p className="text-xs text-muted-foreground">
                  {activeChildData.learner.attendanceRate >= SF2_TARGET ? "Meeting SF2 target" : "Below SF2 target"}
                </p>
              </div>
              <Badge variant={activeChildData.learner.attendanceRate >= SF2_TARGET ? "default" : "destructive"}>
                {activeChildData.learner.attendanceRate >= SF2_TARGET ? "On Track" : "At Risk"}
              </Badge>
            </div>
            <div className="grid grid-cols-7 gap-2">
              {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
                <div key={day} className="text-center text-xs font-semibold text-muted-foreground">
                  {day}
                </div>
              ))}
              {Array.from({ length: 35 }, (_, i) => {
                const isWeekend = i % 7 >= 5;
                const isPresent = Math.random() > 0.1;
                return (
                  <div
                    key={i}
                    className={`aspect-square rounded-lg border p-2 text-center text-xs ${
                      isWeekend
                        ? "bg-muted text-muted-foreground"
                        : isPresent
                        ? "bg-chart-2/10 text-chart-2 border-chart-2/30"
                        : "bg-destructive/10 text-destructive border-destructive/30"
                    }`}
                  >
                    {i + 1}
                  </div>
                );
              })}
            </div>
            <div className="mt-4 flex items-center justify-center gap-4 text-xs">
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 rounded bg-chart-2/10 border border-chart-2/30" />
                <span>Present</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 rounded bg-destructive/10 border border-destructive/30" />
                <span>Absent</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 rounded bg-muted" />
                <span>Weekend</span>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAttendanceCalendarOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Performance Analysis Dialog */}
      <Dialog open={performanceAnalysisOpen} onOpenChange={setPerformanceAnalysisOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Performance Analysis</DialogTitle>
            <DialogDescription>
              {activeChildName}'s academic progress across quarters
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Tabs defaultValue="chart">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="chart">Progress Chart</TabsTrigger>
                <TabsTrigger value="comparison">Subject Comparison</TabsTrigger>
              </TabsList>
              <TabsContent value="chart" className="mt-4">
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={subjectPerformance}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                    <XAxis dataKey="subject" tick={{ fontSize: 11 }} />
                    <YAxis domain={[70, 100]} tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Line type="monotone" dataKey="q1" stroke="#8b5cf6" strokeWidth={2} name="Q1" />
                    <Line type="monotone" dataKey="q2" stroke="#3b82f6" strokeWidth={2} name="Q2" />
                    <Line type="monotone" dataKey="q3" stroke="#10b981" strokeWidth={2} name="Q3" />
                  </LineChart>
                </ResponsiveContainer>
              </TabsContent>
              <TabsContent value="comparison" className="mt-4">
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={subjectPerformance}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                    <XAxis dataKey="subject" tick={{ fontSize: 11 }} />
                    <YAxis domain={[70, 100]} tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Bar dataKey="q3" fill="#10b981" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </TabsContent>
            </Tabs>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPerformanceAnalysisOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
