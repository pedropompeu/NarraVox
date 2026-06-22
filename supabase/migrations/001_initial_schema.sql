-- NarraVox — Migration 001: schema inicial
-- Criado em: 2026-06-22
-- Aplica em: Supabase PostgreSQL
--
-- Como executar:
--   1. Supabase Dashboard → SQL Editor → colar e executar
--   2. Ou via CLI: supabase db push (se supabase CLI configurado)

-- =============================================================================
-- TABELA: profiles
-- Extensão de auth.users — criada automaticamente via trigger ao cadastrar.
-- Nunca insira rows diretamente: use o trigger abaixo.
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email       TEXT NOT NULL,
  premium     BOOLEAN NOT NULL DEFAULT FALSE,
  premium_at  TIMESTAMPTZ,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índice para busca por email (usado no painel admin)
CREATE INDEX IF NOT EXISTS profiles_email_idx ON public.profiles (email);

-- =============================================================================
-- RLS (Row Level Security)
-- Usuário autenticado só vê o próprio profile.
-- Service role (SUPABASE_SERVICE_ROLE_KEY) bypassa o RLS — usado na API TTS.
-- =============================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Usuário vê apenas o próprio profile
CREATE POLICY "Usuário vê próprio profile"
  ON public.profiles
  FOR SELECT
  USING (auth.uid() = id);

-- Usuário não pode alterar premium diretamente — apenas via service role (admin)
-- UPDATE e INSERT são bloqueados para anon/authenticated por default (sem policy = bloqueado)

-- =============================================================================
-- TRIGGER: criar profile ao registrar usuário
-- Dispara após INSERT em auth.users e cria a row correspondente em profiles.
-- =============================================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (NEW.id, NEW.email);
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- =============================================================================
-- GRANT: anon e authenticated podem SELECT em profiles (RLS filtra as rows)
-- =============================================================================

GRANT SELECT ON public.profiles TO anon, authenticated;
-- UPDATE via service role não precisa de GRANT explícito (service role bypassa tudo)
