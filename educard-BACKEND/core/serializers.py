"""
EduCard Pro — DRF Serializers
Every serializer maps 1-to-1 with what the frontend views consume.
"""
from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

from .models import (
    User, ParentProfile, TeacherContact,
    Department, GradeLevel, Section,
    Learner, LearnerSectionHistory,
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


# ============================================================================
# AUTH
# ============================================================================

class EduCardTokenObtainPairSerializer(TokenObtainPairSerializer):
    """JWT login — adds role, full_name, and 2FA flag to the token response."""

    def validate(self, attrs):
        data = super().validate(attrs)
        user = self.user
        data['user'] = {
            'id': user.id,
            'username': user.username,
            'email': user.email,
            'full_name': user.get_full_name(),
            'role': user.role,
            'is_2fa_enabled': user.is_2fa_enabled,
        }
        return data


class UserSerializer(serializers.ModelSerializer):
    full_name = serializers.SerializerMethodField()
    is_2fa_enabled = serializers.BooleanField(read_only=True)
    is_locked = serializers.BooleanField(read_only=True)

    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'first_name', 'last_name', 'full_name',
            'role', 'phone', 'messenger_psid', 'subject_specialization',
            'is_2fa_enabled', 'is_locked', 'is_active', 'date_joined',
        ]
        read_only_fields = ['date_joined', 'is_2fa_enabled', 'is_locked']

    def get_full_name(self, obj):
        return obj.get_full_name()


class UserCreateSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, validators=[validate_password])

    class Meta:
        model = User
        fields = ['username', 'email', 'first_name', 'last_name', 'role', 'phone', 'password']

    def create(self, validated_data):
        return User.objects.create_user(**validated_data)


class ParentProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)

    class Meta:
        model = ParentProfile
        fields = ['id', 'user', 'relationship', 'messenger_linked', 'sms_enabled']


class TeacherContactSerializer(serializers.ModelSerializer):
    teacher_name = serializers.CharField(source='teacher.get_full_name', read_only=True)
    teacher_email = serializers.EmailField(source='teacher.email', read_only=True)

    class Meta:
        model = TeacherContact
        fields = [
            'id', 'teacher', 'teacher_name', 'teacher_email',
            'phone', 'messenger_username', 'facebook_url', 'email',
            'show_phone', 'show_messenger', 'show_facebook', 'show_email',
            'updated_at',
        ]
        read_only_fields = ['updated_at']


# ============================================================================
# SCHOOL STRUCTURE
# ============================================================================

class DepartmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Department
        fields = ['id', 'key', 'label', 'caption']


class GradeLevelSerializer(serializers.ModelSerializer):
    department_key = serializers.CharField(source='department.key', read_only=True)
    department_label = serializers.CharField(source='department.label', read_only=True)

    class Meta:
        model = GradeLevel
        fields = ['id', 'level', 'label', 'department', 'department_key', 'department_label']


class SectionSerializer(serializers.ModelSerializer):
    grade_level_label = serializers.CharField(source='grade_level.label', read_only=True)
    department_key = serializers.CharField(source='grade_level.department.key', read_only=True)
    adviser_name = serializers.SerializerMethodField()
    enrollment_count = serializers.IntegerField(read_only=True)
    average_attendance = serializers.DecimalField(max_digits=5, decimal_places=2, read_only=True)
    below_sf2_target = serializers.SerializerMethodField()
    label = serializers.SerializerMethodField()

    class Meta:
        model = Section
        fields = [
            'id', 'name', 'strand', 'grade_level', 'grade_level_label',
            'department_key', 'adviser', 'adviser_name',
            'enrollment_count', 'average_attendance', 'below_sf2_target', 'label',
        ]

    def get_adviser_name(self, obj):
        return obj.adviser.get_full_name() if obj.adviser else None

    def get_below_sf2_target(self, obj):
        return float(obj.average_attendance) < 95.0

    def get_label(self, obj):
        if obj.strand:
            return f"{obj.grade_level.label} - {obj.strand} - {obj.name}"
        return f"{obj.grade_level.label} - {obj.name}"


# ============================================================================
# LEARNERS
# ============================================================================

