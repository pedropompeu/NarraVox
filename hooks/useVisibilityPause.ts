"use client";
import { useEffect, useRef } from "react";

interface UseVisibilityPauseOptions {
  isPlaying: boolean;
  onPause: () => void;
}

export function useVisibilityPause({ isPlaying, onPause }: UseVisibilityPauseOptions) {
  // Ref para evitar closure stale em handlers de evento
  const isPlayingRef = useRef(isPlaying);
  const onPauseRef = useRef(onPause);

  useEffect(() => { isPlayingRef.current = isPlaying; }, [isPlaying]);
  useEffect(() => { onPauseRef.current = onPause; }, [onPause]);

  useEffect(() => {
    function handleVisibility() {
      if (document.visibilityState === "hidden" && isPlayingRef.current) {
        onPauseRef.current();
      }
    }

    document.addEventListener("visibilitychange", handleVisibility);
    return () => document.removeEventListener("visibilitychange", handleVisibility);
  }, []);
}
