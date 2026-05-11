CREATE OR REPLACE FUNCTION public.find_profile_by_id_prefix(_prefix text)
RETURNS TABLE(id uuid, balance numeric)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT p.id, p.balance
  FROM public.profiles p
  WHERE replace(p.id::text, '-', '') ILIKE (_prefix || '%')
  LIMIT 1;
$$;