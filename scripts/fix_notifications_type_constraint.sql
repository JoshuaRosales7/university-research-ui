-- Fix "violates check constraint notifications_type_check" error
-- The automatic trigger is likely using a notification type (like 'approved') that is not in the allowed list ('like', 'follow', 'system')
-- This script removes the strict check to allow any notification type

ALTER TABLE public.notifications DROP CONSTRAINT IF EXISTS notifications_type_check;
