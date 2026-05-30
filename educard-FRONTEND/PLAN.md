# EduCard Pro — Development Plan

> Derived from the EduCardPro_Proposal.docx and aligned with the current dashboard prototype.

---

## 1. Current State

A frontend prototype (`tanstack_start_ts`) is already scaffolded with:
- **Stack**: React 19, TanStack Router + Start, Vite, Tailwind CSS 4, shadcn/ui, Recharts
- **Pages**: Dashboard, Students, Attendance, Grades, ID Cards, Alerts, Settings
- **Data**: Mock Philippine DepEd K-12 data (JHS 7-10, SHS 11-12, strands, LRNs, SF2 targets)
- **UI**: Principal/Registrar portal with sidebar, metric cards, charts, tables, and sample ID card previews

What is **missing** vs. the proposal:
- No backend API or real database
- No authentication or role-based access
- No multi-tenancy (multi-school isolation)
- No real-time attendance barcode scanning
- No Messenger / SMS notification pipeline
- No PDF report card / ID card generation
- No parent/student/teacher portals
- No enrollment workflow or photo upload
- No audit logs for grade changes
- No Super Admin billing panel

---

## 2. Architecture Decision

The proposal recommends **Next.js frontend + Laravel backend**.
The existing codebase is **TanStack Start (Vite-based full-stack React)**.

**Decision**: Keep the current TanStack Start stack for the frontend and build a dedicated backend API (Node.js/Express or Laravel) to match the proposal's backend requirements. TanStack Start can SSR pages and call the API via `server.ts` functions.

**Why**: Preserves the existing UI investment while giving us a clean API boundary for multi-tenancy, auth, and third-party integrations (Messenger, SMS, PDF).

---

## 3. Tech Stack (Updated)

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Frontend | TanStack Start + React 19 + Tailwind 4 + shadcn/ui | Dashboards, portals, UI |
| Backend API | Laravel (PHP) or Node/Express + TypeScript | API, auth, multi-tenancy |
| Database | PostgreSQL | Primary data store |
| File Storage | Cloudflare R2 | Student photos, ID templates |
| Auth | Laravel Sanctum / JWT or Clerk/Auth.js | RBAC, sessions |
| Multi-tenancy | `tenancy-for-laravel` (if Laravel) or row-level tenant IDs | School isolation |
| PDF Generation | Puppeteer / Playwright + HTML templates | Report cards, IDs |
| Barcode / QR | `jsbarcode` + `qrcode` | ID encoding, scanning |
| Notifications | Meta Cloud API (Messenger) + Semaphore (SMS) | Parent alerts |
| Email | Resend | Transactional email |
| Hosting | DigitalOcean VPS / Cloudflare Pages | App + static assets |
| Error Tracking | Sentry | Monitoring |

---

## 4. Database Schema (Core Tables)

```
tenants (schools)
  id, subdomain, name, logo_url, theme_colors, grading_formula, plan_tier,
  messenger_psid, sms_sender_name, created_at

users
  id, tenant_id, email, password_hash, role (super_admin|admin|teacher|student|parent),
  first_name, last_name, phone, messenger_psid, created_at

students
  id, tenant_id, lrn, first_name, middle_initial, last_name, photo_url,
  grade_level, section_id, strand, enrolled_at, status

sections
  id, tenant_id, name, strand, grade_level, adviser_id, max_capacity

attendance_logs
  id, tenant_id, student_id, date, status (present|absent|late|excused),
  scanned_by_user_id, scanned_at, method (barcode|manual)

grades
  id, tenant_id, student_id, subject, quarter, raw_score, total_score,
  grade_value, teacher_id, created_at, updated_at

grade_audit_logs
  id, tenant_id, grade_id, changed_by_user_id, old_value, new_value, reason, created_at

report_cards
  id, tenant_id, student_id, quarter, pdf_url, generated_at, generated_by

id_cards
  id, tenant_id, student_id, template_id, front_png_url, back_png_url, printed_at

notifications
  id, tenant_id, recipient_type, recipient_id, channel (messenger|sms|email),
  status, content, sent_at, error_message

audit_logs
  id, tenant_id, user_id, action, entity_type, entity_id, metadata, created_at
```

---

## 5. Feature Phases

### Phase 1 — Foundation (Weeks 1-2)
**Goal**: Replace mock data with a real API and database.

- [ ] Set up Laravel (or Node/Express) API project
- [ ] PostgreSQL database with migrations for core tables
- [ ] Multi-tenancy middleware (`subdomain → tenant_id`)
- [ ] Authentication: login, register, password reset, JWT/Sanctum tokens
- [ ] Role-based access control middleware
- [ ] Seed a single demo school with the current mock dataset
- [ ] Connect frontend to API via TanStack Query (`useQuery`, `useMutation`)
- [ ] Update `school-data.ts` to fetch from `/api/school/profile`, `/api/students`, etc.

