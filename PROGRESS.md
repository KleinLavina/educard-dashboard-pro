# EduCard Pro — Project Progress Tracker
**Philippine DepEd K-12 School Management System**
*Last updated: June 2, 2026*

---

## Overview

| Area | Status |
|---|---|
| Backend API + Database | ✅ Done |
| Real Login (JWT, role-based routing) | ✅ Done |
| Teacher Grade Saving (live DB) | ✅ Done |
| Frontend wired to live API (all pages) | 🔄 In Progress |
| Student & Parent portals (live data) | ⏳ Not Started |
| PDF Report Cards & ID Cards | ⏳ Not Started |
| Parent Notifications (Messenger / SMS) | ⏳ Not Started |
| Multi-school / Multi-tenant support | ⏳ Not Started |

---

## Completed Tasks

### ✅ Task 1 — Backend: Seed Database & Fix API Endpoints
**What was done:**
- Created `seed_db` management command populating 31 learners, 12 sections, 104 subjects, 96 grades, attendance records, conduct logs, ID-card queue items
- Fixed CORS configuration for Replit proxy domains (`*.replit.dev`, `*.repl.co`)
- Added missing viewset actions: graduation candidates/alumni/confirm, tasks/complete, messages/unread_count
- Installed `django-filter` and wired `DashboardView` at `/api/dashboard/stats/`
- All key endpoints return real data; no more silent empty-response fallbacks

**Key files:** `educard-BACKEND/core/management/commands/seed_db.py`, `educard-BACKEND/core/views.py`, `educard-BACKEND/educard/settings.py`

---

### ✅ Task 3 — Frontend: Wire Core Pages to Live API
**What was done:**
- Added `VITE_API_URL=/api` and Vite proxy so all `/api/...` calls reach Django on port 8000
- Built `login.tsx` — JWT login form that stores access + refresh tokens in localStorage
- Grades page: Principal/admin overview reads from `/api/sections/` and `/api/grades/`
- Attendance page: reads from `/api/attendance/`
- ID Cards page: reads from `/api/id-queue/`
- All pages use React Query hooks from `use-api.ts` with 30-second stale time

**Key files:** `educard-FRONTEND/src/routes/login.tsx`, `educard-FRONTEND/src/lib/api.ts`, `educard-FRONTEND/src/lib/use-api.ts`

---

### ✅ Task 4 — Real Login: Each Role Sees the Right Views
**What was done:**
- JWT login flow fully implemented with auto-refresh on 401
- Role-based routing: `admin` → Principal/Admin view, `teacher` → Teacher view, `student` → Student view, `parent` → Parent view
- Protected routes redirect to `/login` when no valid token
- Demo accounts: `admin/admin123`, `aurora.aquino/teacher123` (and 13 other teacher accounts)

**Key files:** `educard-FRONTEND/src/lib/role-context.tsx`, `educard-FRONTEND/src/routes/login.tsx`

---

### ✅ Task 5 — Teacher Grade Entry Saves to the Database
**What was done:**
- Added `learner__section` filter to `GradeViewSet` so grades can be fetched for a whole section in one call
- Updated `api.ts`: `grades.list()` accepts a `section` param (maps to `learner__section` query param)
- Added `useSubjects(sectionId)` and `useGradesBySection(sectionId)` React Query hooks
- Rewrote `TeacherGradeBook` component:
  - Loads real sections, learners, subjects, and grades from the API
  - Builds a grade map `{ learnerId → subjectId → quarter → Grade }`
  - "Edit Q3" mode: input cells for each learner × subject cell
  - Save: diffs only changed cells, calls `PATCH /api/grades/{id}/` (or `POST` for new records)
  - Backend auto-computes `computed_grade` from component scores (weights sum to 100%)
  - Toast confirmation on save; Cancel reverts without touching the DB

**Key files:** `educard-FRONTEND/src/routes/grades.tsx`, `educard-FRONTEND/src/lib/use-api.ts`, `educard-BACKEND/core/views.py`

---

## In Progress

### 🔄 Task 2 — Wire Remaining Pages to Live API (all pages)
**Goal:** Replace every remaining `school-data.ts` mock import with real API hooks across all route files.

