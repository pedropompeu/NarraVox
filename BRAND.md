# NarraVox — Brand Identity System
> Versão 1.0 · 2026-05-26 · Status: **aprovado**
> Pipeline: ARIA → MAXWELL + ECHO → NOVA
> brand_status: aprovado

---

## 00. Guia do Documento

Este arquivo é a **única fonte de verdade** da identidade NarraVox. Um desenvolvedor deve conseguir implementar a marca corretamente sem precisar perguntar a um designer.

| Seção | Owner | Atualização |
|---|---|---|
| 01–02 (identidade, logo) | ARIA | /brand pipeline |
| 03–08 (sistema visual) | MAXWELL | /brand pipeline |
| 09 (motion) | MAXWELL | /brand pipeline |
| 12 (voz e copy) | ECHO | /brand pipeline |
| 13–15 (exemplos, governança, changelog) | NOVA | /brand pipeline |

**Como usar:** antes de implementar qualquer tela, leia as Seções 03 (cores), 05 (tipografia) e 08 (componentes). Use sempre os tokens CSS — nunca valores hardcoded. Arquivos de token: `brand/design-tokens.css` e `brand/tailwind.config.ts`.

---

## 01. Visão da Marca

### Identidade

**NarraVox** é um leitor TTS web que transforma qualquer texto em áudio com destaque de palavra em tempo real. Zero fricção, zero instalação, zero conta.

**Posicionamento:** Seu texto, em voz alta.

**Conceito de marca:** Pulso de Leitura — a ideia do cursor de leitura que avança pelo texto, marcando o exato ponto de compreensão.

### Personalidade

| Traço | O que significa na prática |
|---|---|
| **Direto** | Uma frase quando uma serve. Sem rodeios. |
| **Humano** | Fala como gente, não como software. |
| **Confiante** | Sabe o que faz. Não pede desculpa por existir. |
| **Discreto** | A UI se apaga para o texto ganhar protagonismo. |

### Proposta de valor

Para profissionais e estudantes com backlog de leitura, NarraVox é o leitor de texto em voz alta que não exige instalação, conta ou upload — ao contrário dos apps de audiobook existentes, funciona com qualquer texto em menos de 10 segundos.

---

## 02. Sistema de Logo

### Símbolo

**Conceito:** uma linha horizontal com um pico assimétrico na posição ~30% — representa o cursor de leitura que já avançou um terço do texto. Lê-se como: (1) cursor de progresso de leitura, (2) pulso de áudio, (3) marcador de posição.

**SVG do símbolo (canonical):**

```svg
<svg width="24" height="24" viewBox="0 0 24 24" fill="none"
     xmlns="http://www.w3.org/2000/svg">
  <path d="M2 12 L7 12 L9 6 L11 12 L22 12"
        stroke="currentColor"
        stroke-width="1.5"
        stroke-linecap="round"
        stroke-linejoin="round"/>
</svg>
```

**Favicon (32×32) — versão simplificada:**

```svg
<svg width="32" height="32" viewBox="0 0 32 32" fill="none"
     xmlns="http://www.w3.org/2000/svg">
  <rect width="32" height="32" rx="8" fill="#F9F8F6"/>
  <path d="M4 16 L9 16 L12 9 L15 16 L28 16"
        stroke="#1D4ED8" stroke-width="2"
        stroke-linecap="round" stroke-linejoin="round"/>
</svg>
```

### Wordmark

- **Texto:** `narravox` (lowercase)
- **Fonte:** Plus Jakarta Sans, weight 600
- **Tracking:** -0.01em
- **Cor padrão:** `#0F172A` (slate-900)
- **Cor em fundo escuro:** `#F8FAFC` (slate-50)

### Variantes

| Variante | Uso | Cor do símbolo | Cor do wordmark |
|---|---|---|---|
| Principal (símbolo + wordmark) | Website, app, docs | slate-900 | slate-900 |
| Invertida | Fundos escuros | slate-50 | slate-50 |
| Símbolo apenas | Favicon, ícone de app | blue-700 em off-white | — |
| Wordmark apenas | Rodapés, contextos textuais | — | slate-900 |
| Monocromática | Impressão, emboss | preto puro | preto puro |
| Acento azul | CTAs, botões de marca | blue-500 | slate-900 |

### Regras de uso

**Faça:**
- Manter proporção original do símbolo
- Usar espaço mínimo de 1× a altura do símbolo ao redor do logo
- Usar nas 5 variantes documentadas acima

