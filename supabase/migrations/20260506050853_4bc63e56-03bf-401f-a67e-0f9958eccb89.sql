
-- 1. Default 20000 for new users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.profiles (id, email, name, balance)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)), 20000);
  RETURN NEW;
END;
$function$;

ALTER TABLE public.profiles ALTER COLUMN balance SET DEFAULT 20000;

-- 2. Add quantity to items
ALTER TABLE public.items ADD COLUMN IF NOT EXISTS quantity integer NOT NULL DEFAULT 1;

-- 3. Trigger: decrement quantity on order; mark sold when 0
CREATE OR REPLACE FUNCTION public.decrement_item_quantity()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  remaining int;
BEGIN
  UPDATE public.items
    SET quantity = GREATEST(quantity - 1, 0),
        status = CASE WHEN quantity - 1 <= 0 THEN 'sold' ELSE status END
    WHERE id = NEW.item_id
    RETURNING quantity INTO remaining;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_decrement_item_quantity ON public.orders;
CREATE TRIGGER trg_decrement_item_quantity
AFTER INSERT ON public.orders
FOR EACH ROW EXECUTE FUNCTION public.decrement_item_quantity();

-- 4. AI search function
CREATE OR REPLACE FUNCTION public.search_items_for_ai(_q text DEFAULT NULL, _location text DEFAULT NULL, _max_price numeric DEFAULT NULL, _limit int DEFAULT 8)
RETURNS TABLE(id uuid, title text, price numeric, location text, district text, ward text, category text, image_url text, quantity int)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT i.id, i.title, i.price, i.location, i.district, i.ward, i.category, i.image_url, i.quantity
  FROM public.items i
  WHERE i.status = 'active'
    AND (_q IS NULL OR i.title ILIKE '%' || _q || '%' OR i.description ILIKE '%' || _q || '%' OR i.category ILIKE '%' || _q || '%')
    AND (_location IS NULL OR i.location ILIKE '%' || _location || '%' OR i.district ILIKE '%' || _location || '%' OR i.ward ILIKE '%' || _location || '%')
    AND (_max_price IS NULL OR i.price <= _max_price)
  ORDER BY i.is_featured DESC, i.views_count DESC, i.created_at DESC
  LIMIT LEAST(COALESCE(_limit, 8), 20);
$$;
