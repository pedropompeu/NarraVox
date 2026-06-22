"use client";
import { useState } from "react";
import { M, surface } from "@/lib/designTokens";
import { formatRelativeDate, type HistoryItem } from "@/lib/historyUtils";

interface CardStackHistoryProps {
  items: HistoryItem[];
  activeId: string | null;
  onSelect: (item: HistoryItem) => void;
  onDelete: (id: string) => void;
  onClear: () => void;
  onClose: () => void;
  asBottomSheet?: boolean;
}

function LibraryCard({
  item,
  index,
  onSelect,
  onDelete,
}: {
  item: HistoryItem;
  index: number;
  onSelect: () => void;
  onDelete: () => void;
}) {
  const [hov, setHov] = useState(false);

  const progress = item.wordCount > 0 ? item.lastPosition / item.wordCount : 0;
  const finished = progress >= 0.98;
  const when = formatRelativeDate(item.createdAt);
  const rotation = index % 2 === 0 ? -0.3 : 0.4;

  return (
    <div style={{ position: "relative" }}>
      <button
        onClick={onSelect}
        onMouseEnter={() => setHov(true)}
        onMouseLeave={() => setHov(false)}
        style={{
          position: "relative",
          textAlign: "left",
          width: "100%",
          border: "none",
          cursor: "pointer",
          padding: "14px 16px 12px",
          paddingRight: 36,
          borderRadius: 12,
          ...surface.paper,
          transform: `translateY(${hov ? -3 : 0}px) rotate(${rotation}deg)`,
          transition:
            "transform 0.22s cubic-bezier(.2,.8,.3,1.2), box-shadow 0.22s ease",
          boxShadow: hov
            ? "inset 0 1px 0 rgba(255,255,255,.85), 0 2px 0 rgba(120,90,60,.20), 0 14px 24px -8px rgba(40,20,5,.55), 0 4px 8px rgba(40,20,5,.30)"
            : "inset 0 1px 0 rgba(255,255,255,.85), 0 2px 0 rgba(120,90,60,.20), 0 6px 14px -6px rgba(40,20,5,.45)",
        }}
      >
        {/* Title */}
        <div
          style={{
            fontFamily: M.serif,
            fontSize: 14,
            fontWeight: 600,
            color: M.ink,
            letterSpacing: "-0.005em",
            lineHeight: 1.35,
            overflow: "hidden",
            textOverflow: "ellipsis",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
          }}
        >
          {item.title}
        </div>

        {/* Meta row */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            marginTop: 8,
            fontFamily: M.sans,
            fontSize: 11,
            color: M.ink3,
            fontVariantNumeric: "tabular-nums",
          }}
        >
          <span>{item.wordCount.toLocaleString("pt-BR")} palavras</span>
          <span style={{ color: M.muted }}>·</span>
          <span>{when}</span>
          {finished && (
            <span
              style={{
                marginLeft: "auto",
                display: "inline-flex",
                alignItems: "center",
                gap: 4,
                color: "#3F7A1F",
                fontWeight: 600,
              }}
            >
              <svg width={10} height={10} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M12 2c4 4 6 7 6 10a6 6 0 0 1-12 0c0-3 2-6 6-10z" />
              </svg>{" "}
              ouvido
            </span>
          )}
          {item.lastPosition > 0 && !finished && (
            <span style={{ marginLeft: "auto", color: M.muted }}>
              retomar em {item.lastPosition}
            </span>
          )}
        </div>

        {/* Progress bar */}
        <div
          style={{
            marginTop: 10,
            height: 4,
            borderRadius: 999,
            background: "rgba(120,90,60,.18)",
            boxShadow: "inset 0 1px 1px rgba(60,40,20,.25)",
          }}
        >
          <div
            style={{
              width: `${Math.min(progress * 100, 100)}%`,
              height: "100%",
              borderRadius: 999,
              background: finished
                ? "linear-gradient(180deg, #BBD89F 0%, #6FA046 100%)"
                : "linear-gradient(180deg, #FFE38B 0%, #C99B36 100%)",
              boxShadow: "0 0 4px rgba(180,140,40,.35)",
            }}
          />
        </div>
      </button>

      {/* Delete button — sits outside the card button to avoid nesting */}
      <button
        onClick={(e) => { e.stopPropagation(); onDelete(); }}
        aria-label="Remover item"
        style={{
          position: "absolute",
          top: 10,
          right: 10,
          width: 24,
          height: 24,
          borderRadius: "50%",
          border: "none",
          background: "rgba(120,90,60,.12)",
          color: M.ink3,
          cursor: "pointer",
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 11,
        }}
      >
        ✕
      </button>
    </div>
  );
}

