# 📚 EduCard Pro - Extended Models Documentation

## 🎯 Overview

Based on the complete **EduCardPro_Detailed_Plan.txt**, I've expanded the Django models to include ALL features required for the full system. This document explains the additional models and enhancements.

---

## 🆕 New Models Added

### 1. **GradeAuditLog** - Grade Change Tracking

**Purpose**: Track all changes to student grades for accountability and compliance.

**Fields**:
- `grade` (ForeignKey) - The grade record that was changed
- `changed_by` (ForeignKey to User) - Who made the change
- `field_changed` (CharField) - Which field: quiz_score, exam_score, or activity_score
- `old_value` (Decimal) - Previous value
- `new_value` (Decimal) - New value
- `changed_at` (DateTime) - When the change occurred

**Use Cases**:
- Audit trail for grade modifications
- Compliance with DepEd requirements
- Dispute resolution
- Teacher accountability

**API Endpoints** (Future):
```
GET /api/grades/{id}/audit-log  - View change history
GET /api/audit-log              - School-wide audit log
```

---

### 2. **SMSLog** - SMS Tracking & Billing

**Purpose**: Track all SMS sent for billing, monitoring, and cost management.

**Fields**:
- `learner` (ForeignKey) - Related student (optional)
- `phone` (CharField) - Recipient phone number
- `message` (TextField) - SMS content
- `status` (CharField) - sent, failed, pending
- `cost` (Decimal) - Cost in PHP (default 0.50)
- `provider` (CharField) - SMS provider (Semaphore)
- `provider_message_id` (CharField) - Provider's tracking ID
- `error_message` (TextField) - Error details if failed
- `created_at` (DateTime) - When queued
- `sent_at` (DateTime) - When actually sent

**Use Cases**:
- Track SMS costs per school
- Bill schools for SMS usage
- Monitor delivery success rates
- Debug failed messages
- Generate usage reports

**API Endpoints** (Future):
```
GET /api/sms-logs                    - View SMS history
GET /api/super/sms-usage/{tenant_id} - Super Admin billing view
POST /api/super/add-sms-credits      - Add credits to school
```

---

### 3. **Message** - Parent-Teacher Communication

**Purpose**: In-system messaging between parents and teachers.

**Fields**:
- `sender` (ForeignKey to User) - Message sender
- `receiver` (ForeignKey to User) - Message recipient
- `subject` (CharField) - Message subject
- `body` (TextField) - Message content
- `learner` (ForeignKey) - Related student (for context)
- `read_at` (DateTime) - When message was read
- `created_at` (DateTime) - When sent

**Use Cases**:
- Parents contact teachers about their child
- Teachers respond to parent inquiries
- Keep communication history
- Notification badges for unread messages

**API Endpoints** (Future):
```
POST /api/messages              - Send message
GET /api/messages               - Inbox
GET /api/messages/sent          - Sent messages
PATCH /api/messages/{id}/read   - Mark as read
DELETE /api/messages/{id}       - Delete message
```

---

## 🔄 Enhanced Models

### 1. **Learner** - Added Graduation Status

**New Fields**:
- `graduation_status` (CharField) - active, candidate, confirmed, archived

**New Property**:
- `is_graduate` - Boolean property to check if graduated

**Graduation Workflow**:
1. **Active** - Currently enrolled student
2. **Candidate** - Auto-detected at year end (Grade 10 JHS or Grade 12 SHS with passing grades)
3. **Confirmed** - Admin confirms graduation
4. **Archived** - Graduate moved to alumni archive

**Use Cases**:
- Auto-detect graduating students
- Admin confirmation workflow
- Alumni archive
- Deactivate barcodes for graduates
- Send graduation notifications

**API Endpoints** (Future):
```
GET /api/graduation/candidates       - List graduation candidates
POST /api/graduation/confirm/{id}    - Confirm graduation
GET /api/graduates                   - Alumni archive
GET /api/graduates/{id}/transcript   - Download transcript
```

---

### 2. **SchoolSettings** - Enhanced Tenant Configuration

**New Fields**:
- `primary_color` (CharField) - School branding color (hex)
- `messenger_conversations_used` (Integer) - Monthly Messenger usage
- `plan` (CharField) - Subscription plan (cached from central DB)
- `plan_expires_at` (DateTime) - Subscription expiry
- Renamed grading period fields for clarity

**Use Cases**:
- School branding customization
- Track Messenger usage for billing
- Enforce subscription limits
- Configure grading periods

**API Endpoints** (Future):
```
GET /api/settings                    - Get school settings
PATCH /api/settings                  - Update settings
POST /api/settings/logo              - Upload school logo
GET /api/super/tenants/{id}/usage    - Super Admin usage view
```

---

## 📊 Complete Model Relationships