**Não faça:**
- Distorcer ou inclinar o símbolo
- Mudar as cores fora das variantes aprovadas
- Adicionar sombra, brilho ou efeitos ao símbolo
- Usar o símbolo em tamanhos menores que 16px (perda de legibilidade)
- Colocar o logo sobre imagens sem overlay adequado

---

## 03. Sistema de Cores

> Arquivo completo: `brand/design-tokens.css`

### Primitivos

| Token | Hex | Uso |
|---|---|---|
| `--color-blue-500` | `#3B82F6` | Acento primário |
| `--color-blue-700` | `#1D4ED8` | Texto de highlight |
| `--color-blue-100` | `#DBEAFE` | Background de highlight |
| `--color-slate-900` | `#0F172A` | Texto primário |
| `--color-slate-600` | `#475569` | Texto secundário |
| `--color-slate-400` | `#94A3B8` | Texto muted / placeholder |
| `--color-slate-200` | `#E2E8F0` | Bordas padrão |
| `--color-off-white` | `#F9F8F6` | Background de página |
| `--color-white` | `#FFFFFF` | Background de surface |

### Semânticos — regra de uso

Sempre usar os tokens semânticos em componentes. Nunca referenciar primitivos diretamente.

```css
/* ✓ Correto */
background-color: var(--bg-page);
color: var(--text-primary);
border: 1px solid var(--border-default);

/* ✗ Errado */
background-color: #F9F8F6;
color: #0F172A;
```

### Word Highlighting — cor especial

O destaque de palavra é a feature central do produto. Sua cor é tratada como token próprio:

```css
/* Palavra sendo lida agora */
background-color: var(--highlight-word-bg);  /* #DBEAFE */
color: var(--highlight-word-text);           /* #1D4ED8 */
border-radius: var(--word-highlight-radius); /* 3px */
padding: 0 var(--word-highlight-px);         /* 0 2px */
```

**Lógica:** o azul do highlight é propositalmente o mesmo acento da UI — o produto e o conteúdo usam a mesma linguagem visual.

### Dark mode

Todos os tokens semânticos mudam automaticamente via `@media (prefers-color-scheme: dark)`. Nenhum componente precisa de lógica manual de dark mode — tudo é via CSS custom properties.

---

## 04. Sistema de Background e Superfícies

| Token | Valor (light) | Valor (dark) | Uso |
|---|---|---|---|
| `--bg-page` | `#F9F8F6` | `#0F172A` | Background principal da página |
| `--bg-surface` | `#FFFFFF` | `#1E293B` | Cards, textarea, player |
| `--bg-surface-raised` | `#FFFFFF` | `#334155` | Modais, dropdowns, tooltips |
| `--bg-muted` | `#F1F5F9` | `#1E293B` | Estados desabilitados, hover ghost |
| `--bg-inverse` | `#0F172A` | `#F8FAFC` | Seções de contraste total |
| `--bg-accent` | `#EFF6FF` | `rgba(59,130,246,0.1)` | Hover de itens de histórico, destaques suaves |

**Como usar superfícies:**
- Página → `--bg-page`
- Área do editor de texto → `--bg-surface`
- Player flutuante/fixo → `--bg-surface` com `--shadow-md`
- Painel de histórico (sidebar) → `--bg-surface` com borda `--border-default`
- Dropdown de vozes → `--bg-surface-raised` com `--shadow-md`

---

## 05. Sistema Tipográfico

### Fontes

**Primária (UI + leitura):** Plus Jakarta Sans
```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
```

**Mono (dados técnicos):** Geist Mono
```html
<!-- Via next/font/google em Next.js -->
import { GeistMono } from 'geist/font/mono'
```

### Escala

| Token | Tamanho | Line-height | Uso |
|---|---|---|---|
| `--text-xs` | 12px | 1.5 | Timestamps, badges, metadados |
| `--text-sm` | 14px | 1.5 | Labels, controles de UI, botões |
| `--text-base` | 16px | 1.5 | Corpo geral, parágrafo curto |
| `--text-lg` | 18px | **1.75** | **Área de leitura (obrigatório)** |
| `--text-xl` | 20px | 1.4 | Subtítulos, nomes de seção |
| `--text-2xl` | 24px | 1.35 | Títulos de página |
| `--text-3xl` | 30px | 1.3 | Hero headline |
| `--text-4xl` | 36px | 1.25 | Display / landing hero |

### Regras

- **Área de leitura (WordHighlighter):** sempre `--text-lg` (18px) com `line-height: 1.75`. Nunca menor. O usuário está com fadiga visual.
- **Controles do player:** `--text-sm` (14px)
- **Contadores e timestamps:** Geist Mono, `--text-xs`
- **Máximo de pesos em uso simultâneo:** 3 (regular/400, medium/500, semibold/600)

