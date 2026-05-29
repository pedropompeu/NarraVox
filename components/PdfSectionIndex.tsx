"use client";
import { useState, useEffect } from "react";
import { M } from "@/lib/designTokens";
import type { PdfSection } from "@/lib/pdfSections";

interface PdfSectionIndexProps {
  file: File | null;
  maxPages: number;
  currentPage: number;
  onNavigate: (pageIndex: number) => void;
}

export function PdfSectionIndex({ file, maxPages, currentPage, onNavigate }: PdfSectionIndexProps) {
  const [sections, setSections] = useState<PdfSection[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!file) { setSections([]); return; }
    let cancelled = false;
    setLoading(true);
    import("@/lib/pdfSections").then(({ extractSections }) =>
      extractSections(file, maxPages)
    ).then((s) => {
      if (!cancelled) { setSections(s); setLoading(false); }
    }).catch(() => {
      if (!cancelled) setLoading(false);
    });
    return () => { cancelled = true; };
  }, [file, maxPages]);

  if (!file || (!loading && sections.length === 0)) return null;

  return (
    <div style={{ position: "relative" }}>
      <button
        onClick={() => setOpen((v) => !v)}
        disabled={loading}
        aria-label="Índice de seções do PDF"
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
          padding: "5px 11px",
          borderRadius: 10,
          border: "1px solid rgba(120,90,60,.18)",
          background: open
            ? "linear-gradient(180deg, rgba(255,255,255,.8) 0%, rgba(255,255,255,.45) 100%)"
            : "linear-gradient(180deg, rgba(255,255,255,.55) 0%, rgba(255,255,255,.25) 100%)",
          boxShadow: "inset 0 1px 0 rgba(255,255,255,.8), 0 1px 2px rgba(120,90,60,.10)",
          color: M.ink2,
          fontFamily: M.sans,
          fontSize: 12,
          fontWeight: 600,
          cursor: loading ? "wait" : "pointer",
          opacity: loading ? 0.6 : 1,
        }}
      >
        {loading ? (
          <svg className="spin" width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
            <path d="M21 12a9 9 0 1 1-6.219-8.56" />
          </svg>
        ) : (
          <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/>
            <line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/>
          </svg>
        )}
        Índice
        {sections.length > 0 && (
          <span style={{
            background: "rgba(120,90,60,.15)",
            borderRadius: 999,
            fontSize: 10,
            fontWeight: 700,
            padding: "1px 6px",
            color: M.ink3,
          }}>
            {sections.length}
          </span>
        )}
      </button>

      {open && sections.length > 0 && (
        <div style={{
          position: "absolute",
          top: "calc(100% + 8px)",
          left: 0,
          background: "var(--paper)",
          border: "1px solid rgba(120,90,60,.18)",
          borderRadius: 14,
          padding: "8px 0",
          boxShadow: "0 8px 32px rgba(0,0,0,.15)",
          zIndex: 20,
          minWidth: 260,
          maxHeight: 320,
          overflowY: "auto",
        }}>
          <div style={{ padding: "4px 14px 8px", fontFamily: M.sans, fontSize: 10, color: M.ink3, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", borderBottom: "1px solid rgba(120,90,60,.10)" }}>
            Seções detectadas
          </div>
          {sections.map((s, i) => {
            const isActive = s.pageIndex === currentPage;
            return (
              <button
                key={i}
                onClick={() => { onNavigate(s.pageIndex); setOpen(false); }}
                style={{
                  display: "flex",
                  width: "100%",
                  alignItems: "center",
                  gap: 10,
                  padding: "8px 14px",
                  border: "none",
                  background: isActive ? "rgba(59,130,246,.06)" : "transparent",
                  color: isActive ? "var(--accent-primary)" : M.ink2,
                  fontFamily: M.sans,
                  fontSize: 12,
                  fontWeight: isActive ? 700 : 500,
                  cursor: "pointer",
                  textAlign: "left",
                  lineHeight: 1.4,
                  transition: "background 0.12s ease",
                }}
              >
                <span style={{
                  flexShrink: 0,
                  width: 24,
                  height: 24,
                  borderRadius: 6,
                  background: isActive ? "rgba(59,130,246,.12)" : "rgba(120,90,60,.08)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontFamily: M.sans,
                  fontSize: 9,
                  fontWeight: 700,
                  color: isActive ? "var(--accent-primary)" : M.ink3,
                }}>
                  {s.pageIndex + 1}
                </span>
                <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {s.title}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
