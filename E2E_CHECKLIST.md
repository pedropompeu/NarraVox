# NarraVox — Checklist E2E Manual (Sprint MVP)

> Executar no browser antes do deploy. Marque com ✅ (passou), ❌ (falhou) ou ⚠️ (parcial).
> Se falhar, anote o que aconteceu e abra uma sessão com Claude Code para resolver.

---

## Bloco 1 — Editor e TTS básico
- [ ] **1.1** Abrir http://localhost:3000 — tela carrega sem erro no console
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

## Como registrar falhas

Ao encontrar um problema, anote:
```
[FALHOU] 4.3 — PDF não exibe navegador de páginas.
Comportamento: clicar "Carregar" com PDF abre o texto mas sem ← →.
Browser: Chrome 124 / macOS
```

Depois abra o Claude Code na pasta do projeto e descreva o problema.
