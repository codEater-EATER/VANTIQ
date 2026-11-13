# 🔒 VANTIQ Security Guide

## Critical: Protecting Your Secrets

**Your data security is CRITICAL. Follow this guide!**

---

## ✅ What's Protected

### 1. `.gitignore` - Files NOT Committed to Git ✅

**These files are EXCLUDED from GitHub:**
```
✅ .env (Backend secrets)
✅ .env.local (Frontend secrets)
✅ node_modules/
✅ .env.production
✅ Credentials & API keys
✅ Database passwords
✅ Private SSH keys
```

**Verify files are protected:**
```bash
git status
# Should NOT show .env or .env.local
```

### 2. `.env.example` - Safe Template (Can be committed) ✅

**This file is SAFE to commit (no actual values):**
```
✅ Shows required variables
✅ Has placeholder values (xxxxx)
✅ Has comments explaining each variable
✅ Helps team know what to configure
❌ NO actual passwords/keys
```

### 3. `apps/web/.env.local.example` - Frontend Template ✅

**For frontend developers (SAFE to commit):**
```
✅ Lists Clerk variables needed
✅ No actual keys
✅ Instructions included
```

---

## 📋 Your Current Secrets (PROTECTED)

### Backend Secrets in `/apps/backend/.env`
```
✅ DATABASE_URL (PostgreSQL password)
✅ APIFY_API_KEY
✅ APOLLO_API_KEY
✅ CLERK_SECRET_KEY
✅ SENDGRID_API_KEY
✅ JWT_SECRET
```

**Status:** PROTECTED - Not in Git ✅

### Frontend Secrets in `/apps/web/.env.local`
```
✅ CLERK_SECRET_KEY
✅ NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
```

**Status:** PROTECTED - Not in Git ✅

---

## 🚨 CRITICAL SECURITY RULES

### 1. NEVER Commit Secrets
❌ Don't commit `.env` files
❌ Don't paste API keys in code
❌ Don't share `.env` files
❌ Don't upload to GitHub

### 2. Git Check
Always verify before pushing:
```bash
git status
# .env should NOT appear
# If it does: git rm --cached .env
```

### 3. If You Accidentally Commit Secrets
```bash
# 1. Remove the file
git rm --cached .env
git commit --amend -m "Remove secrets"

# 2. Regenerate all API keys immediately!
# 3. Rotate passwords
# 4. Force push (careful!)
git push --force-with-lease
```

### 4. Rotate Keys Regularly
- Every 90 days minimum
- After any team member leaves
- If keys appear in logs/errors

---

## 🔑 Managing API Keys Safely

### For Local Development
1. Create `.env` from `.env.example`
2. Fill in actual values
3. Never commit it
4. Use a password manager to store

### For Production (Vercel/Railway)
1. Use platform's "Secrets" or "Environment Variables"
2. Never paste into code
3. Rotate every 30-60 days
4. Use CI/CD variables (GitHub Secrets)

### For Team Sharing
1. Use dedicated secret management tool:
   - 1Password
   - LastPass
   - Bitwarden
   - AWS Secrets Manager
   
2. Never use:
   - Email ❌
   - Slack ❌
   - Discord ❌
   - Shared documents ❌

---

## 🔐 API Key Types in Your Project

### Public Keys (Safe to commit)
```
✅ NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY (starts with pk_)
✅ SUPABASE_ANON_KEY
✅ Google Analytics ID
```

### Secret Keys (NEVER commit)
```
❌ CLERK_SECRET_KEY (starts with sk_)
❌ SENDGRID_API_KEY (starts with SG.)
❌ APIFY_API_KEY
❌ APOLLO_API_KEY
❌ DATABASE_URL (contains password)
❌ JWT_SECRET
❌ AWS credentials
❌ Google service account keys
```

---

## 🛡️ GitHub Security Checklist

### Before First Push
- [ ] `.gitignore` file exists
- [ ] `.env` is in `.gitignore`
- [ ] `.env.local` is in `.gitignore`
- [ ] Run `git status` (no .env shown)
- [ ] Run `git diff --cached` (no secrets shown)