---

## 06. Espaçamento e Grid

**Sistema:** base-4 (múltiplos de 4px)

| Token | Valor | Uso típico |
|---|---|---|
| `--space-1` | 4px | Gap mínimo entre elementos inline |
| `--space-2` | 8px | Padding de badge, gap de ícone+label |
| `--space-3` | 12px | Padding de history item |
| `--space-4` | 16px | Padding de botão, gap de seções |
| `--space-5` | 20px | Padding do editor |
| `--space-6` | 24px | Padding horizontal do player |
| `--space-8` | 32px | Gap entre seções maiores |
| `--space-12` | 48px | Margem de seção |
| `--space-16` | 64px | Padding de página (desktop) |

**Largura máxima de leitura:** `72ch` — nunca deixar a área de texto mais larga. Linhas longas destroem a experiência de leitura.

**Layout mobile:** padding de página: `--space-4` (16px). Player fixo no rodapé (position: fixed, bottom: 0).

---

## 07. Iconografia

**Biblioteca:** Lucide Icons (shadcn/ui default)
**Tamanho padrão:** 20px (controles), 16px (ícones inline), 14px (ícones em badge)
**Stroke width:** 1.5px (consistente com o símbolo da marca)
**Cor:** `currentColor` — sempre herda do contexto

**Ícones específicos do produto:**

| Ação | Ícone Lucide | Notas |
|---|---|---|
| Play | `Play` | filled quando ativo |
| Pause | `Pause` | troca com Play |
| Stop | `Square` | reset completo |
| Velocidade | `Gauge` | controle de speed |
| Voz | `Mic2` | seleção de voz |
| Histórico | `Clock` | painel de histórico |
| Apagar | `Trash2` | limpar item / limpar tudo |
| Configurações | `Settings` | preferências |
| Copiar | `Copy` | copiar texto |

**Regras:**
- Nunca usar ícones filled junto com outline na mesma tela (exceto estado ativo do Play)
- Sempre incluir `aria-label` em ícones sem texto visível
- Touch target mínimo: 40×40px (envolva em `div` ou `button` com padding)

---

## 08. Especificação de Componentes

> Tabela completa gerada por MAXWELL. Referenciar tokens do Tier 3 em `design-tokens.css`.

### Button Primary

```tsx
// Estrutura esperada
<button className="
  bg-[var(--btn-primary-bg)]
  hover:bg-[var(--btn-primary-bg-hover)]
  active:bg-[var(--btn-primary-bg-active)]
  text-[var(--btn-primary-text)]
  disabled:bg-[var(--btn-primary-bg-disabled)]
  disabled:text-[var(--btn-primary-text-disabled)]
  disabled:cursor-not-allowed
  rounded-[var(--btn-primary-radius)]
  px-[var(--btn-primary-px)]
  py-[var(--btn-primary-py)]
  text-sm font-medium
  transition-colors duration-[var(--duration-base)]
  focus-visible:outline-2 focus-visible:outline-offset-2
  focus-visible:outline-[var(--accent-primary)]
">
  Ouvir
</button>
```

### WordHighlighter

```tsx
// Cada palavra renderizada como span
<span
  className={cn(
    "transition-colors duration-[100ms]",
    isCurrentWord
      ? "bg-[var(--word-highlight-bg)] text-[var(--word-highlight-text)] rounded-[3px] px-[2px]"
      : "text-[var(--word-default-text)]"
  )}
>
  {word}
</span>
```

### ProgressBar

```tsx
// Range input estilizado
<input
  type="range"
  min={0}
  max={totalWords}
  value={currentWordIndex}
  className="
    w-full h-[var(--progress-height)]
    bg-[var(--progress-track-bg)]
    rounded-[var(--progress-radius)]
    accent-[var(--accent-primary)]
    cursor-pointer
  "
/>
```

### HistoryItem

```tsx
<div className="
  bg-[var(--history-item-bg)]
  hover:bg-[var(--history-item-bg-hover)]
  border border-[var(--history-item-border)]
  rounded-[var(--history-item-radius)]
  px-[var(--history-item-px)]
  py-[var(--history-item-py)]
  cursor-pointer
  transition-colors duration-[var(--duration-base)]
">
  <p className="text-sm font-medium text-[var(--text-primary)] truncate">
    {item.title}
  </p>
  <p className="text-xs text-[var(--text-muted)] font-mono mt-1">
    {item.wordCount} palavras · {formatDate(item.createdAt)}
  </p>
</div>
```

