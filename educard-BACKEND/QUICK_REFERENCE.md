# 🚀 EduCard Pro - Quick Reference Card

## Essential Commands

### 🔧 Setup (One-Time)
```bash
# Navigate to backend
cd educard-BACKEND

# Create virtual environment
python -m venv venv

# Activate virtual environment (Windows)
venv\Scripts\activate

# Activate virtual environment (Linux/Mac)
source venv/bin/activate

# Install Django
pip install django

# Create migrations
python manage.py makemigrations core

# Apply migrations
python manage.py migrate

# Generate fixture data
python generate_fixtures.py

# Load initial data
python manage.py loaddata initial_data.json

# Create admin user
python manage.py createsuperuser
```

---

### 🏃 Daily Development
```bash
# Start server
python manage.py runserver

# Access Django Admin
# http://127.0.0.1:8000/admin

# Stop server
# Ctrl+C
```

---

### 📊 Database Management
```bash
# Create migrations after model changes
python manage.py makemigrations

# Apply migrations
python manage.py migrate

# Show all migrations
python manage.py showmigrations

# Reset database (WARNING: Deletes all data)
python manage.py flush

# Create backup
python manage.py dumpdata > backup.json

# Restore from backup
python manage.py loaddata backup.json

# Open Django shell
python manage.py shell
```

---

### 🔍 Inspection & Debugging
```bash
# Check for issues
python manage.py check

# Show SQL for migration
python manage.py sqlmigrate core 0001

# List all installed apps
python manage.py showmigrations

# Test database connection
python manage.py dbshell
```

---

### 📦 Package Management
```bash
# Install package
pip install package-name

# Save dependencies
pip freeze > requirements.txt

# Install from requirements
pip install -r requirements.txt

# Uninstall package
pip uninstall package-name
```

---

## 🗂️ File Locations

| File | Purpose |
|------|---------|
| `core/models.py` | Database models |
| `core/admin.py` | Django admin config |
| `core/serializers.py` | API serializers (to create) |
| `core/views.py` | API views (to create) |
| `core/urls.py` | API routes (to create) |
| `educard_backend/settings.py` | Project settings |
| `educard_backend/urls.py` | Main URL config |
| `db.sqlite3` | SQLite database |
| `initial_data.json` | Fixture data |

---

## 🔑 Model Quick Reference

### Learner
```python
from core.models import Learner

# Get all learners
learners = Learner.objects.all()

# Get by LRN
juan = Learner.objects.get(lrn='136728140987')

# Get at-risk learners
at_risk = Learner.objects.filter(gpa__lt=75)

# Create new learner
learner = Learner.objects.create(
    lrn='123456789012',
    first_name='Test',
    last_name='Student',
    birth_date='2012-01-01',
    sex='M',
    section_id=1
)
```

### Grade
```python
from core.models import Grade

# Get learner's grades
grades = Grade.objects.filter(learner__lrn='136728140987')

# Get Q3 grades
q3_grades = Grade.objects.filter(quarter=3)

# Create grade
grade = Grade.objects.create(
    learner_id=1,
    subject_id=1,
    quarter=3,
    quiz_score=85,
    exam_score=90,
    activity_score=88
)
# computed_grade is auto-calculated
```

### AttendanceRecord
```python
from core.models import AttendanceRecord
from datetime import date

# Get today's attendance
today = AttendanceRecord.objects.filter(date=date.today())

# Get learner's attendance
attendance = AttendanceRecord.objects.filter(
    learner__lrn='136728140987'
)

# Create attendance record
record = AttendanceRecord.objects.create(
    learner_id=1,
    date=date.today(),
    time_in_morning='07:30:00',
    status='present'
)
```

---

## 🌐 API Endpoints (Future)

### Learners
```bash
GET    /api/learners/              # List all
GET    /api/learners/{id}/         # Get one
POST   /api/learners/              # Create
PUT    /api/learners/{id}/         # Update
DELETE /api/learners/{id}/         # Delete
GET    /api/learners/at_risk/      # At-risk learners
```

### Sections
```bash
GET    /api/sections/              # List all
GET    /api/sections/below_target/ # Below SF2 target
```

### Grades
```bash
GET    /api/grades/                # List all
GET    /api/grades/by_learner/?learner_id=X
POST   /api/grades/                # Create/update
```

### Attendance
```bash
GET    /api/attendance/            # List all
POST   /api/attendance/scan/       # Barcode scan
```

### Dashboard
```bash
GET    /api/dashboard/stats/       # Statistics
```

---

## 🧪 Testing in Django Shell

```bash
python manage.py shell
```

```python
# Import models
from core.models import Learner, Section, Grade

# Get all learners
learners = Learner.objects.all()
print(f"Total learners: {learners.count()}")

# Get Juan
juan = Learner.objects.get(lrn='136728140987')
print(f"Name: {juan.full_name}")
print(f"GPA: {juan.gpa}")
print(f"Status: {juan.status}")

# Get his section
print(f"Section: {juan.section}")

# Get his grades
grades = juan.grades.all()
for grade in grades:
    print(f"{grade.subject.name} Q{grade.quarter}: {grade.computed_grade}")

# Get at-risk learners
from django.db.models import Q
at_risk = Learner.objects.filter(Q(gpa__lt=75) | Q(attendance_rate__lt=95))
print(f"At-risk count: {at_risk.count()}")

# Exit shell
exit()
```

---

## 🔐 Admin Credentials

After running `python manage.py createsuperuser`:

```
URL: http://127.0.0.1:8000/admin
Username: admin
Password: (your password)
```

---

## 📝 Common Tasks

### Add a new learner via Django Admin
1. Start server: `python manage.py runserver`
2. Go to: http://127.0.0.1:8000/admin
3. Click "Learners" → "Add Learner"
4. Fill in required fields
5. Click "Save"

### View all grades for a student
1. Go to Django Admin
2. Click "Grades"
3. Filter by learner name
4. View all quarters

### Check attendance records
1. Go to Django Admin
2. Click "Attendance records"
3. Filter by date or learner
4. View time-in/time-out

### Generate new fixture data
1. Edit `generate_fixtures.py`
2. Run: `python generate_fixtures.py`
3. Load: `python manage.py loaddata initial_data.json`

---

## 🚨 Troubleshooting

### Server won't start
```bash
# Check if port 8000 is in use
netstat -ano | findstr :8000

# Use different port
python manage.py runserver 8080
```

### Migration errors
```bash
# Delete migrations and start fresh
# 1. Delete core/migrations/*.py (except __init__.py)
# 2. Delete db.sqlite3
# 3. Run makemigrations and migrate again
```

### Can't log in to admin
```bash
# Reset admin password
python manage.py changepassword admin
```

### Database locked error
```bash
# Close all connections to db.sqlite3
# Stop the server (Ctrl+C)
# Restart the server
```

---

## 📚 Documentation Links

- **Django Docs**: https://docs.djangoproject.com/
- **Django Models**: https://docs.djangoproject.com/en/5.0/topics/db/models/
- **Django Admin**: https://docs.djangoproject.com/en/5.0/ref/contrib/admin/
- **Django ORM**: https://docs.djangoproject.com/en/5.0/topics/db/queries/

---

## 🎯 Next Steps Checklist

- [ ] Install Django REST Framework
- [ ] Create serializers
- [ ] Create API views
- [ ] Create URL routes
- [ ] Test API endpoints
- [ ] Connect frontend to API
- [ ] Add authentication
- [ ] Deploy to production

---

**Keep this file handy for quick reference!** 📌
