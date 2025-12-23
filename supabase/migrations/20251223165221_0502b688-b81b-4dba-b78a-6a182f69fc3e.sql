-- Create app_requests table for users to request new study apps
CREATE TABLE public.app_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  app_name TEXT NOT NULL,
  app_url TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  admin_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.app_requests ENABLE ROW LEVEL SECURITY;

-- Users can create their own requests
CREATE POLICY "Users can create app requests"
ON public.app_requests
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can view their own requests
CREATE POLICY "Users can view own app requests"
ON public.app_requests
FOR SELECT
USING (auth.uid() = user_id);

-- Admins can view all requests
CREATE POLICY "Admins can view all app requests"
ON public.app_requests
FOR SELECT
USING (is_admin(auth.uid()));

-- Admins can update app requests
CREATE POLICY "Admins can update app requests"
ON public.app_requests
FOR UPDATE
USING (is_admin(auth.uid()));

-- Create trigger for updated_at
CREATE TRIGGER update_app_requests_updated_at
BEFORE UPDATE ON public.app_requests
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();