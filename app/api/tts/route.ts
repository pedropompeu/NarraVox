import { MsEdgeTTS, OUTPUT_FORMAT } from "msedge-tts";
import { NextRequest } from "next/server";
import type { Readable } from "node:stream";
import type { WordTiming } from "@/lib/ttsTypes";

export const runtime = "nodejs";
export const maxDuration = 60;

// Rate limiting em memória — protege contra abuse na instância atual.
// Em Vercel serverless cada instância tem seu próprio estado; sem Redis,
// o limite não é compartilhado entre instâncias paralelas. Suficiente para MVP.
// Para produção escalada: substituir por Upstash Redis ou Vercel KV.
const RATE_WINDOW_MS = 5 * 60 * 1000; // 5 minutos
const RATE_MAX = 20; // requisições por janela por IP

interface RateEntry { count: number; windowStart: number }
const rateMap = new Map<string, RateEntry>();

function getClientIp(req: NextRequest): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0].trim() ??
    req.headers.get("x-real-ip") ??
    "unknown"
  );
}

function checkRateLimit(ip: string): { allowed: boolean; retryAfterSec: number } {
  const now = Date.now();
  const entry = rateMap.get(ip);

  if (!entry || now - entry.windowStart > RATE_WINDOW_MS) {
    rateMap.set(ip, { count: 1, windowStart: now });
    if (rateMap.size > 1000) {
      for (const [k, v] of rateMap) {
        if (now - v.windowStart > RATE_WINDOW_MS) rateMap.delete(k);
      }
    }
    return { allowed: true, retryAfterSec: 0 };
  }

  if (entry.count >= RATE_MAX) {
    const retryAfterSec = Math.ceil((RATE_WINDOW_MS - (now - entry.windowStart)) / 1000);
    return { allowed: false, retryAfterSec };
  }

  entry.count++;
  return { allowed: true, retryAfterSec: 0 };
}


// Extrai objetos JSON completos de uma string concatenada por balanceamento de chaves.
function extractJsonObjects(s: string): string[] {
  const results: string[] = [];
  let depth = 0, start = -1;
  for (let i = 0; i < s.length; i++) {
    if (s[i] === "{") { if (depth === 0) start = i; depth++; }
    else if (s[i] === "}") { depth--; if (depth === 0 && start !== -1) { results.push(s.slice(start, i + 1)); start = -1; } }
  }
  return results;
}

// Cada chunk do metadataStream é { Metadata: [ { Type, Data } ] }.
// Chunks chegam concatenados sem separador — extraímos por balanceamento de chaves.
function parseTimings(parts: string[]): WordTiming[] {
  const timings: WordTiming[] = [];
  for (const chunk of extractJsonObjects(parts.join(""))) {
    try {
      const obj = JSON.parse(chunk) as {
        Metadata?: Array<{
          Type: string;
          Data: { Offset: number; Duration: number; text: { Text: string; BoundaryType: string } };
        }>;
      };
      for (const item of obj.Metadata ?? []) {
        if (item.Type === "WordBoundary" && item.Data?.text?.BoundaryType === "WordBoundary") {
          timings.push({
            word: item.Data.text.Text,
            offsetMs: item.Data.Offset / 10_000,
            durationMs: item.Data.Duration / 10_000,
          });
        }
      }
    } catch {
      // chunk malformado — ignorar
    }
  }
  return timings;
}

// Drena audioStream até 'end'; coleta metadataStream via 'data' em paralelo.
// metadataStream do msedge-tts nunca emite 'end' (WebSocket fica aberta),
// por isso NÃO usamos Promise.all — ancoramos no 'end' do audio.
function drainTtsStreams(
  audioStream: Readable,
  metadataStream: Readable | null
): Promise<{ audioBuffer: Buffer; timingParts: string[] }> {
  return new Promise((resolve, reject) => {
    const audioChunks: Buffer[] = [];
    const timingParts: string[] = [];

    audioStream.on("data", (chunk: Buffer | string) => audioChunks.push(Buffer.from(chunk)));
    audioStream.on("end", () => resolve({ audioBuffer: Buffer.concat(audioChunks), timingParts }));
    audioStream.on("error", reject);

    if (metadataStream) {
      metadataStream.on("data", (chunk: Buffer | string) => timingParts.push(chunk.toString()));
      metadataStream.on("error", () => {}); // não bloqueia o audio se metadata falhar
      metadataStream.resume();
    }

    audioStream.resume();
  });
}

export async function POST(req: NextRequest) {
  const ip = getClientIp(req);
  const { allowed, retryAfterSec } = checkRateLimit(ip);
  if (!allowed) {
    return new Response("Limite de requisições atingido. Tente novamente em breve.", {
      status: 429,
      headers: { "Retry-After": String(retryAfterSec) },
    });
  }

  const { text, voice } = (await req.json()) as { text: string; voice?: string };

  if (!text?.trim()) {
    return new Response("text required", { status: 400 });
  }

  try {
    const tts = new MsEdgeTTS();
    await tts.setMetadata(
      voice ?? "pt-BR-FranciscaNeural",
      OUTPUT_FORMAT.AUDIO_24KHZ_96KBITRATE_MONO_MP3,
      { wordBoundaryEnabled: true }
    );

    const { audioStream, metadataStream } = tts.toStream(text);

    const { audioBuffer, timingParts } = await drainTtsStreams(audioStream, metadataStream ?? null);
    const timings = parseTimings(timingParts);

    return Response.json({
      audio: audioBuffer.toString("base64"),
      timings,
    });
  } catch (err) {
    console.error("[TTS API]", err);
    return new Response("TTS service error", { status: 502 });
  }
}
