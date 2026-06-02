"""
EduCard Pro — DRF Views
All endpoints the frontend needs to replace its mock data.
"""
from datetime import date, datetime
from decimal import Decimal

from django.db.models import Avg, Count, Q
from django.utils import timezone
from rest_framework import generics, permissions, status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenObtainPairView

from .models import (
    User, ParentProfile, TeacherContact,
    Department, GradeLevel, Section,
    Learner, LearnerParent, LearnerSectionHistory,
    Subject, Grade, GradeAuditLog, BulkImportJob,
    SchoolCalendar, AttendanceRecord,
    IDTemplate, IDPrintQueue, IDCardElementPosition,
    NotificationRecord, NotificationPreference, SMSLog,
    ConductLog, Message,
    GraduationNotification, AbsenceAlert,
    ReportCard, SF1Record, SF2Report,
    MessengerWebhookEvent, ActivityLog,
    SchoolSettings, SchoolYearConfig, AdminTask,
    Tenant, TenantDomain, SMSCreditBundle, SubscriptionInvoice,
    TeacherSectionAssignment, PortalSession,
)
from .serializers import (
    EduCardTokenObtainPairSerializer,
    UserSerializer, UserCreateSerializer,
    ParentProfileSerializer, TeacherContactSerializer,
    DepartmentSerializer, GradeLevelSerializer, SectionSerializer,
    LearnerListSerializer, LearnerDetailSerializer, LearnerCreateSerializer,
    LearnerSectionHistorySerializer, LearnerParentSerializer,
    SubjectSerializer, GradeSerializer, GradeAuditLogSerializer,
    SchoolCalendarSerializer, AttendanceRecordSerializer, BarcodeScanSerializer,
    IDTemplateSerializer, IDCardElementPositionSerializer, IDPrintQueueSerializer,
    NotificationRecordSerializer, NotificationPreferenceSerializer, SMSLogSerializer,
    ConductLogSerializer, MessageSerializer,
    GraduationNotificationSerializer, AbsenceAlertSerializer,
    ReportCardSerializer, SF1RecordSerializer, SF2ReportSerializer,
    SchoolSettingsSerializer, SchoolYearConfigSerializer, AdminTaskSerializer,
    ActivityLogSerializer,
    TenantSerializer, TenantDomainSerializer,
    SMSCreditBundleSerializer, SubscriptionInvoiceSerializer,
    DashboardStatsSerializer, DepartmentStatsSerializer,
)


# ─────────────────────────────────────────────────────────────────────────────
# HELPERS
# ─────────────────────────────────────────────────────────────────────────────

