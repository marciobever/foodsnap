-- Recria a função de RPC para o cadastro funcionar no Next.js
CREATE OR REPLACE FUNCTION public.register_user_profile(
    p_full_name TEXT,
    p_phone TEXT,
    p_email TEXT
)
RETURNS void AS $$
BEGIN
    UPDATE public.profiles
    SET full_name = p_full_name,
        phone = p_phone,
        email = p_email
    WHERE id = auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
