"""
EduCard Pro - Django Models
Full schema based on EduCardPro_Detailed_Plan.txt (all 8 phases)
"""
from django.db import models
from django.contrib.auth.models import AbstractUser
from django.core.validators import MinLengthValidator, MaxLengthValidator, MinValueValidator, MaxValueValidator
from django.utils import timezone
import uuid


# ============================================================================
# 1. USER & AUTHENTICATION
# ============================================================================

class User(AbstractUser):
    """
    Extended user model with role-based access.
    Roles: admin (Principal/Registrar), teacher, student, parent.
    Includes TOTP 2FA fields (Phase 2.5) and login-attempt tracking.
    """
    ROLE_CHOICES = [
        ('admin', 'Admin (Principal/Registrar)'),
        ('teacher', 'Teacher'),
        ('student', 'Student'),
        ('parent', 'Parent'),
    ]

    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='student')
    phone = models.CharField(max_length=20, blank=True, null=True)
    messenger_psid = models.CharField(
        max_length=50, blank=True, null=True,
        help_text="Facebook Page-Scoped ID for Messenger notifications"
    )

    # Teacher-specific
    subject_specialization = models.CharField(max_length=100, blank=True, null=True)

    # Two-Factor Authentication (Phase 2.5)
    two_factor_secret = models.CharField(
        max_length=64, blank=True, null=True,
        help_text="TOTP secret key (base32 encoded)"
    )
    two_factor_confirmed_at = models.DateTimeField(
        null=True, blank=True,
        help_text="Set when user confirms 2FA setup"
    )

    # Login security
    failed_login_attempts = models.IntegerField(
        default=0,
        help_text="Consecutive failed login attempts; lock after 5"
    )
    locked_until = models.DateTimeField(
        null=True, blank=True,
        help_text="Account locked until this datetime"
    )

    class Meta:
        db_table = 'users'

    def __str__(self):
        return f"{self.get_full_name()} ({self.get_role_display()})"

    @property
    def is_2fa_enabled(self):
        return self.two_factor_confirmed_at is not None

    @property
    def is_locked(self):
        if self.locked_until and self.locked_until > timezone.now():
            return True
        return False


# ============================================================================
# 2. SCHOOL STRUCTURE (DepEd K-12 Hierarchy)
# ============================================================================


class Department(models.Model):
    """JHS (Junior High School) or SHS (Senior High School)"""
    DEPARTMENT_CHOICES = [
        ('JHS', 'Junior High School'),
        ('SHS', 'Senior High School'),
    ]
    
    key = models.CharField(max_length=3, choices=DEPARTMENT_CHOICES, unique=True)
    label = models.CharField(max_length=100)
    caption = models.CharField(max_length=100, help_text="e.g., Grades 7-10")
    
    class Meta:
        db_table = 'departments'
        ordering = ['key']
        
    def __str__(self):
        return f"{self.label} ({self.caption})"


class GradeLevel(models.Model):
    """Grade 7-12"""
    LEVEL_CHOICES = [(i, f'Grade {i}') for i in range(7, 13)]
    
    department = models.ForeignKey(Department, on_delete=models.CASCADE, related_name='grade_levels')
    level = models.IntegerField(choices=LEVEL_CHOICES, validators=[MinValueValidator(7), MaxValueValidator(12)])
    label = models.CharField(max_length=50)
    
    class Meta:
        db_table = 'grade_levels'
        ordering = ['level']
        unique_together = ['department', 'level']
        
    def __str__(self):
        return f"{self.label} ({self.department.key})"



class Section(models.Model):
    """Class sections (e.g., Sampaguita, Rosal, St. Jude)"""
    STRAND_CHOICES = [
        ('STEM', 'Science, Technology, Engineering, and Mathematics'),
        ('ABM', 'Accountancy, Business, and Management'),
        ('HUMSS', 'Humanities and Social Sciences'),
        ('GAS', 'General Academic Strand'),
        ('TVL-ICT', 'Technical-Vocational-Livelihood - ICT'),
        ('TVL-HE', 'Technical-Vocational-Livelihood - Home Economics'),
    ]
    
    grade_level = models.ForeignKey(GradeLevel, on_delete=models.CASCADE, related_name='sections')
    name = models.CharField(max_length=100, help_text="e.g., Sampaguita, St. Jude")
    strand = models.CharField(max_length=10, choices=STRAND_CHOICES, blank=True, null=True, help_text="SHS only")
    adviser = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='advised_sections', limit_choices_to={'role': 'teacher'})
    
    class Meta:
        db_table = 'sections'
        ordering = ['grade_level', 'name']
        
    def __str__(self):
        if self.strand:
            return f"{self.grade_level.label} - {self.strand} - {self.name}"
        return f"{self.grade_level.label} - {self.name}"
    
    @property
    def enrollment_count(self):
        return self.learners.count()
    
    @property
    def average_attendance(self):
        learners = self.learners.all()
        if not learners:
            return 0
        return sum(l.attendance_rate for l in learners) / len(learners)



# ============================================================================
# 3. LEARNERS (STUDENTS)
# ============================================================================

