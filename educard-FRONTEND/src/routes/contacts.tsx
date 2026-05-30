import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useRole } from "@/lib/role-context";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  GraduationCap,
  Phone,
  MessageCircle,
  Mail,
  Copy,
  Users,
  BookOpen,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/page-header";
import { toast } from "sonner";
import { 
  SCHOOL_NAME, 
  SCHOOL_YEAR, 
  teacherContacts, 
  parentContacts 
} from "@/lib/school-data";

export const Route = createFileRoute("/contacts")({
  component: ContactsPage,
  head: () => ({
    meta: [
      { title: `Contacts — ${SCHOOL_NAME} (EduCard Pro)` },
      { name: "description", content: "Teacher and parent contact information" },
    ],
  }),
});

function ContactsPage() {
  const { role } = useRole();
  const [messageOpen, setMessageOpen] = useState(false);
  const [selectedContact, setSelectedContact] = useState<{ name: string; role: string; channel: string } | null>(null);
  const [messageText, setMessageText] = useState("");
  const [messageChannel, setMessageChannel] = useState("messenger");

  const handleCopyContact = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard`, {
      description: text,
    });
  };

  const handleSendMessage = () => {
    if (!messageText.trim()) {
      toast.error("Please type a message first");
      return;
    }
    toast.success(`Message sent to ${selectedContact?.name}`, {
      description: `Sent via ${messageChannel === "messenger" ? "Facebook Messenger" : messageChannel === "sms" ? "SMS" : "Email"}`,
    });
    setMessageOpen(false);
    setMessageText("");
  };

  // Parent view - shows teacher contacts
  if (role === "parent") {
    return (
      <>
        <PageHeader
          title="Teacher Contacts"
          subtitle={`${SCHOOL_NAME} · SY ${SCHOOL_YEAR}`}
        />
        <main className="space-y-6 p-4 sm:p-6">
          <div className="rounded-lg border bg-card p-4">
            <p className="text-sm text-muted-foreground">
              <strong>Note:</strong> Contact your children's teachers directly through their preferred communication channel. 
              For urgent matters, please call. For general updates, Facebook Messenger is recommended (free and instant).
            </p>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            {teacherContacts.map((teacher, i) => (
              <Card key={i}>
                <CardHeader>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/10">
                        <GraduationCap className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-base">{teacher.teacher}</CardTitle>
                        <p className="text-xs text-muted-foreground">{teacher.role}</p>
                      </div>
                    </div>
                  </div>
                  <div className="mt-2">
                    <p className="text-sm text-muted-foreground">{teacher.subject}</p>
                    <div className="mt-2 flex flex-wrap gap-1">
                      {(teacher.children ?? []).map((child) => (
                        <Badge key={child} variant="outline" className="text-[10px]">
                          {child}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
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
                  {/* Send Message */}
                  <Button
                    className="w-full"
                    size="sm"
                    onClick={() => {
                      setSelectedContact({ name: teacher.teacher, role: teacher.role, channel: teacher.messenger });
                      setMessageChannel("messenger");
                      setMessageOpen(true);
                    }}
                  >
                    <MessageCircle className="mr-2 h-4 w-4" /> Send Message
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </main>

        <Dialog open={messageOpen} onOpenChange={setMessageOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Message {selectedContact?.name}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="rounded-lg border bg-muted/30 p-3 text-sm">
                <p className="text-xs text-muted-foreground">Recipient</p>
                <p className="font-semibold">{selectedContact?.name}</p>
                <p className="text-xs text-muted-foreground">{selectedContact?.role}</p>
              </div>
              <div className="space-y-2">
                <Label>Channel</Label>
                <select value={messageChannel} onChange={(e) => setMessageChannel(e.target.value)} className="w-full rounded-md border bg-background px-3 py-2 text-sm">
                  <option value="messenger">Facebook Messenger (free)</option>
                  <option value="sms">SMS (₱0.50/message)</option>
                  <option value="email">Email</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label>Message</Label>
                <Textarea value={messageText} onChange={(e) => setMessageText(e.target.value)} placeholder="Type your message here..." rows={4} />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => { setMessageOpen(false); setMessageText(""); }}>Cancel</Button>
              <Button onClick={handleSendMessage}>
                <MessageCircle className="mr-2 h-4 w-4" /> Send Message
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </>
    );
  }

  // Teacher view - shows parent contacts
  if (role === "teacher") {
    return (
      <>
        <PageHeader
          title="Parent Contacts"
          subtitle={`${SCHOOL_NAME} · SY ${SCHOOL_YEAR}`}
        />
        <main className="space-y-6 p-4 sm:p-6">
          <div className="rounded-lg border bg-card p-4">
            <p className="text-sm text-muted-foreground">
              <strong>Note:</strong> Contact parents directly for student updates, concerns, or parent-teacher conferences. 
              Facebook Messenger is the preferred channel for quick updates. For formal matters, use email.
            </p>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            {parentContacts.map((parent, i) => (
              <Card key={i}>
                <CardHeader>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/10">
                        <Users className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-base">{parent.parent}</CardTitle>
                        <p className="text-xs text-muted-foreground">Parent/Guardian</p>
                      </div>
                    </div>
                  </div>
                  <div className="mt-2">
                    <p className="text-sm text-muted-foreground">{parent.section}</p>
                    <div className="mt-2 space-y-1">
                      {parent.children.map((child) => (
                        <div key={child} className="flex items-center gap-2">
                          <BookOpen className="h-3 w-3 text-muted-foreground" />
                          <span className="text-xs">{child}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
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
                        <p className="text-sm font-medium">{parent.phone}</p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleCopyContact(parent.phone, "Phone number")}
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
                        <p className="text-sm font-medium">@{parent.messenger}</p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleCopyContact(parent.messenger, "Messenger username")}
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
                        <p className="font-ui text-[10px] uppercase tracking-wide text-muted-foreground">Email Address</p>
                        <p className="truncate text-sm font-medium">{parent.email}</p>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => handleCopyContact(parent.email, "Email address")}>
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                  {/* Send Message */}
                  <Button
                    className="w-full"
                    size="sm"
                    onClick={() => {
                      setSelectedContact({ name: parent.parent, role: "Parent/Guardian", channel: parent.messenger });
                      setMessageChannel("messenger");
                      setMessageOpen(true);
                    }}
                  >
                    <MessageCircle className="mr-2 h-4 w-4" /> Send Message
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </main>

        <Dialog open={messageOpen} onOpenChange={setMessageOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Message {selectedContact?.name}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="rounded-lg border bg-muted/30 p-3 text-sm">
                <p className="text-xs text-muted-foreground">Recipient</p>
                <p className="font-semibold">{selectedContact?.name}</p>
                <p className="text-xs text-muted-foreground">{selectedContact?.role}</p>
              </div>
              <div className="space-y-2">
                <Label>Channel</Label>
                <select value={messageChannel} onChange={(e) => setMessageChannel(e.target.value)} className="w-full rounded-md border bg-background px-3 py-2 text-sm">
                  <option value="messenger">Facebook Messenger (recommended)</option>
                  <option value="sms">SMS</option>
                  <option value="email">Email</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label>Message</Label>
                <Textarea value={messageText} onChange={(e) => setMessageText(e.target.value)} placeholder="Type your message here..." rows={4} />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => { setMessageOpen(false); setMessageText(""); }}>Cancel</Button>
              <Button onClick={handleSendMessage}>
                <MessageCircle className="mr-2 h-4 w-4" /> Send Message
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </>
    );
  }

  return (
    <>
      <PageHeader title="Contacts" subtitle={`${SCHOOL_NAME} · SY ${SCHOOL_YEAR}`} />
      <main className="p-4 sm:p-6">
        <p className="text-sm text-muted-foreground">Contacts are not available for this role.</p>
      </main>
    </>
  );
}
