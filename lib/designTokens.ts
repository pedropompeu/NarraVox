// NarraVox Tátil — design tokens
// Paleta, texturas SVG e composições de superfície.
// Fonte da verdade: brand/NarraVox Tactile _standalone_.html

export const M = {
  serif: "var(--font-fraunces), 'Cormorant Garamond', Georgia, serif",
  sans:  "var(--font-inter), -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif",

  // Temáticos — respondem ao data-theme via CSS vars
  ink:   "var(--ink)",
  ink2:  "var(--ink-2)",
  ink3:  "var(--ink-3)",
  muted: "var(--ink-muted)",
  glass: "var(--accent-primary)",

  paper:     "var(--paper)",
  paperEdge: "var(--paper-edge)",
  linenWarm: "var(--linen-warm)",

  // Materiais de marca — fixos em ambos os temas
  appleHi:   "#FF7A6E",
  appleMid:  "#D32F2F",
  appleLow:  "#9B1717",
  appleDeep: "#5E0A0A",

  brass:      "#B8860B",
  brassLight: "#E0B453",
  brassDeep:  "#7F5C05",
  gold:       "#F4C859",

  wood:      "#D4A574",
  woodDeep:  "#A07748",
  woodEdge:  "#85603A",
  ceramic:   "var(--ceramic)",
  ceramicHi: "#FAF2E4",
  concrete:  "var(--concrete)",
  ash:       "var(--ash)",
} as const;

function tile(svg: string): string {
  return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
}

const LINEN_TILE = tile(
  `<svg xmlns="http://www.w3.org/2000/svg" width="8" height="8">
    <rect width="8" height="8" fill="transparent"/>
    <path d="M0 0H8" stroke="rgba(140,110,75,.14)" stroke-width=".7"/>
    <path d="M0 4H8" stroke="rgba(140,110,75,.07)" stroke-width=".7"/>
    <path d="M0 0V8" stroke="rgba(140,110,75,.12)" stroke-width=".7"/>
    <path d="M4 0V8" stroke="rgba(140,110,75,.05)" stroke-width=".7"/>
  </svg>`
);

const WOOD_TILE = tile(
  `<svg xmlns="http://www.w3.org/2000/svg" width="240" height="120">
    <rect width="240" height="120" fill="transparent"/>
    <g stroke-linecap="round" fill="none">
      <path d="M0 18 C 60 16, 140 22, 240 18" stroke="rgba(110,75,40,.18)" stroke-width="1.1"/>
      <path d="M0 36 C 80 38, 180 32, 240 38" stroke="rgba(110,75,40,.10)" stroke-width=".9"/>
      <path d="M0 54 C 50 56, 160 50, 240 54" stroke="rgba(110,75,40,.22)" stroke-width="1.3"/>
      <path d="M0 70 C 70 68, 170 74, 240 70" stroke="rgba(110,75,40,.08)" stroke-width=".7"/>
      <path d="M0 86 C 60 88, 180 84, 240 86" stroke="rgba(110,75,40,.14)" stroke-width="1"/>
      <path d="M0 104 C 90 100, 150 108, 240 104" stroke="rgba(110,75,40,.10)" stroke-width=".8"/>
    </g>
    <g fill="rgba(80,55,30,.18)">
      <ellipse cx="48" cy="60" rx="14" ry="6"/>
      <ellipse cx="48" cy="60" rx="9" ry="4" fill="rgba(80,55,30,.30)"/>
    </g>
  </svg>`
);

const PAPER_TILE = tile(
  `<svg xmlns="http://www.w3.org/2000/svg" width="120" height="120">
    <rect width="120" height="120" fill="transparent"/>
    <g stroke-linecap="round" fill="none" stroke="rgba(150,120,80,.06)">
      <path d="M0 30 H120"/>
      <path d="M0 72 H120"/>
      <path d="M40 0 V120"/>
      <path d="M88 0 V120"/>
    </g>
  </svg>`
);

const BRASS_TILE = tile(
  `<svg xmlns="http://www.w3.org/2000/svg" width="100" height="6">
    <rect width="100" height="6" fill="transparent"/>
    <g stroke="rgba(127,92,5,.35)" stroke-width=".4">
      <path d="M0 1H100"/><path d="M0 3H100"/><path d="M0 5H100"/>
    </g>
    <g stroke="rgba(255,225,150,.40)" stroke-width=".3">
      <path d="M0 2H100"/><path d="M0 4H100"/>
    </g>
  </svg>`
);

const CONCRETE_TILE = tile(
  `<svg xmlns="http://www.w3.org/2000/svg" width="60" height="60">
    <rect width="60" height="60" fill="transparent"/>
    <g fill="rgba(60,50,40,.07)">
      <circle cx="14" cy="18" r=".7"/><circle cx="32" cy="28" r=".5"/><circle cx="48" cy="14" r=".6"/>
      <circle cx="22" cy="44" r=".6"/><circle cx="40" cy="52" r=".5"/><circle cx="6" cy="36" r=".7"/>
      <circle cx="54" cy="40" r=".5"/>
    </g>
  </svg>`
);

export type SurfaceStyle = {
  backgroundImage: string;
  backgroundColor: string;
};

export const surface: Record<string, SurfaceStyle> = {
  linen: {
    backgroundImage: `${LINEN_TILE}, radial-gradient(120% 80% at 30% 10%, rgba(255,255,255,.6) 0%, rgba(255,250,238,0) 60%), linear-gradient(160deg, var(--paper-edge) 0%, var(--linen-warm) 100%)`,
    backgroundColor: "var(--paper)",
  },
  paper: {
    backgroundImage: `${PAPER_TILE}, radial-gradient(140% 100% at 50% 0%, rgba(255,255,255,.55) 0%, rgba(255,250,238,0) 55%), linear-gradient(180deg, var(--paper-edge) 0%, var(--linen-warm) 100%)`,
    backgroundColor: "var(--paper)",
  },
  wood: {
    backgroundImage: `${WOOD_TILE}, linear-gradient(180deg, #E4B987 0%, #C49567 60%, #A07748 100%)`,
    backgroundColor: M.wood,
  },
  brass: {
    backgroundImage: `${BRASS_TILE}, linear-gradient(180deg, #E5BC60 0%, #B8860B 45%, #7F5C05 100%)`,
    backgroundColor: M.brass,
  },
  ceramic: {
    backgroundImage: `radial-gradient(120% 100% at 30% 25%, rgba(255,255,255,.85) 0%, rgba(255,255,255,0) 55%), linear-gradient(180deg, #F2E7D2 0%, #DCC9A8 100%)`,
    backgroundColor: M.ceramic,
  },
  concrete: {
    backgroundImage: `${CONCRETE_TILE}, linear-gradient(180deg, #B6AFA3 0%, #8A8377 100%)`,
    backgroundColor: M.concrete,
  },
};
