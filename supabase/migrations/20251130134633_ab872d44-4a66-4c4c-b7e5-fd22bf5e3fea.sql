-- Grant premium status to abhiramkakarla1@gmail.com (user ID: d8eee375-37f0-40f2-87f2-b9d39f0e021f)
INSERT INTO public.user_roles (user_id, role)
VALUES ('d8eee375-37f0-40f2-87f2-b9d39f0e021f', 'paid')
ON CONFLICT (user_id) DO UPDATE SET role = 'paid', updated_at = now();

-- Also update the database function to only include the single admin email
CREATE OR REPLACE FUNCTION public.is_admin(_user_id uuid)
 RETURNS boolean
 LANGUAGE sql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
  SELECT EXISTS (
    SELECT 1 FROM auth.users 
    WHERE id = _user_id 
    AND lower(email) = 'abhiramkakarla1@gmail.com'
  );
$function$;

-- Update handle_new_user_role to only make abhiramkakarla1@gmail.com an admin
CREATE OR REPLACE FUNCTION public.handle_new_user_role()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  user_email text;
BEGIN
  user_email := lower(NEW.email);
  
  -- Only abhiramkakarla1@gmail.com gets paid role automatically
  IF user_email = 'abhiramkakarla1@gmail.com' THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'paid');
  ELSE
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'free');
  END IF;
  
  RETURN NEW;
END;
$function$;