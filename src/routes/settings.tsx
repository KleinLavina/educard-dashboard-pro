import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Save, CheckCircle2, School, GraduationCap, Bell, Moon, Sun, Calendar, Users, Shield, Database, Upload, Download, Trash2, Plus, Edit, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/page-header";
import { SCHOOL_NAME, SCHOOL_YEAR, schoolCalendar } from "@/lib/school-data";
import { useTheme } from "@/lib/theme-context";
import { useRole } from "@/lib/role-context";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";

export const Route = createFileRoute("/settings")({
  component: SettingsPage,
  head: () => ({ meta: [{ title: `Settings — ${SCHOOL_NAME} (EduCard Pro)` }] }),
});

type Tab = "school" | "grading" | "calendar" | "users" | "notifications" | "security" | "appearance";

function SettingsPage() {
  const { role } = useRole();
  const [tab, setTab] = useState<Tab>("school");
  const [saved, setSaved] = useState<Tab | null>(null);

  function save(t: Tab) {
    setSaved(t);
    setTimeout(() => setSaved(null), 2500);
  }

  const tabs: { id: Tab; label: string; icon: React.ElementType; adminOnly?: boolean }[] = [
    { id: "school", label: "School Info", icon: School, adminOnly: true },
    { id: "grading", label: "Grading", icon: GraduationCap },
    { id: "calendar", label: "Calendar", icon: Calendar, adminOnly: true },
    { id: "users", label: "Users", icon: Users, adminOnly: true },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "security", label: "Security", icon: Shield, adminOnly: true },
    { id: "appearance", label: "Appearance", icon: Moon },
  ];

  const visibleTabs = tabs.filter(t => !t.adminOnly || role === "principal");

  return (
    <>
      <PageHeader title="Settings" subtitle={`${SCHOOL_NAME} · EduCard Pro`} />
      <main className="space-y-6 p-4 sm:p-6">
        {/* Tab bar */}
        <div className="flex flex-wrap gap-2">
          {visibleTabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition-colors ${
                tab === t.id
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "border bg-card text-muted-foreground hover:bg-muted"
              }`}
            >
              <t.icon className="h-4 w-4" />
              {t.label}
            </button>
          ))}
        </div>

        {/* School Info */}
        {tab === "school" && role === "principal" && (
          <SchoolInfoTab onSave={() => save("school")} saved={saved === "school"} />
        )}

        {/* Grading Formula */}
        {tab === "grading" && (
          <GradingTab onSave={() => save("grading")} saved={saved === "grading"} role={role} />
        )}

        {/* School Calendar */}
        {tab === "calendar" && role === "principal" && (
          <CalendarTab onSave={() => save("calendar")} saved={saved === "calendar"} />
        )}

        {/* User Management */}
        {tab === "users" && role === "principal" && (
          <UsersTab />
        )}

        {/* Notifications */}
        {tab === "notifications" && (
          <NotificationsTab onSave={() => save("notifications")} saved={saved === "notifications"} />
        )}

        {/* Security */}
        {tab === "security" && role === "principal" && (
          <SecurityTab onSave={() => save("security")} saved={saved === "security"} />
        )}

        {/* Appearance */}
        {tab === "appearance" && <AppearanceTab />}
      </main>
    </>
  );
}

/* ─── School Info Tab ─────────────────────────────────────── */
function SchoolInfoTab({ onSave, saved }: { onSave: () => void; saved: boolean }) {
  const [form, setForm] = useState({
    name: SCHOOL_NAME,
    year: SCHOOL_YEAR,
    division: "Division of Manila",
    region: "Region IV-A CALABARZON",
    address: "123 Bonifacio St., Barangay San Miguel, Manila",
    principal: "Principal Reyes",
    contact: "(02) 8123-4567",
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <School className="h-4 w-4" /> School Information
        </CardTitle>
        <p className="text-xs text-muted-foreground">Used on SF2 reports, ID cards, and all printed documents.</p>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="grid gap-5 sm:grid-cols-2">
          {[
            { key: "name", label: "School Name" },
            { key: "year", label: "School Year" },
            { key: "division", label: "Schools Division Office" },
            { key: "region", label: "Region" },
            { key: "principal", label: "Principal / Administrator" },
            { key: "contact", label: "Contact Number" },
          ].map((f) => (
            <div key={f.key} className="space-y-1.5">
              <Label htmlFor={f.key} className="font-ui text-xs uppercase tracking-wide">{f.label}</Label>
              <Input
                id={f.key}
                value={form[f.key as keyof typeof form]}
                onChange={(e) => setForm((p) => ({ ...p, [f.key]: e.target.value }))}
              />
            </div>
          ))}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="address" className="font-ui text-xs uppercase tracking-wide">School Address</Label>
          <Input
            id="address"
            value={form.address}
            onChange={(e) => setForm((p) => ({ ...p, address: e.target.value }))}
          />
        </div>
        <div className="flex items-center gap-3 pt-2">
          <Button onClick={onSave} style={{ background: "var(--gradient-primary)" }}>
            <Save className="h-4 w-4" /> Save Changes
          </Button>
          {saved && (
            <span className="flex items-center gap-1.5 text-sm text-chart-2">
              <CheckCircle2 className="h-4 w-4" /> Saved successfully.
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

/* ─── Grading Formula Tab ─────────────────────────────────── */
function GradingTab({ onSave, saved, role }: { onSave: () => void; saved: boolean; role: string }) {
  const [weights, setWeights] = useState({ quiz: 30, exam: 40, activity: 30 });
  const total = weights.quiz + weights.exam + weights.activity;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <GraduationCap className="h-4 w-4" /> Grading Formula Weights
          </CardTitle>
          <p className="text-xs text-muted-foreground">
            DepEd K-12 formula — weights must add up to 100%.
            {role === "student" && " (Read-only for students)"}
          </p>
        </CardHeader>
        <CardContent className="space-y-5">
          {[
            { key: "quiz", label: "Written Works (Quiz)", hint: "Short quizzes, seatwork, assignments" },
            { key: "exam", label: "Performance Task / Exam", hint: "Major exams, summative tests" },
            { key: "activity", label: "Quarterly Assessment", hint: "Long tests, projects, performance" },
          ].map((f) => (
            <div key={f.key} className="space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="font-ui text-xs uppercase tracking-wide">{f.label}</Label>
                  <p className="text-[11px] text-muted-foreground">{f.hint}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    min={0}
                    max={100}
                    value={weights[f.key as keyof typeof weights]}
                    onChange={(e) => setWeights((p) => ({ ...p, [f.key]: Number(e.target.value) }))}
                    className="h-8 w-16 text-center"
                    disabled={role === "student"}
                  />
                  <span className="text-sm text-muted-foreground">%</span>
                </div>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full transition-all"
                  style={{ width: `${weights[f.key as keyof typeof weights]}%`, background: "var(--gradient-primary)" }}
                />
              </div>
            </div>
          ))}

          <div className={`flex items-center justify-between rounded-xl border p-3 ${total === 100 ? "border-chart-2/30 bg-chart-2/10" : "border-destructive/30 bg-destructive/5"}`}>
            <p className="text-sm font-semibold">Total Weight</p>
            <p className={`text-lg font-bold ${total === 100 ? "text-chart-2" : "text-destructive"}`}>
              {total}% {total !== 100 && <span className="text-sm font-normal">(must be 100%)</span>}
            </p>
          </div>

          {role !== "student" && (
            <div className="flex items-center gap-3">
              <Button onClick={onSave} disabled={total !== 100} style={{ background: total === 100 ? "var(--gradient-primary)" : undefined }}>
                <Save className="h-4 w-4" /> Save Formula
              </Button>
              {saved && (
                <span className="flex items-center gap-1.5 text-sm text-chart-2">
                  <CheckCircle2 className="h-4 w-4" /> Formula updated.
                </span>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Grading Scale</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 text-sm">
            {[
              { range: "90–100", label: "Outstanding", color: "text-chart-2" },
              { range: "85–89", label: "Very Satisfactory", color: "text-chart-1" },
              { range: "80–84", label: "Satisfactory", color: "text-chart-3" },
              { range: "75–79", label: "Fairly Satisfactory", color: "text-muted-foreground" },
              { range: "Below 75", label: "Did Not Meet Expectations", color: "text-destructive" },
            ].map((g) => (
              <div key={g.range} className="rounded-lg border bg-card p-3">
                <p className={`font-bold ${g.color}`}>{g.range}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{g.label}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

/* ─── Notifications Tab ───────────────────────────────────── */
function NotificationsTab({ onSave, saved }: { onSave: () => void; saved: boolean }) {
  const [prefs, setPrefs] = useState({
    messenger: true,
    sms: true,
    gradePosted: true,
    attendanceAlert: true,
    sf2Reminder: true,
    systemAlerts: false,
  });

  function toggle(key: keyof typeof prefs) {
    setPrefs((p) => ({ ...p, [key]: !p[key] }));
  }

  const channels = [
    { key: "messenger", label: "Facebook Messenger", hint: "Free via Meta Cloud API · instant delivery", accent: "text-blue-500" },
    { key: "sms", label: "SMS (Semaphore)", hint: "₱0.50/message · fallback when no internet", accent: "text-chart-1" },
  ];

  const events = [
    { key: "gradePosted", label: "Grade Posted", hint: "Notify when teacher posts a new grade" },
    { key: "attendanceAlert", label: "Absence Alert", hint: "Notify when a learner is marked absent" },
    { key: "sf2Reminder", label: "SF2 Deadline Reminder", hint: "7-day and 1-day reminders before submission" },
    { key: "systemAlerts", label: "System Alerts", hint: "Maintenance, updates, and system messages" },
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base"><Bell className="h-4 w-4" /> Notification Channels</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {channels.map((c) => (
            <div key={c.key} className="flex items-center justify-between rounded-xl border bg-card p-4">
              <div>
                <p className={`font-semibold text-sm ${c.accent}`}>{c.label}</p>
                <p className="text-xs text-muted-foreground">{c.hint}</p>
              </div>
              <button
                onClick={() => toggle(c.key as keyof typeof prefs)}
                className={`relative h-6 w-11 rounded-full transition-colors ${prefs[c.key as keyof typeof prefs] ? "bg-chart-2" : "bg-muted"}`}
              >
                <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${prefs[c.key as keyof typeof prefs] ? "translate-x-5" : "translate-x-0.5"}`} />
              </button>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Event Triggers</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {events.map((e) => (
            <div key={e.key} className="flex items-center justify-between rounded-xl border bg-card p-4">
              <div>
                <p className="font-semibold text-sm">{e.label}</p>
                <p className="text-xs text-muted-foreground">{e.hint}</p>
              </div>
              <button
                onClick={() => toggle(e.key as keyof typeof prefs)}
                className={`relative h-6 w-11 rounded-full transition-colors ${prefs[e.key as keyof typeof prefs] ? "bg-primary" : "bg-muted"}`}
              >
                <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${prefs[e.key as keyof typeof prefs] ? "translate-x-5" : "translate-x-0.5"}`} />
              </button>
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="flex items-center gap-3">
        <Button onClick={onSave} style={{ background: "var(--gradient-primary)" }}>
          <Save className="h-4 w-4" /> Save Preferences
        </Button>
        {saved && (
          <span className="flex items-center gap-1.5 text-sm text-chart-2">
            <CheckCircle2 className="h-4 w-4" /> Preferences saved.
          </span>
        )}
      </div>
    </div>
  );
}

/* ─── Appearance Tab ──────────────────────────────────────── */
function AppearanceTab() {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            {theme === "dark" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
            Theme
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            {(["light", "dark"] as const).map((t) => (
              <button
                key={t}
                onClick={() => theme !== t && toggleTheme()}
                className={`flex flex-col items-center gap-3 rounded-xl border p-5 transition-all ${
                  theme === t ? "border-primary bg-primary/5 shadow-sm" : "border-border/60 bg-card hover:bg-muted"
                }`}
              >
                <div className={`flex h-10 w-10 items-center justify-center rounded-full ${t === "dark" ? "bg-slate-900 text-white" : "bg-white border text-slate-900"}`}>
                  {t === "dark" ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
                </div>
                <div>
                  <p className="font-semibold capitalize">{t} Mode</p>
                  <p className="text-xs text-muted-foreground">{t === "dark" ? "Easy on the eyes" : "Crisp and bright"}</p>
                </div>
                {theme === t && (
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                )}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Sidebar</CardTitle></CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">The sidebar collapses to an icon rail on narrow screens. Click the trigger button in the top-left to toggle it manually.</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Typography</CardTitle></CardHeader>
        <CardContent className="space-y-3 text-sm">
          <p><span className="font-ui text-xs uppercase tracking-widest text-muted-foreground">Display font: </span>Michroma — used for labels and headers</p>
          <p><span className="font-ui text-xs uppercase tracking-widest text-muted-foreground">Body font: </span>Outfit — used for all body text</p>
          <p><span className="font-ui text-xs uppercase tracking-widest text-muted-foreground">Mono font: </span>System monospace — used for LRNs and codes</p>
        </CardContent>
      </Card>
    </div>
  );
}

/* ─── School Calendar Tab ─────────────────────────────────── */
function CalendarTab({ onSave, saved }: { onSave: () => void; saved: boolean }) {
  const [addHolidayOpen, setAddHolidayOpen] = useState(false);
  const [holidays, setHolidays] = useState(schoolCalendar.holidays);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-base">
              <Calendar className="h-4 w-4" /> School Year Calendar
            </CardTitle>
            <p className="text-xs text-muted-foreground">SY {schoolCalendar.schoolYear}</p>
          </div>
          <Button size="sm" onClick={() => setAddHolidayOpen(true)}>
            <Plus className="h-4 w-4" /> Add Holiday
          </Button>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label className="font-ui text-xs uppercase tracking-wide">Current Quarter</Label>
              <div className="rounded-lg border bg-muted/30 p-3">
                <p className="text-2xl font-bold text-primary">Q{schoolCalendar.currentQuarter}</p>
                <p className="text-xs text-muted-foreground mt-1">Week {schoolCalendar.currentWeek} of {schoolCalendar.schoolDaysThisQuarter / 10}</p>
              </div>
            </div>
            <div className="space-y-2">
              <Label className="font-ui text-xs uppercase tracking-wide">School Days Progress</Label>
              <div className="rounded-lg border bg-muted/30 p-3">
                <p className="text-2xl font-bold">{schoolCalendar.schoolDaysCompleted} / {schoolCalendar.schoolDaysThisQuarter}</p>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-chart-2"
                    style={{ width: `${(schoolCalendar.schoolDaysCompleted / schoolCalendar.schoolDaysThisQuarter) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="font-ui text-xs uppercase tracking-wide">Grading Periods</Label>
            <div className="space-y-2">
              {schoolCalendar.quarters.map((q) => (
                <div key={q.label} className="flex items-center justify-between rounded-lg border bg-card p-3">
                  <div className="flex items-center gap-3">
                    <Badge variant={q.label === `Q${schoolCalendar.currentQuarter}` ? "default" : "outline"}>
                      {q.label}
                    </Badge>
                    <div>
                      <p className="text-sm font-semibold">{q.start} — {q.end}</p>
                    </div>
                  </div>
                  {q.label === `Q${schoolCalendar.currentQuarter}` && (
                    <Badge variant="default">Current</Badge>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label className="font-ui text-xs uppercase tracking-wide">Holidays & Suspensions</Label>
            <div className="space-y-2">
              {holidays.map((date, idx) => (
                <div key={idx} className="flex items-center justify-between rounded-lg border bg-card p-3">
                  <div className="flex items-center gap-3">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <p className="text-sm font-semibold">{date}</p>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      setHolidays(holidays.filter((_, i) => i !== idx));
                      toast.success("Holiday removed");
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <Button onClick={onSave} style={{ background: "var(--gradient-primary)" }}>
              <Save className="h-4 w-4" /> Save Calendar
            </Button>
            {saved && (
              <span className="flex items-center gap-1.5 text-sm text-chart-2">
                <CheckCircle2 className="h-4 w-4" /> Calendar saved.
              </span>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Add Holiday Dialog */}
      <Dialog open={addHolidayOpen} onOpenChange={setAddHolidayOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Holiday or Suspension</DialogTitle>
            <DialogDescription>
              Add a non-school day to the calendar
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Date</Label>
              <Input type="date" />
            </div>
            <div className="space-y-2">
              <Label>Label (Optional)</Label>
              <Input placeholder="e.g., Rizal Day, Typhoon Suspension" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddHolidayOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => { toast.success("Holiday added"); setAddHolidayOpen(false); }}>
              Add Holiday
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

/* ─── User Management Tab ─────────────────────────────────── */
function UsersTab() {
  const [addUserOpen, setAddUserOpen] = useState(false);
  const [users] = useState([
    { id: 1, name: "Principal Reyes", email: "principal@stmarys.edu.ph", role: "Principal", status: "Active" },
    { id: 2, name: "Ms. Aurora Aquino", email: "a.aquino@stmarys.edu.ph", role: "Teacher", status: "Active" },
    { id: 3, name: "Mr. Benjie Lopez", email: "b.lopez@stmarys.edu.ph", role: "Teacher", status: "Active" },
    { id: 4, name: "Ms. Registrar Cruz", email: "registrar@stmarys.edu.ph", role: "Registrar", status: "Active" },
  ]);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-base">
              <Users className="h-4 w-4" /> User Accounts
            </CardTitle>
            <p className="text-xs text-muted-foreground">{users.length} active users</p>
          </div>
          <Button size="sm" onClick={() => setAddUserOpen(true)}>
            <Plus className="h-4 w-4" /> Add User
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {users.map((user) => (
              <div key={user.id} className="flex items-center justify-between rounded-lg border bg-card p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold">
                    {user.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-semibold text-sm">{user.name}</p>
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{user.role}</Badge>
                  <Badge variant="default" className="bg-chart-2">{user.status}</Badge>
                  <Button size="sm" variant="ghost">
                    <Edit className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Role Permissions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            <div className="rounded-lg border p-3">
              <p className="font-semibold">Principal / Admin</p>
              <p className="text-xs text-muted-foreground mt-1">Full access to all features, settings, and data</p>
            </div>
            <div className="rounded-lg border p-3">
              <p className="font-semibold">Teacher</p>
              <p className="text-xs text-muted-foreground mt-1">Manage own sections, input grades, mark attendance</p>
            </div>
            <div className="rounded-lg border p-3">
              <p className="font-semibold">Registrar</p>
              <p className="text-xs text-muted-foreground mt-1">Enroll students, print ID cards, manage records</p>
            </div>
            <div className="rounded-lg border p-3">
              <p className="font-semibold">Student</p>
              <p className="text-xs text-muted-foreground mt-1">View own grades, attendance, and notifications</p>
            </div>
            <div className="rounded-lg border p-3">
              <p className="font-semibold">Parent</p>
              <p className="text-xs text-muted-foreground mt-1">View children's grades, attendance, and communicate with teachers</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Add User Dialog */}
      <Dialog open={addUserOpen} onOpenChange={setAddUserOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New User</DialogTitle>
            <DialogDescription>
              Create a new user account for staff or administrators
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Full Name</Label>
              <Input placeholder="Enter full name" />
            </div>
            <div className="space-y-2">
              <Label>Email Address</Label>
              <Input type="email" placeholder="user@stmarys.edu.ph" />
            </div>
            <div className="space-y-2">
              <Label>Role</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select role..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="principal">Principal / Admin</SelectItem>
                  <SelectItem value="teacher">Teacher</SelectItem>
                  <SelectItem value="registrar">Registrar</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Temporary Password</Label>
              <Input type="password" placeholder="User will be prompted to change" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddUserOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => { toast.success("User account created"); setAddUserOpen(false); }}>
              Create User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

/* ─── Security Tab ────────────────────────────────────────── */
function SecurityTab({ onSave, saved }: { onSave: () => void; saved: boolean }) {
  const [backupDialogOpen, setBackupDialogOpen] = useState(false);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Shield className="h-4 w-4" /> Security Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div>
              <p className="font-semibold text-sm">Two-Factor Authentication</p>
              <p className="text-xs text-muted-foreground">Require 2FA for admin and teacher accounts</p>
            </div>
            <Button size="sm" variant="outline">
              Configure
            </Button>
          </div>
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div>
              <p className="font-semibold text-sm">Session Timeout</p>
              <p className="text-xs text-muted-foreground">Auto-logout after 30 minutes of inactivity</p>
            </div>
            <Button size="sm" variant="outline">
              Change
            </Button>
          </div>
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div>
              <p className="font-semibold text-sm">Password Policy</p>
              <p className="text-xs text-muted-foreground">Minimum 8 characters, must include numbers</p>
            </div>
            <Button size="sm" variant="outline">
              Edit Policy
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Database className="h-4 w-4" /> Data Management
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div>
              <p className="font-semibold text-sm">Database Backup</p>
              <p className="text-xs text-muted-foreground">Last backup: Today, 2:00 AM</p>
            </div>
            <Button size="sm" onClick={() => setBackupDialogOpen(true)}>
              <Download className="h-4 w-4" /> Backup Now
            </Button>
          </div>
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div>
              <p className="font-semibold text-sm">Export All Data</p>
              <p className="text-xs text-muted-foreground">Download complete school data as CSV</p>
            </div>
            <Button size="sm" variant="outline">
              <Download className="h-4 w-4" /> Export
            </Button>
          </div>
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div>
              <p className="font-semibold text-sm">Import Data</p>
              <p className="text-xs text-muted-foreground">Bulk import students, grades, or attendance</p>
            </div>
            <Button size="sm" variant="outline">
              <Upload className="h-4 w-4" /> Import
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Audit Log</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[
              { action: "Grade updated", user: "Ms. Aurora Aquino", time: "2 hours ago" },
              { action: "Student enrolled", user: "Ms. Registrar Cruz", time: "5 hours ago" },
              { action: "Settings changed", user: "Principal Reyes", time: "Yesterday" },
            ].map((log, idx) => (
              <div key={idx} className="flex items-center justify-between rounded-lg border bg-card p-3 text-sm">
                <div>
                  <p className="font-semibold">{log.action}</p>
                  <p className="text-xs text-muted-foreground">by {log.user}</p>
                </div>
                <p className="text-xs text-muted-foreground">{log.time}</p>
              </div>
            ))}
          </div>
          <Button variant="outline" size="sm" className="mt-3 w-full">
            View Full Audit Log
          </Button>
        </CardContent>
      </Card>

      <div className="flex items-center gap-3">
        <Button onClick={onSave} style={{ background: "var(--gradient-primary)" }}>
          <Save className="h-4 w-4" /> Save Security Settings
        </Button>
        {saved && (
          <span className="flex items-center gap-1.5 text-sm text-chart-2">
            <CheckCircle2 className="h-4 w-4" /> Settings saved.
          </span>
        )}
      </div>

      {/* Backup Dialog */}
      <Dialog open={backupDialogOpen} onOpenChange={setBackupDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Database Backup</DialogTitle>
            <DialogDescription>
              Generate a complete backup of all school data
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="rounded-lg border border-chart-1/30 bg-chart-1/10 p-4">
              <p className="text-sm font-semibold text-chart-1">Backup includes:</p>
              <ul className="mt-2 space-y-1 text-xs text-chart-1">
                <li>• All student records and LRNs</li>
                <li>• Grades and attendance data</li>
                <li>• User accounts and permissions</li>
                <li>• School settings and calendar</li>
                <li>• Notification history</li>
              </ul>
            </div>
            <p className="text-sm text-muted-foreground">
              Backup will be encrypted and stored securely. You can restore from this backup at any time.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBackupDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => { toast.success("Backup created successfully"); setBackupDialogOpen(false); }}>
              <Download className="h-4 w-4" /> Create Backup
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
