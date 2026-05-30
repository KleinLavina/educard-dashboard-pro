# EduCard Pro — Complete Database Schema Reference
# 35 models · 35 tables · 3 migrations · all applied

---

## Full Table List (alphabetical)

| # | Table | Model | Phase | Rows (seed) |
|---|-------|-------|-------|-------------|
| 1 | absence_alerts | AbsenceAlert | 6 | 0 |
| 2 | activity_logs | ActivityLog | 8 | 0 |
| 3 | attendance_records | AttendanceRecord | 3 | 14 |
| 4 | bulk_import_jobs | BulkImportJob | 4 | 0 |
| 5 | conduct_logs | ConductLog | 7 | 4 |
| 6 | departments | Department | 2 | 2 |
| 7 | grade_audit_logs | GradeAuditLog | 4 | 0 |
| 8 | grade_levels | GradeLevel | 2 | 6 |
| 9 | grades | Grade | 4 | 12 |
| 10 | graduation_notifications | GraduationNotification | 7 | 0 |
| 11 | id_card_element_positions | IDCardElementPosition | 5 | 0 |
| 12 | id_print_queue | IDPrintQueue | 5 | 2 |
| 13 | id_templates | IDTemplate | 5 | 1 |
| 14 | learner_section_history | LearnerSectionHistory | 7 | 0 |
| 15 | learners | Learner | 2 | 6 |
| 16 | messages | Message | 7 | 0 |
| 17 | messenger_webhook_events | MessengerWebhookEvent | 6 | 0 |
| 18 | notification_preferences | NotificationPreference | 6 | 0 |
| 19 | notification_records | NotificationRecord | 6 | 3 |
| 20 | parent_profiles | ParentProfile | 2 | 1 |
| 21 | portal_sessions | PortalSession | 7 | 0 |
| 22 | report_cards | ReportCard | 4 | 0 |
| 23 | school_calendar | SchoolCalendar | 3 | 3 |
| 24 | school_settings | SchoolSettings | 8 | 1 |
| 25 | sections | Section | 2 | 6 |
| 26 | sf1_records | SF1Record | 2/8 | 0 |
| 27 | sf2_reports | SF2Report | 3/8 | 0 |
| 28 | sms_credit_bundles | SMSCreditBundle | 8 | 0 |
| 29 | sms_logs | SMSLog | 6 | 0 |
| 30 | subjects | Subject | 4 | 8 |
| 31 | subscription_invoices | SubscriptionInvoice | 8 | 0 |
| 32 | teacher_section_assignments | TeacherSectionAssignment | 2 | 0 |
| 33 | tenant_domains | TenantDomain | 2 | 0 |
| 34 | tenants | Tenant | 2/8 | 0 |
| 35 | users | User | 2 | 6 |

---

## Complete Relationship Map

