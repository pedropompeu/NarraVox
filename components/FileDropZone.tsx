"use client";
import { useRef, useState } from "react";
import { M } from "@/lib/designTokens";
import { FREE_PAGE_LIMIT } from "@/lib/pdfExtract";

interface FileDropZoneProps {
  onTxt: (text: string) => void;
  onPdf: (pages: string[], totalPages: number, truncated: boolean, file: File) => void;
}

type DropState = "idle" | "hovering" | "loading" | "error";

export function FileDropZone({ onTxt, onPdf }: FileDropZoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [state, setState] = useState<DropState>("idle");
  const [errorMsg, setErrorMsg] = useState("");

  async function processFile(file: File) {
    const ext = file.name.split(".").pop()?.toLowerCase();
    if (ext !== "txt" && ext !== "pdf") {
      setState("error");
      setErrorMsg("Formato não suportado. Use .txt ou .pdf");
      setTimeout(() => setState("idle"), 3000);
      return;
    }

    setState("loading");
    try {
      if (ext === "txt") {
        const { readTxtFile } = await import("@/lib/pdfExtract");
        const text = await readTxtFile(file);
        onTxt(text);
      } else {
        const { extractPdfPages } = await import("@/lib/pdfExtract");
        const { pages, totalPages, truncated } = await extractPdfPages(file);
        onPdf(pages, totalPages, truncated, file);
      }
      setState("idle");
    } catch {
      setState("error");
      setErrorMsg("Não foi possível ler o arquivo. Tente novamente.");
      setTimeout(() => setState("idle"), 3000);
    }
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  }

  function onInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) processFile(file);
    e.target.value = "";
  }

  const isLoading = state === "loading";
  const isError = state === "error";
  const isHovering = state === "hovering";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <div
        onDragOver={(e) => { e.preventDefault(); setState("hovering"); }}
        onDragLeave={() => setState("idle")}
        onDrop={onDrop}
        onClick={() => !isLoading && inputRef.current?.click()}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === "Enter" && inputRef.current?.click()}
        aria-label="Carregar arquivo TXT ou PDF"
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "9px 14px",
          borderRadius: 12,
          border: `1.5px dashed ${isError ? "#C5390A" : isHovering ? M.glass : "rgba(120,90,60,.30)"}`,
          background: isHovering
            ? "rgba(59,130,246,.06)"
            : isError
            ? "rgba(197,57,10,.04)"
            : "rgba(255,255,255,.35)",
          cursor: isLoading ? "wait" : "pointer",
          transition: "all 0.15s ease",
          userSelect: "none",
        }}
      >
        {/* Ícone */}
        <span style={{ color: isError ? "#C5390A" : M.ink3, flexShrink: 0 }}>
          {isLoading ? (
            <svg className="spin" width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
              <path d="M21 12a9 9 0 1 1-6.219-8.56" />
            </svg>
          ) : isError ? (
            <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
              <circle cx="12" cy="12" r="10" /><path d="M12 8v4m0 4h.01" />
            </svg>
          ) : (
            <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="12" y1="18" x2="12" y2="12" />
              <line x1="9" y1="15" x2="15" y2="15" />
            </svg>
          )}
        </span>

        {/* Texto */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <span style={{ fontFamily: M.sans, fontSize: 12, fontWeight: 600, color: isError ? "#C5390A" : M.ink2 }}>
            {isLoading
              ? "Lendo arquivo…"
              : isError
              ? errorMsg
              : isHovering
              ? "Solte aqui"
              : "Carregar .txt ou .pdf"}
          </span>
          {!isLoading && !isError && (
            <span style={{ display: "block", fontFamily: M.sans, fontSize: 11, color: M.ink3, marginTop: 1 }}>
              arraste ou clique · PDF gratuito: até {FREE_PAGE_LIMIT} páginas
            </span>
          )}
        </div>
      </div>

      {/* Aviso de privacidade — task #5 */}
      <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
        <span style={{
          width: 6, height: 6, borderRadius: "50%", flexShrink: 0,
          background: "radial-gradient(circle at 35% 30%, #BBD89F, #6FA046)",
        }} />
        <span style={{ fontFamily: M.sans, fontSize: 10, color: M.ink3, fontStyle: "italic" }}>
          seu arquivo é processado localmente — nada é enviado a servidores.
        </span>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept=".txt,.pdf"
        onChange={onInputChange}
        style={{ display: "none" }}
        aria-hidden="true"
      />
    </div>
  );
}
