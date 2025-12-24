-- Create ambassador_submissions table for social media content submissions
CREATE TABLE public.ambassador_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  platform TEXT NOT NULL CHECK (platform IN ('youtube', 'tiktok', 'instagram')),
  video_url TEXT NOT NULL,
  view_count INTEGER DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  admin_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create index for faster queries
CREATE INDEX idx_ambassador_submissions_user_id ON public.ambassador_submissions(user_id);
CREATE INDEX idx_ambassador_submissions_status ON public.ambassador_submissions(status);

-- Enable RLS
ALTER TABLE public.ambassador_submissions ENABLE ROW LEVEL SECURITY;

-- Users can create their own submissions
CREATE POLICY "Users can create ambassador submissions"
ON public.ambassador_submissions
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can view their own submissions
CREATE POLICY "Users can view own ambassador submissions"
ON public.ambassador_submissions
FOR SELECT
USING (auth.uid() = user_id);

-- Admins can view all submissions
CREATE POLICY "Admins can view all ambassador submissions"
ON public.ambassador_submissions
FOR SELECT
USING (is_admin(auth.uid()));

-- Admins can update ambassador submissions
CREATE POLICY "Admins can update ambassador submissions"
ON public.ambassador_submissions
FOR UPDATE
USING (is_admin(auth.uid()));

-- Create trigger for updated_at
CREATE TRIGGER update_ambassador_submissions_updated_at
BEFORE UPDATE ON public.ambassador_submissions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

