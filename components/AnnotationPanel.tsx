"use client";
import { useState, useCallback } from "react";
import { M } from "@/lib/designTokens";
import type { Annotation } from "@/lib/annotationUtils";
import { formatRelativeDate } from "@/lib/historyUtils";

interface AnnotationPanelProps {
  annotations: Annotation[];
  currentWordIndex: number;
  isPlaying: boolean;
  isPremium?: boolean;
  onAdd: (wordIndex: number, text: string) => void;
  onRemove: (id: string) => void;
  onExport: () => void;
  onSeek: (index: number) => void;
  onPause: () => void;
}

export function AnnotationPanel({
  annotations,
  currentWordIndex,
  isPlaying,
  isPremium = false,
  onAdd,
  onRemove,
  onExport,
  onSeek,
  onPause,
}: AnnotationPanelProps) {
  const [open, setOpen] = useState(false);
  const [inputText, setInputText] = useState("");
  const [adding, setAdding] = useState(false);

  const startAdd = useCallback(() => {
    if (isPlaying) onPause();
    setAdding(true);
    setOpen(true);
  }, [isPlaying, onPause]);

  const confirmAdd = useCallback(() => {
    if (!inputText.trim()) { setAdding(false); return; }
    onAdd(currentWordIndex, inputText.trim());
    setInputText("");
    setAdding(false);
  }, [inputText, currentWordIndex, onAdd]);

  const count = annotations.length;

  return (
    <div style={{ position: "relative" }}>
      {/* Botão principal */}
      <div style={{ display: "flex", gap: 4 }}>
        <button
          onClick={startAdd}
          title="Anotar posição atual (N)"
          aria-label="Adicionar anotação"
          style={{
            display: "inline-flex", alignItems: "center", gap: 5,
            padding: "5px 10px", borderRadius: 999,
            border: "1px solid rgba(120,90,60,.18)",
            background: "linear-gradient(180deg, rgba(255,255,255,.55) 0%, rgba(255,255,255,.25) 100%)",
            color: M.ink2, fontFamily: M.sans, fontSize: 11, fontWeight: 600,
            cursor: "pointer", boxShadow: "inset 0 1px 0 rgba(255,255,255,.6)",
          }}
        >
          <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
          </svg>
          Anotar
        </button>

        {count > 0 && (
          <button
            onClick={() => setOpen((v) => !v)}
            aria-label={`${count} anotação${count > 1 ? "s" : ""}`}
            style={{
              display: "inline-flex", alignItems: "center", gap: 4,
              padding: "5px 8px", borderRadius: 999,
              border: "1px solid rgba(120,90,60,.18)",
              background: "linear-gradient(180deg, rgba(255,255,255,.55) 0%, rgba(255,255,255,.25) 100%)",
              color: M.ink3, fontFamily: M.sans, fontSize: 11, fontWeight: 600,
              cursor: "pointer", boxShadow: "inset 0 1px 0 rgba(255,255,255,.6)",
            }}
          >
            {count}
            <svg width={10} height={10} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
              <polyline points={open ? "18 15 12 9 6 15" : "6 9 12 15 18 9"}/>
            </svg>
          </button>
        )}
      </div>

      {/* Input inline para nova anotação */}
      {adding && (
        <div style={{
          position: "absolute", bottom: "calc(100% + 8px)", left: 0,
          background: "var(--paper)", border: "1px solid rgba(120,90,60,.18)",
          borderRadius: 12, padding: 12, boxShadow: "0 8px 24px rgba(0,0,0,.15)",
          zIndex: 40, width: 260,
        }}>
          <div style={{ fontFamily: M.sans, fontSize: 11, color: M.ink3, marginBottom: 6 }}>
            Anotação — palavra {currentWordIndex + 1}
          </div>
          <textarea
            autoFocus
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); confirmAdd(); } if (e.key === "Escape") setAdding(false); }}
            placeholder="Digite sua nota… (Enter para salvar)"
            style={{
              width: "100%", height: 72, resize: "none",
              fontFamily: M.sans, fontSize: 12, color: M.ink,
              background: "transparent", border: "none", outline: "none",
              lineHeight: 1.55,
            }}
          />
          <div style={{ display: "flex", gap: 6, justifyContent: "flex-end", marginTop: 6 }}>
            <button onClick={() => setAdding(false)} style={{ padding: "4px 10px", borderRadius: 6, border: "none", background: "transparent", color: M.ink3, fontFamily: M.sans, fontSize: 11, cursor: "pointer" }}>Cancelar</button>
            <button onClick={confirmAdd} style={{ padding: "4px 10px", borderRadius: 6, border: "none", background: "var(--accent-primary)", color: "#fff", fontFamily: M.sans, fontSize: 11, fontWeight: 600, cursor: "pointer" }}>Salvar</button>
          </div>
        </div>
      )}

      {/* Lista de anotações */}
      {open && !adding && count > 0 && (
        <div style={{
          position: "absolute", bottom: "calc(100% + 8px)", left: 0,
          background: "var(--paper)", border: "1px solid rgba(120,90,60,.18)",
          borderRadius: 14, padding: 12, boxShadow: "0 8px 32px rgba(0,0,0,.15)",
          zIndex: 40, width: 300, maxHeight: 360, overflowY: "auto",
          display: "flex", flexDirection: "column", gap: 10,
        }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontFamily: M.sans, fontSize: 11, color: M.ink3, fontWeight: 600 }}>
              {count} anotação{count > 1 ? "s" : ""}
            </span>
            <button
              onClick={isPremium ? onExport : undefined}
              title={isPremium ? "Exportar como .txt" : "Exportar — disponível no Premium"}
              style={{
                display: "inline-flex", alignItems: "center", gap: 4,
                padding: "3px 8px", borderRadius: 6,
                border: "1px solid rgba(120,90,60,.18)",
                background: isPremium ? "transparent" : "transparent",
                color: isPremium ? M.glass : M.muted,
                fontFamily: M.sans, fontSize: 10, fontWeight: 600,
                cursor: isPremium ? "pointer" : "not-allowed", opacity: isPremium ? 1 : 0.5,
              }}
            >
              Exportar
              {!isPremium && <svg width={8} height={8} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M18 11H6V8a6 6 0 1 1 12 0v3zm1 10H5a1 1 0 0 1-1-1V12a1 1 0 0 1 1-1h14a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1z"/></svg>}
            </button>
          </div>

          {annotations.map((a) => (
            <div key={a.id} style={{
              padding: "8px 10px", borderRadius: 10,
              background: "rgba(120,90,60,.06)",
              border: "1px solid rgba(120,90,60,.10)",
            }}>
              <div style={{ fontFamily: M.serif, fontStyle: "italic", fontSize: 11, color: M.ink3, marginBottom: 4 }}>
                "…{a.contextSnippet}…"
              </div>
              <div style={{ fontFamily: M.sans, fontSize: 12, color: M.ink, lineHeight: 1.5 }}>{a.text}</div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 6 }}>
                <span style={{ fontFamily: M.sans, fontSize: 10, color: M.muted }}>
                  {formatRelativeDate(a.createdAt)}
                </span>
                <div style={{ display: "flex", gap: 6 }}>
                  <button onClick={() => onSeek(a.wordIndex)} style={{ background: "none", border: "none", cursor: "pointer", color: M.glass, fontFamily: M.sans, fontSize: 10, fontWeight: 600 }}>Ir</button>
                  <button onClick={() => onRemove(a.id)} style={{ background: "none", border: "none", cursor: "pointer", color: M.muted, fontFamily: M.sans, fontSize: 10 }}>×</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
