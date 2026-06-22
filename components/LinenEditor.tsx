"use client";
import { useState } from "react";
import { M, surface } from "@/lib/designTokens";
import { MAX_TEXT_CHARS } from "@/lib/historyUtils";
import { FileDropZone } from "./FileDropZone";
import { PageNavigator } from "./PageNavigator";
import { FREE_PAGE_LIMIT } from "@/lib/pdfExtract";

const SAMPLE_TEXT =
  "Profissionais e estudantes acumulam textos digitais que raramente conseguem ler por falta de tempo de atenção visual. NarraVox transforma qualquer texto colado em áudio com destaque de palavra em tempo real — sem cadastro, sem instalação. Cole, escolha sua voz e ouça enquanto faz outra coisa. O backlog finalmente vira ouvido. Tempo passivo, conteúdo ativo.";

export interface LinenEditorProps {
  value: string;
  onChange: (v: string) => void;
  onPdfPages?: (pages: string[]) => void;
  onPdfFile?: (file: File | null) => void;
  onPageChange?: (page: number) => void;
  mobile?: boolean;
}

function PaperPill({ children }: { children: React.ReactNode }) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        padding: "5px 11px",
        borderRadius: 999,
        fontFamily: M.sans,
        fontSize: 12,
        color: M.ink2,
        fontWeight: 500,
        letterSpacing: "-0.005em",
        background:
          "linear-gradient(180deg, rgba(255,255,255,.7) 0%, rgba(255,255,255,.3) 100%)",
        boxShadow:
          "inset 0 1px 0 rgba(255,255,255,.8), 0 1px 0 rgba(120,90,60,.18), 0 1px 2px rgba(120,90,60,.12)",
        border: "1px solid rgba(120,90,60,.18)",
      }}
    >
      {children}
    </span>
  );
}

export function LinenEditor({ value, onChange, onPdfPages, onPdfFile, onPageChange, mobile = false }: LinenEditorProps) {
  const [focused, setFocused] = useState(false);
  const [pdfPages, setPdfPages] = useState<string[] | null>(null);
  const [pdfTruncated, setPdfTruncated] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);

  const words = value.trim() ? value.trim().split(/\s+/).length : 0;
  const mins = Math.max(1, Math.round(words / 180));
  const isOverLimit = value.length > MAX_TEXT_CHARS;
  const isPdf = pdfPages !== null;

  function handleTxt(text: string) {
    setPdfPages(null);
    onChange(text);
    onPdfPages?.([]);
    onPdfFile?.(null);
  }

  function handlePdf(pages: string[], totalPages: number, truncated: boolean, file: File) {
    setPdfPages(pages);
    setPdfTruncated(truncated);
    setCurrentPage(0);
    onChange(pages[0] ?? "");
    onPdfPages?.(pages);
    onPdfFile?.(file);
  }

  function goToPage(page: number) {
    if (!pdfPages) return;
    setCurrentPage(page);
    onChange(pdfPages[page] ?? "");
    onPageChange?.(page);
  }

  function clearPdf() {
    setPdfPages(null);
    onChange("");
    onPdfPages?.([]);
    onPdfFile?.(null);
  }

  return (
    <section style={{ display: "flex", flexDirection: "column", height: "100%", minHeight: 0, gap: 10 }}>
      {/* Header row */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
        <div>
          <h2 style={{ margin: 0, fontFamily: M.serif, fontSize: 18, fontWeight: 600, color: M.ink, letterSpacing: "-0.01em" }}>
            {isPdf ? (
              <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ color: M.ink3 }}>
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" />
                </svg>
                PDF carregado
                <button onClick={clearPdf} style={{ background: "none", border: "none", cursor: "pointer", color: M.ink3, fontFamily: M.sans, fontSize: 11, padding: "2px 6px", borderRadius: 6, fontWeight: 500 }}>
                  × trocar
                </button>
              </span>
            ) : "Seu texto"}
          </h2>
          <p style={{ margin: "3px 0 0", fontFamily: M.sans, fontSize: 12, color: M.ink3 }}>
            {isPdf ? `${pdfPages!.length} páginas extraídas` : "cole ou digite — começa em segundos"}
          </p>
        </div>

        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          {words > 0 ? (
            <>
              <PaperPill>
                <svg width={11} height={11} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M3 21l5.5-2.5L20 7c1-1 1-3 0-4s-3-1-4 0L4.5 14 2 21z" /><path d="M14 5l4 4" />
                </svg>{" "}
                {words.toLocaleString("pt-BR")} palavras
              </PaperPill>
              <PaperPill>~{mins} min</PaperPill>
            </>
          ) : !isPdf ? (
            <button type="button" onClick={() => onChange(SAMPLE_TEXT)} style={{ fontFamily: M.sans, fontSize: 12, color: M.glass, background: "none", border: "none", cursor: "pointer", padding: "5px 11px", borderRadius: 999, fontWeight: 500 }}>
              Carregar exemplo
            </button>
          ) : null}
        </div>
      </div>

      {/* Drop zone — visível quando não há PDF ativo */}
      {!isPdf && <FileDropZone onTxt={handleTxt} onPdf={handlePdf} />}

      {/* Navegador de páginas — só para PDF */}
      {isPdf && (
        <PageNavigator
          currentPage={currentPage}
          totalPages={pdfPages!.length}
          truncated={pdfTruncated}
          freePagesLimit={FREE_PAGE_LIMIT}
          onPrev={() => goToPage(currentPage - 1)}
          onNext={() => goToPage(currentPage + 1)}
        />
      )}

      {/* Textarea */}
      <div
        style={{
          position: "relative",
          flex: 1,
          minHeight: mobile ? 180 : 320,
          borderRadius: 14,
          ...surface.linen,
          boxShadow: focused
            ? "inset 0 1px 0 rgba(255,255,255,.8), inset 0 0 0 1px rgba(180,140,90,.4), 0 0 0 4px rgba(59,130,246,.18), 0 2px 6px rgba(120,90,60,.15)"
            : "inset 0 1px 0 rgba(255,255,255,.8), inset 0 -2px 6px rgba(120,90,60,.10), inset 0 8px 16px -10px rgba(120,90,60,.30), 0 1px 0 rgba(255,255,255,.6), 0 8px 20px -10px rgba(120,90,60,.30)",
          transition: "box-shadow 0.18s ease",
        }}
      >
        <textarea
          value={value}
          onChange={(e) => { if (!isPdf) onChange(e.target.value); }}
          readOnly={isPdf}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder="Cole aqui o texto que você quer ouvir…"
          aria-label="Texto para leitura"
          style={{
            width: "100%",
            height: "100%",
            minHeight: mobile ? 180 : 320,
            padding: mobile ? 18 : 26,
            border: "none",
            borderRadius: 14,
            background: "transparent",
            resize: "none",
            fontFamily: M.serif,
            fontSize: 16,
            lineHeight: 1.7,
            color: isPdf ? M.ink2 : M.ink,
            outline: "none",
            letterSpacing: "-0.005em",
            cursor: isPdf ? "default" : "text",
          }}
        />
        <div aria-hidden="true" style={{ position: "absolute", left: 12, right: 12, bottom: 6, height: 3, background: "linear-gradient(180deg, rgba(255,255,255,.6), rgba(120,90,60,0))", borderRadius: 2 }} />
      </div>

      {isOverLimit && !isPdf && (
        <p style={{ margin: 0, fontFamily: M.sans, fontSize: 11, color: "#C5390A", fontStyle: "italic" }}>
          Texto longo — histórico salva os primeiros 100 mil caracteres.
        </p>
      )}
    </section>
  );
}