class LearnerListSerializer(serializers.ModelSerializer):
    """Lightweight — used in list views and dropdowns."""
    full_name = serializers.CharField(read_only=True)
    section_label = serializers.SerializerMethodField()
    status = serializers.CharField(read_only=True)

    class Meta:
        model = Learner
        fields = [
            'id', 'lrn', 'full_name', 'first_name', 'middle_initial', 'last_name',
            'section', 'section_label', 'gpa', 'attendance_rate',
            'status', 'barcode_active', 'graduation_status', 'photo_path',
        ]

    def get_section_label(self, obj):
        if not obj.section:
            return None
        s = obj.section
        if s.strand:
            return f"{s.grade_level.label} - {s.strand} - {s.name}"
        return f"{s.grade_level.label} - {s.name}"


class LearnerDetailSerializer(serializers.ModelSerializer):
    """Full detail — used in student profile and parent portal."""
    full_name = serializers.CharField(read_only=True)
    status = serializers.CharField(read_only=True)
    is_graduate = serializers.BooleanField(read_only=True)
    section_data = SectionSerializer(source='section', read_only=True)
    parent_name = serializers.SerializerMethodField()

    class Meta:
        model = Learner
        fields = [
            'id', 'lrn', 'first_name', 'middle_initial', 'last_name', 'full_name',
            'birth_date', 'sex', 'photo_path',
            'section', 'section_data',
            'gpa', 'attendance_rate', 'status',
            'barcode_value', 'barcode_active',
            'graduation_status', 'is_graduate',
            'parent_phone', 'parent_messenger_psid',
            'parent_account', 'parent_name',
            'enrolled_at', 'graduated_at',
        ]
        read_only_fields = ['lrn', 'barcode_value', 'enrolled_at']

    def get_parent_name(self, obj):
        return obj.parent_account.get_full_name() if obj.parent_account else None


class LearnerCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Learner
        fields = [
            'lrn', 'first_name', 'middle_initial', 'last_name',
            'birth_date', 'sex', 'section',
            'parent_phone', 'parent_account',
        ]

    def validate_lrn(self, value):
        if len(value) != 12 or not value.isdigit():
            raise serializers.ValidationError("LRN must be exactly 12 digits.")
        return value


class LearnerSectionHistorySerializer(serializers.ModelSerializer):
    section_label = serializers.SerializerMethodField()
    recorded_by_name = serializers.CharField(source='recorded_by.get_full_name', read_only=True)

    class Meta:
        model = LearnerSectionHistory
        fields = [
            'id', 'learner', 'section', 'section_label', 'school_year',
            'reason', 'effective_date', 'recorded_by', 'recorded_by_name', 'notes',
        ]

    def get_section_label(self, obj):
        if not obj.section:
            return None
        s = obj.section
        if s.strand:
            return f"{s.grade_level.label} - {s.strand} - {s.name}"
        return f"{s.grade_level.label} - {s.name}"


# ============================================================================
# SUBJECTS & GRADES
# ============================================================================

class SubjectSerializer(serializers.ModelSerializer):
    teacher_name = serializers.CharField(source='teacher.get_full_name', read_only=True)
    section_label = serializers.SerializerMethodField()

    class Meta:
        model = Subject
        fields = [
            'id', 'name', 'section', 'section_label',
            'teacher', 'teacher_name',
            'quarter_weight_quiz', 'quarter_weight_exam', 'quarter_weight_activity',
        ]

    def get_section_label(self, obj):
        s = obj.section
        if s.strand:
            return f"{s.grade_level.label} - {s.strand} - {s.name}"
        return f"{s.grade_level.label} - {s.name}"


class GradeSerializer(serializers.ModelSerializer):
    learner_name = serializers.CharField(source='learner.full_name', read_only=True)
    learner_lrn = serializers.CharField(source='learner.lrn', read_only=True)
    subject_name = serializers.CharField(source='subject.name', read_only=True)

    class Meta:
        model = Grade
        fields = [
            'id', 'learner', 'learner_name', 'learner_lrn',
            'subject', 'subject_name', 'quarter',
            'quiz_score', 'exam_score', 'activity_score', 'computed_grade',
            'created_at', 'updated_at',
        ]
        read_only_fields = ['computed_grade', 'created_at', 'updated_at']


class GradeAuditLogSerializer(serializers.ModelSerializer):
    changed_by_name = serializers.CharField(source='changed_by.get_full_name', read_only=True)

    class Meta:
        model = GradeAuditLog
        fields = [
            'id', 'grade', 'field_changed',
            'old_value', 'new_value',
            'changed_by', 'changed_by_name', 'changed_at',
        ]
        read_only_fields = fields


# ============================================================================
# ATTENDANCE
# ============================================================================

