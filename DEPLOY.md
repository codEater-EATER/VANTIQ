# VANTIQ Deployment Instructions

## Quickest Path: Deploy Frontend to Vercel (5 minutes)

### Prerequisites
- GitHub account (✅ repo already at https://github.com/codEater-EATER/VANTIQ)
- Vercel account (free at vercel.com)

### Steps

1. **Go to Vercel Dashboard**
   - Visit https://vercel.com/new
   - Click "Import Git Repository"
   - Select the VANTIQ repo

2. **Configure Project**
   - Framework: Next.js (auto-detected)
   - Root directory: `./apps/web`
   - Build command: `npm run build`
   - Output directory: `.next`

3. **Add Environment Variables**
   ```
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY = pk_test_... (from Clerk Dashboard)
   CLERK_SECRET_KEY = sk_test_... (from Clerk Dashboard)
   NEXT_PUBLIC_API_URL = http://localhost:3001 (for now, update when backend ready)
   ```

4. **Deploy**
   - Click "Deploy"
   - Wait ~2-3 minutes
   - Get live URL at deployment complete

### Result
✅ Live at: `https://vantiq-<random>.vercel.app`

---

## Full Stack: Add Backend to Railway (20 minutes total)

After frontend is deployed on Vercel:

### Setup Supabase Database

1. Go to https://supabase.com/dashboard
2. Click "New Project"
3. Create database named `vantiq`
4. Copy PostgreSQL connection string
5. Run migrations:
   ```bash
   DATABASE_URL="<supabase-connection-string>" npx prisma db push
   ```

### Deploy Backend to Railway

1. Go to https://railway.app
2. Click "New Project" → "Deploy from GitHub"
3. Select VANTIQ repo → Authorize
4. Select root directory (or let it auto-detect)
5. Add variables in Railway dashboard:
   ```
   NODE_ENV=production
   DATABASE_URL=<Supabase connection string>
   JWT_SECRET=<generate: openssl rand -hex 32>
   CLERK_SECRET_KEY=sk_test_...
   DASHSCOPE_API_KEY=<from Alibaba DashScope>
   ```
6. Deploy (auto-detects NestJS backend)

### Update Frontend to Use Backend

1. Go to Vercel project settings
2. Add environment variable:
   ```
   NEXT_PUBLIC_API_URL=https://vantiq-backend-<random>.railway.app
   ```
3. Redeploy

### Result
✅ Full stack deployed and connected
- Frontend: `vantiq-<random>.vercel.app`
- Backend API: `vantiq-backend-<random>.railway.app`
- Database: Supabase PostgreSQL

---

## Environment Variables Reference

### Clerk (Authentication)
1. Go to https://dashboard.clerk.com
2. Create application or use existing
3. Copy keys:
   - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` (public)
   - `CLERK_SECRET_KEY` (secret)

### Alibaba DashScope (Qwen AI)
1. Go to https://dashscope.aliyun.com
2. Sign up or login
3. Create API key
4. Copy to `DASHSCOPE_API_KEY`

### Generate JWT Secret
```bash
# Linux/Mac
openssl rand -hex 32

# Windows PowerShell
[Convert]::ToHexString((1..32 | ForEach-Object { Get-Random -Maximum 256 }))
```

---

## Deployment Checklist

- [ ] Frontend builds successfully (`npm run build` ✅)
- [ ] Code pushed to GitHub ✅
- [ ] Vercel project created and deploying
- [ ] Environment variables set in Vercel
- [ ] Frontend loads at deployed URL
- [ ] Clerk authentication working
- [ ] (Optional) Backend deployed to Railway
- [ ] (Optional) Database connected to Supabase
- [ ] (Optional) Backend API responding

---

## Testing After Deployment

### Frontend
- [ ] Homepage loads
- [ ] Sign in page works
- [ ] Dashboard accessible after login
- [ ] All navigation links work

### Backend (if deployed)
- [ ] API health check: `curl https://api.yourdomain.com/health`
- [ ] Leads endpoint: `curl https://api.yourdomain.com/api/v1/leads`
- [ ] AI endpoint: `curl -X POST https://api.yourdomain.com/api/v1/ai/score-lead`

---

## Troubleshooting

### Frontend won't build
- Check Node version: `node --version` (need 18+)
- Clear cache: `npm cache clean --force`
- Reinstall: `rm -rf node_modules package-lock.json && npm install`

### Can't find GitHub repo
- Verify repo is public: https://github.com/codEater-EATER/VANTIQ
- Authorize Vercel to access GitHub org

### Backend API 400 errors
- Known issue: NestJS has decorator syntax errors
- Solution: Deploy frontend only first, add backend later
- Alternative: Use Supabase REST API as backend

### Database connection fails
- Verify connection string format: `postgresql://user:pass@host:5432/db`
- Check firewall allows connections
- Verify database exists

---

## Next: Custom Domain (Optional)

1. Go to Vercel project settings → Domains
2. Add custom domain (e.g., `vantiq.yourcompany.com`)
3. Follow DNS setup instructions
4. HTTPS auto-configured

---

**Estimated time: 5 min (frontend only) or 20 min (full stack)**

**Questions?** Check README.md or GitHub Actions logs