class Learner(models.Model):
    """Student records with DepEd LRN"""
    SEX_CHOICES = [
        ('M', 'Male'),
        ('F', 'Female'),
    ]
    
    GRADUATION_STATUS_CHOICES = [
        ('active', 'Active'),
        ('candidate', 'Graduation Candidate'),
        ('confirmed', 'Confirmed Graduate'),
        ('archived', 'Archived'),
    ]
    
    # Basic Information
    lrn = models.CharField(max_length=12, unique=True, validators=[MinLengthValidator(12), MaxLengthValidator(12)], help_text="12-digit Learner Reference Number")
    first_name = models.CharField(max_length=100)
    middle_initial = models.CharField(max_length=1, blank=True)
    last_name = models.CharField(max_length=100)
    birth_date = models.DateField()
    sex = models.CharField(max_length=1, choices=SEX_CHOICES)
    
    # Academic Information
    section = models.ForeignKey(Section, on_delete=models.SET_NULL, null=True, related_name='learners')
    gpa = models.DecimalField(max_digits=5, decimal_places=2, default=0, validators=[MinValueValidator(0), MaxValueValidator(100)])
    attendance_rate = models.DecimalField(max_digits=5, decimal_places=2, default=0, validators=[MinValueValidator(0), MaxValueValidator(100)], help_text="Percentage 0-100")
    
    # ID Card & Barcode
    photo_path = models.CharField(max_length=500, blank=True, null=True, help_text="Path to student photo")
    barcode_value = models.CharField(max_length=12, help_text="Same as LRN")
    barcode_active = models.BooleanField(default=True, help_text="False for graduates")
    
    # Portal Access
    user_account = models.OneToOneField(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='learner_profile', limit_choices_to={'role': 'student'})
    parent_account = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='children', limit_choices_to={'role': 'parent'})
    
    # Parent Contact
    parent_phone = models.CharField(max_length=20, blank=True, null=True)
    parent_messenger_psid = models.CharField(max_length=50, blank=True, null=True)
    
    # Enrollment & Graduation Status
    graduation_status = models.CharField(max_length=20, choices=GRADUATION_STATUS_CHOICES, default='active')
    enrolled_at = models.DateTimeField(auto_now_add=True)
    graduated_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        db_table = 'learners'
        ordering = ['last_name', 'first_name']
        
    def __str__(self):
        return f"{self.first_name} {self.middle_initial}. {self.last_name} (LRN: {self.lrn})"
    
    @property
    def full_name(self):
        return f"{self.first_name} {self.middle_initial}. {self.last_name}"
    
    @property
    def status(self):
        """Returns 'On Track' or 'At Risk' based on GPA and attendance"""
        if self.attendance_rate < 95 or self.gpa < 75:
            return "At Risk"
        return "On Track"
    
    @property
    def is_graduate(self):
        """Check if learner is a confirmed graduate"""
        return self.graduation_status in ['confirmed', 'archived']
    
    def save(self, *args, **kwargs):
        # Auto-set barcode_value to LRN
        if not self.barcode_value:
            self.barcode_value = self.lrn
        super().save(*args, **kwargs)



# ============================================================================
# 4. SUBJECTS & GRADES
# ============================================================================

class Subject(models.Model):
    """Subjects taught in each section"""
    section = models.ForeignKey(Section, on_delete=models.CASCADE, related_name='subjects')
    teacher = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='taught_subjects', limit_choices_to={'role': 'teacher'})
    name = models.CharField(max_length=100, help_text="e.g., Mathematics 7, General Physics I")
    
    # Grading weights (must sum to 100)
    quarter_weight_quiz = models.DecimalField(max_digits=5, decimal_places=2, default=30.00)
    quarter_weight_exam = models.DecimalField(max_digits=5, decimal_places=2, default=40.00)
    quarter_weight_activity = models.DecimalField(max_digits=5, decimal_places=2, default=30.00)
    
    class Meta:
        db_table = 'subjects'
        ordering = ['section', 'name']
        
    def __str__(self):
        return f"{self.name} ({self.section})"


class Grade(models.Model):
    """Quarter grades for each learner per subject"""
    QUARTER_CHOICES = [(i, f'Quarter {i}') for i in range(1, 5)]
    
    learner = models.ForeignKey(Learner, on_delete=models.CASCADE, related_name='grades')
    subject = models.ForeignKey(Subject, on_delete=models.CASCADE, related_name='grades')
    quarter = models.IntegerField(choices=QUARTER_CHOICES, validators=[MinValueValidator(1), MaxValueValidator(4)])
    
    # Component scores
    quiz_score = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True, validators=[MinValueValidator(0), MaxValueValidator(100)])
    exam_score = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True, validators=[MinValueValidator(0), MaxValueValidator(100)])
    activity_score = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True, validators=[MinValueValidator(0), MaxValueValidator(100)])
    
    # Computed grade (calculated based on weights)
    computed_grade = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'grades'
        unique_together = ['learner', 'subject', 'quarter']
        ordering = ['learner', 'subject', 'quarter']
        
    def __str__(self):
        return f"{self.learner.full_name} - {self.subject.name} Q{self.quarter}: {self.computed_grade or 'N/A'}"
    
    def calculate_grade(self):
        """Calculate weighted grade based on component scores"""
        if self.quiz_score is None or self.exam_score is None or self.activity_score is None:
            return None
        
        weights = self.subject
        grade = (
            (self.quiz_score * weights.quarter_weight_quiz / 100) +
            (self.exam_score * weights.quarter_weight_exam / 100) +
            (self.activity_score * weights.quarter_weight_activity / 100)
        )
        return round(grade, 2)
    
    def save(self, *args, **kwargs):
        # Auto-calculate computed_grade
        self.computed_grade = self.calculate_grade()
        super().save(*args, **kwargs)



# ============================================================================
# 5. ATTENDANCE
# ============================================================================

class SchoolCalendar(models.Model):
    """School calendar with holidays and suspensions"""
    TYPE_CHOICES = [
        ('school_day', 'School Day'),
        ('holiday', 'Holiday'),
        ('suspension', 'Suspension'),
    ]
    
    date = models.DateField(unique=True)
    type = models.CharField(max_length=20, choices=TYPE_CHOICES, default='school_day')
    label = models.CharField(max_length=200, blank=True, null=True, help_text="e.g., Rizal Day")
    
    class Meta:
        db_table = 'school_calendar'
        ordering = ['date']
        
    def __str__(self):
        return f"{self.date} - {self.get_type_display()}"


class AttendanceRecord(models.Model):
    """Daily attendance records with time-in/time-out"""
    STATUS_CHOICES = [
        ('present', 'Present'),
        ('absent', 'Absent'),
        ('late', 'Late'),
        ('excused', 'Excused'),
    ]
    
    learner = models.ForeignKey(Learner, on_delete=models.CASCADE, related_name='attendance_records')
    date = models.DateField()
    
    # Time tracking (4 sessions per day)
    time_in_morning = models.TimeField(null=True, blank=True)
    time_out_morning = models.TimeField(null=True, blank=True)
    time_in_afternoon = models.TimeField(null=True, blank=True)
    time_out_afternoon = models.TimeField(null=True, blank=True)
    
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='absent')
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'attendance_records'
        unique_together = ['learner', 'date']
        ordering = ['-date', 'learner']
        
    def __str__(self):
        return f"{self.learner.full_name} - {self.date} ({self.get_status_display()})"



# ============================================================================
# 6. ID CARDS & PRINTING
# ============================================================================

class IDTemplate(models.Model):
    """ID card design templates"""
    name = models.CharField(max_length=100, help_text="e.g., SY 2025-2026 Template")
    background_path = models.CharField(max_length=500, help_text="Path to background image")
    font_color = models.CharField(max_length=7, default='#FFFFFF', help_text="Hex color code")
    is_active = models.BooleanField(default=False, help_text="Only one template can be active")
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'id_templates'
        
    def __str__(self):
        return f"{self.name} {'(Active)' if self.is_active else ''}"
    
    def save(self, *args, **kwargs):
        # Ensure only one active template
        if self.is_active:
            IDTemplate.objects.filter(is_active=True).update(is_active=False)
        super().save(*args, **kwargs)


