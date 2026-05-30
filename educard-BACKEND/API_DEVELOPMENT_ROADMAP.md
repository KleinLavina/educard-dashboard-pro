# 🚀 EduCard Pro - API Development Roadmap

## Overview
This document outlines the step-by-step process to build REST API endpoints that will replace your frontend's mock data with real database queries.

---

## Phase 1: Setup Django REST Framework (Week 1)

### Step 1: Install Required Packages
```bash
pip install djangorestframework django-cors-headers djangorestframework-simplejwt
pip freeze > requirements.txt
```

### Step 2: Update settings.py

Add to `INSTALLED_APPS`:
```python
INSTALLED_APPS = [
    # ... existing apps
    'rest_framework',
    'corsheaders',
]
```

Add to `MIDDLEWARE` (at the top):
```python
MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',  # Add this first
    'django.middleware.security.SecurityMiddleware',
    # ... rest of middleware
]
```

Add REST Framework and CORS configuration:
```python
# REST Framework Configuration
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ],
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticatedOrReadOnly',
    ],
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 25,
}

# CORS Configuration
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://localhost:5173",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:5173",
]

CORS_ALLOW_CREDENTIALS = True
```

---

## Phase 2: Create Serializers (Week 1-2)

### Create `core/serializers.py`

```python
from rest_framework import serializers
from .models import (
    User, Department, GradeLevel, Section, Learner,
    Subject, Grade, AttendanceRecord, SchoolSettings
)

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'role']
        
class DepartmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Department
        fields = '__all__'

class GradeLevelSerializer(serializers.ModelSerializer):
    department_name = serializers.CharField(source='department.label', read_only=True)
    
    class Meta:
        model = GradeLevel
        fields = ['id', 'level', 'label', 'department', 'department_name']

class SectionSerializer(serializers.ModelSerializer):
    grade_level_label = serializers.CharField(source='grade_level.label', read_only=True)
    adviser_name = serializers.SerializerMethodField()
    enrollment_count = serializers.IntegerField(read_only=True)
    average_attendance = serializers.DecimalField(max_digits=5, decimal_places=2, read_only=True)
    
    class Meta:
        model = Section
        fields = ['id', 'name', 'strand', 'grade_level', 'grade_level_label', 
                  'adviser', 'adviser_name', 'enrollment_count', 'average_attendance']
    
    def get_adviser_name(self, obj):
        return obj.adviser.get_full_name() if obj.adviser else None

class LearnerSerializer(serializers.ModelSerializer):
    full_name = serializers.CharField(read_only=True)
    section_label = serializers.SerializerMethodField()
    status = serializers.CharField(read_only=True)
    
    class Meta:
        model = Learner
        fields = ['id', 'lrn', 'first_name', 'middle_initial', 'last_name', 'full_name',
                  'birth_date', 'sex', 'section', 'section_label', 'gpa', 'attendance_rate',
                  'status', 'barcode_active', 'photo_path']
    
    def get_section_label(self, obj):
        if obj.section:
            if obj.section.strand:
                return f"{obj.section.grade_level.label} - {obj.section.strand} - {obj.section.name}"
            return f"{obj.section.grade_level.label} - {obj.section.name}"
        return None

class GradeSerializer(serializers.ModelSerializer):
    learner_name = serializers.CharField(source='learner.full_name', read_only=True)
    subject_name = serializers.CharField(source='subject.name', read_only=True)
    
    class Meta:
        model = Grade
        fields = ['id', 'learner', 'learner_name', 'subject', 'subject_name', 
                  'quarter', 'quiz_score', 'exam_score', 'activity_score', 'computed_grade']

class AttendanceRecordSerializer(serializers.ModelSerializer):
    learner_name = serializers.CharField(source='learner.full_name', read_only=True)
    
    class Meta:
        model = AttendanceRecord
        fields = ['id', 'learner', 'learner_name', 'date', 'time_in_morning', 
                  'time_out_morning', 'time_in_afternoon', 'time_out_afternoon', 'status']

class SchoolSettingsSerializer(serializers.ModelSerializer):
    class Meta:
        model = SchoolSettings
        fields = '__all__'
```

---

## Phase 3: Create API Views (Week 2-3)

### Create `core/views.py`

