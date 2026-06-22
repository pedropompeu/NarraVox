"use client";
import { useState, useTransition } from "react";
import { updatePassword } from "../../actions";
import { M } from "@/lib/designTokens";
import { LinenInput, GlassBtn, LogoRow, PaperCard, PageShell, Feedback } from "@/components/AuthUI";

export default function ConfirmResetPage() {
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    const fd = new FormData(e.currentTarget);
    if (fd.get("password") !== fd.get("confirm")) {
      setError("As senhas não coincidem.");
      return;
    }
    startTransition(async () => {
      const res = await updatePassword(fd);
      if (res?.error) setError(res.error);
    });
  }

  return (
    <PageShell
      footer="seus textos ficam em casa · só neste dispositivo"
    >
      <LogoRow href="/auth" />

      <PaperCard>
        <h1 style={{ margin: "0 0 4px", fontFamily: M.serif, fontSize: 24, fontWeight: 600, color: M.ink, letterSpacing: "-0.02em" }}>
          Nova senha
        </h1>
        <p style={{ margin: "0 0 24px", fontFamily: M.sans, fontSize: 13, color: M.ink3 }}>
          Escolha uma senha segura com pelo menos 6 caracteres.
        </p>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {(["password", "confirm"] as const).map((field) => (
            <div key={field}>
              <label style={{ display: "block", marginBottom: 6, fontFamily: M.sans, fontSize: 12, fontWeight: 600, color: M.ink2 }}>
                {field === "password" ? "Nova senha" : "Confirmar senha"}
              </label>
              <LinenInput
                name={field}
                type="password"
                required
                minLength={6}
                autoComplete="new-password"
              />
            </div>
          ))}

          <Feedback error={error} />

          <GlassBtn disabled={isPending}>
            {isPending ? "Salvando…" : "Salvar nova senha"}
          </GlassBtn>
        </form>
      </PaperCard>
    </PageShell>
  );
}
