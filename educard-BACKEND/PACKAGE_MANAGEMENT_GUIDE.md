# 📦 EduCard Pro - Package Management Guide

## ✅ Virtual Environment Setup Complete!

Your virtual environment is now set up and Django is installed.

---

## 📁 Files Created

1. **`venv/`** - Virtual environment directory (don't commit to git)
2. **`requirements.txt`** - Complete list of all packages (current + future)
3. **`requirements-now.txt`** - Packages installed right now (Django only)

---

## 🔧 Virtual Environment Commands

### Activate Virtual Environment

**Windows (PowerShell):**
```powershell
.\venv\Scripts\Activate.ps1
```

**Windows (CMD):**
```cmd
venv\Scripts\activate.bat
```

**Linux/Mac:**
```bash
source venv/bin/activate
```

### Deactivate Virtual Environment
```bash
deactivate
```

### Verify Virtual Environment is Active
You should see `(venv)` at the beginning of your command prompt:
```
(venv) PS C:\Users\Admin\EDUCARD\educard-BACKEND>
```

---

## 📦 Currently Installed Packages

```
Django==5.0.7
├── asgiref==3.11.1
├── sqlparse==0.5.5
├── tzdata==2026.2
└── typing-extensions==4.15.0
```

**Total**: 5 packages (Django + 4 dependencies)

---

## 🚀 Installing Packages by Phase

### Phase 1: API Development (Week 1-2)

When you're ready to build the API, install:

```bash
# Activate venv first
.\venv\Scripts\Activate.ps1

# Install API packages
pip install djangorestframework==3.14.0
pip install django-cors-headers==4.3.1
pip install djangorestframework-simplejwt==5.3.1

# Update requirements-now.txt
pip freeze > requirements-now.txt
```

**What these do:**
- `djangorestframework` - Build REST APIs
- `django-cors-headers` - Allow frontend to call backend
- `djangorestframework-simplejwt` - JWT authentication

---

### Phase 2: Image Processing (Week 7+)

When you need to handle student photos:

```bash
pip install Pillow==10.2.0
```

**What this does:**
- Resize and process student photos
- Generate thumbnails
- Convert image formats

---

### Phase 3: PDF Generation (Week 7+)

When you need to generate ID cards and report cards:

```bash
pip install reportlab==4.0.9
pip install pypdf==3.17.4
```

**What these do:**
- `reportlab` - Generate PDF documents
- `pypdf` - Manipulate existing PDFs

---

### Phase 4: Barcode Generation (Week 7+)

When you need to generate barcodes for ID cards:

```bash
pip install python-barcode==0.15.1
pip install qrcode==7.4.2
```

**What these do:**
- Generate Code 128 barcodes (for LRN)
- Generate QR codes

---

### Phase 5: Excel/CSV Import (Week 7+)

When you need bulk grade import:

```bash
pip install openpyxl==3.1.2
pip install pandas==2.2.0
```

**What these do:**
- Read Excel files (.xlsx)
- Process CSV files
- Bulk data operations

---

### Phase 6: Notifications (Week 8+)

When you need to send Messenger/SMS notifications:

```bash
pip install requests==2.31.0
```

**What this does:**
- Make HTTP requests to Messenger API
- Call SMS gateway (Semaphore)

---

### Phase 7: Background Tasks (Week 8+)

When you need to process tasks in background:

```bash
pip install celery==5.3.6
pip install redis==5.0.1
pip install django-celery-beat==2.5.0
```

**What these do:**
- `celery` - Distributed task queue
- `redis` - Message broker for Celery
- `django-celery-beat` - Scheduled periodic tasks

---

### Phase 8: Production Deployment (Week 11+)

When you're ready to deploy:

```bash
pip install gunicorn==21.2.0
pip install whitenoise==6.6.0
pip install psycopg2-binary==2.9.9
```

**What these do:**
- `gunicorn` - Production WSGI server
- `whitenoise` - Serve static files
- `psycopg2-binary` - PostgreSQL database adapter

---

## 📝 Package Management Commands

### Install a Single Package
```bash
pip install package-name
```

### Install Specific Version
```bash
pip install package-name==1.2.3
```

### Install from requirements.txt
```bash
pip install -r requirements.txt
```

### Install from requirements-now.txt (current packages)
```bash
pip install -r requirements-now.txt
```

### Upgrade a Package
```bash
pip install --upgrade package-name
```

### Uninstall a Package
```bash
pip uninstall package-name
```

### List Installed Packages
```bash
pip list
```

### Show Package Details
```bash
pip show package-name
```

### Save Current Packages
```bash
pip freeze > requirements-now.txt
```

---

## 🔍 Check What's Installed

```bash
# Activate venv
.\venv\Scripts\Activate.ps1

# List all packages
pip list

# Check Django version
python -m django --version
```

**Expected Output:**
```
Package           Version
----------------- -------
asgiref           3.11.1
Django            5.0.7
pip               26.1.1
sqlparse          0.5.5
typing-extensions 4.15.0
tzdata            2026.2
```

---

## 📋 Installation Checklist by Phase

### ✅ Phase 0: Setup (COMPLETE)
- [x] Virtual environment created
- [x] Django installed
- [x] Pip upgraded

### 🔄 Phase 1: API Development (Week 1-2)
- [ ] djangorestframework
- [ ] django-cors-headers
- [ ] djangorestframework-simplejwt

### 📅 Phase 2: File Handling (Week 7+)
- [ ] Pillow (images)
- [ ] boto3 (cloud storage)
- [ ] django-storages

### 📅 Phase 3: PDF & Barcodes (Week 7+)
- [ ] reportlab
- [ ] python-barcode
- [ ] qrcode

### 📅 Phase 4: Data Import (Week 7+)
- [ ] openpyxl
- [ ] pandas

### 📅 Phase 5: Notifications (Week 8+)
- [ ] requests

### 📅 Phase 6: Background Tasks (Week 8+)
- [ ] celery
- [ ] redis
- [ ] django-celery-beat

### 📅 Phase 7: Production (Week 11+)
- [ ] gunicorn
- [ ] whitenoise
- [ ] psycopg2-binary

---

## 🎯 Quick Install Commands by Phase

### Phase 1: API (Copy & Paste)
```bash
.\venv\Scripts\Activate.ps1
pip install djangorestframework==3.14.0 django-cors-headers==4.3.1 djangorestframework-simplejwt==5.3.1
pip freeze > requirements-now.txt
```

### Phase 5: Advanced Features (Copy & Paste)
```bash
.\venv\Scripts\Activate.ps1
pip install Pillow==10.2.0 reportlab==4.0.9 python-barcode==0.15.1 qrcode==7.4.2 openpyxl==3.1.2 requests==2.31.0
pip freeze > requirements-now.txt
```

### Phase 8: Production (Copy & Paste)
```bash
.\venv\Scripts\Activate.ps1
pip install gunicorn==21.2.0 whitenoise==6.6.0 psycopg2-binary==2.9.9
pip freeze > requirements-now.txt
```

---

## 🚨 Important Notes

### 1. Always Activate Virtual Environment First
```bash
# Before any pip command
.\venv\Scripts\Activate.ps1
```

### 2. Don't Commit venv/ to Git
Add to `.gitignore`:
```
venv/
*.pyc
__pycache__/
db.sqlite3
```

### 3. Update requirements-now.txt After Installing
```bash
pip freeze > requirements-now.txt
```

### 4. Share requirements-now.txt with Team
Other developers can install the same packages:
```bash
pip install -r requirements-now.txt
```

---

## 🔧 Troubleshooting

### Issue: "pip is not recognized"
**Solution**: Activate virtual environment first
```bash
.\venv\Scripts\Activate.ps1
```

### Issue: "Permission denied"
**Solution**: Run PowerShell as Administrator or use:
```bash
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### Issue: Package installation fails
**Solution**: Upgrade pip first
```bash
python -m pip install --upgrade pip
```

### Issue: Wrong Python version
**Solution**: Check Python version
```bash
python --version  # Should be 3.8+
```

### Issue: Virtual environment not activating
**Solution**: Recreate virtual environment
```bash
# Delete venv folder
Remove-Item -Recurse -Force venv

# Create new one
python -m venv venv

# Activate
.\venv\Scripts\Activate.ps1

# Reinstall packages
pip install -r requirements-now.txt
```

---

## 📊 Package Size Reference

| Package | Size | Install Time |
|---------|------|--------------|
| Django | ~8 MB | ~10 seconds |
| djangorestframework | ~1 MB | ~5 seconds |
| Pillow | ~3 MB | ~10 seconds |
| pandas | ~40 MB | ~30 seconds |
| celery | ~2 MB | ~10 seconds |

---

## 🎓 Best Practices

### 1. Install Only What You Need
Don't install all packages at once. Install as you need them.

### 2. Pin Versions
Always specify versions in requirements.txt:
```
Django==5.0.7  # Good
Django         # Bad (unpredictable)
```

### 3. Keep requirements-now.txt Updated
After installing new packages:
```bash
pip freeze > requirements-now.txt
```

### 4. Test After Installing
After installing new packages, test your app:
```bash
python manage.py runserver
```

### 5. Document Why You Installed
Add comments in requirements.txt:
```
# PDF generation for ID cards
reportlab==4.0.9
```

---

## 📞 Quick Reference

### Activate venv
```bash
.\venv\Scripts\Activate.ps1
```

### Install package
```bash
pip install package-name
```

### Save packages
```bash
pip freeze > requirements-now.txt
```

### Install from file
```bash
pip install -r requirements-now.txt
```

### Check installed
```bash
pip list
```

---

## ✅ Current Status

- ✅ Virtual environment created: `venv/`
- ✅ Django installed: `5.0.7`
- ✅ Pip upgraded: `26.1.1`
- ✅ Requirements files created
- ✅ Ready for development!

---

## 🚀 Next Steps

1. **Verify Django works:**
   ```bash
   .\venv\Scripts\Activate.ps1
   python manage.py runserver
   ```

2. **When ready for API (Week 1-2):**
   ```bash
   pip install djangorestframework django-cors-headers djangorestframework-simplejwt
   ```

3. **Keep requirements-now.txt updated:**
   ```bash
   pip freeze > requirements-now.txt
   ```

---

**Your virtual environment is ready! Start developing!** 🎉
