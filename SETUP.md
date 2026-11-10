# VANTIQ - Quick Start Setup Guide

## Prerequisites

- **Node.js** 20.x or later
- **npm** or **yarn** (npm preferred)
- **PostgreSQL** 14 or later
- **Redis** 6 or later
- **Git**

---

## 1. Clone and Install Dependencies

```bash
cd vantiq
npm install
```

This will install dependencies for all workspaces (backend, web, mobile).

---

## 2. Configure Environment Variables

Copy the environment template and update with your values:

```bash
cp .env.example .env
```

Edit `.env` and configure:

### Database
```
DATABASE_URL=postgresql://user:password@localhost:5432/vantiq
REDIS_URL=redis://localhost:6379
```

### Authentication (Clerk)
Get keys from [Clerk Dashboard](https://dashboard.clerk.com):
```
CLERK_SECRET_KEY=sk_...
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_...
```

### Google OAuth (Optional)
From [Google Cloud Console](https://console.cloud.google.com):
```
GOOGLE_CLIENT_ID=xxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=xxx
```

### AI Models
```
# Azure AI Qwen
AZURE_AI_ENDPOINT=https://your-resource.cognitiveservices.azure.com/
AZURE_AI_API_KEY=xxxxx
AZURE_AI_DEPLOYMENT_NAME=qwen

# Grok (Fallback)
GROK_API_KEY=xxxxx

# NVIDIA Nemotron (Fallback)
NVIDIA_API_KEY=xxxxx
```

### Integrations
```
APOLLO_API_KEY=xxxxx
APIFY_API_KEY=xxxxx
```

---

## 3. Set Up Database

```bash
cd apps/backend
npm install

# Create and run migrations
npx prisma migrate dev --name init

# Generate Prisma client
npx prisma generate
```

This will:
- Create the PostgreSQL database
- Run all migrations
- Generate the Prisma client

### Access Database UI (Optional)

```bash
npx prisma studio
```

This opens an interactive database browser at `http://localhost:5555`

---

## 4. Start Backend Server

```bash
cd apps/backend
npm run dev
```

Expected output:
```
🚀 VANTIQ Backend running on http://localhost:3001
📚 API Documentation available at http://localhost:3001/api
```

### API Documentation

Visit http://localhost:3001/api to explore all endpoints via Swagger UI.

---

## 5. Start Web Application

In a new terminal:

```bash
cd apps/web
npm install
npm run dev
```

Expected output:
```
▲ Next.js 14.1
- Local:        http://localhost:3000
- Environments: .env.local
```

Visit http://localhost:3000 to see the landing page.

---

## 6. Start Mobile Application (Optional)

In a new terminal:

```bash
cd apps/mobile
npm install
npm start
```

Options:
- Press `a` to open Android emulator
- Press `i` to open iOS simulator
- Press `w` to open web view

---

## 7. Verify Setup

### Backend Health Check

```bash
curl http://localhost:3001/api
```

### Web Landing Page

Open http://localhost:3000 in your browser

### Try Authentication

1. Go to http://localhost:3000/auth/signup
2. Create an account with Clerk
3. You should be redirected to the app

---

## Development Workflow

### All Services

```bash
npm run dev  # Runs all services concurrently from root
```

### Individual Services

```bash
# Backend
cd apps/backend && npm run dev

# Web
cd apps/web && npm run dev

# Mobile
cd apps/mobile && npm start
```

---

## Common Issues & Solutions

### Issue: Database Connection Failed

**Solution**: Ensure PostgreSQL is running and `DATABASE_URL` is correct.

```bash
# macOS
brew services start postgresql

# Linux
sudo systemctl start postgresql

# Windows
# Start PostgreSQL service from Services app
```

### Issue: Prisma Migration Failed

**Solution**: Reset the database and run migrations again.

```bash
cd apps/backend
npx prisma migrate reset
```

⚠️ **Warning**: This deletes all data.

### Issue: Port Already in Use

**Solution**: Change the port in `.env` or kill the process.

```bash
# Find process using port 3001
lsof -i :3001

# Kill process
kill -9 <PID>
```

### Issue: Module Not Found

**Solution**: Ensure dependencies are installed in all workspaces.

```bash
npm install  # From root
```

---

## Testing

### Backend Tests

```bash
cd apps/backend
npm run test
```

### Web Tests

```bash
cd apps/web
npm run test
```

### Linting

```bash
npm run lint  # From root (all workspaces)
```

---

## Building for Production

### Backend

```bash
cd apps/backend
npm run build
npm start
```

### Web

```bash
cd apps/web
npm run build
npm start
```

### Mobile APK

```bash
cd apps/mobile
eas build --platform android --profile production
```

---

## API Authentication

All API endpoints (except public ones) require JWT authentication:

```bash
# Get token from login
curl -X POST http://localhost:3001/api/v1/auth/validate \
  -H "Content-Type: application/json" \
  -d '{
    "clerkId": "user_xxx",
    "email": "user@example.com",
    "name": "User Name"
  }'

# Use token in requests
curl http://localhost:3001/api/v1/dashboard/metrics \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## Next Steps

1. **Create First Lead**: POST `/api/v1/leads` with lead data
2. **Set Up Campaign**: POST `/api/v1/campaigns` to create campaigns
3. **Add Buyer**: POST `/api/v1/buyers` to onboard buyers
4. **Explore Dashboard**: Visit `/dashboard` on web app

---

## Documentation

- **API Docs**: http://localhost:3001/api (Swagger UI)
- **Architecture**: See `README.md` in root
- **Implementation Status**: See `IMPLEMENTATION_STATUS.md`
- **Database Schema**: See `apps/backend/prisma/schema.prisma`

---

## Support

- Review `.env.example` for configuration options
- Check logs in terminal for detailed error messages
- Consult Prisma documentation: https://www.prisma.io/docs/
- View NestJS docs: https://docs.nestjs.com/
- Next.js guide: https://nextjs.org/docs

---

**VANTIQ: Intelligence That Converts** 🚀
