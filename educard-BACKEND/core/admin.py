"""
Django Admin Configuration for EduCard Pro
All 22 models registered with sensible list_display, filters, and search.
"""
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.utils.html import format_html
from .models import (
    # Auth & Users
    User, ParentProfile,
    # School Structure
    Department, GradeLevel, Section,
    # Learners
    Learner,
    # Subjects & Grades
    Subject, Grade, GradeAuditLog,
    # Attendance
    SchoolCalendar, AttendanceRecord,
    # ID Cards
    IDTemplate, IDPrintQueue, IDCardElementPosition,
    # Notifications
    NotificationRecord, SMSLog, NotificationPreference,
    # Conduct
    ConductLog,
    # Messaging
    Message,
    # Graduation
    GraduationNotification, AbsenceAlert,
    # Reports & Imports
    ReportCard, BulkImportJob, SF1Record, SF2Report,
    # Messenger
    MessengerWebhookEvent,
    # Audit
    ActivityLog,
    # Settings
    SchoolSettings,
    # Multi-tenancy
    Tenant, TenantDomain, SMSCreditBundle, SubscriptionInvoice,
    # Assignments & History
    TeacherSectionAssignment, LearnerSectionHistory,
    # Portal
    PortalSession,
    # Final models
    TeacherContact, AdminTask, SchoolYearConfig,
)


# ============================================================================
# USER & AUTH
# ============================================================================

@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = ['username', 'email', 'first_name', 'last_name', 'role', 'is_2fa_enabled', 'is_locked', 'is_active']
    list_filter = ['role', 'is_staff', 'is_active']
    search_fields = ['username', 'email', 'first_name', 'last_name']
    fieldsets = BaseUserAdmin.fieldsets + (
        ('EduCard Role & Contact', {
            'fields': ('role', 'phone', 'messenger_psid', 'subject_specialization')
        }),
        ('Two-Factor Authentication', {
            'fields': ('two_factor_secret', 'two_factor_confirmed_at'),
            'classes': ('collapse',),
        }),
        ('Login Security', {
            'fields': ('failed_login_attempts', 'locked_until'),
            'classes': ('collapse',),
        }),
    )

    def is_2fa_enabled(self, obj):
        return obj.is_2fa_enabled
    is_2fa_enabled.boolean = True
    is_2fa_enabled.short_description = '2FA'

    def is_locked(self, obj):
        return obj.is_locked
    is_locked.boolean = True
    is_locked.short_description = 'Locked'


@admin.register(ParentProfile)
class ParentProfileAdmin(admin.ModelAdmin):
    list_display = ['user', 'relationship', 'messenger_linked', 'sms_enabled']
    list_filter = ['relationship', 'messenger_linked', 'sms_enabled']
    search_fields = ['user__first_name', 'user__last_name', 'user__email']


# ============================================================================
# SCHOOL STRUCTURE
# ============================================================================

@admin.register(Department)
class DepartmentAdmin(admin.ModelAdmin):
    list_display = ['key', 'label', 'caption']


@admin.register(GradeLevel)
class GradeLevelAdmin(admin.ModelAdmin):
    list_display = ['level', 'label', 'department']
    list_filter = ['department']


@admin.register(Section)
class SectionAdmin(admin.ModelAdmin):
    list_display = ['name', 'grade_level', 'strand', 'adviser', 'enrollment_count', 'average_attendance_display']
    list_filter = ['grade_level__department', 'grade_level', 'strand']
    search_fields = ['name', 'adviser__first_name', 'adviser__last_name']

    def average_attendance_display(self, obj):
        val = obj.average_attendance
        color = 'green' if val >= 95 else 'red'
        return format_html('<span style="color:{}">{:.1f}%</span>', color, val)
    average_attendance_display.short_description = 'Avg Attendance'


# ============================================================================
# LEARNERS
# ============================================================================

@admin.register(Learner)
class LearnerAdmin(admin.ModelAdmin):
    list_display = [
        'lrn', 'full_name', 'section', 'gpa',
        'attendance_rate', 'graduation_status', 'barcode_active', 'status'
    ]
    list_filter = [
        'section__grade_level__department', 'section__grade_level',
        'sex', 'barcode_active', 'graduation_status'
    ]
    search_fields = ['lrn', 'first_name', 'last_name']
    readonly_fields = ['enrolled_at', 'barcode_value', 'full_name', 'status', 'is_graduate']
    fieldsets = (
        ('Basic Information', {
            'fields': ('lrn', 'first_name', 'middle_initial', 'last_name', 'birth_date', 'sex')
        }),
        ('Academic', {
            'fields': ('section', 'gpa', 'attendance_rate')
        }),
        ('ID Card & Barcode', {
            'fields': ('photo_path', 'barcode_value', 'barcode_active')
        }),
        ('Portal Access', {
            'fields': ('user_account', 'parent_account')
        }),
        ('Parent Contact', {
            'fields': ('parent_phone', 'parent_messenger_psid')
        }),
        ('Enrollment & Graduation', {
            'fields': ('graduation_status', 'enrolled_at', 'graduated_at')
        }),
    )


