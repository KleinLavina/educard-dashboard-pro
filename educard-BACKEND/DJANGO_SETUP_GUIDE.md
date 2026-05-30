# 🚀 EduCard Pro - Django Backend Setup Guide

## 📋 Overview
This guide will help you set up the Django backend for EduCard Pro, create the database tables, and load initial data that matches your frontend mock data.

---

## 1️⃣ MODEL ARCHITECTURE

### Database Schema Overview

The Django models are organized into 9 main categories:

#### **1. User & Authentication**
- `User` - Extended Django user with roles (admin, teacher, student, parent)

#### **2. School Structure (DepEd K-12 Hierarchy)**
- `Department` - JHS (Grades 7-10) or SHS (Grades 11-12)
- `GradeLevel` - Grade 7 through 12
- `Section` - Class sections (e.g., Sampaguita, St. Jude)

#### **3. Learners (Students)**
- `Learner` - Student records with 12-digit LRN, GPA, attendance rate

#### **4. Subjects & Grades**
- `Subject` - Subjects taught in each section
- `Grade` - Quarter grades (Q1-Q4) with quiz, exam, activity scores

#### **5. Attendance**
- `SchoolCalendar` - School days, holidays, suspensions
- `AttendanceRecord` - Daily attendance with time-in/time-out

#### **6. ID Cards & Printing**
- `IDTemplate` - ID card design templates
- `IDPrintQueue` - Print queue for new/reprint requests

#### **7. Notifications & Parent Communication**
- `ParentProfile` - Extended parent information
- `NotificationRecord` - History of Messenger/SMS notifications

#### **8. Conduct & Behavior**
- `ConductLog` - Student conduct records (Positive, Note, Warning)

#### **9. School Settings**
- `SchoolSettings` - School-wide configuration (name, year, quarters, SF2 target)

---

## 2️⃣ DATABASE RELATIONSHIPS

### Key Relationships:

```
Department (JHS/SHS)
  └── GradeLevel (7-12)
      └── Section (Sampaguita, Rosal, etc.)
          ├── Learner (students with LRN)
          │   ├── AttendanceRecord (daily attendance)
          │   ├── Grade (quarter grades)
          │   ├── ConductLog (behavior records)
          │   └── IDPrintQueue (ID card requests)
          └── Subject (Math, Science, etc.)
              └── Grade (learner grades per subject)

User (role-based)
  ├── Teacher → Section (adviser)
  ├── Teacher → Subject (teacher)
  ├── Student → Learner (user_account)
  ├── Parent → Learner (parent_account)
  └── Admin (school management)
```

### Relationship Types:
- **One-to-Many**: Department → GradeLevel, GradeLevel → Section, Section → Learner
- **Many-to-One**: Learner → Section, Grade → Learner, Grade → Subject
- **One-to-One**: User ↔ Learner (student account), User ↔ ParentProfile
- **Foreign Keys**: All relationships use ForeignKey with appropriate on_delete behavior

---

## 3️⃣ MIGRATIONS & DATABASE CREATION

### Step 1: Navigate to Backend Directory
```bash
cd educard-BACKEND
```

### Step 2: Create Virtual Environment (Recommended)
```bash
# Windows
python -m venv venv
venv\Scripts\activate

# Linux/Mac
python3 -m venv venv
source venv/bin/activate
```

### Step 3: Install Django (if not already installed)
```bash
pip install django
```

### Step 4: Create Migrations
This command analyzes your models and creates migration files:
```bash
python manage.py makemigrations core
```

**Expected Output:**
```
Migrations for 'core':
  core/migrations/0001_initial.py
    - Create model User
    - Create model Department
    - Create model GradeLevel
    - Create model Section
    - Create model Learner
    - Create model Subject
    - Create model Grade
    - Create model SchoolCalendar
    - Create model AttendanceRecord
    - Create model IDTemplate
    - Create model IDPrintQueue
    - Create model ParentProfile
    - Create model NotificationRecord
    - Create model ConductLog
    - Create model SchoolSettings
```

