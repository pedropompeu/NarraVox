"use client";
import { useState, useTransition, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { signIn, signUp } from "./actions";
import { M, surface } from "@/lib/designTokens";
import {
  LinenInput,
  GlassBtn,
  LogoRow,
  PaperCard,
  PageShell,
  Feedback,
} from "@/components/AuthUI";

// ── Campo de senha com toggle mostrar/ocultar ─────────────────────────────────
function PasswordField({
  label,
  autoComplete = "current-password",
  forgotHref,
}: {
  label: string;
  autoComplete?: string;
  forgotHref?: string;
}) {
  const [show, setShow] = useState(false);
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
        <label style={{ fontFamily: M.sans, fontSize: 12, fontWeight: 600, color: M.ink2 }}>
          {label}
        </label>
        {forgotHref && (
          <Link href={forgotHref} style={{ fontFamily: M.sans, fontSize: 12, color: M.glass, textDecoration: "none", fontWeight: 600 }}>
            Esqueci a senha
          </Link>
        )}
      </div>
      <div style={{ position: "relative" }}>
        <LinenInput
          name="password"
          type={show ? "text" : "password"}
          required
          minLength={6}
          autoComplete={autoComplete}
          padRight
        />
        <button
          type="button"
          tabIndex={-1}
          onClick={() => setShow((v) => !v)}
          aria-label={show ? "Ocultar senha" : "Mostrar senha"}
          style={{
            position: "absolute", right: 12, top: "50%",
            transform: "translateY(-50%)",
            background: "none", border: "none", padding: 0,
            cursor: "pointer",
            fontFamily: M.sans, fontSize: 12, fontWeight: 600,
            color: M.ink3, lineHeight: 1,
          }}
        >
          {show ? "ocultar" : "mostrar"}
        </button>
      </div>
    </div>
  );
}

// ── Tabs cerâmicas Entrar / Criar conta ───────────────────────────────────────
type Mode = "login" | "signup";
function CeramicTabs({ mode, onChange }: { mode: Mode; onChange: (m: Mode) => void }) {
  return (
    <div style={{
      display: "flex", padding: 4, borderRadius: 14,
      ...surface.ceramic,
      boxShadow: "inset 0 1px 3px rgba(120,90,60,.25), inset 0 -1px 0 rgba(255,255,255,.6)",
      gap: 4, marginBottom: 24,
    }}>
      {(["login", "signup"] as const).map((m) => {
        const active = mode === m;
        return (
          <button key={m} type="button" onClick={() => onChange(m)} style={{
            flex: 1, padding: "8px 0", borderRadius: 10,
            border: "none", cursor: "pointer",
            background: active
              ? "linear-gradient(180deg, rgba(255,255,255,.92) 0%, rgba(240,232,218,.85) 100%)"
              : "transparent",
            boxShadow: active
              ? "inset 0 1px 0 rgba(255,255,255,.9), inset 0 -1px 0 rgba(120,90,60,.12), 0 1px 3px rgba(120,90,60,.18)"
              : "none",
            color: active ? M.ink : M.ink3,
            fontFamily: M.sans, fontSize: 13, fontWeight: active ? 700 : 500,
            transition: "all 0.15s ease",
          }}>
            {m === "login" ? "Entrar" : "Criar conta"}
          </button>
        );
      })}
    </div>
  );
}

