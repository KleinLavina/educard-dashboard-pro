# Migration: 0005_relationship_fixes
# Applies all 6 relationship fixes identified in models review.

import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('core', '0004_final_three_models'),
    ]

    operations = [

        # Fix 1: Remove single parent_account FK from Learner
        migrations.RemoveField(
            model_name='learner',
            name='parent_account',
        ),

        # Fix 1 (cont): Add LearnerParent through-table
        migrations.CreateModel(
            name='LearnerParent',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('relationship', models.CharField(
                    choices=[('Mother', 'Mother'), ('Father', 'Father'), ('Guardian', 'Guardian')],
                    max_length=20,
                )),
                ('is_primary_contact', models.BooleanField(
                    default=False,
                    help_text='Primary contact receives all notifications by default',
                )),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('learner', models.ForeignKey(
                    on_delete=django.db.models.deletion.CASCADE,
                    related_name='learner_parents',
                    to='core.learner',
                )),
                ('parent', models.ForeignKey(
                    limit_choices_to={'role': 'parent'},
                    on_delete=django.db.models.deletion.CASCADE,
                    related_name='parent_children',
                    to=settings.AUTH_USER_MODEL,
                )),
            ],
            options={
                'db_table': 'learner_parents',
                'ordering': ['learner', '-is_primary_contact'],
            },
        ),
        migrations.AddConstraint(
            model_name='learnerparent',
            constraint=models.UniqueConstraint(
                fields=['learner', 'parent'],
                name='unique_learner_parent',
            ),
        ),

        # Fix 2: Add tenant FK to SchoolSettings
        migrations.AddField(
            model_name='schoolsettings',
            name='tenant',
            field=models.OneToOneField(
                blank=True,
                help_text='The tenant (school) this settings row belongs to',
                null=True,
                on_delete=django.db.models.deletion.CASCADE,
                related_name='settings',
                to='core.tenant',
            ),
        ),

        # Fix 3: Add school_year FK to Subject
        migrations.AddField(
            model_name='subject',
            name='school_year',
            field=models.ForeignKey(
                blank=True,
                help_text='School year this subject belongs to — enables historical subject records',
                null=True,
                on_delete=django.db.models.deletion.SET_NULL,
                related_name='subjects',
                to='core.schoolyearconfig',
            ),
        ),

        # Fix 4: Add calendar_entry FK to AttendanceRecord
        migrations.AddField(
            model_name='attendancerecord',
            name='calendar_entry',
            field=models.ForeignKey(
                blank=True,
                help_text='Links to SchoolCalendar to validate this is a school day',
                null=True,
                on_delete=django.db.models.deletion.SET_NULL,
                related_name='attendance_records',
                to='core.schoolcalendar',
            ),
        ),

        # Fix 5: Change GraduationNotification.learner from OneToOneField to ForeignKey
        migrations.AlterField(
            model_name='graduationnotification',
            name='learner',
            field=models.ForeignKey(
                on_delete=django.db.models.deletion.CASCADE,
                related_name='graduation_notifications',
                to='core.learner',
            ),
        ),

        # Fix 6: Add section_history FK to SF1Record
        migrations.AddField(
            model_name='sf1record',
            name='section_history',
            field=models.ForeignKey(
                blank=True,
                help_text='Source LearnerSectionHistory entry — avoids duplication of section data',
                null=True,
                on_delete=django.db.models.deletion.SET_NULL,
                related_name='sf1_records',
                to='core.learnerSectionHistory',
            ),
        ),
    ]
