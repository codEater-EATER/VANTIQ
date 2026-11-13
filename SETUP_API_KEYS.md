# VANTIQ API Keys Setup - Step by Step

## ⏱️ Time Needed
- **Critical Keys Only:** 15 minutes
- **Complete Setup:** 45 minutes
- **Optional Integrations:** 2+ hours

---

## 🔴 CRITICAL (Required to Start - 15 min)

### Step 1: Alibaba DashScope (Qwen AI)
**Time: 5 min | Importance: 🔴 CRITICAL**

1. Open: https://dashscope.aliyun.com
2. Sign up with email (or Alipay account)
3. Email verification
4. Navigate to: **API Keys** or **API管理**
5. Click: **Create New API Key** / **创建新API密钥**
6. Name it: `VANTIQ_PRODUCTION`
7. **COPY THE KEY** (looks like: `sk-xxxxxxxxxxxxxxxxxx`)
8. Add to `.env`:
   ```
   DASHSCOPE_API_KEY=sk-your-key-here
   QWEN_MODEL=qwen-max
   ```

✅ **Test:** 
```bash
curl -X POST https://ap-southeast-1.maas.qwencloudapi.com/compatible-mode/v1/chat/completions \
  -H "Authorization: Bearer sk-YOUR-KEY" \
  -H "Content-Type: application/json" \
  -d '{"model":"qwen-max","messages":[{"role":"user","content":"Hello"}]}'
```

---

### Step 2: Clerk Authentication
**Time: 5 min | Importance: 🔴 CRITICAL**

1. Open: https://dashboard.clerk.com
2. Sign in with GitHub or email
3. Create new project: `VANTIQ`
4. Go to: **API Keys** tab
5. Copy these two:
   - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` (public key)
   - `CLERK_SECRET_KEY` (secret key)
6. Add to `.env`:
   ```
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxxxxxxx
   CLERK_SECRET_KEY=sk_test_xxxxxxxx
   ```

✅ **Verify:** Keys should start with `pk_` and `sk_`

---

### Step 3: PostgreSQL Database
**Time: 5 min | Importance: 🔴 CRITICAL**

**Option A: Use Existing Local PostgreSQL (FASTEST)**
```
DATABASE_URL=postgresql://postgres:password@localhost:5432/vantiq
```

**Option B: Use Supabase (if you don't have PostgreSQL)**
1. Open: https://supabase.com
2. Sign in with GitHub
3. Create new project: `VANTIQ`
4. Wait for setup (2 min)
5. Go to: **Settings > Database > Connection String**
6. Copy connection string (PostgreSQL)
7. Add to `.env`:
   ```
   DATABASE_URL=postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres
   ```

✅ **Verify:**
```bash
psql $DATABASE_URL -c "SELECT 1"
```

---

## 🟠 HIGH PRIORITY (Essential for Leads - 15 min)

### Step 4: Apify (Web Scraping for Leads)
**Time: 5 min | Importance: 🟠 HIGH**

1. Open: https://apify.com
2. Sign up (free account + $5 credits)
3. Go to: **Settings > API Tokens**
4. Create new token or copy default
5. Copy token (looks like: `apify_api_xxxxxxxxxxxxxxx`)
6. Add to `.env`:
   ```
   APIFY_API_KEY=apify_api_xxxxxxxxxxxxxxx
   APIFY_API_ENDPOINT=https://api.apify.com/v2
   ```

✅ **Test:**
```bash
curl -H "Authorization: Bearer $APIFY_API_KEY" \
  https://api.apify.com/v2/acts/quentin~linkedin-jobs-scraper/runs
```

---

### Step 5: Apollo.io (B2B Lead Database)
**Time: 5 min | Importance: 🟠 HIGH**

1. Open: https://apollo.io
2. Sign up for free plan (limited) or paid ($49/mo)
3. Go to: **Settings > Integrations** or **API & Integrations**
4. Create API key
5. Copy key
6. Add to `.env`:
   ```
   APOLLO_API_KEY=your-apollo-api-key-here
   APOLLO_API_ENDPOINT=https://api.apollo.io/v1
   ```

✅ **Test:**
```bash
curl "https://api.apollo.io/v1/contacts/search?api_key=$APOLLO_API_KEY&q_keywords=CEO"
```

---

### Step 6: SendGrid (Email)
**Time: 5 min | Importance: 🟠 HIGH**

1. Open: https://sendgrid.com
2. Sign up (free 100 emails/day)
3. Go to: **Settings > API Keys**
4. Create new API key (Full Access)
5. Copy key (looks like: `SG.xxxxxxxxxxxxxxxx`)
6. Add to `.env`:
   ```
   SENDGRID_API_KEY=SG.xxxxxxxxxxxxxxxx
   SENDGRID_FROM_EMAIL=noreply@vantiq.com
   ```

✅ **Test:**
```bash
curl --request POST \
  --url https://api.sendgrid.com/v3/mail/send \
  --header "Authorization: Bearer $SENDGRID_API_KEY" \
  --header 'Content-Type: application/json'