**Pages remaining to wire:**
- [ ] **Attendance page** — roll-call form calls `useMarkAttendance()` mutation; section counts & overall rate from API
- [ ] **ID Cards page** — `allSections` / `allLearners` mock arrays → `useIDCardsPage()`; "Mark Printed" calls mutation
- [ ] **Alerts page** — notification history & prolonged-absences from `useAlertsPage()`
- [ ] **Reports page** — stats and chart data from API hooks (`useLearners`, `useSections`, `useGrades`, `useAttendanceToday`)
- [ ] **Contacts page** — teacher/parent lists from `useTeachers()` / `useParents()`
- [ ] **Student self-view (My Grades page)** — transcript reads real grades from `/api/learners/{id}/grades/`
- [ ] **Admin dashboard enrollment chart** — bar chart data from `useSections()` API response
- [ ] **School-wide grades overview** — section averages computed from API rather than mock `allLearners`

**Key files:** `educard-FRONTEND/src/routes/attendance.tsx`, `id-cards.tsx`, `alerts.tsx`, `reports.tsx`, `contacts.tsx`, `students.tsx`, `educard-FRONTEND/src/lib/use-*.ts`

---

## Queued / Not Started

### ⏳ Task #12 — Student Grades from Real Database on My Grades Page
Show the logged-in student's actual Q1/Q2/Q3 grade records (from the API) on the "My Grades" transcript page. Currently uses hardcoded `STUDENT_TRANSCRIPT` mock data.

**Files to change:** `educard-FRONTEND/src/routes/grades.tsx` (StudentTranscript function ~line 570)

---

### ⏳ Task #13 — Teacher Sees Their Assigned Section (not Always the First One)
The TeacherGradeBook currently loads whichever section is first in the database. It should load the section the logged-in teacher is actually assigned to (via `TeacherSectionAssignment` or `adviser` FK).

**Files to change:** `educard-FRONTEND/src/routes/grades.tsx`, `educard-FRONTEND/src/lib/use-api.ts`

---

### ⏳ Task #14 — Grade Input Cells Start Blank (Not Pre-filled with 85)
When a teacher opens "Edit Q3" for learners with no existing grade, inputs currently default to 85. They should start empty so teachers only save grades they explicitly type. Also prevents bulk-creating unwanted DB records on Save.

**Files to change:** `educard-FRONTEND/src/routes/grades.tsx` (enterEditMode + handleSave functions)

---

### ⏳ Future: PDF Report Cards & DepEd SF Forms
Generate DepEd-compliant PDF report cards and SF1/SF2 forms per section/learner.

---

### ⏳ Future: Parent Notifications (Messenger + SMS)
Send automated alerts to parents via Meta Messenger API and Semaphore SMS when a learner is absent, at risk, or has a low grade.

---

### ⏳ Future: Multi-School / Multi-Tenant Support
Subdomain routing and school onboarding so multiple schools can run on the same deployment, each with their own data.

---

## Architecture Quick Reference

```
educard-BACKEND/          Django 5.0.7 + DRF 3.17.1
  core/models.py          All DB models (User, Section, Learner, Grade, Attendance…)
  core/serializers.py     DRF serializers
  core/views.py           ViewSets + custom actions
  core/management/        seed_db command
  educard_backend/        settings, urls

educard-FRONTEND/         React 19 + TanStack Start + Vite 7
  src/routes/             One file per page (grades, attendance, id-cards…)
  src/lib/api.ts          Typed fetch wrapper for every endpoint
  src/lib/use-api.ts      React Query hooks (useGrades, useLearners…)
  src/lib/school-data.ts  Mock data (being phased out — only constants remain)
  src/lib/role-context.tsx Role detection from JWT payload
```

**Demo credentials:**
| Role | Username | Password |
|---|---|---|
| Admin / Registrar | `admin` | `admin123` |
| Teacher (Math) | `aurora.aquino` | `teacher123` |
| Teacher (Science) | `carmela.cruz` | `teacher123` |

**Run locally:**
```bash
# Backend
cd educard-BACKEND && python manage.py runserver localhost:8000

# Frontend
cd educard-FRONTEND && npm run dev

# Re-seed DB (safe to run multiple times)
cd educard-BACKEND && python manage.py seed_db
```
