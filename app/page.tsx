"use client";
import { useEffect, useState } from "react";
import { LinenEditor } from "@/components/LinenEditor";
import { GelReader } from "@/components/GelReader";
import { WoodPlayer } from "@/components/WoodPlayer";
import { CardStackHistory } from "@/components/CardStackHistory";
import { ApplePlay } from "@/components/ApplePlay";
import { usePlayer } from "@/hooks/usePlayer";
import { useVisibilityPause } from "@/hooks/useVisibilityPause";
import { useTheme } from "@/hooks/useTheme";
import { useBookmarks } from "@/hooks/useBookmarks";
import { StudyPause } from "@/components/StudyPause";
import { ShareButton } from "@/components/ShareButton";
import { StreakBadge } from "@/components/StreakBadge";
import { useStreak } from "@/hooks/useStreak";
import { useLoopRange } from "@/hooks/useLoopRange";
import { useAnnotations } from "@/hooks/useAnnotations";
import { AnnotationPanel } from "@/components/AnnotationPanel";
import { SensitiveBanner } from "@/components/SensitiveBanner";
import { PdfSectionIndex } from "@/components/PdfSectionIndex";
import { EDGE_TTS_VOICES } from "@/lib/edgeTtsVoices";
import { M, surface } from "@/lib/designTokens";
import type { HistoryItem } from "@/lib/historyUtils";

function useIsMobile(): boolean {
  const [mobile, setMobile] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 768px)");
    setMobile(mq.matches);
    const handler = (e: MediaQueryListEvent) => setMobile(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);
  return mobile;
}

// ── Inline small components ────────────────────────────────

function PaperPill({ children }: { children: React.ReactNode }) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        padding: "5px 11px",
        borderRadius: 999,
        fontFamily: M.sans,
        fontSize: 12,
        color: M.ink2,
        fontWeight: 500,
        background:
          "linear-gradient(180deg, rgba(255,255,255,.7) 0%, rgba(255,255,255,.3) 100%)",
        boxShadow:
          "inset 0 1px 0 rgba(255,255,255,.8), 0 1px 0 rgba(120,90,60,.18), 0 1px 2px rgba(120,90,60,.12)",
        border: "1px solid rgba(120,90,60,.18)",
      }}
    >
      {children}
    </span>
  );
}