# ============================================================================
# SUBJECTS & GRADES
# ============================================================================

@admin.register(Subject)
class SubjectAdmin(admin.ModelAdmin):
    list_display = ['name', 'section', 'teacher', 'quarter_weight_quiz', 'quarter_weight_exam', 'quarter_weight_activity']
    list_filter = ['section__grade_level__department', 'section__grade_level']
    search_fields = ['name', 'teacher__first_name', 'teacher__last_name']


@admin.register(Grade)
class GradeAdmin(admin.ModelAdmin):
    list_display = ['learner', 'subject', 'quarter', 'quiz_score', 'exam_score', 'activity_score', 'computed_grade']
    list_filter = ['quarter', 'subject__section__grade_level']
    search_fields = ['learner__lrn', 'learner__first_name', 'learner__last_name', 'subject__name']
    readonly_fields = ['computed_grade', 'created_at', 'updated_at']


@admin.register(GradeAuditLog)
class GradeAuditLogAdmin(admin.ModelAdmin):
    list_display = ['grade', 'field_changed', 'old_value', 'new_value', 'changed_by', 'changed_at']
    list_filter = ['field_changed', 'changed_at']
    search_fields = ['grade__learner__lrn', 'grade__learner__first_name', 'grade__learner__last_name']
    readonly_fields = ['grade', 'changed_by', 'field_changed', 'old_value', 'new_value', 'changed_at']
    date_hierarchy = 'changed_at'

    def has_add_permission(self, request):
        return False  # Audit logs are system-generated only

    def has_change_permission(self, request, obj=None):
        return False  # Immutable


# ============================================================================
# ATTENDANCE
# ============================================================================

@admin.register(SchoolCalendar)
class SchoolCalendarAdmin(admin.ModelAdmin):
    list_display = ['date', 'type', 'label']
    list_filter = ['type']
    date_hierarchy = 'date'


@admin.register(AttendanceRecord)
class AttendanceRecordAdmin(admin.ModelAdmin):
    list_display = ['learner', 'date', 'status', 'time_in_morning', 'time_out_morning', 'time_in_afternoon', 'time_out_afternoon']
    list_filter = ['status', 'date', 'learner__section__grade_level']
    search_fields = ['learner__lrn', 'learner__first_name', 'learner__last_name']
    date_hierarchy = 'date'


# ============================================================================
# ID CARDS
# ============================================================================

@admin.register(IDTemplate)
class IDTemplateAdmin(admin.ModelAdmin):
    list_display = ['name', 'font_color', 'is_active', 'created_at']
    list_filter = ['is_active']


@admin.register(IDPrintQueue)
class IDPrintQueueAdmin(admin.ModelAdmin):
    list_display = ['learner', 'reason', 'status', 'requested_by', 'requested_at', 'printed_at']
    list_filter = ['status', 'reason']
    search_fields = ['learner__lrn', 'learner__first_name', 'learner__last_name']
    date_hierarchy = 'requested_at'


# ============================================================================
# NOTIFICATIONS & SMS
# ============================================================================

@admin.register(NotificationRecord)
class NotificationRecordAdmin(admin.ModelAdmin):
    list_display = ['parent', 'learner', 'channel', 'status', 'triggered_by', 'sent_at']
    list_filter = ['channel', 'status', 'triggered_by']
    search_fields = ['parent__first_name', 'parent__last_name', 'message']
    date_hierarchy = 'sent_at'


@admin.register(SMSLog)
class SMSLogAdmin(admin.ModelAdmin):
    list_display = ['phone', 'learner', 'status', 'cost', 'provider', 'created_at', 'sent_at']
    list_filter = ['status', 'provider', 'created_at']
    search_fields = ['phone', 'learner__lrn', 'learner__first_name', 'learner__last_name']
    readonly_fields = ['created_at', 'sent_at', 'provider_message_id']
    date_hierarchy = 'created_at'


