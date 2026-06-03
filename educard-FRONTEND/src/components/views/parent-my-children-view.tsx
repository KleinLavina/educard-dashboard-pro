import { useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  Users,
  GraduationCap,
  CalendarCheck,
  Award,
  TrendingUp,
  TrendingDown,
  Minus,
  Phone,
  Mail,
  MapPin,
  Calendar,
  BookOpen,
  Target,
  AlertCircle,
  CheckCircle2,
  Clock,
  FileText,
  Send,
  Eye,
  BarChart3,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Legend,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PageHeader } from "@/components/page-header";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  SCHOOL_NAME,
  SCHOOL_YEAR,
} from "@/lib/school-data";
import { useLearners, useLearnerGrades, useLearnerAttendance, useLearnerConduct, useTeacherContacts } from "@/lib/use-api";

export function ParentMyChildrenView() {
  const [selectedChild, setSelectedChild] = useState(0);

  // API: fetch authenticated parent's children (backend scopes to current user)
  const { data: childrenPage } = useLearners();
  const myChildren = childrenPage?.results ?? [];
  const activeChild = myChildren[selectedChild];
  const childName = activeChild?.full_name ?? '—';

  // API: fetch grades, attendance, conduct, and teacher contacts
  const { data: apiGrades = [] } = useLearnerGrades(activeChild?.id ?? null);
  const childGradesBySubject = apiGrades.reduce<Record<string, { q1: number | null; q2: number | null; q3: number | null; q4: number | null }>>((acc, g) => {
    if (!acc[g.subject_name]) acc[g.subject_name] = { q1: null, q2: null, q3: null, q4: null };
    const key = `q${g.quarter}` as 'q1' | 'q2' | 'q3' | 'q4';
    acc[g.subject_name][key] = g.computed_grade;
    return acc;
  }, {});
  const childGrades = Object.entries(childGradesBySubject).map(([subject_name, grades]) => ({ subject_name, ...grades }));

  const { data: childAttendance = [] } = useLearnerAttendance(activeChild?.id ?? null);
  const { data: childConduct = [] } = useLearnerConduct(activeChild?.id ?? null);
  const teacherContactsQuery = useTeacherContacts();
  const teacherContactsList = teacherContactsQuery.data?.results ?? [];

  // Grade statistics
  const q3Grades = childGrades.filter(g => g.q3 !== null).map(g => g.q3!);
  const gradeStats = {
    highest: q3Grades.length > 0 ? Math.max(...q3Grades) : 0,
    lowest: q3Grades.length > 0 ? Math.min(...q3Grades) : 0,
    average: q3Grades.length > 0 ? (q3Grades.reduce((sum, g) => sum + g, 0) / q3Grades.length).toFixed(1) : '—',
    improving: childGrades.filter(g => g.q3 !== null && g.q2 !== null && g.q3! > g.q2!).length,
    declining: childGrades.filter(g => g.q3 !== null && g.q2 !== null && g.q3! < g.q2!).length,
    stable: childGrades.filter(g => g.q3 !== null && g.q2 !== null && g.q3 === g.q2).length,
  };

  // Attendance statistics
  const attendanceStats = {
    present: childAttendance.filter((a) => a.status === "present").length,
    absent: childAttendance.filter((a) => a.status === "absent").length,
    late: childAttendance.filter((a) => a.status === "late").length,
    total: childAttendance.length,
    rate: activeChild?.attendance_rate ?? 0,
  };

  // Conduct statistics
  const conductStats = {
    positive: childConduct.filter((c) => c.type === "Positive").length,
    neutral: childConduct.filter((c) => c.type === "Note").length,
    negative: childConduct.filter((c) => c.type === "Warning").length,
    total: childConduct.length,
  };

  // Grade trend data for chart
  const gradeTrend = childGrades.map((g) => ({
    subject: g.subject_name.length > 15 ? g.subject_name.substring(0, 15) + "..." : g.subject_name,
    Q1: g.q1 ?? 0,
    Q2: g.q2 ?? 0,
    Q3: g.q3 ?? 0,
  }));

  // Subject performance radar data
  const radarData = childGrades.slice(0, 6).map((g) => ({
    subject: g.subject_name.split(" ")[0],
    score: g.q3 ?? 0,
    fullMark: 100,
  }));

  return (
    <>
      <PageHeader
        title="My Children"
        subtitle={`Detailed view of each child's academic progress · ${SCHOOL_NAME} · SY ${SCHOOL_YEAR}`}
      />
      <main className="space-y-6 p-4 sm:p-6">
        {/* Child Selector */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-semibold">Select Child</h3>
                <p className="text-sm text-muted-foreground">
                  View detailed information for each of your children
                </p>
              </div>
              <div className="flex gap-2">
                {myChildren.map((child, idx) => (
                  <button
                    key={child.lrn}
                    onClick={() => setSelectedChild(idx)}
                    className={`rounded-lg px-6 py-3 text-sm font-medium transition-all ${
                      selectedChild === idx
                        ? "bg-primary text-primary-foreground shadow-md"
                        : "bg-muted text-muted-foreground hover:bg-muted/80"
                    }`}
                  >
                    {child.first_name}
                  </button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Student Profile Card */}
        <Card className="overflow-hidden">
          <div
            className="h-32 w-full"
            style={{
              background:
                "linear-gradient(135deg, oklch(0.60 0.15 150), oklch(0.75 0.12 170))",
            }}
          />
          <CardContent className="relative -mt-16 space-y-6 p-6">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-end">
              <div className="flex h-32 w-32 shrink-0 items-center justify-center rounded-2xl border-4 border-background bg-gradient-to-br from-blue-500 to-purple-600 text-white shadow-xl">
                <span className="text-5xl font-bold">
                  {activeChild?.first_name?.charAt(0) ?? '?'}
                </span>
              </div>
              <div className="flex-1 space-y-2">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <h2 className="text-2xl font-bold">{childName}</h2>
                    <p className="text-muted-foreground">{activeChild?.section_label ?? '—'}</p>
                  </div>
                  <Badge
                    variant={activeChild?.status === "On Track" ? "secondary" : "destructive"}
                    className="text-sm"
                  >
                    {activeChild?.status ?? '—'}
                  </Badge>
                </div>
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                  <div>
                    <p className="text-xs text-muted-foreground">LRN</p>
                    <p className="font-mono text-sm font-semibold">
                      {activeChild?.lrn ?? '—'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">GPA</p>
                    <p className="text-sm font-semibold">{activeChild?.gpa ?? '—'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Attendance</p>
                    <p className="text-sm font-semibold">
                      {(activeChild?.attendance_rate ?? 0).toFixed(1)}%
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Grade Level</p>
                    <p className="text-sm font-semibold">Grade 7</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-lg border bg-card p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100 dark:bg-green-950">
                    <TrendingUp className="h-5 w-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Improving</p>
                    <p className="text-xl font-bold text-green-600">{gradeStats.improving}</p>
                  </div>
                </div>
              </div>
              <div className="rounded-lg border bg-card p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-100 dark:bg-orange-950">
                    <TrendingDown className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Declining</p>
                    <p className="text-xl font-bold text-orange-600">{gradeStats.declining}</p>
                  </div>
                </div>
              </div>
              <div className="rounded-lg border bg-card p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-950">
                    <CheckCircle2 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Present Days</p>
                    <p className="text-xl font-bold text-blue-600">{attendanceStats.present}</p>
                  </div>
                </div>
              </div>
              <div className="rounded-lg border bg-card p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100 dark:bg-purple-950">
                    <Award className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Positive Notes</p>
                    <p className="text-xl font-bold text-purple-600">{conductStats.positive}</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Detailed Tabs */}
        <Tabs defaultValue="grades" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="grades">Grades</TabsTrigger>
            <TabsTrigger value="attendance">Attendance</TabsTrigger>
            <TabsTrigger value="conduct">Conduct</TabsTrigger>
            <TabsTrigger value="teachers">Teachers</TabsTrigger>
          </TabsList>

          {/* Grades Tab */}
          <TabsContent value="grades" className="space-y-4">
            <div className="grid gap-4 lg:grid-cols-2">
              {/* Grade Statistics */}
              <Card>
                <CardHeader>
                  <CardTitle>Grade Statistics</CardTitle>
                  <CardDescription>3rd Quarter Performance</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Highest Grade</span>
                      <span className="font-semibold text-green-600">{gradeStats.highest}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Lowest Grade</span>
                      <span className="font-semibold text-orange-600">{gradeStats.lowest}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Average Grade</span>
                      <span className="font-semibold text-blue-600">{gradeStats.average}</span>
                    </div>
                  </div>
                  <Separator />
                  <div className="space-y-3">
                    <div>
                      <div className="mb-1 flex justify-between text-sm">
                        <span>Improving Subjects</span>
                        <span className="font-semibold">{gradeStats.improving}</span>
                      </div>
                      <Progress value={childGrades.length > 0 ? (gradeStats.improving / childGrades.length) * 100 : 0} className="h-2" />
                    </div>
                    <div>
                      <div className="mb-1 flex justify-between text-sm">
                        <span>Stable Subjects</span>
                        <span className="font-semibold">{gradeStats.stable}</span>
                      </div>
                      <Progress value={childGrades.length > 0 ? (gradeStats.stable / childGrades.length) * 100 : 0} className="h-2" />
                    </div>
                    <div>
                      <div className="mb-1 flex justify-between text-sm">
                        <span>Declining Subjects</span>
                        <span className="font-semibold">{gradeStats.declining}</span>
                      </div>
                      <Progress value={childGrades.length > 0 ? (gradeStats.declining / childGrades.length) * 100 : 0} className="h-2" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Subject Performance Radar */}
              <Card>
                <CardHeader>
                  <CardTitle>Subject Performance</CardTitle>
                  <CardDescription>Top 6 Subjects - 3rd Quarter</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <RadarChart data={radarData}>
                      <PolarGrid />
                      <PolarAngleAxis dataKey="subject" />
                      <PolarRadiusAxis angle={90} domain={[0, 100]} />
                      <Radar
                        name="Score"
                        dataKey="score"
                        stroke="hsl(var(--primary))"
                        fill="hsl(var(--primary))"
                        fillOpacity={0.6}
                      />
                      <Legend />
                    </RadarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Grade Trend Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Grade Trends</CardTitle>
                <CardDescription>Performance across all quarters</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={gradeTrend}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="subject" angle={-45} textAnchor="end" height={100} />
                    <YAxis domain={[0, 100]} />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="Q1" stroke="#8884d8" strokeWidth={2} />
                    <Line type="monotone" dataKey="Q2" stroke="#82ca9d" strokeWidth={2} />
                    <Line type="monotone" dataKey="Q3" stroke="#ffc658" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Detailed Grades Table */}
            <Card>
              <CardHeader>
                <CardTitle>All Grades</CardTitle>
                <CardDescription>Complete grade breakdown</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Subject</TableHead>
                      <TableHead className="text-center">Q1</TableHead>
                      <TableHead className="text-center">Q2</TableHead>
                      <TableHead className="text-center">Q3</TableHead>
                      <TableHead className="text-center">Trend</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {childGrades.map((grade) => {
                      const trend =
                        grade.q3 !== null && grade.q2 !== null && grade.q3 > grade.q2
                          ? "up"
                          : grade.q3 !== null && grade.q2 !== null && grade.q3 < grade.q2
                          ? "down"
                          : "stable";
                      return (
                        <TableRow key={grade.subject_name}>
                          <TableCell className="font-medium">{grade.subject_name}</TableCell>
                          <TableCell className="text-center">{grade.q1 ?? "—"}</TableCell>
                          <TableCell className="text-center">{grade.q2 ?? "—"}</TableCell>
                          <TableCell className="text-center font-semibold">
                            {grade.q3 ?? "—"}
                          </TableCell>
                          <TableCell className="text-center">
                            {trend === "up" && (
                              <TrendingUp className="inline h-4 w-4 text-green-600" />
                            )}
                            {trend === "down" && (
                              <TrendingDown className="inline h-4 w-4 text-orange-600" />
                            )}
                            {trend === "stable" && (
                              <Minus className="inline h-4 w-4 text-gray-600" />
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Attendance Tab */}
          <TabsContent value="attendance" className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="h-8 w-8 text-green-600" />
                    <div>
                      <p className="text-sm text-muted-foreground">Present</p>
                      <p className="text-2xl font-bold">{attendanceStats.present}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <AlertCircle className="h-8 w-8 text-red-600" />
                    <div>
                      <p className="text-sm text-muted-foreground">Absent</p>
                      <p className="text-2xl font-bold">{attendanceStats.absent}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <Clock className="h-8 w-8 text-orange-600" />
                    <div>
                      <p className="text-sm text-muted-foreground">Late</p>
                      <p className="text-2xl font-bold">{attendanceStats.late}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <Target className="h-8 w-8 text-blue-600" />
                    <div>
                      <p className="text-sm text-muted-foreground">Rate</p>
                      <p className="text-2xl font-bold">{attendanceStats.rate.toFixed(1)}%</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Attendance History</CardTitle>
                <CardDescription>Recent attendance records</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Time In</TableHead>
                      <TableHead>Time Out</TableHead>
                      <TableHead>Notes</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {childAttendance.slice(0, 10).map((record, idx) => (
                      <TableRow key={idx}>
                        <TableCell>{record.date}</TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              record.status === "present"
                                ? "secondary"
                                : record.status === "absent"
                                ? "destructive"
                                : "outline"
                            }
                          >
                            {record.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{record.time_in_morning || "—"}</TableCell>
                        <TableCell>{record.time_out_afternoon || "—"}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">—</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Conduct Tab */}
          <TabsContent value="conduct" className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-3">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-100 dark:bg-green-950">
                      <Award className="h-6 w-6 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Positive</p>
                      <p className="text-2xl font-bold">{conductStats.positive}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-950">
                      <FileText className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Notes</p>
                      <p className="text-2xl font-bold">{conductStats.neutral}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-red-100 dark:bg-red-950">
                      <AlertCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Negative</p>
                      <p className="text-2xl font-bold">{conductStats.negative}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Conduct Records</CardTitle>
                <CardDescription>Behavioral notes and observations</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {childConduct.map((record, idx) => (
                    <div
                      key={idx}
                      className="flex items-start gap-4 rounded-lg border p-4"
                    >
                      <div
                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${
                          record.type === "Positive"
                            ? "bg-green-100 dark:bg-green-950"
                            : record.type === "Warning"
                            ? "bg-red-100 dark:bg-red-950"
                            : "bg-blue-100 dark:bg-blue-950"
                        }`}
                      >
                        {record.type === "Positive" && (
                          <Award className="h-5 w-5 text-green-600 dark:text-green-400" />
                        )}
                        {record.type === "Warning" && (
                          <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
                        )}
                        {record.type === "Note" && (
                          <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <p className="font-medium">{record.item}</p>
                          <Badge
                            variant={
                              record.type === "Positive"
                                ? "secondary"
                                : record.type === "Warning"
                                ? "destructive"
                                : "outline"
                            }
                          >
                            {record.type}
                          </Badge>
                        </div>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {record.date} · {record.recorded_by_name ?? '—'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Teachers Tab */}
          <TabsContent value="teachers" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>{childName}'s Teachers</CardTitle>
                <CardDescription>Contact information for all subject teachers</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 sm:grid-cols-2">
                  {teacherContactsList.map((teacher) => (
                    <Card key={teacher.id}>
                      <CardContent className="p-6">
                        <div className="space-y-4">
                          <div>
                            <h4 className="font-semibold">{teacher.teacher_name}</h4>
                            <p className="text-sm text-muted-foreground">{teacher.teacher_email}</p>
                          </div>
                          <Separator />
                          <div className="space-y-2">
                            {teacher.show_phone && teacher.phone && (
                              <div className="flex items-center gap-2 text-sm">
                                <Phone className="h-4 w-4 text-muted-foreground" />
                                <span>{teacher.phone}</span>
                              </div>
                            )}
                            {teacher.show_email && teacher.email && (
                              <div className="flex items-center gap-2 text-sm">
                                <Mail className="h-4 w-4 text-muted-foreground" />
                                <span className="truncate">{teacher.email}</span>
                              </div>
                            )}
                          </div>
                          <Button className="w-full" size="sm" asChild>
                            <Link to="/contacts">
                              <Send className="mr-2 h-4 w-4" />
                              Send Message
                            </Link>
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </>
  );
}
