import { useState } from "react";
import {
  Users,
  GraduationCap,
  CalendarCheck,
  Bell,
  MessageCircle,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Star,
  TrendingUp,
  Smartphone,
  Mail,
  BellOff,
  BellRing,
  Scan,
  Phone,
  Facebook,
  Copy,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { PageHeader } from "@/components/page-header";
import { toast } from "sonner";
import {
  SCHOOL_NAME,
  SCHOOL_YEAR,
  fullName,
  allLearners,
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

const teacherContacts = [
  {
    teacher: "Ms. Aurora Aquino",
    subject: "Grade 7 - Sampaguita",
    role: "Adviser & Math Teacher",
    phone: "+63 917 123 4567",
    messenger: "aurora.aquino",
    facebook: "aurora.aquino.teacher",
    email: "a.aquino@stmarys.edu.ph",
    children: ["Juan", "Bea"],
  },
];

export function ParentView() {
  const [notificationSettings, setNotificationSettings] = useState({
    messenger: true,
    sms: false,
    gradeAlerts: true,
    attendanceAlerts: true,
    conductAlerts: true,
    absenceAlerts: true,
  });

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

  const handleCopyContact = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard`, {
      description: text,
    });
  };

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
                {myChildren.length} Children · All On Track
              </h2>
              <p className="mt-2 text-sm opacity-90">
                Both children have excellent attendance and grades this quarter.
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

        {/* Children Overview */}
        <section>
          <h3 className="mb-4 font-ui text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            My Children
          </h3>
          <div className="grid gap-4 md:grid-cols-2">
            {myChildren.map((child) => (
              <Card key={child.learner.lrn} className="overflow-hidden">
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
                          {fullName(child.learner)}
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          {child.sectionLabel}
                        </p>
                      </div>
                      <Badge
                        variant={child.status === "On Track" ? "secondary" : "destructive"}
                        className="mb-1"
                      >
                        {child.status}
                      </Badge>
                    </div>
                    <div className="mt-4 grid grid-cols-3 gap-4 border-t pt-4">
                      <div>
                        <p className="font-ui text-[10px] uppercase tracking-wide text-muted-foreground">
                          GPA
                        </p>
                        <p className="text-lg font-semibold">
                          {child.learner.gpa}
                        </p>
                      </div>
                      <div>
                        <p className="font-ui text-[10px] uppercase tracking-wide text-muted-foreground">
                          Attendance
                        </p>
                        <p className="text-lg font-semibold">
                          {child.learner.attendanceRate.toFixed(1)}%
                        </p>
                      </div>
                      <div>
                        <p className="font-ui text-[10px] uppercase tracking-wide text-muted-foreground">
                          LRN
                        </p>
                        <p className="font-mono text-xs font-semibold">
                          {child.learner.lrn}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-4 w-full"
                      onClick={() => handleSimulateScan(fullName(child.learner))}
                    >
                      <Scan className="mr-2 h-4 w-4" />
                      Simulate Scan Alert
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

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

        {/* Recent Notifications & Conduct Records */}
        <section className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Recent Notifications</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {recentNotifications.map((n, i) => (
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
              <CardTitle className="text-base">Conduct Records</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {conductRecords.map((c, i) => (
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

        {/* Teacher Contact Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <MessageCircle className="h-4 w-4" /> Teacher Contact Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {teacherContacts.map((teacher, i) => (
              <div
                key={i}
                className="rounded-lg border bg-card p-5"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/10">
                        <GraduationCap className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <p className="font-semibold">{teacher.teacher}</p>
                        <p className="text-xs text-muted-foreground">{teacher.role}</p>
                      </div>
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground">{teacher.subject}</p>
                    <div className="mt-1 flex flex-wrap gap-1">
                      {teacher.children.map((child) => (
                        <Badge key={child} variant="outline" className="text-[10px]">
                          {child}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-4 space-y-3 border-t pt-4">
                  {/* Phone Number */}
                  <div className="flex items-center justify-between gap-3 rounded-lg bg-muted/50 p-3">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-chart-1/10">
                        <Phone className="h-4 w-4 text-chart-1" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-ui text-[10px] uppercase tracking-wide text-muted-foreground">
                          Mobile Number
                        </p>
                        <p className="text-sm font-medium">{teacher.phone}</p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleCopyContact(teacher.phone, "Phone number")}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Facebook Messenger */}
                  <div className="flex items-center justify-between gap-3 rounded-lg bg-muted/50 p-3">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-[#0084FF]/10">
                        <MessageCircle className="h-4 w-4 text-[#0084FF]" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-ui text-[10px] uppercase tracking-wide text-muted-foreground">
                          Facebook Messenger
                        </p>
                        <p className="text-sm font-medium">@{teacher.messenger}</p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleCopyContact(teacher.messenger, "Messenger username")}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Facebook Profile */}
                  <div className="flex items-center justify-between gap-3 rounded-lg bg-muted/50 p-3">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-[#1877F2]/10">
                        <Facebook className="h-4 w-4 text-[#1877F2]" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-ui text-[10px] uppercase tracking-wide text-muted-foreground">
                          Facebook Profile
                        </p>
                        <p className="text-sm font-medium">fb.com/{teacher.facebook}</p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleCopyContact(`https://facebook.com/${teacher.facebook}`, "Facebook profile")}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Email */}
                  <div className="flex items-center justify-between gap-3 rounded-lg bg-muted/50 p-3">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-chart-3/10">
                        <Mail className="h-4 w-4 text-chart-3" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-ui text-[10px] uppercase tracking-wide text-muted-foreground">
                          Email Address
                        </p>
                        <p className="truncate text-sm font-medium">{teacher.email}</p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleCopyContact(teacher.email, "Email address")}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="mt-4 rounded-lg bg-primary/5 p-3">
                  <p className="text-xs text-muted-foreground">
                    <strong>Note:</strong> Please contact the teacher directly through their preferred communication channel. Response time may vary.
                  </p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

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
      </main>
    </>
  );
}