# ============================================================================
# CONDUCT
# ============================================================================

@admin.register(ConductLog)
class ConductLogAdmin(admin.ModelAdmin):
    list_display = ['learner', 'type', 'date', 'recorded_by', 'item']
    list_filter = ['type', 'date']
    search_fields = ['learner__lrn', 'learner__first_name', 'learner__last_name', 'item']
    date_hierarchy = 'date'


# ============================================================================
# MESSAGING
# ============================================================================

@admin.register(Message)
class MessageAdmin(admin.ModelAdmin):
    list_display = ['sender', 'receiver', 'subject', 'learner', 'is_read', 'created_at']
    list_filter = ['created_at']
    search_fields = ['sender__first_name', 'sender__last_name', 'receiver__first_name', 'subject', 'body']
    readonly_fields = ['created_at']
    date_hierarchy = 'created_at'

    def is_read(self, obj):
        return obj.is_read
    is_read.boolean = True


# ============================================================================
# GRADUATION
# ============================================================================

@admin.register(GraduationNotification)
class GraduationNotificationAdmin(admin.ModelAdmin):
    list_display = ['learner', 'channel', 'status', 'sent_at']
    list_filter = ['channel', 'status']
    search_fields = ['learner__lrn', 'learner__first_name', 'learner__last_name']
    readonly_fields = ['sent_at']


@admin.register(AbsenceAlert)
class AbsenceAlertAdmin(admin.ModelAdmin):
    list_display = ['learner', 'threshold', 'streak_start_date', 'channel', 'status', 'notified_at']
    list_filter = ['threshold', 'channel', 'status']
    search_fields = ['learner__lrn', 'learner__first_name', 'learner__last_name']
    date_hierarchy = 'notified_at'


# ============================================================================
# REPORT CARDS & BULK IMPORTS
# ============================================================================

@admin.register(ReportCard)
class ReportCardAdmin(admin.ModelAdmin):
    list_display = ['learner', 'school_year', 'status', 'generated_at', 'is_expired']
    list_filter = ['status', 'school_year']
    search_fields = ['learner__lrn', 'learner__first_name', 'learner__last_name']
    readonly_fields = ['generated_at', 'expires_at']

    def is_expired(self, obj):
        return obj.is_expired
    is_expired.boolean = True


@admin.register(BulkImportJob)
class BulkImportJobAdmin(admin.ModelAdmin):
    list_display = ['import_type', 'original_filename', 'status', 'total_rows', 'imported_rows', 'failed_rows', 'uploaded_by', 'created_at']
    list_filter = ['import_type', 'status']
    search_fields = ['original_filename', 'uploaded_by__first_name', 'uploaded_by__last_name']
    readonly_fields = ['created_at', 'completed_at', 'error_log']
    date_hierarchy = 'created_at'


# ============================================================================
# MESSENGER WEBHOOK
# ============================================================================

@admin.register(MessengerWebhookEvent)
class MessengerWebhookEventAdmin(admin.ModelAdmin):
    list_display = ['psid', 'event_type', 'ref_param', 'matched_learner', 'processed', 'received_at']
    list_filter = ['event_type', 'processed']
    search_fields = ['psid', 'ref_param', 'matched_learner__lrn']
    readonly_fields = ['raw_payload', 'received_at']
    date_hierarchy = 'received_at'


# ============================================================================
# ACTIVITY LOG
# ============================================================================

@admin.register(ActivityLog)
class ActivityLogAdmin(admin.ModelAdmin):
    list_display = ['created_at', 'user', 'action', 'subject_model', 'subject_id', 'ip_address']
    list_filter = ['action', 'subject_model', 'created_at']
    search_fields = ['user__first_name', 'user__last_name', 'description']
    readonly_fields = ['user', 'action', 'description', 'subject_model', 'subject_id',
                       'old_values', 'new_values', 'ip_address', 'created_at']
    date_hierarchy = 'created_at'

    def has_add_permission(self, request):
        return False

    def has_change_permission(self, request, obj=None):
        return False


# ============================================================================
# SCHOOL SETTINGS
# ============================================================================

