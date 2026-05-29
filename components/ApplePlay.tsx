"use client";
import { useState } from "react";
import { M } from "@/lib/designTokens";

type AppleState = "rest" | "hover" | "press";

interface ApplePlayProps {
  playing: boolean;
  onClick?: () => void;
  size?: number;
  disabled?: boolean;
}

export function ApplePlay({
  playing,
  onClick,
  size = 96,
  disabled = false,
}: ApplePlayProps) {
  const [state, setState] = useState<AppleState>("rest");

  const lift  = state === "hover" ? -3 : state === "press" ? 1 : 0;
  const scale = state === "hover" ? 1.03 : state === "press" ? 0.97 : 1;
  const glossOpacity = state === "hover" ? 0.85 : 0.7;

  const fruitShadow = disabled
    ? "0 4px 10px rgba(0,0,0,.10), inset 0 -6px 12px rgba(0,0,0,.10)"
    : state === "press"
    ? "0 4px 10px rgba(120,20,20,.35), 0 1px 2px rgba(0,0,0,.4), inset 0 -4px 10px rgba(0,0,0,.22), inset 0 3px 8px rgba(255,255,255,.18)"
    : "0 18px 36px -8px rgba(120,20,20,.55), 0 6px 12px rgba(80,15,15,.28), 0 1px 2px rgba(0,0,0,.30), inset 0 -10px 18px rgba(0,0,0,.30), inset 0 6px 14px rgba(255,255,255,.22)";

  const fruitBg = disabled
    ? `radial-gradient(circle at 50% 55%, #9A8775 0%, #6B5544 70%, #4A382B 100%)`
    : `
        radial-gradient(circle at 35% 30%, rgba(255,200,180,.55) 0%, rgba(255,200,180,0) 38%),
        radial-gradient(circle at 70% 75%, rgba(0,0,0,.18) 0%, rgba(0,0,0,0) 40%),
        radial-gradient(circle at 50% 55%, ${M.appleMid} 0%, ${M.appleLow} 65%, ${M.appleDeep} 100%)
      `;

  const handleMouseEnter = () => { if (!disabled) setState("hover"); };
  const handleMouseLeave = () => setState("rest");
  const handleMouseDown  = () => { if (!disabled) setState("press"); };
  const handleMouseUp    = () => { if (!disabled) setState("hover"); };

  const iconSize = Math.round(size * (playing ? 0.34 : 0.38));

  return (
    <div
      style={{
        position: "relative",
        width: size + 14,
        height: size + 12,
        display: "inline-flex",
        alignItems: "flex-end",
        justifyContent: "center",
        transform: `translateY(${lift}px)`,
        transition: "transform 0.25s cubic-bezier(.2,.8,.3,1.2)",
      }}
    >
      {/* Contact shadow */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          left: "50%",
          bottom: -2,
          transform: "translateX(-50%)",
          width: size * 0.85,
          height: 14,
          borderRadius: "50%",
          background:
            "radial-gradient(ellipse, rgba(60,20,20,.35) 0%, rgba(60,20,20,0) 70%)",
          filter: state === "hover" ? "blur(4px)" : "blur(3px)",
          opacity: disabled ? 0.25 : 0.85,
        }}
      />

      <button
        onClick={disabled ? undefined : onClick}
        disabled={disabled}
        aria-label={playing ? "Pausar" : "Ouvir"}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        style={{
          position: "relative",
          zIndex: 1,
          width: size,
          height: size,
          borderRadius: "50%",
          border: "none",
          cursor: disabled ? "not-allowed" : "pointer",
          background: fruitBg,
          boxShadow: fruitShadow,
          transform: `scale(${scale})`,
          transition:
            "transform 0.18s cubic-bezier(.2,.8,.3,1.4), box-shadow 0.25s ease",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 0,
        }}
      >
        {/* Specular highlight */}
        <span
          aria-hidden="true"
          style={{
            position: "absolute",
            left: "22%",
            top: "14%",
            width: "34%",
            height: "22%",
            borderRadius: "50%",
            background:
              "radial-gradient(ellipse at 40% 35%, rgba(255,255,255,.95) 0%, rgba(255,255,255,0) 75%)",
            filter: "blur(.3px)",
            opacity: disabled ? 0.2 : glossOpacity,
            transform: "rotate(-18deg)",
          }}
        />
        {/* Secondary specular */}
        <span
          aria-hidden="true"
          style={{
            position: "absolute",
            right: "20%",
            top: "34%",
            width: 8,
            height: 8,
            borderRadius: "50%",
            background: "rgba(255,235,220,.7)",
            filter: "blur(.6px)",
            opacity: disabled ? 0 : 0.8,
          }}
        />
        {/* Glyph */}
        <span
          style={{
            filter: "drop-shadow(0 1px 2px rgba(0,0,0,.35))",
            transform: playing ? "translateX(0)" : "translateX(2px)",
          }}
        >
          {playing ? (
            <svg
              width={iconSize}
              height={iconSize}
              viewBox="0 0 24 24"
              fill="#fff"
              aria-hidden="true"
            >
              <rect x="6.5" y="5" width="4" height="14" rx="1.2" />
              <rect x="13.5" y="5" width="4" height="14" rx="1.2" />
            </svg>
          ) : (
            <svg
              width={iconSize}
              height={iconSize}
              viewBox="0 0 24 24"
              fill="#fff"
              aria-hidden="true"
            >
              <path d="M8 5.2v13.6c0 .9 1 1.5 1.8 1l11.2-6.8c.7-.4.7-1.5 0-1.9L9.8 4.2C9 3.7 8 4.3 8 5.2z" />
            </svg>
          )}
        </span>
      </button>
    </div>
  );
}