class IDPrintQueue(models.Model):
    """Queue for ID card printing and reprinting"""
    REASON_CHOICES = [
        ('new_enrollment', 'New Enrollment'),
        ('lost', 'Lost'),
        ('damaged', 'Damaged'),
        ('renewal', 'Renewal'),
    ]
    
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('generated', 'Generated'),
        ('printed', 'Printed'),
    ]
    
    learner = models.ForeignKey(Learner, on_delete=models.CASCADE, related_name='id_print_requests')
    template = models.ForeignKey(IDTemplate, on_delete=models.SET_NULL, null=True)
    reason = models.CharField(max_length=20, choices=REASON_CHOICES, default='new_enrollment')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    pdf_path = models.CharField(max_length=500, blank=True, null=True, help_text="Path to generated PDF")
    
    requested_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='id_requests')
    requested_at = models.DateTimeField(auto_now_add=True)
    printed_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        db_table = 'id_print_queue'
        ordering = ['-requested_at']
        
    def __str__(self):
        return f"{self.learner.full_name} - {self.get_reason_display()} ({self.get_status_display()})"



# ============================================================================
# 7. NOTIFICATIONS & PARENT COMMUNICATION
# ============================================================================

class ParentProfile(models.Model):
    """Extended parent information"""
    RELATIONSHIP_CHOICES = [
        ('Mother', 'Mother'),
        ('Father', 'Father'),
        ('Guardian', 'Guardian'),
    ]
    
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='parent_profile', limit_choices_to={'role': 'parent'})
    relationship = models.CharField(max_length=20, choices=RELATIONSHIP_CHOICES)
    messenger_linked = models.BooleanField(default=False)
    sms_enabled = models.BooleanField(default=False)
    
    class Meta:
        db_table = 'parent_profiles'
        
    def __str__(self):
        return f"{self.user.get_full_name()} ({self.relationship})"


class NotificationRecord(models.Model):
    """History of all notifications sent to parents"""
    CHANNEL_CHOICES = [
        ('messenger', 'Facebook Messenger'),
        ('sms', 'SMS'),
        ('system', 'System'),
    ]
    
    STATUS_CHOICES = [
        ('sent', 'Sent'),
        ('failed', 'Failed'),
        ('pending', 'Pending'),
    ]
    
    TRIGGER_CHOICES = [
        ('attendance_scan', 'Attendance Scan'),
        ('grade_posted', 'Grade Posted'),
        ('absence_warning', 'Absence Warning'),
        ('system', 'System'),
    ]
    
    parent = models.ForeignKey(User, on_delete=models.CASCADE, related_name='notifications', limit_choices_to={'role': 'parent'})
    learner = models.ForeignKey(Learner, on_delete=models.CASCADE, related_name='notifications', null=True, blank=True)
    channel = models.CharField(max_length=20, choices=CHANNEL_CHOICES)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    message = models.TextField()
    triggered_by = models.CharField(max_length=20, choices=TRIGGER_CHOICES)
    
    sent_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'notification_records'
        ordering = ['-sent_at']
        
    def __str__(self):
        return f"{self.parent.get_full_name()} - {self.get_channel_display()} ({self.get_status_display()})"



# ============================================================================
# 8. CONDUCT & BEHAVIOR LOGS
# ============================================================================

class ConductLog(models.Model):
    """Student conduct and behavior records"""
    TYPE_CHOICES = [
        ('Positive', 'Positive'),
        ('Note', 'Note'),
        ('Warning', 'Warning'),
    ]
    
    learner = models.ForeignKey(Learner, on_delete=models.CASCADE, related_name='conduct_logs')
    date = models.DateField()
    item = models.TextField(help_text="Description of the conduct/behavior")
    type = models.CharField(max_length=20, choices=TYPE_CHOICES)
    recorded_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='recorded_conducts', limit_choices_to={'role__in': ['teacher', 'admin']})
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'conduct_logs'
        ordering = ['-date', '-created_at']
        
    def __str__(self):
        return f"{self.learner.full_name} - {self.type} ({self.date})"


# ============================================================================
# 9. SCHOOL SETTINGS & TENANT CONFIGURATION
# ============================================================================

class SchoolSettings(models.Model):
    """School-wide configuration (Tenant Settings)"""
    school_name = models.CharField(max_length=255, default="St. Mary's Academy")
    school_year = models.CharField(max_length=20, default="2025-2026")
    school_logo_path = models.CharField(max_length=500, blank=True, null=True)
    primary_color = models.CharField(max_length=7, default="#3B82F6", help_text="Hex color code for branding")
    
    # Current academic period
    current_quarter = models.IntegerField(default=3, validators=[MinValueValidator(1), MaxValueValidator(4)])
    current_week = models.IntegerField(default=6, validators=[MinValueValidator(1)])
    
    # SF2 (School Form 2) target
    sf2_target_attendance = models.DecimalField(max_digits=5, decimal_places=2, default=95.00, help_text="Target attendance percentage")
    
    # Grading period dates
    grading_period_1_start = models.DateField(null=True, blank=True)
    grading_period_1_end = models.DateField(null=True, blank=True)
    grading_period_2_start = models.DateField(null=True, blank=True)
    grading_period_2_end = models.DateField(null=True, blank=True)
    grading_period_3_start = models.DateField(null=True, blank=True)
    grading_period_3_end = models.DateField(null=True, blank=True)
    grading_period_4_start = models.DateField(null=True, blank=True)
    grading_period_4_end = models.DateField(null=True, blank=True)
    
    # Notification settings
    messenger_enabled = models.BooleanField(default=True)
    sms_enabled = models.BooleanField(default=True)
    sms_credits_remaining = models.IntegerField(default=0)
    messenger_conversations_used = models.IntegerField(default=0, help_text="Monthly Messenger conversation count")
    
    # Subscription info (cached from central tenant table)
    plan = models.CharField(max_length=20, default='basic', help_text="starter, basic, standard, premium, enterprise")
    plan_expires_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        db_table = 'school_settings'
        verbose_name = 'School Settings'
        verbose_name_plural = 'School Settings'
        
    def __str__(self):
        return f"{self.school_name} - SY {self.school_year}"


# ============================================================================
# 10. GRADE AUDIT LOGGING
# ============================================================================

