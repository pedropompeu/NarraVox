"use client";
import Link from "next/link";
import { M } from "@/lib/designTokens";
import type { RateLimitReason } from "@/store/playerStore";

interface UpgradeModalProps {
  reason: RateLimitReason;
  onDismiss: () => void;
}

const COPY: Record<NonNullable<RateLimitReason>, { title: string; body: string; cta: string }> = {
  duplicate: {
    title: "Trecho já processado hoje",
    body: "Este trecho de áudio já foi gerado nas últimas 24 horas. No plano Premium, não há restrição por texto — ouça quantas vezes quiser.",
    cta: "Quero Premium",
  },
  daily_quota: {
    title: "Limite diário atingido",
    body: "Você chegou ao limite de áudios do plano gratuito por hoje. O plano Premium não tem limite diário — ouça quantos textos quiser, sem interrupção.",
    cta: "Desbloquear Premium",
  },
};

export function UpgradeModal({ reason, onDismiss }: UpgradeModalProps) {
  if (!reason) return null;
  const copy = COPY[reason];

  return (
    <div
      style={{
        position: "fixed", inset: 0, zIndex: 60,
        display: "flex", alignItems: "center", justifyContent: "center",
        background: "rgba(0,0,0,.45)", backdropFilter: "blur(4px)",
        padding: 24,
      }}
      onClick={onDismiss}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "var(--paper)", borderRadius: 20,
          border: "1px solid rgba(120,90,60,.15)",
          boxShadow: "0 24px 64px rgba(0,0,0,.22)",
          padding: "32px 28px", maxWidth: 380, width: "100%",
          display: "flex", flexDirection: "column", gap: 18,
        }}
      >
        {/* Ícone */}
        <div style={{ fontSize: 36, textAlign: "center" }}>🔒</div>

        {/* Copy */}
        <div style={{ textAlign: "center" }}>
          <h2 style={{ margin: "0 0 8px", fontFamily: M.serif, fontSize: 21, fontWeight: 600, color: "var(--ink)", letterSpacing: "-0.02em" }}>
            {copy.title}
          </h2>
          <p style={{ margin: 0, fontFamily: M.sans, fontSize: 13, color: "var(--ink-3)", lineHeight: 1.6 }}>
            {copy.body}
          </p>
        </div>

        {/* Comparação rápida */}
        <div style={{ background: "rgba(120,90,60,.06)", borderRadius: 12, padding: "14px 16px", display: "flex", flexDirection: "column", gap: 8 }}>
          {[
            { label: "Limite diário", free: "120 chunks/dia", premium: "Ilimitado" },
            { label: "Repetir texto", free: "1× por 24h", premium: "Ilimitado" },
            { label: "Velocidade", free: "até 2×", premium: "até 3,5×" },
          ].map((row) => (
            <div key={row.label} style={{ display: "flex", justifyContent: "space-between", fontFamily: M.sans, fontSize: 12 }}>
              <span style={{ color: "var(--ink-3)" }}>{row.label}</span>
              <span style={{ display: "flex", gap: 16 }}>
                <span style={{ color: "var(--ink-muted)" }}>{row.free}</span>
                <span style={{ color: "#3F7A1F", fontWeight: 600 }}>{row.premium}</span>
              </span>
            </div>
          ))}
        </div>

        {/* CTAs */}
        <div style={{ display: "flex", gap: 10 }}>
          <button
            onClick={onDismiss}
            style={{
              flex: 1, padding: "10px 0", borderRadius: 10,
              border: "1px solid rgba(120,90,60,.20)",
              background: "transparent", color: "var(--ink-3)",
              fontFamily: M.sans, fontSize: 13, fontWeight: 600, cursor: "pointer",
            }}
          >
            Agora não
          </button>
          <Link
            href="/auth"
            onClick={onDismiss}
            style={{
              flex: 2, padding: "10px 0", borderRadius: 10,
              background: "linear-gradient(135deg, #F59E0B, #B45309)",
              color: "#fff", fontFamily: M.sans, fontSize: 13, fontWeight: 700,
              textDecoration: "none", textAlign: "center", display: "flex",
              alignItems: "center", justifyContent: "center",
            }}
          >
            {copy.cta} →
          </Link>
        </div>
      </div>
    </div>
  );
}
