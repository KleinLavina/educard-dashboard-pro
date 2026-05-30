"""
Generate initial_data.json fixture for EduCard Pro
Matches the frontend mock data from school-data.ts
"""
import json
from datetime import date, time, datetime

fixtures = []
pk_counter = 1

def add_fixture(model, fields):
    global pk_counter
    fixtures.append({
        "model": model,
        "pk": pk_counter,
        "fields": fields
    })
    result_pk = pk_counter
    pk_counter += 1
    return result_pk

# ============================================================================
# 1. SCHOOL SETTINGS
# ============================================================================
add_fixture("core.schoolsettings", {
    "school_name": "St. Mary's Academy",
    "school_year": "2025-2026",
    "current_quarter": 3,
    "current_week": 6,
    "sf2_target_attendance": "95.00",
    "q1_start": "2025-08-26",
    "q1_end": "2025-10-17",
    "q2_start": "2025-10-21",
    "q2_end": "2025-12-19",
    "q3_start": "2026-01-12",
    "q3_end": "2026-03-27",
    "q4_start": "2026-04-07",
    "q4_end": "2026-05-30",
    "messenger_enabled": True,
    "sms_enabled": True,
    "sms_credits_remaining": 1000
})

# ============================================================================
# 2. DEPARTMENTS
# ============================================================================
jhs_pk = add_fixture("core.department", {
    "key": "JHS",
    "label": "Junior High School",
    "caption": "Grades 7 – 10"
})

shs_pk = add_fixture("core.department", {
    "key": "SHS",
    "label": "Senior High School",
    "caption": "Grades 11 – 12 · Academic & TVL Tracks"
})

# ============================================================================
# 3. USERS (Teachers, Students, Parents)
# ============================================================================

# Admin user
admin_pk = add_fixture("core.user", {
    "username": "admin",
    "password": "pbkdf2_sha256$600000$placeholder$hash",  # Will be set via createsuperuser
    "first_name": "School",
    "last_name": "Administrator",
    "email": "admin@stmarys.edu.ph",
    "is_staff": True,
    "is_superuser": True,
    "is_active": True,
    "role": "admin",
    "date_joined": "2025-08-01T00:00:00Z"
})

# Teachers
aurora_pk = add_fixture("core.user", {
    "username": "aurora.aquino",
    "password": "pbkdf2_sha256$600000$placeholder$hash",
    "first_name": "Aurora",
    "last_name": "Aquino",
    "email": "a.aquino@stmarys.edu.ph",
    "is_staff": False,
    "is_active": True,
    "role": "teacher",
    "phone": "+63 917 123 4567",
    "subject_specialization": "Mathematics",
    "date_joined": "2025-08-01T00:00:00Z"
})

benjie_pk = add_fixture("core.user", {
    "username": "benjie.lopez",
    "password": "pbkdf2_sha256$600000$placeholder$hash",
    "first_name": "Benjie",
    "last_name": "Lopez",
    "email": "b.lopez@stmarys.edu.ph",
    "is_staff": False,
    "is_active": True,
    "role": "teacher",
    "subject_specialization": "Science",
    "date_joined": "2025-08-01T00:00:00Z"
})

# Add more teachers (abbreviated for brevity)
teachers = {
    "carmela.cruz": add_fixture("core.user", {
        "username": "carmela.cruz", "password": "pbkdf2_sha256$600000$placeholder$hash",
        "first_name": "Carmela", "last_name": "Cruz", "email": "c.cruz@stmarys.edu.ph",
        "is_active": True, "role": "teacher", "date_joined": "2025-08-01T00:00:00Z"
    }),
    "dario.tan": add_fixture("core.user", {
        "username": "dario.tan", "password": "pbkdf2_sha256$600000$placeholder$hash",
        "first_name": "Dario", "last_name": "Tan", "email": "d.tan@stmarys.edu.ph",
        "is_active": True, "role": "teacher", "date_joined": "2025-08-01T00:00:00Z"
    }),
}

# Parent users
maria_pk = add_fixture("core.user", {
    "username": "maria.delacruz",
    "password": "pbkdf2_sha256$600000$placeholder$hash",
    "first_name": "Maria",
    "last_name": "Dela Cruz",
    "email": "maria.delacruz@gmail.com",
    "is_active": True,
    "role": "parent",
    "phone": "+63 917 123 4567",
    "messenger_psid": "test_psid_001",
    "date_joined": "2025-08-01T00:00:00Z"
})

# Parent profile for Maria
add_fixture("core.parentprofile", {
    "user": maria_pk,
    "relationship": "Mother",
    "messenger_linked": True,
    "sms_enabled": False
})