---

## 09. Motion e Animação

### Princípios

- Motion existe para confirmar ação, não para entreter
- Transições rápidas (`--duration-fast: 100ms`) para estados de destaque de palavra — imperceptíveis mas críticas para sensação de fluidez
- Transições médias (`--duration-base: 150ms`) para hover/focus de UI
- Nada acima de 300ms em interações diretas

### Tokens

| Token | Valor | Uso |
|---|---|---|
| `--duration-fast` | 100ms | Word highlighting transition |
| `--duration-base` | 150ms | Hover, focus, fade de UI |
| `--duration-slow` | 250ms | Modais, painéis deslizantes |
| `--ease-default` | `cubic-bezier(0.4, 0, 0.2, 1)` | Maioria das transições |
| `--ease-out` | `cubic-bezier(0, 0, 0.2, 1)` | Entradas (aparecer) |
| `--ease-in` | `cubic-bezier(0.4, 0, 1, 1)` | Saídas (desaparecer) |

### Animações específicas do produto

**`word-pulse`** — toque visual ao carregar nova voz ou reiniciar leitura:
```css
@keyframes word-pulse {
  0%, 100% { background-color: var(--highlight-word-bg); }
  50%       { background-color: var(--color-blue-200); }
}
```

**`fade-in`** — entrada de elementos (toast de confirmação, dropdown):
```css
@keyframes fade-in {
  from { opacity: 0; transform: translateY(4px); }
  to   { opacity: 1; transform: translateY(0); }
}
```

### Regras

- Nunca animar `width`, `height` ou `top/left` — use `transform`
- Respeitar `prefers-reduced-motion`:

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## 10. Visualização de Dados

Não aplicável ao MVP. O único "dado" exibido é a barra de progresso e o contador de palavras — ambos cobertos nas Seções 03 e 08.

Para gráficos de uso em versões futuras (dashboard de hábitos de leitura): usar as cores `--color-blue-500` (primário) e `--color-slate-300` (neutro/vazio). Nunca usar as cores de status (emerald/red/amber) em dados não-relacionados a status.

---

## 11. Imagem e Fotografia

O MVP não usa fotografia. Para materiais de marketing:
- Estilo: captura de tela do produto em uso (product-led)
- Fundo: sempre `--color-off-white` ou branco
- Sem stock photos de pessoas
- Sem mockups 3D elaborados — device frames simples (linear, sem reflexo)
- Paleta de elementos gráficos: restrita à paleta da marca

---

## 12. Voz e Mensagem

### Voice Profile

**Personalidade:** direto · humano · confiante · discreto

| Contexto | Tom |
|---|---|
| Marketing (landing page) | Conta o que o produto faz em uma frase. Sem hipérboles. |
| Produto (UI copy) | Invisível quando tudo está bem. Específico quando orientando. |
| Erros / suporte | Humano primeiro. O quê aconteceu + o que fazer a seguir. |

### Hierarquia de Mensagem

```
Nível 1 — Categoria:   "Leitor de texto em voz alta"
Nível 2 — Promessa:    "Ouça qualquer texto que você teria que ler — sem conta, sem app."
Nível 3 — Prova:       "Cole o texto. Escolha a voz e a velocidade. A palavra atual
                        fica destacada enquanto você ouve."
Nível 4 — CTA:         "Cole um texto para começar."
```

### Tagline

> **"Seu texto, sua voz."**

Candidatas aprovadas por ranking: ver BRIEF_NarraVox.md Seção 09.

### Anti-patterns (nunca usar)

1. "revolucionário", "disruptivo", "poderoso", "incrível"
2. "Bem-vindo ao NarraVox!" (onboarding clichê)
3. "Algo deu errado." (sem contexto)
4. "Por favor, tente novamente." (sem especificar o quê)
5. "Carregando..." (sem contexto)
6. "Aproveite!"
7. "Nossa plataforma"
8. Voz passiva onde ativa serve: "o texto foi lido" → "você ouviu"
9. Jargão técnico ao usuário: "SpeechSynthesis", "utterance"
10. Exclamações em estados de sucesso: "Salvo!" → "Salvo."
11. "Clique aqui" como texto de link
12. "Erro desconhecido" — sempre especificar

### Biblioteca de Microcopy

