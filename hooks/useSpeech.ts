"use client";
import { useEffect, useRef } from "react";
import { usePlayerStore } from "@/store/playerStore";
import { DEFAULT_VOICE_ID } from "@/lib/edgeTtsVoices";
import type { WordTiming } from "@/lib/ttsTypes";
import { createSpeechController } from "@/lib/speechUtils";
import type { SpeechController } from "@/lib/speechUtils";

export type SpeechMode = "browser" | "neural";

const CHUNK_SIZE = 400;

// Divide o array de palavras em chunks, quebrando de preferência após pontuação
// terminal (.  !  ?) próxima ao limite. Fallback para corte rígido se nenhuma
// sentença for encontrada na janela de tolerância (50% a 100% do limite).
function chunkBysentence(words: string[], maxWords: number): string[][] {
  const chunks: string[][] = [];
  let start = 0;
  const sentenceEnd = /[.!?]["'»\])]?$/;

  while (start < words.length) {
    const end = Math.min(start + maxWords, words.length);
    if (end === words.length) {
      chunks.push(words.slice(start, end));
      break;
    }
    // Busca de trás para frente a partir do limite, até 50% do tamanho
    let cut = end;
    for (let i = end - 1; i >= start + Math.floor(maxWords / 2); i--) {
      if (sentenceEnd.test(words[i])) { cut = i + 1; break; }
    }
    chunks.push(words.slice(start, cut));
    start = cut;
  }
  return chunks;
}

interface ChunkAudio {
  url: string;
  timings: WordTiming[];
}

async function getAccessToken(): Promise<string | null> {
  try {
    const { createClient } = await import("@/lib/supabase/client");
    const supabase = createClient();
    const { data } = await supabase.auth.getSession();
    return data.session?.access_token ?? null;
  } catch {
    return null;
  }
}

async function fetchChunk(text: string, voiceId: string, signal?: AbortSignal): Promise<ChunkAudio> {
  const token = await getAccessToken();
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch("/api/tts", {
    method: "POST",
    headers,
    body: JSON.stringify({ text, voice: voiceId }),
    signal,
  });
  if (!res.ok) {
    const msg = await res.text().catch(() => "");
    const err = new Error(`TTS ${res.status}:${msg}`) as Error & { status: number; premiumRequired: boolean; voiceInvalid: boolean };
    err.status = res.status;
    err.premiumRequired = res.headers.get("X-Premium-Required") === "1";
    err.voiceInvalid = res.headers.get("X-Voice-Invalid") === "1";
    throw err;
  }
  const { audio, timings } = (await res.json()) as { audio: string; timings: WordTiming[] };
  const bytes = Uint8Array.from(atob(audio), (c) => c.charCodeAt(0));
  const url = URL.createObjectURL(new Blob([bytes], { type: "audio/mpeg" }));
  return { url, timings };
}

function wordIndexFromTimings(timings: WordTiming[], currentMs: number): number {
  if (!timings.length) return 0;
  let lo = 0;
  let hi = timings.length - 1;
  while (lo < hi) {
    const mid = Math.ceil((lo + hi) / 2);
    if (timings[mid].offsetMs <= currentMs) lo = mid;
    else hi = mid - 1;
  }
  return lo;
}

function getBrowserVoice(): SpeechSynthesisVoice | null {
  if (typeof window === "undefined") return null;
  const voices = window.speechSynthesis.getVoices();
  return voices.find((v) => v.lang.startsWith("pt")) ?? voices[0] ?? null;
}

export function useSpeech(words: string[], mode: SpeechMode = "neural") {
  const store = usePlayerStore();

  // Neural mode refs
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const generationRef = useRef(0);
  const blobUrlsRef = useRef<string[]>([]);
  const abortRef = useRef<AbortController | null>(null);

  // Browser mode refs
  const controllerRef = useRef<SpeechController | null>(null);

  useEffect(() => {
    if (mode === "neural" && audioRef.current) {
      audioRef.current.playbackRate = store.speed;
    }
  }, [store.speed, mode]);

  useEffect(() => {
    return () => {
      if (mode === "neural") {
        audioRef.current?.pause();
        blobUrlsRef.current.forEach(URL.revokeObjectURL);
      } else {
        controllerRef.current?.stop();
      }
    };
  }, [mode]);

  // ─── Browser mode ──────────────────────────────────────────────────────────

  const speakBrowser = (startIndex = 0): Promise<void> => {
    controllerRef.current?.stop();
    store.setCurrentWordIndex(startIndex);
    store.setStatus("playing");

    const controller = createSpeechController({
      words,
      speed: store.speed,
      voice: getBrowserVoice(),
      startIndex,
      onWordChange: (idx) => store.setCurrentWordIndex(idx),
      onEnd: () => {
        store.setStatus("done");
        store.setCurrentWordIndex(-1);
      },
      onError: (msg) => {
        console.error("[browser TTS]", msg);
        store.setStatus("idle");
      },
    });
    controllerRef.current = controller;
    controller.start();
    return Promise.resolve();
  };

  const pauseBrowser = () => {
    controllerRef.current?.pause();
    store.setStatus("paused");
  };

  const resumeBrowser = () => {
    controllerRef.current?.resume();
    store.setStatus("playing");
  };

  const stopBrowser = () => {
    controllerRef.current?.stop();
    controllerRef.current = null;
    store.reset();
  };

  const seekToBrowser = (index: number) => {
    speakBrowser(index).catch(console.error);
  };

  // ─── Neural mode ───────────────────────────────────────────────────────────

  const cleanupNeural = () => {
    audioRef.current?.pause();
    audioRef.current = null;
    blobUrlsRef.current.forEach(URL.revokeObjectURL);
    blobUrlsRef.current = [];
  };

  const speakNeural = async (startIndex = 0): Promise<void> => {
    const gen = ++generationRef.current;
    abortRef.current?.abort();
    cleanupNeural();
    const controller = new AbortController();
    abortRef.current = controller;
    const signal = controller.signal;
    if (!words.length) return;

    store.setStatus("loading");
    store.setCurrentWordIndex(startIndex);

    const voiceId = store.selectedVoice ?? DEFAULT_VOICE_ID;
    const chunks = chunkBysentence(words, CHUNK_SIZE);

    let startChunkIdx = 0;
    let chunkWordOffset = 0;
    for (let i = 0; i < chunks.length; i++) {
      if (chunkWordOffset + chunks[i].length > startIndex) {
        startChunkIdx = i;
        break;
      }
      chunkWordOffset += chunks[i].length;
    }

    const seekWithinChunk = startIndex - chunkWordOffset;
    let first: ChunkAudio;
    try {
      first = await fetchChunk(chunks[startChunkIdx].slice(seekWithinChunk).join(" "), voiceId, signal);
    } catch (e) {
      const err = e as { status?: number; premiumRequired?: boolean; voiceInvalid?: boolean; name?: string };
      if (err.name === "AbortError") return;
      if (gen === generationRef.current) {
        store.setStatus("idle");
        if (err.status === 429) {
          store.setRateLimitReason(err.premiumRequired ? "daily_quota" : "duplicate");
        } else if (err.voiceInvalid) {
          store.setVoice(null);
          store.setErrorMessage("A voz selecionada não está mais disponível. Resetado para a voz padrão.");
        } else {
          store.setErrorMessage("Voz neural temporariamente indisponível. Tente o modo navegador.");
        }
      }
      return;
    }
    if (gen !== generationRef.current) { URL.revokeObjectURL(first.url); return; }

    const playChunk = async (
      chunkIdx: number,
      globalOffset: number,
      chunk: ChunkAudio,
      nextFetch: Promise<ChunkAudio> | null
    ): Promise<void> => {
      if (gen !== generationRef.current) { URL.revokeObjectURL(chunk.url); return; }

      blobUrlsRef.current.push(chunk.url);
      const wordsInChunk = chunks[chunkIdx].length - (chunkIdx === startChunkIdx ? seekWithinChunk : 0);

      const audio = new Audio(chunk.url);
      audioRef.current = audio;
      audio.playbackRate = store.speed;

      let prefetchNext: Promise<ChunkAudio> | null = nextFetch;
      if (!prefetchNext && chunkIdx + 1 < chunks.length) {
        prefetchNext = fetchChunk(chunks[chunkIdx + 1].join(" "), voiceId, signal);
      }

      audio.addEventListener("timeupdate", () => {
        if (gen !== generationRef.current) return;
        const currentMs = audio.currentTime * 1000;
        const idxInChunk =
          chunk.timings.length > 0
            ? wordIndexFromTimings(chunk.timings, currentMs)
            : Math.min(
                Math.floor((audio.currentTime / (audio.duration || 1)) * wordsInChunk),
                wordsInChunk - 1
              );
        store.setCurrentWordIndex(globalOffset + idxInChunk);
      });

      await new Promise<void>((resolve, reject) => {
        audio.addEventListener("ended", () => resolve());
        audio.addEventListener("error", () => reject(new Error("audio error")));
        audio.play().catch(reject);
      });

      if (gen !== generationRef.current) return;
      store.setStatus("playing");

      const nextChunkIdx = chunkIdx + 1;
      if (nextChunkIdx >= chunks.length) {
        store.setStatus("done");
        store.setCurrentWordIndex(-1);
        return;
      }

      let nextChunk: ChunkAudio;
      try {
        nextChunk = await (prefetchNext ?? fetchChunk(chunks[nextChunkIdx].join(" "), voiceId, signal));
      } catch (e) {
        if ((e as { name?: string }).name === "AbortError") return;
        if (gen === generationRef.current) {
          store.setStatus("idle");
          store.setErrorMessage("Voz neural temporariamente indisponível. Tente o modo navegador.");
        }
        return;
      }

      const prefetchAfter =
        nextChunkIdx + 1 < chunks.length
          ? fetchChunk(chunks[nextChunkIdx + 1].join(" "), voiceId, signal)
          : null;

      await playChunk(nextChunkIdx, globalOffset + wordsInChunk, nextChunk, prefetchAfter);
    };

    const prefetchSecond =
      startChunkIdx + 1 < chunks.length
        ? fetchChunk(chunks[startChunkIdx + 1].join(" "), voiceId, signal)
        : null;

    try {
      store.setStatus("playing");
      await playChunk(startChunkIdx, chunkWordOffset + seekWithinChunk, first, prefetchSecond);
    } catch {
      if (gen === generationRef.current) store.setStatus("idle");
    }
  };

  const pauseNeural = () => {
    audioRef.current?.pause();
    store.setStatus("paused");
  };

  const resumeNeural = () => {
    if (!audioRef.current) {
      // blob URL foi liberado (aba ficou muito tempo em background) — re-busca do ponto atual
      speakNeural(store.currentWordIndex >= 0 ? store.currentWordIndex : 0).catch(console.error);
      return;
    }
    audioRef.current
      .play()
      .then(() => store.setStatus("playing"))
      .catch(() => {
        // blob URL expirado — re-busca do ponto atual sem interromper a experiência
        speakNeural(store.currentWordIndex >= 0 ? store.currentWordIndex : 0).catch(console.error);
      });
  };

  const stopNeural = () => {
    generationRef.current++;
    cleanupNeural();
    store.reset();
  };

  const seekToNeural = (index: number) => {
    speakNeural(index).catch(console.error);
  };

  // ─── API unificada ─────────────────────────────────────────────────────────

  if (mode === "browser") {
    return {
      speak: speakBrowser,
      pause: pauseBrowser,
      resume: resumeBrowser,
      stop: stopBrowser,
      seekTo: seekToBrowser,
    };
  }

  return {
    speak: speakNeural,
    pause: pauseNeural,
    resume: resumeNeural,
    stop: stopNeural,
    seekTo: seekToNeural,
  };
}
