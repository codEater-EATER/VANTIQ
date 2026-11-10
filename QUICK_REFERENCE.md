# VANTIQ - Quick Reference Card

## 🚀 Quick Start (60 seconds)

```bash
# 1. Install all dependencies
npm install

# 2. Set up database
cd apps/backend
npx prisma migrate dev

# 3. Start in separate terminals
# Terminal 1: Backend
cd apps/backend && npm run dev

# Terminal 2: Web
cd apps/web && npm run dev

# Terminal 3: Mobile
cd apps/mobile && npm start
```

---

## 🔗 Important URLs

| Service | URL | Purpose |
|---------|-----|---------|
| Backend | http://localhost:3001 | API server |
| API Docs | http://localhost:3001/api | Swagger documentation |
| Web App | http://localhost:3000 | Dashboard & web interface |
| Mobile | Varies | React Native development |
| DB UI | http://localhost:5555 | Prisma Studio (optional) |

---

## 📁 Key Files to Know

| File | Purpose |
|------|---------|
| `.env.example` | Configuration template |
| `apps/backend/prisma/schema.prisma` | Database schema |
| `apps/backend/src/app.module.ts` | Backend module structure |
| `apps/web/app/page.tsx` | Landing page |
| `apps/mobile/app.json` | Mobile app config |

---

## 🔑 Environment Variables (Essential)

```bash
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/vantiq

# Backend
BACKEND_PORT=3001
JWT_SECRET=your_secret_key

# Authentication
CLERK_SECRET_KEY=sk_...
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_...

# Redis (Optional but recommended)
REDIS_URL=redis://localhost:6379
```

---

## 📊 API Endpoints (Core)

```bash
# Authentication
POST   /api/v1/auth/validate          # Validate user
GET    /api/v1/auth/me                # Get current user

# Dashboard
GET    /api/v1/dashboard/metrics      # Get metrics

# Leads
GET    /api/v1/leads                  # List leads
POST   /api/v1/leads                  # Create lead
GET    /api/v1/leads/:id              # Get lead
PUT    /api/v1/leads/:id/status       # Update status

# Campaigns
GET    /api/v1/campaigns              # List campaigns
POST   /api/v1/campaigns              # Create campaign

# More endpoints...
```

---

## 🗄️ Database Models (Essential)

| Model | Purpose |
|-------|---------|
| User | User accounts |
| Lead | Lead records |
| Campaign | Lead generation campaigns |
| Buyer | Buyer/client accounts |
| Distribution | Lead distribution tracking |
| CommissionLedger | Payment tracking |
| Consent | GDPR/DPDP compliance |

---

## 🛠️ Common Commands

```bash
# Backend
npm run dev              # Start in watch mode
npm run build           # Build for production
npm run test            # Run tests
npm run lint            # Check code quality
npx prisma migrate dev  # Create migration
npx prisma studio      # Open database UI

# Web
npm run dev             # Start dev server
npm run build           # Build for production
npm run test            # Run tests
npm run lint            # Check code quality

# Mobile
npm start               # Start Expo server
npm run android         # Run on Android emulator
npm run ios            # Run on iOS simulator
npm run build:android  # Build APK
```

---

## 🔐 Authentication Flow

1. User signs up/in via Clerk
2. Clerk provides JWT token
3. Token stored in browser/mobile storage
4. Token sent with API requests in `Authorization: Bearer <token>` header
5. Backend validates token with JWT strategy

---

## 🎨 Design Colors

```css
Navy: #101827       /* Primary background */
Black: #101114      /* Deep backgrounds */
Charcoal: #202124   /* Cards */
Ivory: #F6F2EA      /* Primary text */
Violet: #8C7BB8     /* Primary accent */
Gold: #C6AD83       /* Premium accent */
```

---

## 📞 Support Resources

| Resource | Location |
|----------|----------|
| Setup Guide | `SETUP.md` |
| Full Documentation | `README.md` |
| Implementation Progress | `IMPLEMENTATION_STATUS.md` |
| Phase 1 Summary | `PHASE1_SUMMARY.md` |
| File List | `FILE_MANIFEST.md` |
| API Docs | `http://localhost:3001/api` (when running) |

---

## ⚠️ Common Issues Quick Fixes

**Problem**: Database connection failed
```bash
# Ensure PostgreSQL is running
# Check DATABASE_URL in .env
# Run: npx prisma db push
```

**Problem**: Port already in use
```bash
# Change port in .env or .env.local
# Or kill the process using the port
lsof -i :3001  # Find process
kill -9 <PID>  # Kill it
```

**Problem**: Dependencies not found
```bash
# From root directory
npm install
# Then in each app
cd apps/backend && npm install
```

**Problem**: TypeScript errors
```bash
# Regenerate Prisma types
cd apps/backend
npx prisma generate
```

---

## 📈 Project Stats

- **Files Created**: 63
- **Database Models**: 95+
- **API Endpoints**: 25+
- **Backend Modules**: 12
- **Mobile Screens**: 8+
- **Color Palette**: 10 colors
- **Environment Variables**: 40+

---

## 🎯 Success Checklist

- [ ] `.env` configured with all values
- [ ] PostgreSQL database running
- [ ] Backend starts without errors
- [ ] Web app loads at localhost:3000
- [ ] Mobile app compiles
- [ ] Database migrations run
- [ ] API documentation loads at /api
- [ ] Clerk authentication working

---

## 📝 File Hierarchy

```
VANTIQ/
├── apps/
│   ├── backend/          # NestJS API
│   ├── web/              # Next.js Dashboard
│   └── mobile/           # React Native App
├── .env.example          # Configuration
├── README.md             # Main docs
├── SETUP.md              # Setup guide
└── QUICK_REFERENCE.md    # This file
```

---

## 🚢 Deployment Checklist

- [ ] All environment variables configured
- [ ] Database migrations run
- [ ] API tested and working
- [ ] Web app builds successfully
- [ ] Mobile app builds to APK
- [ ] Security audit completed
- [ ] Tests passing
- [ ] Performance optimized

---

## 💡 Pro Tips

1. Use `npm run dev` from root to start all services
2. Keep `.env` synced with `.env.example`
3. Review database schema in Prisma Studio
4. Use Swagger UI at `/api` to test endpoints
5. Enable TypeScript strict mode for safety
6. Keep console logs for debugging
7. Back up database regularly

---

## 📞 Next Steps

1. ✅ **Now**: Complete setup (see SETUP.md)
2. ⏭️ **Next**: Implement Phase 2 (Lead Generation)
3. ⏭️ **Then**: Build Phase 3 (Business Engine)
4. ⏭️ **Later**: Integrate Phase 4 (External APIs)

---

**VANTIQ: Intelligence That Converts**

*Built for scale. Ready for growth.* 🚀
