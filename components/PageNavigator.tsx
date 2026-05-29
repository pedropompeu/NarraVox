"use client";
import { M, surface } from "@/lib/designTokens";

interface PageNavigatorProps {
  currentPage: number;        // 0-indexed
  totalPages: number;
  truncated: boolean;
  freePagesLimit: number;
  onPrev: () => void;
  onNext: () => void;
}

export function PageNavigator({
  currentPage,
  totalPages,
  truncated,
  freePagesLimit,
  onPrev,
  onNext,
}: PageNavigatorProps) {
  const displayPage = currentPage + 1;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "8px 14px",
          borderRadius: 12,
          ...surface.paper,
          boxShadow:
            "inset 0 1px 0 rgba(255,255,255,.8), 0 1px 2px rgba(120,90,60,.12)",
          border: "1px solid rgba(120,90,60,.15)",
        }}
      >
        {/* Botão anterior */}
        <NavBtn onClick={onPrev} disabled={currentPage === 0} label="Página anterior">
          <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </NavBtn>

        {/* Indicador */}
        <div style={{ flex: 1, textAlign: "center" }}>
          <span style={{ fontFamily: M.serif, fontSize: 13, fontWeight: 600, color: M.ink, letterSpacing: "-0.01em" }}>
            Página {displayPage}
          </span>
          <span style={{ fontFamily: M.sans, fontSize: 11, color: M.ink3, marginLeft: 4 }}>
            de {totalPages}
          </span>
        </div>

        {/* Botão próxima */}
        <NavBtn onClick={onNext} disabled={currentPage === totalPages - 1} label="Próxima página">
          <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M9 18l6-6-6-6" />
          </svg>
        </NavBtn>
      </div>

      {/* Aviso de truncamento (tier free) */}
      {truncated && (
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          padding: "6px 12px",
          borderRadius: 8,
          background: "rgba(197,57,10,.06)",
          border: "1px solid rgba(197,57,10,.18)",
        }}>
          <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="#C5390A" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
            <line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
          <span style={{ fontFamily: M.sans, fontSize: 11, color: "#C5390A" }}>
            Plano gratuito: primeiras {freePagesLimit} páginas. Premium desbloqueia o PDF completo.
          </span>
        </div>
      )}
    </div>
  );
}

function NavBtn({
  children,
  onClick,
  disabled,
  label,
}: {
  children: React.ReactNode;
  onClick: () => void;
  disabled: boolean;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      style={{
        width: 30,
        height: 30,
        borderRadius: 8,
        border: "1px solid rgba(120,90,60,.20)",
        background: disabled
          ? "transparent"
          : "linear-gradient(180deg, rgba(255,255,255,.8) 0%, rgba(255,255,255,.45) 100%)",
        color: disabled ? M.muted : M.ink2,
        cursor: disabled ? "not-allowed" : "pointer",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        boxShadow: disabled ? "none" : "inset 0 1px 0 rgba(255,255,255,.9), 0 1px 2px rgba(120,90,60,.12)",
        transition: "all 0.15s ease",
        flexShrink: 0,
      }}
    >
      {children}
    </button>
  );
}
