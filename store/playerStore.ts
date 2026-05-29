"use client";
import { create } from "zustand";

export type PlayerStatus = "idle" | "loading" | "playing" | "paused" | "done";

interface PlayerState {
  status: PlayerStatus;
  speed: number;
  selectedVoice: string | null;
  currentWordIndex: number;
  totalWords: number;
  elapsedSeconds: number;
  activeHistoryId: string | null;

  setStatus: (s: PlayerStatus) => void;
  setSpeed: (s: number) => void;
  setVoice: (id: string | null) => void;
  setCurrentWordIndex: (i: number) => void;
  setTotalWords: (n: number) => void;
  setElapsedSeconds: (s: number) => void;
  incrementElapsed: () => void;
  setActiveHistoryId: (id: string | null) => void;
  reset: () => void;
}

export const usePlayerStore = create<PlayerState>((set) => ({
  status: "idle",
  speed: 1,
  selectedVoice: null,
  currentWordIndex: -1,
  totalWords: 0,
  elapsedSeconds: 0,
  activeHistoryId: null,

  setStatus: (s) => set({ status: s }),
  setSpeed: (s) => set({ speed: s }),
  setVoice: (id) => set({ selectedVoice: id }),
  setCurrentWordIndex: (i) => set({ currentWordIndex: i }),
  setTotalWords: (n) => set({ totalWords: n }),
  setElapsedSeconds: (s) => set({ elapsedSeconds: s }),
  incrementElapsed: () => set((state) => ({ elapsedSeconds: state.elapsedSeconds + 1 })),
  setActiveHistoryId: (id) => set({ activeHistoryId: id }),
  reset: () => set({ status: "idle", currentWordIndex: -1, elapsedSeconds: 0 }),
}));