| Contexto | Cópia NarraVox |
|---|---|
| Editor (placeholder) | "Cole qualquer texto. Artigo, contrato, resumo..." |
| CTA play | "Ouvir" |
| CTA pause | "Pausar" |
| CTA retomar | "Retomar" |
| Após leitura completa | "Concluído · 3 min 42 s" |
| Histórico vazio | "Nenhum texto ouvido ainda. Cole algo e aperte play." |
| Voz não disponível | "A voz selecionada não está disponível. Escolha outra na lista." |
| Vozes carregando | "Buscando vozes disponíveis..." |
| Texto salvo | "Salvo no histórico." |
| Confirmar limpeza | "Isso remove todos os textos salvos neste dispositivo. Continuar?" |
| Aviso de privacidade | "Seus textos ficam salvos apenas neste dispositivo. Nenhum dado é enviado." |
| Contador | "500 palavras · ~3 min" |
| Velocidade | "1× velocidade normal" |

---

## 13. Exemplos de Uso e Prompts

### Como implementar o WordHighlighter

```tsx
// hooks/useSpeech.ts — estrutura esperada
export function useSpeech(text: string) {
  const words = text.split(/\s+/)
  const [currentIndex, setCurrentIndex] = useState(-1)

  const speak = (startFrom = 0) => {
    const utterance = new SpeechSynthesisUtterance(
      words.slice(startFrom).join(' ')
    )
    utterance.onboundary = (event) => {
      // Chrome: dispara por palavra com charIndex
      const wordIndex = getWordIndexFromChar(event.charIndex, words, startFrom)
      setCurrentIndex(wordIndex)
    }
    window.speechSynthesis.speak(utterance)
  }

  return { words, currentIndex, speak }
}

// components/WordHighlighter.tsx
export function WordHighlighter({ words, currentIndex }: Props) {
  return (
    <div className="font-sans text-reading leading-reading max-w-reader">
      {words.map((word, i) => (
        <span
          key={i}
          className={cn(
            "transition-colors duration-fast",
            i === currentIndex
              ? "bg-[var(--highlight-word-bg)] text-[var(--highlight-word-text)] rounded-[3px] px-[2px]"
              : "text-[var(--text-primary)]"
          )}
        >
          {word}{' '}
        </span>
      ))}
    </div>
  )
}
```

### Prompt Claude Code — implementar componente com a marca

```
Implemente o componente AudioPlayer para o NarraVox.

Contexto de marca (obrigatório):
- design-tokens.css em brand/design-tokens.css
- Nunca hardcode cores ou tamanhos — usar sempre tokens CSS
- Fonte: Plus Jakarta Sans (--font-primary)
- Controles: text-sm (14px), ícones Lucide 20px, stroke 1.5
- Touch target mínimo: 40×40px
- Transições: --duration-base (150ms) para hover/focus
- Word highlighting: --duration-fast (100ms)

Stack: Next.js 14 + TypeScript + TailwindCSS + shadcn/ui
```

---

## 14. Governança de Marca

### Quem pode alterar o quê

| Elemento | Owner | Como alterar |
|---|---|---|
| Símbolo / wordmark | ARIA | Novo /brand pipeline com brief atualizado |
| Paleta de cores | ARIA | Aprovação ARIA + atualização de tokens por MAXWELL |
| Tokens CSS/Tailwind | MAXWELL | PR com revisão de MAXWELL + QA de NOVA |
| Copy/voz | ECHO | Atualização da seção 12 + revisão de NOVA |
| Componentes | MAXWELL | PR + checklist de 8 estados |
| BRAND.md | NOVA | Sempre versionado — nunca editar sem changelog |

### Processo de atualização

1. Proposta no `/discuss_comite` (para mudanças de sistema) ou `/discuss_setor 4` (para ajustes de copy/cor)
2. Execução via `/brand` com brief atualizado se mudança estrutural
3. NOVA incrementa a versão e atualiza o changelog
4. PR com `design-tokens.css` e `tailwind.config.ts` atualizados
5. Eng. Frontend atualiza os components que dependem dos tokens alterados

### Quando NÃO precisa de novo /brand

- Adição de componente novo (MAXWELL atualiza a tabela de specs)
- Novo microcopy (ECHO atualiza a seção 12)
- Ajuste de shadow ou spacing menor

### Quando PRECISA de novo /brand

- Mudança de acento de cor
- Mudança de tipografia
- Novo conceito de logo ou símbolo
- Mudança de posicionamento de marca

---

## 15. Changelog

| Versão | Data | Agente | Mudança |
|---|---|---|---|
| 1.0 | 2026-05-26 | ARIA + MAXWELL + ECHO + NOVA | Criação inicial via /brand pipeline. Conceito: Pulso de Leitura. |

---

*NarraVox BRAND.md v1.0 — gerado pelo /brand pipeline da Holding Creative Team*
*brand_status: aprovado*
