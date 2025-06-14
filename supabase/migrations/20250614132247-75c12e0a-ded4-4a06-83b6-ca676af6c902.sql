
ALTER TABLE public.profiles ADD COLUMN username TEXT UNIQUE;

-- If you'd like to enforce that wallet_address stays unique, make sure there's a unique constraint:
ALTER TABLE public.profiles ADD CONSTRAINT profiles_wallet_address_unique UNIQUE(wallet_address);

-- (Optional) To avoid NULL usernames in the future, you could run this after all users set their username:
-- ALTER TABLE public.profiles ALTER COLUMN username SET NOT NULL;
