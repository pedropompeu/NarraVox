"use client";
import { useState, useCallback, useEffect } from "react";
import {
  HistoryItem,
  AddHistoryOptions,
  loadHistory,
  addHistoryItem,
  updateLastPosition,
  updateSpeed,
  updateActivePage,
  deleteHistoryItem,
  clearHistory,
} from "@/lib/historyUtils";

export function useHistory() {
  const [items, setItems] = useState<HistoryItem[]>([]);

  useEffect(() => {
    setItems(loadHistory());
  }, []);

  const refresh = useCallback(() => setItems(loadHistory()), []);

  const add = useCallback(
    (text: string, wordCount: number, options?: AddHistoryOptions): HistoryItem => {
      const item = addHistoryItem(text, wordCount, options);
      setItems(loadHistory());
      return item;
    },
    []
  );

  const updatePosition = useCallback((id: string, position: number) => {
    updateLastPosition(id, position);
  }, []);

  const saveSpeed = useCallback((id: string, speed: number) => {
    updateSpeed(id, speed);
  }, []);

  const savePage = useCallback((id: string, activePage: number) => {
    updateActivePage(id, activePage);
  }, []);

  const remove = useCallback((id: string) => {
    deleteHistoryItem(id);
    setItems(loadHistory());
  }, []);

  const clear = useCallback(() => {
    clearHistory();
    setItems([]);
  }, []);

  return { items, add, updatePosition, saveSpeed, savePage, remove, clear, refresh };
}
