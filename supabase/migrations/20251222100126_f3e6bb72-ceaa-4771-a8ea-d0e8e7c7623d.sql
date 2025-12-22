-- Create blurt_activity_logs table for storing practice session data from BlurtAI
CREATE TABLE public.blurt_activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  session_id TEXT NOT NULL,
  subject_name TEXT NOT NULL,
  topic_name TEXT NOT NULL,
  session_start TIMESTAMPTZ NOT NULL,
  session_end TIMESTAMPTZ NOT NULL,
  duration_seconds INTEGER NOT NULL,
  score_percentage NUMERIC(5,2),
  keywords_remembered TEXT[] DEFAULT '{}',
  keywords_missed TEXT[] DEFAULT '{}',
  total_keywords INTEGER DEFAULT 0,
  session_type TEXT DEFAULT 'practice',
  raw_data JSONB DEFAULT '{}'::jsonb,
  ai_analysis JSONB,
  analyzed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.blurt_activity_logs ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own activity logs"
ON public.blurt_activity_logs
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own activity logs"
ON public.blurt_activity_logs
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own activity logs"
ON public.blurt_activity_logs
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own activity logs"
ON public.blurt_activity_logs
FOR DELETE
USING (auth.uid() = user_id);

-- Create index for faster queries
CREATE INDEX idx_blurt_activity_logs_user_id ON public.blurt_activity_logs(user_id);
CREATE INDEX idx_blurt_activity_logs_session_start ON public.blurt_activity_logs(session_start DESC);