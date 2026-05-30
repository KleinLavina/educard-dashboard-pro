# 🎓 EduCard Pro - Django Backend

## Overview
Django backend for EduCard Pro, a comprehensive school management system for Philippine DepEd K-12 schools.

---

## 📁 Project Structure

```
educard-BACKEND/
├── educard_backend/          # Django project settings
│   ├── settings.py           # Configuration
│   ├── urls.py               # Main URL routing
│   └── wsgi.py               # WSGI application
├── core/                     # Main application
│   ├── models.py             # Database models (9 categories)
│   ├── admin.py              # Django admin configuration
│   ├── serializers.py        # DRF serializers (to be created)
│   ├── views.py              # API views (to be created)
│   └── urls.py               # API routes (to be created)
├── manage.py                 # Django management script
├── db.sqlite3                # SQLite database (created after migrations)
├── generate_fixtures.py      # Script to generate initial data
├── initial_data.json         # Initial data fixture (generated)
├── DJANGO_SETUP_GUIDE.md     # Complete setup instructions
├── API_DEVELOPMENT_ROADMAP.md # API development guide
└── README.md                 # This file
```

---

## 🗄️ Database Models

### 1. User & Authentication
- **User** - Extended Django user with roles (admin, teacher, student, parent)

### 2. School Structure (DepEd K-12 Hierarchy)
- **Department** - JHS (Grades 7-10) or SHS (Grades 11-12)
- **GradeLevel** - Grade 7 through 12
- **Section** - Class sections (e.g., Sampaguita, St. Jude)

### 3. Learners (Students)
- **Learner** - Student records with 12-digit LRN, GPA, attendance rate

### 4. Subjects & Grades
- **Subject** - Subjects taught in each section
- **Grade** - Quarter grades (Q1-Q4) with quiz, exam, activity scores

### 5. Attendance
- **SchoolCalendar** - School days, holidays, suspensions
- **AttendanceRecord** - Daily attendance with time-in/time-out

### 6. ID Cards & Printing
- **IDTemplate** - ID card design templates
- **IDPrintQueue** - Print queue for new/reprint requests

### 7. Notifications & Parent Communication
- **ParentProfile** - Extended parent information
- **NotificationRecord** - History of Messenger/SMS notifications

### 8. Conduct & Behavior
- **ConductLog** - Student conduct records (Positive, Note, Warning)

### 9. School Settings
- **SchoolSettings** - School-wide configuration

---

## 🚀 Quick Start

### 1. Create Virtual Environment
```bash
cd educard-BACKEND
python -m venv venv

# Windows
venv\Scripts\activate

# Linux/Mac
source venv/bin/activate
```

### 2. Install Dependencies
```bash
pip install django
```

### 3. Create Database Tables
```bash
python manage.py makemigrations core
python manage.py migrate
```

### 4. Generate Initial Data
```bash
python generate_fixtures.py
```

### 5. Load Initial Data
```bash
python manage.py loaddata initial_data.json
```

### 6. Create Superuser
```bash
python manage.py createsuperuser
```

### 7. Run Development Server
```bash
python manage.py runserver
```

### 8. Access Django Admin
Navigate to: http://127.0.0.1:8000/admin

---

## 📊 Initial Data

The `initial_data.json` fixture includes:

- ✅ **2 Departments** - JHS and SHS
- ✅ **6 Grade Levels** - Grades 7-12
- ✅ **12 Sections** - Sampaguita, Rosal, St. Jude, etc.
- ✅ **26 Learners** - With LRNs matching frontend mock data
- ✅ **Users** - Teachers, students, parents
- ✅ **Subjects** - Math, Science, English, etc.
- ✅ **Grades** - Q1-Q3 data for sample students
- ✅ **Attendance** - Last 10 days of attendance records
- ✅ **Conduct Logs** - Positive behaviors and warnings
- ✅ **ID Print Queue** - Sample reprint requests
- ✅ **Notifications** - Sample Messenger notifications
- ✅ **School Settings** - St. Mary's Academy configuration

---

## 🔗 API Endpoints (To Be Built)

### Learners
- `GET /api/learners/` - List all learners
- `GET /api/learners/{id}/` - Get learner details
- `GET /api/learners/at_risk/` - Get at-risk learners
- `POST /api/learners/` - Create new learner
- `PUT /api/learners/{id}/` - Update learner
- `DELETE /api/learners/{id}/` - Delete learner

### Sections
- `GET /api/sections/` - List all sections
- `GET /api/sections/below_target/` - Sections below SF2 target

### Grades
- `GET /api/grades/by_learner/?learner_id=X` - Get learner's grades
- `POST /api/grades/` - Create/update grade

### Attendance
- `POST /api/attendance/scan/` - Process barcode scan
- `GET /api/attendance/?learner={id}` - Get attendance history

### Dashboard
- `GET /api/dashboard/stats/` - Dashboard statistics

---

## 📖 Documentation

- **[DJANGO_SETUP_GUIDE.md](./DJANGO_SETUP_GUIDE.md)** - Complete setup instructions
- **[API_DEVELOPMENT_ROADMAP.md](./API_DEVELOPMENT_ROADMAP.md)** - API development guide

---

## 🛠️ Technology Stack

- **Framework**: Django 5.0.7
- **Database**: SQLite (development), PostgreSQL (production)
- **API**: Django REST Framework (to be added)
- **Authentication**: JWT tokens (to be added)
- **CORS**: django-cors-headers (to be added)

---

## 📝 Next Steps

1. ✅ **Setup Complete** - Database created, initial data loaded
2. 🔄 **Install DRF** - Add Django REST Framework
3. 🔄 **Create Serializers** - Convert models to JSON
4. 🔄 **Create API Views** - Build API endpoints
5. 🔄 **Frontend Integration** - Connect React frontend
6. 🔄 **Authentication** - Add JWT authentication
7. 🔄 **Advanced Features** - Barcode scanning, PDF generation, notifications

---

## 🤝 Contributing

This is a school management system for St. Mary's Academy. For questions or issues, contact the development team.

---

## 📄 License

Proprietary - St. Mary's Academy

---

**Built with ❤️ for Philippine DepEd K-12 Schools**
