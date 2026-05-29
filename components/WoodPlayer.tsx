"use client";
import { useState } from "react";
import { M, surface } from "@/lib/designTokens";
import { ApplePlay } from "./ApplePlay";
import { BrassSeg } from "./BrassSeg";
import { CeramicSelect } from "./CeramicSelect";
import { ConcreteTrack } from "./ConcreteTrack";
import { SleepTimer } from "./SleepTimer";
import type { PlayerStatus } from "@/store/playerStore";
import type { EdgeVoice } from "@/lib/edgeTtsVoices";

interface WoodPlayerProps {
  status: PlayerStatus;
  currentWordIndex: number;
  totalWords: number;
  speed: number;
  voices: EdgeVoice[];
  selectedVoice: string | null;
  elapsedSeconds: number;
  isBookmarked?: boolean;
  onPlay: () => void;
  onPause: () => void;
  onResume: () => void;
  onStop: () => void;
  onRestart: () => void;
  onSeek: (index: number) => void;
  onSpeedChange: (s: number) => void;
  onVoiceChange: (id: string) => void;
  onBookmark?: () => void;
  mobile?: boolean;
}

function txTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function BrassIconBtn({
  children,
  onClick,
  disabled,
  label,
}: {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  label: string;
}) {
  const [hov, setHov] = useState(false);
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        width: 32,
        height: 32,
        borderRadius: "50%",
        border: "none",
        cursor: disabled ? "not-allowed" : "pointer",
        ...surface.brass,
        color: "#3A2700",
        boxShadow: hov
          ? "inset 0 1px 0 rgba(255,235,170,.95), inset 0 -1px 0 rgba(60,40,10,.55), 0 3px 6px rgba(80,55,5,.45)"
          : "inset 0 1px 0 rgba(255,235,170,.85), inset 0 -1px 0 rgba(60,40,10,.40), 0 1px 2px rgba(80,55,5,.35), 0 2px 4px -1px rgba(80,55,5,.35)",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        opacity: disabled ? 0.5 : 1,
        transition: "box-shadow 0.15s ease",
      }}
    >
      {children}
    </button>
  );
}

const SPEED_PRESETS = [
  { label: "Estudo", speed: 0.85 },
  { label: "Normal", speed: 1.0 },
  { label: "Revisão", speed: 1.3 },
  { label: "Trânsito", speed: 1.7 },
] as const;

function SpeedPresets({
  speed,
  onChange,
  disabled,
}: {
  speed: number;
  onChange: (s: number) => void;
  disabled: boolean;
}) {
  return (
    <div
      style={{
        display: "flex",
        gap: 6,
        flexWrap: "wrap",
      }}
    >
      {SPEED_PRESETS.map((p) => {
        const active = Math.abs(speed - p.speed) < 0.01;
        return (
          <button
            key={p.label}
            onClick={() => !disabled && onChange(p.speed)}
            disabled={disabled}
            aria-pressed={active}
            style={{
              padding: "4px 10px",
              borderRadius: 999,
              border: `1px solid ${active ? "rgba(120,90,60,.35)" : "rgba(120,90,60,.18)"}`,
              cursor: disabled ? "not-allowed" : "pointer",
              background: active
                ? "linear-gradient(180deg, rgba(255,255,255,.85) 0%, rgba(255,255,255,.5) 100%)"
                : "transparent",
              boxShadow: active
                ? "inset 0 1px 0 rgba(255,255,255,.9), 0 1px 2px rgba(120,90,60,.15)"
                : "none",
              color: active ? M.ink : M.ink3,
              fontFamily: M.sans,
              fontSize: 11,
              fontWeight: active ? 700 : 500,
              letterSpacing: "-0.005em",
              opacity: disabled ? 0.5 : 1,
              transition: "all 0.15s ease",
            }}
          >
            {p.label}
            <span style={{ marginLeft: 4, opacity: 0.6, fontWeight: 400 }}>
              {p.speed}×
            </span>
          </button>
        );
      })}
    </div>
  );
}

function PlayerCaption({
  status,
  currentWordIndex,
  totalWords,
}: {
  status: PlayerStatus;
  currentWordIndex: number;
  totalWords: number;
}) {
  let label: string;
  let color: string = M.ink3;

  if (status === "idle" && totalWords === 0) { label = "Cole um texto para acordar o tocador"; }
  else if (status === "idle")    { label = "Tudo pronto"; color = "#3F7A1F"; }
  else if (status === "loading") { label = "Carregando áudio…"; color = M.ink2; }
  else if (status === "playing") { label = `Tocando · palavra ${currentWordIndex + 1} de ${totalWords}`; color = M.appleMid; }
  else if (status === "paused")  { label = `Pausado em ${currentWordIndex + 1} de ${totalWords}`; color = M.brassDeep; }
  else if (status === "done")    { label = "Concluído"; color = "#3F7A1F"; }
  else { label = ""; }

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        fontFamily: M.serif,
        fontStyle: "italic",
        fontSize: 13,
        color,
      }}
    >
      <span
        style={{
          width: 8,
          height: 8,
          borderRadius: "50%",
          background: `radial-gradient(circle at 35% 30%, rgba(255,255,255,.7), ${color})`,
          boxShadow:
            status === "playing"
              ? `0 0 0 4px ${color}22, 0 0 8px ${color}66`
              : "none",
          animation:
            status === "playing" ? "tx-pulse 1.4s ease-in-out infinite" : "none",
          flexShrink: 0,
        }}
      />
      {label}
    </div>
  );
}

