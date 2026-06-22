# NarraVox — Supabase

## Estrutura

```
supabase/
  migrations/
    001_initial_schema.sql   # Tabela profiles + RLS + trigger de criação
  seeds/
    dev_seed.sql             # Seed comentado para dev (ativar premium manualmente)
```

## Aplicar migrations em novo projeto

### Via Dashboard (mais simples)

1. Abrir o projeto no [Supabase Dashboard](https://supabase.com/dashboard)
2. SQL Editor → New Query
3. Colar o conteúdo de `migrations/001_initial_schema.sql`
4. Executar

### Via CLI (requer `supabase` instalado)

```bash
supabase login
supabase link --project-ref <project-ref>
supabase db push
```

## Tabelas

### `profiles`

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `id` | `UUID PK` | Referencia `auth.users(id)` — apagado em cascata |
| `email` | `TEXT` | Email do usuário (duplicado de auth.users para consulta fácil) |
| `premium` | `BOOLEAN` | Acesso ao plano pago (default: false) |
| `premium_at` | `TIMESTAMPTZ` | Quando premium foi ativado (null se não premium) |
| `created_at` | `TIMESTAMPTZ` | Data de criação do profile |

**Criação automática:** o trigger `on_auth_user_created` cria o profile automaticamente quando um usuário se cadastra via Supabase Auth.

**RLS:** usuário autenticado pode SELECT apenas do próprio profile. UPDATE só via service role (painel admin via `SUPABASE_SERVICE_ROLE_KEY`).

## Ativar premium (admin)

```sql
-- Via SQL Editor no Dashboard
UPDATE public.profiles
  SET premium = TRUE, premium_at = NOW()
WHERE email = 'usuario@exemplo.com';
```

Ou via painel em `/admin` (requer email em `ADMIN_EMAILS`).

## Verificar setup

```bash
# Verificar se trigger existe
curl -X POST http://localhost:3001/api/tts \
  -H "Content-Type: application/json" \
  -d '{"text":"teste","voice":"pt-BR-FranciscaNeural"}'
# Deve retornar 200 com audio + timings
```
