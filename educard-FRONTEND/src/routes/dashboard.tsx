import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useRole } from "@/lib/role-context";
import { AdminView } from "@/components/views/admin-view";
import { TeacherView } from "@/components/views/teacher-view";
import { StudentView } from "@/components/views/student-view";
import { ParentView } from "@/components/views/parent-view";
import { useDashboardStats } from "@/lib/use-api";
import { SCHOOL_NAME } from "@/lib/school-data";

export const Route = createFileRoute("/dashboard")({
  component: DashboardPage,
});

function DashboardPage() {
  const { role } = useRole();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Pre-fetch for admin/teacher roles only once mounted client-side
  useDashboardStats();

  // During SSR (server render), role defaults to "admin" because localStorage
  // isn't available. Rendering role-specific content server-side causes a React 19
  // hydration mismatch on the client. Show nothing until client hydration completes.
  if (!mounted) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-muted border-t-primary" />
          <p className="text-sm text-muted-foreground">Loading dashboard…</p>
        </div>
      </div>
    );
  }

  if (role === "teacher") return <TeacherView />;
  if (role === "student") return <StudentView />;
  if (role === "parent")  return <ParentView />;
  return <AdminView />;
}