print("✅ Generated School Settings, Departments, and Users")
print(f"   Total fixtures so far: {len(fixtures)}")


# ============================================================================
# 4. GRADE LEVELS
# ============================================================================
grade_levels = {}

# JHS Grade Levels
for level in [7, 8, 9, 10]:
    grade_levels[level] = add_fixture("core.gradelevel", {
        "department": jhs_pk,
        "level": level,
        "label": f"Grade {level}"
    })

# SHS Grade Levels
for level in [11, 12]:
    grade_levels[level] = add_fixture("core.gradelevel", {
        "department": shs_pk,
        "level": level,
        "label": f"Grade {level}"
    })

print("✅ Generated Grade Levels (7-12)")

# ============================================================================
# 5. SECTIONS
# ============================================================================
sections = {}

# Grade 7 Sections
sections['g7-sampaguita'] = add_fixture("core.section", {
    "grade_level": grade_levels[7],
    "name": "Sampaguita",
    "strand": None,
    "adviser": aurora_pk
})

sections['g7-rosal'] = add_fixture("core.section", {
    "grade_level": grade_levels[7],
    "name": "Rosal",
    "strand": None,
    "adviser": benjie_pk
})

# Grade 8 Sections
sections['g8-adelfa'] = add_fixture("core.section", {
    "grade_level": grade_levels[8],
    "name": "Adelfa",
    "strand": None,
    "adviser": teachers['carmela.cruz']
})

sections['g8-ilang-ilang'] = add_fixture("core.section", {
    "grade_level": grade_levels[8],
    "name": "Ilang-Ilang",
    "strand": None,
    "adviser": teachers['dario.tan']
})

# Grade 11 SHS Sections
sections['g11-stem-stjude'] = add_fixture("core.section", {
    "grade_level": grade_levels[11],
    "name": "St. Jude",
    "strand": "STEM",
    "adviser": aurora_pk
})

sections['g11-abm-sttherese'] = add_fixture("core.section", {
    "grade_level": grade_levels[11],
    "name": "St. Therese",
    "strand": "ABM",
    "adviser": benjie_pk
})

print("✅ Generated Sections")

# ============================================================================
# 6. LEARNERS (Students)
# ============================================================================
learners = {}

# Grade 7 - Sampaguita learners
learners['136728140987'] = add_fixture("core.learner", {
    "lrn": "136728140987",
    "first_name": "Juan",
    "middle_initial": "M",
    "last_name": "Dela Cruz",
    "birth_date": "2012-03-15",
    "sex": "M",
    "section": sections['g7-sampaguita'],
    "gpa": "92.00",
    "attendance_rate": "96.40",
    "barcode_value": "136728140987",
    "barcode_active": True,
    "parent_account": maria_pk,
    "parent_phone": "+63 917 123 4567",
    "parent_messenger_psid": "test_psid_001",
    "enrolled_at": "2025-08-26T00:00:00Z"
})

learners['136728140988'] = add_fixture("core.learner", {
    "lrn": "136728140988",
    "first_name": "Carlo",
    "middle_initial": "P",
    "last_name": "Villanueva",
    "birth_date": "2012-05-20",
    "sex": "M",
    "section": sections['g7-sampaguita'],
    "gpa": "87.00",
    "attendance_rate": "95.80",
    "barcode_value": "136728140988",
    "barcode_active": True,
    "enrolled_at": "2025-08-26T00:00:00Z"
})

learners['136728140989'] = add_fixture("core.learner", {
    "lrn": "136728140989",
    "first_name": "Bea",
    "middle_initial": "L",
    "last_name": "Soriano",
    "birth_date": "2012-07-10",
    "sex": "F",
    "section": sections['g7-sampaguita'],
    "gpa": "90.00",
    "attendance_rate": "97.10",
    "barcode_value": "136728140989",
    "barcode_active": True,
    "parent_account": maria_pk,
    "parent_phone": "+63 917 123 4567",
    "parent_messenger_psid": "test_psid_001",
    "enrolled_at": "2025-08-26T00:00:00Z"
})

# Grade 7 - Rosal learners
learners['136728140098'] = add_fixture("core.learner", {
    "lrn": "136728140098",
    "first_name": "Marco",
    "middle_initial": "T",
    "last_name": "Reyes",
    "birth_date": "2012-02-28",
    "sex": "M",
    "section": sections['g7-rosal'],
    "gpa": "68.00",
    "attendance_rate": "88.20",
    "barcode_value": "136728140098",
    "barcode_active": True,
    "enrolled_at": "2025-08-26T00:00:00Z"
})

