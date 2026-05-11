
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS bio text;

ALTER TABLE public.items ADD COLUMN IF NOT EXISTS district text;
ALTER TABLE public.items ADD COLUMN IF NOT EXISTS ward text;
