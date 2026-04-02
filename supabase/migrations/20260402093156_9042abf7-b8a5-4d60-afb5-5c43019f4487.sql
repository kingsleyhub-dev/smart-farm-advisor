
CREATE OR REPLACE FUNCTION public.handle_new_user_role()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  IF NEW.email IN ('adminportal@gmail.com', 'kingsleyhub01@gmail.com', 'justerkamathi01@gmail.com', 'mwitiemillian@gmail.com') THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'admin');
  ELSE
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'farmer');
  END IF;
  RETURN NEW;
END;
$function$;
