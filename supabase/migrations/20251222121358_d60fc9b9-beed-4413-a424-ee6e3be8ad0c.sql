-- Add enhanced tracking columns to blurt_activity_logs
ALTER TABLE public.blurt_activity_logs 
ADD COLUMN IF NOT EXISTS confidence_level integer,
ADD COLUMN IF NOT EXISTS accuracy_percentage numeric,
ADD COLUMN IF NOT EXISTS mistake_types jsonb DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS concepts_mastered jsonb DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS concepts_struggling jsonb DEFAULT '[]'::jsonb;

-- Add a check constraint for confidence_level (1-5 range)
ALTER TABLE public.blurt_activity_logs 
ADD CONSTRAINT confidence_level_range CHECK (confidence_level IS NULL OR (confidence_level >= 1 AND confidence_level <= 5));