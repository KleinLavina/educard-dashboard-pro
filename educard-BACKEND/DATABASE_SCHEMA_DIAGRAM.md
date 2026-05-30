# 📊 EduCard Pro - Database Schema Diagram

## Visual Database Structure

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         SCHOOL SETTINGS                                  │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │ SchoolSettings                                                     │  │
│  │ • school_name: "St. Mary's Academy"                               │  │
│  │ • school_year: "2025-2026"                                         │  │
│  │ • current_quarter: 3                                               │  │
│  │ • sf2_target_attendance: 95.00                                     │  │
│  │ • q1_start, q1_end, q2_start, q2_end, q3_start, q3_end...        │  │
│  └───────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│                      USER & AUTHENTICATION                               │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │ User (Extended Django User)                                        │  │
│  │ • username, email, password                                        │  │
│  │ • first_name, last_name                                            │  │
│  │ • role: admin | teacher | student | parent                         │  │
│  │ • phone, messenger_psid                                            │  │
│  │ • subject_specialization (for teachers)                            │  │
│  └───────────────────────────────────────────────────────────────────┘  │
│                                                                           │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │ ParentProfile                                                      │  │
│  │ • user → User (OneToOne)                                           │  │
│  │ • relationship: Mother | Father | Guardian                         │  │
│  │ • messenger_linked: boolean                                        │  │
│  │ • sms_enabled: boolean                                             │  │
│  └───────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│                    SCHOOL STRUCTURE (DepEd K-12)                         │
│                                                                           │
│  ┌─────────────────────┐                                                 │
│  │ Department          │                                                 │
│  │ • key: JHS | SHS    │                                                 │
│  │ • label             │                                                 │
│  │ • caption           │                                                 │
│  └──────────┬──────────┘                                                 │
│             │ 1:N                                                         │
│             ▼                                                             │
│  ┌─────────────────────┐                                                 │
│  │ GradeLevel          │                                                 │
│  │ • department → FK   │                                                 │
│  │ • level: 7-12       │                                                 │
│  │ • label: "Grade 7"  │                                                 │
│  └──────────┬──────────┘                                                 │
│             │ 1:N                                                         │
│             ▼                                                             │
│  ┌─────────────────────────────────────────┐                             │
│  │ Section                                  │                             │
│  │ • grade_level → FK                       │                             │
│  │ • name: "Sampaguita", "St. Jude"        │                             │
│  │ • strand: STEM | ABM | HUMSS | etc.     │                             │
│  │ • adviser → User (Teacher)               │                             │
│  │ • enrollment_count (property)            │                             │
│  │ • average_attendance (property)          │                             │
│  └──────────┬──────────────────────────────┘                             │
│             │ 1:N                                                         │
│             ▼                                                             │
└─────────────┼─────────────────────────────────────────────────────────────┘
              │
┌─────────────┼─────────────────────────────────────────────────────────────┐
│             │              LEARNERS (STUDENTS)                             │
│             ▼                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐ │
│  │ Learner                                                              │ │
│  │ • lrn: 12-digit unique (e.g., "136728140987")                       │ │
│  │ • first_name, middle_initial, last_name                             │ │
│  │ • birth_date, sex                                                   │ │
│  │ • section → Section (FK)                                            │ │
│  │ • gpa: 0-100                                                        │ │
│  │ • attendance_rate: 0-100                                            │ │
│  │ • barcode_value (same as LRN)                                       │ │
│  │ • barcode_active: boolean                                           │ │
│  │ • photo_path                                                        │ │
│  │ • user_account → User (Student) (OneToOne)                          │ │
│  │ • parent_account → User (Parent) (FK)                               │ │
│  │ • parent_phone, parent_messenger_psid                               │ │
│  │ • enrolled_at, graduated_at                                         │ │
│  │ • full_name (property)                                              │ │
│  │ • status (property): "On Track" | "At Risk"                         │ │
│  └──────────┬──────────────────────────────────────────────────────────┘ │
│             │                                                              │
│             │ 1:N                                                          │
│             ├──────────────────────────────────────────────────────────┐  │
│             │                                                           │  │
└─────────────┼───────────────────────────────────────────────────────────┼──┘
              │                                                           │
              │                                                           │
