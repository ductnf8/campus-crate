CREATE OR REPLACE FUNCTION public.decrement_item_quantity()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  UPDATE public.items
    SET quantity = GREATEST(quantity - COALESCE(NEW.quantity, 1), 0)
    WHERE id = NEW.item_id;
  RETURN NEW;
END;
$function$;