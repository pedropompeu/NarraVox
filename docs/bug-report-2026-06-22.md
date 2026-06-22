# NarraVox — Bug Report (Análise Estática)

**Data:** 2026-06-22
**Método:** revisão estática de código + verificação de infraestrutura (sem execução de UI)
**Gerado por:** /discuss_setor 2 — Sprint QA NarraVox

---

## Legenda de severidade

| Nível | Critério |
|-------|----------|
| 🔴 CRÍTICO | Impacto direto no usuário ou risco legal — corrigir antes do próximo deploy |
| 🟠 ALTO | Degrada experiência ou cria estado inconsistente visível |
| 🟡 MÉDIO | Risco latente, não imediatamente perceptível |
| 🔵 BAIXO | Technical debt ou otimização — backlog |

---

## 🔴 CRÍTICOS

### B-001 — Política de Privacidade desatualizada com informação falsa

**Arquivo:** `app/privacidade/page.tsx:91`
**Regra:** compliance / LGPD

**Comportamento atual:**
```
"O NarraVox não cria cadastros nem exige login."
```

**Problema:** O app possui sistema completo de cadastro via Supabase (`app/auth/page.tsx`), histórico sincronizado na nuvem (`useUser.ts` + `lib/supabase/`), e painel administrativo (`app/admin/`). A afirmação é factualmente incorreta.

**Impacto:** Usuário não tem ciência de que seus dados de conta são armazenados em servidor (Supabase). Risco de não-conformidade com LGPD Art. 9 (informação sobre dados coletados).

**Correção esperada:** Texto deve mencionar que o login é opcional mas disponível, que ao criar conta o email e preferências ficam armazenados no Supabase, e que o histórico pode ser sincronizado na nuvem quando logado.

---

### B-002 — Resume neural com blob URL expirado causa estado inconsistente

**Arquivo:** `hooks/useSpeech.ts:275–280`
**Regra:** lógica de estado

**Código problemático:**
```typescript
const resumeNeural = () => {
  audioRef.current?.play().catch(console.error); // ← erro silenciado
  store.setStatus("playing");                    // ← status seta antes de confirmar play
};
```

**Problema:** Se o blob URL expirou (aba em background por período prolongado, ou GC de memória), `play()` rejeita silenciosamente. O status fica `"playing"` mas nenhum áudio toca. O usuário vê o player em estado "tocando" sem som — estado inconsistente, sem caminho de recuperação exceto recarregar.

**Reproduzir:** Iniciar leitura → pausar → deixar aba em background por > 5–10 min → retornar → clicar Resume.

**Correção esperada:** Awaitar `play()`, capturar erro → limpar para `"idle"` + exibir mensagem "Retome a leitura do início".

---

## 🟠 ALTOS

### B-003 — Erro 502 do Edge TTS causa falha silenciosa (sem feedback ao usuário)

**Arquivo:** `hooks/useSpeech.ts:186–193` e `247–250`
**Regra:** UX / tratamento de erro

**Código problemático:**
```typescript
// Na carga do primeiro chunk (linha 186–193):
} catch (e) {
  if (gen === generationRef.current) {
    store.setStatus("idle");  // ← silencioso, sem mensagem
    const err = e as { status?: number; premiumRequired?: boolean };
    if (err.status === 429) {
      store.setRateLimitReason(err.premiumRequired ? "daily_quota" : "duplicate");
    }
    // status 502, 503, timeout → nenhuma ação além de idle
  }
  return;
}

// Na carga de chunks subsequentes (linha 247–250):
} catch {
  if (gen === generationRef.current) store.setStatus("idle");
  return;
}
```

**Problema:** Quando o Edge TTS retorna 502 (serviço temporariamente indisponível), o player volta para `idle` sem nenhuma mensagem ao usuário. Experiência: clica Play → carregando → silêncio, volta para o estado inicial sem explicação.

**Impacto:** Usuário tenta novamente repetidamente sem saber que o problema é externo (Edge TTS). Potencialmente consome rate limit.

**Correção esperada:** `store.setError("Voz neural temporariamente indisponível. Tente o modo navegador.")` para erros não-429.

---

### B-004 — Auth page não redireciona usuário já autenticado

**Arquivo:** `app/auth/page.tsx`
**Regra:** UX / fluxo de autenticação

**Problema:** A página `/auth` não verifica se o usuário já está logado. Um usuário autenticado que acessa `/auth` diretamente (por URL salvo, histórico do browser) fica na tela de login sem indicação de que já tem sessão ativa. O middleware protege `/app` e `/admin`, mas não redireciona `/auth` para `/app` quando logado.

