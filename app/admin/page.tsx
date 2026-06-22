import { createAdminClient } from "@/lib/supabase/server";
import { togglePremium } from "./actions";
import { signOut } from "@/app/auth/actions";
import { formatRelativeDate } from "@/lib/historyUtils";

interface Profile {
  id: string;
  email: string;
  premium: boolean;
  premium_at: string | null;
  created_at: string;
}

async function getProfiles(search: string): Promise<Profile[]> {
  const admin = createAdminClient();
  let query = admin
    .from("profiles")
    .select("id, email, premium, premium_at, created_at")
    .order("created_at", { ascending: false });
  if (search) query = query.ilike("email", `%${search}%`);
  const { data } = await query;
  return (data ?? []) as Profile[];
}

// ── Design tokens (tema escuro quente) ────────────────────────────────────────
const C = {
  bg:      "#1C120B",
  surface: "rgba(255,235,170,.03)",
  border:  "rgba(255,235,170,.09)",
  border2: "rgba(255,235,170,.05)",
  text:    "#EDE0CE",
  text2:   "#C8B49C",
  text3:   "#9A8272",
  muted:   "#6A5E52",
  brass:   "#E0B453",
  brassLo: "rgba(224,180,83,.10)",
  blue:    "#60A5FA",
  blueLo:  "rgba(96,165,250,.10)",
  red:     "#F87171",
  redLo:   "rgba(248,113,113,.10)",
  green:   "#86EFAC",
  greenLo: "rgba(134,239,172,.08)",
} as const;

const sans  = "var(--font-inter), -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif";
const serif = "var(--font-fraunces), 'Cormorant Garamond', Georgia, serif";

// ── Helpers ───────────────────────────────────────────────────────────────────
function initials(email: string): string {
  const [local] = email.split("@");
  return local.slice(0, 2).toUpperCase();
}

