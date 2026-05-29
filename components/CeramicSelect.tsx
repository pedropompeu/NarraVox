"use client";
import { useState } from "react";
import { M, surface } from "@/lib/designTokens";
import type { EdgeVoice } from "@/lib/edgeTtsVoices";

interface CeramicSelectProps {
  value: string | null;
  voices: EdgeVoice[];
  onChange: (id: string) => void;
  minWidth?: number;
}

export function CeramicSelect({
  value,
  voices,
  onChange,
  minWidth = 220,
}: CeramicSelectProps) {
  const [focused, setFocused] = useState(false);

  return (
    <div style={{ position: "relative", minWidth, flex: "1 1 220px" }}>
      <select
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{
          appearance: "none",
          WebkitAppearance: "none",
          width: "100%",
          height: 42,
          padding: "0 36px 0 16px",
          borderRadius: 14,
          border: "none",
          ...surface.ceramic,
          fontFamily: M.sans,
          fontSize: 13,
          color: M.ink,
          cursor: "pointer",
          fontWeight: 500,
          boxShadow: focused
            ? "inset 0 1px 0 rgba(255,255,255,.9), inset 0 -1px 0 rgba(120,90,60,.30), 0 2px 4px rgba(120,90,60,.25), 0 0 0 3px rgba(59,130,246,.25)"
            : "inset 0 1px 0 rgba(255,255,255,.9), inset 0 -1px 0 rgba(120,90,60,.30), 0 2px 4px rgba(120,90,60,.25), 0 6px 12px -6px rgba(120,90,60,.35)",
          transition: "box-shadow 0.18s ease",
          outline: "none",
        }}
      >
        {voices.map((v) => (
          <option key={v.id} value={v.id}>
            {v.label} · PT-BR · {v.gender}
          </option>
        ))}
      </select>

      {/* Chevron */}
      <div
        style={{
          position: "absolute",
          right: 12,
          top: 0,
          bottom: 0,
          display: "flex",
          alignItems: "center",
          pointerEvents: "none",
          color: M.ink3,
        }}
      >
        <svg
          width={12}
          height={12}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </div>
    </div>
  );
}