class GradeAuditLog(models.Model):
    """Audit trail for grade changes"""
    grade = models.ForeignKey(Grade, on_delete=models.CASCADE, related_name='audit_logs')
    changed_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='grade_changes')
    field_changed = models.CharField(max_length=50, help_text="quiz_score, exam_score, or activity_score")
    old_value = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    new_value = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    changed_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'grade_audit_logs'
        ordering = ['-changed_at']
        
    def __str__(self):
        return f"{self.grade.learner.full_name} - {self.field_changed} changed by {self.changed_by}"


# ============================================================================
# 11. SMS LOGGING & TRACKING
# ============================================================================

class SMSLog(models.Model):
    """Track all SMS sent for billing and monitoring"""
    STATUS_CHOICES = [
        ('sent', 'Sent'),
        ('failed', 'Failed'),
        ('pending', 'Pending'),
    ]
    
    learner = models.ForeignKey(Learner, on_delete=models.SET_NULL, null=True, blank=True, related_name='sms_logs')
    phone = models.CharField(max_length=20)
    message = models.TextField()
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='pending')
    cost = models.DecimalField(max_digits=5, decimal_places=2, default=0.50, help_text="Cost in PHP")
    provider = models.CharField(max_length=50, default='Semaphore')
    
    # Response from SMS provider
    provider_message_id = models.CharField(max_length=100, blank=True, null=True)
    error_message = models.TextField(blank=True, null=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    sent_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        db_table = 'sms_logs'
        ordering = ['-created_at']
        
    def __str__(self):
        return f"SMS to {self.phone} - {self.get_status_display()}"


# ============================================================================
# 12. MESSAGING SYSTEM (Parent-Teacher Communication)
# ============================================================================

class Message(models.Model):
    """In-system messaging between parents and teachers"""
    sender = models.ForeignKey(User, on_delete=models.CASCADE, related_name='sent_messages')
    receiver = models.ForeignKey(User, on_delete=models.CASCADE, related_name='received_messages')
    subject = models.CharField(max_length=200)
    body = models.TextField()
    
    # Related learner (for context)
    learner = models.ForeignKey(Learner, on_delete=models.SET_NULL, null=True, blank=True, related_name='messages')
    
    read_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'messages'
        ordering = ['-created_at']
        
    def __str__(self):
        return f"{self.sender.get_full_name()} → {self.receiver.get_full_name()}: {self.subject}"
    
    @property
    def is_read(self):
        return self.read_at is not None


# ============================================================================
# 13. GRADUATION SYSTEM
# ============================================================================
# graduation_status is already on the Learner model above.
# The models below support the full graduation workflow (Phase 7).

class GraduationNotification(models.Model):
    """
    Tracks graduation congratulation messages sent to graduates/parents.
    Prevents duplicate sends and records delivery status.
    Phase 7.1 — GraduationNotificationJob
    """
    CHANNEL_CHOICES = [
        ('messenger', 'Facebook Messenger'),
        ('sms', 'SMS'),
    ]
    STATUS_CHOICES = [
        ('sent', 'Sent'),
        ('failed', 'Failed'),
        ('pending', 'Pending'),
    ]

    learner = models.OneToOneField(
        Learner, on_delete=models.CASCADE, related_name='graduation_notification'
    )
    channel = models.CharField(max_length=20, choices=CHANNEL_CHOICES)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='pending')
    message = models.TextField()
    sent_at = models.DateTimeField(null=True, blank=True)
    error_message = models.TextField(blank=True, null=True)

    class Meta:
        db_table = 'graduation_notifications'
        ordering = ['-sent_at']

    def __str__(self):
        return f"Graduation notif for {self.learner.full_name} — {self.get_status_display()}"


# ============================================================================
# 14. ABSENCE ALERT TRACKING
# ============================================================================

class AbsenceAlert(models.Model):
    """
    Tracks which absence-streak notifications have already been sent.
    Prevents the daily scheduled job from re-sending the same alert.
    Phase 6.3 — NotifyParentAbsenceJob
    """
    THRESHOLD_CHOICES = [
        (5, '5 Consecutive Days'),
        (10, '10 Consecutive Days'),
    ]

    learner = models.ForeignKey(
        Learner, on_delete=models.CASCADE, related_name='absence_alerts'
    )
    threshold = models.IntegerField(
        choices=THRESHOLD_CHOICES,
        help_text="5 or 10 consecutive absent days"
    )
    streak_start_date = models.DateField(
        help_text="First day of the consecutive absence streak"
    )
    notified_at = models.DateTimeField(auto_now_add=True)
    channel = models.CharField(
        max_length=20,
        choices=[('messenger', 'Messenger'), ('sms', 'SMS')],
        default='messenger'
    )
    status = models.CharField(
        max_length=10,
        choices=[('sent', 'Sent'), ('failed', 'Failed')],
        default='sent'
    )

    class Meta:
        db_table = 'absence_alerts'
        # One alert per learner per threshold per streak start
        unique_together = ['learner', 'threshold', 'streak_start_date']
        ordering = ['-notified_at']

    def __str__(self):
        return (
            f"{self.learner.full_name} — {self.threshold}-day absence alert "
            f"(streak from {self.streak_start_date})"
        )


# ============================================================================
# 15. REPORT CARD TRACKING
# ============================================================================

class ReportCard(models.Model):
    """
    Tracks generated report card PDFs per learner per school year.
    Phase 4.3 — ReportCardController
    """
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('generated', 'Generated'),
        ('failed', 'Failed'),
    ]

    learner = models.ForeignKey(
        Learner, on_delete=models.CASCADE, related_name='report_cards'
    )
    school_year = models.CharField(max_length=20, help_text="e.g., 2025-2026")
    pdf_path = models.CharField(
        max_length=500, blank=True, null=True,
        help_text="Storage path to the generated PDF"
    )
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='pending')
    generated_at = models.DateTimeField(null=True, blank=True)
    # Cache expiry — regenerate after 24 hours
    expires_at = models.DateTimeField(null=True, blank=True)
    error_message = models.TextField(blank=True, null=True)

    class Meta:
        db_table = 'report_cards'
        unique_together = ['learner', 'school_year']
        ordering = ['-generated_at']

    def __str__(self):
        return f"Report card — {self.learner.full_name} SY {self.school_year}"

    @property
    def is_expired(self):
        if self.expires_at is None:
            return True
        return timezone.now() > self.expires_at


# ============================================================================
# 16. BULK IMPORT JOBS
# ============================================================================