```

---

## 🟡 OPTIONAL (Advanced Features - 20 min)

### Step 7: Twilio (SMS)
1. Open: https://www.twilio.com/console
2. Sign up
3. Copy:
   - Account SID
   - Auth Token
   - Phone Number
4. Add to `.env`:
   ```
   TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxx
   TWILIO_AUTH_TOKEN=xxxxxxxxxxxxxxxxxx
   TWILIO_PHONE_NUMBER=+1234567890
   ```

---

### Step 8: Stripe (Payments)
1. Open: https://stripe.com
2. Sign up
3. Go to: **Developers > API Keys**
4. Copy:
   - Publishable Key
   - Secret Key
5. Add to `.env`:
   ```
   STRIPE_PUBLIC_KEY=pk_live_xxxxx
   STRIPE_SECRET_KEY=sk_live_xxxxx
   ```

---

### Step 9: Google OAuth
1. Open: https://console.cloud.google.com
2. Create new project: `VANTIQ`
3. Enable **Google+ API**
4. Create **OAuth 2.0 Credentials**
5. Copy:
   - Client ID
   - Client Secret
6. Add to `.env`:
   ```
   GOOGLE_CLIENT_ID=xxxxx.apps.googleusercontent.com
   GOOGLE_CLIENT_SECRET=GOCSPX-xxxxxxxxx
   ```

---

### Step 10: Sentry (Error Tracking)
1. Open: https://sentry.io
2. Sign up
3. Create new project: `VANTIQ`
4. Select **Node.js**
5. Copy DSN
6. Add to `.env`:
   ```
   SENTRY_DSN=https://xxxxx@xxxxx.ingest.sentry.io/xxxxx
   ```

---

## 📝 Complete .env File

After collecting all keys, create/update `/apps/backend/.env`:

```bash
# ============= CRITICAL =============
BACKEND_PORT=3001
NODE_ENV=production

# Database
DATABASE_URL=postgresql://postgres:password@localhost:5432/vantiq

# Authentication (from Clerk)
CLERK_SECRET_KEY=sk_test_xxxxxxxx
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxxxxxxx

# AI (from DashScope)
DASHSCOPE_API_KEY=sk-xxxxxxxxxxxxxxx
QWEN_MODEL=qwen-max
QWEN_BASE_URL=https://ap-southeast-1.maas.qwencloudapi.com/compatible-mode/v1

# ============= HIGH PRIORITY =============
# Lead Sources
APIFY_API_KEY=apify_api_xxxxxxxxxxxxxxx
APIFY_API_ENDPOINT=https://api.apify.com/v2

APOLLO_API_KEY=your-apollo-api-key-here
APOLLO_API_ENDPOINT=https://api.apollo.io/v1

# Email
SENDGRID_API_KEY=SG.xxxxxxxxxxxxxxxx
SENDGRID_FROM_EMAIL=noreply@vantiq.com

# ============= OPTIONAL =============
# SMS
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=xxxxxxxxxxxxxxxxxx
TWILIO_PHONE_NUMBER=+1234567890

# Payments
STRIPE_PUBLIC_KEY=pk_live_xxxxx
STRIPE_SECRET_KEY=sk_live_xxxxx

# OAuth
GOOGLE_CLIENT_ID=xxxxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-xxxxxxxxx

# Monitoring
SENTRY_DSN=https://xxxxx@xxxxx.ingest.sentry.io/xxxxx

# JWT
JWT_SECRET=your-secret-key-generate-random-string
JWT_EXPIRY=7d
```

---

## ✅ Checklist

### Critical (Must Have)
- [ ] PostgreSQL connection works
- [ ] Clerk keys copied
- [ ] DashScope API key obtained
- [ ] `.env` file created in `/apps/backend/`

### High Priority (Should Have)
- [ ] Apify API key
- [ ] Apollo.io API key
- [ ] SendGrid API key

### Optional (Nice to Have)
- [ ] Twilio key
- [ ] Stripe keys
- [ ] Google OAuth
- [ ] Sentry DSN

---

## 🚀 Next Steps

Once you have all critical keys:

1. **Update `.env` file:**
   ```bash
   cd /apps/backend
   # Edit .env with your keys
   ```

2. **Test database:**
   ```bash
   npx prisma db push
   ```

3. **Install dependencies:**
   ```bash
   npm install
   ```

4. **Build backend:**
   ```bash
   npm run build --workspace=@vantiq/backend
   ```

5. **Start backend:**
   ```bash
   npm run dev --workspace=@vantiq/backend
   ```

6. **Start frontend (another terminal):**
   ```bash
   npm run dev --workspace=@vantiq/web
   ```

---

## 🆘 Troubleshooting

### "API key not working"
- ✅ Verify key is copied correctly (no extra spaces)
- ✅ Check API key hasn't expired
- ✅ Verify key has correct permissions
- ✅ Try generating a new key

### "Database connection failed"
- ✅ Check DATABASE_URL format
- ✅ Verify PostgreSQL is running
- ✅ Test connection: `psql $DATABASE_URL`
- ✅ Ensure database `vantiq` exists

### "Build fails"
- ✅ Delete `node_modules` and `package-lock.json`
- ✅ Run: `npm install --legacy-peer-deps`
- ✅ Clear TypeScript cache: `rm -rf dist/`

---

## 📞 Support Resources

- **DashScope:** https://dashscope.aliyun.com/docs
- **Clerk:** https://clerk.com/docs
- **Apollo:** https://apollo.io/developers
- **Apify:** https://docs.apify.com
- **SendGrid:** https://docs.sendgrid.com

---

**Start with Critical section → then add High Priority → then Optional**

**Total time for production: ~30-45 minutes** ⏱️