```python
from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Count, Avg, Q
from .models import (
    Department, GradeLevel, Section, Learner,
    Subject, Grade, AttendanceRecord, SchoolSettings
)
from .serializers import (
    DepartmentSerializer, GradeLevelSerializer, SectionSerializer,
    LearnerSerializer, GradeSerializer, AttendanceRecordSerializer,
    SchoolSettingsSerializer
)

class DepartmentViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Department.objects.all()
    serializer_class = DepartmentSerializer

class GradeLevelViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = GradeLevel.objects.all()
    serializer_class = GradeLevelSerializer
    filter_backends = [filters.SearchFilter]
    filterset_fields = ['department']

class SectionViewSet(viewsets.ModelViewSet):
    queryset = Section.objects.all()
    serializer_class = SectionSerializer
    filter_backends = [filters.SearchFilter]
    filterset_fields = ['grade_level', 'strand']
    
    @action(detail=False, methods=['get'])
    def below_target(self, request):
        """Get sections below SF2 target attendance"""
        target = 95.0
        sections = Section.objects.annotate(
            avg_attendance=Avg('learners__attendance_rate')
        ).filter(avg_attendance__lt=target)
        serializer = self.get_serializer(sections, many=True)
        return Response(serializer.data)

class LearnerViewSet(viewsets.ModelViewSet):
    queryset = Learner.objects.all()
    serializer_class = LearnerSerializer
    filter_backends = [filters.SearchFilter]
    search_fields = ['lrn', 'first_name', 'last_name']
    filterset_fields = ['section', 'section__grade_level']
    
    @action(detail=False, methods=['get'])
    def at_risk(self, request):
        """Get at-risk learners (GPA < 75 or attendance < 95%)"""
        learners = Learner.objects.filter(
            Q(gpa__lt=75) | Q(attendance_rate__lt=95)
        )
        serializer = self.get_serializer(learners, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def upload_photo(self, request, pk=None):
        """Upload student photo"""
        learner = self.get_object()
        photo = request.FILES.get('photo')
        if photo:
            # Save photo logic here
            learner.photo_path = f'/photos/{learner.lrn}.jpg'
            learner.save()
            return Response({'photo_path': learner.photo_path})
        return Response({'error': 'No photo provided'}, status=400)

class GradeViewSet(viewsets.ModelViewSet):
    queryset = Grade.objects.all()
    serializer_class = GradeSerializer
    filterset_fields = ['learner', 'subject', 'quarter']
    
    @action(detail=False, methods=['get'])
    def by_learner(self, request):
        """Get all grades for a specific learner"""
        learner_id = request.query_params.get('learner_id')
        if learner_id:
            grades = Grade.objects.filter(learner_id=learner_id)
            serializer = self.get_serializer(grades, many=True)
            return Response(serializer.data)
        return Response({'error': 'learner_id required'}, status=400)

class AttendanceRecordViewSet(viewsets.ModelViewSet):
    queryset = AttendanceRecord.objects.all()
    serializer_class = AttendanceRecordSerializer
    filterset_fields = ['learner', 'date', 'status']
    
    @action(detail=False, methods=['post'])
    def scan(self, request):
        """Process barcode scan for attendance"""
        barcode = request.data.get('barcode_value')
        session = request.data.get('session')  # time_in_morning, etc.
        
        try:
            learner = Learner.objects.get(barcode_value=barcode, barcode_active=True)
            from datetime import date, datetime
            today = date.today()
            
            record, created = AttendanceRecord.objects.get_or_create(
                learner=learner,
                date=today,
                defaults={'status': 'present'}
            )
            
            # Set the appropriate time field
            setattr(record, session, datetime.now().time())
            record.status = 'present'
            record.save()
            
            return Response({
                'success': True,
                'learner': LearnerSerializer(learner).data,
                'record': AttendanceRecordSerializer(record).data
            })
        except Learner.DoesNotExist:
            return Response({'error': 'Invalid or inactive barcode'}, status=404)

class DashboardViewSet(viewsets.ViewSet):
    """Dashboard statistics"""
    
    @action(detail=False, methods=['get'])
    def stats(self, request):
        """Get dashboard statistics"""
        total_learners = Learner.objects.count()
        avg_attendance = Learner.objects.aggregate(Avg('attendance_rate'))['attendance_rate__avg']
        at_risk_count = Learner.objects.filter(
            Q(gpa__lt=75) | Q(attendance_rate__lt=95)
        ).count()
        sections_below_target = Section.objects.annotate(
            avg_attendance=Avg('learners__attendance_rate')
        ).filter(avg_attendance__lt=95).count()
        
        return Response({
            'total_learners': total_learners,
            'campus_attendance': round(avg_attendance, 2) if avg_attendance else 0,
            'at_risk_count': at_risk_count,
            'sections_below_target': sections_below_target
        })
```