// ── Formulário principal (login + signup) ─────────────────────────────────────
function RegularForm({ redirectTo }: { redirectTo: string }) {
  const [mode, setMode] = useState<Mode>("login");
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  function reset() { setError(""); }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    reset();
    const fd = new FormData(e.currentTarget);
    fd.set("redirect", redirectTo);
    startTransition(async () => {
      if (mode === "signup") {
        const res = await signUp(fd);
        if (res?.error) setError(res.error);
      } else {
        const res = await signIn(fd);
        if (res?.error) setError(res.error);
      }
    });
  }

  return (
    <PageShell
      footer={
        <>
          Sem conta? O NarraVox funciona 100% local —{" "}
          <Link href="/" style={{ color: M.glass, textDecoration: "none", fontWeight: 600 }}>
            use sem entrar
          </Link>
        </>
      }
    >
      <LogoRow />

      <PaperCard>
        <h1 style={{
          margin: "0 0 4px", fontFamily: M.serif, fontSize: 28, fontWeight: 600,
          color: M.ink, letterSpacing: "-0.02em",
        }}>
          {mode === "signup" ? "Crie sua conta" : "Bem-vindo de volta"}
        </h1>
        <p style={{ margin: "0 0 22px", fontFamily: M.sans, fontSize: 14, color: M.ink3 }}>
          {mode === "signup"
            ? "guarde seu histórico em qualquer aparelho"
            : "continue de onde o ouvido parou"}
        </p>

        <CeramicTabs mode={mode} onChange={(m) => { setMode(m); reset(); }} />

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>

          {mode === "signup" && (
            <div>
              <label style={{ display: "block", marginBottom: 6, fontFamily: M.sans, fontSize: 12, fontWeight: 600, color: M.ink2 }}>
                Nome
              </label>
              <LinenInput name="name" type="text" autoComplete="name" />
            </div>
          )}

          <div>
            <label style={{ display: "block", marginBottom: 6, fontFamily: M.sans, fontSize: 12, fontWeight: 600, color: M.ink2 }}>
              E-mail
            </label>
            <LinenInput name="email" type="email" autoComplete="email" required />
          </div>

          <PasswordField
            label="Senha"
            autoComplete={mode === "signup" ? "new-password" : "current-password"}
            forgotHref={mode === "login" ? "/auth/reset" : undefined}
          />

          {mode === "signup" && (
            <p style={{ margin: 0, fontFamily: M.sans, fontSize: 12, color: M.ink3, lineHeight: 1.55 }}>
              Ao criar conta você aceita guardar seu histórico na nuvem. O modo local continua grátis e sem cadastro.
            </p>
          )}

          <Feedback error={error} />

          <GlassBtn disabled={isPending}>
            {isPending ? "Aguarde…" : mode === "signup" ? "Criar conta" : "Entrar"}
          </GlassBtn>
        </form>
      </PaperCard>
    </PageShell>
  );
}

// ── Formulário admin ──────────────────────────────────────────────────────────
function AdminForm({ redirectTo }: { redirectTo: string }) {
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    const fd = new FormData(e.currentTarget);
    fd.set("redirect", redirectTo);
    startTransition(async () => {
      const res = await signIn(fd);
      if (res?.error) setError(res.error);
    });
  }

  return (
    <PageShell
      footer={
        <>
          Tentativas de acesso são registradas.{" "}
          <span style={{ color: M.ink3 }}>Problemas para entrar? Fale com o time de infraestrutura.</span>
        </>
      }
    >
      <LogoRow adminBadge />

      <p style={{
        margin: "0 0 28px",
        fontFamily: M.sans, fontSize: 12, color: M.ink3,
        display: "flex", alignItems: "center", gap: 5,
      }}>
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
          strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
          <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
        </svg>
        conexão segura · acesso restrito
      </p>

      <PaperCard>
        <h1 style={{
          margin: "0 0 4px", fontFamily: M.serif, fontSize: 25, fontWeight: 600,
          color: M.ink, letterSpacing: "-0.02em",
        }}>
          Painel administrativo
        </h1>
        <p style={{ margin: "0 0 22px", fontFamily: M.sans, fontSize: 13.5, color: M.ink3 }}>
          entre com suas credenciais de operador
        </p>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div>
            <label style={{ display: "block", marginBottom: 6, fontFamily: M.sans, fontSize: 12, fontWeight: 600, color: M.ink2 }}>
              E-mail corporativo
            </label>
            <LinenInput name="email" type="email" autoComplete="email" required />
          </div>

          <PasswordField label="Senha" />

          <Feedback error={error} />

          <GlassBtn disabled={isPending}>
            {isPending ? "Aguarde…" : "Acessar painel"}
          </GlassBtn>
        </form>
      </PaperCard>
    </PageShell>
  );
}

// ── Roteador de variante ───────────────────────────────────────────────────────
function AuthContent() {
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") ?? "/app";
  return redirectTo.startsWith("/admin")
    ? <AdminForm redirectTo={redirectTo} />
    : <RegularForm redirectTo={redirectTo} />;
}

export default function AuthClient() {
  return (
    <Suspense>
      <AuthContent />
    </Suspense>
  );
}
