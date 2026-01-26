-- Create comments table for investigations
CREATE TABLE IF NOT EXISTS public.comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  investigation_id UUID NOT NULL REFERENCES public.investigations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now(),
  deleted_at TIMESTAMP,
  is_edited BOOLEAN DEFAULT FALSE
);

-- Enable RLS
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

-- Allow users to view comments on approved investigations
CREATE POLICY "Anyone can view comments on investigations"
  ON public.comments
  FOR SELECT
  USING (true);

-- Allow users to create comments
CREATE POLICY "Authenticated users can create comments"
  ON public.comments
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Allow users to edit their own comments
CREATE POLICY "Users can update their own comments"
  ON public.comments
  FOR UPDATE
  USING (user_id = auth.uid());

-- Allow users to soft delete their own comments
CREATE POLICY "Users can soft delete their own comments"
  ON public.comments
  FOR DELETE
  USING (user_id = auth.uid());

-- Create an index for faster queries
CREATE INDEX IF NOT EXISTS idx_comments_investigation_id ON public.comments(investigation_id);
CREATE INDEX IF NOT EXISTS idx_comments_user_id ON public.comments(user_id);
CREATE INDEX IF NOT EXISTS idx_comments_created_at ON public.comments(created_at DESC);
