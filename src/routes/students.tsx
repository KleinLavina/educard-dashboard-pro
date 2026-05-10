import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { allLearners, departments, fullName, SF2_TARGET } from "@/lib/school-data";

export const Route = createFileRoute("/students")({
  component: StudentsPage,
  head: () => ({
    meta: [
      { title: "Learners — EduCard Pro" },
      { name: "description", content: "Browse all enrolled learners by department, grade, and section." },
    ],
  }),
});

function StudentsPage() {
  const [dept, setDept] = useState<string>("ALL");
  const [grade, setGrade] = useState<string>("ALL");
  const [query, setQuery] = useState<string>("");

  const gradeOptions = useMemo(() => {
    const grades =
      dept === "ALL"
        ? departments.flatMap((d) => d.grades)
        : departments.find((d) => d.key === dept)?.grades ?? [];
    return grades.map((g) => g.label);
  }, [dept]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return allLearners.filter((l) => {
      if (dept !== "ALL" && l.department.key !== dept) return false;
      if (grade !== "ALL" && l.grade.label !== grade) return false;
      if (!q) return true;
      return (
        fullName(l.learner).toLowerCase().includes(q) ||
        l.learner.lrn.includes(q) ||
        l.sectionLabel.toLowerCase().includes(q)
      );
    });
  }, [dept, grade, query]);

  return (
    <>
      <PageHeader
        title="Learners"
        subtitle={`${allLearners.length} enrolled · ${departments.length} departments · 6 grade levels`}
      />
      <main className="space-y-6 p-4 sm:p-6">
        <Card>
          <CardHeader className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <CardTitle className="text-base">Learner Roster</CardTitle>
            <div className="flex flex-wrap gap-2">
              <Select value={dept} onValueChange={(v) => { setDept(v); setGrade("ALL"); }}>
                <SelectTrigger className="h-9 w-36">
                  <SelectValue placeholder="Department" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Departments</SelectItem>
                  <SelectItem value="JHS">Junior High School</SelectItem>
                  <SelectItem value="SHS">Senior High School</SelectItem>
                </SelectContent>
              </Select>
              <Select value={grade} onValueChange={setGrade}>
                <SelectTrigger className="h-9 w-32">
                  <SelectValue placeholder="Grade" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Grades</SelectItem>
                  {gradeOptions.map((g) => (
                    <SelectItem key={g} value={g}>{g}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search name, LRN, section"
                  className="h-9 w-56 pl-8"
                />
              </div>
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4" /> More
              </Button>
              <Button size="sm" style={{ background: "var(--gradient-primary)" }}>
                <UserPlus className="h-4 w-4" /> Enroll
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
                    <TableHead className="text-right">Attend.</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((l) => {
                    const below = l.learner.attendanceRate < SF2_TARGET;
                    return (
                      <TableRow key={l.learner.lrn}>
                        <TableCell className="font-mono text-xs text-muted-foreground">
                          {l.learner.lrn}
                        </TableCell>
                        <TableCell className="font-medium">{fullName(l.learner)}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{l.department.key}</Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground">{l.sectionLabel}</TableCell>
                        <TableCell className="text-muted-foreground">{l.section.adviser}</TableCell>
                        <TableCell className="text-right font-semibold">{l.learner.gpa}</TableCell>
                        <TableCell className={`text-right font-medium ${below ? "text-destructive" : ""}`}>
                          {l.learner.attendanceRate.toFixed(1)}%
                        </TableCell>
                        <TableCell>
                          <Badge variant={l.status === "At Risk" ? "destructive" : "secondary"}>
                            {l.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  {filtered.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center text-sm text-muted-foreground">
                        No learners match the selected filters.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </main>
    </>
  );
}
