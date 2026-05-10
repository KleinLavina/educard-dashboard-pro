import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  AlertTriangle, Bell, CheckCircle2, Info, X, BookOpen, CalendarCheck,
  Star, MessageCircle, GraduationCap, Shield, Send, History, Settings,
  Search, Filter, Clock, CheckCheck, XCircle, Users, Mail, Smartphone,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/page-header";
import { SCHOOL_NAME, SCHOOL_YEAR, notificationHistory, parentProfiles, allLearners, fullName } from "@/lib/school-data";
import { useRole } from "@/lib/role-context";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";

export const Route = createFileRoute("/alerts")({
  component: AlertsPage,
  head: () => ({ meta: [{ title: `Alerts — ${SCHOOL_NAME} (EduCard Pro)` }] }),
});

type AlertTone = "warn" | "info" | "ok" | "critical";

interface AlertItem {
  id: number;
  icon: React.ElementType;
  title: string;
  text: string;
  time: string;
  tone: AlertTone;
  tag: string;
}

const PRINCIPAL_ALERTS: AlertItem[] = [
  { id: 1, icon: AlertTriangle, title: "9 sections below SF2 target", text: "Sections in Grade 8 and Grade 12 HUMSS are tracking below the 95% DepEd SF2 attendance target. Advisers notified.", time: "Today, 8:00 AM", tone: "critical", tag: "SF2" },
  { id: 2, icon: AlertTriangle, title: "6 learners with chronic absences", text: "Marco Reyes (G7), Mikael Cortes (G8), and 4 others have been flagged for chronic absenteeism this quarter.", time: "Today, 7:45 AM", tone: "warn", tag: "Attendance" },
  { id: 3, icon: Bell, title: "SF2 submission deadline — May 15", text: "Division Office requires all SF2 reports submitted no later than May 15, 2026. 3 sections have not yet confirmed.", time: "Yesterday", tone: "info", tag: "Deadline" },
  { id: 4, icon: Bell, title: "2 LRN reprint requests pending", text: "Ms. Aquino (G7 Sampaguita) and Mr. Lopez (G7 Rosal) submitted LRN reprint requests for 2 learners.", time: "Yesterday", tone: "info", tag: "ID Cards" },
  { id: 5, icon: CheckCircle2, title: "Grade 10 SF2 submitted", text: "Mr. Santos confirmed Grade 10 Charity SF2 report submitted. Attendance rate: 90.7%.", time: "2 days ago", tone: "ok", tag: "SF2" },
  { id: 6, icon: Shield, title: "System: SF2 batch export ready", text: "Quarterly SF2 batch PDF for all 12 sections is ready for download from the Registrar module.", time: "3 days ago", tone: "info", tag: "System" },
];

const TEACHER_ALERTS: AlertItem[] = [
  { id: 1, icon: AlertTriangle, title: "Carlo Villanueva — 2nd absent day", text: "Carlo P. Villanueva (LRN 136728140988) has been absent for 2 consecutive days. Parent notification sent via Messenger.", time: "Today", tone: "warn", tag: "Absence" },
  { id: 2, icon: CheckCircle2, title: "Math Q3 grades posted", text: "3rd Quarter Math grades for Grade 7 - Sampaguita have been posted. Class average: 89.0.", time: "2h ago", tone: "ok", tag: "Grades" },
  { id: 3, icon: CalendarCheck, title: "SF2 attendance submitted", text: "This week's SF2 attendance log has been submitted to the registrar for Grade 7 - Sampaguita.", time: "Yesterday", tone: "ok", tag: "SF2" },
  { id: 4, icon: Bell, title: "Grade submission deadline — May 20", text: "Reminder: 3rd Quarter final grades must be encoded by May 20, 2026.", time: "Yesterday", tone: "info", tag: "Deadline" },
  { id: 5, icon: BookOpen, title: "Science CSV import completed", text: "Bulk grade import from CSV for Science — 3rd Quarter completed successfully. 3 records updated.", time: "2 days ago", tone: "ok", tag: "Grades" },
];