```
User (Extended Django User)
  ├── role: admin, teacher, student, parent
  ├── ParentProfile (OneToOne)
  ├── Learner (as student: OneToOne user_account)
  ├── Learner (as parent: ForeignKey parent_account)
  ├── Section (as adviser: ForeignKey)
  ├── Subject (as teacher: ForeignKey)
  ├── Message (as sender/receiver: ForeignKey)
  ├── GradeAuditLog (as changed_by: ForeignKey)
  └── ConductLog (as recorded_by: ForeignKey)

Department (JHS/SHS)
  └── GradeLevel (7-12)
      └── Section (Sampaguita, etc.)
          ├── Learner (students)
          │   ├── Grade (quarter grades)
          │   │   └── GradeAuditLog (change history)
          │   ├── AttendanceRecord (daily attendance)
          │   ├── ConductLog (behavior)
          │   ├── IDPrintQueue (ID requests)
          │   ├── NotificationRecord (alerts)
          │   ├── SMSLog (SMS sent)
          │   └── Message (related context)
          └── Subject (Math, Science, etc.)
              └── Grade (learner grades)

SchoolSettings (singleton)
  ├── School configuration
  ├── Grading periods
  ├── Notification settings
  └── Subscription info

SchoolCalendar
  └── School days, holidays, suspensions

IDTemplate
  └── IDPrintQueue (print requests)
```

---

## 🎯 Feature Coverage

### ✅ Phase 2: Backend & Auth
- [x] User model with roles
- [x] Department, GradeLevel, Section hierarchy
- [x] Learner with LRN and barcode
- [x] School settings

### ✅ Phase 3: Attendance
- [x] AttendanceRecord with 4 time sessions
- [x] SchoolCalendar for holidays
- [x] Status tracking (present, absent, late, excused)

### ✅ Phase 4: Grades
- [x] Subject with grading weights
- [x] Grade with auto-calculated computed_grade
- [x] **GradeAuditLog for change tracking** ⭐ NEW

### ✅ Phase 5: ID Cards
- [x] IDTemplate for designs
- [x] IDPrintQueue for print management
- [x] Barcode generation support

### ✅ Phase 6: Notifications
- [x] NotificationRecord for Messenger/SMS history
- [x] **SMSLog for billing and tracking** ⭐ NEW
- [x] ParentProfile with preferences

### ✅ Phase 7: Graduation & Messaging
- [x] **Graduation status in Learner model** ⭐ NEW
- [x] **Message model for parent-teacher communication** ⭐ NEW
- [x] Alumni archive support

### ✅ Phase 8: Settings & Billing
- [x] **Enhanced SchoolSettings with subscription info** ⭐ NEW
- [x] **SMS credit tracking** ⭐ NEW
- [x] **Messenger usage tracking** ⭐ NEW
- [x] ConductLog for behavior tracking

---

## 📋 Database Tables Summary

| # | Table | Purpose | Status |
|---|-------|---------|--------|
| 1 | users | Authentication & roles | ✅ Complete |
| 2 | parent_profiles | Parent preferences | ✅ Complete |
| 3 | departments | JHS/SHS | ✅ Complete |
| 4 | grade_levels | Grades 7-12 | ✅ Complete |
| 5 | sections | Class sections | ✅ Complete |
| 6 | learners | Student records | ✅ Enhanced |
| 7 | subjects | Subjects per section | ✅ Complete |
| 8 | grades | Quarter grades | ✅ Complete |
| 9 | **grade_audit_logs** | Grade change history | ⭐ NEW |
| 10 | school_calendar | School days/holidays | ✅ Complete |
| 11 | attendance_records | Daily attendance | ✅ Complete |
| 12 | id_templates | ID card designs | ✅ Complete |
| 13 | id_print_queue | Print requests | ✅ Complete |
| 14 | notification_records | Notification history | ✅ Complete |
| 15 | **sms_logs** | SMS tracking & billing | ⭐ NEW |
| 16 | conduct_logs | Behavior records | ✅ Complete |
| 17 | **messages** | Parent-teacher chat | ⭐ NEW |
| 18 | school_settings | School configuration | ✅ Enhanced |

**Total**: 18 models (15 original + 3 new)

---

## 🔐 Security & Compliance Features

### 1. **Grade Audit Trail**
- Every grade change is logged
- Shows who changed what and when
- Immutable audit records
- Compliance with DepEd requirements

### 2. **SMS Cost Tracking**
- Every SMS logged with cost
- Track delivery success/failure
- Bill schools accurately
- Monitor usage patterns

### 3. **Graduation Workflow**
- Auto-detect candidates
- Admin confirmation required
- Barcode deactivation
- Alumni archive

### 4. **Subscription Management**
- Track plan and expiry
- Monitor usage (SMS, Messenger)
- Enforce limits
- Billing integration

---

## 🚀 API Endpoints to Build

### Grade Audit
```
GET /api/grades/{id}/audit-log
GET /api/audit-log?learner_id=X&date_from=Y
```

