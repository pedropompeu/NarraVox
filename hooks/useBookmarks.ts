"use client";
import { useState, useCallback, useEffect } from "react";
import { Bookmark, getBookmarks, addBookmark, removeBookmark } from "@/lib/bookmarkUtils";

export function useBookmarks(historyId: string | null) {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);

  useEffect(() => {
    setBookmarks(historyId ? getBookmarks(historyId) : []);
  }, [historyId]);

  const add = useCallback(
    (wordIndex: number) => {
      if (!historyId) return;
      addBookmark(historyId, wordIndex);
      setBookmarks(getBookmarks(historyId));
    },
    [historyId]
  );

  const remove = useCallback(
    (wordIndex: number) => {
      if (!historyId) return;
      removeBookmark(historyId, wordIndex);
      setBookmarks(getBookmarks(historyId));
    },
    [historyId]
  );

  const isBookmarked = useCallback(
    (wordIndex: number) => bookmarks.some((b) => b.wordIndex === wordIndex),
    [bookmarks]
  );

  return { bookmarks, add, remove, isBookmarked };
}