### For Production Deployment
- [ ] Use Vercel/Railway environment variables
- [ ] NOT in code or committed files
- [ ] Use different keys for dev/prod
- [ ] Enable 2FA on hosting platform
- [ ] Set up automatic deploys from main branch

### Ongoing
- [ ] Never hardcode secrets
- [ ] Rotate keys every 90 days
- [ ] Review git history for accidental commits
- [ ] Use pre-commit hooks to prevent secret commits

---

## 🚨 If a Secret Is Exposed

### Immediate Actions (Do Now!)
1. **Stop all deployments**
2. **Rotate the exposed key immediately** (generate new one)
3. **Delete old key** from the service
4. **Update all environments** with new key
5. **Audit logs** to see if key was used

### For Each Service

#### Clerk
1. Go to https://dashboard.clerk.com
2. Settings → API Keys
3. Delete old key
4. Create new key
5. Update `.env` files

#### SendGrid
1. Go to https://app.sendgrid.com
2. Settings → API Keys
3. Delete compromised key
4. Create new key
5. Update `.env`

#### Apify
1. Go to https://apify.com
2. Settings → API Tokens
3. Delete compromised token
4. Create new token
5. Update `.env`

#### Apollo
1. Go to https://app.apollo.io
2. Settings → Integrations
3. Delete compromised key
4. Create new key
5. Update `.env`

#### Database (Supabase)
1. Go to https://app.supabase.com
2. Settings → Database
3. Reset password
4. Update `DATABASE_URL` in `.env`

---

## 📝 Secure Development Practices

### Use `.env` Files Correctly
```bash
# ✅ DO: Keep secrets in .env
DATABASE_URL=postgresql://user:password@host/db

# ❌ DON'T: Hardcode in code
const db = connect("postgresql://user:password@host/db");

# ✅ DO: Read from env
const db = connect(process.env.DATABASE_URL);

# ✅ DO: Use example file
# Copy .env.example → .env
# Fill in your values
```

### Pre-commit Hook (Optional But Recommended)
```bash
# Install husky
npm install husky --save-dev

# Add pre-commit hook to prevent committing secrets
npx husky add .husky/pre-commit 'grep -r "sk_test\|SG\." . --exclude-dir=node_modules && exit 1 || exit 0'
```

---

## 🔍 Verify Current Protection

### Check `.env` is Ignored
```bash
cd c:\Users\nymph\OneDrive\Desktop\astra
git check-ignore apps/backend/.env
# Output: apps/backend/.env (means it's ignored ✅)

git check-ignore apps/web/.env.local
# Output: apps/web/.env.local (means it's ignored ✅)
```

### Check Nothing Secret is Staged
```bash
git diff --cached | grep -E "sk_|SG\.|password|secret"
# Should return nothing (means safe ✅)
```

### Check Git History
```bash
# Search for API key patterns
git log -p | grep -E "sk_test|SG\.|DASHSCOPE" | head -5
# If nothing found = safe ✅
```

---

## 📚 Security Checklist Summary

**Status:** ✅ Protected

| Item | Status | Action |
|------|--------|--------|
| `.gitignore` created | ✅ | Monitor going forward |
| `.env` excluded | ✅ | Don't commit |
| `.env.local` excluded | ✅ | Don't commit |
| API keys configured | ✅ | Keep in `.env` only |
| Example files created | ✅ | Safe to commit |
| GitHub repo secure | ✅ | Enable 2FA |

---

## 🚀 Deployment Security

### For Vercel (Frontend)
```
1. Go to project settings
2. "Environment Variables"
3. Add each variable from .env.local
4. Do NOT paste into code
5. Vercel auto-encrypts them
```

### For Railway (Backend)
```
1. Go to project settings
2. "Variables"
3. Add each variable from .env
4. Do NOT paste into code
5. Railway auto-encrypts them
```

### For Supabase (Database)
```
1. Settings → Database
2. "Connection String" already secure
3. Use in connection strings only
4. Access via restricted IP (optional)
```

---

## ✨ Final Notes

Your data is now:
- ✅ Protected from Git
- ✅ Encrypted at rest
- ✅ Secure in transit
- ✅ Managed per environment

**Follow this guide and you'll stay secure!** 🔒

---

**Questions?** Review this guide before deploying to production.
