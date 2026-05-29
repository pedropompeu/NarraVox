"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { M } from "@/lib/designTokens";

const INTERVAL_OPTIONS = [5, 10, 15] as const;
type IntervalMinutes = typeof INTERVAL_OPTIONS[number];

interface StudyPauseProps {
  isPlaying: boolean;
  elapsedSeconds: number;
  onPause: () => void;
}

export function StudyPause({ isPlaying, elapsedSeconds, onPause }: StudyPauseProps) {
  const [open, setOpen] = useState(false);
  const [interval, setInterval_] = useState<IntervalMinutes | null>(null);
  const [showBanner, setShowBanner] = useState(false);
  const lastPauseRef = useRef(0);

  const activate = useCallback((mins: IntervalMinutes) => {
    setInterval_(mins);
    lastPauseRef.current = elapsedSeconds;
    setOpen(false);
  }, [elapsedSeconds]);

  const deactivate = useCallback(() => {
    setInterval_(null);
    setShowBanner(false);
  }, []);

  // Detecta quando o intervalo foi atingido
  useEffect(() => {
    if (!interval || !isPlaying) return;
    const elapsed = elapsedSeconds - lastPauseRef.current;
    if (elapsed >= interval * 60) {
      onPause();
      lastPauseRef.current = elapsedSeconds;
      setShowBanner(true);
    }
  }, [elapsedSeconds, interval, isPlaying, onPause]);

  const isActive = interval !== null;

  return (
    <>
      <div style={{ position: "relative" }}>
        <button
          onClick={() => setOpen((v) => !v)}
          title={isActive ? `Pausa a cada ${interval} min` : "Pausa de estudo"}
          aria-label="Pausa periódica de estudo"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 5,
            padding: "5px 10px",
            borderRadius: 999,
            border: `1px solid ${isActive ? "rgba(63,122,31,.35)" : "rgba(120,90,60,.18)"}`,
            background: isActive
              ? "rgba(63,122,31,.10)"
              : "linear-gradient(180deg, rgba(255,255,255,.55) 0%, rgba(255,255,255,.25) 100%)",
            color: isActive ? "#3F7A1F" : M.ink2,
            fontFamily: M.sans,
            fontSize: 11,
            fontWeight: 600,
            cursor: "pointer",
            boxShadow: "inset 0 1px 0 rgba(255,255,255,.6)",
            transition: "all 0.15s ease",
          }}
        >
          <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
            <rect x="6" y="4" width="4" height="16" rx="1"/><rect x="14" y="4" width="4" height="16" rx="1"/>
          </svg>
          {isActive ? `/${interval}min` : "Pausas"}
          {isActive && (
            <button
              onClick={(e) => { e.stopPropagation(); deactivate(); }}
              aria-label="Desativar pausas periódicas"
              style={{ background: "none", border: "none", cursor: "pointer", color: "inherit", padding: 0, lineHeight: 1, marginLeft: 2 }}
            >×</button>
          )}
        </button>

        {open && (
          <div style={{
            position: "absolute",
            bottom: "calc(100% + 8px)",
            left: 0,
            background: "var(--paper)",
            border: "1px solid rgba(120,90,60,.18)",
            borderRadius: 12,
            padding: 8,
            display: "flex",
            flexDirection: "column",
            gap: 4,
            boxShadow: "0 8px 24px rgba(0,0,0,.15)",
            zIndex: 20,
            minWidth: 150,
          }}>
            <span style={{ fontFamily: M.sans, fontSize: 10, color: M.ink3, padding: "2px 8px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Pausar a cada
            </span>
            {INTERVAL_OPTIONS.map((m) => (
              <button key={m} onClick={() => activate(m)} style={{
                padding: "7px 12px",
                borderRadius: 8,
                border: "none",
                background: interval === m ? "rgba(63,122,31,.10)" : "transparent",
                color: interval === m ? "#3F7A1F" : M.ink2,
                fontFamily: M.sans,
                fontSize: 12,
                fontWeight: 600,
                cursor: "pointer",
                textAlign: "left",
              }}>
                {m} minutos
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Banner de pausa */}
      {showBanner && (
        <div style={{
          position: "fixed",
          bottom: 24,
          left: "50%",
          transform: "translateX(-50%)",
          background: "var(--paper)",
          border: "1px solid rgba(63,122,31,.25)",
          borderRadius: 16,
          padding: "14px 20px",
          display: "flex",
          alignItems: "center",
          gap: 12,
          boxShadow: "0 8px 32px rgba(0,0,0,.18)",
          zIndex: 50,
          fontFamily: M.sans,
          fontSize: 13,
          color: M.ink2,
          maxWidth: 360,
          width: "90vw",
        }}>
          <span style={{ fontSize: 20 }}>📚</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, color: M.ink, marginBottom: 2 }}>Pausa de estudo</div>
            <div style={{ fontSize: 12, color: M.ink3 }}>Retome quando estiver pronto.</div>
          </div>
          <button onClick={() => setShowBanner(false)} style={{
            padding: "6px 12px",
            borderRadius: 8,
            border: "none",
            background: "#3F7A1F",
            color: "#fff",
            fontFamily: M.sans,
            fontSize: 12,
            fontWeight: 600,
            cursor: "pointer",
          }}>OK</button>
        </div>
      )}
    </>
  );
}
