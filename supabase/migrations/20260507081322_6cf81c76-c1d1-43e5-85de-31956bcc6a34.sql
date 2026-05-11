-- Add quantity to orders
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS quantity integer NOT NULL DEFAULT 1;

-- Update decrement trigger to use order quantity
CREATE OR REPLACE FUNCTION public.decrement_item_quantity()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  remaining int;
BEGIN
  UPDATE public.items
    SET quantity = GREATEST(quantity - COALESCE(NEW.quantity, 1), 0),
        status = CASE WHEN quantity - COALESCE(NEW.quantity, 1) <= 0 THEN 'sold' ELSE status END
    WHERE id = NEW.item_id
    RETURNING quantity INTO remaining;
  RETURN NEW;
END;
$function$;

-- Ensure trigger exists
DROP TRIGGER IF EXISTS trg_decrement_item_quantity ON public.orders;
CREATE TRIGGER trg_decrement_item_quantity
AFTER INSERT ON public.orders
FOR EACH ROW EXECUTE FUNCTION public.decrement_item_quantity();

-- Add shipped_at timestamp for tracking
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS shipped_at timestamptz;

-- Allow sellers to update their orders (mark as shipped)
DROP POLICY IF EXISTS "Sellers can update their orders" ON public.orders;
CREATE POLICY "Sellers can update their orders"
ON public.orders
FOR UPDATE
USING (auth.uid() = seller_id);