class IsAdminRole(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'admin'


class IsTeacherOrAdmin(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role in ('admin', 'teacher')


class IsParentOrAdmin(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role in ('admin', 'parent')


# ─────────────────────────────────────────────────────────────────────────────
# AUTH
# ─────────────────────────────────────────────────────────────────────────────

class LoginView(TokenObtainPairView):
    """POST /api/auth/login/  — returns access + refresh + user info."""
    serializer_class = EduCardTokenObtainPairSerializer


class MeView(generics.RetrieveUpdateAPIView):
    """GET/PATCH /api/auth/me/  — current user profile."""
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user


# ─────────────────────────────────────────────────────────────────────────────
# DASHBOARD
# ─────────────────────────────────────────────────────────────────────────────

class DashboardStatsView(APIView):
    """GET /api/dashboard/stats/  — role-scoped numbers for the hero section."""
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        settings = SchoolSettings.objects.first()
        user = request.user

        if user.role in ('admin', 'principal'):
            learner_qs = Learner.objects.filter(graduation_status='active')
            section_qs = Section.objects.all()
        elif user.role == 'teacher':
            assigned_ids = list(TeacherSectionAssignment.objects.filter(
                teacher=user, is_active=True
            ).values_list('section_id', flat=True))
            adviser_ids = list(Section.objects.filter(adviser=user).values_list('id', flat=True))
            scoped_ids = list(set(assigned_ids + adviser_ids))
            learner_qs = Learner.objects.filter(graduation_status='active', section_id__in=scoped_ids)
            section_qs = Section.objects.filter(id__in=scoped_ids)
        elif user.role == 'parent':
            child_ids = list(LearnerParent.objects.filter(parent=user).values_list('learner_id', flat=True))
            learner_qs = Learner.objects.filter(id__in=child_ids, graduation_status='active')
            section_qs = Section.objects.none()
        elif user.role == 'student':
            learner_qs = Learner.objects.filter(user_account=user, graduation_status='active')
            section_qs = Section.objects.none()
        else:
            learner_qs = Learner.objects.filter(graduation_status='active')
            section_qs = Section.objects.all()

        total = learner_qs.count()
        avg_att = learner_qs.aggregate(a=Avg('attendance_rate'))['a'] or Decimal('0')
        at_risk = learner_qs.filter(Q(gpa__lt=75) | Q(attendance_rate__lt=95)).count()

        sections_below = section_qs.annotate(
            avg=Avg('learners__attendance_rate')
        ).filter(avg__lt=95).count()

        if user.role in ('admin', 'principal'):
            printed = IDPrintQueue.objects.filter(status='printed').count()
            pending_tasks = AdminTask.objects.filter(status='pending').count()
        else:
            printed = 0
            pending_tasks = 0

        data = {
            'total_enrolled': total,
            'campus_attendance': round(avg_att, 2),
            'sections_below_target': sections_below,
            'at_risk_count': at_risk,
            'id_cards_printed': printed,
            'pending_tasks': pending_tasks,
            'current_quarter': settings.current_quarter if settings else 3,
            'current_week': settings.current_week if settings else 1,
            'school_name': settings.school_name if settings else '',
            'school_year': settings.school_year if settings else '',
        }
        return Response(DashboardStatsSerializer(data).data)


class DashboardView(APIView):
    """GET /api/dashboard/  — combined overview: stats + enrollment by grade level."""
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        settings_obj = SchoolSettings.objects.first()
        total = Learner.objects.filter(graduation_status='active').count()
        avg_att = Learner.objects.filter(
            graduation_status='active'
        ).aggregate(a=Avg('attendance_rate'))['a'] or Decimal('0')

        at_risk = Learner.objects.filter(
            graduation_status='active'
        ).filter(Q(gpa__lt=75) | Q(attendance_rate__lt=95)).count()

        enrollment_by_grade = []
        for gl in GradeLevel.objects.select_related('department').order_by('level'):
            count = Learner.objects.filter(
                section__grade_level=gl, graduation_status='active'
            ).count()
            enrollment_by_grade.append({
                'grade_level': gl.level,
                'label': gl.label,
                'department': gl.department.key,
                'enrolled': count,
            })

        return Response({
            'total_enrolled': total,
            'campus_attendance': round(avg_att, 2),
            'at_risk_count': at_risk,
            'current_quarter': settings_obj.current_quarter if settings_obj else 3,
            'school_name': settings_obj.school_name if settings_obj else '',
            'school_year': settings_obj.school_year if settings_obj else '',
            'enrollment_by_grade': enrollment_by_grade,
        })


class DashboardDepartmentsView(APIView):
    """GET /api/dashboard/departments/  — per-department breakdown for admin view."""
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        result = []
        for dept in Department.objects.prefetch_related(
            'grade_levels__sections__learners'
        ).all():
            sections_qs = Section.objects.filter(
                grade_level__department=dept
            ).annotate(avg=Avg('learners__attendance_rate'))

            enrolled = Learner.objects.filter(
                section__grade_level__department=dept,
                graduation_status='active'
            ).count()

            dept_avg = sections_qs.aggregate(a=Avg('avg'))['a'] or 0
            below = sections_qs.filter(avg__lt=95).count()

            sections_data = SectionSerializer(
                Section.objects.filter(grade_level__department=dept),
                many=True
            ).data

            result.append({
                'key': dept.key,
                'label': dept.label,
                'caption': dept.caption,
                'enrolled': enrolled,
                'attendance_rate': round(dept_avg, 2),
                'sections_below_target': below,
                'sections': sections_data,
            })
        return Response(result)


# ─────────────────────────────────────────────────────────────────────────────
# SCHOOL STRUCTURE
# ─────────────────────────────────────────────────────────────────────────────

class DepartmentViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Department.objects.all()
    serializer_class = DepartmentSerializer
    permission_classes = [permissions.IsAuthenticated]


class GradeLevelViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = GradeLevel.objects.select_related('department').all()
    serializer_class = GradeLevelSerializer
    permission_classes = [permissions.IsAuthenticated]
    filterset_fields = ['department']


class SectionViewSet(viewsets.ModelViewSet):
    serializer_class = SectionSerializer
    permission_classes = [permissions.IsAuthenticated]
    search_fields = ['name', 'adviser__first_name', 'adviser__last_name']
    filterset_fields = ['grade_level', 'strand', 'grade_level__department']

    def get_queryset(self):
        qs = Section.objects.select_related(
            'grade_level__department', 'adviser'
        ).annotate(avg_att=Avg('learners__attendance_rate')).all()
        user = self.request.user
        if user.role == 'teacher':
            assigned_ids = TeacherSectionAssignment.objects.filter(
                teacher=user, is_active=True
            ).values_list('section_id', flat=True)
            qs = qs.filter(
                Q(adviser=user) | Q(id__in=list(assigned_ids))
            ).distinct()
        elif user.role == 'student':
            learner_section = Learner.objects.filter(
                user_account=user
            ).values_list('section_id', flat=True)
            qs = qs.filter(id__in=list(learner_section))
        elif user.role == 'parent':
            learner_section_ids = Learner.objects.filter(
                learner_parents__parent=user
            ).values_list('section_id', flat=True)
            qs = qs.filter(id__in=list(learner_section_ids))
        return qs

    @action(detail=False, methods=['get'])
    def below_target(self, request):
        """GET /api/sections/below_target/ — sections under 95% attendance."""
        qs = self.get_queryset().filter(avg_att__lt=95)
        return Response(SectionSerializer(qs, many=True).data)


# ─────────────────────────────────────────────────────────────────────────────
# LEARNERS
# ─────────────────────────────────────────────────────────────────────────────

class LearnerViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAuthenticated]
    search_fields = ['lrn', 'first_name', 'last_name']
    filterset_fields = ['section', 'section__grade_level', 'graduation_status', 'sex']

    def get_queryset(self):
        qs = Learner.objects.select_related('section__grade_level__department')
        user = self.request.user
        if user.role == 'teacher':
            assigned = TeacherSectionAssignment.objects.filter(
                teacher=user, is_active=True
            ).values_list('section_id', flat=True)
            qs = qs.filter(section_id__in=assigned)
        elif user.role == 'student':
            qs = qs.filter(user_account=user)
        elif user.role == 'parent':
            # Use LearnerParent through-table
            learner_ids = LearnerParent.objects.filter(
                parent=user
            ).values_list('learner_id', flat=True)
            qs = qs.filter(id__in=learner_ids)
        return qs

    def get_serializer_class(self):
        if self.action in ('list',):
            return LearnerListSerializer
        if self.action in ('create',):
            return LearnerCreateSerializer
        return LearnerDetailSerializer

    @action(detail=False, methods=['get'])
    def at_risk(self, request):
        """GET /api/learners/at_risk/ — GPA < 75 or attendance < 95%."""
        qs = self.get_queryset().filter(
            graduation_status='active'
        ).filter(Q(gpa__lt=75) | Q(attendance_rate__lt=95))
        return Response(LearnerListSerializer(qs, many=True).data)

    @action(detail=True, methods=['get'])
    def grades(self, request, pk=None):
        """GET /api/learners/{id}/grades/ — all grades for this learner."""
        learner = self.get_object()
        qs = Grade.objects.filter(learner=learner).select_related('subject')
        return Response(GradeSerializer(qs, many=True).data)

    @action(detail=True, methods=['get'])
    def attendance(self, request, pk=None):
        """GET /api/learners/{id}/attendance/ — attendance history."""
        learner = self.get_object()
        qs = AttendanceRecord.objects.filter(learner=learner).order_by('-date')
        return Response(AttendanceRecordSerializer(qs, many=True).data)

    @action(detail=True, methods=['get'])
    def conduct(self, request, pk=None):
        """GET /api/learners/{id}/conduct/ — conduct logs."""
        learner = self.get_object()
        qs = ConductLog.objects.filter(learner=learner).select_related('recorded_by')
        return Response(ConductLogSerializer(qs, many=True).data)

    @action(detail=True, methods=['get'])
    def notifications(self, request, pk=None):
        """GET /api/learners/{id}/notifications/ — notification history."""
        learner = self.get_object()
        qs = NotificationRecord.objects.filter(learner=learner)
        return Response(NotificationRecordSerializer(qs, many=True).data)


# ─────────────────────────────────────────────────────────────────────────────
# SUBJECTS & GRADES
# ─────────────────────────────────────────────────────────────────────────────

class SubjectViewSet(viewsets.ModelViewSet):
    queryset = Subject.objects.select_related('section__grade_level', 'teacher').all()
    serializer_class = SubjectSerializer
    permission_classes = [permissions.IsAuthenticated]
    filterset_fields = ['section', 'teacher']


class GradeViewSet(viewsets.ModelViewSet):
    serializer_class = GradeSerializer
    permission_classes = [IsTeacherOrAdmin]
    filterset_fields = ['learner', 'subject', 'quarter', 'learner__section']

    def get_queryset(self):
        qs = Grade.objects.select_related('learner', 'subject').all()
        user = self.request.user
        if user.role == 'teacher':
            assigned_ids = TeacherSectionAssignment.objects.filter(
                teacher=user, is_active=True
            ).values_list('section_id', flat=True)
            qs = qs.filter(
                Q(subject__teacher=user) | Q(learner__section_id__in=list(assigned_ids))
            ).distinct()
        return qs

    def perform_update(self, serializer):
        """Write audit log before saving."""
        old = self.get_object()
        instance = serializer.save()
        for field in ('quiz_score', 'exam_score', 'activity_score'):
            old_val = getattr(old, field)
            new_val = getattr(instance, field)
            if old_val != new_val:
                GradeAuditLog.objects.create(
                    grade=instance,
                    changed_by=self.request.user,
                    field_changed=field,
                    old_value=old_val,
                    new_value=new_val,
                )

    @action(detail=False, methods=['get'])
    def at_risk(self, request):
        """GET /api/grades/at_risk/?section=X — learners with avg grade < 75."""
        section_id = request.query_params.get('section')
        qs = Grade.objects.values('learner').annotate(
            avg=Avg('computed_grade')
        ).filter(avg__lt=75)
        if section_id:
            qs = qs.filter(learner__section_id=section_id)
        learner_ids = [r['learner'] for r in qs]
        learners = Learner.objects.filter(id__in=learner_ids)
        return Response(LearnerListSerializer(learners, many=True).data)


class GradeAuditLogViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = GradeAuditLog.objects.select_related('grade__learner', 'changed_by').all()
    serializer_class = GradeAuditLogSerializer
    permission_classes = [IsAdminRole]
    filterset_fields = ['grade', 'changed_by']


# ─────────────────────────────────────────────────────────────────────────────
# ATTENDANCE
# ─────────────────────────────────────────────────────────────────────────────

class SchoolCalendarViewSet(viewsets.ModelViewSet):
    queryset = SchoolCalendar.objects.all()
    serializer_class = SchoolCalendarSerializer
    permission_classes = [permissions.IsAuthenticated]
    filterset_fields = ['type']


class AttendanceRecordViewSet(viewsets.ModelViewSet):
    serializer_class = AttendanceRecordSerializer
    permission_classes = [permissions.IsAuthenticated]
    filterset_fields = ['learner', 'date', 'status']

    def get_queryset(self):
        qs = AttendanceRecord.objects.select_related('learner__section').all()
        user = self.request.user
        if user.role == 'teacher':
            assigned_ids = TeacherSectionAssignment.objects.filter(
                teacher=user, is_active=True
            ).values_list('section_id', flat=True)
            qs = qs.filter(
                Q(learner__section__adviser=user) | Q(learner__section_id__in=list(assigned_ids))
            ).distinct()
        elif user.role == 'parent':
            learner_ids = LearnerParent.objects.filter(
                parent=user
            ).values_list('learner_id', flat=True)
            qs = qs.filter(learner_id__in=list(learner_ids))
        elif user.role == 'student':
            qs = qs.filter(learner__user_account=user)
        return qs

    @action(detail=False, methods=['post'])
    def scan(self, request):
        """
        POST /api/attendance/scan/
        Body: { barcode_value, session }
        Finds learner by barcode, creates/updates today's record,
        returns learner info for on-screen confirmation.
        """
        ser = BarcodeScanSerializer(data=request.data)
        ser.is_valid(raise_exception=True)

        barcode = ser.validated_data['barcode_value']
        session = ser.validated_data['session']

        try:
            learner = Learner.objects.get(barcode_value=barcode)
        except Learner.DoesNotExist:
            return Response({'error': 'Learner not found.'}, status=404)

        if not learner.barcode_active:
            return Response({'error': 'Inactive student.'}, status=403)

        today = date.today()
        # Check it's a school day
        cal = SchoolCalendar.objects.filter(date=today).first()
        if cal and cal.type != 'school_day':
            return Response({'error': f'No school today ({cal.label or cal.type}).'}, status=400)

        record, _ = AttendanceRecord.objects.get_or_create(
            learner=learner, date=today,
            defaults={'status': 'present'}
        )
        setattr(record, session, timezone.now().time())
        record.status = 'present'
        record.save()

        return Response({
            'success': True,
            'learner': LearnerDetailSerializer(learner).data,
            'record': AttendanceRecordSerializer(record).data,
        })

    @action(detail=False, methods=['get'])
    def today(self, request):
        """GET /api/attendance/today/?section=X — live attendance monitor."""
        section_id = request.query_params.get('section')
        today = date.today()
        qs = AttendanceRecord.objects.filter(date=today).select_related('learner')
        if section_id:
            qs = qs.filter(learner__section_id=section_id)
        return Response(AttendanceRecordSerializer(qs, many=True).data)

    @action(detail=False, methods=['get'])
    def prolonged_absences(self, request):
        """
        GET /api/attendance/prolonged_absences/
        Returns learners with 5+ consecutive absent days.
        """
        threshold = int(request.query_params.get('threshold', 5))
        # Simple approach: count recent absences per learner
        from django.db.models import Count
        recent_absences = AttendanceRecord.objects.filter(
            status='absent'
        ).values('learner').annotate(
            absent_count=Count('id')
        ).filter(absent_count__gte=threshold)

        learner_ids = [r['learner'] for r in recent_absences]
        learners = Learner.objects.filter(id__in=learner_ids)
        return Response(LearnerListSerializer(learners, many=True).data)


# ─────────────────────────────────────────────────────────────────────────────
# ID CARDS
# ─────────────────────────────────────────────────────────────────────────────

class IDTemplateViewSet(viewsets.ModelViewSet):
    queryset = IDTemplate.objects.all()
    serializer_class = IDTemplateSerializer
    permission_classes = [IsAdminRole]


class IDCardElementPositionViewSet(viewsets.ModelViewSet):
    queryset = IDCardElementPosition.objects.select_related('template').all()
    serializer_class = IDCardElementPositionSerializer
    permission_classes = [IsAdminRole]
    filterset_fields = ['template']


class IDPrintQueueViewSet(viewsets.ModelViewSet):
    queryset = IDPrintQueue.objects.select_related(
        'learner__section__grade_level', 'template', 'requested_by'
    ).all()
    serializer_class = IDPrintQueueSerializer
    permission_classes = [IsAdminRole]
    filterset_fields = ['status', 'reason']

    @action(detail=True, methods=['patch'])
    def mark_printed(self, request, pk=None):
        """PATCH /api/id-cards/{id}/mark_printed/"""
        item = self.get_object()
        item.status = 'printed'
        item.printed_at = timezone.now()
        item.save()
        return Response(IDPrintQueueSerializer(item).data)


# ─────────────────────────────────────────────────────────────────────────────
# NOTIFICATIONS
# ─────────────────────────────────────────────────────────────────────────────

class NotificationRecordViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = NotificationRecord.objects.select_related('parent', 'learner').all()
    serializer_class = NotificationRecordSerializer
    permission_classes = [permissions.IsAuthenticated]
    filterset_fields = ['parent', 'learner', 'channel', 'status', 'triggered_by']


class NotificationPreferenceViewSet(viewsets.ModelViewSet):
    queryset = NotificationPreference.objects.select_related('learner').all()
    serializer_class = NotificationPreferenceSerializer
    permission_classes = [permissions.IsAuthenticated]
    filterset_fields = ['learner']


# ─────────────────────────────────────────────────────────────────────────────
# CONDUCT
# ─────────────────────────────────────────────────────────────────────────────

class ConductLogViewSet(viewsets.ModelViewSet):
    queryset = ConductLog.objects.select_related('learner', 'recorded_by').all()
    serializer_class = ConductLogSerializer
    permission_classes = [IsTeacherOrAdmin]
    filterset_fields = ['learner', 'type']

    def perform_create(self, serializer):
        serializer.save(recorded_by=self.request.user)


# ─────────────────────────────────────────────────────────────────────────────
# MESSAGING
# ─────────────────────────────────────────────────────────────────────────────

class MessageViewSet(viewsets.ModelViewSet):
    serializer_class = MessageSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        return Message.objects.filter(
            Q(sender=user) | Q(receiver=user)
        ).select_related('sender', 'receiver', 'learner')

    def perform_create(self, serializer):
        serializer.save(sender=self.request.user)

    @action(detail=True, methods=['patch'])
    def mark_read(self, request, pk=None):
        """PATCH /api/messages/{id}/mark_read/"""
        msg = self.get_object()
        if msg.receiver == request.user and not msg.is_read:
            msg.read_at = timezone.now()
            msg.save()
        return Response(MessageSerializer(msg).data)

    @action(detail=False, methods=['get'])
    def unread_count(self, request):
        """GET /api/messages/unread_count/ — badge number for sidebar."""
        count = Message.objects.filter(
            receiver=request.user, read_at__isnull=True
        ).count()
        return Response({'unread_count': count})


# ─────────────────────────────────────────────────────────────────────────────
# GRADUATION
# ─────────────────────────────────────────────────────────────────────────────

class GraduationViewSet(viewsets.ViewSet):
    permission_classes = [IsAdminRole]

    @action(detail=False, methods=['get'])
    def candidates(self, request):
        """GET /api/graduation/candidates/ — learners ready to graduate."""
        qs = Learner.objects.filter(graduation_status='candidate').select_related('section')
        return Response(LearnerListSerializer(qs, many=True).data)

    @action(detail=True, methods=['post'])
    def confirm(self, request, pk=None):
        """POST /api/graduation/{id}/confirm/ — confirm a graduation."""
        learner = Learner.objects.get(pk=pk)
        learner.graduation_status = 'confirmed'
        learner.graduated_at = timezone.now()
        learner.barcode_active = False
        learner.save()
        ActivityLog.objects.create(
            user=request.user,
            action='graduation_confirmed',
            description=f"Graduation confirmed for {learner.full_name}",
            subject_model='Learner',
            subject_id=learner.id,
        )
        return Response(LearnerDetailSerializer(learner).data)

    @action(detail=False, methods=['get'])
    def alumni(self, request):
        """GET /api/graduation/alumni/ — archived graduates."""
        qs = Learner.objects.filter(
            graduation_status__in=['confirmed', 'archived']
        ).select_related('section')
        return Response(LearnerListSerializer(qs, many=True).data)


class AbsenceAlertViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = AbsenceAlert.objects.select_related('learner__section').all()
    serializer_class = AbsenceAlertSerializer
    permission_classes = [IsTeacherOrAdmin]
    filterset_fields = ['threshold', 'learner']


# ─────────────────────────────────────────────────────────────────────────────
# REPORTS
# ─────────────────────────────────────────────────────────────────────────────

class ReportCardViewSet(viewsets.ModelViewSet):
    queryset = ReportCard.objects.select_related('learner').all()
    serializer_class = ReportCardSerializer
    permission_classes = [permissions.IsAuthenticated]
    filterset_fields = ['learner', 'school_year', 'status']


class SF1RecordViewSet(viewsets.ModelViewSet):
    queryset = SF1Record.objects.select_related('learner', 'section').all()
    serializer_class = SF1RecordSerializer
    permission_classes = [IsAdminRole]
    filterset_fields = ['school_year', 'enrollment_status', 'section']


class SF2ReportViewSet(viewsets.ModelViewSet):
    queryset = SF2Report.objects.select_related('section__grade_level', 'generated_by').all()
    serializer_class = SF2ReportSerializer
    permission_classes = [IsAdminRole]
    filterset_fields = ['section', 'month', 'year', 'status']

    @action(detail=True, methods=['post'])
    def submit(self, request, pk=None):
        """POST /api/sf2/{id}/submit/ — mark as submitted to DepEd."""
        report = self.get_object()
        report.status = 'submitted'
        report.submitted_at = timezone.now()
        report.save()
        return Response(SF2ReportSerializer(report).data)


# ─────────────────────────────────────────────────────────────────────────────
# SETTINGS & AUDIT
# ─────────────────────────────────────────────────────────────────────────────

class SchoolSettingsView(generics.RetrieveUpdateAPIView):
    """GET/PATCH /api/settings/"""
    serializer_class = SchoolSettingsSerializer
    permission_classes = [IsAdminRole]

    def get_object(self):
        obj, _ = SchoolSettings.objects.get_or_create(pk=1)
        return obj


class AdminTaskViewSet(viewsets.ModelViewSet):
    queryset = AdminTask.objects.select_related('learner', 'assigned_to').all()
    serializer_class = AdminTaskSerializer
    permission_classes = [IsAdminRole]
    filterset_fields = ['status', 'priority', 'task_type']

    @action(detail=True, methods=['patch'])
    def complete(self, request, pk=None):
        task = self.get_object()
        task.status = 'done'
        task.completed_at = timezone.now()
        task.save()
        return Response(AdminTaskSerializer(task).data)


class ActivityLogViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = ActivityLog.objects.select_related('user').all()
    serializer_class = ActivityLogSerializer
    permission_classes = [IsAdminRole]
    filterset_fields = ['action', 'subject_model', 'user']


# ─────────────────────────────────────────────────────────────────────────────
# LEARNER PARENTS
# ─────────────────────────────────────────────────────────────────────────────

class LearnerParentViewSet(viewsets.ModelViewSet):
    serializer_class = LearnerParentSerializer
    permission_classes = [permissions.IsAuthenticated]
    filterset_fields = ['learner', 'parent', 'relationship']

    def get_queryset(self):
        qs = LearnerParent.objects.select_related('learner', 'parent')
        user = self.request.user
        if user.role == 'parent':
            qs = qs.filter(parent=user)
        elif user.role == 'student':
            qs = qs.filter(learner__user_account=user)
        return qs


# ─────────────────────────────────────────────────────────────────────────────
# TEACHER CONTACTS (parent portal)
# ─────────────────────────────────────────────────────────────────────────────

class TeacherContactViewSet(viewsets.ModelViewSet):
    queryset = TeacherContact.objects.select_related('teacher').all()
    serializer_class = TeacherContactSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        qs = super().get_queryset()
        if self.request.user.role == 'parent':
            child_sections = LearnerParent.objects.filter(
                parent=self.request.user
            ).values_list('learner__section_id', flat=True)
            teacher_ids = TeacherSectionAssignment.objects.filter(
                section_id__in=child_sections, is_active=True
            ).values_list('teacher_id', flat=True)
            qs = qs.filter(teacher_id__in=teacher_ids)
        return qs


# ─────────────────────────────────────────────────────────────────────────────
# MULTI-TENANCY (Super Admin only)
# ─────────────────────────────────────────────────────────────────────────────

class IsSuperAdmin(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.is_superuser


class TenantViewSet(viewsets.ModelViewSet):
    queryset = Tenant.objects.prefetch_related('domains').all()
    serializer_class = TenantSerializer
    permission_classes = [IsSuperAdmin]
    search_fields = ['name', 'subdomain']
    filterset_fields = ['plan']

    @action(detail=True, methods=['post'])
    def add_sms_credits(self, request, pk=None):
        """POST /api/tenants/{id}/add_sms_credits/"""
        tenant = self.get_object()
        credits = int(request.data.get('credits', 0))
        amount = request.data.get('amount_paid', 0)
        if credits not in (1000, 2200):
            return Response({'error': 'Credits must be 1000 or 2200.'}, status=400)
        SMSCreditBundle.objects.create(
            tenant=tenant,
            credits_added=credits,
            amount_paid=amount,
            added_by=request.user,
        )
        tenant.sms_credits_remaining += credits
        tenant.save()
        return Response(TenantSerializer(tenant).data)

    @action(detail=True, methods=['delete'])
    def soft_delete(self, request, pk=None):
        """DELETE /api/tenants/{id}/soft_delete/ — never drops the DB."""
        tenant = self.get_object()
        tenant.deleted_at = timezone.now()
        tenant.save()
        return Response(status=204)


class SubscriptionInvoiceViewSet(viewsets.ModelViewSet):
    queryset = SubscriptionInvoice.objects.select_related('tenant').all()
    serializer_class = SubscriptionInvoiceSerializer
    permission_classes = [IsSuperAdmin]
    filterset_fields = ['tenant', 'status']
