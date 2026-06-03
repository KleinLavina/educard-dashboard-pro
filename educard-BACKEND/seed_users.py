"""
seed_users.py — Run with: python manage.py shell < seed_users.py
Creates usable accounts for every role and links student users to learners.
"""
import django, os
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'educard_backend.settings')
django.setup()

from core.models import User, Learner, ParentProfile

# ─── 1. Set passwords for existing users ─────────────────────────────────────
existing_passwords = {
    'admin':          'Admin@1234',
    'aurora.aquino':  'Teacher@1234',
    'benjie.lopez':   'Teacher@1234',
    'carmela.cruz':   'Teacher@1234',
    'dario.tan':      'Teacher@1234',
    'maria.delacruz': 'Parent@1234',
}
for username, pwd in existing_passwords.items():
    try:
        u = User.objects.get(username=username)
        u.set_password(pwd)
        u.is_active = True
        if username == 'admin':
            u.is_staff = True
            u.is_superuser = True
        u.save()
        print(f'  PASS  {username:<25} -> {pwd}')
    except User.DoesNotExist:
        print(f'  SKIP  {username} not found')

# ─── 2. Create student portal accounts ───────────────────────────────────────
students = [
    ('juan.delacruz',    'juan@stmarys.edu.ph',    'Juan',   'Dela Cruz',  '136728140987'),
    ('bea.soriano',      'bea@stmarys.edu.ph',     'Bea',    'Soriano',    '136728140989'),
    ('marco.reyes',      'marco@stmarys.edu.ph',   'Marco',  'Reyes',      '136728140098'),
    ('carlo.villanueva', 'carlo@stmarys.edu.ph',   'Carlo',  'Villanueva', '136728140988'),
    ('karina.bautista',  'karina@stmarys.edu.ph',  'Karina', 'Bautista',   '136728140455'),
    ('liza.bautista',    'liza@stmarys.edu.ph',    'Liza',   'Bautista',   '136728140067'),
]
for username, email, first, last, lrn in students:
    user, created = User.objects.get_or_create(
        username=username,
        defaults={'email': email, 'first_name': first, 'last_name': last, 'role': 'student', 'is_active': True},
    )
    user.set_password('Student@1234')
    user.is_active = True
    user.save()
    try:
        learner = Learner.objects.get(lrn=lrn)
        if learner.user_account_id != user.id:
            learner.user_account = user
            learner.save()
        tag = 'CREATED' if created else 'UPDATED'
        print(f'  {tag:<8} student {username:<25} -> LRN {lrn}')
    except Learner.DoesNotExist:
        print(f'  WARN  LRN {lrn} not found')

# ─── 3. Create parent portal account if missing ───────────────────────────────
parent_user, created = User.objects.get_or_create(
    username='maria.delacruz',
    defaults={
        'email': 'maria.delacruz@gmail.com',
        'first_name': 'Maria',
        'last_name': 'Dela Cruz',
        'role': 'parent',
        'is_active': True,
    },
)
parent_user.set_password('Parent@1234')
parent_user.role = 'parent'
parent_user.save()

# Ensure ParentProfile exists
ParentProfile.objects.get_or_create(
    user=parent_user,
    defaults={'relationship': 'Mother', 'messenger_linked': True, 'sms_enabled': False}
)

# Link Juan and Bea to this parent
for lrn in ['136728140987', '136728140989']:
    try:
        learner = Learner.objects.get(lrn=lrn)
        learner.parent_account = parent_user
        learner.save()
        print(f'  LINKED  parent {parent_user.username} -> LRN {lrn}')
    except Learner.DoesNotExist:
        pass

# ─── 4. Print final summary ───────────────────────────────────────────────────
print()
print('=' * 65)
print('COMPLETE LOGIN CREDENTIALS')
print('=' * 65)
print()
print('ROLE       USERNAME              PASSWORD       EMAIL')
print('-' * 65)
for u in User.objects.all().order_by('role', 'username'):
    pwd_hint = {
        'admin':   'Admin@1234',
    }.get(u.username,
          'Teacher@1234' if u.role == 'teacher' else
          'Student@1234' if u.role == 'student' else
          'Parent@1234')
    print(f'{u.role:<11}{u.username:<22}{pwd_hint:<15}{u.email}')

print()
print('Django Admin: http://127.0.0.1:8000/admin')
print('  username: admin')
print('  password: Admin@1234')
print()
print('API Login endpoint: POST http://127.0.0.1:8000/api/auth/login/')
print('  body: { "username": "...", "password": "..." }')
