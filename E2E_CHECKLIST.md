# NarraVox — Checklist E2E Manual (Sprint MVP)

> Executar no browser antes do deploy. Marque com ✅ (passou), ❌ (falhou) ou ⚠️ (parcial).
> Se falhar, anote o que aconteceu e abra uma sessão com Claude Code para resolver.
>
> **Última verificação automatizada:** 2026-06-22 · Servidor em localhost:3001

---

## Bloco 0 — Verificação de Infraestrutura (Automatizada — 2026-06-22)

> Verificado via servidor local + curl. Não requer browser.

- ✅ **0.1** TypeScript: zero erros (`npx tsc --noEmit`)
- ⚠️ **0.2** ESLint: **19 erros + 1603 warnings** — ver lista abaixo
- ✅ **0.3** Servidor Next.js 16 inicializa sem crash (`.next/dev/logs/` limpo)
- ✅ **0.4** `GET /` → HTTP 200 (landing page carrega)
- ✅ **0.5** `GET /privacidade` → HTTP 200
- ✅ **0.6** `GET /auth` → HTTP 200 (login page carrega)
- ✅ **0.7** `GET /app` → HTTP 307 redirect para `/auth?redirect=%2Fapp` (middleware auth funcionando)
- ✅ **0.8** `GET /admin` → HTTP 307 redirect para `/auth?redirect=%2Fadmin` (middleware admin funcionando)
- ✅ **0.9** `GET /api/tts` → HTTP 405 (Method Not Allowed — correto, só aceita POST)
- ✅ **0.10** `POST /api/tts` texto vazio → HTTP 400 com mensagem "text required"
- ✅ **0.11** `POST /api/tts` com "Olá mundo" → HTTP 200 com `audio` (base64) + `timings` [{word, offsetMs, durationMs}]
- ✅ **0.12** Rate limit duplicata (mesmo texto + voz, mesma sessão) → HTTP 429
- ✅ **0.13** `GET /manifest.json` → HTTP 200, JSON válido com `name`, `icons`, `start_url`, `theme_color`
- ✅ **0.14** `GET /sw.js` → HTTP 200 (service worker presente)
- ✅ **0.15** `GET /pdf.worker.min.mjs` → HTTP 200 (PDF.js worker acessível)
- ✅ **0.16** `.gitignore` cobre `.env*` (secrets não vão para o git)
- ✅ **0.17** CSP headers presentes: `Content-Security-Policy`, `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff` — configurado em `next.config.ts`

### ESLint — Erros (19 no total)

| ID | Arquivo | Linha | Regra | Impacto |
|----|---------|-------|-------|---------|
| E1 | `app/app/page.tsx` | 33 | `react-hooks/set-state-in-effect` | Risco de cascade render no `setMobile` |
| E2 | `app/app/page.tsx` | 455 | `react-hooks/exhaustive-deps` | `loop` ausente no dep array |
| E3 | `app/app/page.tsx` | 563, 686 | `@typescript-eslint/no-unused-expressions` | Expressões sem efeito |
| E4 | `components/PdfSectionIndex.tsx` | 19 | `react-hooks/set-state-in-effect` | `setSections([])` síncrono no effect |
| E5 | `components/SensitiveBanner.tsx` | 16 | `react-hooks/set-state-in-effect` | setState síncrono no effect |
| E6 | `app/privacidade/page.tsx` | 151 | `react/no-unescaped-entities` | Aspas não escapadas no JSX |
| E7 | `components/AnnotationPanel.tsx` | 163 | `react/no-unescaped-entities` | Aspas não escapadas no JSX |
| E8 | `app/app/page.tsx` | 31 (cols altas) | `@typescript-eslint/no-this-alias` | Falso positivo — pdfjs-dist bundled sendo lintado |

### ESLint — Warnings relevantes

- `components/CardStackHistory.tsx`: `_activeId` definido mas não usado
- `components/ConcreteTrack.tsx`: `M` importado mas não usado
- `components/LinenEditor.tsx`: `totalPdfPages` atribuído mas não usado

