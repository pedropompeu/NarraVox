const STORAGE_KEY = "narravox_bookmarks";

export interface Bookmark {
  wordIndex: number;
  createdAt: string;
  label?: string;
}

type BookmarkStore = Record<string, Bookmark[]>; // keyed by historyId

function load(): BookmarkStore {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "{}") as BookmarkStore;
  } catch {
    return {};
  }
}

function save(store: BookmarkStore): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
}

export function getBookmarks(historyId: string): Bookmark[] {
  return load()[historyId] ?? [];
}

export function addBookmark(historyId: string, wordIndex: number): Bookmark {
  const store = load();
  const existing = store[historyId] ?? [];

  // Evita duplicata na mesma posição (±3 palavras)
  const isDupe = existing.some((b) => Math.abs(b.wordIndex - wordIndex) <= 3);
  if (isDupe) return existing.find((b) => Math.abs(b.wordIndex - wordIndex) <= 3)!;

  const bm: Bookmark = { wordIndex, createdAt: new Date().toISOString() };
  store[historyId] = [...existing, bm].sort((a, b) => a.wordIndex - b.wordIndex);
  save(store);
  return bm;
}

export function removeBookmark(historyId: string, wordIndex: number): void {
  const store = load();
  store[historyId] = (store[historyId] ?? []).filter((b) => b.wordIndex !== wordIndex);
  if (store[historyId].length === 0) delete store[historyId];
  save(store);
}

export function clearBookmarks(historyId: string): void {
  const store = load();
  delete store[historyId];
  save(store);
}
