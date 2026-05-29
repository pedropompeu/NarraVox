"use client";
import { useState, useCallback, useEffect } from "react";
import {
  Annotation,
  getAnnotations,
  addAnnotation,
  removeAnnotation,
  exportAnnotations,
} from "@/lib/annotationUtils";

export function useAnnotations(historyId: string | null, words: string[]) {
  const [annotations, setAnnotations] = useState<Annotation[]>([]);

  useEffect(() => {
    setAnnotations(historyId ? getAnnotations(historyId) : []);
  }, [historyId]);

  const add = useCallback(
    (wordIndex: number, text: string) => {
      if (!historyId) return;
      const start = Math.max(0, wordIndex - 5);
      const end = Math.min(words.length, wordIndex + 5);
      const snippet = words.slice(start, end).join(" ");
      addAnnotation(historyId, wordIndex, snippet, text);
      setAnnotations(getAnnotations(historyId));
    },
    [historyId, words]
  );

  const remove = useCallback(
    (id: string) => {
      if (!historyId) return;
      removeAnnotation(historyId, id);
      setAnnotations(getAnnotations(historyId));
    },
    [historyId]
  );

  const exportTxt = useCallback(
    (title: string): string => {
      if (!historyId) return "";
      return exportAnnotations(historyId, title);
    },
    [historyId]
  );

  return { annotations, add, remove, exportTxt };
}
