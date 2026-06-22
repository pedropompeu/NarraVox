import { MsEdgeTTS, OUTPUT_FORMAT } from "msedge-tts";
import { NextRequest } from "next/server";
import type { Readable } from "node:stream";
import type { WordTiming } from "@/lib/ttsTypes";

export const runtime = "nodejs";
export const maxDuration = 60;

// ── Rate limiting por texto · janela de 24h ────────────────────────────────
//
// Modelo: cada (IP, hash do texto, voz) pode ser processado 1× por 24h.
// Se o mesmo IP solicitar o mesmo chunk dentro da janela, recebe 429.
// Teto diário por IP: DAILY_MAX requisições únicas de texto (chunks distintos).
//
// Limitação: estado em memória por instância serverless — sem Redis, não é
// compartilhado entre instâncias paralelas da Vercel. Suficiente para MVP.
// Para escala: substituir por Upstash Redis ou Vercel KV.

const DAY_MS = 24 * 60 * 60 * 1000;
const DAILY_MAX = 120; // chunks únicos por IP por dia (≈ 10–20 artigos longos)

interface TextRecord { processedAt: number }
interface DailyRecord { count: number; dayStart: number }

// ip:textHash → quando foi processado pela última vez
const textCache = new Map<string, TextRecord>();
// ip → contador diário
const dailyMap  = new Map<string, DailyRecord>();

function getClientIp(req: NextRequest): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0].trim() ??
    req.headers.get("x-real-ip") ??
    "unknown"
  );
}

// Hash leve: soma de charCodes mod 2^32 — não precisa ser criptográfico
function hashText(text: string, voice: string): string {
  let h = 0x811c9dc5;
  const s = text + "|" + voice;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = (h * 0x01000193) >>> 0;
  }
  return h.toString(16);
}

function cleanupStale(now: number): void {
  // Limpeza ocasional para não vazar memória
  if (textCache.size > 5_000) {
    for (const [k, v] of textCache)
      if (now - v.processedAt > DAY_MS) textCache.delete(k);
  }
  if (dailyMap.size > 2_000) {
    for (const [k, v] of dailyMap)
      if (now - v.dayStart > DAY_MS) dailyMap.delete(k);
  }
}

interface RateResult {
  allowed: boolean;
  reason: "ok" | "duplicate" | "daily_quota";
  retryAfterSec: number;
}

function checkRateLimit(ip: string, textHash: string): RateResult {
  const now = Date.now();
  cleanupStale(now);

  // 1. Mesmo texto já processado nas últimas 24h por este IP (verifica antes de debitar cota)
  const cacheKey = `${ip}:${textHash}`;
  const cached = textCache.get(cacheKey);
  if (cached && now - cached.processedAt < DAY_MS) {
    const retryAfterSec = Math.ceil((DAY_MS - (now - cached.processedAt)) / 1000);
    return { allowed: false, reason: "duplicate", retryAfterSec };
  }

  // 2. Teto diário por IP (só debita se não for duplicata)
  const daily = dailyMap.get(ip);
  if (!daily || now - daily.dayStart > DAY_MS) {
    dailyMap.set(ip, { count: 1, dayStart: now });
  } else {
    if (daily.count >= DAILY_MAX) {
      const retryAfterSec = Math.ceil((DAY_MS - (now - daily.dayStart)) / 1000);
      return { allowed: false, reason: "daily_quota", retryAfterSec };
    }
    daily.count++;
  }

  textCache.set(cacheKey, { processedAt: now });
  return { allowed: true, reason: "ok", retryAfterSec: 0 };
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

async function isPremiumUser(req: NextRequest): Promise<boolean> {
  try {
    const auth = req.headers.get("Authorization");
    if (!auth?.startsWith("Bearer ")) return false;
    const token = auth.slice(7);

    // Verifica JWT e busca perfil via service_role (server-only)
    const { createClient } = await import("@supabase/supabase-js");
    const admin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    const { data: { user }, error } = await admin.auth.getUser(token);
    if (error || !user) return false;

    const { data: profile } = await admin
      .from("profiles")
      .select("premium")
      .eq("id", user.id)
      .single();

    return profile?.premium === true;
  } catch {
    return false;
  }
}

export async function POST(req: NextRequest) {
  const ip = getClientIp(req);
  const body = (await req.json()) as { text: string; voice?: string };
  const { text, voice } = body;

  if (!text?.trim()) {
    return new Response("text required", { status: 400 });
  }

  // Usuário Premium: sem rate limit
  const premium = await isPremiumUser(req);

  if (!premium) {
    const textHash = hashText(text, voice ?? "pt-BR-FranciscaNeural");
    const { allowed, reason, retryAfterSec } = checkRateLimit(ip, textHash);

    if (!allowed) {
      const message =
        reason === "duplicate"
          ? "Este trecho já foi processado nas últimas 24 horas. Tente novamente amanhã."
          : "Limite diário de áudio atingido. Retome amanhã ou considere o plano Premium.";
      return new Response(message, {
        status: 429,
        headers: { "Retry-After": String(retryAfterSec), "X-Premium-Required": "1" },
      });
    }
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
