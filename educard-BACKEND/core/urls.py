"""
EduCard Pro — API URL Configuration
All endpoints mounted under /api/ in the main urls.py
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView

from .views import (
    LoginView, MeView,
    DashboardStatsView, DashboardDepartmentsView,
    DepartmentViewSet, GradeLevelViewSet, SectionViewSet,
    LearnerViewSet, SubjectViewSet, GradeViewSet, GradeAuditLogViewSet,
    SchoolCalendarViewSet, AttendanceRecordViewSet,
    IDTemplateViewSet, IDCardElementPositionViewSet, IDPrintQueueViewSet,
    NotificationRecordViewSet, NotificationPreferenceViewSet,
    ConductLogViewSet, MessageViewSet,
    GraduationViewSet, AbsenceAlertViewSet,
    ReportCardViewSet, SF1RecordViewSet, SF2ReportViewSet,
    SchoolSettingsView, AdminTaskViewSet, ActivityLogViewSet,
    TeacherContactViewSet,
    TenantViewSet, SubscriptionInvoiceViewSet,
)

router = DefaultRouter()

# School structure
router.register(r'departments',   DepartmentViewSet,   basename='department')
router.register(r'grade-levels',  GradeLevelViewSet,   basename='gradelevel')
router.register(r'sections',      SectionViewSet,      basename='section')

# Learners & academics
router.register(r'learners',      LearnerViewSet,      basename='learner')
router.register(r'subjects',      SubjectViewSet,      basename='subject')
router.register(r'grades',        GradeViewSet,        basename='grade')
router.register(r'grade-audit',   GradeAuditLogViewSet, basename='gradeaudit')

# Attendance
router.register(r'calendar',      SchoolCalendarViewSet, basename='calendar')
router.register(r'attendance',    AttendanceRecordViewSet, basename='attendance')

# ID cards
router.register(r'id-templates',  IDTemplateViewSet,   basename='idtemplate')
router.register(r'id-positions',  IDCardElementPositionViewSet, basename='idposition')
router.register(r'id-queue',      IDPrintQueueViewSet, basename='idqueue')

# Notifications
router.register(r'notifications', NotificationRecordViewSet, basename='notification')
router.register(r'notif-prefs',   NotificationPreferenceViewSet, basename='notifpref')

# Conduct & messaging
router.register(r'conduct',       ConductLogViewSet,   basename='conduct')
router.register(r'messages',      MessageViewSet,      basename='message')

# Graduation
router.register(r'graduation',    GraduationViewSet,   basename='graduation')
router.register(r'absence-alerts', AbsenceAlertViewSet, basename='absencealert')

# Reports
router.register(r'report-cards',  ReportCardViewSet,   basename='reportcard')
router.register(r'sf1',           SF1RecordViewSet,    basename='sf1')
router.register(r'sf2',           SF2ReportViewSet,    basename='sf2')

# Admin
router.register(r'tasks',         AdminTaskViewSet,    basename='task')
router.register(r'activity-log',  ActivityLogViewSet,  basename='activitylog')

# Teacher contacts
router.register(r'teacher-contacts', TeacherContactViewSet, basename='teachercontact')

# Multi-tenancy (super admin)
router.register(r'tenants',       TenantViewSet,       basename='tenant')
router.register(r'invoices',      SubscriptionInvoiceViewSet, basename='invoice')

urlpatterns = [
    # Auth
    path('auth/login/',   LoginView.as_view(),        name='login'),
    path('auth/refresh/', TokenRefreshView.as_view(),  name='token_refresh'),
    path('auth/me/',      MeView.as_view(),            name='me'),

    # Dashboard
    path('dashboard/stats/',       DashboardStatsView.as_view(),       name='dashboard-stats'),
    path('dashboard/departments/', DashboardDepartmentsView.as_view(), name='dashboard-departments'),

    # Settings (singleton)
    path('settings/', SchoolSettingsView.as_view(), name='settings'),

    # All router-registered endpoints
    path('', include(router.urls)),
]
