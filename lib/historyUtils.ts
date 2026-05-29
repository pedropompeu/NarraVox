export const SCHEMA_VERSION = 2;
export const MAX_HISTORY_ITEMS = 20;
export const MAX_TEXT_CHARS = 100_000;
const STORAGE_KEY = "narravox_history";

export interface HistoryItem {
  id: string;
  schemaVersion: number;
  title: string;
  text: string;
  wordCount: number;
  createdAt: string;
  lastPosition: number; // índice no array de palavras — nunca charIndex
  savedSpeed?: number;  // velocidade usada na última sessão
  activePage?: number;  // página ativa (0-indexed) quando era PDF
  isPdf?: boolean;      // indica se o texto veio de um PDF
}

function generateTitle(text: string): string {
  const trimmed = text.trim();
  if (trimmed.length <= 60) return trimmed;
  const cut = trimmed.slice(0, 60);
  const lastSpace = cut.lastIndexOf(" ");
  return (lastSpace > 40 ? cut.slice(0, lastSpace) : cut) + "…";
}

function migrateItem(raw: Record<string, unknown>): HistoryItem {
  return {
    id: (raw.id as string) ?? crypto.randomUUID(),
    schemaVersion: SCHEMA_VERSION,
    title: (raw.title as string) ?? generateTitle((raw.text as string) ?? ""),
    text: (raw.text as string) ?? "",
    wordCount:
      (raw.wordCount as number) ??
      ((raw.text as string) ?? "").split(/\s+/).filter(Boolean).length,
    createdAt: (raw.createdAt as string) ?? new Date().toISOString(),
    lastPosition: (raw.lastPosition as number) ?? 0,
    savedSpeed: (raw.savedSpeed as number | undefined),
    activePage: (raw.activePage as number | undefined),
    isPdf: (raw.isPdf as boolean | undefined),
  };
}

export function loadHistory(): HistoryItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as Record<string, unknown>[];
    return parsed.map(migrateItem);
  } catch {
    return [];
  }
}

function saveHistory(items: HistoryItem[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

export interface AddHistoryOptions {
  speed?: number;
  activePage?: number;
  isPdf?: boolean;
}

export function addHistoryItem(
  text: string,
  wordCount: number,
  options: AddHistoryOptions = {}
): HistoryItem {
  const items = loadHistory();
  const item: HistoryItem = {
    id: crypto.randomUUID(),
    schemaVersion: SCHEMA_VERSION,
    title: generateTitle(text),
    text: text.length > MAX_TEXT_CHARS ? text.slice(0, MAX_TEXT_CHARS) : text,
    wordCount,
    createdAt: new Date().toISOString(),
    lastPosition: 0,
    savedSpeed: options.speed,
    activePage: options.activePage,
    isPdf: options.isPdf,
  };

  // LRU: insere no início, remove mais antigo se passar do limite
  const updated = [item, ...items.filter((i) => i.id !== item.id)].slice(
    0,
    MAX_HISTORY_ITEMS
  );
  saveHistory(updated);
  return item;
}

export function updateLastPosition(id: string, position: number): void {
  const items = loadHistory();
  const updated = items.map((i) =>
    i.id === id ? { ...i, lastPosition: position } : i
  );
  saveHistory(updated);
}

export function updateSpeed(id: string, speed: number): void {
  const items = loadHistory();
  const updated = items.map((i) => (i.id === id ? { ...i, savedSpeed: speed } : i));
  saveHistory(updated);
}

export function updateActivePage(id: string, activePage: number): void {
  const items = loadHistory();
  const updated = items.map((i) => (i.id === id ? { ...i, activePage } : i));
  saveHistory(updated);
}

export function deleteHistoryItem(id: string): void {
  saveHistory(loadHistory().filter((i) => i.id !== id));
}

export function clearHistory(): void {
  localStorage.removeItem(STORAGE_KEY);
}

export function formatRelativeDate(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const min = Math.floor(diff / 60_000);
  if (min < 1) return "agora";
  if (min < 60) return `${min} min atrás`;
  const h = Math.floor(min / 60);
  if (h < 24) return `${h}h atrás`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d}d atrás`;
  return new Date(iso).toLocaleDateString("pt-BR");
}