### SMS Management
```
GET /api/sms-logs
GET /api/sms-logs/stats
POST /api/super/add-sms-credits/{tenant_id}
```

### Messaging
```
POST /api/messages
GET /api/messages
GET /api/messages/unread
PATCH /api/messages/{id}/read
DELETE /api/messages/{id}
```

### Graduation
```
GET /api/graduation/candidates
POST /api/graduation/confirm/{learner_id}
GET /api/graduates
GET /api/graduates/{id}/transcript
```

### Settings
```
GET /api/settings
PATCH /api/settings
POST /api/settings/logo
GET /api/super/tenants/{id}/usage
```

---

## 📊 Data Flow Examples

### 1. Grade Change Audit Trail
```
Teacher changes grade
  ↓
Grade.save() triggered
  ↓
Create GradeAuditLog entry
  ↓
Log: old_value, new_value, changed_by, timestamp
  ↓
Dispatch GradePostedNotificationJob
```

### 2. SMS Billing Flow
```
Attendance scan triggers notification
  ↓
Check if Messenger available
  ↓
If not, send SMS
  ↓
Create SMSLog entry (status=pending)
  ↓
Call Semaphore API
  ↓
Update SMSLog (status=sent, cost=0.50)
  ↓
Deduct from school's SMS credits
  ↓
Super Admin can view usage
```

### 3. Graduation Workflow
```
End of school year
  ↓
Scheduled command runs
  ↓
Find Grade 10/12 students with passing grades
  ↓
Set graduation_status = 'candidate'
  ↓
Admin reviews candidates
  ↓
Admin confirms graduation
  ↓
Set graduation_status = 'confirmed'
  ↓
Set graduated_at = now()
  ↓
Set barcode_active = False
  ↓
Dispatch GraduationNotificationJob
  ↓
Send congratulations message
  ↓
Move to alumni archive (status = 'archived')
```

### 4. Parent-Teacher Messaging
```
Parent logs in
  ↓
Clicks "Message Teacher"
  ↓
Selects child (learner)
  ↓
Writes message
  ↓
POST /api/messages
  ↓
Create Message record
  ↓
Teacher sees notification badge
  ↓
Teacher reads message (read_at set)
  ↓
Teacher replies
  ↓
Parent sees notification
```

---

## 🎓 Best Practices

### 1. **Grade Audit Logging**
- Log BEFORE saving new value
- Never delete audit logs
- Include user context
- Timestamp everything

### 2. **SMS Cost Management**
- Always log before sending
- Update status after API response
- Track failures for retry
- Generate monthly reports

### 3. **Graduation Process**
- Auto-detect but require confirmation
- Deactivate barcodes immediately
- Keep records in same table (don't delete)
- Send notifications last

### 4. **Messaging System**
- Link messages to learners for context
- Implement read receipts
- Allow deletion (soft delete)
- Notification badges for unread

---

## 📝 Migration Strategy

### Step 1: Create New Migrations
```bash
python manage.py makemigrations core
```

### Step 2: Review Migration Files
Check that new models are created:
- GradeAuditLog
- SMSLog
- Message
- Updated Learner (graduation_status field)
- Updated SchoolSettings (new fields)

### Step 3: Apply Migrations
```bash
python manage.py migrate
```

### Step 4: Verify in Django Admin
- Check all new models appear
- Test creating records
- Verify relationships

---

## ✅ Verification Checklist

- [ ] GradeAuditLog model created
- [ ] SMSLog model created
- [ ] Message model created
- [ ] Learner.graduation_status field added
- [ ] SchoolSettings enhanced with new fields
- [ ] All models registered in admin
- [ ] Migrations created successfully
- [ ] Migrations applied successfully
- [ ] Can create records in Django Admin
- [ ] Relationships work correctly

---

## 🎯 Next Steps

1. **Create new migrations**
   ```bash
   python manage.py makemigrations core
   ```

2. **Apply migrations**
   ```bash
   python manage.py migrate
   ```

3. **Update fixtures** (optional)
   - Add sample audit logs
   - Add sample messages
   - Add SMS logs

4. **Build API endpoints**
   - Follow API_DEVELOPMENT_ROADMAP.md
   - Add serializers for new models
   - Create views for new endpoints

5. **Update frontend**
   - Add messaging interface
   - Add graduation workflow
   - Add audit log viewer

---

## 📚 Documentation References

- **Detailed Plan**: `EduCardPro_Detailed_Plan.txt`
- **API Roadmap**: `API_DEVELOPMENT_ROADMAP.md`
- **Database Schema**: `DATABASE_SCHEMA_DIAGRAM.md`
- **Setup Guide**: `DJANGO_SETUP_GUIDE.md`

---

**All models now match the complete requirements from the detailed plan!** 🎉

**Next**: Run migrations to create the new tables.