class BulkImportJob(models.Model):
    """
    Tracks bulk grade import jobs (CSV/Excel uploads).
    Phase 4.2 — GradeController@bulkImport
    """
    TYPE_CHOICES = [
        ('grades', 'Grade Import'),
        ('learners', 'Learner Import'),
    ]
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('processing', 'Processing'),
        ('completed', 'Completed'),
        ('failed', 'Failed'),
    ]

    uploaded_by = models.ForeignKey(
        User, on_delete=models.SET_NULL, null=True, related_name='bulk_imports'
    )
    import_type = models.CharField(max_length=20, choices=TYPE_CHOICES)
    file_path = models.CharField(max_length=500, help_text="Path to uploaded file")
    original_filename = models.CharField(max_length=255)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')

    # Results
    total_rows = models.IntegerField(default=0)
    imported_rows = models.IntegerField(default=0)
    failed_rows = models.IntegerField(default=0)
    error_log = models.JSONField(
        default=list, blank=True,
        help_text="List of row-level errors: [{row, lrn, error}]"
    )

    created_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = 'bulk_import_jobs'
        ordering = ['-created_at']

    def __str__(self):
        return (
            f"{self.get_import_type_display()} by {self.uploaded_by} "
            f"— {self.get_status_display()} ({self.imported_rows}/{self.total_rows})"
        )


# ============================================================================
# 17. MESSENGER WEBHOOK EVENTS
# ============================================================================

class MessengerWebhookEvent(models.Model):
    """
    Stores raw incoming Messenger webhook payloads.
    Used for parent opt-in (PSID capture) and debugging.
    Phase 6.1 — WebhookController@receive
    """
    EVENT_TYPE_CHOICES = [
        ('message', 'Incoming Message'),
        ('postback', 'Postback'),
        ('optin', 'Opt-In'),
        ('referral', 'Referral'),
    ]

    psid = models.CharField(
        max_length=50,
        help_text="Facebook Page-Scoped ID of the sender"
    )
    event_type = models.CharField(max_length=20, choices=EVENT_TYPE_CHOICES)
    # The ref param from m.me link: "optin_{learner_lrn}"
    ref_param = models.CharField(
        max_length=100, blank=True, null=True,
        help_text="ref= value from m.me opt-in link"
    )
    raw_payload = models.JSONField(
        help_text="Full webhook payload from Meta"
    )
    # If we matched this event to a learner
    matched_learner = models.ForeignKey(
        Learner, on_delete=models.SET_NULL, null=True, blank=True,
        related_name='messenger_events'
    )
    processed = models.BooleanField(
        default=False,
        help_text="True once PSID has been saved to learner"
    )
    received_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'messenger_webhook_events'
        ordering = ['-received_at']

    def __str__(self):
        return f"Messenger {self.get_event_type_display()} from PSID {self.psid}"


# ============================================================================
# 18. ACTIVITY / AUDIT LOG
# ============================================================================

class ActivityLog(models.Model):
    """
    School-wide audit log for admin actions.
    Covers: student edits, grade changes, ID prints, settings changes.
    Phase 8.3 — AuditLogController
    """
    ACTION_CHOICES = [
        # Learner actions
        ('learner_created', 'Learner Created'),
        ('learner_updated', 'Learner Updated'),
        ('learner_deleted', 'Learner Soft-Deleted'),
        ('learner_photo_uploaded', 'Learner Photo Uploaded'),
        # Grade actions
        ('grade_updated', 'Grade Updated'),
        ('grade_bulk_imported', 'Grades Bulk Imported'),
        # Attendance actions
        ('attendance_scanned', 'Attendance Scanned'),
        ('attendance_manual', 'Attendance Manually Edited'),
        # ID card actions
        ('id_generated', 'ID Card Generated'),
        ('id_printed', 'ID Card Marked Printed'),
        ('id_reprint_requested', 'ID Reprint Requested'),
        # Graduation actions
        ('graduation_confirmed', 'Graduation Confirmed'),
        # Settings actions
        ('settings_updated', 'Settings Updated'),
        ('calendar_updated', 'School Calendar Updated'),
        # User actions
        ('user_login', 'User Login'),
        ('user_logout', 'User Logout'),
        ('user_2fa_enabled', '2FA Enabled'),
    ]

    user = models.ForeignKey(
        User, on_delete=models.SET_NULL, null=True,
        related_name='activity_logs',
        help_text="Who performed the action"
    )
    action = models.CharField(max_length=50, choices=ACTION_CHOICES)
    description = models.TextField(
        help_text="Human-readable description of what changed"
    )

    # Generic relation to any model (store as JSON for simplicity)
    subject_model = models.CharField(
        max_length=50, blank=True, null=True,
        help_text="e.g., Learner, Grade, Section"
    )
    subject_id = models.IntegerField(
        null=True, blank=True,
        help_text="PK of the affected record"
    )
    # Snapshot of changes
    old_values = models.JSONField(
        null=True, blank=True,
        help_text="Field values before the change"
    )
    new_values = models.JSONField(
        null=True, blank=True,
        help_text="Field values after the change"
    )

    ip_address = models.GenericIPAddressField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'activity_logs'
        ordering = ['-created_at']

    def __str__(self):
        actor = self.user.get_full_name() if self.user else 'System'
        return f"[{self.created_at:%Y-%m-%d %H:%M}] {actor} — {self.get_action_display()}"


# ============================================================================
# 19. MULTI-TENANCY (Super Admin — Central Tables)
# ============================================================================

