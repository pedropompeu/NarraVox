import { charsPerMs } from "./estimateReadingTime";

export type HighlightStrategy = "boundary" | "timer";
const SESSION_KEY = "narravox_highlight_strategy";

export function getDetectedStrategy(): HighlightStrategy | null {
  if (typeof sessionStorage === "undefined") return null;
  return (sessionStorage.getItem(SESSION_KEY) as HighlightStrategy) ?? null;
}

function saveStrategy(s: HighlightStrategy) {
  sessionStorage.setItem(SESSION_KEY, s);
}

export function charIndexToWordIndex(charIndex: number, words: string[]): number {
  let accumulated = 0;
  for (let i = 0; i < words.length; i++) {
    accumulated += words[i].length + 1; // +1 para o espaço
    if (accumulated > charIndex) return i;
  }
  return words.length - 1;
}

export interface SpeechController {
  start: () => void;
  pause: () => void;
  resume: () => void;
  stop: () => void;
  getStrategy: () => HighlightStrategy;
}

export interface SpeechConfig {
  words: string[];
  speed: number;
  voice: SpeechSynthesisVoice | null;
  startIndex: number;
  onWordChange: (index: number) => void;
  onEnd: () => void;
  onError: (msg: string) => void;
}

export function createSpeechController(config: SpeechConfig): SpeechController {
  const { words, speed, voice, startIndex, onWordChange, onEnd, onError } = config;
  const textToSpeak = words.slice(startIndex).join(" ");
  let strategy: HighlightStrategy = getDetectedStrategy() ?? "boundary";
  let timerRef: ReturnType<typeof setInterval> | null = null;
  let currentIndex = startIndex;
  let boundaryFired = false;
  let utterance: SpeechSynthesisUtterance | null = null;

  const stopTimer = () => {
    if (timerRef) { clearInterval(timerRef); timerRef = null; }
  };

  const startTimer = () => {
    stopTimer();
    const rate = charsPerMs(speed);
    timerRef = setInterval(() => {
      if (currentIndex >= words.length - 1) {
        stopTimer();
        return;
      }
      currentIndex++;
      onWordChange(currentIndex);
      // Ajusta intervalo para a próxima palavra
      stopTimer();
      if (currentIndex < words.length - 1) {
        const nextWordLen = words[currentIndex].length + 1;
        const delay = Math.max(50, nextWordLen / rate);
        setTimeout(() => { if (strategy === "timer") startTimer(); }, delay);
      }
    }, Math.max(50, (words[currentIndex]?.length ?? 4 + 1) / rate));
  };

  const start = () => {
    if (!window.speechSynthesis) {
      onError("SpeechSynthesis não disponível neste browser.");
      return;
    }
    window.speechSynthesis.cancel();
    utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.rate = speed;
    utterance.lang = "pt-BR";
    if (voice) utterance.voice = voice;

    boundaryFired = false;
    currentIndex = startIndex;
    onWordChange(currentIndex);

    // Detecção dinâmica: 500ms sem boundary → fallback timer
    const detectionTimeout = setTimeout(() => {
      if (!boundaryFired) {
        strategy = "timer";
        saveStrategy("timer");
        startTimer();
      }
    }, 500);

    utterance.onboundary = (e: SpeechSynthesisEvent) => {
      if (e.name !== "word") return;
      clearTimeout(detectionTimeout);
      if (!boundaryFired) {
        boundaryFired = true;
        strategy = "boundary";
        saveStrategy("boundary");
        stopTimer();
      }
      const idx = charIndexToWordIndex(e.charIndex, words.slice(startIndex)) + startIndex;
      currentIndex = idx;
      onWordChange(idx);
    };

    utterance.onend = () => {
      clearTimeout(detectionTimeout);
      stopTimer();
      onEnd();
    };

    utterance.onerror = (e: SpeechSynthesisErrorEvent) => {
      clearTimeout(detectionTimeout);
      stopTimer();
      if (e.error !== "interrupted") onError(`Erro de leitura: ${e.error}`);
    };

    window.speechSynthesis.speak(utterance);
  };

  const pause = () => {
    window.speechSynthesis.pause();
    stopTimer();
  };

  const resume = () => {
    window.speechSynthesis.resume();
    if (strategy === "timer") startTimer();
  };

  const stop = () => {
    window.speechSynthesis.cancel();
    stopTimer();
    utterance = null;
  };

  return { start, pause, resume, stop, getStrategy: () => strategy };
}
