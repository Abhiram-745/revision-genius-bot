-- Create ambassador_submissions table for tracking video submissions
CREATE TABLE IF NOT EXISTS public.ambassador_submissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  platform TEXT NOT NULL,
  video_url TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  admin_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.ambassador_submissions ENABLE ROW LEVEL SECURITY;

-- Users can view their own submissions
CREATE POLICY "Users can view their own submissions" ON public.ambassador_submissions
  FOR SELECT USING (auth.uid() = user_id);

-- Users can insert their own submissions  
CREATE POLICY "Users can insert their own submissions" ON public.ambassador_submissions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_ambassador_submissions_updated_at
  BEFORE UPDATE ON public.ambassador_submissions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();