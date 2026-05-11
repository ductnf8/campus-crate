-- Địa chỉ chi tiết (số nhà, đường, ngõ...) khi đăng bài
ALTER TABLE public.items ADD COLUMN IF NOT EXISTS address_detail text;
