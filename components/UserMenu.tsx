"use client";
import { useState, useTransition } from "react";
import Link from "next/link";
import { M } from "@/lib/designTokens";
import { signOut, resendConfirmation } from "@/app/auth/actions";
import type { UserProfile } from "@/hooks/useUser";

interface UserMenuProps {
  user: UserProfile;
}

export function UserMenu({ user }: UserMenuProps) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [resent, setResent] = useState(false);

  const initials = user.email.slice(0, 2).toUpperCase();
  const label = user.premium ? "Premium" : "Free";
  const labelColor = user.premium ? "#B45309" : "var(--ink-3)";

  function handleSignOut() {
    startTransition(() => signOut());
  }

  function handleResend() {
    startTransition(async () => {
      await resendConfirmation();
      setResent(true);
    });
  }

  return (
    <div style={{ position: "relative" }}>
      {/* Avatar botão */}
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="Menu do usuário"
        aria-expanded={open}
        style={{
          width: 34, height: 34, borderRadius: "50%",
          background: user.premium
            ? "linear-gradient(135deg, #F59E0B, #B45309)"
            : "linear-gradient(135deg, rgba(120,90,60,.25), rgba(120,90,60,.15))",
          border: "1px solid rgba(120,90,60,.20)",
          color: user.premium ? "#fff" : "var(--ink-2)",
          fontFamily: M.sans, fontSize: 11, fontWeight: 700,
          cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: "inset 0 1px 0 rgba(255,255,255,.3)",
        }}
      >
        {initials}
      </button>

      {/* Dropdown */}
      {open && (
        <>
          <div onClick={() => setOpen(false)} style={{ position: "fixed", inset: 0, zIndex: 19 }} />
          <div style={{
            position: "absolute", top: "calc(100% + 8px)", right: 0,
            background: "var(--paper)", border: "1px solid rgba(120,90,60,.15)",
            borderRadius: 14, padding: "8px 0",
            boxShadow: "0 8px 32px rgba(0,0,0,.12)",
            zIndex: 20, minWidth: 220,
          }}>
            {/* Info do usuário */}
            <div style={{ padding: "10px 14px 12px", borderBottom: "1px solid rgba(120,90,60,.10)" }}>
              <div style={{ fontFamily: M.sans, fontSize: 13, fontWeight: 600, color: "var(--ink)", marginBottom: 2 }}>
                {user.email.length > 26 ? user.email.slice(0, 24) + "…" : user.email}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{
                  fontFamily: M.sans, fontSize: 11, fontWeight: 700, color: labelColor,
                  background: user.premium ? "rgba(245,158,11,.10)" : "rgba(120,90,60,.08)",
                  padding: "2px 7px", borderRadius: 999,
                  border: `1px solid ${user.premium ? "rgba(245,158,11,.25)" : "rgba(120,90,60,.15)"}`,
                }}>
                  {label}
                </span>
                {!user.premium && (
                  <Link href="/auth" style={{ fontFamily: M.sans, fontSize: 11, color: "var(--accent-primary)", textDecoration: "none", fontWeight: 600 }}>
                    Quero Premium →
                  </Link>
                )}
              </div>
            </div>

            {/* Email não confirmado */}
            {!user.emailConfirmed && (
              <div style={{ padding: "10px 14px", borderBottom: "1px solid rgba(120,90,60,.10)", background: "rgba(59,130,246,.04)" }}>
                <div style={{ fontFamily: M.sans, fontSize: 11, color: "var(--ink-2)", lineHeight: 1.5, marginBottom: 6 }}>
                  Email ainda não confirmado.
                </div>
                <button
                  onClick={handleResend}
                  disabled={isPending || resent}
                  style={{
                    padding: "4px 10px", borderRadius: 6, border: "none",
                    background: resent ? "rgba(63,122,31,.10)" : "var(--accent-primary)",
                    color: resent ? "#3F7A1F" : "#fff",
                    fontFamily: M.sans, fontSize: 11, fontWeight: 600, cursor: "pointer",
                  }}
                >
                  {resent ? "Email enviado ✓" : isPending ? "Enviando…" : "Reenviar email"}
                </button>
              </div>
            )}

            {/* Sair */}
            <button
              onClick={handleSignOut}
              disabled={isPending}
              style={{
                width: "100%", padding: "9px 14px", border: "none",
                background: "transparent", textAlign: "left",
                fontFamily: M.sans, fontSize: 13, color: "#C5390A",
                cursor: "pointer", display: "flex", alignItems: "center", gap: 8,
              }}
            >
              <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
              </svg>
              Sair
            </button>
          </div>
        </>
      )}
    </div>
  );
}
