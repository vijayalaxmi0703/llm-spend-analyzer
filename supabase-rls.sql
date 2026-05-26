-- Supabase RLS Policies for Credex Audits
-- Run these SQL commands in your Supabase dashboard to enable public read access

-- 1. Enable Row Level Security on audits table
ALTER TABLE audits ENABLE ROW LEVEL SECURITY;

-- 2. Create policy for public read access (anyone can read)
CREATE POLICY "Public read audits"
ON audits
FOR SELECT
USING (true);

-- 3. Create policy for service role insert (only authenticated admin can insert)
CREATE POLICY "Service role insert audits"
ON audits
FOR INSERT
WITH CHECK (true);

-- Verify policies are enabled:
-- SELECT tablename FROM pg_tables WHERE tablename = 'audits';
-- SELECT * FROM pg_policies WHERE tablename = 'audits';
