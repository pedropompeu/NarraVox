"use client";
import { useCallback, useEffect, useRef } from "react";
import { useHistory } from "./useHistory";
import { useSpeech } from "./useSpeech";
import type { SpeechMode } from "./useSpeech";
import { usePlayerStore } from "@/store/playerStore";
import { DEFAULT_VOICE_ID } from "@/lib/edgeTtsVoices";

export interface PlayerContext {
  isPdf?: boolean;
  activePage?: number;
}

export function usePlayer(text: string, ttsMode: SpeechMode = "neural", ctx: PlayerContext = {}) {
  const words = text.trim() ? text.trim().split(/\s+/) : [];
  const store = usePlayerStore();
  const history = useHistory();
  const speech = useSpeech(words, ttsMode);
  const elapsedRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const historyIdRef = useRef<string | null>(null);
  const speechRef = useRef(speech);
  const pendingResumeRef = useRef<number | null>(null);
  useEffect(() => { speechRef.current = speech; });

  // Inicializa voz padrão
  useEffect(() => {
    if (!store.selectedVoice) store.setVoice(DEFAULT_VOICE_ID);
  }, []);

  useEffect(() => {
    store.setTotalWords(words.length);
  }, [words.length]);

  // Dispara retomada de histórico quando os words do novo texto estiverem prontos
  useEffect(() => {
    if (pendingResumeRef.current === null || words.length === 0) return;
    const pos = Math.min(pendingResumeRef.current, words.length - 1);
    pendingResumeRef.current = null;
    speechRef.current.speak(pos).catch(console.error);
  }, [words.length]);

  // Elapsed timer
  useEffect(() => {
    if (store.status === "playing") {
      elapsedRef.current = setInterval(() => store.incrementElapsed(), 1000);
    } else {
      if (elapsedRef.current) clearInterval(elapsedRef.current);
    }
    return () => { if (elapsedRef.current) clearInterval(elapsedRef.current); };
  }, [store.status]);

  // Salva posição a cada 5 palavras
  useEffect(() => {
    if (store.currentWordIndex > 0 && store.currentWordIndex % 5 === 0 && historyIdRef.current) {
      history.updatePosition(historyIdRef.current, store.currentWordIndex);
    }
  }, [store.currentWordIndex]);

  // Salva página ativa quando muda (para PDFs)
  useEffect(() => {
    if (historyIdRef.current && ctx.isPdf && ctx.activePage !== undefined) {
      history.savePage(historyIdRef.current, ctx.activePage);
    }
  }, [ctx.activePage, ctx.isPdf]);

  const play = useCallback(
    (startIndex?: number) => {
      if (!words.length) return;
      if (!historyIdRef.current) {
        const item = history.add(text, words.length, {
          speed: store.speed,
          activePage: ctx.activePage,
          isPdf: ctx.isPdf,
        });
        historyIdRef.current = item.id;
        store.setActiveHistoryId(item.id);
      }
      speech.speak(startIndex ?? 0).catch(console.error);
    },
    [text, words.length, ctx.isPdf, ctx.activePage]
  );

  const pause = useCallback(() => speechRef.current.pause(), []);
  const resume = useCallback(() => speechRef.current.resume(), []);

  const stop = useCallback(() => {
    speechRef.current.stop();
    pendingResumeRef.current = null;
    historyIdRef.current = null;
    store.setActiveHistoryId(null);
    store.setElapsedSeconds(0);
  }, []);

  const seekTo = useCallback((index: number) => speechRef.current.seekTo(index), []);

  const restart = useCallback(() => {
    speechRef.current.stop();
    store.setElapsedSeconds(0);
    play(0);
  }, [play]);

  const setSpeed = useCallback((s: number) => {
    store.setSpeed(s);
    if (historyIdRef.current) {
      history.saveSpeed(historyIdRef.current, s);
    }
  }, []);

  const loadFromHistory = useCallback(
    (_historyText: string, historyId: string, lastPosition: number, savedSpeed?: number) => {
      speechRef.current.stop();
      historyIdRef.current = historyId;
      store.setActiveHistoryId(historyId);
      store.setElapsedSeconds(0);
      if (savedSpeed !== undefined) store.setSpeed(savedSpeed);
      pendingResumeRef.current = lastPosition;
    },
    []
  );

  return {
    words,
    status: store.status,
    currentWordIndex: store.currentWordIndex,
    totalWords: store.totalWords,
    speed: store.speed,
    selectedVoice: store.selectedVoice,
    elapsedSeconds: store.elapsedSeconds,
    activeHistoryId: store.activeHistoryId,
    historyItems: history.items,
    setSpeed,
    setVoice: store.setVoice,
    play,
    pause,
    resume,
    stop,
    seekTo,
    restart,
    loadFromHistory,
    removeHistory: history.remove,
    clearHistory: history.clear,
  };
}
