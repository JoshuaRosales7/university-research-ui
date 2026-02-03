-- 1. Drop existing constraint first to allow new values
ALTER TABLE profiles 
DROP CONSTRAINT IF EXISTS profiles_role_check;

-- 2. Update existing 'docente' to 'publicador'
UPDATE profiles 
SET role = 'publicador' 
WHERE role = 'docente';

-- 3. Update existing 'estudiante' to 'usuario'
UPDATE profiles 
SET role = 'usuario' 
WHERE role = 'estudiante';

-- 4. Add new validation constraint
ALTER TABLE profiles 
ADD CONSTRAINT profiles_role_check 
CHECK (role IN ('admin', 'publicador', 'usuario'));

-- 3. Ensure RLS policies use the new roles if they were hardcoded (usually they use auth.uid() or check 'admin')
-- But just in case we have role-based checks in policies, we should review them.
-- Most checks are done in application logic (canUploadResearch), but if there are DB policies checking for 'docente', they need update.

-- Example: If there was a policy "Docentes can upload", it should now check for 'publicador'.
-- Assuming we rely on the application logic for granular permissions or the previous "can_upload" flag.