# Grade 8 learners
learners['136728140455'] = add_fixture("core.learner", {
    "lrn": "136728140455",
    "first_name": "Karina",
    "middle_initial": "B",
    "last_name": "Bautista",
    "birth_date": "2011-04-12",
    "sex": "F",
    "section": sections['g8-adelfa'],
    "gpa": "86.00",
    "attendance_rate": "92.00",
    "barcode_value": "136728140455",
    "barcode_active": True,
    "enrolled_at": "2025-08-26T00:00:00Z"
})

# Grade 11 STEM learners
learners['136728140067'] = add_fixture("core.learner", {
    "lrn": "136728140067",
    "first_name": "Liza",
    "middle_initial": "R",
    "last_name": "Bautista",
    "birth_date": "2009-06-18",
    "sex": "F",
    "section": sections['g11-stem-stjude'],
    "gpa": "94.00",
    "attendance_rate": "96.80",
    "barcode_value": "136728140067",
    "barcode_active": True,
    "enrolled_at": "2025-08-26T00:00:00Z"
})

print(f"✅ Generated {len(learners)} Learners")

# ============================================================================
# 7. SUBJECTS
# ============================================================================
subjects = {}

# Grade 7 - Sampaguita subjects
jhs_subjects = ["Math", "Science", "English", "Filipino", "AP", "MAPEH", "Values Ed", "TLE"]

for subject_name in jhs_subjects:
    subject_pk = add_fixture("core.subject", {
        "section": sections['g7-sampaguita'],
        "teacher": aurora_pk,
        "name": subject_name,
        "quarter_weight_quiz": "30.00",
        "quarter_weight_exam": "40.00",
        "quarter_weight_activity": "30.00"
    })
    subjects[f"g7-sampaguita-{subject_name}"] = subject_pk

print(f"✅ Generated {len(subjects)} Subjects")


# ============================================================================
# 8. GRADES (Quarter Grades)
# ============================================================================

# Juan's grades (LRN: 136728140987)
juan_grades = {
    "Math": {"q1": 89, "q2": 91, "q3": 92},
    "Science": {"q1": 87, "q2": 88, "q3": 90},
    "English": {"q1": 85, "q2": 87, "q3": 88},
    "Filipino": {"q1": 91, "q2": 93, "q3": 94},
}

for subject_name, quarters in juan_grades.items():
    subject_pk = subjects[f"g7-sampaguita-{subject_name}"]
    for quarter, grade in quarters.items():
        q_num = int(quarter[1])
        add_fixture("core.grade", {
            "learner": learners['136728140987'],
            "subject": subject_pk,
            "quarter": q_num,
            "quiz_score": str(grade - 2),
            "exam_score": str(grade),
            "activity_score": str(grade + 1),
            "computed_grade": str(grade),
            "created_at": f"2026-0{q_num+2}-15T10:00:00Z",
            "updated_at": f"2026-0{q_num+2}-15T10:00:00Z"
        })

print("✅ Generated Grade Records")

# ============================================================================
# 9. ATTENDANCE RECORDS
# ============================================================================

# Juan's attendance (last 10 days)
attendance_dates = [
    ("2026-04-28", "07:38:00", "16:05:00", "present"),
    ("2026-04-29", "07:41:00", "16:10:00", "present"),
    ("2026-04-30", "08:15:00", "16:00:00", "late"),
    ("2026-05-05", "07:35:00", "16:08:00", "present"),
    ("2026-05-06", "07:42:00", "16:05:00", "present"),
    ("2026-05-07", "07:39:00", "16:10:00", "present"),
    ("2026-05-08", "07:40:00", "16:05:00", "present"),
    ("2026-05-09", None, None, "absent"),
    ("2026-05-10", "07:38:00", "16:10:00", "present"),
]

for date_str, time_in, time_out, status in attendance_dates:
    add_fixture("core.attendancerecord", {
        "learner": learners['136728140987'],
        "date": date_str,
        "time_in_morning": time_in,
        "time_out_afternoon": time_out,
        "time_in_afternoon": None,
        "time_out_morning": None,
        "status": status,
        "created_at": f"{date_str}T{time_in or '08:00:00'}Z",
        "updated_at": f"{date_str}T{time_in or '08:00:00'}Z"
    })

# Marco's attendance (at-risk - 5 consecutive absences)
for day in range(6, 11):
    add_fixture("core.attendancerecord", {
        "learner": learners['136728140098'],
        "date": f"2026-05-{day:02d}",
        "time_in_morning": None,
        "time_out_afternoon": None,
        "time_in_afternoon": None,
        "time_out_morning": None,
        "status": "absent",
        "created_at": f"2026-05-{day:02d}T08:00:00Z",
        "updated_at": f"2026-05-{day:02d}T08:00:00Z"
    })

