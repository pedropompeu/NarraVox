"use client";
import { useState, useCallback } from "react";

export interface LoopRange {
  start: number;
  end: number;
}

export type LoopState =
  | { phase: "idle" }
  | { phase: "selecting-start" }
  | { phase: "selecting-end"; start: number }
  | { phase: "active"; range: LoopRange };

export function useLoopRange(
  currentWordIndex: number,
  onSeek: (index: number) => void
) {
  const [state, setState] = useState<LoopState>({ phase: "idle" });

  const startSelection = useCallback(() => {
    setState({ phase: "selecting-start" });
  }, []);

  const selectWord = useCallback((index: number) => {
    setState((prev) => {
      if (prev.phase === "selecting-start") {
        return { phase: "selecting-end", start: index };
      }
      if (prev.phase === "selecting-end") {
        const start = Math.min(prev.start, index);
        const end = Math.max(prev.start, index);
        return { phase: "active", range: { start, end } };
      }
      return prev;
    });
  }, []);

  const cancel = useCallback(() => {
    setState({ phase: "idle" });
  }, []);

  // Chamado a cada mudança de palavra — reinicia o loop quando ultrapassa o fim
  const tick = useCallback(() => {
    if (state.phase !== "active") return;
    if (currentWordIndex > state.range.end) {
      onSeek(state.range.start);
    }
  }, [state, currentWordIndex, onSeek]);

  const isSelecting =
    state.phase === "selecting-start" || state.phase === "selecting-end";
  const isActive = state.phase === "active";
  const range = state.phase === "active" ? state.range : null;

  return { state, startSelection, selectWord, cancel, tick, isSelecting, isActive, range };
}