@admin.register(SchoolSettings)
class SchoolSettingsAdmin(admin.ModelAdmin):
    list_display = ['school_name', 'school_year', 'current_quarter', 'sf2_target_attendance', 'plan', 'sms_credits_remaining']
    fieldsets = (
        ('School Identity', {
            'fields': ('school_name', 'school_year', 'school_logo_path', 'primary_color')
        }),
        ('Academic Period', {
            'fields': ('current_quarter', 'current_week', 'sf2_target_attendance')
        }),
        ('Grading Periods', {
            'fields': (
                'grading_period_1_start', 'grading_period_1_end',
                'grading_period_2_start', 'grading_period_2_end',
                'grading_period_3_start', 'grading_period_3_end',
                'grading_period_4_start', 'grading_period_4_end',
            )
        }),
        ('Notifications', {
            'fields': ('messenger_enabled', 'sms_enabled', 'sms_credits_remaining', 'messenger_conversations_used')
        }),
        ('Subscription', {
            'fields': ('plan', 'plan_expires_at')
        }),
    )

    def has_add_permission(self, request):
        return not SchoolSettings.objects.exists()

    def has_delete_permission(self, request, obj=None):
        return False


# ============================================================================
# MULTI-TENANCY (Super Admin)
# ============================================================================

@admin.register(Tenant)
class TenantAdmin(admin.ModelAdmin):
    list_display = ['name', 'subdomain', 'plan', 'is_active', 'is_expired', 'sms_credits_remaining', 'setup_fee_paid', 'created_at']
    list_filter = ['plan', 'setup_fee_paid']
    search_fields = ['name', 'subdomain']
    readonly_fields = ['id', 'created_at', 'updated_at']
    fieldsets = (
        ('Identity', {
            'fields': ('id', 'name', 'subdomain')
        }),
        ('Subscription', {
            'fields': ('plan', 'plan_expires_at', 'setup_fee_paid')
        }),
        ('Usage', {
            'fields': ('sms_credits_remaining', 'messenger_conversations_used')
        }),
        ('Lifecycle', {
            'fields': ('deleted_at', 'created_at', 'updated_at')
        }),
    )

    def is_active(self, obj):
        return obj.is_active
    is_active.boolean = True

    def is_expired(self, obj):
        return obj.is_expired
    is_expired.boolean = True


@admin.register(TenantDomain)
class TenantDomainAdmin(admin.ModelAdmin):
    list_display = ['domain', 'tenant', 'is_primary', 'created_at']
    list_filter = ['is_primary']
    search_fields = ['domain', 'tenant__name']


@admin.register(SMSCreditBundle)
class SMSCreditBundleAdmin(admin.ModelAdmin):
    list_display = ['tenant', 'credits_added', 'amount_paid', 'added_by', 'created_at']
    list_filter = ['credits_added']
    search_fields = ['tenant__name']
    readonly_fields = ['created_at']
    date_hierarchy = 'created_at'


# ============================================================================
# TEACHER–SECTION ASSIGNMENTS
# ============================================================================

@admin.register(TeacherSectionAssignment)
class TeacherSectionAssignmentAdmin(admin.ModelAdmin):
    list_display = ['teacher', 'section', 'school_year', 'is_active', 'assigned_at']
    list_filter = ['school_year', 'is_active', 'section__grade_level__department']
    search_fields = ['teacher__first_name', 'teacher__last_name', 'section__name']
    date_hierarchy = 'assigned_at'


# ============================================================================
# LEARNER SECTION HISTORY
# ============================================================================

@admin.register(LearnerSectionHistory)
class LearnerSectionHistoryAdmin(admin.ModelAdmin):
    list_display = ['learner', 'section', 'school_year', 'reason', 'effective_date', 'recorded_by']
    list_filter = ['reason', 'school_year']
    search_fields = ['learner__lrn', 'learner__first_name', 'learner__last_name']
    date_hierarchy = 'effective_date'
    readonly_fields = ['created_at']


# ============================================================================
# SF1 RECORDS
# ============================================================================

@admin.register(SF1Record)
class SF1RecordAdmin(admin.ModelAdmin):
    list_display = [
        'learner', 'section', 'school_year', 'enrollment_status',
        'is_4ps_beneficiary', 'is_indigenous_people', 'date_enrolled'
    ]
    list_filter = ['school_year', 'enrollment_status', 'is_4ps_beneficiary', 'is_indigenous_people']
    search_fields = ['learner__lrn', 'learner__first_name', 'learner__last_name']
    readonly_fields = ['created_at', 'updated_at', 'generated_at']
    fieldsets = (
        ('Learner & Section', {
            'fields': ('learner', 'section', 'school_year', 'enrollment_status')
        }),
        ('DepEd Required Fields', {
            'fields': (
                'age_as_of_june', 'mother_tongue',
                'is_indigenous_people', 'is_4ps_beneficiary', 'is_returning_learner'
            )
        }),
        ('Dates', {
            'fields': ('date_enrolled', 'date_dropped', 'drop_reason')
        }),
        ('Generated PDF', {
            'fields': ('pdf_path', 'generated_at'),
            'classes': ('collapse',),
        }),
    )