┌─────────────┼───────────────────────────────────────────────────────────┼──┐
│             │           SUBJECTS & GRADES                               │  │
│             │                                                           │  │
│  ┌──────────▼──────────┐                                               │  │
│  │ Subject             │                                               │  │
│  │ • section → FK      │                                               │  │
│  │ • teacher → User FK │                                               │  │
│  │ • name: "Math"      │                                               │  │
│  │ • quarter_weight_*  │                                               │  │
│  └──────────┬──────────┘                                               │  │
│             │ 1:N                                                       │  │
│             ▼                                                           │  │
│  ┌─────────────────────────────────────────┐                           │  │
│  │ Grade                                    │◄──────────────────────────┘  │
│  │ • learner → Learner (FK)                 │                              │
│  │ • subject → Subject (FK)                 │                              │
│  │ • quarter: 1-4                           │                              │
│  │ • quiz_score: 0-100                      │                              │
│  │ • exam_score: 0-100                      │                              │
│  │ • activity_score: 0-100                  │                              │
│  │ • computed_grade (auto-calculated)       │                              │
│  │ • created_at, updated_at                 │                              │
│  └──────────────────────────────────────────┘                              │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│                           ATTENDANCE                                     │
│                                                                           │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │ SchoolCalendar                                                     │  │
│  │ • date: unique                                                     │  │
│  │ • type: school_day | holiday | suspension                          │  │
│  │ • label: "Rizal Day", "Maundy Thursday"                           │  │
│  └───────────────────────────────────────────────────────────────────┘  │
│                                                                           │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │ AttendanceRecord                                                   │  │
│  │ • learner → Learner (FK)                                           │  │
│  │ • date                                                             │  │
│  │ • time_in_morning, time_out_morning                                │  │
│  │ • time_in_afternoon, time_out_afternoon                            │  │
│  │ • status: present | absent | late | excused                        │  │
│  │ • created_at, updated_at                                           │  │
│  └───────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│                      ID CARDS & PRINTING                                 │
│                                                                           │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │ IDTemplate                                                         │  │
│  │ • name: "SY 2025-2026 Template"                                    │  │
│  │ • background_path                                                  │  │
│  │ • font_color: "#FFFFFF"                                            │  │
│  │ • is_active: boolean (only one active)                             │  │
│  └──────────┬────────────────────────────────────────────────────────┘  │
│             │ 1:N                                                         │
│             ▼                                                             │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │ IDPrintQueue                                                       │  │
│  │ • learner → Learner (FK)                                           │  │
│  │ • template → IDTemplate (FK)                                       │  │
│  │ • reason: new_enrollment | lost | damaged | renewal                │  │
│  │ • status: pending | generated | printed                            │  │
│  │ • pdf_path                                                         │  │
│  │ • requested_by → User (FK)                                         │  │
│  │ • requested_at, printed_at                                         │  │
│  └───────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│                  NOTIFICATIONS & COMMUNICATION                           │
│                                                                           │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │ NotificationRecord                                                 │  │
│  │ • parent → User (Parent) (FK)                                      │  │
│  │ • learner → Learner (FK)                                           │  │
│  │ • channel: messenger | sms | system                                │  │
│  │ • status: sent | failed | pending                                  │  │
│  │ • message: text                                                    │  │
│  │ • triggered_by: attendance_scan | grade_posted | absence_warning   │  │
│  │ • sent_at                                                          │  │
│  └───────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│                      CONDUCT & BEHAVIOR                                  │
│                                                                           │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │ ConductLog                                                         │  │
│  │ • learner → Learner (FK)                                           │  │
│  │ • date                                                             │  │
│  │ • item: "Participated actively in Science Lab"                     │  │
│  │ • type: Positive | Note | Warning                                  │  │
│  │ • recorded_by → User (Teacher/Admin) (FK)                          │  │
│  │ • created_at                                                       │  │
│  └───────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Relationship Summary

### One-to-Many (1:N)
- Department → GradeLevel
- GradeLevel → Section
- Section → Learner
- Section → Subject
- Learner → Grade
- Learner → AttendanceRecord
- Learner → ConductLog
- Learner → IDPrintQueue
- Subject → Grade
- User (Teacher) → Section (as adviser)
- User (Teacher) → Subject (as teacher)
- User (Parent) → Learner (as parent_account)
- User (Parent) → NotificationRecord
- IDTemplate → IDPrintQueue

### One-to-One (1:1)
- User ↔ ParentProfile
- User (Student) ↔ Learner (user_account)

### Unique Constraints
- Learner.lrn (12-digit unique)
- SchoolCalendar.date (unique)
- Grade: unique_together (learner, subject, quarter)
- AttendanceRecord: unique_together (learner, date)
- GradeLevel: unique_together (department, level)

