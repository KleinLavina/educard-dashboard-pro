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
  fullName,
  allLearners,
  gradeRecords,
  SUBJECTS_JHS,
  teacherContacts,
  attendanceLogs,
  conductLogs,
} from "@/lib/school-data";

// Mock data for parent's children
const myChildren = [
  allLearners.find((l) => l.learner.lrn === "136728140987")!, // Juan
  allLearners.find((l) => l.learner.lrn === "136728140989")!, // Bea
];

export function ParentMyChildrenView() {
  const [selectedChild, setSelectedChild] = useState(0);
  const activeChild = myChildren[selectedChild];
  const childName = fullName(activeChild.learner);

  // Get child-specific data
  const childGrades = gradeRecords.filter((g) => g.lrn === activeChild.learner.lrn);
  const childAttendance = attendanceLogs.filter((a) => a.lrn === activeChild.learner.lrn);
  const childConduct = conductLogs.filter((c) => c.lrn === activeChild.learner.lrn);

  // Calculate statistics
  const gradeStats = {
    highest: Math.max(...childGrades.map((g) => g.grades.q3)),
    lowest: Math.min(...childGrades.map((g) => g.grades.q3)),
    average: (childGrades.reduce((sum, g) => sum + g.grades.q3, 0) / childGrades.length).toFixed(1),
    improving: childGrades.filter((g) => g.grades.q3 > g.grades.q2).length,
    declining: childGrades.filter((g) => g.grades.q3 < g.grades.q2).length,
    stable: childGrades.filter((g) => g.grades.q3 === g.grades.q2).length,
  };

  // Attendance statistics
  const attendanceStats = {
    present: childAttendance.filter((a) => a.status === "Present").length,
    absent: childAttendance.filter((a) => a.status === "Absent").length,
    late: childAttendance.filter((a) => a.status === "Late").length,
    total: childAttendance.length,
    rate: activeChild.learner.attendanceRate,
  };

  // Conduct statistics
  const conductStats = {
    positive: childConduct.filter((c) => c.type === "Positive").length,
    neutral: childConduct.filter((c) => c.type === "Note").length,
    negative: childConduct.filter((c) => c.type === "Negative").length,
    total: childConduct.length,
  };

  // Grade trend data
  const gradeTrend = childGrades.map((g) => ({
    subject: g.subject.length > 15 ? g.subject.substring(0, 15) + "..." : g.subject,
    Q1: g.grades.q1,
    Q2: g.grades.q2,
    Q3: g.grades.q3,
  }));

  // Subject performance radar data
  const radarData = childGrades.slice(0, 6).map((g) => ({
    subject: g.subject.split(" ")[0], // First word only
    score: g.grades.q3,
    fullMark: 100,
  }));

  // Get child's teachers
  const childTeachers = teacherContacts.filter((t) =>
    t.children?.includes(activeChild.learner.firstName)
  );

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
                    key={child.learner.lrn}
                    onClick={() => setSelectedChild(idx)}
                    className={`rounded-lg px-6 py-3 text-sm font-medium transition-all ${
                      selectedChild === idx
                        ? "bg-primary text-primary-foreground shadow-md"
                        : "bg-muted text-muted-foreground hover:bg-muted/80"
                    }`}
                  >
                    {child.learner.firstName}
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
                  {activeChild.learner.firstName.charAt(0)}
                </span>
              </div>
              <div className="flex-1 space-y-2">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <h2 className="text-2xl font-bold">{childName}</h2>
                    <p className="text-muted-foreground">{activeChild.sectionLabel}</p>
                  </div>
                  <Badge
                    variant={activeChild.status === "On Track" ? "secondary" : "destructive"}
                    className="text-sm"
                  >
                    {activeChild.status}
                  </Badge>
                </div>
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                  <div>
                    <p className="text-xs text-muted-foreground">LRN</p>
                    <p className="font-mono text-sm font-semibold">
                      {activeChild.learner.lrn}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">GPA</p>
                    <p className="text-sm font-semibold">{activeChild.learner.gpa}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Attendance</p>
                    <p className="text-sm font-semibold">
                      {activeChild.learner.attendanceRate.toFixed(1)}%
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
                      <Progress value={(gradeStats.improving / childGrades.length) * 100} className="h-2" />
                    </div>
                    <div>
                      <div className="mb-1 flex justify-between text-sm">
                        <span>Stable Subjects</span>
                        <span className="font-semibold">{gradeStats.stable}</span>
                      </div>
                      <Progress value={(gradeStats.stable / childGrades.length) * 100} className="h-2" />
                    </div>
                    <div>
                      <div className="mb-1 flex justify-between text-sm">
                        <span>Declining Subjects</span>
                        <span className="font-semibold">{gradeStats.declining}</span>
                      </div>
                      <Progress value={(gradeStats.declining / childGrades.length) * 100} className="h-2" />
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
                        grade.grades.q3 > grade.grades.q2
                          ? "up"
                          : grade.grades.q3 < grade.grades.q2
                          ? "down"
                          : "stable";
                      return (
                        <TableRow key={grade.subject}>
                          <TableCell className="font-medium">{grade.subject}</TableCell>
                          <TableCell className="text-center">{grade.grades.q1}</TableCell>
                          <TableCell className="text-center">{grade.grades.q2}</TableCell>
                          <TableCell className="text-center font-semibold">
                            {grade.grades.q3}
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
                              record.status === "Present"
                                ? "secondary"
                                : record.status === "Absent"
                                ? "destructive"
                                : "outline"
                            }
                          >
                            {record.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{record.timeIn || "—"}</TableCell>
                        <TableCell>{record.timeOut || "—"}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {record.notes || "—"}
                        </TableCell>
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
                            : record.type === "Negative"
                            ? "bg-red-100 dark:bg-red-950"
                            : "bg-blue-100 dark:bg-blue-950"
                        }`}
                      >
                        {record.type === "Positive" && (
                          <Award className="h-5 w-5 text-green-600 dark:text-green-400" />
                        )}
                        {record.type === "Negative" && (
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
                                : record.type === "Negative"
                                ? "destructive"
                                : "outline"
                            }
                          >
                            {record.type}
                          </Badge>
                        </div>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {record.date} · {record.teacher}
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
                  {childTeachers.map((teacher, idx) => (
                    <Card key={idx}>
                      <CardContent className="p-6">
                        <div className="space-y-4">
                          <div>
                            <h4 className="font-semibold">{teacher.teacher}</h4>
                            <p className="text-sm text-muted-foreground">{teacher.subject}</p>
                          </div>
                          <Separator />
                          <div className="space-y-2">
                            <div className="flex items-center gap-2 text-sm">
                              <Phone className="h-4 w-4 text-muted-foreground" />
                              <span>{teacher.phone}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                              <Mail className="h-4 w-4 text-muted-foreground" />
                              <span className="truncate">{teacher.email}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                              <Send className="h-4 w-4 text-muted-foreground" />
                              <span>{teacher.messenger}</span>
                            </div>
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