**Deliverable**: Dashboard loads real data from API for 1 school.

---

### Phase 2 — Core School Operations (Weeks 3-4)
**Goal**: Student enrollment, attendance scanning, grade entry.

- [ ] **Enrollment form** ( Students page → "Enroll" button)
  - Fields: LRN, names, photo upload (R2), grade/section assignment
  - Auto-generate student user account (parent login linked later)
- [ ] **Attendance scanning page**
  - Webcam barcode scanner using `quaggaJS` / `html5-qrcode`
  - Decode LRN → lookup student → log present/absent/late
  - Real-time SF2 percentage update per section
- [ ] **Grade entry (Teacher portal)**
  - Teacher sees only their assigned sections
  - Input grades per subject per quarter
  - Auto-save with audit trail
- [ ] **Audit log viewer** (Admin only)
  - Who changed what grade, when, and why

**Deliverable**: Registrar can enroll, scan attendance, and teachers can input grades.

---

### Phase 3 — ID Card & Report Card System (Weeks 5-6)
**Goal**: Generate printable CR-80 ID cards and DepEd-aligned report cards.

- [ ] **ID Card designer**
  - HTML template with school branding (logo, colors)
  - Front: photo, name, LRN, barcode, QR code, SY
  - Back: emergency contact, address, school mission
  - Puppeteer renders to PNG/PDF in CR-80 dimensions (86mm × 54mm)
- [ ] **Batch print queue**
  - Select multiple students → generate print-ready PDF with cut guides
- [ ] **Report card generator**
  - Per quarter: subjects, grades, attendance summary, adviser comment
  - DepEd SF10-compatible format option
  - PDF generation via Puppeteer
- [ ] **Settings page additions**
  - Upload school logo, set accent colors, configure grading scale

**Deliverable**: Admin can print IDs and generate report cards as PDFs.

---

### Phase 4 — Parent Notifications (Weeks 7-8)
**Goal**: Real-time alerts to parents via Messenger and SMS.

- [ ] **Meta Cloud API integration**
  - Opt-in during enrollment ("Allow Notifications" button)
  - Store parent's Messenger PSID
  - Webhook receiver for message events
- [ ] **Notification triggers**
  - Absence alert (student marked absent)
  - Grade posted (new quarter grade available)
  - ID card ready for pickup
  - Low attendance warning (3+ consecutive absences)
- [ ] **Semaphore SMS fallback**
  - For parents without Messenger
  - Prepaid SMS bundle tracking in admin panel
- [ ] **Notification log**
  - Admin sees delivery status per parent per message

**Deliverable**: Parents receive Messenger/SMS alerts automatically.

---

### Phase 5 — Multi-Tenant & Super Admin (Weeks 9-10)
**Goal**: Onboard new schools and manage billing.

