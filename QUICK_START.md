# VANTIQ Quick Start 🚀

## ✅ Current Status
- **PostgreSQL 15**: Installing... (Wait 5-10 minutes)
- **Password**: `89587da2dad047a99954741775db2bc2`

---

## Step 1: Wait for PostgreSQL Installation

Wait for the installer to complete. You should see:
```
✓ PostgreSQL 15.19.5 installed successfully
```

---

## Step 2: Install Redis (Choose One)

### Option A: Using WSL2/Docker (Easiest - No Admin Needed)
```powershell
wsl --install -d Ubuntu
# Then inside WSL:
sudo apt-get update
sudo apt-get install redis-server
redis-server
```

### Option B: Download Redis MSI (Admin Required)
https://github.com/microsoftarchive/redis/releases
- Download `Redis-x64-7.0.msi`
- Run with admin rights
- Install to default location

### Option C: Use Node Redis (No Installation Needed!)
Redis will run embedded in Node.js. Just run:
```powershell
npm install
npm run dev
```

---

## Step 3: Initialize Database

After PostgreSQL is installed:

```powershell
cd c:\Users\nymph\OneDrive\Desktop\astra

# Add PostgreSQL to PATH (if not already done)
$env:Path += ";C:\Program Files\PostgreSQL\15\bin"

# Create vantiq database
createdb -U postgres -d vantiq

# Initialize Prisma
cd apps/backend
npx prisma migrate dev
```

---

## Step 4: Start VANTIQ

### Terminal 1 - Backend
```powershell
cd c:\Users\nymph\OneDrive\Desktop\astra\apps\backend
npm run dev
```

### Terminal 2 - Web
```powershell
cd c:\Users\nymph\OneDrive\Desktop\astra\apps\web
npm run dev
```

### Terminal 3 - Mobile (Optional)
```powershell
cd c:\Users\nymph\OneDrive\Desktop\astra\apps\mobile
npm start
```

---

## Access VANTIQ

- **Web App**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **API Documentation**: http://localhost:3001/api
- **Database UI**: http://localhost:5555 (after prisma studio)

---

## Credentials

| Service | URL | User | Password |
|---------|-----|------|----------|
| PostgreSQL | localhost:5432 | postgres | 89587da2dad047a99954741775db2bc2 |
| Redis | localhost:6379 | (none) | (none) |

---

## Troubleshooting

### "psql command not found"
Add PostgreSQL to PATH:
```powershell
$env:Path += ";C:\Program Files\PostgreSQL\15\bin"
```

### "Cannot connect to PostgreSQL"
```powershell
# Restart PostgreSQL service
net stop postgresql-x64-15
net start postgresql-x64-15
```

### "Redis connection failed"
If you haven't installed Redis, use Option C above (embedded Redis).

---

## Need Help?

1. Check `.env` file - ensure DATABASE_URL is correct
2. Verify PostgreSQL is running: `psql -U postgres -c "SELECT 1"`
3. Check logs in terminal for detailed errors
4. Re-read DATABASE_SETUP.md for detailed guidance

---

**Everything is ready! Just wait for PostgreSQL installer to finish and follow Step 3.** ✅
