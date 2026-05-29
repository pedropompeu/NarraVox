# NarraVox — Contexto de Criação do Projeto

**Data:** 2026-05-26
**Sessão:** /ideate
**Pasta na Holding:** `/home/usuario/Dev/Projetos_holding/Projeto-NarraVox-26-05-2026`

---

## PARTE 1 — Contexto Completo do Projeto

### 1. Visão do Produto

Profissionais e estudantes acumulam textos digitais que nunca conseguem ler por falta de tempo de atenção visual. NarraVox é um leitor TTS web onde o usuário cola qualquer texto e começa a ouvir em menos de 10 segundos, com destaque de palavra sincronizado ao áudio, controles de velocidade e seleção de voz — sem conta, sem instalação, sem custo inicial.

**Para quem:** Profissional ou estudante (22–40 anos) com backlog de leitura acumulado.

**Por que agora:** Vozes neurais baratearam (OpenAI TTS), o hábito de consumo de áudio cresceu 35% desde 2021, e o nicho de "TTS casual/pessoal" para texto avulso não tem player web dominante.

---

### 2. Usuário Primário

**Persona: "Leitor Sobrecarregado"**
- Profissional ou estudante, 22–40 anos
- Acumula artigos, threads copiadas, PDFs de cursos — raramente lê
- Hoje: salva textos no Notes, Pocket ou WhatsApp "para ler depois" — raramente volta
- O que muda: converte tempo passivo (trânsito, academia, tarefas domésticas) em consumo de conteúdo ativo
- Dor central: fadiga visual no fim do dia impede processar texto — áudio resolve

---

### 3. Proposta de Valor

Zero fricção de entrada (sem conta, sem install) + word-highlighting em tempo real = experiência de audiobook para qualquer texto avulso. O usuário vai de "texto no clipboard" para "ouvindo com palavra destacada" em menos de 10 segundos.

---

### 4. MVP — Escopo Mínimo

1. **Editor de texto** — paste/type com contador de palavras e estimativa de tempo de leitura
2. **Player TTS** — play/pause/stop/restart, velocidade (0.5x–2x), seleção de voz disponível no browser
3. **Word highlighting em tempo real** — destaque sincronizado ao áudio via `SpeechSynthesis.onboundary`
4. **Histórico local** — últimos 20 textos com título automático (primeiros 60 chars) e retomada de posição
5. **Barra de progresso clicável** — seek por posição de palavra no texto

---

### 4.5 Brand Direction (Pre-Brief)

```
brand_status: pendente
conceito_visual: "Onda Limpa — minimalista · focado · respirado"
referencia_marca: Linear + Notion
paleta: claro · acento frio (azul-slate #3B82F6) · fundo off-white #F9F8F6
direcao_voz: "direto · humano · sem frescura"
tagline_candidata: "Seu texto, sua voz."
palavras_banidas: ["revolucionário", "disruptivo", "poderoso"]
```

Execute `/brand` com `BRIEF_NarraVox.md` após aprovação do /discuss_clevel. O `BRAND.md` é pré-requisito para todas as tarefas de UI do Setor 2.

---

### 5. Métrica North Star

> **Textos ouvidos até ≥50% por semana por usuário ativo**

Proxy: sessões onde o player ultrapassou a metade do texto. Rastreado localmente via localStorage sem envio de dados no MVP.

---

### 6. Stack Tecnológica

| Camada | Escolha | Justificativa |
|--------|---------|---------------|
| Frontend | Next.js 14 + TypeScript | App Router, SSG para landing, ecossistema maduro |
| Estilo | TailwindCSS + shadcn/ui | Velocidade de UI sem design system do zero |
| TTS | Web Speech API | Zero custo, zero backend, disponível em todos os browsers modernos |
| Estado | Zustand | Leve, sem boilerplate para estado do player |
| Persistência | localStorage | Zero infra, zero custo, privacidade by design |
| Deploy | Vercel | CI/CD automático, free tier cobre MVP completo |

---

### 7. Arquitetura Inicial

**Padrão:** Monolito modular client-side (sem backend no MVP)

```
/app
  /page.tsx              → tela principal (editor + player)
  /history/page.tsx      → histórico de textos
  /layout.tsx
/components
  TextEditor.tsx         → área de texto com contador
  AudioPlayer.tsx        → controles de reprodução
  WordHighlighter.tsx    → renderiza texto com destaque da palavra atual
  HistoryPanel.tsx       → sidebar/drawer de histórico
/hooks
  useSpeech.ts           → abstração cross-browser do SpeechSynthesis
  useHistory.ts          → CRUD no localStorage
  usePlayer.ts           → estado e ações do player
/store
  playerStore.ts         → Zustand: currentWordIndex, speed, isPlaying, voice
/lib
  speechUtils.ts         → fallback onboundary para Firefox/Safari
  historyUtils.ts        → LRU de 20 itens, schema de HistoryItem
```

**Ponto crítico:** `speechUtils.ts` isola o comportamento inconsistente cross-browser de `SpeechSynthesis.onboundary`. Firefox e Safari têm suporte parcial — fallback por estimativa de tempo por palavra quando `onboundary` não disparar.

---

### 8. Modelo de Monetização

- **Free:** Web Speech API (vozes nativas do browser), histórico local ilimitado
- **Premium BRL 19,90/mês:** Vozes neurais OpenAI TTS (`tts-1-hd`), fila de textos, exportação MP3
- **Break-even:** 50 assinantes → BRL 995/mês
- **Ticket anual:** BRL 159/ano (33% desconto, reduz churn)