---

## Field Types Reference

### Common Field Types Used

| Field Type | Usage | Example |
|------------|-------|---------|
| `CharField` | Short text | name, lrn, phone |
| `TextField` | Long text | message, item |
| `IntegerField` | Whole numbers | level, quarter, current_week |
| `DecimalField` | Precise decimals | gpa, attendance_rate, grades |
| `BooleanField` | True/False | barcode_active, is_active |
| `DateField` | Date only | birth_date, date |
| `TimeField` | Time only | time_in_morning |
| `DateTimeField` | Date + Time | enrolled_at, sent_at |
| `ForeignKey` | Relationship | section, learner, user |
| `OneToOneField` | 1:1 Relationship | user_account |

### Validators Used
- `MinLengthValidator(12)` - LRN must be 12 digits
- `MaxLengthValidator(12)` - LRN cannot exceed 12 digits
- `MinValueValidator(0)` - Scores cannot be negative
- `MaxValueValidator(100)` - Scores cannot exceed 100
- `MinValueValidator(7)` - Grade level minimum
- `MaxValueValidator(12)` - Grade level maximum

---

## Cascade Behavior (on_delete)

| Relationship | on_delete | Behavior |
|--------------|-----------|----------|
| Section → GradeLevel | CASCADE | Delete section if grade level deleted |
| Learner → Section | SET_NULL | Keep learner, set section to null |
| Grade → Learner | CASCADE | Delete grades if learner deleted |
| AttendanceRecord → Learner | CASCADE | Delete attendance if learner deleted |
| User (Teacher) → Section | SET_NULL | Keep section, set adviser to null |
| IDPrintQueue → Learner | CASCADE | Delete print requests if learner deleted |

---

## Computed Properties

### Learner Model
- `full_name` - Combines first_name, middle_initial, last_name
- `status` - Returns "On Track" or "At Risk" based on GPA and attendance

### Section Model
- `enrollment_count` - Count of learners in section
- `average_attendance` - Average attendance rate of all learners

### Grade Model
- `computed_grade` - Auto-calculated from quiz, exam, activity scores with weights

---

## Indexes & Performance

### Indexed Fields (for fast queries)
- `lrn` (unique index)
- `barcode_value`
- `date` (in AttendanceRecord and SchoolCalendar)
- Foreign keys (automatic indexes)

### Ordering
- Learners: by last_name, first_name
- Grades: by learner, subject, quarter
- AttendanceRecords: by -date (newest first)
- Sections: by grade_level, name

---

## Data Validation

### LRN (Learner Reference Number)
- Must be exactly 12 digits
- Must be unique
- Auto-copied to barcode_value

### Grades
- Quiz, exam, activity scores: 0-100
- Computed grade auto-calculated on save
- Quarter: 1-4 only

### Attendance Rate
- 0-100 percentage
- Used for SF2 compliance (target: 95%)

### GPA
- 0-100 scale
- Below 75 = At Risk

---

## Sample Queries

### Get all at-risk learners
```python
Learner.objects.filter(Q(gpa__lt=75) | Q(attendance_rate__lt=95))
```

### Get sections below SF2 target
```python
Section.objects.annotate(
    avg_attendance=Avg('learners__attendance_rate')
).filter(avg_attendance__lt=95)
```

### Get learner's grades for a quarter
```python
Grade.objects.filter(learner__lrn='136728140987', quarter=3)
```

### Get today's attendance
```python
from datetime import date
AttendanceRecord.objects.filter(date=date.today())
```

---

## API Endpoint Mapping

| Frontend Data | Backend Model | API Endpoint (Future) |
|---------------|---------------|----------------------|
| `allLearners` | Learner | `/api/learners/` |
| `allSections` | Section | `/api/sections/` |
| `gradeRecords` | Grade | `/api/grades/` |
| `attendanceLogs` | AttendanceRecord | `/api/attendance/` |
| `conductLogs` | ConductLog | `/api/conduct/` |
| `notificationHistory` | NotificationRecord | `/api/notifications/` |
| `idPrintHistory` | IDPrintQueue | `/api/id-cards/queue/` |
| `parentProfiles` | ParentProfile | `/api/parents/` |
| `totals` | Aggregated queries | `/api/dashboard/stats/` |

---

**This schema supports all features described in your project proposal!** 🎉