class Tenant(models.Model):
    """
    Central table representing each school (tenant).
    Managed by the Super Admin only.
    Phase 2.2 / Phase 8.2 — SuperTenantController
    """
    PLAN_CHOICES = [
        ('starter', 'Starter'),
        ('basic', 'Basic'),
        ('standard', 'Standard'),
        ('premium', 'Premium'),
        ('enterprise', 'Enterprise'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(
        max_length=255,
        help_text="School display name, e.g. St. Mary's Academy"
    )
    subdomain = models.CharField(
        max_length=100, unique=True,
        help_text="e.g. stmarys → stmarys.educardpro.com"
    )
    plan = models.CharField(max_length=20, choices=PLAN_CHOICES, default='basic')
    plan_expires_at = models.DateTimeField(
        null=True, blank=True,
        help_text="Null = active indefinitely (testing/enterprise)"
    )
    setup_fee_paid = models.BooleanField(default=False)

    # Soft-delete
    deleted_at = models.DateTimeField(null=True, blank=True)

    # Billing counters (updated by background jobs)
    sms_credits_remaining = models.IntegerField(default=0)
    messenger_conversations_used = models.IntegerField(
        default=0,
        help_text="Current month's Messenger conversation count"
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'tenants'
        ordering = ['name']

    def __str__(self):
        return f"{self.name} ({self.subdomain}) — {self.get_plan_display()}"

    @property
    def is_active(self):
        if self.deleted_at:
            return False
        if self.plan_expires_at and self.plan_expires_at < timezone.now():
            return False
        return True

    @property
    def is_expired(self):
        if self.plan_expires_at is None:
            return False
        return self.plan_expires_at < timezone.now()


class TenantDomain(models.Model):
    """
    Full domain names associated with a tenant.
    Phase 2.2 — tenant_domains table
    """
    tenant = models.ForeignKey(
        Tenant, on_delete=models.CASCADE, related_name='domains'
    )
    domain = models.CharField(
        max_length=255, unique=True,
        help_text="Full domain, e.g. stmarys.educardpro.com"
    )
    is_primary = models.BooleanField(
        default=True,
        help_text="Primary domain used for routing"
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'tenant_domains'
        ordering = ['domain']

    def __str__(self):
        return self.domain


class SMSCreditBundle(models.Model):
    """
    Records each SMS credit top-up purchased by a school.
    Phase 8.2 — SuperTenantController@addSmsCredits
    """
    BUNDLE_CHOICES = [
        (1000, '1,000 SMS Credits'),
        (2200, '2,200 SMS Credits'),
    ]

    tenant = models.ForeignKey(
        Tenant, on_delete=models.CASCADE, related_name='sms_bundles'
    )
    credits_added = models.IntegerField(choices=BUNDLE_CHOICES)
    amount_paid = models.DecimalField(
        max_digits=10, decimal_places=2,
        help_text="Amount paid in PHP"
    )
    added_by = models.ForeignKey(
        User, on_delete=models.SET_NULL, null=True,
        related_name='sms_credit_additions',
        help_text="Super Admin who added the credits"
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'sms_credit_bundles'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.tenant.name} — +{self.credits_added} SMS credits"


# ============================================================================
# 20. TEACHER–SECTION ASSIGNMENTS (Many-to-Many with extra data)
# ============================================================================

class TeacherSectionAssignment(models.Model):
    """
    Explicit M2M between teachers and sections they teach in.
    A teacher can be adviser of one section but teach subjects in many.
    Phase 2.3 — sections table (adviser_id) only covers the adviser role;
    this covers all teaching assignments for permission checks.
    """
    teacher = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='section_assignments',
        limit_choices_to={'role': 'teacher'},
    )
    section = models.ForeignKey(
        Section,
        on_delete=models.CASCADE,
        related_name='teacher_assignments',
    )
    school_year = models.CharField(
        max_length=20,
        help_text="e.g. 2025-2026 — allows historical records",
    )
    is_active = models.BooleanField(
        default=True,
        help_text="False when teacher is reassigned mid-year",
    )
    assigned_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'teacher_section_assignments'
        unique_together = ['teacher', 'section', 'school_year']
        ordering = ['-assigned_at']

    def __str__(self):
        return f"{self.teacher.get_full_name()} → {self.section} ({self.school_year})"


# ============================================================================
# 21. LEARNER SECTION HISTORY (Promotions & Transfers)
# ============================================================================

class LearnerSectionHistory(models.Model):
    """
    Tracks every section a learner has been in across school years.
    Needed for: transcript generation, retained-year detection,
    and historical report cards.
    Phase 7.1 — graduation archive needs full academic history.
    """
    REASON_CHOICES = [
        ('enrollment', 'Initial Enrollment'),
        ('promotion', 'Promoted to Next Grade'),
        ('transfer_in', 'Transfer In'),
        ('transfer_out', 'Transfer Out'),
        ('retained', 'Retained / Repeated Grade'),
    ]

    learner = models.ForeignKey(
        Learner,
        on_delete=models.CASCADE,
        related_name='section_history',
    )
    section = models.ForeignKey(
        Section,
        on_delete=models.SET_NULL,
        null=True,
        related_name='learner_history',
    )
    school_year = models.CharField(max_length=20, help_text="e.g. 2025-2026")
    reason = models.CharField(max_length=20, choices=REASON_CHOICES, default='enrollment')
    effective_date = models.DateField()
    recorded_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        related_name='section_history_entries',
    )
    notes = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'learner_section_history'
        ordering = ['-effective_date']

    def __str__(self):
        return (
            f"{self.learner.full_name} → {self.section} "
            f"({self.school_year}, {self.get_reason_display()})"
        )


# ============================================================================
# 22. SF1 RECORDS (DepEd School Form 1 — Enrollment Register)
# ============================================================================

class SF1Record(models.Model):
    """
    DepEd School Form 1: the official enrollment register.
    One row per learner per school year.
    Phase 2.7 / Phase 8.1 — Admin exports SF1 for DepEd submission.
    """
    ENROLLMENT_STATUS_CHOICES = [
        ('enrolled', 'Enrolled'),
        ('dropped', 'Dropped'),
        ('transferred', 'Transferred'),
        ('completed', 'Completed'),
    ]

    learner = models.ForeignKey(
        Learner,
        on_delete=models.CASCADE,
        related_name='sf1_records',
    )
    section = models.ForeignKey(
        Section,
        on_delete=models.SET_NULL,
        null=True,
        related_name='sf1_records',
    )
    school_year = models.CharField(max_length=20)
    enrollment_status = models.CharField(
        max_length=20,
        choices=ENROLLMENT_STATUS_CHOICES,
        default='enrolled',
    )

    # DepEd-required fields
    age_as_of_june = models.IntegerField(
        null=True, blank=True,
        help_text="Learner's age as of June 1 of the school year",
    )
    is_indigenous_people = models.BooleanField(default=False)
    is_4ps_beneficiary = models.BooleanField(
        default=False,
        help_text="Pantawid Pamilyang Pilipino Program beneficiary",
    )
    is_returning_learner = models.BooleanField(default=False)
    mother_tongue = models.CharField(max_length=50, blank=True, null=True)

    # Dates
    date_enrolled = models.DateField(null=True, blank=True)
    date_dropped = models.DateField(null=True, blank=True)
    drop_reason = models.TextField(blank=True, null=True)

    # Generated PDF
    pdf_path = models.CharField(max_length=500, blank=True, null=True)
    generated_at = models.DateTimeField(null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'sf1_records'
        unique_together = ['learner', 'school_year']
        ordering = ['-school_year', 'learner__last_name']

    def __str__(self):
        return f"SF1 — {self.learner.full_name} SY {self.school_year} ({self.get_enrollment_status_display()})"


# ============================================================================
# 23. SF2 REPORTS (DepEd School Form 2 — Attendance Compliance)
# ============================================================================

class SF2Report(models.Model):
    """
    Generated SF2 (Monthly Attendance Report) per section per month.
    Phase 3.2 — AttendanceController@summary
    Admin submits this to DepEd for compliance.
    """
    STATUS_CHOICES = [
        ('draft', 'Draft'),
        ('generated', 'Generated'),
        ('submitted', 'Submitted to DepEd'),
    ]

    section = models.ForeignKey(
        Section,
        on_delete=models.CASCADE,
        related_name='sf2_reports',
    )
    school_year = models.CharField(max_length=20)
    month = models.IntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(12)],
        help_text="Month number (1=January … 12=December)",
    )
    year = models.IntegerField(help_text="Calendar year, e.g. 2026")

    # Computed summary fields (denormalised for fast reporting)
    total_school_days = models.IntegerField(default=0)
    total_male_enrolled = models.IntegerField(default=0)
    total_female_enrolled = models.IntegerField(default=0)
    average_daily_attendance = models.DecimalField(
        max_digits=5, decimal_places=2, default=0,
    )
    attendance_rate = models.DecimalField(
        max_digits=5, decimal_places=2, default=0,
        help_text="Percentage — compared against SF2 95% target",
    )
    meets_sf2_target = models.BooleanField(default=False)

    # Generated PDF
    pdf_path = models.CharField(max_length=500, blank=True, null=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='draft')

    generated_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        related_name='sf2_reports',
    )
    generated_at = models.DateTimeField(null=True, blank=True)
    submitted_at = models.DateTimeField(null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'sf2_reports'
        unique_together = ['section', 'month', 'year']
        ordering = ['-year', '-month', 'section']

    def __str__(self):
        return (
            f"SF2 — {self.section} "
            f"{self.year}-{self.month:02d} "
            f"({self.attendance_rate}%)"
        )


# ============================================================================
# 24. NOTIFICATION PREFERENCES (Per-Learner Toggle Settings)
# ============================================================================

class NotificationPreference(models.Model):
    """
    Per-learner notification toggle settings controlled by the parent.
    Phase 6 — Parent notification settings panel.
    Separate from ParentProfile so each child can have different settings.
    """
    learner = models.OneToOneField(
        Learner,
        on_delete=models.CASCADE,
        related_name='notification_preferences',
    )
    # Channel toggles
    messenger_enabled = models.BooleanField(default=True)
    sms_enabled = models.BooleanField(default=False)

    # Alert type toggles
    attendance_alerts = models.BooleanField(
        default=True,
        help_text="Notify on every attendance scan",
    )
    grade_notifications = models.BooleanField(
        default=True,
        help_text="Notify when teacher posts grades",
    )
    absence_warnings = models.BooleanField(
        default=True,
        help_text="Notify on 5-day and 10-day absence streaks",
    )
    conduct_alerts = models.BooleanField(
        default=True,
        help_text="Notify when a conduct log is added",
    )

    # Mute (temporary silence)
    muted_until = models.DateTimeField(
        null=True, blank=True,
        help_text="All notifications suppressed until this datetime",
    )

    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'notification_preferences'

    def __str__(self):
        return f"Notif prefs for {self.learner.full_name}"

    @property
    def is_muted(self):
        if self.muted_until and self.muted_until > timezone.now():
            return True
        return False


# ============================================================================
# 25. ID CARD ELEMENT POSITIONS (Template Layout Config)
# ============================================================================

class IDCardElementPosition(models.Model):
    """
    Stores the pixel positions of each element on an ID card template.
    Phase 5.1 — ID template editor frontend.
    Allows the admin to drag-and-drop elements without changing the template image.
    All coordinates are in pixels at 300 DPI (CR-80: 1012 × 638 px).
    """
    ELEMENT_CHOICES = [
        ('photo', 'Student Photo'),
        ('full_name', 'Full Name'),
        ('lrn', 'LRN Text'),
        ('section_label', 'Section Label'),
        ('barcode', 'Barcode'),
        ('qr_code', 'QR Code'),
        ('school_logo', 'School Logo'),
        ('school_name', 'School Name'),
        ('school_year', 'School Year'),
    ]

    template = models.ForeignKey(
        IDTemplate,
        on_delete=models.CASCADE,
        related_name='element_positions',
    )
    element = models.CharField(max_length=20, choices=ELEMENT_CHOICES)

    # Position (top-left corner)
    x = models.IntegerField(help_text="X position in pixels from left edge")
    y = models.IntegerField(help_text="Y position in pixels from top edge")

    # Size
    width = models.IntegerField(help_text="Width in pixels")
    height = models.IntegerField(help_text="Height in pixels")

    # Typography (for text elements)
    font_size = models.IntegerField(default=12, help_text="Font size in pt")
    font_bold = models.BooleanField(default=False)
    font_color = models.CharField(
        max_length=7, default='#000000',
        help_text="Overrides template font_color for this element",
    )
    text_align = models.CharField(
        max_length=10,
        choices=[('left', 'Left'), ('center', 'Center'), ('right', 'Right')],
        default='center',
    )

    class Meta:
        db_table = 'id_card_element_positions'
        unique_together = ['template', 'element']
        ordering = ['template', 'element']

    def __str__(self):
        return f"{self.template.name} — {self.get_element_display()} @ ({self.x}, {self.y})"


# ============================================================================
# 26. SUBSCRIPTION INVOICES (Billing per Tenant)
# ============================================================================

class SubscriptionInvoice(models.Model):
    """
    Billing invoice generated for each tenant per billing cycle.
    Phase 8.2 — Revenue dashboard for Super Admin.
    Tracks plan fees + SMS bundle purchases.
    """
    STATUS_CHOICES = [
        ('draft', 'Draft'),
        ('sent', 'Sent'),
        ('paid', 'Paid'),
        ('overdue', 'Overdue'),
        ('cancelled', 'Cancelled'),
    ]

    tenant = models.ForeignKey(
        Tenant,
        on_delete=models.CASCADE,
        related_name='invoices',
    )
    invoice_number = models.CharField(
        max_length=50, unique=True,
        help_text="e.g. INV-2026-001",
    )
    billing_period_start = models.DateField()
    billing_period_end = models.DateField()

    # Line items (stored as JSON for flexibility)
    line_items = models.JSONField(
        default=list,
        help_text="[{description, quantity, unit_price, total}]",
    )

    subtotal = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    tax = models.DecimalField(
        max_digits=10, decimal_places=2, default=0,
        help_text="VAT or applicable tax in PHP",
    )
    total_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)

    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='draft')
    due_date = models.DateField(null=True, blank=True)
    paid_at = models.DateTimeField(null=True, blank=True)

    # PDF
    pdf_path = models.CharField(max_length=500, blank=True, null=True)

    created_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        related_name='created_invoices',
        help_text="Super Admin who generated the invoice",
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'subscription_invoices'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.invoice_number} — {self.tenant.name} ({self.get_status_display()})"

    @property
    def is_overdue(self):
        if self.status in ('paid', 'cancelled'):
            return False
        if self.due_date and self.due_date < timezone.now().date():
            return True
        return False


