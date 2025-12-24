-- Allow admins (specific emails via user metadata) to update ambassador submissions
-- Create a function to check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin_user(_user_id UUID) RETURNS BOOLEAN AS $$
DECLARE
  user_email TEXT;
  admin_emails TEXT[] := ARRAY['abhiramkakarla1@gmail.com', 'dhrishiv.panjabi@gmail.com', '22ukakarlaa@qerdp.co.uk', '22upanjabid@qerdp.co.uk'];
BEGIN
  SELECT email INTO user_email FROM auth.users WHERE id = _user_id;
  RETURN LOWER(user_email) = ANY(admin_emails);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Add UPDATE policy for admins
CREATE POLICY "Admins can update ambassador submissions"
ON public.ambassador_submissions
FOR UPDATE
USING (public.is_admin_user(auth.uid()))
WITH CHECK (public.is_admin_user(auth.uid()));

-- Add SELECT policy for admins to view all submissions
CREATE POLICY "Admins can view all submissions"
ON public.ambassador_submissions
FOR SELECT
USING (public.is_admin_user(auth.uid()));