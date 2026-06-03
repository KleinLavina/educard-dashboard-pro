# EduCard Pro — Login Credentials Reference

All accounts are seeded from `seed_users.py` and use usable hashed passwords.

---

## How to Start the Backend

```bash
cd educard-BACKEND
venv\Scripts\Activate.ps1
python manage.py runserver
```

API base URL: `http://localhost:8000/api`  
Django Admin: `http://localhost:8000/admin`

---

## API Login Endpoint

```
POST http://localhost:8000/api/auth/login/
Content-Type: application/json

{
  "username": "<username>",
  "password": "<password>"
}
```

Response includes `access` token (JWT), `refresh` token, and `user` object.

---

## All Login Accounts

### 🔴 Admin (Principal / Registrar)

| Field    | Value                     |
|----------|---------------------------|
| Username | `admin`                   |
| Password | `Admin@1234`              |
| Email    | admin@stmarys.edu.ph      |
| Role     | admin                     |
| Access   | Full school management, all routes |

**Django Admin panel:**  
URL: `http://localhost:8000/admin`  
Username: `admin` | Password: `Admin@1234`

---

### 🟠 Teachers

| Username         | Password       | Email                       | Advises            |
|-----------------|----------------|-----------------------------|---------------------|
| `aurora.aquino` | `Teacher@1234` | a.aquino@stmarys.edu.ph     | Grade 7 - Sampaguita |
| `benjie.lopez`  | `Teacher@1234` | b.lopez@stmarys.edu.ph      | Grade 7 - Rosal      |
| `carmela.cruz`  | `Teacher@1234` | c.cruz@stmarys.edu.ph       | Grade 8 - Adelfa     |
| `dario.tan`     | `Teacher@1234` | d.tan@stmarys.edu.ph        | Grade 8 - Ilang-Ilang |

---

### 🟢 Students

| Username             | Password       | LRN            | Name                  | Section              |
|---------------------|----------------|----------------|-----------------------|----------------------|
| `juan.delacruz`     | `Student@1234` | 136728140987   | Juan M. Dela Cruz     | Grade 7 - Sampaguita |
| `bea.soriano`       | `Student@1234` | 136728140989   | Bea L. Soriano        | Grade 7 - Sampaguita |
| `carlo.villanueva`  | `Student@1234` | 136728140988   | Carlo P. Villanueva   | Grade 7 - Sampaguita |
| `marco.reyes`       | `Student@1234` | 136728140098   | Marco T. Reyes        | Grade 7 - Rosal ⚠️ At-Risk |
| `karina.bautista`   | `Student@1234` | 136728140455   | Karina B. Bautista    | Grade 8 - Adelfa     |
| `liza.bautista`     | `Student@1234` | 136728140067   | Liza R. Bautista      | Grade 11 STEM - St. Jude |

---

### 🔵 Parent

| Username          | Password       | Email                      | Linked Children                |
|------------------|----------------|----------------------------|--------------------------------|
| `maria.delacruz` | `Parent@1234`  | maria.delacruz@gmail.com   | Juan (136728140987) + Bea (136728140989) |

---

## Quick Test with curl

```bash
# Admin login
curl -X POST http://localhost:8000/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d "{\"username\":\"admin\",\"password\":\"Admin@1234\"}"

# Teacher login
curl -X POST http://localhost:8000/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d "{\"username\":\"aurora.aquino\",\"password\":\"Teacher@1234\"}"

# Student login
curl -X POST http://localhost:8000/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d "{\"username\":\"juan.delacruz\",\"password\":\"Student@1234\"}"

# Parent login
curl -X POST http://localhost:8000/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d "{\"username\":\"maria.delacruz\",\"password\":\"Parent@1234\"}"
```

---

## Notes

- **JWT access token** expires after **8 hours**
- **JWT refresh token** expires after **7 days**
- All passwords follow the format `Role@1234`
- To reset a password: `python manage.py changepassword <username>`
- To re-seed all passwords: `python seed_users.py`
