const STORAGE_KEY = "narravox_annotations";

export interface Annotation {
  id: string;
  historyId: string;
  wordIndex: number;
  contextSnippet: string; // ~10 palavras ao redor
  text: string;
  createdAt: string;
}

type AnnotationStore = Record<string, Annotation[]>; // keyed by historyId

function load(): AnnotationStore {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "{}") as AnnotationStore;
  } catch { return {}; }
}

function save(store: AnnotationStore): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
}

export function getAnnotations(historyId: string): Annotation[] {
  return load()[historyId] ?? [];
}

export function addAnnotation(
  historyId: string,
  wordIndex: number,
  contextSnippet: string,
  text: string
): Annotation {
  const store = load();
  const ann: Annotation = {
    id: crypto.randomUUID(),
    historyId,
    wordIndex,
    contextSnippet,
    text,
    createdAt: new Date().toISOString(),
  };
  store[historyId] = [...(store[historyId] ?? []), ann].sort((a, b) => a.wordIndex - b.wordIndex);
  save(store);
  return ann;
}

export function removeAnnotation(historyId: string, id: string): void {
  const store = load();
  store[historyId] = (store[historyId] ?? []).filter((a) => a.id !== id);
  if (!store[historyId].length) delete store[historyId];
  save(store);
}

export function exportAnnotations(historyId: string, title: string): string {
  const items = getAnnotations(historyId);
  if (!items.length) return "";
  const lines = [`# Anotações — ${title}`, `Exportado em ${new Date().toLocaleString("pt-BR")}`, ""];
  for (const a of items) {
    lines.push(`---`);
    lines.push(`> "${a.contextSnippet}"`);
    lines.push(`**Posição:** palavra ${a.wordIndex + 1}`);
    lines.push(`**Nota:** ${a.text}`);
    lines.push("");
  }
  return lines.join("\n");
}
