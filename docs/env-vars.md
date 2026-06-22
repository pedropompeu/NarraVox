# NarraVox — Variáveis de Ambiente

**Auditado em:** 2026-06-22

---

## Resumo

| Variável | Ambiente | Obrigatória | Secret |
|----------|----------|-------------|--------|
| `NEXT_PUBLIC_SUPABASE_URL` | produção + dev | ✅ sim | ❌ não (pública) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | produção + dev | ✅ sim | ❌ não (pública) |
| `SUPABASE_SERVICE_ROLE_KEY` | produção + dev | ✅ sim | ✅ **SECRET** |
| `ADMIN_EMAILS` | produção + dev | ⚠️ recomendado | ❌ não |
| `NEXT_PUBLIC_SITE_URL` | produção | ⚠️ recomendado | ❌ não |

---

## Detalhes

### `NEXT_PUBLIC_SUPABASE_URL`
- **Tipo:** URL pública (exposta ao browser)
- **Usada em:** `lib/supabase/client.ts:5`, `lib/supabase/middleware.ts:8`, `lib/supabase/server.ts:8`, `app/api/tts/route.ts:169`
- **Como obter:** Painel Supabase → Settings → API → Project URL
- **Exemplo:** `https://xxxxxxxxxxxxxxxx.supabase.co`
- **Ausente:** app não consegue autenticar nem verificar premium → TTS nega todos os usuários premium

### `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- **Tipo:** Chave pública (exposta ao browser — projetada para ser pública)
- **Usada em:** `lib/supabase/client.ts:6`, `lib/supabase/middleware.ts:9`, `lib/supabase/server.ts:9`
- **Como obter:** Painel Supabase → Settings → API → `anon` `public`
- **Ausente:** autenticação do lado cliente não funciona, middleware de sessão quebra

### `SUPABASE_SERVICE_ROLE_KEY` ⚠️ SECRET
- **Tipo:** Chave server-only — **NUNCA expor ao browser, nunca commitar**
- **Usada em:** `app/api/tts/route.ts:170` (verificação de premium), `lib/supabase/server.ts:23` (operações admin)
- **Como obter:** Painel Supabase → Settings → API → `service_role` `secret`
- **Ausente:** verificação de premium falha silenciosamente → todos tratados como free
- **Risco:** se vazar, permite acesso total ao banco sem RLS

### `ADMIN_EMAILS`
- **Tipo:** Lista separada por vírgula de emails de administradores
- **Usada em:** `app/auth/actions.ts:21` — controla quem pode acessar `/admin`
- **Exemplo:** `admin@example.com,outro@example.com`
- **Ausente:** ninguém consegue logar no painel admin (string vazia → split resulta em array com `""`)
- **Recomendado:** sempre definir em produção mesmo com um único email

### `NEXT_PUBLIC_SITE_URL`
- **Tipo:** URL base do site em produção (exposta ao browser)
- **Usada em:** `app/auth/actions.ts:50, 68` — link de confirmação de email e reset de senha
- **Exemplo:** `https://narravox.vercel.app`
- **Ausente:** link de confirmação de email e reset de senha ficam com URL vazia (`/app`, `/auth/reset/confirm`) — funciona localmente, quebra em produção quando o email é enviado

---

## Arquivo `.env.local`

- Presente: ✅ sim (`/home/usuario/Dev/Projetos_holding/Projeto-NarraVox-26-05-2026/.env.local`)
- Coberto pelo `.gitignore`: ✅ sim (padrão `.env*`)
- Não há `.env.example` no repositório: ⚠️ recomendado criar

---

## Checklist para novo ambiente (Vercel / outro dev)

```
[ ] Criar projeto no Supabase
[ ] Copiar Project URL → NEXT_PUBLIC_SUPABASE_URL
[ ] Copiar anon key → NEXT_PUBLIC_SUPABASE_ANON_KEY
[ ] Copiar service_role key → SUPABASE_SERVICE_ROLE_KEY (nunca no código)
[ ] Definir ADMIN_EMAILS com email(s) de admin
[ ] Em produção: definir NEXT_PUBLIC_SITE_URL com URL do deploy
[ ] Executar migrations SQL (docs/supabase-schema.md — a criar)
[ ] Verificar: POST /api/tts retorna 200 com texto de teste
[ ] Verificar: login com usuário de teste funciona
```

---

## .env.example (criar na raiz do projeto)

```bash
# Supabase — obter em: https://app.supabase.com → Settings → API
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# NUNCA commitar o valor real — obter em Supabase → Settings → API → service_role
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Emails separados por vírgula com acesso ao painel /admin
ADMIN_EMAILS=seu@email.com

# URL base do site (necessário para links de email em produção)
# Em desenvolvimento: deixar vazio ou http://localhost:3001
NEXT_PUBLIC_SITE_URL=https://narravox.vercel.app
```