# ============================================================================
# 27. PORTAL SESSIONS (Student / Parent Login Tracking)
# ============================================================================

class PortalSession(models.Model):
    """
    Tracks student and parent portal logins.
    Phase 7.2 — Student and parent portal.
    Used for: last-seen display, suspicious login detection,
    and session invalidation on graduation.
    """
    PORTAL_TYPE_CHOICES = [
        ('student', 'Student Portal'),
        ('parent', 'Parent Portal'),
    ]

    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='portal_sessions',
    )
    portal_type = models.CharField(max_length=10, choices=PORTAL_TYPE_CHOICES)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.TextField(blank=True, null=True)

    # JWT token reference (first 16 chars of jti for lookup)
    token_jti = models.CharField(
        max_length=36, blank=True, null=True,
        help_text="JWT token ID — used to invalidate specific sessions",
    )
    is_active = models.BooleanField(default=True)

    logged_in_at = models.DateTimeField(auto_now_add=True)
    last_active_at = models.DateTimeField(auto_now=True)
    logged_out_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = 'portal_sessions'
        ordering = ['-logged_in_at']

    def __str__(self):
        return (
            f"{self.user.get_full_name()} — "
            f"{self.get_portal_type_display()} "
            f"@ {self.logged_in_at:%Y-%m-%d %H:%M}"
        )


