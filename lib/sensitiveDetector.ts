export type SensitiveType = "cpf" | "email" | "card" | "phone";

export interface SensitiveMatch {
  type: SensitiveType;
  label: string;
}

const PATTERNS: Array<{ type: SensitiveType; label: string; regex: RegExp }> = [
  {
    type: "cpf",
    label: "CPF",
    regex: /\b\d{3}[\.\s]?\d{3}[\.\s]?\d{3}[-\.\s]?\d{2}\b/,
  },
  {
    type: "email",
    label: "e-mail",
    regex: /\b[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}\b/,
  },
  {
    type: "card",
    label: "número de cartão",
    // 16 dígitos, opcionalmente separados por espaço ou hífen a cada 4
    regex: /\b(?:\d{4}[\s\-]?){3}\d{4}\b/,
  },
  {
    type: "phone",
    label: "telefone",
    // Formatos BR: (11) 9xxxx-xxxx, +55 11 9xxxx-xxxx, etc.
    regex: /(?:\+55\s?)?(?:\(?\d{2}\)?[\s\-]?)(?:9\d{4}[\s\-]?\d{4}|\d{4}[\s\-]?\d{4})/,
  },
];

export function detectSensitive(text: string): SensitiveMatch[] {
  if (!text || text.length < 8) return [];
  const found: SensitiveMatch[] = [];
  for (const { type, label, regex } of PATTERNS) {
    if (regex.test(text)) found.push({ type, label });
  }
  return found;
}
