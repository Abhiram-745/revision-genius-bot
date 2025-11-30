-- Update is_admin function to include dhrishiv.panjabi@gmail.com
CREATE OR REPLACE FUNCTION public.is_admin(_user_id uuid)
 RETURNS boolean
 LANGUAGE sql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
  SELECT EXISTS (
    SELECT 1 FROM auth.users 
    WHERE id = _user_id 
    AND lower(email) IN ('abhiramkakarla1@gmail.com', 'dhrishiv.panjabi@gmail.com')
  );
$function$;