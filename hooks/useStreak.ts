"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import { StreakData, loadStreak, recordMinutes, setGoal, weekProgress } from "@/lib/streakUtils";

const RECORD_INTERVAL_SEC = 60; // grava a cada minuto de escuta

export function useStreak(elapsedSeconds: number, isPlaying: boolean) {
  const [data, setData] = useState<StreakData | null>(null);
  const lastRecordedRef = useRef(0);

  useEffect(() => {
    setData(loadStreak());
  }, []);

  // Grava minutos a cada RECORD_INTERVAL_SEC de escuta contínua
  useEffect(() => {
    if (!isPlaying) return;
    const delta = elapsedSeconds - lastRecordedRef.current;
    if (delta >= RECORD_INTERVAL_SEC) {
      const mins = Math.floor(delta / 60);
      lastRecordedRef.current = elapsedSeconds - (delta % 60);
      setData(recordMinutes(mins));
    }
  }, [elapsedSeconds, isPlaying]);

  const updateGoal = useCallback((minutes: number) => {
    setGoal(minutes);
    setData(loadStreak());
  }, []);

  const progress = data ? weekProgress(data) : 0;

  return { data, progress, updateGoal };
}
