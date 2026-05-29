const WPM_AVERAGE = 200;

export function estimateReadingTime(wordCount: number): string {
  const minutes = wordCount / WPM_AVERAGE;
  if (minutes < 1) return "< 1 min";
  if (minutes < 60) return `~${Math.ceil(minutes)} min`;
  const h = Math.floor(minutes / 60);
  const m = Math.ceil(minutes % 60);
  return m > 0 ? `~${h}h ${m}min` : `~${h}h`;
}

export function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m} min ${s.toString().padStart(2, "0")} s`;
}

// Estima chars/ms com base na velocidade selecionada
// TTS em PT-BR ≈ 13 chars/s na velocidade 1×
export function charsPerMs(speed: number): number {
  return (13 * speed) / 1000;
}
