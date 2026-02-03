-- Add can_upload column to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS can_upload BOOLEAN DEFAULT true;

-- Ensure Admins can update any profile (specifically for managing permissions)
DROP POLICY IF EXISTS "Admins can update any profile" ON profiles;
CREATE POLICY "Admins can update any profile" ON profiles
FOR UPDATE
USING (
  (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
);

-- Enforce Upload Permission at RLS Level for Investigations
-- Drop existing insert policy if strictly open, or ensure this one runs.
-- Note: 'investigations' usually allows insert for authenticated users. We restrict it here.

DROP POLICY IF EXISTS "Enforce Blocked Uploads" ON investigations;
CREATE POLICY "Enforce Blocked Uploads" ON investigations
FOR INSERT
WITH CHECK (
  auth.uid() = owner_id AND
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND (can_upload = true OR can_upload IS NULL)
  )
);
