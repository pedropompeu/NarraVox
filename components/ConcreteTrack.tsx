"use client";
import { useRef } from "react";
import { M, surface } from "@/lib/designTokens";

interface ConcreteTrackProps {
  progress: number; // 0–1
  onSeek?: (progress: number) => void;
  disabled?: boolean;
}

export function ConcreteTrack({
  progress,
  onSeek,
  disabled = false,
}: ConcreteTrackProps) {
  const ref = useRef<HTMLDivElement>(null);

  const handleClick = (e: React.MouseEvent) => {
    if (disabled || !onSeek || !ref.current) return;
    const r = ref.current.getBoundingClientRect();
    const p = Math.max(0, Math.min(1, (e.clientX - r.left) / r.width));
    onSeek(p);
  };

  const pct = `${Math.max(0, Math.min(1, progress)) * 100}%`;

  return (
    <div
      ref={ref}
      onClick={handleClick}
      role="progressbar"
      aria-valuenow={Math.round(progress * 100)}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label="Progresso da leitura"
      style={{
        position: "relative",
        height: 10,
        borderRadius: 999,
        ...surface.concrete,
        cursor: disabled ? "default" : "pointer",
        boxShadow:
          "inset 0 1px 2px rgba(40,30,20,.45), inset 0 -1px 0 rgba(255,255,255,.20)",
      }}
    >
      {/* Filled portion */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          width: pct,
          borderRadius: 999,
          background: disabled
            ? "linear-gradient(180deg, rgba(60,50,40,.25), rgba(60,50,40,.15))"
            : "linear-gradient(180deg, #74A7FB 0%, #3B82F6 55%, #2257C7 100%)",
          boxShadow: disabled
            ? "none"
            : "inset 0 1px 0 rgba(255,255,255,.45), 0 0 12px rgba(59,130,246,.35)",
          transition: "width 0.25s linear",
        }}
      />

      {/* Gold thumb */}
      {!disabled && (
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: pct,
            width: 18,
            height: 18,
            borderRadius: "50%",
            background:
              "radial-gradient(circle at 35% 30%, #FFF1B3 0%, #F4C859 50%, #B8860B 100%)",
            boxShadow:
              "inset 0 1px 0 rgba(255,255,255,.5), inset 0 -1px 1px rgba(80,55,5,.6), 0 3px 6px rgba(60,40,5,.45), 0 0 0 1.5px rgba(255,255,255,.20)",
            transform: "translate(-50%, -50%)",
            transition: "left 0.25s linear",
          }}
        />
      )}
    </div>
  );
}
