"use client";
import { useState } from "react";
import Link from "next/link";
import { M, surface } from "@/lib/designTokens";

// ── Input linho com focus ring azul ──────────────────────────────────────────
export function LinenInput(
  props: React.InputHTMLAttributes<HTMLInputElement> & { padRight?: boolean }
) {
  const [focused, setFocused] = useState(false);
  const { padRight, ...rest } = props;
  return (
    <input
      {...rest}
      onFocus={(e) => { setFocused(true); rest.onFocus?.(e); }}
      onBlur={(e)  => { setFocused(false); rest.onBlur?.(e); }}
      style={{
        width: "100%",
        padding: padRight ? "11px 44px 11px 14px" : "11px 14px",
        borderRadius: 12, border: "none", outline: "none",
        ...surface.linen,
        color: M.ink, fontFamily: M.sans, fontSize: 14,
        boxSizing: "border-box",
        boxShadow: focused
          ? "inset 0 1px 3px rgba(120,90,60,.20), inset 0 -1px 0 rgba(255,255,255,.6), 0 0 0 3px rgba(59,130,246,.22)"
          : "inset 0 2px 4px rgba(120,90,60,.18), inset 0 -1px 0 rgba(255,255,255,.7)",
        transition: "box-shadow 0.18s ease",
      }}
    />
  );
}

// ── Botão primário vidro azul ─────────────────────────────────────────────────
export function GlassBtn({
  children,
  disabled,
  type = "submit",
}: {
  children: React.ReactNode;
  disabled?: boolean;
  type?: "submit" | "button";
}) {
  const [pressed, setPressed] = useState(false);
  return (
    <button
      type={type}
      disabled={disabled}
      onMouseDown={() => setPressed(true)}
      onMouseUp={() => setPressed(false)}
      onMouseLeave={() => setPressed(false)}
      style={{
        width: "100%", padding: "12px 0", borderRadius: 12,
        border: "none", cursor: disabled ? "wait" : "pointer",
        background: disabled
          ? `radial-gradient(circle at 50% 55%, ${M.muted} 0%, #6B5544 70%, #4A382B 100%)`
          : pressed
          ? "linear-gradient(180deg, #2563EB 0%, #1D4ED8 50%, #1E40AF 100%)"
          : "linear-gradient(180deg, #60A5FA 0%, #3B82F6 50%, #1D4ED8 100%)",
        boxShadow: disabled
          ? "inset 0 1px 0 rgba(255,255,255,.15), 0 1px 2px rgba(0,0,0,.15)"
          : pressed
          ? "inset 0 1px 3px rgba(0,0,0,.25), inset 0 -1px 0 rgba(255,255,255,.10), 0 1px 2px rgba(29,78,216,.3)"
          : "inset 0 1px 0 rgba(255,255,255,.35), inset 0 -1px 0 rgba(20,50,140,.40), 0 2px 4px rgba(29,78,216,.35), 0 8px 20px -6px rgba(29,78,216,.55)",
        color: "#fff", fontFamily: M.sans, fontSize: 14,
        fontWeight: 700, letterSpacing: "-0.005em",
        transform: pressed ? "translateY(1px)" : "translateY(0)",
        transition: "transform 0.12s ease, box-shadow 0.18s ease, background 0.12s ease",
      }}
    >
      {children}
    </button>
  );
}

// ── Logo pulso NarraVox ───────────────────────────────────────────────────────
export function AuthLogo({ color = M.ink }: { color?: string }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
      stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
      aria-hidden="true">
      <path d="M2 12 L7 12 L9 6 L11 12 L22 12" />
    </svg>
  );
}

// ── Logo row (box brass + nome + badge opcional) ──────────────────────────────
export function LogoRow({
  adminBadge = false,
  href = "/",
}: {
  adminBadge?: boolean;
  href?: string;
}) {
  return (
    <Link href={href} style={{
      display: "inline-flex", alignItems: "center", gap: 10,
      textDecoration: "none",
      marginBottom: adminBadge ? 8 : 36,
      color: M.ink,
    }}>
      <div style={{
        width: 32, height: 32, borderRadius: 10,
        ...surface.brass,
        display: "flex", alignItems: "center", justifyContent: "center",
        boxShadow: "inset 0 1px 0 rgba(255,235,170,.85), inset 0 -1px 0 rgba(60,40,10,.5), 0 2px 4px rgba(80,55,5,.4)",
        color: "#3A2700", flexShrink: 0,
      }}>
        <AuthLogo color="#3A2700" />
      </div>
      <span style={{ fontFamily: M.serif, fontSize: 20, fontWeight: 600, letterSpacing: "-0.02em" }}>
        NarraVox
      </span>
      {adminBadge ? (
        <span style={{
          fontSize: 10, fontWeight: 700, color: "#B45309",
          background: "rgba(245,158,11,.12)", border: "1px solid rgba(245,158,11,.25)",
          padding: "2px 8px", borderRadius: 999,
          letterSpacing: "0.06em", textTransform: "uppercase", fontFamily: M.sans,
        }}>
          Admin
        </span>
      ) : (
        <span style={{ fontFamily: M.serif, fontStyle: "italic", fontSize: 13, color: M.ink3 }}>
          · seu texto, sua voz.
        </span>
      )}
    </Link>
  );
}

// ── Card papel com profundidade ───────────────────────────────────────────────
export function PaperCard({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      borderRadius: 20, ...surface.paper,
      padding: "28px 28px 24px",
      boxShadow: "inset 0 1px 0 rgba(255,255,255,.85), inset 0 -2px 6px rgba(120,90,60,.08), 0 2px 0 rgba(120,90,60,.15), 0 8px 24px -8px rgba(120,90,60,.30), 0 24px 48px -20px rgba(60,40,20,.25)",
    }}>
      {children}
    </div>
  );
}

// ── Shell de página linho ─────────────────────────────────────────────────────
export function PageShell({
  children,
  footer,
}: {
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <div style={{
      minHeight: "100vh", ...surface.linen,
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: "24px 16px",
    }}>
      <div style={{ width: "100%", maxWidth: 400 }}>
        {children}
        {footer && (
          <p style={{
            textAlign: "center", marginTop: 20,
            fontFamily: M.sans, fontSize: 12, color: M.ink3, lineHeight: 1.55,
          }}>
            {footer}
          </p>
        )}
      </div>
    </div>
  );
}

// ── Caixa de feedback erro / sucesso ──────────────────────────────────────────
export function Feedback({ error, success }: { error?: string; success?: string }) {
  const msg = error || success;
  if (!msg) return null;
  return (
    <div style={{
      padding: "10px 13px", borderRadius: 10,
      background: error ? "rgba(197,57,10,.07)" : "rgba(63,122,31,.07)",
      border: `1px solid ${error ? "rgba(197,57,10,.20)" : "rgba(63,122,31,.20)"}`,
      boxShadow: "inset 0 1px 0 rgba(255,255,255,.5)",
      fontFamily: M.sans, fontSize: 12,
      color: error ? "#C5390A" : "#3F7A1F",
      lineHeight: 1.55,
    }}>
      {msg}
    </div>
  );
}
