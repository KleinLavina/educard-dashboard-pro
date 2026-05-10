import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Save, CheckCircle2, School, GraduationCap, Bell, Moon, Sun } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/page-header";
import { SCHOOL_NAME, SCHOOL_YEAR } from "@/lib/school-data";
import { useTheme } from "@/lib/theme-context";
import { useRole } from "@/lib/role-context";

export const Route = createFileRoute("/settings")({
  component: SettingsPage,
  head: () => ({ meta: [{ title: `Settings — ${SCHOOL_NAME} (EduCard Pro)` }] }),
});

type Tab = "school" | "grading" | "notifications" | "appearance";

function SettingsPage() {
  const { role } = useRole();
  const [tab, setTab] = useState<Tab>("school");
  const [saved, setSaved] = useState<Tab | null>(null);

  function save(t: Tab) {
    setSaved(t);
    setTimeout(() => setSaved(null), 2500);
  }

  const tabs: { id: Tab; label: string; icon: React.ElementType }[] = [
    { id: "school", label: "School Info", icon: School },
    { id: "grading", label: "Grading", icon: GraduationCap },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "appearance", label: "Appearance", icon: Moon },
  ];

  return (
    <>
      <PageHeader title="Settings" subtitle={`${SCHOOL_NAME} · EduCard Pro`} />
      <main className="space-y-6 p-4 sm:p-6">
        {/* Tab bar */}
        <div className="flex flex-wrap gap-2">
          {tabs.map((t) => (
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
        {tab === "school" && (
          <SchoolInfoTab onSave={() => save("school")} saved={saved === "school"} />
        )}

        {/* Grading Formula */}
        {tab === "grading" && (
          <GradingTab onSave={() => save("grading")} saved={saved === "grading"} role={role} />
        )}

        {/* Notifications */}
        {tab === "notifications" && (
          <NotificationsTab onSave={() => save("notifications")} saved={saved === "notifications"} />
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