---

## Bloco 1 — Editor e TTS básico
- [ ] **1.1** Abrir http://localhost:3001 — tela carrega sem erro no console
- [ ] **1.2** Clicar "Carregar exemplo" — texto aparece, contador de palavras atualiza
- [ ] **1.3** Clicar Play — status muda para "Carregando áudio…" e depois "Tocando"
- [ ] **1.4** Word highlighting acompanha o áudio em tempo real
- [ ] **1.5** Pause → retoma do mesmo ponto
- [ ] **1.6** Clicar numa palavra no GelReader → pula para ela
- [ ] **1.7** Barra de progresso clicável → seek funciona
- [ ] **1.8** Stop → volta ao editor

## Bloco 2 — Velocidades e presets
- [ ] **2.1** Trocar velocidade com o áudio tocando — funciona sem travar
- [ ] **2.2** 0.75x presente entre 0.5x e 1x
- [ ] **2.3** Presets "Estudo / Normal / Revisão / Trânsito" aparecem e aplicam a velocidade
- [ ] **2.4** Velocidades Premium (2.5x / 3x / 3.5x) aparecem com cadeado

## Bloco 3 — Histórico e retomada
- [ ] **3.1** Após play, item aparece no histórico (botão "Histórico" no header)
- [ ] **3.2** Parar a leitura na metade, fechar histórico, abrir novamente — posição salva
- [ ] **3.3** Clicar no item do histórico → texto carrega e começa a tocar da posição salva
- [ ] **3.4** Velocidade é restaurada junto com a posição

## Bloco 4 — Upload de arquivo
- [ ] **4.1** Arrastar um `.txt` para a zona de drop → texto aparece no editor
- [ ] **4.2** Clicar na zona → abre seletor de arquivo → `.txt` carrega
- [ ] **4.3** Carregar um `.pdf` → navegador de páginas aparece (← Página X de Y →)
- [ ] **4.4** Navegar entre páginas → texto do editor atualiza
- [ ] **4.5** Dar play numa página do PDF → lê o texto daquela página
- [ ] **4.6** Aviso "processado localmente" visível sob a zona de drop

## Bloco 5 — Bookmarks e teleprompter
- [ ] **5.1** Com leitura ativa, clicar no botão marcador (☆) → ícone vira ★
- [ ] **5.2** No GelReader, marcador âmbar aparece acima da palavra marcada
- [ ] **5.3** Clicar no marcador no GelReader → salta para aquela palavra
- [ ] **5.4** Rolagem automática acompanha a palavra ativa (botão "Auto" visível)
- [ ] **5.5** Toggle "Manual" desativa a rolagem

## Bloco 6 — Dark mode e visibilidade
- [ ] **6.1** Botão lua/sol no header → tema escuro ativa
- [ ] **6.2** Recarregar a página → tema escuro persiste
- [ ] **6.3** Minimizar a aba com áudio tocando → pausa automaticamente
- [ ] **6.4** Voltar para a aba → player continua pausado (não retoma sozinho)

## Bloco 7 — Sleep Timer
- [ ] **7.1** Botão "Timer" visível no rodapé do player
- [ ] **7.2** Clicar em Timer → dropdown com 15/30/45/60 min
- [ ] **7.3** Selecionar 15 min → contagem regressiva aparece no botão
- [ ] **7.4** Botão × ao lado do tempo → cancela o timer

## Bloco 8 — Mobile (< 768px)
- [ ] **8.1** Redimensionar janela para < 768px — layout mobile ativa
- [ ] **8.2** Durante leitura → GelReader substitui o editor
- [ ] **8.3** Botão histórico abre bottom sheet
- [ ] **8.4** Todos os controles acessíveis sem scroll horizontal

## Bloco 9 — PWA
- [ ] **9.1** Chrome DevTools → Application → Manifest carregado sem erros
- [ ] **9.2** Service Worker registrado e ativo
- [ ] **9.3** Ícones 192 e 512 visíveis na aba Manifest