const STUDENT_ALERTS: AlertItem[] = [
  { id: 1, icon: BookOpen, title: "Math Q3 grade posted — 92", text: "Ms. Aurora Aquino posted your 3rd Quarter Math grade: 92. You are On Track.", time: "2h ago", tone: "ok", tag: "Grade" },
  { id: 2, icon: CalendarCheck, title: "Attendance confirmed — May 10", text: "Your time-in was scanned at 7:38 AM today. Have a great school day!", time: "Today", tone: "ok", tag: "Attendance" },
  { id: 3, icon: Bell, title: "SF2 review — May 15", text: "Your adviser Ms. Aquino will review 3rd Quarter SF2 attendance on May 15. Your current rate: 96.4%.", time: "Yesterday", tone: "info", tag: "SF2" },
  { id: 4, icon: Star, title: "Ranked #1 in Filipino", text: "Congratulations! You ranked 1st in Filipino this quarter with a grade of 94.", time: "2 days ago", tone: "ok", tag: "Achievement" },
  { id: 5, icon: GraduationCap, title: "3rd Quarter report card available", text: "Your 3rd Quarter report card is now available for download. General average: 91.7.", time: "3 days ago", tone: "ok", tag: "Report Card" },
  { id: 6, icon: MessageCircle, title: "Message from Ms. Aquino", text: "Reminder: Science project is due this Friday, May 14. Submit via Google Classroom.", time: "3 days ago", tone: "info", tag: "Message" },
];

const toneConfig: Record<AlertTone, { bg: string; icon: string; badge: string }> = {
  critical: { bg: "bg-destructive/10 border-destructive/30", icon: "text-destructive", badge: "destructive" },
  warn: { bg: "bg-orange-500/5 border-orange-400/30", icon: "text-orange-500", badge: "outline" },
  ok: { bg: "bg-chart-2/5 border-chart-2/20", icon: "text-chart-2", badge: "secondary" },
  info: { bg: "bg-muted border-border/60", icon: "text-muted-foreground", badge: "outline" },
};

type TabFilter = "all" | "warn" | "ok" | "info";

function AlertFeed({ items }: { items: AlertItem[] }) {
  const [dismissed, setDismissed] = useState<Set<number>>(new Set());
  const [tab, setTab] = useState<TabFilter>("all");

  const visible = items.filter((a) => {
    if (dismissed.has(a.id)) return false;
    if (tab === "warn") return a.tone === "warn" || a.tone === "critical";
    if (tab === "ok") return a.tone === "ok";
    if (tab === "info") return a.tone === "info";
    return true;
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        {([["all", "All"], ["warn", "Warnings"], ["ok", "Updates"], ["info", "Reminders"]] as [TabFilter, string][]).map(([t, label]) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`rounded-full px-3 py-1 font-ui text-xs uppercase tracking-wider transition-colors ${
              tab === t ? "bg-primary text-primary-foreground" : "border bg-card text-muted-foreground hover:bg-muted"
            }`}
          >
            {label}
          </button>
        ))}
        {dismissed.size > 0 && (
          <button
            onClick={() => setDismissed(new Set())}
            className="ml-auto text-xs text-muted-foreground underline hover:text-foreground"
          >
            Restore {dismissed.size} dismissed
          </button>
        )}
      </div>

      <div className="space-y-3">
        {visible.map((a) => {
          const cfg = toneConfig[a.tone];
          return (
            <div key={a.id} className={`flex items-start gap-3 rounded-xl border p-4 ${cfg.bg}`}>
              <div className={`mt-0.5 shrink-0 ${cfg.icon}`}>
                <a.icon className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-sm font-semibold leading-snug">{a.title}</p>
                  <span className="rounded-full border px-2 py-0.5 font-ui text-[10px] uppercase tracking-wider text-muted-foreground">
                    {a.tag}
                  </span>
                </div>
                <p className="mt-1 text-sm text-muted-foreground leading-relaxed">{a.text}</p>
                <p className="mt-2 text-xs text-muted-foreground">{a.time}</p>
              </div>
              <button
                onClick={() => setDismissed((prev) => new Set(prev).add(a.id))}
                className="shrink-0 rounded-md p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                title="Dismiss"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          );
        })}
        {visible.length === 0 && (
          <div className="flex flex-col items-center gap-2 rounded-xl border bg-card py-12 text-center">
            <CheckCircle2 className="h-8 w-8 text-chart-2" />
            <p className="text-sm font-medium">All clear</p>
            <p className="text-xs text-muted-foreground">No alerts in this category.</p>
          </div>
        )}
      </div>
    </div>
  );
}