function TxHeader({
  historyCount,
  showHistory,
  onToggleHistory,
  dark,
  onToggleDark,
  mobile,
}: {
  historyCount: number;
  showHistory: boolean;
  onToggleHistory: () => void;
  dark: boolean;
  onToggleDark: () => void;
  mobile: boolean;
}) {
  return (
    <header
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: mobile ? "16px 18px 14px" : "20px 32px 18px",
        position: "relative",
        zIndex: 5,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        {/* Brass logo box */}
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: 12,
            ...surface.brass,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow:
              "inset 0 1px 0 rgba(255,235,170,.85), inset 0 -1px 0 rgba(60,40,10,.5), 0 2px 4px rgba(80,55,5,.4)",
            color: "#3A2700",
          }}
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            aria-hidden="true"
          >
            <path d="M3 12h2M7 8v8M11 5v14M15 8v8M19 10v4M21 12h.01" />
          </svg>
        </div>

        <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
          <span
            style={{
              fontFamily: M.serif,
              fontSize: mobile ? 22 : 26,
              fontWeight: 600,
              letterSpacing: "-0.02em",
              color: M.ink,
              lineHeight: 1,
            }}
          >
            NarraVox
          </span>
          {!mobile && (
            <span
              style={{
                fontFamily: M.serif,
                fontStyle: "italic",
                fontSize: 14,
                color: M.ink3,
              }}
            >
              seu texto, sua voz.
            </span>
          )}
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      {/* Dark mode toggle */}
      <button
        onClick={onToggleDark}
        aria-label={dark ? "Ativar modo claro" : "Ativar modo escuro"}
        aria-pressed={dark}
        title={dark ? "Modo claro" : "Modo escuro"}
        style={{
          width: 36,
          height: 36,
          borderRadius: 10,
          border: "1px solid rgba(120,90,60,.18)",
          cursor: "pointer",
          background: dark
            ? "linear-gradient(180deg, rgba(255,255,255,.12) 0%, rgba(255,255,255,.06) 100%)"
            : "linear-gradient(180deg, rgba(255,255,255,.55) 0%, rgba(255,255,255,.25) 100%)",
          boxShadow: "inset 0 1px 0 rgba(255,255,255,.4), 0 1px 2px rgba(120,90,60,.12)",
          color: M.ink2,
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          transition: "background 0.15s ease",
        }}
      >
        {dark ? (
          <svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
          </svg>
        ) : (
          <svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M21 12.79A9 9 0 1 1 11.21 3a7 7 0 0 0 9.79 9.79z"/>
          </svg>
        )}
      </button>

      {/* History toggle */}
      <button
        onClick={onToggleHistory}
        aria-label={showHistory ? "Fechar histórico" : "Abrir histórico"}
        aria-expanded={showHistory}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 8,
          padding: "8px 14px",
          borderRadius: 10,
          border: "1px solid rgba(120,90,60,.18)",
          cursor: "pointer",
          background: showHistory
            ? "linear-gradient(180deg, rgba(255,255,255,.8) 0%, rgba(255,255,255,.45) 100%)"
            : "linear-gradient(180deg, rgba(255,255,255,.55) 0%, rgba(255,255,255,.25) 100%)",
          boxShadow:
            "inset 0 1px 0 rgba(255,255,255,.8), 0 1px 0 rgba(120,90,60,.18), 0 2px 4px rgba(120,90,60,.10)",
          color: M.ink2,
          fontFamily: M.sans,
          fontSize: 13,
          fontWeight: 600,
          letterSpacing: "-0.005em",
          transition: "background 0.15s ease",
        }}
      >
        <svg
          width={14}
          height={14}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <rect x="4" y="6" width="14" height="14" rx="1.5" />
          <path d="M7 4h13v13" />
        </svg>
        Histórico
        {historyCount > 0 && (
          <span
            style={{
              background: M.appleMid,
              color: "#fff",
              borderRadius: "9999px",
              fontSize: "0.6875rem",
              fontWeight: 700,
              padding: "0 6px",
              minWidth: 18,
              textAlign: "center",
              lineHeight: "18px",
            }}
          >
            {historyCount}
          </span>
        )}
      </button>
      </div>
    </header>
  );
}

