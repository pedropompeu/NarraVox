# ADR-001 — Stack e Arquitetura do MVP NarraVox

**Status:** Parcialmente superado
**Data:** 2026-05-26
**Aprovado por:** Comitê de Arquitetura (Arquiteto Chefe + Arq. Software + Arq. Cloud + Arq. Dados)
**Contexto:** /discuss_comite — stack e arquitetura do MVP NarraVox
**Nota:** Seção 3 (estratégia TTS) e restrições de custo/privacidade foram substituídas pelo ADR-002 (2026-05-26). Demais seções permanecem válidas.

---

## Contexto

NarraVox é um leitor TTS web com word-highlighting em tempo real. MVP 100% client-side: sem backend, sem autenticação, sem banco de dados remoto. A decisão mais crítica é a abstração da Web Speech API, cujo comportamento cross-browser é inconsistente e afeta diretamente o diferencial central do produto (word-highlighting sincronizado).

**Restrições não-funcionais:**
- Zero custo de infra no MVP
- Privacidade by design: nenhum dado de texto enviado a servidor
- WCAG AA (acessibilidade)
- Funcional em Chrome, Firefox e Safari (iOS + macOS)

---

## Decisão

### 1. Framework: Next.js 14 com App Router

`"use client"` aplicado no `layout.tsx` raiz — toda a aplicação opera como SPA client-side. Não há RSC no MVP. A escolha do App Router é feita por alinhamento com o ecossistema Vercel (CI/CD first-class) e preparação para Route Handlers da v1.1 (proxy TTS premium).

### 2. Organização de módulos com contratos explícitos

```
/app
  layout.tsx          ← "use client" aqui — toda a árvore é client
  page.tsx            ← composição da tela principal
  /history/page.tsx   ← tela de histórico

/components           ← componentes puros (sem hooks de negócio)
  TextEditor.tsx      ← props: value, onChange, wordCount, readingTime
  WordHighlighter.tsx ← props: words[], currentWordIndex, onWordClick?
  AudioPlayer.tsx     ← props: state, onPlay, onPause, onSeek, onSpeedChange, onVoiceChange
  HistoryPanel.tsx    ← props: items[], onSelect, onDelete, onClear

/hooks                ← lógica de negócio e side effects
  usePlayer.ts        ← orquestra useSpeech + useHistory; expõe API unificada para a página
  useSpeech.ts        ← abstração da Web Speech API; consume speechUtils internamente
  useHistory.ts       ← CRUD no localStorage; consume historyUtils

/lib                  ← utilitários puros (sem React, sem Web APIs)
  speechUtils.ts      ← detecção de estratégia (boundary vs timer) + charIndex→wordIndex
  historyUtils.ts     ← schema, LRU, serialização, migração de versão
  estimateReadingTime.ts ← cálculo de WPM

/store
  playerStore.ts      ← Zustand: isPlaying, speed, selectedVoice, currentWordIndex
```

**Regra de dependência (estrita):**
- `/components` nunca importam de `/hooks` ou `/store`
- `/hooks` importam de `/lib` e `/store` — nunca entre si (exceto `usePlayer`)
- `/lib` não tem dependências externas além de TypeScript

### 3. Estratégia de abstração TTS — detecção dinâmica de `onboundary`

Estratégia `boundary` (Chrome): usa `SpeechSynthesisUtterance.onboundary` com `charIndex`.
Estratégia `timer` (Firefox/Safari fallback): estima posição por velocidade de leitura (13 chars/s base × speed).

Detecção: se `onboundary` não disparar dentro de 500ms após início da fala → alterna para `timer`. Detectado uma vez por sessão (persiste em `sessionStorage`).

Critério de aceite do spike (Task #8):
- Chrome: ≥ 90% de palavras corretamente destacadas
- Firefox: ≥ 75% com fallback ativo
- Abaixo do threshold: acionar /discuss_comite imediatamente

### 4. Schema de localStorage com versionamento

```typescript
export const SCHEMA_VERSION = 1
export const MAX_HISTORY_ITEMS = 20
export const MAX_TEXT_CHARS = 100_000

export interface HistoryItem {
  id: string
  schemaVersion: number  // para migração futura para Supabase
  title: string          // primeiros 60 chars (sem truncar palavras)
  text: string
  wordCount: number
  createdAt: string      // ISO 8601
  lastPosition: number   // índice no array de palavras (não charIndex)
}
```

`lastPosition` é sempre índice de palavra (não `charIndex`) — determinístico cross-browser.

---

## Alternativas Descartadas

| Alternativa | Por que foi descartada |
|-------------|------------------------|
| Pages Router | Ecossistema Vercel prioriza App Router; Route Handlers para v1.1 seriam reescritos |
| Context API em vez de Zustand | Verboso para estado de player; Zustand é 600 bytes, sem boilerplate |
| Detecção por User Agent | Frágil a atualizações; testa suposição, não comportamento real |
| `charIndex` como `lastPosition` | Não-determinístico cross-browser |
| localStorage sem versionamento | Impossibilita migração para Supabase na v1.1 |
| Componentes com hooks acoplados | Impossibilita teste unitário sem mocks de Web API |

---

## Consequências

**Positivas:**
- Componentes puros testáveis com Vitest sem mock de Web API
- speechUtils.ts encapsula todo comportamento cross-browser
- Schema versionado permite migração controlada na v1.1
- App Router + Vercel: CI/CD automático, preview URLs, zero config

**Trade-offs aceitos:**
- `"use client"` global anula RSC (revisitar em v1.1 para landing page SEO)
- Timer fallback: precisão ±200ms em textos sem pontuação
- MAX_TEXT_CHARS = 100_000: textos maiores não são salvos integralmente no histórico

**Débito técnico formal:**
- Timer desincroniza em textos com pausas longas (pontuação) — refinamento v1.1
- `"use client"` global: revisitar quando landing page precisar de SEO/RSC

---

## Critérios de Revisão

- Spike Task #8 revelar degradação > 25% no Firefox → /discuss_comite imediato
- v1.1 introduzir Route Handlers → revisar estratégia "use client" global
- localStorage atingir 80% do limite em testes → revisar MAX_TEXT_CHARS
