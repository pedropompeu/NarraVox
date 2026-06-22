# Briefing — Próxima Sessão NarraVox
**Última atualização:** 2026-06-02

---

## Estado atual do projeto

O NarraVox está com o MVP completo + layouts aplicados. Para rodar:

```bash
cd /home/usuario/Dev/Projetos_holding/Projeto-NarraVox-26-05-2026
npm run dev
# Abre em http://localhost:3000
```

---

## O que já está pronto (não tocar sem motivo)

### Rotas e proteção
- `proxy.ts` — proteção de rotas (Next.js 16 usa `proxy.ts`, **não** `middleware.ts`)
  - `/admin` → exige auth + email em `ADMIN_EMAILS` env var
  - `/app` → exige auth
  - `/auth` → redireciona para `/app` se já logado; variante admin quando `?redirect=/admin`
- `app/auth/actions.ts` — pós-login: admin vai para `/admin`, usuário comum vai para `/app`; `signUp` aceita campo `name` (salvo como `user_metadata.display_name`)
- `.env.local` → `ADMIN_EMAILS=pedrolpompeu@gmail.com`

### Sistema de design — NarraVox Tátil
- `lib/designTokens.ts` — objeto `M` (paleta) + tiles SVG + objeto `surface` (linho/papel/madeira/latão/cerâmica/concreto)
- `app/globals.css` — CSS vars completas, dark mode `[data-theme="dark"]`, animações
- `brand/design-tokens.css` — referência canonical de tokens em 7 tiers

### Componentes Tátil (todos em `/components/`)
| Componente | Material | Uso |
|---|---|---|
| `ApplePlay` | Maçã | Botão play/pause principal |
| `WoodPlayer` | Madeira + vidro fosco | Shell do player |
| `LinenEditor` | Linho | Editor de texto |
| `GelReader` | Geleia azul | Leitor com word-highlighting |
| `BrassSeg` | Latão escovado | Controle de velocidade |
| `CeramicSelect` | Cerâmica | Seleção de voz |
| `ConcreteTrack` | Concreto + thumb dourado | Barra de progresso |
| `CardStackHistory` | Papel empilhado | Histórico de leituras |
| `AuthUI` | — | Primitivos compartilhados de auth (LinenInput, GlassBtn, LogoRow, PaperCard, PageShell, Feedback, AuthLogo) |

### Páginas e estado visual
| Rota | Estado do layout |
|---|---|
| `/` | ✅ Landing completa — hero escuro + seções linho/papel |
| `/app` | ✅ 5 estados: vazio, pronto, tocando, pausado, histórico |
| `/auth` | ✅ Novo layout — "Bem-vindo de volta" / "Crie sua conta", show/hide senha, variante admin |
| `/auth/reset` | ✅ Tátil — usa `AuthUI` |
| `/auth/reset/confirm` | ✅ Tátil — usa `AuthUI` |
| `/admin` | ✅ Novo layout — header sticky brass, stats cards, tabela com avatares, busca, botão Sair |
| `/privacidade` | ✅ Tátil via CSS vars |

### Bugs corrigidos em 2026-06-02
- `next.config.ts` — CSP `connect-src` agora inclui `*.supabase.co` (browser → Supabase)
- `app/api/tts/route.ts` — rate limit: duplicata checada antes de debitar cota diária
- `lib/supabase/server.ts` — `createAdminClient` usa import estático (não mais `require()`)

---

## O que fazer na próxima sessão

Nenhuma tarefa pendente herdada da sessão anterior. Possíveis próximos passos:

1. **Testes E2E do fluxo de auth** — login, signup, reset de senha com Supabase real
2. **Página de preços / upgrade Premium** — o `UpgradeModal` aponta para `/auth`; criar uma landing de planos
3. **Configurar `NEXT_PUBLIC_SITE_URL`** no `.env.local` (e produção) — necessário para magic links e reset de senha funcionarem com URL absoluta no Supabase
4. **Google OAuth** — o design (arquivos `brand/20-22`) prevê "Continuar com Google"; requer configuração no Supabase dashboard

---

## Regras que NÃO podem ser esquecidas

1. **Next.js 16 usa `proxy.ts`** (raiz do projeto), não `middleware.ts`. Se precisar de lógica de rota, editar `proxy.ts`.
2. **`ADMIN_EMAILS` é server-only** — nunca usar `NEXT_PUBLIC_ADMIN_EMAILS`.
3. **Commits são manuais** — nunca executar `git add`/`git commit` sem o usuário pedir.
4. **TTS usa `msedge-tts`** — pacote Node.js nativo, deve ficar em `serverExternalPackages` no `next.config.ts`. Não importar no bundle cliente.
5. **`AuthUI.tsx` é a fonte única** para primitivos de auth — nunca recriar `LinenInput`, `GlassBtn` etc. em páginas individuais.

---

## Decisões formais relevantes

| Data | Decisão | Log |
|------|---------|-----|
| 2026-05-26 | Implementação MVP + stack | `.claude/logs/decisions/2026-05-26-decide-implementacao-mvp-narravox.md` |
| 2026-05-27 | 5 correções críticas (TTS, hydration, fontes) | `.claude/logs/decisions/2026-05-27-decide-narravox-correcoes-criticas.md` |
| 2026-05-28 | Sprint MVP completo — 13 features, 2 tiers | `.claude/logs/decisions/2026-05-28-decide-narravox-sprint-mvp-completo.md` |
| 2026-05-29 | Auth Supabase + Landing + Admin (#26–#36) | `.claude/logs/decisions/2026-05-29-decide-narravox-auth-landing.md` |
| 2026-05-30 | Hierarquia de rotas + proteção admin + rebrand | `.claude/logs/decisions/2026-05-30-decide-narravox-hierarquia-rotas-rebrand.md` |
| 2026-06-02 | Bugs CSP/rate-limit/require; layouts /auth e /admin; extração AuthUI | (esta sessão) |

---

## Estrutura de arquivos relevante

```
/
├── proxy.ts                    ← proteção de rotas (Next.js 16)
├── app/
│   ├── layout.tsx              ← Fraunces + Inter, theme color
│   ├── globals.css             ← CSS vars Tátil + dark mode
│   ├── page.tsx                ← landing
│   ├── app/page.tsx            ← produto principal
│   ├── auth/
│   │   ├── page.tsx            ← ✅ novo layout (login + signup + variante admin)
│   │   ├── actions.ts          ← signIn/signUp(+name)/signOut/reset/updatePassword
│   │   └── reset/
│   │       ├── page.tsx        ← ✅ usa AuthUI
│   │       └── confirm/page.tsx ← ✅ usa AuthUI
│   └── admin/
│       ├── page.tsx            ← ✅ novo layout (painel tátil escuro)
│       └── actions.ts          ← togglePremium
├── components/
│   ├── AuthUI.tsx              ← primitivos compartilhados de auth ← NOVO
│   └── ...                     ← demais componentes Tátil
├── lib/
│   ├── designTokens.ts         ← fonte de verdade JS dos tokens
│   └── supabase/               ← client, server, middleware
├── brand/
│   ├── design-tokens.css       ← referência canonical CSS (v2.0)
│   ├── 20–24 *.html            ← layouts de referência (auth + admin login)
│   └── tailwind.config.ts
└── supabase/
    └── schema.sql              ← profiles + RLS
```
