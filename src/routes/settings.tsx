import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/settings")({
  component: SettingsPage,
  head: () => ({
    meta: [
      { title: "Settings — EduCard Pro" },
      { name: "description", content: "School and account preferences." },
    ],
  }),
});

function SettingsPage() {
  return (
    <>
      <PageHeader title="Settings" subtitle="School profile and preferences" />
      <main className="space-y-6 p-4 sm:p-6 max-w-3xl">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">School Profile</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="school">School name</Label>
              <Input id="school" defaultValue="St. Mary's Academy" />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="year">School year</Label>
                <Input id="year" defaultValue="2025–2026" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="quarter">Current quarter</Label>
                <Input id="quarter" defaultValue="3rd Quarter" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Notifications</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { id: "absent", label: "Absence alerts", desc: "Notify when a student is absent 3+ days" },
              { id: "grade", label: "Grade disputes", desc: "Email principal on dispute requests" },
              { id: "print", label: "Print queue ready", desc: "Notify when ID/report batch is ready" },
            ].map((s) => (
              <div key={s.id} className="flex items-center justify-between gap-4">
                <div>
                  <Label htmlFor={s.id} className="text-sm">{s.label}</Label>
                  <p className="text-xs text-muted-foreground">{s.desc}</p>
                </div>
                <Switch id={s.id} defaultChecked />
              </div>
            ))}
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button style={{ background: "var(--gradient-primary)" }}>Save changes</Button>
        </div>
      </main>
    </>
  );
}
