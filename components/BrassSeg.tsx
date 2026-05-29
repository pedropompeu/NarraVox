"use client";
import { M, surface } from "@/lib/designTokens";

const FREE_SPEEDS =    [0.5, 0.75, 1, 1.5, 2] as const;
const PREMIUM_SPEEDS = [2.5, 3, 3.5] as const;

interface BrassSegProps {
  value: number;
  onChange: (s: number) => void;
  disabled?: boolean;
  isPremium?: boolean;
}

export function BrassSeg({ value, onChange, disabled = false, isPremium = false }: BrassSegProps) {
  return (
    <div
      role="tablist"
      aria-label="Velocidade de leitura"
      style={{
        display: "inline-flex",
        flexWrap: "wrap",
        padding: 4,
        borderRadius: 12,
        ...surface.brass,
        boxShadow:
          "inset 0 1px 0 rgba(255,235,170,.65), inset 0 -1px 0 rgba(60,40,10,.40), 0 2px 4px rgba(80,55,5,.35), 0 6px 14px -6px rgba(80,55,5,.4)",
        opacity: disabled ? 0.55 : 1,
      }}
    >
      {FREE_SPEEDS.map((s) => {
        const active = s === value;
        return (
          <button
            key={s}
            role="tab"
            aria-selected={active}
            onClick={() => !disabled && onChange(s)}
            disabled={disabled}
            style={{
              padding: "7px 9px",
              borderRadius: 8,
              border: "none",
              cursor: disabled ? "not-allowed" : "pointer",
              background: active
                ? "linear-gradient(180deg, #FFF6DD 0%, #F4DAA0 50%, #C99B36 100%)"
                : "transparent",
              boxShadow: active
                ? "inset 0 1px 0 rgba(255,255,255,.7), inset 0 -1px 0 rgba(120,80,5,.30), 0 1px 1px rgba(60,40,5,.30)"
                : "none",
              color: active ? "#3A2700" : "#FFE9B6",
              fontFamily: M.sans,
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: "-0.005em",
              fontVariantNumeric: "tabular-nums",
              textShadow: active ? "0 1px 0 rgba(255,255,255,.4)" : "0 1px 0 rgba(60,40,5,.5)",
              transition: "background 0.15s ease",
              minWidth: 36,
            }}
          >
            {s}×
          </button>
        );
      })}

      {/* Divisor visual */}
      <div style={{ width: 1, background: "rgba(60,40,10,.30)", margin: "4px 2px" }} aria-hidden="true" />

      {/* Velocidades Premium */}
      {PREMIUM_SPEEDS.map((s) => {
        const active = s === value;
        const canUse = isPremium;
        return (
          <button
            key={s}
            role="tab"
            aria-selected={active}
            aria-label={canUse ? `${s}× velocidade` : `${s}× — disponível no Premium`}
            onClick={() => { if (!disabled && canUse) onChange(s); }}
            disabled={disabled}
            title={canUse ? undefined : "Disponível no Premium"}
            style={{
              position: "relative",
              padding: "7px 9px",
              borderRadius: 8,
              border: "none",
              cursor: canUse && !disabled ? "pointer" : "not-allowed",
              background: active && canUse
                ? "linear-gradient(180deg, #FFF6DD 0%, #F4DAA0 50%, #C99B36 100%)"
                : "transparent",
              boxShadow: active && canUse
                ? "inset 0 1px 0 rgba(255,255,255,.7), inset 0 -1px 0 rgba(120,80,5,.30), 0 1px 1px rgba(60,40,5,.30)"
                : "none",
              color: canUse ? (active ? "#3A2700" : "#FFE9B6") : "rgba(255,233,182,.4)",
              fontFamily: M.sans,
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: "-0.005em",
              fontVariantNumeric: "tabular-nums",
              minWidth: 36,
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 2,
            }}
          >
            {s}×
            {!canUse && (
              <svg width={8} height={8} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" style={{ opacity: 0.5, marginLeft: 1 }}>
                <path d="M18 11H6V8a6 6 0 1 1 12 0v3zm1 10H5a1 1 0 0 1-1-1V12a1 1 0 0 1 1-1h14a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1z"/>
              </svg>
            )}
          </button>
        );
      })}
    </div>
  );
}