```
Tenant (UUID PK)
  ├── TenantDomain          1:N  — domain names (e.g. stmarys.educardpro.com)
  ├── SMSCreditBundle       1:N  — top-up history (1000 / 2200 credits)
  └── SubscriptionInvoice   1:N  — billing invoices per cycle

User  (role: admin | teacher | student | parent)
  ├── ParentProfile         1:1  — relationship type, Messenger/SMS opt-in
  ├── Learner.user_account  1:1  — student portal login
  ├── Learner.parent_account 1:N — parent portal (one parent → many children)
  ├── Section.adviser       1:N  — teacher is class adviser
  ├── Subject.teacher       1:N  — teacher teaches subject
  ├── TeacherSectionAssignment 1:N — all sections a teacher is assigned to
  ├── Message.sender        1:N  — outbox
  ├── Message.receiver      1:N  — inbox
  ├── GradeAuditLog.changed_by 1:N
  ├── ActivityLog.user      1:N
  ├── IDPrintQueue.requested_by 1:N
  ├── BulkImportJob.uploaded_by 1:N
  ├── SF2Report.generated_by 1:N
  ├── LearnerSectionHistory.recorded_by 1:N
  ├── SubscriptionInvoice.created_by 1:N
  └── PortalSession         1:N  — login tracking

Department  (JHS | SHS)
  └── GradeLevel            1:N  (level 7–12)
      └── Section           1:N  (Sampaguita, St. Jude …)
          ├── Subject        1:N
          ├── TeacherSectionAssignment 1:N
          ├── SF1Record      1:N
          ├── SF2Report      1:N  (one per month)
          └── Learner        1:N
              ├── Grade      1:N  ←── Subject (N:1)
              │   └── GradeAuditLog  1:N
              ├── AttendanceRecord   1:N  (unique per date)
              ├── ConductLog         1:N
              ├── IDPrintQueue       1:N
              ├── NotificationRecord 1:N
              ├── SMSLog             1:N
              ├── AbsenceAlert       1:N  (unique per threshold+streak)
              ├── ReportCard         1:N  (unique per school_year)
              ├── SF1Record          1:N  (unique per school_year)
              ├── LearnerSectionHistory 1:N
              ├── NotificationPreference 1:1
              ├── GraduationNotification 1:1
              ├── Message.learner    1:N  (context link)
              └── MessengerWebhookEvent 1:N

IDTemplate
  ├── IDPrintQueue          1:N
  └── IDCardElementPosition 1:N  (photo, name, LRN, barcode … positions)

SchoolCalendar  (standalone — checked by attendance scan endpoint)
SchoolSettings  (singleton — one row per school)
ActivityLog     (standalone — immutable audit trail)
BulkImportJob   (standalone — CSV/Excel import tracker)
PortalSession   (standalone — student/parent login tracker)
```

---

## Business Rules Encoded in Models

| Rule | Enforced by |
|------|-------------|
| LRN exactly 12 digits | `MinLengthValidator(12)` + `MaxLengthValidator(12)` |
| `barcode_value` = LRN | `Learner.save()` auto-sets on create |
| Computed grade auto-calculated | `Grade.save()` → `calculate_grade()` |
| Only one active ID template | `IDTemplate.save()` deactivates others |
| Absence alert sent once per streak | `AbsenceAlert` `unique_together` |
| Report card cached 24 h | `ReportCard.expires_at` + `is_expired` property |
| Account locked after 5 failed logins | `User.locked_until` + `is_locked` property |
| Graduation deactivates barcode | Set `barcode_active=False` on confirm |
| Tenant soft-delete (never drop DB) | `Tenant.deleted_at` + `is_active` property |
| Grade audit log is immutable | Admin `has_add_permission=False`, `has_change_permission=False` |
| Activity log is immutable | Same as above |
| One SF1 record per learner per year | `SF1Record` `unique_together` |
| One SF2 report per section per month | `SF2Report` `unique_together` |
| One notification pref per learner | `NotificationPreference` OneToOne |
| One ID element position per template | `IDCardElementPosition` `unique_together` |
| Teacher assignment unique per year | `TeacherSectionAssignment` `unique_together` |
| Invoice number globally unique | `SubscriptionInvoice.invoice_number` unique |

---

## Migrations Applied

| Migration | Tables Created / Modified |
|-----------|--------------------------|
| `0001_initial` | All original 15 models |
| `0002_tenant_and_more` | Tenant, TenantDomain, SMSCreditBundle, GradeAuditLog, GraduationNotification, Message, MessengerWebhookEvent, SMSLog, ActivityLog, BulkImportJob, AbsenceAlert, ReportCard + User/Learner/SchoolSettings field additions |
| `0003_phase_complete_remaining_models` | TeacherSectionAssignment, LearnerSectionHistory, SF1Record, SF2Report, NotificationPreference, IDCardElementPosition, SubscriptionInvoice, PortalSession |

---

## Next Step — API Layer

```bash
# Install DRF + CORS + JWT
venv/Scripts/pip.exe install djangorestframework==3.14.0 django-cors-headers==4.3.1 djangorestframework-simplejwt==5.3.1

# Then create:
#   core/serializers.py
#   core/views.py
#   core/urls.py
# and update educard_backend/urls.py
```