function StatCard({
  label, value, color, icon,
}: { label: string; value: number; color: string; icon: React.ReactNode }) {
  return (
    <div style={{
      padding: "18px 20px", borderRadius: 14,
      background: C.surface, border: `1px solid ${C.border}`,
      display: "flex", alignItems: "center", gap: 14,
    }}>
      <div style={{
        width: 38, height: 38, borderRadius: 10, flexShrink: 0,
        background: `${color}18`, border: `1px solid ${color}30`,
        display: "flex", alignItems: "center", justifyContent: "center",
        color,
      }}>
        {icon}
      </div>
      <div>
        <div style={{ fontFamily: serif, fontSize: 28, fontWeight: 700, color, letterSpacing: "-0.02em", lineHeight: 1 }}>
          {value}
        </div>
        <div style={{ fontFamily: sans, fontSize: 11, color: C.text3, marginTop: 3, textTransform: "uppercase", letterSpacing: "0.06em" }}>
          {label}
        </div>
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q = "" } = await searchParams;
  const profiles = await getProfiles(q);

  const total        = profiles.length;
  const premiumCount = profiles.filter((p) => p.premium).length;
  const freeCount    = total - premiumCount;

  return (
    <div style={{ minHeight: "100vh", background: C.bg, color: C.text, fontFamily: sans }}>

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <header style={{
        borderBottom: `1px solid ${C.border}`,
        padding: "0 32px",
        height: 60,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        background: "linear-gradient(180deg, rgba(255,235,170,.04) 0%, transparent 100%)",
        position: "sticky", top: 0, zIndex: 10,
        backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)",
      }}>
        {/* Logo + badge */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 30, height: 30, borderRadius: 9,
            background: "linear-gradient(180deg, #E8C860 0%, #B8922C 100%)",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "inset 0 1px 0 rgba(255,235,170,.7), 0 2px 4px rgba(80,55,5,.5)",
            color: "#3A2700", flexShrink: 0,
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" aria-hidden="true">
              <path d="M2 12 L7 12 L9 6 L11 12 L22 12" />
            </svg>
          </div>
          <span style={{ fontFamily: serif, fontSize: 17, fontWeight: 600, letterSpacing: "-0.02em", color: C.text }}>
            NarraVox
          </span>
          <span style={{
            fontSize: 9, fontWeight: 700, color: C.brass,
            background: C.brassLo, border: `1px solid ${C.brass}30`,
            padding: "2px 7px", borderRadius: 999,
            letterSpacing: "0.08em", textTransform: "uppercase",
          }}>
            Admin
          </span>
        </div>

        {/* Nav direita */}
        <nav style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <a href="/app" style={{
            display: "inline-flex", alignItems: "center", gap: 5,
            padding: "5px 12px", borderRadius: 8,
            border: `1px solid ${C.border}`,
            background: "transparent",
            fontFamily: sans, fontSize: 12, fontWeight: 500, color: C.text3,
            textDecoration: "none",
            transition: "color 0.15s ease",
          }}>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
            App
          </a>
          <form action={signOut}>
            <button type="submit" style={{
              display: "inline-flex", alignItems: "center", gap: 5,
              padding: "5px 12px", borderRadius: 8,
              border: `1px solid ${C.border}`,
              background: "transparent",
              fontFamily: sans, fontSize: 12, fontWeight: 500, color: C.text3,
              cursor: "pointer",
            }}>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
              </svg>
              Sair
            </button>
          </form>
        </nav>
      </header>

      <main style={{ padding: "28px 32px", maxWidth: 1000, margin: "0 auto" }}>

        {/* ── Page title + busca ────────────────────────────────────────────── */}
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 24, gap: 16, flexWrap: "wrap" }}>
          <div>
            <h1 style={{ margin: 0, fontFamily: serif, fontSize: 26, fontWeight: 600, letterSpacing: "-0.02em", color: C.text }}>
              Usuários
            </h1>
            <p style={{ margin: "3px 0 0", fontFamily: sans, fontSize: 12, color: C.text3 }}>
              {total} cadastro{total !== 1 ? "s" : ""} · atualizado agora
            </p>
          </div>

          <form style={{ display: "flex", gap: 8 }}>
            <div style={{ position: "relative" }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={C.text3}
                strokeWidth="2" strokeLinecap="round" style={{ position: "absolute", left: 11, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} aria-hidden="true">
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              <input
                name="q"
                defaultValue={q}
                placeholder="buscar por e-mail…"
                autoComplete="off"
                style={{
                  padding: "8px 14px 8px 32px", borderRadius: 9,
                  border: `1px solid ${C.border}`,
                  background: C.surface, color: C.text,
                  fontFamily: sans, fontSize: 13, outline: "none",
                  width: 220,
                }}
              />
            </div>
            {q && (
              <a href="/admin" style={{
                padding: "8px 12px", borderRadius: 9,
                border: `1px solid ${C.border}`,
                background: "transparent", color: C.text3,
                fontFamily: sans, fontSize: 12, textDecoration: "none",
                display: "inline-flex", alignItems: "center",
              }}>
                Limpar
              </a>
            )}
          </form>
        </div>

        {/* ── Stats ────────────────────────────────────────────────────────── */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 24 }}>
          <StatCard
            label="Total"
            value={total}
            color={C.text2}
            icon={
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
              </svg>
            }
          />
          <StatCard
            label="Premium"
            value={premiumCount}
            color={C.brass}
            icon={
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
              </svg>
            }
          />
          <StatCard
            label="Free"
            value={freeCount}
            color={C.blue}
            icon={
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
              </svg>
            }
          />
        </div>

        {/* ── Tabela de usuários ────────────────────────────────────────────── */}
        <div style={{ borderRadius: 14, border: `1px solid ${C.border}`, overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: C.surface, borderBottom: `1px solid ${C.border}` }}>
                {["Usuário", "Plano", "Cadastro", "Premium desde", "Ação"].map((h) => (
                  <th key={h} style={{
                    padding: "10px 16px", textAlign: "left",
                    fontFamily: sans, fontSize: 10, fontWeight: 600,
                    color: C.text3, textTransform: "uppercase", letterSpacing: "0.07em",
                    whiteSpace: "nowrap",
                  }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {profiles.length === 0 && (
                <tr>
                  <td colSpan={5} style={{
                    padding: "56px 16px", textAlign: "center",
                  }}>
                    <div style={{ fontFamily: serif, fontStyle: "italic", color: C.muted, fontSize: 15, marginBottom: 6 }}>
                      {q ? `Nenhum usuário encontrado para "${q}".` : "Nenhum usuário cadastrado ainda."}
                    </div>
                    {q && (
                      <a href="/admin" style={{ fontFamily: sans, fontSize: 12, color: C.blue, textDecoration: "none" }}>
                        Ver todos →
                      </a>
                    )}
                  </td>
                </tr>
              )}
              {profiles.map((p, i) => (
                <tr
                  key={p.id}
                  style={{
                    borderBottom: i < profiles.length - 1 ? `1px solid ${C.border2}` : "none",
                    background: p.premium ? `${C.brassLo}` : "transparent",
                  }}
                >
                  {/* Avatar + email */}
                  <td style={{ padding: "12px 16px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{
                        width: 30, height: 30, borderRadius: "50%", flexShrink: 0,
                        background: p.premium
                          ? "linear-gradient(135deg, #E8C860, #B8922C)"
                          : `rgba(255,255,255,.08)`,
                        border: `1px solid ${p.premium ? "rgba(224,180,83,.40)" : C.border}`,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontFamily: sans, fontSize: 10, fontWeight: 700,
                        color: p.premium ? "#3A2700" : C.text3,
                      }}>
                        {initials(p.email)}
                      </div>
                      <span style={{ fontFamily: sans, fontSize: 13, color: C.text }}>
                        {p.email.length > 30 ? p.email.slice(0, 28) + "…" : p.email}
                      </span>
                    </div>
                  </td>

                  {/* Badge plano */}
                  <td style={{ padding: "12px 16px" }}>
                    <span style={{
                      display: "inline-block", padding: "3px 10px", borderRadius: 999,
                      fontFamily: sans, fontSize: 10, fontWeight: 700, letterSpacing: "0.04em",
                      background: p.premium ? C.brassLo : "rgba(255,255,255,.05)",
                      color: p.premium ? C.brass : C.text3,
                      border: `1px solid ${p.premium ? `${C.brass}35` : C.border}`,
                      textTransform: "uppercase",
                    }}>
                      {p.premium ? "Premium" : "Free"}
                    </span>
                  </td>

                  {/* Datas */}
                  <td style={{ padding: "12px 16px", fontFamily: sans, fontSize: 12, color: C.muted, whiteSpace: "nowrap" }}>
                    {formatRelativeDate(p.created_at)}
                  </td>
                  <td style={{ padding: "12px 16px", fontFamily: sans, fontSize: 12, color: C.muted, whiteSpace: "nowrap" }}>
                    {p.premium_at ? formatRelativeDate(p.premium_at) : (
                      <span style={{ color: C.border }}>—</span>
                    )}
                  </td>

                  {/* Ação */}
                  <td style={{ padding: "12px 16px" }}>
                    <form action={togglePremium.bind(null, p.id, p.premium)}>
                      <button type="submit" style={{
                        padding: "5px 13px", borderRadius: 8,
                        border: `1px solid ${p.premium ? `${C.red}30` : `${C.blue}30`}`,
                        background: p.premium ? C.redLo : C.blueLo,
                        color: p.premium ? C.red : C.blue,
                        fontFamily: sans, fontSize: 11, fontWeight: 600, cursor: "pointer",
                        whiteSpace: "nowrap",
                        transition: "opacity 0.15s ease",
                      }}>
                        {p.premium ? "Remover Premium" : "Dar Premium"}
                      </button>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Rodapé da tabela */}
          {profiles.length > 0 && (
            <div style={{
              padding: "10px 16px",
              borderTop: `1px solid ${C.border2}`,
              background: C.surface,
              fontFamily: sans, fontSize: 11, color: C.muted,
              display: "flex", justifyContent: "space-between",
            }}>
              <span>
                {q
                  ? `${total} resultado${total !== 1 ? "s" : ""} para "${q}"`
                  : `${total} usuário${total !== 1 ? "s" : ""} no total`}
              </span>
              <span>{premiumCount} Premium · {freeCount} Free</span>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