export function WoodPlayer({
  status,
  currentWordIndex,
  totalWords,
  speed,
  voices,
  selectedVoice,
  elapsedSeconds,
  onPlay,
  onPause,
  onResume,
  onStop,
  onRestart,
  onSeek,
  onSpeedChange,
  onVoiceChange,
  onBookmark,
  isBookmarked = false,
  mobile = false,
}: WoodPlayerProps) {
  const disabled = status === "idle" && totalWords === 0;
  const playing  = status === "playing";

  const progress =
    totalWords > 1 ? Math.max(0, currentWordIndex) / (totalWords - 1) : 0;

  const estimatedTotalSec =
    totalWords > 0 ? (totalWords / (180 * speed)) * 60 : 0;

  const handleAppleClick = () => {
    if (disabled) return;
    if (playing)               onPause();
    else if (status === "paused")   onResume();
    else if (status === "done")     onRestart();
    else                            onPlay();
  };

  const handleSeek = (p: number) => {
    const idx = Math.floor(p * Math.max(0, totalWords - 1));
    onSeek(idx);
  };

  return (
    <section
      style={{
        position: "relative",
        borderRadius: 22,
        ...surface.wood,
        padding: mobile ? 14 : 18,
        boxShadow:
          "inset 0 2px 0 rgba(255,235,200,.45), inset 0 -2px 0 rgba(60,30,10,.35), 0 2px 4px rgba(60,30,10,.25), 0 24px 48px -16px rgba(60,30,10,.45)",
      }}
    >
      {/* Edge bevel */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 4,
          borderRadius: 18,
          pointerEvents: "none",
          boxShadow:
            "inset 0 0 0 1px rgba(60,30,10,.30), inset 0 0 0 2px rgba(255,235,200,.20)",
        }}
      />

      {/* Frosted glass inset */}
      <div
        style={{
          position: "relative",
          borderRadius: 16,
          background:
            "linear-gradient(180deg, rgba(255,250,240,.55) 0%, rgba(255,245,225,.35) 100%)",
          backdropFilter: "blur(8px)",
          WebkitBackdropFilter: "blur(8px)",
          boxShadow:
            "inset 0 1px 0 rgba(255,255,255,.7), inset 0 0 0 1px rgba(255,255,255,.4), 0 2px 6px rgba(60,30,10,.25)",
          padding: mobile ? 16 : 20,
          display: "flex",
          flexDirection: "column",
          gap: 16,
        }}
      >
        {/* Row 1 — Voice + Speed */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            flexWrap: "wrap",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8, flex: "1 1 220px" }}>
            <span style={{ color: M.ink3, flexShrink: 0 }}>
              <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M4 9v6h4l5 4V5L8 9H4z" />
                <path d="M16 8a5 5 0 0 1 0 8" />
              </svg>
            </span>
            <CeramicSelect
              value={selectedVoice}
              voices={voices}
              onChange={onVoiceChange}
            />
          </div>
          <BrassSeg value={speed} onChange={onSpeedChange} disabled={disabled} />
        </div>

        {/* Row 1.5 — Presets de velocidade nomeados */}
        <SpeedPresets speed={speed} onChange={onSpeedChange} disabled={disabled} />

        {/* Row 2 — Apple + track + buttons */}
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <ApplePlay
            playing={playing}
            onClick={handleAppleClick}
            disabled={disabled}
            size={mobile ? 80 : 92}
          />

          <div
            style={{
              flex: 1,
              minWidth: 0,
              display: "flex",
              flexDirection: "column",
              gap: 10,
            }}
          >
            {status === "loading" ? (
              <div className="loading-bar" aria-hidden="true" />
            ) : (
              <ConcreteTrack
                progress={progress}
                onSeek={handleSeek}
                disabled={disabled}
              />
            )}

            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                fontFamily: M.sans,
                fontSize: 12,
                color: M.ink3,
                fontVariantNumeric: "tabular-nums",
              }}
            >
              <span>{disabled ? "0:00" : txTime(elapsedSeconds)}</span>
              <span style={{ display: "flex", gap: 10, alignItems: "center" }}>
                <BrassIconBtn onClick={onRestart} disabled={disabled} label="Reiniciar">
                  <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M3 12a9 9 0 1 0 3-6.7" /><path d="M3 4v5h5" />
                  </svg>
                </BrassIconBtn>
                {onBookmark && (
                  <BrassIconBtn onClick={onBookmark} disabled={disabled} label={isBookmarked ? "Remover bookmark" : "Marcar posição"}>
                    <svg width={12} height={12} viewBox="0 0 24 24" fill={isBookmarked ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
                    </svg>
                  </BrassIconBtn>
                )}
                <BrassIconBtn onClick={onStop} disabled={disabled} label="Parar">
                  <svg width={12} height={12} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <rect x="6" y="6" width="12" height="12" rx="2" />
                  </svg>
                </BrassIconBtn>
              </span>
              <span>
                {disabled ? "–:––" : txTime(estimatedTotalSec)}
              </span>
            </div>
          </div>
        </div>

        {/* Caption + Sleep Timer */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
          <PlayerCaption
            status={status}
            currentWordIndex={currentWordIndex}
            totalWords={totalWords}
          />
          <SleepTimer
            isPlaying={status === "playing"}
            onStop={onStop}
          />
        </div>
      </div>
    </section>
  );
}
