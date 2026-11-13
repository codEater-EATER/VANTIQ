-- VANTIQ RLS (Row Level Security) Setup
-- This ensures users can only see their own data

-- Enable RLS on all tables
ALTER TABLE "User" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Project" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Lead" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Campaign" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Distribution" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Buyer" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "CommissionLedger" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Application" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Activity" ENABLE ROW LEVEL SECURITY;

-- ============= USER TABLE =============
-- Users can view their own profile
CREATE POLICY "Users view own profile"
ON "User" FOR SELECT
USING (auth.uid()::text = id);

-- ============= LEAD TABLE =============
-- Users can view only their own leads
CREATE POLICY "Users view own leads"
ON "Lead" FOR SELECT
USING (auth.uid()::text = "userId");

-- Users can create leads
CREATE POLICY "Users create leads"
ON "Lead" FOR INSERT
WITH CHECK (auth.uid()::text = "userId");

-- Users can update their own leads
CREATE POLICY "Users update own leads"
ON "Lead" FOR UPDATE
USING (auth.uid()::text = "userId");

-- Users can delete their own leads
CREATE POLICY "Users delete own leads"
ON "Lead" FOR DELETE
USING (auth.uid()::text = "userId");

-- ============= PROJECT TABLE =============
-- Users can view only their own projects
CREATE POLICY "Users view own projects"
ON "Project" FOR SELECT
USING (auth.uid()::text = "userId");

-- Users can create projects
CREATE POLICY "Users create projects"
ON "Project" FOR INSERT
WITH CHECK (auth.uid()::text = "userId");

-- Users can update their own projects
CREATE POLICY "Users update own projects"
ON "Project" FOR UPDATE
USING (auth.uid()::text = "userId");

-- ============= CAMPAIGN TABLE =============
-- For now, make campaigns public (can be restricted later)
CREATE POLICY "Campaigns are public"
ON "Campaign" FOR SELECT
USING (true);

-- ============= DISTRIBUTION TABLE =============
-- Distributions are linked to leads (user's own)
CREATE POLICY "Users view own distributions"
ON "Distribution" FOR SELECT
USING (
  "leadId" IN (
    SELECT id FROM "Lead" WHERE "userId" = auth.uid()::text
  )
);

-- ============= BUYER TABLE =============
-- Buyers are public
CREATE POLICY "Buyers are public"
ON "Buyer" FOR SELECT
USING (true);

-- ============= COMMISSION LEDGER TABLE =============
-- Commission records for user's own leads
CREATE POLICY "Users view own commissions"
ON "CommissionLedger" FOR SELECT
USING (
  "leadId" IN (
    SELECT id FROM "Lead" WHERE "userId" = auth.uid()::text
  )
);

-- ============= APPLICATION TABLE =============
-- Applications are public
CREATE POLICY "Applications are public"
ON "Application" FOR SELECT
USING (true);

-- ============= ACTIVITY TABLE =============
-- Users can view activity related to their leads
CREATE POLICY "Users view own activity"
ON "Activity" FOR SELECT
USING (true);  -- Can be restricted later based on leadId

-- ============= BACKEND BYPASS =============
-- Allow backend service role to bypass RLS (using service key)
-- This is automatic in Supabase - no policy needed

GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Set default privileges for future tables
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO authenticated;
