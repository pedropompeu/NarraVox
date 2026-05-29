"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { M } from "@/lib/designTokens";

const TIMER_OPTIONS = [15, 30, 45, 60] as const;
type TimerMinutes = typeof TIMER_OPTIONS[number];

interface SleepTimerProps {
  isPlaying: boolean;
  onStop: () => void;
  isPremium?: boolean;
}

export function SleepTimer({ isPlaying, onStop, isPremium = false }: SleepTimerProps) {
  const [open, setOpen] = useState(false);
  const [minutes, setMinutes] = useState<TimerMinutes | null>(null);
  const [remaining, setRemaining] = useState(0); // em segundos
  const [expired, setExpired] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const clearTimer = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = null;
  }, []);

  const startTimer = useCallback((mins: TimerMinutes) => {
    clearTimer();
    setMinutes(mins);
    setRemaining(mins * 60);
    setExpired(false);
    setOpen(false);
  }, [clearTimer]);

  const cancelTimer = useCallback(() => {
    clearTimer();
    setMinutes(null);
    setRemaining(0);
    setExpired(false);
  }, [clearTimer]);

  const snooze = useCallback(() => {
    setExpired(false);
    setRemaining(5 * 60);
    setMinutes(null); // sinaliza snooze ativo
  }, []);

  // Tick — só decrementa enquanto tocando
  useEffect(() => {
    if (minutes === null && remaining === 0) return;
    if (!isPlaying) return;

    intervalRef.current = setInterval(() => {
      setRemaining((r) => {
        if (r <= 1) {
          clearTimer();
          setExpired(true);
          onStop();
          return 0;
        }
        return r - 1;
      });
    }, 1000);

    return () => clearTimer();
  }, [isPlaying, minutes, remaining > 0]);

  const formatRemaining = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  const isActive = (minutes !== null || remaining > 0) && !expired;

  return (
    <div style={{ position: "relative" }}>
      {/* Botão principal */}
      <button
        onClick={() => isPremium ? setOpen((v) => !v) : undefined}
        title={isPremium ? (isActive ? `Sleep timer: ${formatRemaining(remaining)}` : "Sleep Timer") : "Disponível no Premium"}
        aria-label="Sleep Timer"
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 5,
          padding: "5px 10px",
          borderRadius: 999,
          border: `1px solid ${isActive ? "rgba(59,130,246,.35)" : "rgba(120,90,60,.18)"}`,
          background: isActive
            ? "rgba(59,130,246,.10)"
            : "linear-gradient(180deg, rgba(255,255,255,.55) 0%, rgba(255,255,255,.25) 100%)",
          color: isActive ? M.glass : isPremium ? M.ink2 : M.muted,
          fontFamily: M.sans,
          fontSize: 11,
          fontWeight: 600,
          cursor: isPremium ? "pointer" : "not-allowed",
          boxShadow: "inset 0 1px 0 rgba(255,255,255,.6)",
          transition: "all 0.15s ease",
          opacity: isPremium ? 1 : 0.6,
        }}
      >
        <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>
        </svg>
        {isActive ? formatRemaining(remaining) : "Timer"}
        {!isPremium && (
          <svg width={9} height={9} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" style={{ opacity: 0.5 }}>
            <path d="M18 11H6V8a6 6 0 1 1 12 0v3zm1 10H5a1 1 0 0 1-1-1V12a1 1 0 0 1 1-1h14a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1z"/>
          </svg>
        )}
        {isActive && (
          <button
            onClick={(e) => { e.stopPropagation(); cancelTimer(); }}
            aria-label="Cancelar timer"
            style={{ background: "none", border: "none", cursor: "pointer", color: "inherit", padding: 0, lineHeight: 1, marginLeft: 2 }}
          >
            ×
          </button>
        )}
      </button>

      {/* Dropdown de opções */}
      {open && isPremium && (
        <div
          style={{
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
            minWidth: 140,
          }}
        >
          <span style={{ fontFamily: M.sans, fontSize: 10, color: M.ink3, padding: "2px 8px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>
            Parar após
          </span>
          {TIMER_OPTIONS.map((m) => (
            <button
              key={m}
              onClick={() => startTimer(m)}
              style={{
                padding: "7px 12px",
                borderRadius: 8,
                border: "none",
                background: minutes === m ? "rgba(59,130,246,.10)" : "transparent",
                color: minutes === m ? M.glass : M.ink2,
                fontFamily: M.sans,
                fontSize: 12,
                fontWeight: 600,
                cursor: "pointer",
                textAlign: "left",
              }}
            >
              {m} minutos
            </button>
          ))}
        </div>
      )}

      {/* Modal de expiração */}
      {expired && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "rgba(0,0,0,.4)",
            zIndex: 50,
            backdropFilter: "blur(4px)",
          }}
          onClick={cancelTimer}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "var(--paper)",
              borderRadius: 20,
              padding: "32px 28px",
              maxWidth: 320,
              width: "90%",
              textAlign: "center",
              boxShadow: "0 24px 64px rgba(0,0,0,.25)",
              border: "1px solid rgba(120,90,60,.15)",
            }}
          >
            <div style={{ fontSize: 36, marginBottom: 12 }}>🌙</div>
            <h2 style={{ margin: "0 0 8px", fontFamily: M.serif, fontSize: 20, fontWeight: 600, color: M.ink }}>
              Sleep Timer encerrado
            </h2>
            <p style={{ margin: "0 0 24px", fontFamily: M.sans, fontSize: 13, color: M.ink3, lineHeight: 1.5 }}>
              A leitura foi pausada. Bons sonhos.
            </p>
            <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
              <button
                onClick={snooze}
                style={{
                  padding: "9px 16px",
                  borderRadius: 10,
                  border: "1px solid rgba(120,90,60,.20)",
                  background: "transparent",
                  color: M.ink2,
                  fontFamily: M.sans,
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                +5 min
              </button>
              <button
                onClick={cancelTimer}
                style={{
                  padding: "9px 16px",
                  borderRadius: 10,
                  border: "none",
                  background: "linear-gradient(180deg, rgba(59,130,246,.9) 0%, rgba(37,99,235,.9) 100%)",
                  color: "#fff",
                  fontFamily: M.sans,
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