print("✅ Generated Attendance Records")

# ============================================================================
# 10. CONDUCT LOGS
# ============================================================================

conduct_logs = [
    {
        "learner": learners['136728140987'],
        "date": "2026-05-05",
        "item": "Participated actively in Science Lab",
        "type": "Positive",
        "recorded_by": aurora_pk
    },
    {
        "learner": learners['136728140987'],
        "date": "2026-04-28",
        "item": "Submitted group project on time",
        "type": "Positive",
        "recorded_by": aurora_pk
    },
    {
        "learner": learners['136728140987'],
        "date": "2026-04-12",
        "item": "Late arrival — 8:15 AM",
        "type": "Note",
        "recorded_by": aurora_pk
    },
    {
        "learner": learners['136728140098'],
        "date": "2026-05-08",
        "item": "4th consecutive absence — referral to guidance",
        "type": "Warning",
        "recorded_by": benjie_pk
    },
]

for log in conduct_logs:
    add_fixture("core.conductlog", {
        **log,
        "created_at": f"{log['date']}T14:00:00Z"
    })

print("✅ Generated Conduct Logs")

# ============================================================================
# 11. ID CARD TEMPLATES & PRINT QUEUE
# ============================================================================

template_pk = add_fixture("core.idtemplate", {
    "name": "SY 2025-2026 Template",
    "background_path": "/templates/id_background_2025.png",
    "font_color": "#FFFFFF",
    "is_active": True,
    "created_at": "2025-08-20T00:00:00Z"
})

# ID print queue entries
add_fixture("core.idprintqueue", {
    "learner": learners['136728140987'],
    "template": template_pk,
    "reason": "lost",
    "status": "pending",
    "requested_by": admin_pk,
    "requested_at": "2026-05-08T10:00:00Z"
})

add_fixture("core.idprintqueue", {
    "learner": learners['136728140455'],
    "template": template_pk,
    "reason": "damaged",
    "status": "approved",
    "requested_by": admin_pk,
    "requested_at": "2026-05-07T10:00:00Z"
})

print("✅ Generated ID Templates and Print Queue")

# ============================================================================
# 12. NOTIFICATIONS
# ============================================================================

notifications = [
    {
        "parent": maria_pk,
        "learner": learners['136728140987'],
        "channel": "messenger",
        "status": "sent",
        "message": "Juan pumasok sa paaralan ngayong 7:38 AM — May 10",
        "triggered_by": "attendance_scan",
        "sent_at": "2026-05-10T07:38:00Z"
    },
    {
        "parent": maria_pk,
        "learner": learners['136728140987'],
        "channel": "messenger",
        "status": "sent",
        "message": "Bagong marka para kay Juan: Math Q3 = 92",
        "triggered_by": "grade_posted",
        "sent_at": "2026-05-09T14:00:00Z"
    },
    {
        "parent": maria_pk,
        "learner": learners['136728140989'],
        "channel": "messenger",
        "status": "sent",
        "message": "Bea pumasok sa paaralan ngayong 7:42 AM — May 10",
        "triggered_by": "attendance_scan",
        "sent_at": "2026-05-10T07:42:00Z"
    },
]

for notif in notifications:
    add_fixture("core.notificationrecord", notif)

print("✅ Generated Notification Records")

# ============================================================================
# 13. SCHOOL CALENDAR
# ============================================================================

# Add some school days and holidays
calendar_entries = [
    ("2026-04-09", "holiday", "Araw ng Kagitingan"),
    ("2026-04-10", "holiday", "Maundy Thursday"),
    ("2026-05-01", "holiday", "Labor Day"),
]

for date_str, cal_type, label in calendar_entries:
    add_fixture("core.schoolcalendar", {
        "date": date_str,
        "type": cal_type,
        "label": label
    })

print("✅ Generated School Calendar")

# ============================================================================
# SAVE TO FILE
# ============================================================================

output_file = "initial_data.json"
with open(output_file, 'w', encoding='utf-8') as f:
    json.dump(fixtures, f, indent=2, ensure_ascii=False)

print(f"\n🎉 SUCCESS! Generated {len(fixtures)} fixtures")
print(f"📄 Saved to: {output_file}")
print(f"\n📋 Next steps:")
print(f"   1. Run: python manage.py migrate")
print(f"   2. Run: python manage.py loaddata {output_file}")
print(f"   3. Run: python manage.py createsuperuser")
print(f"   4. Run: python manage.py runserver")
print(f"   5. Visit: http://127.0.0.1:8000/admin")