export function CardStackHistory({
  items,
  onSelect,
  onDelete,
  onClear,
  onClose,
  asBottomSheet = false,
}: CardStackHistoryProps) {
  return (
    <aside
      role="dialog"
      aria-label="Histórico de textos"
      style={{
        position: "relative",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        borderRadius: asBottomSheet ? "24px 24px 0 0" : 16,
        ...surface.wood,
        boxShadow: asBottomSheet
          ? "0 -20px 50px -10px rgba(60,30,10,.50)"
          : "inset 0 2px 0 rgba(255,235,200,.45), inset 0 -2px 0 rgba(60,30,10,.35), 0 2px 4px rgba(60,30,10,.25), 0 24px 48px -16px rgba(60,30,10,.45)",
        padding: "14px 16px 18px",
      }}
    >
      {/* Bottom sheet handle */}
      {asBottomSheet && (
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 8 }}>
          <div
            style={{
              width: 44,
              height: 5,
              borderRadius: 3,
              background: "rgba(60,30,10,.25)",
              boxShadow: "inset 0 1px 0 rgba(255,235,200,.4)",
            }}
          />
        </div>
      )}

      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "4px 6px 12px",
        }}
      >
        <div>
          <h3
            style={{
              margin: 0,
              fontFamily: M.serif,
              fontSize: 18,
              fontWeight: 600,
              color: "#FFF6E5",
              letterSpacing: "-0.01em",
              textShadow: "0 1px 0 rgba(60,30,10,.4)",
            }}
          >
            Histórico
          </h3>
          <p
            style={{
              margin: "3px 0 0",
              fontFamily: M.sans,
              fontSize: 11,
              color: "rgba(255,246,229,.7)",
            }}
          >
            últimos {items.length} textos · só neste aparelho
          </p>
        </div>
        <button
          onClick={onClose}
          aria-label="Fechar histórico"
          style={{
            width: 32,
            height: 32,
            borderRadius: "50%",
            border: "none",
            cursor: "pointer",
            background: "rgba(255,246,229,.18)",
            color: "#FFF6E5",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "inset 0 1px 0 rgba(255,255,255,.25)",
          }}
        >
          <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        </button>
      </div>

      {/* Card list */}
      <div
        style={{
          flex: 1,
          overflow: "auto",
          padding: "4px 2px 8px",
          display: "flex",
          flexDirection: "column",
          gap: 12,
        }}
      >
        {items.length === 0 ? (
          <p
            style={{
              fontFamily: M.serif,
              fontStyle: "italic",
              fontSize: 14,
              color: "rgba(255,246,229,.6)",
              textAlign: "center",
              padding: "32px 16px",
            }}
          >
            Nenhum texto ouvido ainda.
          </p>
        ) : (
          items.map((item, i) => (
            <LibraryCard
              key={item.id}
              item={item}
              index={i}
              onSelect={() => onSelect(item)}
              onDelete={() => onDelete(item.id)}
            />
          ))
        )}
      </div>

      {/* Footer */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "12px 4px 0",
          borderTop: "1px dashed rgba(255,246,229,.20)",
          gap: 12,
        }}
      >
        <span
          style={{
            fontFamily: M.serif,
            fontStyle: "italic",
            fontSize: 12,
            color: "rgba(255,246,229,.6)",
          }}
        >
          guardado em casa
        </span>
        {items.length > 0 && (
          <button
            onClick={() => {
              if (confirm("Isso remove todos os textos salvos neste dispositivo. Continuar?")) {
                onClear();
              }
            }}
            style={{
              padding: "7px 12px",
              borderRadius: 10,
              border: "none",
              cursor: "pointer",
              background: "rgba(255,246,229,.10)",
              color: "#FFE6C9",
              fontFamily: M.sans,
              fontSize: 12,
              fontWeight: 600,
              boxShadow: "inset 0 1px 0 rgba(255,255,255,.18)",
            }}
          >
            Limpar histórico
          </button>
        )}
      </div>
    </aside>
  );
}