---

### 9. Canal de Validação Inicial

**Meta:** 50 emails de waitlist em 2 semanas antes de codar.

**Canais:**
- Landing page com formulário (Vercel + Resend para emails)
- Reddit: r/productivity, r/brasil, r/PTBR
- Twitter/X: vídeo de 30s demonstrando word-highlighting em texto real
- SEO: "ler texto em voz alta online grátis", "audiobook do meu texto"

---

### 10. Requisitos Mínimos de Compliance

1. Política de privacidade declarando processamento 100% local no browser
2. Aviso visível na UI: "Seus textos ficam salvos apenas neste dispositivo"
3. Botão "Limpar histórico" acessível e visível
4. No tier premium: termos de serviço com política de retenção (texto enviado para OpenAI TTS)

---

### 11. Riscos Assumidos Conscientemente

| Risco | Probabilidade | Mitigação |
|-------|-------------|-----------|
| `onboundary` inconsistente no Firefox/Safari | Alta | Fallback por estimativa de tempo por palavra |
| Vozes nativas fracas no Linux | Alta | Documentado na UI de seleção de voz |
| Conversão free→premium baixa | Média | Validar nos primeiros 90 dias; ajustar barreira se necessário |

---

### 12. Roadmap Sugerido

**Fase 1 — MVP (~4 dias dev)**
Editor + Player TTS + Word Highlighting + Histórico localStorage + Barra de progresso

**Fase 2 — Produto Completo (~3 semanas)**
Vozes neurais OpenAI TTS, autenticação Supabase, sync cloud, exportação MP3, fila de textos

**Fase 3 — Escala (TBD)**
API pública, extensão de browser (Chrome/Firefox), app mobile React Native, marketplace de vozes customizadas (ElevenLabs clones)

---

### 13. Discordâncias Registradas

- **💰 Financeiro** defendeu limitar histórico no free (5 textos) para forçar conversão — **rejeitado pelo PM** em favor de crescimento orgânico via viralidade irrestrita

---

### 14. Divisão de Responsabilidades

| Área | Agente Líder |
|------|-------------|
| Produto e UX | 🎯 PM + 🔍 UX Researcher |
| Arquitetura | 🏛️ Arquiteto Chefe |
| Frontend + TTS hook | 🖥️ Eng. Frontend |
| Deploy / CI | 🚀 Eng. DevOps |
| QA cross-browser | 🔨 Eng. QA |
| Vozes neurais (v1.1) | 🧠 Eng. IA/Prompt |
| Crescimento | 🚀 Growth |
| Brand | 🎨 ARIA + ECHO + NOVA |

---

## PARTE 2 — Prompt de Criação para o Claude Code

Cole este prompt em uma nova sessão do Claude Code **dentro da pasta do projeto** (`/home/usuario/Dev/Projetos_holding/Projeto-NarraVox-26-05-2026`):

---

```
Você está atuando como o time de desenvolvimento da Holding Creative Team no projeto NarraVox.

## Contexto do Projeto

**NarraVox** é um leitor TTS web que transforma qualquer texto colado em áudio com destaque de palavra em tempo real — sem conta, sem instalação, sem custo. Experiência de audiobook para texto avulso.

**Usuário primário:** Profissional/estudante (22–40 anos) com backlog de leitura. Dor: fadiga visual no fim do dia impede processar texto. Solução: ouvir em tempo passivo (trânsito, academia).

## Stack (fixo — não alterar sem ADR aprovado)

- **Frontend:** Next.js 14 + TypeScript (App Router)
- **Estilo:** TailwindCSS + shadcn/ui
- **TTS:** Web Speech API (SpeechSynthesis) — sem backend no MVP
- **Estado:** Zustand
- **Persistência:** localStorage
- **Schema HistoryItem:** { id, title, text, wordCount, createdAt, lastPosition }
- **Deploy:** Vercel

## Arquitetura Inicial

/app → rotas Next.js
/components → TextEditor, AudioPlayer, WordHighlighter, HistoryPanel
/hooks → useSpeech.ts (CRÍTICO: abstração cross-browser onboundary), useHistory.ts, usePlayer.ts
/store → playerStore.ts (Zustand)
/lib → speechUtils.ts (fallback Firefox/Safari), historyUtils.ts (LRU 20 itens)

**Ponto crítico:** SpeechSynthesis.onboundary tem suporte inconsistente em Firefox e Safari.
speechUtils.ts deve implementar fallback por estimativa de tempo por palavra quando onboundary não disparar.

## MVP — 5 Funcionalidades

1. Editor de texto (paste/type, contador de palavras, estimativa de tempo de leitura)
2. Player TTS (play/pause/stop/restart, velocidade 0.5x–2x, seleção de voz)
3. Word highlighting em tempo real (palavra atual destacada)
4. Histórico local (últimos 20 textos, retomada de posição)
5. Barra de progresso clicável (seek por índice de palavra)

## Compliance (obrigatório antes de qualquer usuário real)

- Texto processado 100% no browser (sem envio para servidor no tier free)
- Aviso na UI: "Seus textos ficam salvos apenas neste dispositivo"
- Botão "Limpar histórico" acessível

## Instrução

Execute /discuss_clevel sobre "implementação do MVP — priorização das 5 features e ordem de desenvolvimento" antes de escrever qualquer código.

Execute /brand com BRIEF_NarraVox.md após aprovação do c-level. O BRAND.md é pré-requisito para todas as tarefas de UI do Setor 2.
```
