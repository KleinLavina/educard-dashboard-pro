---
name: Parent dashboard API field mapping
description: Learner and Grade API fields differ from mock data shape used in parent views
---

**Learner API** (flat, snake_case) vs mock (nested `learner.*`):
- `child.learner.firstName` → `child.first_name`
- `child.learner.lrn` → `child.lrn`
- `child.learner.gpa` → `child.gpa` (number, not nullable)
- `child.learner.attendanceRate` → `child.attendance_rate` (number, not nullable)
- `child.sectionLabel` → `child.section_label` (string | null)
- `fullName(child.learner)` → `child.full_name`

**Grade API** is per-quarter-per-subject: each `Grade` record has `subject_name`, `quarter` (1–4), `computed_grade`. Must reduce into `Record<subject_name, {q1,q2,q3,q4}>` before displaying in a table.

**AttendanceRecord API** uses `time_in_morning` and `time_out_afternoon` (not `timeIn`/`timeOut`).

**ConductLog API** uses `item` (same as mock) and `recorded_by_name` (vs mock's `recordedBy`).

**TeacherContact API** uses `teacher_name`, `teacher_email`, `show_phone`, `show_email` (no `children` or `subject` filtering field).

**Why:** Backend scopes `GET /learners/` to authenticated parent's children via `LearnerParent` through-table — no client-side filtering needed, just call `useLearners()` and use results directly.
