"use client";
import { useState } from "react";
import Link from "next/link";
import { M, surface } from "@/lib/designTokens";
import { WoodPlayer } from "@/components/WoodPlayer";
import { LinenEditor } from "@/components/LinenEditor";
import { GelReader } from "@/components/GelReader";
import { usePlayer } from "@/hooks/usePlayer";
import { EDGE_TTS_VOICES } from "@/lib/edgeTtsVoices";

// ── Escuro tátil — coerente com o ash do sistema ──────────────────────────────
const D = {
  bg:     "#2A1D14",
  surf:   "#3A2510",
  border: "rgba(255,235,170,.12)",
  text:   "#EDE0CE",
  text2:  "#C8B49C",
  text3:  "#9A8272",
  muted:  "#6A5E52",
  brass:  "#E0B453",
  glass:  "#60A5FA",
};

// ── Logo SVG canônico (BRAND.md Seção 02) ────────────────────────────────────
function Logo({ color = D.text }: { color?: string }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
      stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 12 L7 12 L9 6 L11 12 L22 12" />
    </svg>
  );
}

// ── Demo embutido ─────────────────────────────────────────────────────────────
const DEMO_TEXT = "Profissionais e estudantes acumulam textos que raramente conseguem ler. NarraVox transforma qualquer texto em áudio com destaque de palavra em tempo real. Cole, ouça, aprenda — em menos de 10 segundos, sem criar conta.";

function EmbeddedDemo() {
  const [text, setText] = useState(DEMO_TEXT);
  const player = usePlayer(text);
  const isReading = player.status === "playing" || player.status === "paused" || player.status === "loading";

  return (
    <div style={{
      border: `1px solid ${D.border}`,
      borderRadius: 20,
      padding: 20,
      display: "flex",
      flexDirection: "column",
      gap: 16,
      maxWidth: 680,
      width: "100%",
      background: "rgba(255,255,255,.03)",
      boxShadow: "0 24px 48px rgba(0,0,0,.4), inset 0 1px 0 rgba(255,235,170,.08)",
    }}>
      <div style={{ height: 220, overflow: "hidden", borderRadius: 12 }}>
        {isReading ? (
          <GelReader
            words={player.words}
            currentWordIndex={player.currentWordIndex}
            onWordClick={player.seekTo}
          />
        ) : (
          <LinenEditor value={text} onChange={setText} />
        )}
      </div>
      <WoodPlayer
        status={player.status}
        currentWordIndex={player.currentWordIndex}
        totalWords={player.totalWords}
        speed={player.speed}
        voices={EDGE_TTS_VOICES}
        selectedVoice={player.selectedVoice}
        elapsedSeconds={player.elapsedSeconds}
        onPlay={player.play}
        onPause={player.pause}
        onResume={player.resume}
        onStop={player.stop}
        onRestart={player.restart}
        onSeek={player.seekTo}
        onSpeedChange={player.setSpeed}
        onVoiceChange={player.setVoice}
      />
    </div>
  );
}

// ── Feature card — surface paper do sistema tátil ─────────────────────────────
function FeatureCard({ icon, title, desc }: { icon: string; title: string; desc: string }) {
  return (
    <div style={{
      padding: "22px 20px",
      borderRadius: 16,
      ...surface.paper,
      border: "1px solid rgba(120,90,60,.12)",
      boxShadow: "inset 0 1px 0 rgba(255,255,255,.7), 0 2px 8px rgba(120,90,60,.06)",
    }}>
      <div style={{ fontSize: 26, marginBottom: 10 }}>{icon}</div>
      <h3 style={{ margin: "0 0 6px", fontFamily: M.serif, fontSize: 16, fontWeight: 600, color: M.ink, letterSpacing: "-0.01em" }}>
        {title}
      </h3>
      <p style={{ margin: 0, fontFamily: M.sans, fontSize: 13, color: M.ink3, lineHeight: 1.6 }}>
        {desc}
      </p>
    </div>
  );
}