class SchoolCalendarSerializer(serializers.ModelSerializer):
    class Meta:
        model = SchoolCalendar
        fields = ['id', 'date', 'type', 'label']


class AttendanceRecordSerializer(serializers.ModelSerializer):
    learner_name = serializers.CharField(source='learner.full_name', read_only=True)
    learner_lrn = serializers.CharField(source='learner.lrn', read_only=True)
    learner_photo = serializers.CharField(source='learner.photo_path', read_only=True)

    class Meta:
        model = AttendanceRecord
        fields = [
            'id', 'learner', 'learner_name', 'learner_lrn', 'learner_photo',
            'date', 'status',
            'time_in_morning', 'time_out_morning',
            'time_in_afternoon', 'time_out_afternoon',
            'created_at', 'updated_at',
        ]
        read_only_fields = ['created_at', 'updated_at']


class BarcodeScanSerializer(serializers.Serializer):
    """Input for POST /api/attendance/scan/"""
    barcode_value = serializers.CharField(max_length=12, min_length=12)
    session = serializers.ChoiceField(choices=[
        'time_in_morning', 'time_out_morning',
        'time_in_afternoon', 'time_out_afternoon',
    ])


# ============================================================================
# ID CARDS
# ============================================================================

class IDTemplateSerializer(serializers.ModelSerializer):
    class Meta:
        model = IDTemplate
        fields = ['id', 'name', 'background_path', 'font_color', 'is_active', 'created_at']
        read_only_fields = ['created_at']


class IDCardElementPositionSerializer(serializers.ModelSerializer):
    class Meta:
        model = IDCardElementPosition
        fields = [
            'id', 'template', 'element',
            'x', 'y', 'width', 'height',
            'font_size', 'font_bold', 'font_color', 'text_align',
        ]


class IDPrintQueueSerializer(serializers.ModelSerializer):
    learner_name = serializers.CharField(source='learner.full_name', read_only=True)
    learner_lrn = serializers.CharField(source='learner.lrn', read_only=True)
    learner_section = serializers.SerializerMethodField()
    requested_by_name = serializers.CharField(source='requested_by.get_full_name', read_only=True)

    class Meta:
        model = IDPrintQueue
        fields = [
            'id', 'learner', 'learner_name', 'learner_lrn', 'learner_section',
            'template', 'reason', 'status', 'pdf_path',
            'requested_by', 'requested_by_name',
            'requested_at', 'printed_at',
        ]
        read_only_fields = ['requested_at']

    def get_learner_section(self, obj):
        if not obj.learner.section:
            return None
        s = obj.learner.section
        if s.strand:
            return f"{s.grade_level.label} - {s.strand} - {s.name}"
        return f"{s.grade_level.label} - {s.name}"


# ============================================================================
# NOTIFICATIONS
# ============================================================================

class NotificationRecordSerializer(serializers.ModelSerializer):
    parent_name = serializers.CharField(source='parent.get_full_name', read_only=True)
    learner_name = serializers.CharField(source='learner.full_name', read_only=True)

    class Meta:
        model = NotificationRecord
        fields = [
            'id', 'parent', 'parent_name', 'learner', 'learner_name',
            'channel', 'status', 'message', 'triggered_by', 'sent_at',
        ]
        read_only_fields = ['sent_at']


class NotificationPreferenceSerializer(serializers.ModelSerializer):
    learner_name = serializers.CharField(source='learner.full_name', read_only=True)
    is_muted = serializers.BooleanField(read_only=True)

    class Meta:
        model = NotificationPreference
        fields = [
            'id', 'learner', 'learner_name',
            'messenger_enabled', 'sms_enabled',
            'attendance_alerts', 'grade_notifications',
            'absence_warnings', 'conduct_alerts',
            'muted_until', 'is_muted', 'updated_at',
        ]
        read_only_fields = ['updated_at', 'is_muted']


class SMSLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = SMSLog
        fields = [
            'id', 'learner', 'phone', 'message', 'status',
            'cost', 'provider', 'provider_message_id',
            'error_message', 'created_at', 'sent_at',
        ]
        read_only_fields = fields


# ============================================================================
# CONDUCT
# ============================================================================

class ConductLogSerializer(serializers.ModelSerializer):
    learner_name = serializers.CharField(source='learner.full_name', read_only=True)
    learner_lrn = serializers.CharField(source='learner.lrn', read_only=True)
    recorded_by_name = serializers.CharField(source='recorded_by.get_full_name', read_only=True)

    class Meta:
        model = ConductLog
        fields = [
            'id', 'learner', 'learner_name', 'learner_lrn',
            'date', 'item', 'type',
            'recorded_by', 'recorded_by_name', 'created_at',
        ]
        read_only_fields = ['created_at']


