-- Allow actor_id to be NULL in notifications table
-- This fixes the error "null value in column 'actor_id' violates not-null constraint"
-- when system triggers create notifications without an active user context
ALTER TABLE public.notifications ALTER COLUMN actor_id DROP NOT NULL;
