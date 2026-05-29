# ADR-002 — Pivotagem para Edge TTS Neural e Arquitetura Híbrida por Tier

**Status:** Aceito
**Data:** 2026-05-26
**Aprovado por:** PM + Arquiteto Chefe (via /discuss → /decide em sessão de retomada)
**Substitui parcialmente:** ADR-001 (seções 3 e restrições não-funcionais de custo/privacidade)

---

## Contexto

Durante a implementação do MVP, o time pivotou a estratégia de síntese de voz antes de um `/discuss_comite` formal. O `useSpeech.ts` foi reescrito para consumir uma rota de API `/api/tts` que usa a biblioteca `msedge-tts` (acesso à infraestrutura de Text-to-Speech da Microsoft, a mesma usada pelo recurso "Ler em voz alta" do navegador Edge) em vez da `Web Speech API` prevista no ADR-001.

A pivot foi descoberta na sessão de retomada do projeto (2026-05-26) por divergência entre o código entregue e o ADR-001. A decisão foi **manter e formalizar a pivot**, não revertê-la, dada a superioridade técnica demonstrada.

**Restrições do ADR-001 violadas:**
- "Zero custo de infra no MVP" → o MVP agora tem um Route Handler de servidor (gratuito no free tier da Vercel, mas há dependência de servidor)
- "Privacidade by design: nenhum dado de texto enviado a servidor" → o texto trafega para `/api/tts` e para os servidores Microsoft

---

## Decisão

### 1. Motor TTS: `msedge-tts` via Route Handler `/api/tts`

A rota `app/api/tts/route.ts` recebe `{ text, voice }` via POST e retorna `{ audio: string (base64 MP3), timings: WordTiming[] }`.

A biblioteca `msedge-tts` acessa a infraestrutura Microsoft Edge TTS sem chave de API. É a mesma tecnologia que o Microsoft Edge usa nativamente para leitura em voz alta — gratuita, sem faturamento por caractere.

**Vozes disponíveis (pt-BR):**

| ID | Nome | Gênero |
|----|------|--------|
| `pt-BR-FranciscaNeural` | Francisca | Feminino |
| `pt-BR-AntonioNeural` | Antonio | Masculino |
| `pt-BR-ThalitaNeural` | Thalita | Feminino |

**Vantagens sobre a Web Speech API:**
- Qualidade de voz neural significativamente superior às vozes nativas do sistema operacional (especialmente no Linux, onde vozes nativas são precárias)
- Word timings precisos via `WordBoundary` events (`offsetMs` em vez de `charIndex` aproximado)
- Comportamento consistente cross-browser — elimina o problema de `onboundary` inconsistente que gerou toda a lógica de fallback do `speechUtils.ts`

### 2. Arquitetura de reprodução: chunked audio com prefetch

O `useSpeech.ts` divide textos longos em chunks de 400 palavras e inicia o prefetch do chunk seguinte enquanto o atual toca, eliminando pausas entre segmentos.

```
texto → chunks[400 palavras] → fetchChunk(i) → Audio() → timeupdate → wordIndex
                                              ↗ prefetch(i+1) simultâneo
```

Word highlighting: `wordIndexFromTimings(timings, currentMs)` via busca binária nos `offsetMs` — precisão ±10ms.

### 3. Arquitetura híbrida por tier (direção futura)

O estado atual do `useSpeech.ts` usa apenas Edge TTS (neural). A arquitetura target — a ser implementada na Task #4 — é:

```
mode: "browser"  → speechUtils.ts + Web Speech API  (free, offline, zero servidor)
mode: "neural"   → /api/tts + msedge-tts            (premium, requer conexão)
```

**`usePlayer.ts`** passa o `mode` baseado no tier do usuário. No MVP, todos os usuários operam em `"neural"` até a separação de tiers ser implementada.

### 4. `speechUtils.ts` — preservado, não removido

O `speechUtils.ts` (motor Web Speech API com fallback `onboundary`) não foi deletado. Será reutilizado como motor do `mode: "browser"` na arquitetura híbrida. Enquanto o tier híbrido não estiver implementado, é dead code — tolerado conscientemente.

---

## Alternativas Consideradas

| Alternativa | Por que foi descartada |
|-------------|------------------------|
| Reverter para Web Speech API | Qualidade de voz muito inferior; custo zero, mas experiência degradada — especialmente Linux |
| Azure Cognitive Services (oficial) | USD 16/1M chars — custo real que inviabiliza free tier; sem vantagem sobre `msedge-tts` |
| OpenAI TTS (`tts-1-hd`) | Excelente qualidade, mas com custo USD 15/1M chars e dependência de API key — reservado para v1.1 premium |
| ElevenLabs | Alto custo, sem tier gratuito viável para MVP |
| Manter pivot sem formalizar ADR | Gera débito de governança acumulado — recusado pelo Arquiteto |

---

## Consequências

**Positivas:**
- Word highlighting com precisão de ±10ms — superior ao fallback timer (±200ms) do ADR-001
- Comportamento uniforme em Chrome, Firefox, Safari e Linux sem código de detecção de browser
- Zero custo de API (gratuito pela natureza da biblioteca) — mantém o espírito de "zero custo" do ADR-001
- Chunking com prefetch: textos longos sem pausa entre segmentos

**Trade-offs assumidos:**
- Texto trafega para servidores externos (nosso servidor Vercel + Microsoft Edge TTS) — política de privacidade atualizada (ver Task #2 / `app/privacidade/page.tsx`)
- App offline não funciona no modo neural — aceitável para o público-alvo (usuário de desktop/mobile com conexão)
- Dependência de API não-oficial: Microsoft pode modificar ou bloquear o endpoint sem aviso. Mitigação: a separação de tiers (Task #4) garante que o modo `browser` serve como fallback se Edge TTS for bloqueado

**Débito técnico formal:**
- `speechUtils.ts` é dead code até Task #4 ser implementada
- `useSpeech.ts` atual não implementa `mode: "browser"` — monolítico em neural
- Rate limit em `/api/tts` não implementado (Task #5) — não fazer deploy público antes de concluir

---

## Critérios de Revisão

- Task #4 concluída → ADR-002 atualizado para refletir arquitetura híbrida implementada
- Microsoft bloquear endpoint `msedge-tts` → acionar `/discuss_comite` para avaliar alternativas (OpenAI TTS, ElevenLabs, Kokoro local)
- Latência p95 do `/api/tts` > 2s → `/discuss_comite` para avaliar streaming progressivo ou cache de chunks
