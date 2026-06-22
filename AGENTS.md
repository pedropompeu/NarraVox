<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Convenções deste projeto

- **Proteção de rotas:** Next.js 16 usa `proxy.ts` na raiz, **não** `middleware.ts`. Toda lógica de guarda de rotas vive em `proxy.ts`. Nunca criar `middleware.ts`.
- **Admin:** acesso exclusivo via env var `ADMIN_EMAILS` (server-only, sem prefixo `NEXT_PUBLIC_`). Sem UI de criação de admin.
- **TTS:** `msedge-tts` é pacote Node.js nativo — listado em `serverExternalPackages` no `next.config.ts`. Nunca importar no bundle cliente.
- **Commits:** nunca executar `git add`/`git commit` sem o usuário pedir explicitamente.
- **Briefing completo da sessão atual:** ver `PROXIMA-SESSAO.md` na raiz do projeto.