### Step 5: Apply Migrations (Create Tables in db.sqlite3)
```bash
python manage.py migrate
```

**Expected Output:**
```
Operations to perform:
  Apply all migrations: admin, auth, contenttypes, core, sessions
Running migrations:
  Applying contenttypes.0001_initial... OK
  Applying contenttypes.0002_remove_content_type_name... OK
  Applying auth.0001_initial... OK
  ...
  Applying core.0001_initial... OK
```

✅ **Your `db.sqlite3` file now contains all the tables!**

---

## 4️⃣ CREATE SUPERUSER (Admin Account)

```bash
python manage.py createsuperuser
```

**Prompts:**
```
Username: admin
Email: admin@stmarys.edu.ph
Password: ********
Password (again): ********
```

✅ **You can now log in to Django Admin at http://127.0.0.1:8000/admin**

---

## 5️⃣ SEEDING INITIAL DATA (Django Fixtures)

### What is a Fixture?
A fixture is a JSON file containing initial data that Django can load into your database.

### Step 1: Create Fixture File
I'll create a fixture file that matches your frontend mock data from `school-data.ts`.

The fixture will include:
- 2 Departments (JHS, SHS)
- 6 Grade Levels (7-12)
- 12 Sections (Sampaguita, Rosal, St. Jude, etc.)
- 26 Learners with LRNs matching your frontend
- Users (teachers, students, parents)
- Subjects (Math, Science, English, etc.)
- Grades (Q1-Q3 data)
- Attendance records
- School settings

### Step 2: Load Fixture into Database
```bash
python manage.py loaddata initial_data.json
```

**Expected Output:**
```
Installed 150 object(s) from 1 fixture(s)
```

✅ **Your database now has data matching your frontend!**

---

## 6️⃣ VERIFY DATA IN DJANGO ADMIN

### Step 1: Start Development Server
```bash
python manage.py runserver
```

### Step 2: Open Django Admin
Navigate to: http://127.0.0.1:8000/admin

### Step 3: Log in with Superuser Credentials

### Step 4: Verify Data
Check these sections:
- ✅ **Departments** - Should see JHS and SHS
- ✅ **Grade Levels** - Should see Grades 7-12
- ✅ **Sections** - Should see Sampaguita, Rosal, St. Jude, etc.
- ✅ **Learners** - Should see 26 students with LRNs
- ✅ **Users** - Should see teachers, students, parents
- ✅ **Grades** - Should see quarter grades
- ✅ **Attendance Records** - Should see attendance logs
- ✅ **School Settings** - Should see St. Mary's Academy settings

---

## 7️⃣ NEXT STEPS: BRIDGING FRONTEND & BACKEND

### Phase 1: Install Django REST Framework
```bash
pip install djangorestframework django-cors-headers
```

### Phase 2: Update settings.py
Add to `INSTALLED_APPS`:
```python
'rest_framework',
'corsheaders',
```

Add to `MIDDLEWARE` (at the top):
```python
'corsheaders.middleware.CorsMiddleware',
```

Add CORS settings:
```python
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://localhost:5173",
]
```

### Phase 3: Create API Serializers
Create `core/serializers.py` to convert models to JSON:
- `LearnerSerializer`
- `SectionSerializer`
- `GradeSerializer`
- `AttendanceSerializer`
- etc.

### Phase 4: Create API Views
Create `core/views.py` with ViewSets:
- `LearnerViewSet` - CRUD for students
- `SectionViewSet` - List sections
- `GradeViewSet` - Grade management
- `AttendanceViewSet` - Attendance tracking

### Phase 5: Create API URLs
Create `core/urls.py` and register routes:
```python
router = DefaultRouter()
router.register(r'learners', LearnerViewSet)
router.register(r'sections', SectionViewSet)
router.register(r'grades', GradeViewSet)
router.register(r'attendance', AttendanceViewSet)
```

