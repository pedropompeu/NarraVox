-- NarraVox — Seed de desenvolvimento
-- NUNCA executar em produção.
--
-- Pré-requisito: criar os usuários manualmente via Supabase Auth
-- (o trigger handle_new_user cria os profiles automaticamente após o cadastro)
--
-- Para testar premium no dev:
--   1. Criar conta em http://localhost:3001/auth
--   2. Copiar o UUID do usuário do Supabase Dashboard → Authentication → Users
--   3. Substituir o UUID abaixo e executar

-- Ativar premium para usuário de teste (substituir UUID)
-- UPDATE public.profiles
--   SET premium = TRUE, premium_at = NOW()
-- WHERE id = 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx';

-- Para verificar o estado atual dos profiles em dev:
-- SELECT id, email, premium, premium_at, created_at FROM public.profiles ORDER BY created_at DESC;
