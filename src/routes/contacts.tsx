import { createFileRoute } from "@tanstack/react-router";
import { useRole } from "@/lib/role-context";
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
import { SCHOOL_NAME, SCHOOL_YEAR, fullName, allLearners } from "@/lib/school-data";

export const Route = createFileRoute("/contacts")({
  component: ContactsPage,
  head: () => ({
    meta: [
      { title: `Contacts — ${SCHOOL_NAME} (EduCard Pro)` },
      { name: "description", content: "Teacher and parent contact information" },
    ],
  }),
});

// Mock data for parent's children
const myChildren = [
  allLearners.find((l) => l.learner.lrn === "136728140987")!, // Juan
  allLearners.find((l) => l.learner.lrn === "136728140989")!, // Bea
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
  {
    teacher: "Mr. Roberto Santos",
    subject: "Grade 7 - Science",
    role: "Science Teacher",
    phone: "+63 918 234 5678",
    messenger: "roberto.santos",
    facebook: "roberto.santos.teacher",
    email: "r.santos@stmarys.edu.ph",
    children: ["Juan", "Bea"],
  },
  {
    teacher: "Ms. Elena Reyes",
    subject: "Grade 7 - English",
    role: "English Teacher",
    phone: "+63 919 345 6789",
    messenger: "elena.reyes",
    facebook: "elena.reyes.teacher",
    email: "e.reyes@stmarys.edu.ph",
    children: ["Juan", "Bea"],
  },
];

// Mock parent contacts for teachers to view
const parentContacts = [
  {
    parent: "Maria Dela Cruz",
    children: ["Juan M. Dela Cruz", "Bea M. Dela Cruz"],
    section: "Grade 7 - Sampaguita",
    phone: "+63 920 456 7890",
    messenger: "maria.delacruz",
    facebook: "maria.delacruz.parent",
    email: "maria.delacruz@gmail.com",
  },
  {
    parent: "Jose Reyes",
    children: ["Sofia Reyes"],
    section: "Grade 7 - Sampaguita",
    phone: "+63 921 567 8901",
    messenger: "jose.reyes",
    facebook: "jose.reyes.parent",
    email: "jose.reyes@gmail.com",
  },
  {
    parent: "Ana Santos",
    children: ["Miguel Santos"],
    section: "Grade 7 - Sampaguita",
    phone: "+63 922 678 9012",
    messenger: "ana.santos",
    facebook: "ana.santos.parent",
    email: "ana.santos@gmail.com",
  },
];

function ContactsPage() {
  const { role } = useRole();

  const handleCopyContact = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard`, {
      description: text,
    });
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
                      {teacher.children.map((child) => (
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
                </CardContent>
              </Card>
            ))}
          </div>
        </main>
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
                        <p className="font-ui text-[10px] uppercase tracking-wide text-muted-foreground">
                          Email Address
                        </p>
                        <p className="truncate text-sm font-medium">{parent.email}</p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleCopyContact(parent.email, "Email address")}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </main>
      </>
    );
  }

  // Default view for other roles
  return (
    <>
      <PageHeader title="Contacts" subtitle={`${SCHOOL_NAME} · SY ${SCHOOL_YEAR}`} />
      <main className="p-4 sm:p-6">
        <Card>
          <CardContent className="flex items-center justify-center p-12">
            <p className="text-muted-foreground">Contact information not available for this role.</p>
          </CardContent>
        </Card>
      </main>
    </>
  );
}
