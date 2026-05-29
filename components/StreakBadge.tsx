"use client";
import { useState } from "react";
import { M } from "@/lib/designTokens";
import type { StreakData } from "@/lib/streakUtils";

const GOAL_OPTIONS = [15, 20, 30, 45, 60] as const;
const DAYS = ["D", "S", "T", "Q", "Q", "S", "S"];

interface StreakBadgeProps {
  data: StreakData;
  progress: number;
  onGoalChange: (minutes: number) => void;
}

export function StreakBadge({ data, progress, onGoalChange }: StreakBadgeProps) {
  const [open, setOpen] = useState(false);

  const pct = Math.round(progress * 100);
  const todayPct = Math.min(100, Math.round((data.todayMinutes / data.goalMinutes) * 100));
  const hasStreak = data.currentStreak > 0;

  return (
    <div style={{ position: "relative" }}>
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label={`Streak: ${data.currentStreak} dias`}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
          padding: "6px 11px",
          borderRadius: 10,
          border: "1px solid rgba(120,90,60,.18)",
          background: "linear-gradient(180deg, rgba(255,255,255,.55) 0%, rgba(255,255,255,.25) 100%)",
          boxShadow: "inset 0 1px 0 rgba(255,255,255,.8), 0 1px 2px rgba(120,90,60,.10)",
          color: M.ink2,
          fontFamily: M.sans,
          fontSize: 12,
          fontWeight: 700,
          cursor: "pointer",
          transition: "background 0.15s ease",
        }}
      >
        <span style={{ fontSize: 14 }}>{hasStreak ? "🔥" : "○"}</span>
        <span>{data.currentStreak}d</span>

        {/* Mini barra de progresso hoje */}
        <div style={{ width: 32, height: 4, borderRadius: 2, background: "rgba(120,90,60,.15)", overflow: "hidden" }}>
          <div style={{
            height: "100%",
            width: `${todayPct}%`,
            background: todayPct >= 100 ? "#3F7A1F" : "var(--accent-primary)",
            borderRadius: 2,
            transition: "width 0.4s ease",
          }} />
        </div>
      </button>

      {open && (
        <div style={{
          position: "absolute",
          top: "calc(100% + 8px)",
          right: 0,
          background: "var(--paper)",
          border: "1px solid rgba(120,90,60,.18)",
          borderRadius: 16,
          padding: 16,
          boxShadow: "0 8px 32px rgba(0,0,0,.15)",
          zIndex: 30,
          minWidth: 220,
          display: "flex",
          flexDirection: "column",
          gap: 14,
        }}>
          {/* Streak */}
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 32 }}>{hasStreak ? "🔥" : "○"}</div>
            <div style={{ fontFamily: M.serif, fontSize: 22, fontWeight: 700, color: M.ink }}>
              {data.currentStreak} {data.currentStreak === 1 ? "dia" : "dias"}
            </div>
            <div style={{ fontFamily: M.sans, fontSize: 11, color: M.ink3 }}>seguidos</div>
          </div>

          {/* Progresso semanal */}
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
              {DAYS.map((d, i) => (
                <div key={i} style={{ textAlign: "center" }}>
                  <div style={{ fontFamily: M.sans, fontSize: 9, color: M.ink3, marginBottom: 3 }}>{d}</div>
                  <div style={{
                    width: 20, height: 20, borderRadius: "50%",
                    background: data.weekMinutes[i] >= data.goalMinutes
                      ? "#3F7A1F"
                      : data.weekMinutes[i] > 0
                      ? "rgba(59,130,246,.4)"
                      : "rgba(120,90,60,.10)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    {data.weekMinutes[i] >= data.goalMinutes && (
                      <svg width={10} height={10} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <div style={{ height: 5, borderRadius: 3, background: "rgba(120,90,60,.12)", overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${pct}%`, background: "linear-gradient(90deg, var(--accent-primary), #3F7A1F)", borderRadius: 3, transition: "width 0.4s ease" }} />
            </div>
            <div style={{ fontFamily: M.sans, fontSize: 10, color: M.ink3, marginTop: 4, textAlign: "right" }}>
              {pct}% da meta semanal
            </div>
          </div>

          {/* Meta diária */}
          <div>
            <div style={{ fontFamily: M.sans, fontSize: 11, color: M.ink3, marginBottom: 6, fontWeight: 600 }}>Meta diária</div>
            <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
              {GOAL_OPTIONS.map((m) => (
                <button key={m} onClick={() => { onGoalChange(m); setOpen(false); }} style={{
                  padding: "4px 8px",
                  borderRadius: 6,
                  border: "1px solid rgba(120,90,60,.18)",
                  background: data.goalMinutes === m ? "var(--accent-primary)" : "transparent",
                  color: data.goalMinutes === m ? "#fff" : M.ink2,
                  fontFamily: M.sans,
                  fontSize: 11,
                  fontWeight: 600,
                  cursor: "pointer",
                }}>
                  {m}min
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