# ============================================================================
# SF2 REPORTS
# ============================================================================

@admin.register(SF2Report)
class SF2ReportAdmin(admin.ModelAdmin):
    list_display = [
        'section', 'school_year', 'month', 'year',
        'attendance_rate', 'meets_sf2_target', 'status', 'generated_at'
    ]
    list_filter = ['status', 'meets_sf2_target', 'year', 'month']
    search_fields = ['section__name', 'section__grade_level__label']
    readonly_fields = ['generated_at', 'submitted_at', 'created_at']

    def meets_sf2_target(self, obj):
        return obj.meets_sf2_target
    meets_sf2_target.boolean = True


# ============================================================================
# NOTIFICATION PREFERENCES
# ============================================================================

@admin.register(NotificationPreference)
class NotificationPreferenceAdmin(admin.ModelAdmin):
    list_display = [
        'learner', 'messenger_enabled', 'sms_enabled',
        'attendance_alerts', 'grade_notifications',
        'absence_warnings', 'conduct_alerts', 'is_muted'
    ]
    list_filter = ['messenger_enabled', 'sms_enabled', 'attendance_alerts']
    search_fields = ['learner__lrn', 'learner__first_name', 'learner__last_name']
    readonly_fields = ['updated_at']

    def is_muted(self, obj):
        return obj.is_muted
    is_muted.boolean = True


# ============================================================================
# ID CARD ELEMENT POSITIONS
# ============================================================================

@admin.register(IDCardElementPosition)
class IDCardElementPositionAdmin(admin.ModelAdmin):
    list_display = ['template', 'element', 'x', 'y', 'width', 'height', 'font_size', 'font_bold']
    list_filter = ['template', 'element']
    search_fields = ['template__name']


# ============================================================================
# SUBSCRIPTION INVOICES
# ============================================================================

@admin.register(SubscriptionInvoice)
class SubscriptionInvoiceAdmin(admin.ModelAdmin):
    list_display = [
        'invoice_number', 'tenant', 'billing_period_start', 'billing_period_end',
        'total_amount', 'status', 'due_date', 'is_overdue', 'paid_at'
    ]
    list_filter = ['status', 'due_date']
    search_fields = ['invoice_number', 'tenant__name']
    readonly_fields = ['created_at', 'updated_at']
    date_hierarchy = 'created_at'

    def is_overdue(self, obj):
        return obj.is_overdue
    is_overdue.boolean = True


# ============================================================================
# PORTAL SESSIONS
# ============================================================================

@admin.register(PortalSession)
class PortalSessionAdmin(admin.ModelAdmin):
    list_display = [
        'user', 'portal_type', 'ip_address',
        'is_active', 'logged_in_at', 'last_active_at', 'logged_out_at'
    ]
    list_filter = ['portal_type', 'is_active']
    search_fields = ['user__first_name', 'user__last_name', 'user__email', 'ip_address']
    readonly_fields = ['logged_in_at', 'last_active_at']
    date_hierarchy = 'logged_in_at'


# ============================================================================
# TEACHER CONTACTS
# ============================================================================

@admin.register(TeacherContact)
class TeacherContactAdmin(admin.ModelAdmin):
    list_display = ['teacher', 'phone', 'messenger_username', 'email', 'show_phone', 'show_email']
    search_fields = ['teacher__first_name', 'teacher__last_name', 'phone', 'email']
    readonly_fields = ['updated_at']


# ============================================================================
# ADMIN TASKS
# ============================================================================

@admin.register(AdminTask)
class AdminTaskAdmin(admin.ModelAdmin):
    list_display = ['title', 'task_type', 'priority', 'status', 'learner', 'due_date', 'created_at']
    list_filter = ['priority', 'status', 'task_type']
    search_fields = ['title', 'description', 'learner__lrn', 'learner__first_name']
    readonly_fields = ['created_at', 'updated_at', 'completed_at']
    date_hierarchy = 'created_at'


# ============================================================================
# SCHOOL YEAR CONFIG
# ============================================================================

@admin.register(SchoolYearConfig)
class SchoolYearConfigAdmin(admin.ModelAdmin):
    list_display = ['school_year', 'is_current', 'q1_start', 'q4_end', 'total_school_days', 'enrollment_count']
    list_filter = ['is_current']
    readonly_fields = ['created_at']
