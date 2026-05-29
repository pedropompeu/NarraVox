"use client";
import { useMemo, useRef, useEffect, useState } from "react";
import { M, surface } from "@/lib/designTokens";

interface LoopRange { start: number; end: number; }

interface GelReaderProps {
  words: string[];
  currentWordIndex: number;
  onWordClick?: (index: number) => void;
  bookmarkIndices?: number[];
  onBookmarkClick?: (index: number) => void;
  loopRange?: LoopRange;
  mobile?: boolean;
}

export function GelReader({
  words,
  currentWordIndex,
  onWordClick,
  bookmarkIndices = [],
  onBookmarkClick,
  loopRange,
  mobile = false,
}: GelReaderProps) {
  const isActive = currentWordIndex >= 0;
  const [autoScroll, setAutoScroll] = useState(true);
  const activeRef = useRef<HTMLSpanElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (autoScroll && activeRef.current && containerRef.current) {
      activeRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [currentWordIndex, autoScroll]);

  const bookmarkSet = useMemo(() => new Set(bookmarkIndices), [bookmarkIndices]);

  const content = useMemo(
    () =>
      words.map((word, i) => {
        const isCurrent = i === currentWordIndex;
        const isDone = isActive && i < currentWordIndex;
        const isMarked = bookmarkSet.has(i);
        const inLoop = loopRange && i >= loopRange.start && i <= loopRange.end;
        return (
          <span key={i} style={{ position: "relative", display: "inline" }}>
            {isMarked && (
              <button
                onClick={() => onBookmarkClick?.(i)}
                aria-label={`Bookmark na palavra ${i + 1}: ${word}`}
                title="Ir para bookmark"
                style={{
                  position: "absolute",
                  top: -10,
                  left: "50%",
                  transform: "translateX(-50%)",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  padding: 0,
                  color: "#F59E0B",
                  lineHeight: 1,
                  zIndex: 1,
                }}
              >
                <svg width={8} height={8} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
                </svg>
              </button>
            )}
            {isCurrent ? (
              <span
                ref={activeRef}
                style={{
                  position: "relative",
                  display: "inline-block",
                  padding: "2px 7px",
                  margin: "0 -7px",
                  borderRadius: 8,
                  color: "#FAFCFF",
                  fontWeight: 600,
                  background:
                    "linear-gradient(180deg, rgba(116,167,251,.95) 0%, rgba(59,130,246,.92) 60%, rgba(34,87,199,.92) 100%)",
                  boxShadow:
                    "inset 0 1px 0 rgba(255,255,255,.55), inset 0 -1px 2px rgba(20,50,140,.40), 0 1px 2px rgba(34,87,199,.35), 0 4px 12px rgba(59,130,246,.30)",
                  textShadow: "0 1px 0 rgba(20,50,140,.5)",
                }}
              >
                {word}
                <span
                  aria-hidden="true"
                  style={{
                    position: "absolute",
                    left: 6,
                    top: 2,
                    width: "60%",
                    height: "40%",
                    borderRadius: 6,
                    background:
                      "linear-gradient(180deg, rgba(255,255,255,.55), rgba(255,255,255,0))",
                    pointerEvents: "none",
                  }}
                />
              </span>
            ) : (
              <span
                onClick={() => onWordClick?.(i)}
                style={{
                  color: isDone ? M.muted : M.ink,
                  cursor: onWordClick ? "pointer" : "default",
                  transition: "color 0.2s ease",
                  background: inLoop ? "rgba(245,158,11,.15)" : undefined,
                  borderRadius: inLoop ? 4 : undefined,
                  padding: inLoop ? "0 1px" : undefined,
                }}
              >
                {word}
              </span>
            )}
            {" "}
          </span>
        );
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [words, currentWordIndex, bookmarkSet, loopRange]
  );

  if (!words.length) return null;

  return (
    <div style={{ position: "relative", flex: 1, minHeight: 0, display: "flex", flexDirection: "column" }}>
      {/* Toggle rolagem automática */}
      <button
        onClick={() => setAutoScroll((v) => !v)}
        aria-pressed={autoScroll}
        title={autoScroll ? "Desativar rolagem automática" : "Ativar rolagem automática"}
        style={{
          position: "absolute",
          top: 10,
          right: 10,
          zIndex: 2,
          display: "inline-flex",
          alignItems: "center",
          gap: 5,
          padding: "4px 9px",
          borderRadius: 999,
          border: "1px solid rgba(120,90,60,.18)",
          background: autoScroll
            ? "linear-gradient(180deg, rgba(59,130,246,.15) 0%, rgba(59,130,246,.06) 100%)"
            : "linear-gradient(180deg, rgba(255,255,255,.6) 0%, rgba(255,255,255,.3) 100%)",
          color: autoScroll ? M.glass : M.ink3,
          fontFamily: M.sans,
          fontSize: 11,
          fontWeight: 600,
          cursor: "pointer",
          boxShadow: "inset 0 1px 0 rgba(255,255,255,.7), 0 1px 2px rgba(120,90,60,.10)",
          transition: "all 0.15s ease",
        }}
      >
        <svg width={10} height={10} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M12 5v14M5 12l7 7 7-7" />
        </svg>
        {autoScroll ? "Auto" : "Manual"}
      </button>

      <div
        ref={containerRef}
        aria-label="Texto sendo lido"
        aria-live="polite"
        style={{
          position: "relative",
          borderRadius: 16,
          ...surface.paper,
          padding: mobile ? 18 : 28,
          flex: 1,
          overflow: "auto",
          minHeight: 0,
          fontFamily: M.serif,
          fontSize: mobile ? 17 : 19,
          lineHeight: 1.85,
          color: M.ink,
          letterSpacing: "-0.005em",
          boxShadow:
            "inset 0 1px 0 rgba(255,255,255,.85), inset 0 -2px 6px rgba(120,90,60,.10), 0 2px 6px rgba(120,90,60,.10), 0 18px 40px -20px rgba(120,90,60,.35)",
        }}
      >
        {content}
      </div>
    </div>
  );
}