# ============================================================================
# MESSAGING
# ============================================================================

class MessageSerializer(serializers.ModelSerializer):
    sender_name = serializers.CharField(source='sender.get_full_name', read_only=True)
    receiver_name = serializers.CharField(source='receiver.get_full_name', read_only=True)
    learner_name = serializers.CharField(source='learner.full_name', read_only=True)
    is_read = serializers.BooleanField(read_only=True)

    class Meta:
        model = Message
        fields = [
            'id', 'sender', 'sender_name', 'receiver', 'receiver_name',
            'subject', 'body', 'learner', 'learner_name',
            'is_read', 'read_at', 'created_at',
        ]
        read_only_fields = ['read_at', 'created_at', 'is_read']


# ============================================================================
# GRADUATION
# ============================================================================

class GraduationNotificationSerializer(serializers.ModelSerializer):
    learner_name = serializers.CharField(source='learner.full_name', read_only=True)

    class Meta:
        model = GraduationNotification
        fields = ['id', 'learner', 'learner_name', 'channel', 'status', 'message', 'sent_at']
        read_only_fields = ['sent_at']


class AbsenceAlertSerializer(serializers.ModelSerializer):
    learner_name = serializers.CharField(source='learner.full_name', read_only=True)
    learner_lrn = serializers.CharField(source='learner.lrn', read_only=True)
    section_label = serializers.SerializerMethodField()

    class Meta:
        model = AbsenceAlert
        fields = [
            'id', 'learner', 'learner_name', 'learner_lrn', 'section_label',
            'threshold', 'streak_start_date', 'channel', 'status', 'notified_at',
        ]
        read_only_fields = ['notified_at']

    def get_section_label(self, obj):
        if not obj.learner.section:
            return None
        s = obj.learner.section
        if s.strand:
            return f"{s.grade_level.label} - {s.strand} - {s.name}"
        return f"{s.grade_level.label} - {s.name}"


# ============================================================================
# REPORTS
# ============================================================================

class ReportCardSerializer(serializers.ModelSerializer):
    learner_name = serializers.CharField(source='learner.full_name', read_only=True)
    learner_lrn = serializers.CharField(source='learner.lrn', read_only=True)
    is_expired = serializers.BooleanField(read_only=True)

    class Meta:
        model = ReportCard
        fields = [
            'id', 'learner', 'learner_name', 'learner_lrn',
            'school_year', 'pdf_path', 'status',
            'generated_at', 'expires_at', 'is_expired', 'error_message',
        ]
        read_only_fields = ['generated_at', 'expires_at', 'is_expired']


class SF1RecordSerializer(serializers.ModelSerializer):
    learner_name = serializers.CharField(source='learner.full_name', read_only=True)
    learner_lrn = serializers.CharField(source='learner.lrn', read_only=True)

    class Meta:
        model = SF1Record
        fields = [
            'id', 'learner', 'learner_name', 'learner_lrn',
            'section', 'school_year', 'enrollment_status',
            'age_as_of_june', 'is_indigenous_people', 'is_4ps_beneficiary',
            'is_returning_learner', 'mother_tongue',
            'date_enrolled', 'date_dropped', 'drop_reason',
            'pdf_path', 'generated_at', 'created_at', 'updated_at',
        ]
        read_only_fields = ['generated_at', 'created_at', 'updated_at']


class SF2ReportSerializer(serializers.ModelSerializer):
    section_label = serializers.SerializerMethodField()
    generated_by_name = serializers.CharField(source='generated_by.get_full_name', read_only=True)

    class Meta:
        model = SF2Report
        fields = [
            'id', 'section', 'section_label', 'school_year', 'month', 'year',
            'total_school_days', 'total_male_enrolled', 'total_female_enrolled',
            'average_daily_attendance', 'attendance_rate', 'meets_sf2_target',
            'pdf_path', 'status',
            'generated_by', 'generated_by_name',
            'generated_at', 'submitted_at', 'created_at',
        ]
        read_only_fields = ['generated_at', 'submitted_at', 'created_at']

    def get_section_label(self, obj):
        s = obj.section
        if s.strand:
            return f"{s.grade_level.label} - {s.strand} - {s.name}"
        return f"{s.grade_level.label} - {s.name}"


# ============================================================================
# SETTINGS & AUDIT
# ============================================================================

