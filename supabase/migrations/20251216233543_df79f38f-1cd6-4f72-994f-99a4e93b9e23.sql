-- Create table to cache Blurt AI sessions per topic
CREATE TABLE public.blurt_ai_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  topic_name TEXT NOT NULL,
  subject_name TEXT NOT NULL,
  blurt_content JSONB DEFAULT '{}'::jsonb,
  last_used_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.blurt_ai_sessions ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can manage their own blurt sessions"
ON public.blurt_ai_sessions FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Create unique constraint to prevent duplicates
CREATE UNIQUE INDEX blurt_ai_sessions_unique_topic ON public.blurt_ai_sessions(user_id, topic_name, subject_name);

-- Index for faster lookups
CREATE INDEX blurt_ai_sessions_user_lookup ON public.blurt_ai_sessions(user_id, subject_name);