---

## Phase 4: Create URL Routes (Week 3)

### Create `core/urls.py`

```python
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    DepartmentViewSet, GradeLevelViewSet, SectionViewSet,
    LearnerViewSet, GradeViewSet, AttendanceRecordViewSet,
    DashboardViewSet
)

router = DefaultRouter()
router.register(r'departments', DepartmentViewSet)
router.register(r'grade-levels', GradeLevelViewSet)
router.register(r'sections', SectionViewSet)
router.register(r'learners', LearnerViewSet)
router.register(r'grades', GradeViewSet)
router.register(r'attendance', AttendanceRecordViewSet)
router.register(r'dashboard', DashboardViewSet, basename='dashboard')

urlpatterns = [
    path('', include(router.urls)),
]
```

### Update `educard_backend/urls.py`

```python
from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('core.urls')),
]
```

---

## Phase 5: Test API Endpoints (Week 3)

### Start the server:
```bash
python manage.py runserver
```

### Test endpoints:
```bash
# Get all learners
curl http://localhost:8000/api/learners/

# Get at-risk learners
curl http://localhost:8000/api/learners/at_risk/

# Get dashboard stats
curl http://localhost:8000/api/dashboard/stats/

# Get sections below target
curl http://localhost:8000/api/sections/below_target/

# Search learners by LRN
curl http://localhost:8000/api/learners/?search=136728140987
```

---

## Phase 6: Frontend Integration (Week 4)

### Create API client in frontend

Create `educard-FRONTEND/src/lib/api.ts`:

```typescript
const API_BASE_URL = 'http://localhost:8000/api';

export async function fetchAPI(endpoint: string, options = {}) {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });
  
  if (!response.ok) {
    throw new Error(`API Error: ${response.statusText}`);
  }
  
  return response.json();
}

// Learners
export const getLearners = () => fetchAPI('/learners/');
export const getLearner = (id: number) => fetchAPI(`/learners/${id}/`);
export const getAtRiskLearners = () => fetchAPI('/learners/at_risk/');

// Sections
export const getSections = () => fetchAPI('/sections/');
export const getSectionsBelowTarget = () => fetchAPI('/sections/below_target/');

// Dashboard
export const getDashboardStats = () => fetchAPI('/dashboard/stats/');

// Grades
export const getLearnerGrades = (learnerId: number) => 
  fetchAPI(`/grades/by_learner/?learner_id=${learnerId}`);

// Attendance
export const scanAttendance = (barcodeValue: string, session: string) =>
  fetchAPI('/attendance/scan/', {
    method: 'POST',
    body: JSON.stringify({ barcode_value: barcodeValue, session }),
  });
```

### Update frontend components

Example: `educard-FRONTEND/src/routes/students.tsx`

```typescript
import { useEffect, useState } from 'react';
import { getLearners } from '@/lib/api';

export default function StudentsPage() {
  const [learners, setLearners] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    getLearners()
      .then(data => {
        setLearners(data.results || data);
        setLoading(false);
      })
      .catch(error => {
        console.error('Failed to load learners:', error);
        setLoading(false);
      });
  }, []);
  
  if (loading) return <div>Loading...</div>;
  
  return (
    <div>
      {learners.map(learner => (
        <div key={learner.id}>{learner.full_name}</div>
      ))}
    </div>
  );
}
```

---

## Next Steps Summary

1. ✅ **Week 1**: Install DRF, create serializers
2. ✅ **Week 2-3**: Create API views and URL routes
3. ✅ **Week 3**: Test all endpoints with curl/Postman
4. ✅ **Week 4**: Create frontend API client
5. ✅ **Week 4**: Replace mock data in components
6. 🔄 **Week 5+**: Add authentication, permissions, advanced features

---

## API Endpoint Reference

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/learners/` | GET | List all learners |
| `/api/learners/{id}/` | GET | Get learner details |
| `/api/learners/at_risk/` | GET | Get at-risk learners |
| `/api/sections/` | GET | List all sections |
| `/api/sections/below_target/` | GET | Sections below SF2 target |
| `/api/grades/by_learner/?learner_id=X` | GET | Get learner's grades |
| `/api/attendance/scan/` | POST | Process barcode scan |
| `/api/dashboard/stats/` | GET | Dashboard statistics |

---

**Ready to build your API!** 🚀