**Reproduzir:** Fazer login → salvar URL `/auth` nos favoritos → abrir → tela de login aparece para usuário já logado.

**Correção esperada:** Verificar sessão no load da página `/auth` e redirecionar para `/app` se autenticado.

---

### B-005 — ESLint: setState síncrono dentro de useEffect (risco de cascade renders)

**Arquivos e linhas:**
- `app/app/page.tsx:33` — `setMobile(mq.matches)` síncrono no body do effect
- `components/PdfSectionIndex.tsx:19` — `setSections([])` síncrono no guard do effect
- `components/SensitiveBanner.tsx:16` — `setDismissed(false)` síncrono no body do effect

**Regra:** `react-hooks/set-state-in-effect`

**Problema:** Chamar `setState` sincronicamente no corpo de um `useEffect` pode causar renders em cascata no React 18+. No Strict Mode (desenvolvimento), esses effects executam duas vezes, duplicando o comportamento. Em produção, pode causar renders extras que afetam performance.

**Impacto:** Performance degradada em updates frequentes (redimensionamento de janela, troca de texto, PDF carregando). Não crasheia, mas desperdiça ciclos de render.

**Correção esperada:** Mover o setState inicial para fora do effect (inicialização lazy) ou usar `useLayoutEffect` onde apropriado.

---

## 🟡 MÉDIOS

### B-006 — Rate limit em memória não compartilhado entre instâncias Vercel

**Arquivo:** `app/api/tts/route.ts:14–18`
**Regra:** escalabilidade / consistência

**Comentário no próprio código:**
```typescript
// Limitação: estado em memória por instância serverless — sem Redis, não é
// compartilhado entre instâncias paralelas da Vercel. Suficiente para MVP.
```

**Problema:** Em tráfego médio, a Vercel pode criar múltiplas instâncias do serverless. Um usuário pode atingir o rate limit em uma instância e ser aceito em outra para o mesmo texto.

**Impacto atual:** Baixo (MVP com tráfego pequeno). Risco cresce com escala.

**Solução planejada:** Upstash Redis ou Vercel KV (registrado no código, aguarda Sprint 4).

---

### B-007 — Criação de cliente Supabase por requisição em rota crítica

**Arquivo:** `app/api/tts/route.ts:161–187` (`isPremiumUser`)
**Regra:** performance

**Problema:** `isPremiumUser()` faz `await import("@supabase/supabase-js")` + `createClient()` a cada POST `/api/tts`. Em função serverless com cold start, esse padrão adiciona latência desnecessária. Adicionalmente, a query ao banco (`profiles.select`) adiciona uma round-trip antes de cada síntese de áudio.

**Impacto:** Latência extra de ~50–200ms por requisição de usuário premium.

**Correção esperada:** Criar o cliente Supabase fora do handler (module-level singleton) ou cachear o resultado da verificação de premium com TTL curto.

---

### B-008 — Prefetch de chunk cancelado pelo seek não libera a requisição em andamento

**Arquivo:** `hooks/useSpeech.ts:212–215`
**Regra:** uso de recursos / rate limit

**Código:**
```typescript
let prefetchNext: Promise<ChunkAudio> | null = nextFetch;
if (!prefetchNext && chunkIdx + 1 < chunks.length) {
  prefetchNext = fetchChunk(chunks[chunkIdx + 1].join(" "), voiceId);
}
```

**Problema:** Quando o usuário faz seek enquanto um prefetch está em voo, `generationRef` é incrementado (invalida a geração), mas o `fetchChunk` já iniciado continua até completar — a requisição HTTP não é abortada (`AbortController` não é usado). O resultado é descartado, mas a requisição consumiu rate limit e banda.

**Impacto:** Em uso intenso de seek, pode consumir rate limit desnecessariamente.

**Correção esperada:** Passar `AbortSignal` para `fetchChunk` e abortar quando a geração mudar.

---

### B-009 — Chunking por contagem de palavras pode quebrar no meio de sentenças

**Arquivo:** `hooks/useSpeech.ts:12` (`CHUNK_SIZE = 400`)
**Regra:** qualidade de áudio

**Problema:** `chunkArray(words, 400)` divide o texto por contagem de palavras sem considerar pontuação. Um chunk pode terminar no meio de uma frase ("A primeira lei da termodinhâ-"), fazendo a síntese neural gerar áudio com entonação estranha ou pausa abrupta entre chunks.

**Impacto:** Perceptível em textos com sentenças longas ou parágrafos densos. Não crasheia.

**Correção esperada:** Dividir nos limites de sentença (`.`, `!`, `?`) mais próximos do limite de 400 palavras.

---

### B-010 — Voz salva no localStorage pode não existir mais no Edge TTS