function AlertsPage() {
  const { role } = useRole();
  
  if (role === "principal") return <PrincipalAlerts />;
  if (role === "teacher") return <TeacherAlerts />;
  return <StudentAlerts />;
}

/* ─── Principal: Comprehensive Alert Management ─────────── */
function PrincipalAlerts() {
  const items = PRINCIPAL_ALERTS;
  const critCount = items.filter((a) => a.tone === "critical" || a.tone === "warn").length;
  const [notificationHistoryOpen, setNotificationHistoryOpen] = useState(false);
  const [sendAlertOpen, setSendAlertOpen] = useState(false);
  const [alertSettingsOpen, setAlertSettingsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <>
      <PageHeader
        title="Alerts & Notifications"
        subtitle={`${SCHOOL_NAME} · SY ${SCHOOL_YEAR}`}
      />
      <main className="space-y-6 p-4 sm:p-6">
        <section className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {[
            { label: "Total Alerts", value: items.length, accent: "text-foreground" },
            { label: "Action Needed", value: critCount, accent: critCount > 0 ? "text-destructive" : "text-chart-2" },
            { label: "Updates", value: items.filter(a => a.tone === "ok").length, accent: "text-chart-2" },
            { label: "Notifications Sent", value: notificationHistory.length, accent: "text-chart-1" },
          ].map((m) => (
            <Card key={m.label} className="border-border/60">
              <CardContent className="p-5">
                <p className="font-ui text-xs font-medium uppercase tracking-wide text-muted-foreground">{m.label}</p>
                <p className={`mt-1 text-2xl font-semibold ${m.accent}`}>{m.value}</p>
              </CardContent>
            </Card>
          ))}
        </section>

        {/* Parent Notification Status */}
        <Card>
          <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="text-base">Parent Notification Status</CardTitle>
              <p className="text-xs text-muted-foreground">Recent notifications sent to parents</p>
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={() => setNotificationHistoryOpen(true)}>
                <History className="h-4 w-4" /> Full History
              </Button>
              <Button size="sm" onClick={() => setSendAlertOpen(true)}>
                <Send className="h-4 w-4" /> Send Alert
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {notificationHistory.slice(0, 5).map((notif) => {
                const parent = parentProfiles.find(p => p.id === notif.parentId);
                return (
                  <div key={notif.id} className="flex items-start gap-3 rounded-lg border bg-card p-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-muted">
                      {notif.channel === "messenger" ? <MessageCircle className="h-5 w-5" /> : <Smartphone className="h-5 w-5" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-sm">{parent?.name || "Unknown Parent"}</p>
                        <Badge variant={notif.status === "sent" ? "default" : notif.status === "failed" ? "destructive" : "outline"} className="text-xs">
                          {notif.status === "sent" ? <CheckCheck className="mr-1 h-3 w-3" /> : notif.status === "failed" ? <XCircle className="mr-1 h-3 w-3" /> : <Clock className="mr-1 h-3 w-3" />}
                          {notif.status}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {notif.channel === "messenger" ? <MessageCircle className="mr-1 h-3 w-3" /> : <Smartphone className="mr-1 h-3 w-3" />}
                          {notif.channel}
                        </Badge>
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground">{notif.message}</p>
                      <p className="mt-1 text-xs text-muted-foreground">{notif.sentAt}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="text-base">School Alerts Feed</CardTitle>
              <p className="text-xs text-muted-foreground">System-wide alerts and notifications</p>
            </div>
            <div className="flex gap-2">
              <div className="relative">
                <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search alerts..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-8 w-40 pl-8 text-sm"
                />
              </div>
              <Button variant="outline" size="sm" onClick={() => setAlertSettingsOpen(true)}>
                <Settings className="h-4 w-4" /> Settings
              </Button>
              <Button variant="outline" size="sm">
                <CheckCheck className="h-4 w-4" /> Mark all read
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <AlertFeed items={items.filter(item => 
              searchQuery === "" || 
              item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
              item.text.toLowerCase().includes(searchQuery.toLowerCase())
            )} />
          </CardContent>
        </Card>
      </main>

      {/* Notification History Sheet */}
      <Sheet open={notificationHistoryOpen} onOpenChange={setNotificationHistoryOpen}>
        <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Notification History</SheetTitle>
            <SheetDescription>
              Complete history of all parent notifications
            </SheetDescription>
          </SheetHeader>
          <div className="mt-6 space-y-3">
            {notificationHistory.map((notif) => {
              const parent = parentProfiles.find(p => p.id === notif.parentId);
              return (
                <Card key={notif.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-muted">
                        {notif.channel === "messenger" ? <MessageCircle className="h-5 w-5" /> : <Smartphone className="h-5 w-5" />}
                      </div>
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-semibold text-sm">{parent?.name || "Unknown Parent"}</p>
                          <Badge variant={notif.status === "sent" ? "default" : notif.status === "failed" ? "destructive" : "outline"} className="text-xs">
                            {notif.status}
                          </Badge>
                          <Badge variant="outline" className="text-xs">{notif.channel}</Badge>
                          <Badge variant="secondary" className="text-xs">{notif.triggeredBy.replace(/_/g, " ")}</Badge>
                        </div>
                        <p className="mt-2 text-sm text-muted-foreground">{notif.message}</p>
                        <p className="mt-2 text-xs text-muted-foreground">Sent: {notif.sentAt}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </SheetContent>
      </Sheet>

      {/* Send Alert Dialog */}
      <SendAlertDialog open={sendAlertOpen} onOpenChange={setSendAlertOpen} />

      {/* Alert Settings Dialog */}
      <AlertSettingsDialog open={alertSettingsOpen} onOpenChange={setAlertSettingsOpen} />
    </>
  );
}

/* ─── Teacher: Alert Management ─────────────────────────── */
function TeacherAlerts() {
  const items = TEACHER_ALERTS;
  const critCount = items.filter((a) => a.tone === "critical" || a.tone === "warn").length;
  const [sendAlertOpen, setSendAlertOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <>
      <PageHeader
        title="Alerts & Notifications"
        subtitle={`Grade 7 - Sampaguita · Ms. Aurora Aquino · SY ${SCHOOL_YEAR}`}
      />
      <main className="space-y-6 p-4 sm:p-6">
        <section className="grid grid-cols-3 gap-4">
          {[
            { label: "Total", value: items.length, accent: "text-foreground" },
            { label: "Action Needed", value: critCount, accent: critCount > 0 ? "text-destructive" : "text-chart-2" },
            { label: "Updates", value: items.filter(a => a.tone === "ok").length, accent: "text-chart-2" },
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
              <CardTitle className="text-base">Class Alerts</CardTitle>
              <p className="text-xs text-muted-foreground">Alerts for your section</p>
            </div>
            <div className="flex gap-2">
              <div className="relative">
                <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search alerts..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-8 w-40 pl-8 text-sm"
                />
              </div>
              <Button size="sm" onClick={() => setSendAlertOpen(true)}>
                <Send className="h-4 w-4" /> Send to Parents
              </Button>
              <Button variant="outline" size="sm">
                <CheckCheck className="h-4 w-4" /> Mark all read
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <AlertFeed items={items.filter(item => 
              searchQuery === "" || 
              item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
              item.text.toLowerCase().includes(searchQuery.toLowerCase())
            )} />
          </CardContent>
        </Card>
      </main>

      {/* Send Alert Dialog */}
      <SendAlertDialog open={sendAlertOpen} onOpenChange={setSendAlertOpen} />
    </>
  );
}

/* ─── Student: Notifications ────────────────────────────── */
function StudentAlerts() {
  const items = STUDENT_ALERTS;
  const [searchQuery, setSearchQuery] = useState("");
  const [notificationSettingsOpen, setNotificationSettingsOpen] = useState(false);

  return (
    <>
      <PageHeader
        title="Notifications"
        subtitle={`${SCHOOL_NAME} · SY ${SCHOOL_YEAR}`}
      />
      <main className="space-y-6 p-4 sm:p-6">
        <section className="grid grid-cols-3 gap-4">
          {[
            { label: "Total", value: items.length, accent: "text-foreground" },
            { label: "Unread", value: items.filter(a => a.tone === "warn" || a.tone === "critical").length, accent: "text-chart-1" },
            { label: "Updates", value: items.filter(a => a.tone === "ok").length, accent: "text-chart-2" },
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
              <CardTitle className="text-base">Your Notifications</CardTitle>
              <p className="text-xs text-muted-foreground">Updates from your teachers and school</p>
            </div>
            <div className="flex gap-2">
              <div className="relative">
                <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-8 w-40 pl-8 text-sm"
                />
              </div>
              <Button variant="outline" size="sm" onClick={() => setNotificationSettingsOpen(true)}>
                <Settings className="h-4 w-4" /> Settings
              </Button>
              <Button variant="outline" size="sm">
                <CheckCheck className="h-4 w-4" /> Mark all read
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <AlertFeed items={items.filter(item => 
              searchQuery === "" || 
              item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
              item.text.toLowerCase().includes(searchQuery.toLowerCase())
            )} />
          </CardContent>
        </Card>
      </main>

      {/* Notification Settings Dialog */}
      <NotificationSettingsDialog open={notificationSettingsOpen} onOpenChange={setNotificationSettingsOpen} />
    </>
  );
}

/* ─── Send Alert Dialog Component ───────────────────────── */
function SendAlertDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const [recipient, setRecipient] = useState("");
  const [channel, setChannel] = useState("messenger");
  const [message, setMessage] = useState("");

  function handleSend() {
    if (!recipient || !message.trim()) {
      toast.error("Please select recipient and enter message");
      return;
    }
    toast.success(`Alert sent via ${channel} to ${recipient}`);
    onOpenChange(false);
    setRecipient("");
    setMessage("");
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Send Alert to Parents</DialogTitle>
          <DialogDescription>
            Send a notification to parents via Messenger or SMS
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Recipient</Label>
            <Select value={recipient} onValueChange={setRecipient}>
              <SelectTrigger>
                <SelectValue placeholder="Select parent or group..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Parents (Section)</SelectItem>
                <SelectItem value="at-risk">Parents of At-Risk Students</SelectItem>
                {parentProfiles.map(parent => (
                  <SelectItem key={parent.id} value={parent.id}>
                    {parent.name} ({parent.linkedLrns.length} {parent.linkedLrns.length === 1 ? "child" : "children"})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Channel</Label>
            <Select value={channel} onValueChange={setChannel}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="messenger">
                  <div className="flex items-center gap-2">
                    <MessageCircle className="h-4 w-4" />
                    <span>Messenger (Preferred)</span>
                  </div>
                </SelectItem>
                <SelectItem value="sms">
                  <div className="flex items-center gap-2">
                    <Smartphone className="h-4 w-4" />
                    <span>SMS (Fallback)</span>
                  </div>
                </SelectItem>
                <SelectItem value="both">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    <span>Both Channels</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Message</Label>
            <Textarea
              placeholder="Enter your message to parents..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={5}
            />
            <p className="text-xs text-muted-foreground">
              {message.length} / 500 characters
            </p>
          </div>
          <div className="rounded-lg border border-chart-1/30 bg-chart-1/10 p-3 text-sm">
            <div className="flex gap-2">
              <Info className="h-4 w-4 shrink-0 mt-0.5 text-chart-1" />
              <div className="text-chart-1">
                <p className="font-semibold">Notification Preview</p>
                <p className="mt-1 text-xs">Parents will receive this message via {channel === "both" ? "Messenger and SMS" : channel}.</p>
              </div>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSend}>
            <Send className="h-4 w-4" /> Send Alert
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ─── Alert Settings Dialog Component ───────────────────── */
function AlertSettingsDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const [autoNotifyAbsence, setAutoNotifyAbsence] = useState(true);
  const [autoNotifyGrades, setAutoNotifyGrades] = useState(true);
  const [autoNotifySF2, setAutoNotifySF2] = useState(true);
  const [absenceThreshold, setAbsenceThreshold] = useState("3");

  function handleSave() {
    toast.success("Alert settings saved successfully");
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Alert Settings</DialogTitle>
          <DialogDescription>
            Configure automatic alert triggers and notification preferences
          </DialogDescription>
        </DialogHeader>
        <Tabs defaultValue="triggers" className="mt-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="triggers">Alert Triggers</TabsTrigger>
            <TabsTrigger value="channels">Channels</TabsTrigger>
          </TabsList>
          <TabsContent value="triggers" className="space-y-4 py-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between rounded-lg border p-4">
                <div className="flex-1">
                  <p className="font-semibold text-sm">Absence Alerts</p>
                  <p className="text-xs text-muted-foreground">Notify parents when student is absent</p>
                </div>
                <Switch checked={autoNotifyAbsence} onCheckedChange={setAutoNotifyAbsence} />
              </div>
              {autoNotifyAbsence && (
                <div className="ml-4 space-y-2">
                  <Label>Consecutive Absence Threshold</Label>
                  <Select value={absenceThreshold} onValueChange={setAbsenceThreshold}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 day (immediate)</SelectItem>
                      <SelectItem value="2">2 consecutive days</SelectItem>
                      <SelectItem value="3">3 consecutive days</SelectItem>
                      <SelectItem value="5">5 consecutive days</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
              <div className="flex items-center justify-between rounded-lg border p-4">
                <div className="flex-1">
                  <p className="font-semibold text-sm">Grade Posted Alerts</p>
                  <p className="text-xs text-muted-foreground">Notify parents when grades are posted</p>
                </div>
                <Switch checked={autoNotifyGrades} onCheckedChange={setAutoNotifyGrades} />
              </div>
              <div className="flex items-center justify-between rounded-lg border p-4">
                <div className="flex-1">
                  <p className="font-semibold text-sm">SF2 Compliance Alerts</p>
                  <p className="text-xs text-muted-foreground">Alert when attendance falls below SF2 target</p>
                </div>
                <Switch checked={autoNotifySF2} onCheckedChange={setAutoNotifySF2} />
              </div>
            </div>
          </TabsContent>
          <TabsContent value="channels" className="space-y-4 py-4">
            <div className="space-y-4">
              <div className="rounded-lg border p-4">
                <div className="flex items-center gap-2 mb-3">
                  <MessageCircle className="h-5 w-5 text-chart-1" />
                  <p className="font-semibold">Messenger</p>
                  <Badge variant="default" className="ml-auto">Primary</Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  {parentProfiles.filter(p => p.messengerLinked).length} of {parentProfiles.length} parents connected
                </p>
              </div>
              <div className="rounded-lg border p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Smartphone className="h-5 w-5 text-chart-2" />
                  <p className="font-semibold">SMS</p>
                  <Badge variant="secondary" className="ml-auto">Fallback</Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  {parentProfiles.filter(p => p.smsEnabled).length} of {parentProfiles.length} parents enabled
                </p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            Save Settings
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ─── Notification Settings Dialog (Student) ────────────── */
function NotificationSettingsDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const [emailNotif, setEmailNotif] = useState(true);
  const [gradeNotif, setGradeNotif] = useState(true);
  const [attendanceNotif, setAttendanceNotif] = useState(true);
  const [messageNotif, setMessageNotif] = useState(true);

  function handleSave() {
    toast.success("Notification preferences saved");
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Notification Settings</DialogTitle>
          <DialogDescription>
            Choose which notifications you want to receive
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="flex-1">
              <p className="font-semibold text-sm">Email Notifications</p>
              <p className="text-xs text-muted-foreground">Receive notifications via email</p>
            </div>
            <Switch checked={emailNotif} onCheckedChange={setEmailNotif} />
          </div>
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="flex-1">
              <p className="font-semibold text-sm">Grade Updates</p>
              <p className="text-xs text-muted-foreground">When teachers post new grades</p>
            </div>
            <Switch checked={gradeNotif} onCheckedChange={setGradeNotif} />
          </div>
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="flex-1">
              <p className="font-semibold text-sm">Attendance Confirmations</p>
              <p className="text-xs text-muted-foreground">Daily attendance scan confirmations</p>
            </div>
            <Switch checked={attendanceNotif} onCheckedChange={setAttendanceNotif} />
          </div>
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="flex-1">
              <p className="font-semibold text-sm">Teacher Messages</p>
              <p className="text-xs text-muted-foreground">Messages from your teachers</p>
            </div>
            <Switch checked={messageNotif} onCheckedChange={setMessageNotif} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            Save Preferences
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