### Phase 6: Update Frontend API Client
In `educard-FRONTEND/src/lib/api.ts`:
```typescript
const API_BASE_URL = 'http://localhost:8000/api';

export async function getLearners() {
  const response = await fetch(`${API_BASE_URL}/learners/`);
  return response.json();
}
```

### Phase 7: Replace Mock Data
In your frontend components:
```typescript
// OLD: import { allLearners } from '@/lib/school-data';
// NEW:
const [learners, setLearners] = useState([]);
useEffect(() => {
  getLearners().then(setLearners);
}, []);
```

---

## 8️⃣ ROADMAP: COMPLETE BACKEND INTEGRATION

### Week 1-2: Core API Endpoints
- [ ] Students API (GET, POST, PUT, DELETE)
- [ ] Sections API (GET, LIST)
- [ ] Grades API (GET, POST, PUT)
- [ ] Attendance API (GET, POST)
- [ ] Dashboard Stats API

### Week 3-4: Authentication & Authorization
- [ ] JWT Token Authentication
- [ ] Role-based permissions (Admin, Teacher, Student, Parent)
- [ ] Login/Logout endpoints
- [ ] User profile endpoints

### Week 5-6: Advanced Features
- [ ] Barcode scanning endpoint
- [ ] ID card generation (PDF)
- [ ] Report card generation (PDF)
- [ ] Bulk grade import (CSV/Excel)

### Week 7-8: Notifications
- [ ] Facebook Messenger integration
- [ ] SMS integration (Semaphore)
- [ ] Notification history API
- [ ] Parent notification settings

### Week 9-10: Testing & Deployment
- [ ] Unit tests for models
- [ ] API endpoint tests
- [ ] Frontend integration tests
- [ ] Deploy to production server

---

## 9️⃣ USEFUL COMMANDS

### Database Management
```bash
# Create new migrations after model changes
python manage.py makemigrations

# Apply migrations
python manage.py migrate

# Reset database (WARNING: Deletes all data)
python manage.py flush

# Create database backup
python manage.py dumpdata > backup.json

# Load data from backup
python manage.py loaddata backup.json
```

### Development
```bash
# Start development server
python manage.py runserver

# Start on different port
python manage.py runserver 8080

# Create superuser
python manage.py createsuperuser

# Open Django shell (interactive Python)
python manage.py shell
```

### Data Inspection
```bash
# Show all migrations
python manage.py showmigrations

# Check for model issues
python manage.py check

# Generate SQL for migrations (without applying)
python manage.py sqlmigrate core 0001
```

---

## 🔟 TROUBLESHOOTING

### Issue: "No module named 'core'"
**Solution:** Make sure you're in the `educard-BACKEND` directory and `core` app is in `INSTALLED_APPS`.

### Issue: "Table already exists"
**Solution:** Delete `db.sqlite3` and run `python manage.py migrate` again.

### Issue: "AUTH_USER_MODEL is not defined"
**Solution:** Make sure `AUTH_USER_MODEL = 'core.User'` is in `settings.py`.

### Issue: Fixture loading fails
**Solution:** Make sure migrations are applied first: `python manage.py migrate`

### Issue: CORS errors in frontend
**Solution:** Install `django-cors-headers` and configure `CORS_ALLOWED_ORIGINS` in settings.

---

## 📚 ADDITIONAL RESOURCES

- **Django Documentation:** https://docs.djangoproject.com/
- **Django REST Framework:** https://www.django-rest-framework.org/
- **DepEd K-12 Curriculum:** https://www.deped.gov.ph/k-to-12/
- **Philippine LRN System:** https://lrmds.deped.gov.ph/

---

## ✅ CHECKLIST

- [ ] Virtual environment created and activated
- [ ] Django installed
- [ ] Migrations created (`makemigrations`)
- [ ] Migrations applied (`migrate`)
- [ ] Superuser created
- [ ] Development server running
- [ ] Django Admin accessible
- [ ] Initial data fixture loaded
- [ ] Data verified in Django Admin
- [ ] Ready to build API endpoints!

---

**Next Document:** See `API_DEVELOPMENT_ROADMAP.md` for detailed API endpoint specifications.