**Arquivo:** `hooks/useSpeech.ts:168` (`store.selectedVoice ?? DEFAULT_VOICE_ID`)
**Regra:** resiliência

**Problema:** `store.selectedVoice` é persistido via Zustand/localStorage. Se uma voz neural for descontinuada pela Microsoft (acontece), a API retorna erro, mas o código não detecta essa condição especificamente — cai no handler genérico de erro (B-003: falha silenciosa).

**Impacto:** Usuário com voz obsoleta salva não consegue reproduzir nenhum texto sem saber o motivo.

**Correção esperada:** Detectar erro 400/404 da API com o corpo "voice not found" e resetar para `DEFAULT_VOICE_ID` com aviso ao usuário.

---

### B-011 — Conflito entre histórico local e histórico na nuvem não tem estratégia definida

**Arquivo:** `hooks/useHistory.ts` (a verificar) / `useUser.ts`
**Regra:** UX / consistência de dados

**Problema:** Usuário que usa o app sem login (histórico em localStorage) e depois faz login não tem comportamento definido para merge. O histórico local pode ser sobrescrito pelo da nuvem (ou vice-versa) sem aviso.

**Impacto:** Perda de histórico de leitura local sem aviso ao usuário.

**Correção esperada:** Definir estratégia explícita (merge, priorizar local, priorizar nuvem) e comunicar ao usuário na primeira vez que faz login com histórico local existente.

---

## 🔵 BAIXOS

### B-012 — CSP (Content-Security-Policy) ausente nos headers HTTP

**Verificação:** `curl -sv http://localhost:3001/ 2>&1 | grep Content-Security`
**Resultado:** nenhum header CSP encontrado

**Problema:** Sem CSP, o app é mais vulnerável a ataques XSS. Para um app que processa texto de fontes externas (URLs, PDFs), isso é um risco latente.

**Correção esperada:** Configurar CSP via `next.config.js` headers com diretivas mínimas: `default-src 'self'`, `script-src 'self' 'unsafe-inline'` (necessário para Next.js), `connect-src` para domínios da Microsoft e Supabase.

---

### B-013 — Variáveis não utilizadas em componentes (ESLint warnings)

**Arquivos:**
- `components/CardStackHistory.tsx`: `_activeId` definido mas nunca lido
- `components/ConcreteTrack.tsx`: `M` (designTokens) importado mas não usado
- `components/LinenEditor.tsx`: `totalPdfPages` atribuído mas nunca lido

**Impacto:** Sem impacto em runtime. Indicativo de refactoring incompleto.

---

### B-014 — pdfjs-dist sendo lintado pelo ESLint (falsos positivos)

**Arquivo:** `app/app/page.tsx:31` (colunas 678443, 686838, 734689, 786154, 787805, 1088791, 1044822)
**Regra:** `@typescript-eslint/no-this-alias`

**Problema:** O ESLint está analisando o bundle minificado do pdfjs-dist que é incluído (ou referenciado) em algum ponto do bundle gerado. As colunas de 5–7 dígitos são características de código minificado.

**Correção esperada:** Adicionar `.eslintignore` ou configurar `ignores` no `eslint.config.mjs` para excluir `.next/`, `public/`, e bundles de terceiros.

---

### B-015 — `.next/dev/` pode crescer indefinidamente

**Arquivo:** CLAUDE.md (instrução documentada)
**Problema:** O diretório `.next/dev/` acumula arquivos de desenvolvimento sem limpeza automática. Já documentado como "apagar se > 100MB", mas sem automação.

**Impacto:** Lentidão no dev server, espaço em disco consumido.

**Correção esperada:** Script de pre-dev no `package.json` ou `.gitignore` cobrindo `.next/dev/`.

---

## Resumo Executivo

| Severidade | Quantidade | IDs |
|------------|-----------|-----|
| 🔴 CRÍTICO | 2 | B-001, B-002 |
| 🟠 ALTO | 3 | B-003, B-004, B-005 |
| 🟡 MÉDIO | 6 | B-006, B-007, B-008, B-009, B-010, B-011 |
| 🔵 BAIXO | 4 | B-012, B-013, B-014, B-015 |
| **Total** | **15** | |

## Próximos passos

1. Corrigir B-001 (privacidade) e B-002 (resume neural) antes do próximo deploy — tasks #10 e #11 já criadas
2. B-003 e B-004 entram no próximo sprint de manutenção
3. B-005 (ESLint) pode ser corrigido em batch sem risco de regressão
4. B-006 aguarda Sprint 4 (Redis) conforme planejado
5. B-012 (CSP) verificar com Eng. DevOps — impacto no PDF.js worker e Supabase