// ── Linha da tabela de preços ─────────────────────────────────────────────────
function PricingRow({ label, free, premium }: { label: string; free: string; premium: string }) {
  return (
    <tr style={{ borderBottom: "1px solid rgba(120,90,60,.08)" }}>
      <td style={{ padding: "11px 16px", fontFamily: M.sans, fontSize: 13, color: M.ink2 }}>{label}</td>
      <td style={{ padding: "11px 16px", textAlign: "center", fontFamily: M.sans, fontSize: 13, color: M.ink3 }}>{free}</td>
      <td style={{ padding: "11px 16px", textAlign: "center", fontFamily: M.sans, fontSize: 13, color: "#3F7A1F", fontWeight: 600 }}>{premium}</td>
    </tr>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function LandingPage() {
  return (
    <div style={{ fontFamily: M.sans }}>

      {/* ── HERO — escuro tátil quente ──────────────────────────────────────── */}
      <section style={{
        background: D.bg,
        backgroundImage: "radial-gradient(ellipse 80% 60% at 50% -10%, rgba(224,180,83,.08) 0%, transparent 60%)",
        color: D.text,
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
      }}>
        {/* Nav */}
        <nav style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "20px 40px",
          borderBottom: `1px solid ${D.border}`,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Logo />
            <span style={{ fontFamily: M.serif, fontSize: 20, fontWeight: 600, letterSpacing: "-0.02em", color: D.text }}>
              narravox
            </span>
          </div>
          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <Link href="/auth" style={{ fontFamily: M.sans, fontSize: 13, color: D.text3, textDecoration: "none", fontWeight: 500 }}>
              Entrar
            </Link>
            <Link href="/auth" style={{
              padding: "8px 18px", borderRadius: 8,
              background: "linear-gradient(180deg, #E0B453 0%, #B8860B 100%)",
              boxShadow: "inset 0 1px 0 rgba(255,235,170,.5), 0 2px 6px rgba(80,55,5,.4)",
              color: "#2A1D14",
              fontFamily: M.sans, fontSize: 13, fontWeight: 700, textDecoration: "none",
            }}>
              Criar conta grátis
            </Link>
          </div>
        </nav>

        {/* Conteúdo do hero */}
        <div style={{
          flex: 1,
          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
          padding: "60px 24px", textAlign: "center", gap: 28,
        }}>
          {/* Badge */}
          <div style={{
            display: "inline-block", padding: "5px 14px", borderRadius: 999,
            background: "rgba(224,180,83,.12)",
            border: `1px solid ${D.border}`,
            fontFamily: M.sans, fontSize: 11, fontWeight: 600,
            color: D.brass, letterSpacing: "0.04em",
          }}>
            Leitor TTS · Word highlighting · PWA instalável
          </div>

          {/* Headline — BRAND.md Seção 12: tagline aprovada */}
          <h1 style={{
            margin: 0,
            fontSize: "clamp(38px, 6vw, 62px)",
            fontFamily: M.serif,
            fontWeight: 700,
            lineHeight: 1.1,
            letterSpacing: "-0.03em",
            color: D.text,
            maxWidth: 680,
          }}>
            Seu texto,<br />
            <span style={{ color: D.brass }}>sua voz.</span>
          </h1>

          {/* Sub — BRAND.md Nível 2 da hierarquia */}
          <p style={{
            margin: 0, fontFamily: M.sans, fontSize: 17,
            color: D.text3, lineHeight: 1.65, maxWidth: 480,
          }}>
            Cole qualquer texto. Ouça agora.<br />
            Sem conta, sem instalação.
          </p>

          {/* Demo real */}
          <EmbeddedDemo />

          <p style={{ margin: 0, fontFamily: M.sans, fontSize: 12, color: D.text3, fontStyle: "italic" }}>
            Experimente agora — sem cartão de crédito
          </p>
        </div>
      </section>

      {/* ── COMO FUNCIONA — surface linen ──────────────────────────────────── */}
      <section style={{ ...surface.linen, padding: "80px 24px" }}>
        <div style={{ maxWidth: 800, margin: "0 auto", textAlign: "center" }}>
          <h2 style={{ margin: "0 0 10px", fontFamily: M.serif, fontSize: 30, fontWeight: 700, color: M.ink, letterSpacing: "-0.02em" }}>
            Como funciona
          </h2>
          <p style={{ margin: "0 0 48px", fontFamily: M.sans, fontSize: 14, color: M.ink3 }}>
            De texto a áudio em menos de 10 segundos.
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 32 }}>
            {[
              { n: "01", t: "Cole o texto", d: "Qualquer texto — artigo, thread, capítulo, PDF ou arquivo .txt." },
              { n: "02", t: "Escolha a voz", d: "Vozes neurais em português. Ajuste a velocidade ao seu ritmo." },
              { n: "03", t: "Ouça", d: "Cada palavra é destacada em tempo real. Acompanhe sem perder o fio." },
            ].map(({ n, t, d }) => (
              <div key={n}>
                <div style={{ fontFamily: M.sans, fontSize: 11, fontWeight: 700, color: M.glass, letterSpacing: "0.08em", marginBottom: 10 }}>
                  {n}
                </div>
                <h3 style={{ margin: "0 0 8px", fontFamily: M.serif, fontSize: 17, fontWeight: 600, color: M.ink }}>{t}</h3>
                <p style={{ margin: 0, fontFamily: M.sans, fontSize: 13, color: M.ink3, lineHeight: 1.6 }}>{d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES — surface paper ───────────────────────────────────────── */}
      <section style={{ ...surface.paper, padding: "80px 24px" }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <h2 style={{ margin: "0 0 10px", textAlign: "center", fontFamily: M.serif, fontSize: 30, fontWeight: 700, color: M.ink, letterSpacing: "-0.02em" }}>
            Feito para quem ouve em movimento
          </h2>
          <p style={{ margin: "0 0 48px", textAlign: "center", fontFamily: M.sans, fontSize: 14, color: M.ink3 }}>
            Construído para transformar tempo passivo em aprendizado ativo.
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 14 }}>
            <FeatureCard icon="🎯" title="Word highlighting" desc="A palavra exata sendo lida é destacada em tempo real. Acompanhe sem perder o fio." />
            <FeatureCard icon="📄" title="PDF e TXT" desc="Importe PDFs com navegação por página ou arquivos de texto. Sem copiar e colar." />
            <FeatureCard icon="🔖" title="Bookmarks e anotações" desc="Marque trechos e anote insights sem sair do player. Exportação Premium." />
            <FeatureCard icon="🔥" title="Streaks de leitura" desc="Acompanhe seu progresso diário e mantenha a sequência." />
            <FeatureCard icon="🔁" title="Loop de trecho" desc="Repita qualquer trecho em loop — ideal para memorização e idiomas." />
            <FeatureCard icon="🌙" title="Modo noturno" desc="Dark mode automático após as 22h. Seus olhos agradecem." />
          </div>
        </div>
      </section>

      {/* ── PRICING — surface linen ────────────────────────────────────────── */}
      <section style={{ ...surface.linen, padding: "80px 24px" }}>
        <div style={{ maxWidth: 620, margin: "0 auto", textAlign: "center" }}>
          <h2 style={{ margin: "0 0 10px", fontFamily: M.serif, fontSize: 30, fontWeight: 700, color: M.ink, letterSpacing: "-0.02em" }}>
            Simples assim
          </h2>
          <p style={{ margin: "0 0 40px", fontFamily: M.sans, fontSize: 14, color: M.ink3 }}>
            Comece grátis. Evolua quando precisar.
          </p>

          <div style={{
            borderRadius: 16,
            border: "1px solid rgba(120,90,60,.15)",
            overflow: "hidden",
            boxShadow: "inset 0 1px 0 rgba(255,255,255,.7), 0 4px 16px rgba(120,90,60,.08)",
          }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ ...surface.paper }}>
                  <th style={{ padding: "13px 16px", textAlign: "left", fontFamily: M.sans, fontSize: 11, fontWeight: 600, color: M.ink3, textTransform: "uppercase", letterSpacing: "0.05em" }}>Recurso</th>
                  <th style={{ padding: "13px 16px", textAlign: "center", fontFamily: M.sans, fontSize: 11, fontWeight: 600, color: M.ink3, textTransform: "uppercase", letterSpacing: "0.05em" }}>Free</th>
                  <th style={{ padding: "13px 16px", textAlign: "center", fontFamily: M.sans, fontSize: 11, fontWeight: 700, color: "#B45309", textTransform: "uppercase", letterSpacing: "0.05em" }}>Premium</th>
                </tr>
              </thead>
              <tbody>
                <PricingRow label="Vozes neurais" free="✓" premium="✓" />
                <PricingRow label="Textos por dia" free="120 chunks" premium="Ilimitado" />
                <PricingRow label="PDF" free="até 10 páginas" premium="Completo" />
                <PricingRow label="Velocidade máxima" free="2×" premium="3,5×" />
                <PricingRow label="Sleep Timer" free="—" premium="✓" />
                <PricingRow label="Exportar anotações" free="—" premium="✓" />
              </tbody>
            </table>
          </div>

          <div style={{ marginTop: 32, display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/auth" style={{
              padding: "12px 26px", borderRadius: 10,
              border: "1px solid rgba(120,90,60,.25)",
              background: "transparent", color: M.ink2,
              fontFamily: M.sans, fontSize: 14, fontWeight: 600, textDecoration: "none",
            }}>
              Usar grátis
            </Link>
            <Link href="/auth" style={{
              padding: "12px 26px", borderRadius: 10, border: "none",
              background: "linear-gradient(135deg, #E0B453, #B8860B)",
              boxShadow: "inset 0 1px 0 rgba(255,235,170,.5), 0 4px 12px rgba(80,55,5,.3)",
              color: "#2A1D14",
              fontFamily: M.sans, fontSize: 14, fontWeight: 700, textDecoration: "none",
            }}>
              Criar conta e ouvir sem limites →
            </Link>
          </div>
        </div>
      </section>

      {/* ── FOOTER — escuro tátil ───────────────────────────────────────────── */}
      <footer style={{
        background: D.bg,
        borderTop: `1px solid ${D.border}`,
        padding: "28px 40px",
        display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Logo color={D.text3} />
          <span style={{ fontFamily: M.serif, fontSize: 15, color: D.text3 }}>narravox</span>
          <span style={{ fontFamily: M.sans, fontSize: 11, color: D.muted, fontStyle: "italic" }}>
            · seu texto, sua voz.
          </span>
        </div>
        <div style={{ display: "flex", gap: 20 }}>
          <Link href="/privacidade" style={{ fontFamily: M.sans, fontSize: 13, color: D.text3, textDecoration: "none" }}>Privacidade</Link>
          <Link href="/auth" style={{ fontFamily: M.sans, fontSize: 13, color: D.text3, textDecoration: "none" }}>Criar conta</Link>
          <a href="mailto:pedrolpompeu@gmail.com" style={{ fontFamily: M.sans, fontSize: 13, color: D.text3, textDecoration: "none" }}>Contato</a>
        </div>
      </footer>
    </div>
  );
}
