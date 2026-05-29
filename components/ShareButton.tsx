"use client";
import { useState, useCallback } from "react";
import { M } from "@/lib/designTokens";

interface ShareButtonProps {
  words: string[];
  currentWordIndex: number;
  contextWords?: number; // quantas palavras ao redor incluir (default 20)
}

export function ShareButton({ words, currentWordIndex, contextWords = 20 }: ShareButtonProps) {
  const [status, setStatus] = useState<"idle" | "copied" | "error">("idle");

  const share = useCallback(async () => {
    if (!words.length || currentWordIndex < 0) return;

    const start = Math.max(0, currentWordIndex - Math.floor(contextWords / 2));
    const end = Math.min(words.length, start + contextWords);
    const excerpt = words.slice(start, end).join(" ");
    const hasPrefix = start > 0;
    const hasSuffix = end < words.length;

    const text = [
      `"${hasPrefix ? "…" : ""}${excerpt}${hasSuffix ? "…" : ""}"`,
      `— NarraVox · posição ${currentWordIndex + 1} de ${words.length}`,
    ].join("\n");

    try {
      if (navigator.share) {
        await navigator.share({ text });
      } else {
        await navigator.clipboard.writeText(text);
      }
      setStatus("copied");
      setTimeout(() => setStatus("idle"), 2000);
    } catch {
      setStatus("error");
      setTimeout(() => setStatus("idle"), 2000);
    }
  }, [words, currentWordIndex, contextWords]);

  const label = status === "copied" ? "Copiado!" : status === "error" ? "Erro" : "Compartilhar trecho";
  const color = status === "copied" ? "#3F7A1F" : status === "error" ? "#C5390A" : M.ink2;

  if (!words.length || currentWordIndex < 0) return null;

  return (
    <button
      onClick={share}
      aria-label={label}
      title={label}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 5,
        padding: "5px 10px",
        borderRadius: 999,
        border: `1px solid ${status === "copied" ? "rgba(63,122,31,.30)" : "rgba(120,90,60,.18)"}`,
        background: status === "copied"
          ? "rgba(63,122,31,.08)"
          : "linear-gradient(180deg, rgba(255,255,255,.55) 0%, rgba(255,255,255,.25) 100%)",
        color,
        fontFamily: M.sans,
        fontSize: 11,
        fontWeight: 600,
        cursor: "pointer",
        boxShadow: "inset 0 1px 0 rgba(255,255,255,.6)",
        transition: "all 0.2s ease",
      }}
    >
      {status === "copied" ? (
        <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <polyline points="20 6 9 17 4 12"/>
        </svg>
      ) : (
        <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
          <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
        </svg>
      )}
      {label}
    </button>
  );
}
