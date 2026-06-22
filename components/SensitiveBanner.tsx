"use client";
import { useEffect, useState } from "react";
import { M } from "@/lib/designTokens";
import { detectSensitive, type SensitiveMatch } from "@/lib/sensitiveDetector";

interface SensitiveBannerProps {
  text: string;
}

export function SensitiveBanner({ text }: SensitiveBannerProps) {
  const [matches, setMatches] = useState<SensitiveMatch[]>([]);
  // Rastreia qual texto o usuário dispensou — banner reaparece automaticamente quando o texto muda
  const [dismissedText, setDismissedText] = useState<string | null>(null);

  useEffect(() => {
    // Debounce — só analisa quando o texto estabiliza
    const id = setTimeout(() => setMatches(detectSensitive(text)), 600);
    return () => clearTimeout(id);
  }, [text]);

  if (!matches.length || dismissedText === text) return null;

  const labels = matches.map((m) => m.label).join(", ");

  return (
    <div
      role="alert"
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: 10,
        padding: "10px 14px",
        borderRadius: 12,
        background: "rgba(197,57,10,.06)",
        border: "1px solid rgba(197,57,10,.22)",
        marginBottom: 2,
      }}
    >
      <svg
        width={14}
        height={14}
        viewBox="0 0 24 24"
        fill="none"
        stroke="#C5390A"
        strokeWidth="2"
        strokeLinecap="round"
        style={{ flexShrink: 0, marginTop: 1 }}
        aria-hidden="true"
      >
        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
        <line x1="12" y1="9" x2="12" y2="13" />
        <line x1="12" y1="17" x2="12.01" y2="17" />
      </svg>

      <div style={{ flex: 1, minWidth: 0 }}>
        <span style={{ fontFamily: M.sans, fontSize: 11, fontWeight: 700, color: "#C5390A" }}>
          Dado pessoal detectado:{" "}
        </span>
        <span style={{ fontFamily: M.sans, fontSize: 11, color: "#C5390A" }}>
          {labels}.{" "}
        </span>
        <span style={{ fontFamily: M.sans, fontSize: 11, color: M.ink3 }}>
          No modo neural, o texto é enviado à Microsoft Edge TTS.{" "}
          <a href="/privacidade" style={{ color: "var(--accent-primary)", textDecoration: "none", fontWeight: 600 }}>
            Saiba mais
          </a>
          .
        </span>
      </div>

      <button
        onClick={() => setDismissedText(text)}
        aria-label="Dispensar aviso"
        style={{
          background: "none",
          border: "none",
          cursor: "pointer",
          color: "#C5390A",
          fontSize: 16,
          lineHeight: 1,
          padding: 0,
          flexShrink: 0,
          opacity: 0.7,
        }}
      >
        ×
      </button>
    </div>
  );
}