function TxFooter({ mobile }: { mobile: boolean }) {
  return (
    <footer
      style={{
        padding: mobile ? "12px 18px" : "14px 32px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        fontFamily: M.serif,
        fontStyle: "italic",
        fontSize: 12,
        color: M.ink3,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span
          style={{
            width: 8,
            height: 8,
            borderRadius: "50%",
            background: "radial-gradient(circle at 35% 30%, #BBD89F, #6FA046)",
            boxShadow: "0 1px 2px rgba(50,80,20,.45)",
            flexShrink: 0,
          }}
        />
        seus textos ficam em casa — apenas neste dispositivo.{" "}
        <a href="/privacidade" style={{ color: M.glass, textDecoration: "none" }}>
          Privacidade
        </a>
      </div>
      {!mobile && (
        <span style={{ color: M.muted }}>NarraVox · feito à mão</span>
      )}
    </footer>
  );
}

function CalloutCard({
  status,
  wordCount,
  onPlay,
}: {
  status: string;
  wordCount: number;
  onPlay: () => void;
}) {
  if (status === "idle") {
    return (
      <div
        style={{
          padding: "18px 20px",
          borderRadius: 16,
          ...surface.paper,
          boxShadow:
            "inset 0 1px 0 rgba(255,255,255,.8), inset 0 0 0 1px rgba(180,140,90,.25), 0 1px 0 rgba(255,255,255,.5)",
          border: "1px dashed rgba(120,90,60,.35)",
          display: "flex",
          gap: 14,
          alignItems: "center",
        }}
      >
        <ApplePlay disabled size={56} playing={false} />
        <div style={{ flex: 1 }}>
          <div
            style={{
              fontFamily: M.serif,
              fontSize: 16,
              fontWeight: 600,
              color: M.ink,
              letterSpacing: "-0.01em",
            }}
          >
            cole um texto para começar
          </div>
          <p
            style={{
              margin: "4px 0 0",
              fontFamily: M.sans,
              fontSize: 12,
              color: M.ink3,
              lineHeight: 1.55,
            }}
          >
            artigos, threads, capítulos. a maçã acende quando houver texto.
          </p>
        </div>
      </div>
    );
  }

  if (status === "ready") {
    return (
      <div
        style={{
          padding: "20px 22px",
          borderRadius: 16,
          background: "linear-gradient(180deg, #FFF1E2 0%, #FFD9B8 100%)",
          boxShadow:
            "inset 0 1px 0 rgba(255,255,255,.85), 0 2px 0 rgba(170,90,30,.20), 0 18px 36px -16px rgba(200,90,30,.45)",
          display: "flex",
          gap: 16,
          alignItems: "center",
        }}
      >
        <ApplePlay onClick={onPlay} size={62} playing={false} />
        <div style={{ flex: 1 }}>
          <div
            style={{
              fontFamily: M.serif,
              fontSize: 17,
              fontWeight: 600,
              color: "#5C2A0F",
              letterSpacing: "-0.01em",
            }}
          >
            pronto. é só morder.
          </div>
          <p
            style={{
              margin: "4px 0 0",
              fontFamily: M.sans,
              fontSize: 12,
              color: "#7C3F1A",
              lineHeight: 1.55,
            }}
          >
            {wordCount.toLocaleString("pt-BR")} palavras detectadas · ajuste voz e velocidade enquanto ouve.
          </p>
        </div>
      </div>
    );
  }

  // playing / paused / loading
  return (
    <div
      style={{
        padding: "16px 20px",
        borderRadius: 16,
        background:
          "linear-gradient(180deg, rgba(59,130,246,.12) 0%, rgba(59,130,246,.04) 100%)",
        border: "1px solid rgba(59,130,246,.25)",
        boxShadow: "inset 0 1px 0 rgba(255,255,255,.6)",
      }}
    >
      <div
        style={{
          fontFamily: M.serif,
          fontStyle: "italic",
          fontSize: 13,
          color: "#1E3A8A",
        }}
      >
        dica caseira
      </div>
      <p
        style={{
          margin: "4px 0 0",
          fontFamily: M.sans,
          fontSize: 12,
          color: M.ink2,
          lineHeight: 1.55,
        }}
      >
        sua posição é salva sozinha. feche a aba — o histórico retoma de onde você parou.
      </p>
    </div>
  );
}

// ── Main page ──────────────────────────────────────────────

export default function Home() {
  const [text, setText] = useState("");
  const [showHistory, setShowHistory] = useState(false);
  const [pdfPages, setPdfPages] = useState<string[]>([]);
  const [activePage, setActivePage] = useState(0);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const mobile = useIsMobile();

  const { dark, toggle: toggleDark, showNightBanner, dismissNightBanner } = useTheme();
  const isPdf = pdfPages.length > 0;
  const player = usePlayer(text, "neural", { isPdf, activePage: isPdf ? activePage : undefined });

  const isReading =
    player.status === "playing" ||
    player.status === "paused" ||
    player.status === "loading";

  const isIdle = player.status === "idle";

  const bookmarks = useBookmarks(player.activeHistoryId);
  const streak = useStreak(player.elapsedSeconds, player.status === "playing");
  const loop = useLoopRange(player.currentWordIndex, player.seekTo);
  const annotations = useAnnotations(player.activeHistoryId, player.words);

  // Dispara tick do loop a cada palavra
  useEffect(() => { loop.tick(); }, [player.currentWordIndex]);

  // Pausa automática ao minimizar/trocar de aba
  useVisibilityPause({
    isPlaying: player.status === "playing",
    onPause: player.pause,
  });

  // Cancela síntese ao sair/recarregar
  useEffect(() => {
    const cancel = () => window.speechSynthesis?.cancel();
    window.addEventListener("beforeunload", cancel);
    return () => window.removeEventListener("beforeunload", cancel);
  }, []);

  function handlePdfPages(pages: string[]) {
    setPdfPages(pages);
    setActivePage(0);
  }

  function handleHistorySelect(item: HistoryItem) {
    setText(item.text);
    // PDF do histórico: limpa contexto de paginação (usuário re-faz upload para navegar)
    if (item.isPdf) { setPdfPages([]); setActivePage(0); }
    player.loadFromHistory(item.text, item.id, item.lastPosition, item.savedSpeed);
    setShowHistory(false);
  }

  // ── Shell ─────────────────────────────────────────────────
  return (
    <div
      style={{
        width: "100%",
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        position: "relative",
        ...surface.linen,
      }}
    >
      <div style={{ display: "flex", alignItems: "center" }}>
        <TxHeader
          historyCount={player.historyItems.length}
          showHistory={showHistory}
          onToggleHistory={() => setShowHistory((v) => !v)}
          dark={dark}
          onToggleDark={toggleDark}
          mobile={mobile}
        />
        {!mobile && streak.data && (
          <div style={{ marginLeft: "auto", paddingRight: 32 }}>
            <StreakBadge
              data={streak.data}
              progress={streak.progress}
              onGoalChange={streak.updateGoal}
            />
          </div>
        )}
      </div>

      {/* ── Mobile layout ─────────────────────────────────── */}
      {mobile ? (
        <main
          style={{
            flex: 1,
            padding: 16,
            display: "flex",
            flexDirection: "column",
            gap: 14,
            overflow: "hidden",
            minHeight: 0,
          }}
        >
          {isReading ? (
            <GelReader
              words={player.words}
              currentWordIndex={player.currentWordIndex}
              onWordClick={(i) => loop.isSelecting ? loop.selectWord(i) : player.seekTo(i)}
              loopRange={loop.range ?? undefined}
              bookmarkIndices={bookmarks.bookmarks.map((b) => b.wordIndex)}
              onBookmarkClick={player.seekTo}
              mobile
            />
          ) : (
            <LinenEditor value={text} onChange={setText} onPdfPages={handlePdfPages} onPdfFile={setPdfFile} onPageChange={setActivePage} mobile />
          )}
          <WoodPlayer
            status={player.status}
            currentWordIndex={player.currentWordIndex}
            totalWords={player.totalWords}
            speed={player.speed}
            voices={EDGE_TTS_VOICES}
            selectedVoice={player.selectedVoice}
            elapsedSeconds={player.elapsedSeconds}
            onPlay={player.play}
            onPause={player.pause}
            onResume={player.resume}
            onStop={player.stop}
            onRestart={player.restart}
            onSeek={player.seekTo}
            onSpeedChange={player.setSpeed}
            onVoiceChange={player.setVoice}
            onBookmark={() => {
              const idx = player.currentWordIndex;
              if (idx < 0) return;
              bookmarks.isBookmarked(idx) ? bookmarks.remove(idx) : bookmarks.add(idx);
            }}
            isBookmarked={bookmarks.isBookmarked(Math.max(0, player.currentWordIndex))}
            mobile
          />
        </main>
      ) : (
        /* ── Desktop layout ─────────────────────────────── */
        <main
          style={{
            flex: 1,
            display: "grid",
            gridTemplateColumns: showHistory ? "1fr 360px" : "1fr",
            minHeight: 0,
          }}
        >
          {/* Main content: 55/45 grid */}
          <div
            style={{
              padding: "8px 32px 16px",
              display: "grid",
              gridTemplateColumns: "55fr 45fr",
              gap: 28,
              minHeight: 0,
            }}
          >
            {/* Left 55% — editor or reader */}
            <div style={{ display: "flex", flexDirection: "column", minHeight: 0 }}>
              {isReading ? (
                <>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      marginBottom: 14,
                    }}
                  >
                    <div>
                      <h2
                        style={{
                          margin: 0,
                          fontFamily: M.serif,
                          fontSize: 18,
                          fontWeight: 600,
                          color: M.ink,
                          letterSpacing: "-0.01em",
                        }}
                      >
                        Tocando
                      </h2>
                      <p
                        style={{
                          margin: "3px 0 0",
                          fontFamily: M.sans,
                          fontSize: 12,
                          color: M.ink3,
                        }}
                      >
                        clique em qualquer palavra para saltar
                      </p>
                    </div>
                    <PaperPill>
                      {player.currentWordIndex + 1} / {player.totalWords}
                    </PaperPill>
                  </div>
                  <GelReader
                    words={player.words}
                    currentWordIndex={player.currentWordIndex}
                    onWordClick={(i) => loop.isSelecting ? loop.selectWord(i) : player.seekTo(i)}
                    loopRange={loop.range ?? undefined}
              bookmarkIndices={bookmarks.bookmarks.map((b) => b.wordIndex)}
                    onBookmarkClick={player.seekTo}
                  />
                </>
              ) : (
                <>
                  <SensitiveBanner text={text} />
                  {pdfFile && (
                    <PdfSectionIndex
                      file={pdfFile}
                      maxPages={pdfPages.length}
                      currentPage={activePage}
                      onNavigate={(pageIdx) => {
                        setActivePage(pageIdx);
                        setText(pdfPages[pageIdx] ?? "");
                      }}
                    />
                  )}
                  <LinenEditor value={text} onChange={setText} onPdfPages={handlePdfPages} onPdfFile={setPdfFile} onPageChange={setActivePage} />
                </>
              )}
            </div>

            {/* Right 45% — player + callout */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 18,
                minHeight: 0,
              }}
            >
              <WoodPlayer
                status={player.status}
                currentWordIndex={player.currentWordIndex}
                totalWords={player.totalWords}
                speed={player.speed}
                voices={EDGE_TTS_VOICES}
                selectedVoice={player.selectedVoice}
                elapsedSeconds={player.elapsedSeconds}
                onPlay={player.play}
                onPause={player.pause}
                onResume={player.resume}
                onStop={player.stop}
                onRestart={player.restart}
                onSeek={player.seekTo}
                onSpeedChange={player.setSpeed}
                onVoiceChange={player.setVoice}
                onBookmark={() => {
                  const idx = player.currentWordIndex;
                  if (idx < 0) return;
                  bookmarks.isBookmarked(idx) ? bookmarks.remove(idx) : bookmarks.add(idx);
                }}
                isBookmarked={bookmarks.isBookmarked(Math.max(0, player.currentWordIndex))}
              />
              <CalloutCard
                status={isIdle && player.totalWords === 0 ? "idle" : isReading ? "reading" : "ready"}
                wordCount={player.totalWords}
                onPlay={player.play}
              />
            </div>
          </div>

          {/* History sidebar (desktop) */}
          {showHistory && (
            <div style={{ padding: "8px 16px 16px 0" }}>
              <CardStackHistory
                items={player.historyItems}
                activeId={null}
                onSelect={handleHistorySelect}
                onDelete={player.removeHistory}
                onClear={player.clearHistory}
                onClose={() => setShowHistory(false)}
              />
            </div>
          )}
        </main>
      )}

      {/* History bottom sheet (mobile) */}
      {mobile && showHistory && (
        <>
          <div
            onClick={() => setShowHistory(false)}
            style={{
              position: "absolute",
              inset: 0,
              background: "rgba(40,20,5,.40)",
              zIndex: 10,
              backdropFilter: "blur(2px)",
              WebkitBackdropFilter: "blur(2px)",
            }}
          />
          <div
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              bottom: 0,
              height: "74%",
              zIndex: 11,
            }}
          >
            <CardStackHistory
              items={player.historyItems}
              activeId={null}
              onSelect={handleHistorySelect}
              onDelete={player.removeHistory}
              onClear={player.clearHistory}
              onClose={() => setShowHistory(false)}
              asBottomSheet
            />
          </div>
        </>
      )}

      <TxFooter mobile={mobile} />

      {/* Banner modo noturno automático */}
      {showNightBanner && (
        <div style={{
          position: "fixed",
          bottom: 24,
          right: 24,
          background: "var(--paper)",
          border: "1px solid rgba(120,90,60,.18)",
          borderRadius: 16,
          padding: "14px 18px",
          display: "flex",
          alignItems: "center",
          gap: 12,
          boxShadow: "0 8px 32px rgba(0,0,0,.18)",
          zIndex: 40,
          fontFamily: M.sans,
          fontSize: 13,
          color: M.ink2,
          maxWidth: 300,
        }}>
          <span style={{ fontSize: 20 }}>🌙</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, color: M.ink, marginBottom: 2, fontSize: 13 }}>Modo noturno ativado</div>
            <div style={{ fontSize: 11, color: M.ink3 }}>Mais suave para os olhos após as 22h.</div>
          </div>
          <button onClick={dismissNightBanner} aria-label="Fechar" style={{
            background: "none", border: "none", cursor: "pointer",
            color: M.ink3, fontSize: 18, lineHeight: 1, padding: 0,
          }}>×</button>
        </div>
      )}

      {/* Controles flutuantes durante leitura */}
      {isReading && !mobile && (
        <div style={{
          position: "fixed",
          bottom: 24,
          left: "50%",
          transform: "translateX(-50%)",
          display: "flex",
          gap: 8,
          zIndex: 30,
          alignItems: "center",
        }}>
          <StudyPause
            isPlaying={player.status === "playing"}
            elapsedSeconds={player.elapsedSeconds}
            onPause={player.pause}
          />
          {/* Botão loop */}
          <button
            onClick={loop.isActive ? loop.cancel : loop.startSelection}
            title={loop.isActive ? "Cancelar loop" : loop.isSelecting ? "Clique na palavra final do trecho" : "Repetir trecho em loop"}
            style={{
              display: "inline-flex", alignItems: "center", gap: 5,
              padding: "5px 10px", borderRadius: 999,
              border: `1px solid ${loop.isActive ? "rgba(245,158,11,.35)" : "rgba(120,90,60,.18)"}`,
              background: loop.isActive ? "rgba(245,158,11,.10)" : loop.isSelecting ? "rgba(59,130,246,.08)" : "linear-gradient(180deg, rgba(255,255,255,.55) 0%, rgba(255,255,255,.25) 100%)",
              color: loop.isActive ? "#B45309" : M.ink2,
              fontFamily: M.sans, fontSize: 11, fontWeight: 600, cursor: "pointer",
              boxShadow: "inset 0 1px 0 rgba(255,255,255,.6)",
            }}
          >
            <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M17 1l4 4-4 4"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><path d="M7 23l-4-4 4-4"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/>
            </svg>
            {loop.isActive ? "Loop ON ×" : loop.isSelecting ? "Selecione fim..." : "Loop"}
          </button>
          <ShareButton
            words={player.words}
            currentWordIndex={player.currentWordIndex}
          />
          <AnnotationPanel
            annotations={annotations.annotations}
            currentWordIndex={player.currentWordIndex}
            isPlaying={player.status === "playing"}
            onAdd={annotations.add}
            onRemove={annotations.remove}
            onExport={() => {
              const txt = annotations.exportTxt("NarraVox");
              if (!txt) return;
              const a = document.createElement("a");
              a.href = URL.createObjectURL(new Blob([txt], { type: "text/plain" }));
              a.download = "anotacoes-narravox.txt";
              a.click();
            }}
            onSeek={player.seekTo}
            onPause={player.pause}
          />
        </div>
      )}
    </div>
  );
}
