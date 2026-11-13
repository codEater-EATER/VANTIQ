# VANTIQ Database Setup Guide

## Option 1: Automatic (Recommended)

### Windows
1. **Right-click** `setup-databases.bat` in your project folder
2. Select **"Run as administrator"**
3. Wait for installation to complete
4. Close the window

This will install:
- PostgreSQL 15
- Redis 7

---

## Option 2: Manual Installation

### PostgreSQL 15

**Windows:**
1. Download: https://www.postgresql.org/download/windows/
2. Run installer
3. Choose components: ✓ PostgreSQL Server, ✓ pgAdmin, ✓ Command Line Tools
4. Set password for `postgres` user (remember this!)
5. Port: 5432
6. Locale: Default

**After Installation:**
```powershell
# Create vantiq database
createdb -U postgres vantiq

# Verify
psql -U postgres -d vantiq -c "SELECT version();"
```

---

### Redis 7

**Windows:**
1. Download: https://github.com/microsoftarchive/redis/releases
   - Get: `Redis-x64-7.0.msi`
2. Run installer
3. Default port: 6379
4. Accept all defaults

**After Installation:**
```powershell
# Test Redis
redis-cli ping
# Should output: PONG
```

---

## Step 3: Configure Your .env File

After databases are installed:

```powershell
cd c:\Users\nymph\OneDrive\Desktop\astra
cp .env.example .env
```

Edit `.env` and set:

```
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/vantiq
REDIS_URL=redis://localhost:6379
```

Replace `YOUR_PASSWORD` with the PostgreSQL password you set during installation.

---

## Step 4: Verify Installation

```powershell
# Test PostgreSQL
psql -U postgres -d vantiq -c "SELECT 1"

# Test Redis
redis-cli ping
```

Both should return success messages.

---

## Step 5: Initialize VANTIQ Database

```powershell
cd apps/backend
npx prisma migrate dev
```

This creates all 95+ tables automatically.

---

## Troubleshooting

### PostgreSQL Connection Failed
- Check password in `.env`
- Verify PostgreSQL is running: `psql --version`
- Check port: `netstat -an | findstr 5432`

### Redis Connection Failed
- Check Redis is running: `redis-cli ping`
- Verify port: `netstat -an | findstr 6379`

### Can't find createdb command
- PostgreSQL bin folder not in PATH
- Add manually: `C:\Program Files\PostgreSQL\15\bin` to system PATH
- Restart PowerShell after adding

### Permission Denied
- Run PowerShell as Administrator
- Right-click → "Run as administrator"

---

## Once Databases are Running

```powershell
# Terminal 1: Backend
cd apps/backend
npm run dev

# Terminal 2: Web App
cd apps/web
npm run dev

# Terminal 3: Mobile (Optional)
cd apps/mobile
npm start
```

Then open:
- **Web**: http://localhost:3000
- **Backend**: http://localhost:3001
- **API Docs**: http://localhost:3001/api

---

**That's it! VANTIQ will be fully running!** 🚀
