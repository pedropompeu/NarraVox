"use client";
import { useState, useTransition } from "react";
import Link from "next/link";
import { resetPassword } from "../actions";
import { M } from "@/lib/designTokens";
import { LinenInput, GlassBtn, LogoRow, PaperCard, PageShell, Feedback } from "@/components/AuthUI";

export default function ResetPage() {
  const [error, setError]     = useState("");
  const [success, setSuccess] = useState("");
  const [isPending, startTransition] = useTransition();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(""); setSuccess("");
    startTransition(async () => {
      const res = await resetPassword(new FormData(e.currentTarget));
      if (res?.error)        setError(res.error);
      else if (res?.success) setSuccess(res.success);
    });
  }

  return (
    <PageShell
      footer="seus textos ficam em casa · só neste dispositivo"
    >
      <LogoRow href="/auth" />

      <PaperCard>
        <h1 style={{ margin: "0 0 4px", fontFamily: M.serif, fontSize: 24, fontWeight: 600, color: M.ink, letterSpacing: "-0.02em" }}>
          Recuperar senha
        </h1>
        <p style={{ margin: "0 0 24px", fontFamily: M.sans, fontSize: 13, color: M.ink3 }}>
          Enviaremos um link para redefinir sua senha.
        </p>

        {success ? (
          <Feedback success={success} />
        ) : (
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div>
              <label style={{ display: "block", marginBottom: 6, fontFamily: M.sans, fontSize: 12, fontWeight: 600, color: M.ink2 }}>
                Email
              </label>
              <LinenInput name="email" type="email" required autoComplete="email" />
            </div>

            <Feedback error={error} />

            <GlassBtn disabled={isPending}>
              {isPending ? "Enviando…" : "Enviar link de recuperação"}
            </GlassBtn>

            <Link href="/auth" style={{ textAlign: "center", fontFamily: M.sans, fontSize: 12, color: M.glass, textDecoration: "none" }}>
              ← Voltar para o login
            </Link>
          </form>
        )}
      </PaperCard>
    </PageShell>
  );
}
