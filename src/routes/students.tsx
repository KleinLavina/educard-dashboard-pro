import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Search, UserPlus, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/students")({
  component: StudentsPage,
  head: () => ({
    meta: [
      { title: "Students — EduCard Pro" },
      { name: "description", content: "Browse and manage all enrolled students." },
    ],
  }),
});

const students = [
  { id: "2026-0487", name: "Juan Dela Cruz", grade: "G7 Sampaguita", gpa: 92, status: "On Track" },
  { id: "2026-0312", name: "Maria Santos", grade: "G8 Rosal", gpa: 88, status: "On Track" },
  { id: "2026-0211", name: "Jose Rizal", grade: "G9 Adelfa", gpa: 74, status: "At Risk" },
  { id: "2026-0145", name: "Andrea Mercado", grade: "G10 Ilang-Ilang", gpa: 90, status: "On Track" },
  { id: "2026-0098", name: "Marco Reyes", grade: "G7 Sampaguita", gpa: 68, status: "At Risk" },
  { id: "2026-0067", name: "Liza Bautista", grade: "G11 STEM", gpa: 94, status: "On Track" },
  { id: "2026-0054", name: "Patricia Lim", grade: "G10 Ilang-Ilang", gpa: 86, status: "On Track" },
  { id: "2026-0033", name: "Diego Aquino", grade: "G8 Rosal", gpa: 79, status: "On Track" },
];

function StudentsPage() {
  return (
    <>
      <PageHeader title="Students" subtitle="487 enrolled · 8 grade levels" />
      <main className="space-y-6 p-4 sm:p-6">
        <Card>
          <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle className="text-base">Student Roster</CardTitle>
            <div className="flex gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input placeholder="Search by name or ID" className="h-9 w-56 pl-8" />
              </div>
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4" /> Filter
              </Button>
              <Button size="sm" style={{ background: "var(--gradient-primary)" }}>
                <UserPlus className="h-4 w-4" /> Add
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Grade & Section</TableHead>
                    <TableHead className="text-right">GPA</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {students.map((s) => (
                    <TableRow key={s.id}>
                      <TableCell className="font-mono text-xs text-muted-foreground">{s.id}</TableCell>
                      <TableCell className="font-medium">{s.name}</TableCell>
                      <TableCell className="text-muted-foreground">{s.grade}</TableCell>
                      <TableCell className="text-right font-semibold">{s.gpa}</TableCell>
                      <TableCell>
                        <Badge variant={s.status === "At Risk" ? "destructive" : "secondary"}>
                          {s.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </main>
    </>
  );
}