# ============================================================================
# 28. TEACHER CONTACT INFO (visible to parents in portal)
# ============================================================================

class TeacherContact(models.Model):
    """
    Public contact details a teacher shares with parents.
    Phase 7.2 — parent portal teacher contact directory.
    Separate from User so teachers control what they expose.
    """
    teacher = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name='contact_info',
        limit_choices_to={'role': 'teacher'},
    )
    # Contact channels
    phone = models.CharField(max_length=20, blank=True, null=True)
    messenger_username = models.CharField(max_length=100, blank=True, null=True,
        help_text="e.g. @aurora.aquino")
    facebook_url = models.CharField(max_length=200, blank=True, null=True,
        help_text="e.g. fb.com/aurora.aquino.teacher")
    email = models.EmailField(blank=True, null=True)

    # Visibility toggles
    show_phone = models.BooleanField(default=True)
    show_messenger = models.BooleanField(default=True)
    show_facebook = models.BooleanField(default=False)
    show_email = models.BooleanField(default=True)

    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'teacher_contacts'

    def __str__(self):
        return f"Contact info — {self.teacher.get_full_name()}"


# ============================================================================
# 29. DASHBOARD TASK LIST (Admin pending tasks panel)
# ============================================================================

class AdminTask(models.Model):
    """
    Pending tasks shown in the Admin dashboard task panel.
    Phase 2 — admin-view.tsx pending tasks section.
    Created automatically by system events or manually by admin.
    """
    PRIORITY_CHOICES = [
        ('high', 'High'),
        ('medium', 'Medium'),
        ('low', 'Low'),
    ]
    TYPE_CHOICES = [
        ('enrollment', 'Enrollment Application'),
        ('lrn_reprint', 'LRN Reprint Request'),
        ('sf1_export', 'SF1 Report Generation'),
        ('photo_update', 'Student Photo Update'),
        ('id_reprint', 'ID Card Reprint'),
        ('sf2_submit', 'SF2 Submission'),
        ('other', 'Other'),
    ]
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('in_progress', 'In Progress'),
        ('done', 'Done'),
        ('dismissed', 'Dismissed'),
    ]

    title = models.CharField(max_length=200)
    description = models.TextField(blank=True, null=True)
    task_type = models.CharField(max_length=20, choices=TYPE_CHOICES, default='other')
    priority = models.CharField(max_length=10, choices=PRIORITY_CHOICES, default='medium')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')

    # Optional link to a specific learner
    learner = models.ForeignKey(
        Learner, on_delete=models.SET_NULL, null=True, blank=True,
        related_name='admin_tasks',
    )
    assigned_to = models.ForeignKey(
        User, on_delete=models.SET_NULL, null=True, blank=True,
        related_name='assigned_tasks',
    )
    due_date = models.DateField(null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    completed_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = 'admin_tasks'
        ordering = ['-priority', 'due_date', '-created_at']

    def __str__(self):
        return f"[{self.get_priority_display()}] {self.title} ({self.get_status_display()})"


# ============================================================================
# 30. SCHOOL YEAR CONFIGURATION (per-year academic calendar)
# ============================================================================

class SchoolYearConfig(models.Model):
    """
    One row per school year — stores the official academic calendar
    and grading configuration for that year.
    Allows historical data to reference the correct calendar.
    Phase 8.1 — school calendar management.
    """
    school_year = models.CharField(max_length=20, unique=True,
        help_text="e.g. 2025-2026")
    is_current = models.BooleanField(default=False,
        help_text="Only one year can be current")

    # Quarter date ranges
    q1_start = models.DateField()
    q1_end = models.DateField()
    q2_start = models.DateField()
    q2_end = models.DateField()
    q3_start = models.DateField()
    q3_end = models.DateField()
    q4_start = models.DateField()
    q4_end = models.DateField()

    # School-wide totals (computed at year-end)
    total_school_days = models.IntegerField(default=0)
    enrollment_count = models.IntegerField(default=0)

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'school_year_configs'
        ordering = ['-school_year']

    def __str__(self):
        flag = ' (Current)' if self.is_current else ''
        return f"SY {self.school_year}{flag}"

    def save(self, *args, **kwargs):
        # Ensure only one current year
        if self.is_current:
            SchoolYearConfig.objects.filter(is_current=True).update(is_current=False)
        super().save(*args, **kwargs)
