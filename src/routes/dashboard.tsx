import { createFileRoute } from "@tanstack/react-router";
import { useRole } from "@/lib/role-context";
import { AdminView } from "@/components/views/admin-view";
import { TeacherView } from "@/components/views/teacher-view";
import { StudentView } from "@/components/views/student-view";
import { ParentView } from "@/components/views/parent-view";
import { SCHOOL_NAME } from "@/lib/school-data";

export const Route = createFileRoute("/dashboard")({
  component: DashboardPage,
  head: () => ({
    meta: [
      { title: `Dashboard — ${SCHOOL_NAME} (EduCard Pro)` },
      { name: "description", content: "Role-based school management dashboard for EduCard Pro." },
    ],
  }),
});

function DashboardPage() {
  const { role } = useRole();

  if (role === "teacher") return <TeacherView />;
  if (role === "student") return <StudentView />;
  if (role === "parent") return <ParentView />;
  return <AdminView />; // Admin gets comprehensive view with all features
}