class SchoolSettingsSerializer(serializers.ModelSerializer):
    class Meta:
        model = SchoolSettings
        fields = '__all__'


class SchoolYearConfigSerializer(serializers.ModelSerializer):
    class Meta:
        model = SchoolYearConfig
        fields = '__all__'
        read_only_fields = ['created_at']


class AdminTaskSerializer(serializers.ModelSerializer):
    learner_name = serializers.CharField(source='learner.full_name', read_only=True)
    assigned_to_name = serializers.CharField(source='assigned_to.get_full_name', read_only=True)

    class Meta:
        model = AdminTask
        fields = [
            'id', 'title', 'description', 'task_type', 'priority', 'status',
            'learner', 'learner_name', 'assigned_to', 'assigned_to_name',
            'due_date', 'created_at', 'updated_at', 'completed_at',
        ]
        read_only_fields = ['created_at', 'updated_at']


class ActivityLogSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source='user.get_full_name', read_only=True)

    class Meta:
        model = ActivityLog
        fields = [
            'id', 'user', 'user_name', 'action', 'description',
            'subject_model', 'subject_id',
            'old_values', 'new_values',
            'ip_address', 'created_at',
        ]
        read_only_fields = fields


# ============================================================================
# MULTI-TENANCY
# ============================================================================

class TenantSerializer(serializers.ModelSerializer):
    is_active = serializers.BooleanField(read_only=True)
    is_expired = serializers.BooleanField(read_only=True)
    domain_count = serializers.SerializerMethodField()

    class Meta:
        model = Tenant
        fields = [
            'id', 'name', 'subdomain', 'plan', 'plan_expires_at',
            'setup_fee_paid', 'deleted_at',
            'sms_credits_remaining', 'messenger_conversations_used',
            'is_active', 'is_expired', 'domain_count',
            'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'is_active', 'is_expired']

    def get_domain_count(self, obj):
        return obj.domains.count()


class TenantDomainSerializer(serializers.ModelSerializer):
    class Meta:
        model = TenantDomain
        fields = ['id', 'tenant', 'domain', 'is_primary', 'created_at']
        read_only_fields = ['created_at']


class SMSCreditBundleSerializer(serializers.ModelSerializer):
    tenant_name = serializers.CharField(source='tenant.name', read_only=True)
    added_by_name = serializers.CharField(source='added_by.get_full_name', read_only=True)

    class Meta:
        model = SMSCreditBundle
        fields = [
            'id', 'tenant', 'tenant_name', 'credits_added',
            'amount_paid', 'added_by', 'added_by_name', 'created_at',
        ]
        read_only_fields = ['created_at']


class SubscriptionInvoiceSerializer(serializers.ModelSerializer):
    tenant_name = serializers.CharField(source='tenant.name', read_only=True)
    is_overdue = serializers.BooleanField(read_only=True)

    class Meta:
        model = SubscriptionInvoice
        fields = [
            'id', 'tenant', 'tenant_name', 'invoice_number',
            'billing_period_start', 'billing_period_end',
            'line_items', 'subtotal', 'tax', 'total_amount',
            'status', 'due_date', 'paid_at', 'is_overdue',
            'pdf_path', 'created_at', 'updated_at',
        ]
        read_only_fields = ['created_at', 'updated_at', 'is_overdue']


# ============================================================================
# DASHBOARD AGGREGATES (not model-backed — computed on the fly)
# ============================================================================

class DashboardStatsSerializer(serializers.Serializer):
    """Shape returned by GET /api/dashboard/stats/"""
    total_enrolled = serializers.IntegerField()
    campus_attendance = serializers.DecimalField(max_digits=5, decimal_places=2)
    sections_below_target = serializers.IntegerField()
    at_risk_count = serializers.IntegerField()
    id_cards_printed = serializers.IntegerField()
    pending_tasks = serializers.IntegerField()
    current_quarter = serializers.IntegerField()
    current_week = serializers.IntegerField()
    school_name = serializers.CharField()
    school_year = serializers.CharField()


class DepartmentStatsSerializer(serializers.Serializer):
    """Shape returned by GET /api/dashboard/departments/"""
    key = serializers.CharField()
    label = serializers.CharField()
    caption = serializers.CharField()
    enrolled = serializers.IntegerField()
    attendance_rate = serializers.DecimalField(max_digits=5, decimal_places=2)
    sections_below_target = serializers.IntegerField()
    sections = SectionSerializer(many=True)
