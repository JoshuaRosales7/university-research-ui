-- Add missing 'link' column to notifications table to fix trigger error
-- Ejecuta este script en el SQL Editor de Supabase
ALTER TABLE public.notifications ADD COLUMN IF NOT EXISTS link TEXT;
