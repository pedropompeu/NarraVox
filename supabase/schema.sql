-- NarraVox — Schema inicial
-- Rodar no Supabase SQL Editor: https://supabase.com/dashboard/project/eubaiftmsucbukjjzpkq/sql

-- ── Tabela de perfis ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.profiles (
  id          uuid REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email       text NOT NULL,
  premium     boolean NOT NULL DEFAULT false,
  premium_at  timestamptz,
  created_at  timestamptz NOT NULL DEFAULT now()
);

-- ── Row Level Security ────────────────────────────────────────────────────────
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Usuário lê apenas o próprio perfil
CREATE POLICY "Usuário lê próprio perfil"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

-- Usuário atualiza apenas o próprio perfil (exceto premium — só service_role)
CREATE POLICY "Usuário atualiza próprio perfil"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id AND premium = (SELECT premium FROM public.profiles WHERE id = auth.uid()));

-- ── Trigger: cria perfil automaticamente ao cadastrar ────────────────────────
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (new.id, new.email);
  RETURN new;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