---

## Bloco 10 — Autenticação (Sprint 2)

- [ ] **10.1** Acessar `/auth` sem estar logado → página de login carrega com tabs "Entrar / Criar conta"
- [ ] **10.2** Criar conta com email/senha válidos → sucesso, redireciona para `/app`
- [ ] **10.3** Entrar com credenciais corretas → redireciona para `/app`
- [ ] **10.4** Entrar com senha errada → mensagem de erro visível, não trava a tela
- [ ] **10.5** Clicar "Esqueci a senha" → redireciona para `/auth/reset`
- [ ] **10.6** Acessar `/app` sem estar logado → redireciona para `/auth?redirect=%2Fapp`
- [ ] **10.7** Após login, acessar `/auth` → redireciona para `/app` (sem loop)
- [ ] **10.8** Logout via UserMenu → sessão encerrada, redireciona para `/`
- [ ] **10.9** Acessar `/admin` sem estar logado → redireciona para `/auth?redirect=%2Fadmin`

## Bloco 11 — Histórico na nuvem (Sprint 2)

- [ ] **11.1** Sem login: histórico salva no localStorage, visível após recarregar
- [ ] **11.2** Com login: histórico salva no Supabase + localStorage (verificar badge "sincronizado" se existir)
- [ ] **11.3** Fazer logout → histórico local ainda visível (não apaga)
- [ ] **11.4** Fazer login em outro browser → histórico da nuvem aparece (se sincronização cloud ativa)
- [ ] **11.5** UserMenu mostra email do usuário logado

## Bloco 12 — Premium e UpgradeModal (Sprint 2)

- [ ] **12.1** Usuário free: velocidades 2.5x / 3x / 3.5x aparecem com ícone de cadeado
- [ ] **12.2** Usuário free: tentar usar velocidade bloqueada → UpgradeModal aparece
- [ ] **12.3** Usuário free: atingir rate limit (mesmo texto 2× na mesma sessão) → mensagem "Este trecho já foi processado nas últimas 24 horas"
- [ ] **12.4** Usuário free: atingir cota diária (120 chunks) → mensagem "Limite diário atingido" + UpgradeModal
- [ ] **12.5** Usuário Premium: sem bloqueio de velocidade, sem rate limit de duplicata
- [ ] **12.6** UpgradeModal tem botão de fechar e não bloqueia toda a tela

## Bloco 13 — Anotações por trecho (Sprint 2)

- [ ] **13.1** Com leitura ativa, botão "Anotar" visível na interface
- [ ] **13.2** Clicar "Anotar" enquanto tocando → pausa o áudio, abre input inline
- [ ] **13.3** Digitar nota e pressionar Enter → anotação salva, input fecha
- [ ] **13.4** Digitar nota e clicar "Salvar" → mesmo comportamento que Enter
- [ ] **13.5** Pressionar Escape → cancela sem salvar
- [ ] **13.6** Input vazio + Salvar → não cria anotação (validação)
- [ ] **13.7** Anotação salva aparece com trecho de contexto ("…palavra…") e data relativa
- [ ] **13.8** Clicar "Ir" na anotação → seek para a palavra anotada
- [ ] **13.9** Clicar "×" na anotação → remove da lista
- [ ] **13.10** Botão "Exportar" com usuário free → aparece desabilitado (cursor not-allowed, opacity 0.5)
- [ ] **13.11** Botão "Exportar" com usuário Premium → funciona e baixa .txt

## Bloco 14 — Streaks e meta semanal (Sprint 2)

- [ ] **14.1** Badge de streak visível no header com ícone (🔥 se streak > 0, ○ se 0)
- [ ] **14.2** Mini barra de progresso do dia visível no badge
- [ ] **14.3** Clicar no badge → abre dropdown com streak em dias, calendário semanal, opções de meta
- [ ] **14.4** Calendário semanal mostra 7 dias (D S T Q Q S S) com status de cada dia
- [ ] **14.5** Dia com meta atingida → círculo verde com ✓
- [ ] **14.6** Dia com progresso parcial → círculo azul claro
- [ ] **14.7** Dia sem progresso → círculo cinza
- [ ] **14.8** Opções de meta: 15 / 20 / 30 / 45 / 60 min — meta atual destacada
- [ ] **14.9** Clicar numa opção de meta → salva e fecha dropdown