- [ ] **Subdomain routing**
  - `schoolname.educardpro.com` → tenant lookup
  - Custom domain support (CNAME + SSL via Let's Encrypt)
- [ ] **School onboarding wizard**
  - Sign up → create tenant → upload logo → set grading formula → invite admin
- [ ] **Data isolation enforcement**
  - Every query scoped to `tenant_id`
  - Separate R2 buckets or path-prefix per school
- [ ] **Super Admin dashboard**
  - List all schools, subscription tier, student count, revenue
  - Messenger conversation usage per school
  - Billing overview and invoice generation
  - Suspend/activate school accounts

**Deliverable**: New schools can self-sign-up; Super Admin can manage all.

---

### Phase 6 — Role-Specific Portals (Weeks 11-12)
**Goal**: Each user type sees only what they need.

- [ ] **Teacher Portal**
  - My sections only
  - Attendance scan for today's class
  - Grade entry with submit-for-review workflow
  - View student profiles (limited)
- [ ] **Student Portal**
  - My grades per quarter
  - My attendance history
  - Digital ID card (view on mobile)
  - Report card download
- [ ] **Parent Portal**
  - Children's overview (if multiple kids enrolled)
  - Attendance timeline
  - Grade notifications and history
  - Messenger opt-in / contact preferences
- [ ] **School Calendar**
  - Admin sets school days, holidays, grading periods
  - Teachers see instructional days remaining

**Deliverable**: 4 distinct portals with proper RBAC.

---

### Phase 7 — Polish, Security & Launch (Week 13+)
**Goal**: Production readiness.

- [ ] **Security hardening**
  - HTTPS everywhere, HSTS headers
  - Rate limiting on API
  - SQL injection / XSS audits
  - Data encryption at rest (R2, DB backups)
  - 2FA for admin and teacher accounts
- [ ] **Performance**
  - DB indexing on `tenant_id`, `lrn`, `date`
  - CDN for static assets and generated PDFs
  - Caching layer (Redis) for school configs
- [ ] **Monitoring**
  - Sentry for frontend + backend errors
  - Uptime monitoring
  - Daily DB backups to R2
- [ ] **Documentation**
  - API docs (OpenAPI / Swagger)
  - User guides per role
  - Deployment runbook
- [ ] **Pilot launch**
  - 1-3 friendly schools, free trial
  - Gather feedback, iterate

---

## 6. File / Folder Plan (Aligned with Proposal Modules)

```
educard-dashboard-pro/
├── PLAN.md                    ← This file
├── src/
│   ├── routes/                ← TanStack file routes
│   │   ├── __root.tsx         ← Layout + auth guard
│   │   ├── index.tsx          ← Principal Dashboard
│   │   ├── students.tsx       ← Learner roster + enrollment
│   │   ├── attendance.tsx     ← SF2 view + scan page
│   │   ├── grades.tsx         ← Grade analytics + audit log
│   │   ├── id-cards.tsx       ← ID preview + print queue
│   │   ├── alerts.tsx         ← Notifications hub
│   │   ├── settings.tsx       ← School profile + branding
│   │   ├── login.tsx          ← Auth login
│   │   ├── teacher/
│   │   │   ├── index.tsx      ← Teacher dashboard
│   │   │   ├── attendance.tsx ← Scan + mark attendance
│   │   │   └── grades.tsx     ← Grade entry
│   │   ├── student/
│   │   │   ├── index.tsx      ← Student dashboard
│   │   │   ├── grades.tsx     ← My grades
│   │   │   └── id-card.tsx    ← Digital ID
│   │   ├── parent/
│   │   │   ├── index.tsx      ← Parent dashboard
│   │   │   ├── children.tsx   ← Children's status
│   │   │   └── messages.tsx   ← Notification history
│   │   └── super-admin/
│   │       ├── index.tsx      ← All schools overview
│   │       ├── schools.tsx    ← Tenant management
│   │       └── billing.tsx    ← Revenue & costs
│   ├── components/
│   │   ├── app-sidebar.tsx    ← Role-aware navigation
│   │   ├── page-header.tsx
│   │   ├── barcode-scanner.tsx ← Webcam scanner wrapper
│   │   ├── id-card-template.tsx ← CR-80 HTML template
│   │   └── ui/                ← shadcn components
│   ├── lib/
│   │   ├── api.ts             ← TanStack Query + fetch client
│   │   ├── auth.ts            ← JWT helpers, role checks
│   │   ├── school-data.ts     ← Mock data (dev only)
│   │   └── utils.ts
│   └── styles.css
├── api/                       ← Backend (Laravel or Node)
│   ├── app/                   ← Laravel app folder
│   ├── routes/
│   │   └── api.php            ← All API endpoints
│   ├── database/
│   │   └── migrations/
│   └── config/
├── templates/                 ← ID card + report card HTML
│   ├── id-card-front.html
│   ├── id-card-back.html
│   └── report-card.html
└── docker-compose.yml         ← Local dev: PostgreSQL + app
```

---

## 7. Key Metrics to Track During Build

| Metric | Target |
|--------|--------|
| API response time (p95) | < 200ms |
| ID card generation | < 3s per card |
| Report card PDF generation | < 5s |
| Barcode scan → attendance logged | < 1s |
| Messenger notification delivery | < 10s |
| Lighthouse score | > 90 (all categories) |

---

## 8. Risks & Mitigations

| Risk | Mitigation |
|------|------------|
| Meta API policy changes | Build SMS fallback as primary; Messenger as bonus |
| PVC printer compatibility | Generate standard CR-80 PNG/PDF; let school handle hardware |
| Slow PDF generation | Queue heavy jobs (Redis + worker); show spinner |
| Multi-tenancy data leaks | Row-level scope on **every** query; automated integration tests |
| Philippine internet latency | Host in Singapore (DigitalOcean SG); CDN via Cloudflare |

---

## 9. Immediate Next Steps (This Week)

1. **Confirm backend choice**: Laravel (proposal) vs. Node/Express (faster if team knows TS)
2. **Set up local database**: `docker-compose.yml` with PostgreSQL
3. **Create auth system**: Login page + JWT middleware + protected routes
4. **Migrate mock data to DB**: Write seeders for St. Mary's Academy dataset
5. **Wire first API endpoint**: `GET /api/school/profile` → render in Settings page

---

*Plan version: 1.0 | Based on EduCardPro_Proposal.docx | Current prototype: v1.0 mock-data dashboard*
