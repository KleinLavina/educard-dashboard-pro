"""
EduCard Pro — Database Seed Command
Populates the database with realistic Philippine DepEd K-12 demo data.
Matches the mock data in school-data.ts exactly (same LRNs, names, sections).
Idempotent: safe to run multiple times.
"""
from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import date, time, datetime
from decimal import Decimal


class Command(BaseCommand):
    help = 'Seed the database with EduCard Pro demo data'

    def add_arguments(self, parser):
        parser.add_argument(
            '--clear',
            action='store_true',
            help='Clear all existing data before seeding (except migrations)',
        )

    def handle(self, *args, **options):
        from core.models import (
            User, Department, GradeLevel, Section, Learner, LearnerParent,
            ParentProfile, Subject, Grade, SchoolCalendar, AttendanceRecord,
            IDTemplate, IDPrintQueue, NotificationRecord, NotificationPreference,
            ConductLog, SchoolSettings, AdminTask, ActivityLog,
            TeacherContact, TeacherSectionAssignment, SchoolYearConfig,
        )

        if options['clear']:
            self.stdout.write('Clearing existing data...')
            Grade.objects.all().delete()
            AttendanceRecord.objects.all().delete()
            ConductLog.objects.all().delete()
            IDPrintQueue.objects.all().delete()
            IDTemplate.objects.all().delete()
            NotificationRecord.objects.all().delete()
            NotificationPreference.objects.all().delete()
            AdminTask.objects.all().delete()
            TeacherSectionAssignment.objects.all().delete()
            TeacherContact.objects.all().delete()
            Subject.objects.all().delete()
            LearnerParent.objects.all().delete()
            Learner.objects.all().delete()
            ParentProfile.objects.all().delete()
            Section.objects.all().delete()
            GradeLevel.objects.all().delete()
            Department.objects.all().delete()
            SchoolCalendar.objects.all().delete()
            SchoolSettings.objects.all().delete()
            SchoolYearConfig.objects.all().delete()
            User.objects.filter(is_superuser=False).delete()

        self.stdout.write('Seeding users...')
        # ====================================================================
        # ADMIN USER
        # ====================================================================
        admin, _ = User.objects.get_or_create(
            username='admin',
            defaults=dict(
                first_name='Registrar', last_name='Cruz',
                email='admin@stmarys.edu.ph', role='admin', is_staff=True,
            )
        )
        admin.set_password('admin123')
        admin.save()

        # ====================================================================
        # TEACHER USERS (one per section adviser + 3 contact teachers)
        # ====================================================================
        teacher_data = [
            ('aurora.aquino',     'Aurora',   'Aquino',     'Math'),
            ('benjie.lopez',      'Benjie',   'Lopez',      'Filipino'),
            ('carmela.cruz',      'Carmela',  'Cruz',       'Science'),
            ('dario.tan',         'Dario',    'Tan',        'English'),
            ('elena.bautista',    'Elena',    'Bautista',   'Science'),
            ('felix.ramos',       'Felix',    'Ramos',      'AP'),
            ('glenda.reyes',      'Glenda',   'Reyes',      'Math'),
            ('hector.santos',     'Hector',   'Santos',     'Values Ed'),
            ('imelda.villanueva', 'Imelda',   'Villanueva', 'General Physics I'),
            ('joel.mercado',      'Joel',     'Mercado',    'Business Math'),
            ('karla.domingo',     'Karla',    'Domingo',    'Creative Writing'),
            ('lito.pascual',      'Lito',     'Pascual',    'Computer Systems Servicing'),
            ('roberto.santos',    'Roberto',  'Santos',     'Science'),
            ('elena.reyes',       'Elena',    'Reyes',      'English'),
        ]
        teachers = {}
        for uname, fname, lname, spec in teacher_data:
            t, _ = User.objects.get_or_create(
                username=uname,
                defaults=dict(
                    first_name=fname, last_name=lname,
                    email=f'{uname}@stmarys.edu.ph',
                    role='teacher',
                    subject_specialization=spec,
                )
            )
            t.set_password('teacher123')
            t.save()
            teachers[uname] = t

        # ====================================================================
        # PARENT USERS
        # ====================================================================
        parent_data = [
            ('p001', 'maria.delacruz',    'Maria',   'Dela Cruz',   '+63 917 123 4567', True,  False, 'Mother'),
            ('p002', 'rodrigo.villanueva','Rodrigo', 'Villanueva',  '+63 918 234 5678', False, True,  'Father'),
            ('p003', 'lourdes.reyes',     'Lourdes', 'Reyes',       '+63 919 345 6789', True,  True,  'Mother'),
            ('p004', 'eduardo.delacruz',  'Eduardo', 'Dela Cruz',   '+63 917 999 0001', False, True,  'Father'),
        ]
        parents = {}
        for pid, uname, fname, lname, phone, msg_linked, sms_en, rel in parent_data:
            p, _ = User.objects.get_or_create(
                username=uname,
                defaults=dict(
                    first_name=fname, last_name=lname,
                    email=f'{uname}@gmail.com',
                    role='parent', phone=phone,
                )
            )
            p.set_password('parent123')
            p.save()
            parents[pid] = p
            ParentProfile.objects.get_or_create(
                user=p,
                defaults=dict(
                    relationship=rel,
                    messenger_linked=msg_linked,
                    sms_enabled=sms_en,
                )
            )

        # ====================================================================
        # SCHOOL YEAR CONFIG
        # ====================================================================
        syc, _ = SchoolYearConfig.objects.get_or_create(
            school_year='2025-2026',
            defaults=dict(
                is_current=True,
                q1_start=date(2025, 8, 26), q1_end=date(2025, 10, 17),
                q2_start=date(2025, 10, 21), q2_end=date(2025, 12, 19),
                q3_start=date(2026, 1, 12), q3_end=date(2026, 3, 27),
                q4_start=date(2026, 4, 7), q4_end=date(2026, 5, 30),
                total_school_days=200, enrollment_count=26,
            )
        )

        # ====================================================================
        # SCHOOL SETTINGS
        # ====================================================================
        ss, _ = SchoolSettings.objects.get_or_create(
            pk=1,
            defaults=dict(
                school_name="St. Mary's Academy",
                school_year='2025-2026',
                primary_color='#3B82F6',
                current_quarter=3,
                current_week=6,
                sf2_target_attendance=Decimal('95.00'),
                messenger_enabled=True,
                sms_enabled=True,
                sms_credits_remaining=500,
                plan='standard',
                grading_period_1_start=date(2025, 8, 26),
                grading_period_1_end=date(2025, 10, 17),
                grading_period_2_start=date(2025, 10, 21),
                grading_period_2_end=date(2025, 12, 19),
                grading_period_3_start=date(2026, 1, 12),
                grading_period_3_end=date(2026, 3, 27),
                grading_period_4_start=date(2026, 4, 7),
                grading_period_4_end=date(2026, 5, 30),
            )
        )

        # ====================================================================
        # SCHOOL CALENDAR (holidays + key dates)
        # ====================================================================
        self.stdout.write('Seeding school calendar...')
        calendar_entries = [
            (date(2026, 4, 9),  'holiday',    'Day of Valor (Bataan Day)'),
            (date(2026, 4, 10), 'holiday',    'Good Friday'),
            (date(2026, 5, 1),  'holiday',    'Labor Day'),
            (date(2026, 4, 28), 'school_day', None),
            (date(2026, 4, 29), 'school_day', None),
            (date(2026, 4, 30), 'school_day', None),
            (date(2026, 5, 5),  'school_day', None),
            (date(2026, 5, 6),  'school_day', None),
            (date(2026, 5, 7),  'school_day', None),
            (date(2026, 5, 8),  'school_day', None),
            (date(2026, 5, 9),  'school_day', None),
            (date(2026, 5, 10), 'school_day', None),
        ]
        cal_entries = {}
        for d, t, label in calendar_entries:
            entry, _ = SchoolCalendar.objects.get_or_create(
                date=d,
                defaults=dict(type=t, label=label)
            )
            cal_entries[str(d)] = entry

        # ====================================================================
        # DEPARTMENTS
        # ====================================================================
        self.stdout.write('Seeding departments and grade levels...')
        jhs, _ = Department.objects.get_or_create(
            key='JHS',
            defaults=dict(label='Junior High School', caption='Grades 7 – 10')
        )
        shs, _ = Department.objects.get_or_create(
            key='SHS',
            defaults=dict(label='Senior High School', caption='Grades 11 – 12 · Academic & TVL Tracks')
        )

        # ====================================================================
        # GRADE LEVELS
        # ====================================================================
        gl = {}
        for level, dept in [(7, jhs), (8, jhs), (9, jhs), (10, jhs), (11, shs), (12, shs)]:
            obj, _ = GradeLevel.objects.get_or_create(
                department=dept, level=level,
                defaults=dict(label=f'Grade {level}')
            )
            gl[level] = obj

        # ====================================================================
        # SECTIONS
        # ====================================================================
        self.stdout.write('Seeding sections...')
        section_data = [
            # (grade_level, name, strand, adviser_key)
            (7,  'Sampaguita', None,      'aurora.aquino'),
            (7,  'Rosal',      None,      'benjie.lopez'),
            (8,  'Adelfa',     None,      'carmela.cruz'),
            (8,  'Ilang-Ilang',None,      'dario.tan'),
            (9,  'Rizal',      None,      'elena.bautista'),
            (9,  'Bonifacio',  None,      'felix.ramos'),
            (10, 'Newton',     None,      'glenda.reyes'),
            (10, 'Charity',    None,      'hector.santos'),
            (11, 'St. Jude',   'STEM',    'imelda.villanueva'),
            (11, 'St. Therese','ABM',     'joel.mercado'),
            (12, 'St. Ignatius','HUMSS',  'karla.domingo'),
            (12, 'St. Francis','TVL-ICT', 'lito.pascual'),
        ]
        sections = {}
        for lv, name, strand, adv_key in section_data:
            sec, _ = Section.objects.get_or_create(
                grade_level=gl[lv], name=name,
                defaults=dict(strand=strand, adviser=teachers[adv_key])
            )
            sections[(lv, name)] = sec

        # ====================================================================
        # LEARNERS
        # ====================================================================
        self.stdout.write('Seeding learners...')
        learner_data = [
            # (lrn, first, mi, last, sex, birth_year, gpa, att, section_key)
            ('136728140987', 'Juan',     'M', 'Dela Cruz',   'M', 2013, 92.0,  96.4, (7,  'Sampaguita')),
            ('136728140988', 'Carlo',    'P', 'Villanueva',  'M', 2013, 87.0,  95.8, (7,  'Sampaguita')),
            ('136728140989', 'Bea',      'L', 'Soriano',     'F', 2013, 90.0,  97.1, (7,  'Sampaguita')),
            ('136728140312', 'Maria',    'L', 'Santos',      'F', 2013, 88.0,  93.5, (7,  'Rosal')),
            ('136728140098', 'Marco',    'T', 'Reyes',       'M', 2013, 68.0,  88.2, (7,  'Rosal')),
            ('136728140099', 'Trisha',   'F', 'Domingo',     'F', 2013, 84.0,  92.4, (7,  'Rosal')),
            ('136728140455', 'Karina',   'B', 'Bautista',    'F', 2012, 86.0,  92.0, (8,  'Adelfa')),
            ('136728140456', 'Renz',     'G', 'Galang',      'M', 2012, 81.0,  90.5, (8,  'Adelfa')),
            ('136728140457', 'Patricia', 'R', 'Lim',         'F', 2012, 79.0,  88.7, (8,  'Ilang-Ilang')),
            ('136728140458', 'Mikael',   'S', 'Cortes',      'M', 2012, 74.0,  85.9, (8,  'Ilang-Ilang')),
            ('136728140511', 'Andrea',   'P', 'Mercado',     'F', 2011, 90.0,  94.0, (9,  'Rizal')),
            ('136728140512', 'Luis',     'C', 'Mendoza',     'M', 2011, 85.0,  92.6, (9,  'Rizal')),
            ('136728140211', 'Jose',     'A', 'Aguilar',     'M', 2011, 74.0,  78.4, (9,  'Bonifacio')),
            ('136728140212', 'Nadine',   'V', 'Castillo',    'F', 2011, 82.0,  86.5, (9,  'Bonifacio')),
            ('136728140601', 'Patricia', 'D', 'Lim',         'F', 2010, 86.0,  95.6, (10, 'Newton')),
            ('136728140602', 'Ramon',    'K', 'Pineda',      'M', 2010, 91.0,  96.4, (10, 'Newton')),
            ('136728140603', 'Sophia',   'A', 'Navarro',     'F', 2010, 88.0,  93.2, (10, 'Charity')),
            ('136728140604', 'Gabriel',  'T', 'Esguerra',    'M', 2010, 84.0,  90.7, (10, 'Charity')),
            ('136728140067', 'Liza',     'R', 'Bautista',    'F', 2009, 94.0,  96.8, (11, 'St. Jude')),
            ('136728140068', 'Aaron',    'C', 'Tiongson',    'M', 2009, 91.0,  95.5, (11, 'St. Jude')),
            ('136728140033', 'Diego',    'N', 'Aquino',      'M', 2009, 79.0,  90.3, (11, 'St. Therese')),
            ('136728140034', 'Camille',  'P', 'Salazar',     'F', 2009, 85.0,  93.0, (11, 'St. Therese')),
            ('136728140801', 'Therese',  'M', 'Quintos',     'F', 2008, 87.0,  87.4, (12, 'St. Ignatius')),
            ('136728140802', 'Paolo',    'B', 'Yulo',        'M', 2008, 80.0,  84.0, (12, 'St. Ignatius')),
            ('136728140803', 'Patricia', 'D', 'Lim',         'F', 2008, 86.0,  94.1, (12, 'St. Francis')),
            ('136728140804', 'Enrique',  'S', 'Bondoc',      'M', 2008, 89.0,  95.6, (12, 'St. Francis')),
        ]
        learners = {}
        for lrn, fn, mi, ln, sex, by, gpa, att, sec_key in learner_data:
            bdate = date(by, 6, 15)
            lrn_obj, _ = Learner.objects.get_or_create(
                lrn=lrn,
                defaults=dict(
                    first_name=fn, middle_initial=mi, last_name=ln,
                    birth_date=bdate, sex=sex,
                    section=sections[sec_key],
                    gpa=Decimal(str(gpa)),
                    attendance_rate=Decimal(str(att)),
                    barcode_value=lrn,
                    graduation_status='active',
                )
            )
            learners[lrn] = lrn_obj

        # ====================================================================
        # LEARNER–PARENT LINKS
        # ====================================================================
        self.stdout.write('Seeding parent links...')
        lp_data = [
            ('136728140987', 'p001', 'Mother',   True),
            ('136728140987', 'p004', 'Father',   False),
            ('136728140989', 'p001', 'Mother',   True),
            ('136728140988', 'p002', 'Father',   True),
            ('136728140098', 'p003', 'Mother',   True),
        ]
        for lrn, pid, rel, is_primary in lp_data:
            LearnerParent.objects.get_or_create(
                learner=learners[lrn], parent=parents[pid],
                defaults=dict(relationship=rel, is_primary_contact=is_primary)
            )
            # Keep parent_phone in sync with primary contact
            if is_primary:
                parent_user = parents[pid]
                learners[lrn].parent_phone = parent_user.phone
                learners[lrn].save(update_fields=['parent_phone'])

        # ====================================================================
        # SUBJECTS
        # ====================================================================
        self.stdout.write('Seeding subjects...')
        SUBJECTS_JHS = ['Math', 'Science', 'English', 'Filipino', 'AP', 'MAPEH', 'Values Ed', 'TLE']
        SUBJECTS_SHS_CORE = [
            'Oral Communication', 'Reading & Writing', '21st Century Lit',
            'General Math', 'Earth Science', 'Personal Development', 'PE & Health',
        ]
        SUBJECTS_SHS_STRAND = {
            'STEM':    ['Pre-Calculus', 'General Physics I', 'General Chemistry I'],
            'ABM':     ['Business Math', 'Fundamentals of ABM', 'Business Ethics'],
            'HUMSS':   ['Creative Writing', 'Philippine Politics', 'Community Engagement'],
            'TVL-ICT': ['Computer Systems Servicing', 'Web Development', 'Programming'],
        }

        # Teacher map for subjects — simplify: use adviser as subject teacher
        all_subjects = {}  # (section_pk, subject_name) → Subject
        for sec_key, sec in sections.items():
            lv, name = sec_key
            if lv <= 10:
                subj_names = SUBJECTS_JHS
            else:
                strand = sec.strand or ''
                subj_names = SUBJECTS_SHS_CORE + SUBJECTS_SHS_STRAND.get(strand, [])

            for sn in subj_names:
                subj, _ = Subject.objects.get_or_create(
                    section=sec, name=sn,
                    defaults=dict(teacher=sec.adviser, school_year=syc)
                )
                all_subjects[(sec.pk, sn)] = subj

        # ====================================================================
        # GRADES (detailed for 4 key learners, summary for rest)
        # ====================================================================
        self.stdout.write('Seeding grades...')
        grade_records = [
            # (lrn, subject, q1, q2, q3, q4)
            ('136728140987', 'Math',      89, 91, 92, None),
            ('136728140987', 'Science',   87, 88, 90, None),
            ('136728140987', 'English',   85, 87, 88, None),
            ('136728140987', 'Filipino',  91, 93, 94, None),
            ('136728140987', 'AP',        88, 90, 91, None),
            ('136728140987', 'MAPEH',     93, 94, 95, None),
            ('136728140987', 'Values Ed', 92, 93, 94, None),
            ('136728140987', 'TLE',       88, 89, 90, None),
            ('136728140988', 'Math',      82, 84, 85, None),
            ('136728140988', 'Science',   80, 82, 83, None),
            ('136728140988', 'English',   84, 86, 87, None),
            ('136728140988', 'Filipino',  86, 88, 89, None),
            ('136728140988', 'AP',        81, 83, 84, None),
            ('136728140988', 'MAPEH',     88, 89, 90, None),
            ('136728140988', 'Values Ed', 85, 86, 87, None),
            ('136728140988', 'TLE',       72, 74, 74, None),
            ('136728140989', 'Math',      88, 89, 90, None),
            ('136728140989', 'Science',   90, 91, 92, None),
            ('136728140989', 'English',   86, 87, 88, None),
            ('136728140989', 'Filipino',  89, 90, 91, None),
            ('136728140989', 'AP',        87, 88, 89, None),
            ('136728140989', 'MAPEH',     92, 93, 94, None),
            ('136728140989', 'Values Ed', 91, 92, 93, None),
            ('136728140989', 'TLE',       87, 88, 89, None),
            ('136728140098', 'Math',      65, 67, 68, None),
            ('136728140098', 'Science',   63, 65, 67, None),
            ('136728140098', 'English',   70, 71, 72, None),
            ('136728140098', 'Filipino',  71, 72, 73, None),
            ('136728140098', 'AP',        68, 69, 68, None),
            ('136728140098', 'MAPEH',     75, 76, 76, None),
            ('136728140098', 'Values Ed', 74, 75, 75, None),
            ('136728140098', 'TLE',       70, 71, 72, None),
        ]

        for lrn, subj_name, q1, q2, q3, q4 in grade_records:
            lrn_obj = learners.get(lrn)
            if not lrn_obj:
                continue
            sec_pk = lrn_obj.section_id
            subj = all_subjects.get((sec_pk, subj_name))
            if not subj:
                continue
            for quarter, score in [(1, q1), (2, q2), (3, q3), (4, q4)]:
                if score is None:
                    continue
                Grade.objects.get_or_create(
                    learner=lrn_obj, subject=subj, quarter=quarter,
                    defaults=dict(
                        quiz_score=Decimal(str(score)),
                        exam_score=Decimal(str(score)),
                        activity_score=Decimal(str(score)),
                        computed_grade=Decimal(str(score)),
                    )
                )

        # ====================================================================
        # ATTENDANCE RECORDS
        # ====================================================================
        self.stdout.write('Seeding attendance records...')
        att_logs = [
            ('136728140987', '2026-04-28', '07:38', '16:05', 'present'),
            ('136728140987', '2026-04-29', '07:41', '16:10', 'present'),
            ('136728140987', '2026-04-30', '08:15', '16:00', 'late'),
            ('136728140987', '2026-05-05', '07:35', '16:08', 'present'),
            ('136728140987', '2026-05-06', '07:42', '16:05', 'present'),
            ('136728140987', '2026-05-07', '07:39', '16:10', 'present'),
            ('136728140987', '2026-05-08', '07:40', '16:05', 'present'),
            ('136728140987', '2026-05-09', '',      '',      'absent'),
            ('136728140987', '2026-05-10', '07:38', '16:10', 'present'),
            ('136728140988', '2026-05-09', '',      '',      'absent'),
            ('136728140988', '2026-05-10', '',      '',      'absent'),
            ('136728140989', '2026-05-09', '07:42', '16:05', 'present'),
            ('136728140989', '2026-05-10', '07:42', '16:08', 'present'),
            ('136728140098', '2026-05-06', '',      '',      'absent'),
            ('136728140098', '2026-05-07', '',      '',      'absent'),
            ('136728140098', '2026-05-08', '',      '',      'absent'),
            ('136728140098', '2026-05-09', '',      '',      'absent'),
            ('136728140098', '2026-05-10', '',      '',      'absent'),
        ]
        for lrn, d_str, ti, to, status in att_logs:
            lrn_obj = learners.get(lrn)
            if not lrn_obj:
                continue
            d_obj = date.fromisoformat(d_str)
            cal = cal_entries.get(d_str)
            time_in = time.fromisoformat(ti) if ti else None
            time_out = time.fromisoformat(to) if to else None
            AttendanceRecord.objects.get_or_create(
                learner=lrn_obj, date=d_obj,
                defaults=dict(
                    calendar_entry=cal,
                    time_in_morning=time_in,
                    time_out_afternoon=time_out,
                    status=status,
                )
            )

        # ====================================================================
        # CONDUCT LOGS
        # ====================================================================
        self.stdout.write('Seeding conduct logs...')
        conduct_data = [
            ('136728140987', date(2026, 5, 5),  'Participated actively in Science Lab',              'Positive', 'aurora.aquino'),
            ('136728140987', date(2026, 4, 28), 'Submitted group project on time',                   'Positive', 'aurora.aquino'),
            ('136728140987', date(2026, 4, 12), 'Late arrival — 8:15 AM',                            'Note',     'aurora.aquino'),
            ('136728140988', date(2026, 5, 7),  '2nd consecutive absence — parents notified',        'Warning',  'aurora.aquino'),
            ('136728140988', date(2026, 4, 20), 'Incomplete homework submission',                    'Note',     'aurora.aquino'),
            ('136728140989', date(2026, 5, 5),  'Excellent class participation — Filipino',          'Positive', 'aurora.aquino'),
            ('136728140989', date(2026, 4, 30), 'Ranked 1st in Math Quiz',                           'Positive', 'aurora.aquino'),
            ('136728140098', date(2026, 5, 8),  '4th consecutive absence — referral to guidance',    'Warning',  'benjie.lopez'),
            ('136728140098', date(2026, 4, 15), 'Struggling with written exams — extra support assigned', 'Note', 'benjie.lopez'),
        ]
        for lrn, cdate, item, ctype, teacher_key in conduct_data:
            lrn_obj = learners.get(lrn)
            if not lrn_obj:
                continue
            ConductLog.objects.get_or_create(
                learner=lrn_obj, date=cdate, item=item,
                defaults=dict(type=ctype, recorded_by=teachers[teacher_key])
            )

        # ====================================================================
        # ID TEMPLATE + PRINT QUEUE
        # ====================================================================
        self.stdout.write('Seeding ID templates and print queue...')
        tmpl, _ = IDTemplate.objects.get_or_create(
            name='SY 2025-2026 Standard',
            defaults=dict(
                background_path='templates/id_bg_2025_2026.png',
                font_color='#FFFFFF',
                is_active=True,
            )
        )
        id_queue_data = [
            ('136728140987', 'lost',           'pending',   None),
            ('136728140456', 'damaged',         'generated', date(2026, 5, 7)),
            ('136728140211', 'lost',            'pending',   None),
            ('136728140988', 'new_enrollment',  'printed',   date(2025, 8, 26)),
            ('136728140989', 'new_enrollment',  'printed',   date(2025, 8, 26)),
        ]
        for lrn, reason, status, printed_at in id_queue_data:
            lrn_obj = learners.get(lrn)
            if not lrn_obj:
                continue
            printed_dt = timezone.make_aware(datetime.combine(printed_at, time(9, 0))) if printed_at else None
            IDPrintQueue.objects.get_or_create(
                learner=lrn_obj, reason=reason,
                defaults=dict(
                    template=tmpl, status=status,
                    requested_by=admin, printed_at=printed_dt,
                )
            )

        # ====================================================================
        # NOTIFICATION RECORDS
        # ====================================================================
        self.stdout.write('Seeding notification records...')
        notif_data = [
            ('p001', '136728140987', 'messenger', 'sent',    'Juan pumasok sa paaralan ngayong 7:38 AM — May 10',  'attendance_scan',  '2026-05-10 07:38'),
            ('p001', '136728140987', 'messenger', 'sent',    'Bagong marka para kay Juan: Math Q3 = 92',           'grade_posted',     '2026-05-09 14:00'),
            ('p002', '136728140988', 'sms',       'failed',  'Carlo ay hindi pumasok ngayon — May 10',             'absence_warning',  '2026-05-10 08:00'),
            ('p002', '136728140988', 'sms',       'sent',    'Carlo ay hindi pumasok ngayon — May 9',              'absence_warning',  '2026-05-09 08:00'),
            ('p003', '136728140098', 'messenger', 'pending', 'Marco ay hindi pumasok ng 5 araw. Mangyaring makipag-ugnayan sa paaralan.', 'absence_warning', '2026-05-10 08:00'),
            ('p001', '136728140989', 'messenger', 'sent',    'Bea pumasok sa paaralan ngayong 7:42 AM — May 10',  'attendance_scan',  '2026-05-10 07:42'),
        ]
        for pid, lrn, channel, status, message, triggered_by, sent_at_str in notif_data:
            parent_user = parents.get(pid)
            lrn_obj = learners.get(lrn)
            if not parent_user or not lrn_obj:
                continue
            sent_dt = timezone.make_aware(datetime.fromisoformat(sent_at_str))
            nr, created = NotificationRecord.objects.get_or_create(
                parent=parent_user, learner=lrn_obj,
                channel=channel, message=message,
                defaults=dict(
                    status=status,
                    triggered_by=triggered_by,
                )
            )
            if created:
                NotificationRecord.objects.filter(pk=nr.pk).update(sent_at=sent_dt)

        # ====================================================================
        # NOTIFICATION PREFERENCES (for learners with parents)
        # ====================================================================
        for lrn in ['136728140987', '136728140988', '136728140989', '136728140098']:
            lrn_obj = learners.get(lrn)
            if lrn_obj:
                NotificationPreference.objects.get_or_create(
                    learner=lrn_obj,
                    defaults=dict(
                        messenger_enabled=True, sms_enabled=False,
                        attendance_alerts=True, grade_notifications=True,
                        absence_warnings=True, conduct_alerts=True,
                    )
                )

        # ====================================================================
        # ADMIN TASKS
        # ====================================================================
        self.stdout.write('Seeding admin tasks...')
        task_data = [
            ('ID Reprint — Juan Dela Cruz',       'Lost ID reprint requested by parent',              'id_reprint',  'high',   learners.get('136728140987'), 'pending'),
            ('ID Reprint — Renz Galang',          'Damaged ID. Status: generated, ready to print.',   'id_reprint',  'medium', learners.get('136728140456'), 'in_progress'),
            ('ID Reprint — Jose Aguilar',         'Lost ID reprint — pending approval',               'id_reprint',  'medium', learners.get('136728140211'), 'pending'),
            ('SF2 Report — Grade 7 Sampaguita',   'Monthly attendance SF2 report due for submission', 'sf2_submit',  'high',   None, 'pending'),
            ('Enrollment Application — New SY',   'Review new enrollment forms for SY 2026-2027',     'enrollment',  'low',    None, 'pending'),
        ]
        for title, desc, ttype, priority, learner_obj, status in task_data:
            AdminTask.objects.get_or_create(
                title=title,
                defaults=dict(
                    description=desc, task_type=ttype, priority=priority,
                    status=status, learner=learner_obj, assigned_to=admin,
                    due_date=date(2026, 5, 30),
                )
            )

        # ====================================================================
        # TEACHER CONTACTS
        # ====================================================================
        self.stdout.write('Seeding teacher contacts...')
        tc_data = [
            ('aurora.aquino',  '+63 917 123 4567', 'aurora.aquino',  'aurora.aquino.teacher',  'a.aquino@stmarys.edu.ph'),
            ('benjie.lopez',   '+63 918 000 0001', 'benjie.lopez',   'benjie.lopez.teacher',   'b.lopez@stmarys.edu.ph'),
            ('roberto.santos', '+63 918 234 5678', 'roberto.santos', 'roberto.santos.teacher', 'r.santos@stmarys.edu.ph'),
            ('elena.reyes',    '+63 919 345 6789', 'elena.reyes',    'elena.reyes.teacher',    'e.reyes@stmarys.edu.ph'),
        ]
        for uname, phone, msngr, fb, email in tc_data:
            t = teachers.get(uname)
            if t:
                TeacherContact.objects.get_or_create(
                    teacher=t,
                    defaults=dict(
                        phone=phone, messenger_username=msngr,
                        facebook_url=f'fb.com/{fb}', email=email,
                        show_phone=True, show_messenger=True,
                        show_facebook=False, show_email=True,
                    )
                )

        # ====================================================================
        # TEACHER SECTION ASSIGNMENTS
        # ====================================================================
        self.stdout.write('Seeding teacher section assignments...')
        for sec_key, sec in sections.items():
            if sec.adviser:
                TeacherSectionAssignment.objects.get_or_create(
                    teacher=sec.adviser, section=sec, school_year='2025-2026',
                    defaults=dict(is_active=True)
                )

        # ====================================================================
        # SUMMARY
        # ====================================================================
        self.stdout.write(self.style.SUCCESS(
            f'\nSeed complete:\n'
            f'  Users:       {User.objects.count()}\n'
            f'  Learners:    {Learner.objects.count()}\n'
            f'  Sections:    {Section.objects.count()}\n'
            f'  Subjects:    {Subject.objects.count()}\n'
            f'  Grades:      {Grade.objects.count()}\n'
            f'  Attendance:  {AttendanceRecord.objects.count()}\n'
            f'  Conduct:     {ConductLog.objects.count()}\n'
            f'  Notifs:      {NotificationRecord.objects.count()}\n'
            f'  Admin Tasks: {AdminTask.objects.count()}\n'
        ))