## Bloco 15 — Pausa periódica de estudo (Sprint 2)

- [ ] **15.1** Botão "Pausas" visível nos controles do player
- [ ] **15.2** Clicar "Pausas" → dropdown com opções: "5 minutos / 10 minutos / 15 minutos"
- [ ] **15.3** Selecionar opção → botão muda para "/Xmin" com × e fica verde
- [ ] **15.4** Após X minutos de leitura contínua → áudio pausa automaticamente
- [ ] **15.5** Banner "📚 Pausa de estudo" aparece na parte inferior da tela
- [ ] **15.6** Clicar "OK" no banner → banner fecha
- [ ] **15.7** Clicar × no botão "Pausas" ativo → desativa o modo, botão volta ao normal

## Bloco 16 — Repetição de trecho em loop (Sprint 2)

- [ ] **16.1** Interface de seleção de loop acessível durante leitura
- [ ] **16.2** Ativar loop → cursor muda para modo de seleção (fase "selecting-start")
- [ ] **16.3** Clicar numa palavra → define o início do trecho (fase "selecting-end")
- [ ] **16.4** Clicar numa segunda palavra → define o fim, loop ativa (fase "active")
- [ ] **16.5** Seleção inversa funciona (clicar fim antes do início → ordena corretamente)
- [ ] **16.6** Com loop ativo, áudio chega ao fim do trecho → volta automaticamente ao início
- [ ] **16.7** Cancelar loop → volta à leitura normal

## Bloco 17 — Compartilhamento de trecho (Sprint 2)

- [ ] **17.1** Botão "Compartilhar trecho" aparece quando há leitura ativa (wordIndex ≥ 0)
- [ ] **17.2** Botão não aparece sem texto carregado
- [ ] **17.3** No mobile (com navigator.share): clicar → abre sheet nativa de compartilhamento
- [ ] **17.4** No desktop (sem navigator.share): clicar → copia para clipboard, botão vira "Copiado!" por 2s
- [ ] **17.5** Texto copiado inclui o trecho (até 20 palavras ao redor) + "— NarraVox · posição X de Y"
- [ ] **17.6** Trecho com "…" quando há palavras antes/depois do contexto

## Bloco 18 — Índice de seções PDF (Sprint 3)

- [ ] **18.1** Carregar PDF com múltiplas seções (headings) → painel de índice aparece
- [ ] **18.2** Índice lista as seções detectadas com número de página
- [ ] **18.3** Clicar numa seção → navega para aquela página do PDF
- [ ] **18.4** PDF sem headings detectáveis → painel de índice não aparece (ou mostra "Sem seções")

## Bloco 19 — Detector de texto sensível (Sprint 3)

- [ ] **19.1** Colar texto contendo CPF (ex: "123.456.789-09") → banner de aviso aparece após ~600ms
- [ ] **19.2** Banner identifica o tipo de dado ("CPF", "dados de saúde", etc.)
- [ ] **19.3** Banner tem link para /privacidade
- [ ] **19.4** Clicar × no banner → dispensa sem limpar o texto
- [ ] **19.5** Trocar para texto sem dados sensíveis → banner desaparece
- [ ] **19.6** Banner avisa que "no modo neural, o texto é enviado à Microsoft Edge TTS"

---

## Como registrar falhas

Ao encontrar um problema, anote:
```
[FALHOU] 4.3 — PDF não exibe navegador de páginas.
Comportamento: clicar "Carregar" com PDF abre o texto mas sem ← →.
Browser: Chrome 124 / macOS
```

Depois abra o Claude Code na pasta do projeto e descreva o problema.
