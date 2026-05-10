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
  { lrn: "136728140987", name: "Juan M. Dela Cruz", dept: "JHS", grade: "Grade 7 — Sampaguita", adviser: "Ms. Aurora Aquino", gpa: 92, status: "On Track" },
  { lrn: "136728140312", name: "Maria L. Santos", dept: "JHS", grade: "Grade 7 — Rosal", adviser: "Mr. Benjie Lopez", gpa: 88, status: "On Track" },
  { lrn: "136728140211", name: "Jose A. Aguilar", dept: "JHS", grade: "Grade 9 — Bonifacio", adviser: "Mr. Felix Ramos", gpa: 74, status: "At Risk" },
  { lrn: "136728140145", name: "Andrea P. Mercado", dept: "JHS", grade: "Grade 10 — Del Pilar", adviser: "Mr. Hector Santos", gpa: 90, status: "On Track" },
  { lrn: "136728140098", name: "Marco T. Reyes", dept: "JHS", grade: "Grade 8 — Ilang-Ilang", adviser: "Mr. Dario Tan", gpa: 68, status: "At Risk" },
  { lrn: "136728140067", name: "Liza R. Bautista", dept: "SHS", grade: "Grade 11 — St. Jude (STEM)", adviser: "Ms. Imelda Villanueva", gpa: 94, status: "On Track" },
  { lrn: "136728140054", name: "Patricia D. Lim", dept: "SHS", grade: "Grade 12 — St. Francis (TVL-ICT)", adviser: "Mr. Lito Pascual", gpa: 86, status: "On Track" },
  { lrn: "136728140033", name: "Diego N. Aquino", dept: "SHS", grade: "Grade 11 — St. Therese (ABM)", adviser: "Mr. Joel Mercado", gpa: 79, status: "On Track" },
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
                    <TableHead>LRN</TableHead>
                    <TableHead>Learner Name</TableHead>
                    <TableHead>Dept</TableHead>
                    <TableHead>Grade & Section</TableHead>
                    <TableHead>Adviser</TableHead>
                    <TableHead className="text-right">GPA</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {students.map((s) => (
                    <TableRow key={s.lrn}>
                      <TableCell className="font-mono text-xs text-muted-foreground">{s.lrn}</TableCell>
                      <TableCell className="font-medium">{s.name}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{s.dept}</Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{s.grade}</TableCell>
                      <TableCell className="text-muted-foreground">{s.adviser}</TableCell>
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
