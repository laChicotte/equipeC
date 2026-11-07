/**
 * Illustrations des cartes d'atelier (maquette) : une scène par thème,
 * choisie d'après le sujet (titre + résumé), sinon d'après le domaine.
 * Ex. Campus France → tour Eiffel + drapeau ; entretien/CV → presse-papiers.
 * Décoratives (aria-hidden).
 */
import type { ReactElement, ReactNode } from "react";

export type Topic =
  | "campus"
  | "cv"
  | "marketing"
  | "business"
  | "tech"
  | "finance"
  | "culture"
  | "leadership";

/** Mots-clés du sujet, testés dans l'ordre (le premier qui correspond gagne). */
const KEYWORDS: [Topic, RegExp][] = [
  [
    "campus",
    /campus\s*france|visa|études? en france|étudier (en|à l'étranger)/i,
  ],
  [
    "cv",
    /entretien|\bcv\b|embauche|lettre de motivation|recrut|stage|emploi|insertion/i,
  ],
  [
    "marketing",
    /marketing|réseaux sociaux|communication|visibilité|digital|publicité/i,
  ],
  [
    "business",
    /business|entrepren|start-?up|projet|création d'entreprise|plan d'affaires/i,
  ],
  ["finance", /comptab|budget|financ|fiscal|trésorerie|épargne|gestion/i],
  [
    "tech",
    /code|coder|programm|développe(ment|ur) (web|mobile)|informatique|\bia\b|intelligence artificielle|\bdata\b|cyber/i,
  ],
  [
    "culture",
    /écri(re|ture)|livre|littérature|roman|édition|culture|audiovisuel|création/i,
  ],
  [
    "leadership",
    /leadership|prise de parole|pitch|confiance|oral|manag|motivation/i,
  ],
];

const BY_DOMAIN: Record<string, Topic> = {
  "campus-france": "campus",
  "orientation-insertion": "cv",
  entrepreneuriat: "business",
  numerique: "tech",
  "gestion-finance": "finance",
  "culture-creation": "culture",
  "developpement-personnel": "leadership",
};

export function pickTopic(text: string, slug: string | null): Topic {
  return (
    KEYWORDS.find(([, re]) => re.test(text))?.[0] ??
    (slug ? BY_DOMAIN[slug] : undefined) ??
    "marketing"
  );
}

/* ------------------------------------------------------------------ */
/* Éléments communs                                                    */
/* ------------------------------------------------------------------ */

/**
 * Dégradés partagés par toutes les illustrations, définis UNE seule fois via
 * <IllustrationDefs> (layout racine). Ne pas les redéfinir dans un dessin : si
 * la 1re définition d'un id se trouve dans un dessin masqué (display: none),
 * Chrome et Firefox ne peignent plus ce dégradé nulle part.
 */
function Defs() {
  return (
    <defs>
      <linearGradient id="ta-blob" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor="#f0fdf4" />
        <stop offset="1" stopColor="#c6f6dd" />
      </linearGradient>
      <linearGradient id="ta-green" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor="#10b981" />
        <stop offset="1" stopColor="#065f46" />
      </linearGradient>
      <linearGradient id="ta-screen" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor="#047857" />
        <stop offset="1" stopColor="#064e3b" />
      </linearGradient>
      <linearGradient id="ta-gold" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#fde68a" />
        <stop offset="1" stopColor="#f59e0b" />
      </linearGradient>
      <linearGradient id="ta-silver" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#f1f5f9" />
        <stop offset="1" stopColor="#cbd5e1" />
      </linearGradient>
      <linearGradient id="ta-leaf" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor="#34d399" />
        <stop offset="1" stopColor="#047857" />
      </linearGradient>
      <linearGradient id="ta-bar" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#a7f3d0" />
        <stop offset="1" stopColor="#34d399" />
      </linearGradient>
    </defs>
  );
}

export const G = "url(#ta-green)";
export const SCREEN = "url(#ta-screen)";
export const GOLD = "url(#ta-gold)";
export const SILVER = "url(#ta-silver)";
export const LEAF = "url(#ta-leaf)";
export const BAR = "url(#ta-bar)";

function Backdrop() {
  return (
    <>
      <path
        d="M34 18c32-24 98-22 118 12s10 80-26 92-94 8-114-22S2 42 34 18Z"
        fill="url(#ta-blob)"
      />
      <ellipse cx="80" cy="113" rx="58" ry="5" fill="#065f46" opacity=".1" />
    </>
  );
}

export function Leaves({
  x,
  y,
  flip = false,
}: {
  x: number;
  y: number;
  flip?: boolean;
}) {
  return (
    <g transform={`translate(${x} ${y}) scale(${flip ? -1 : 1} 1)`}>
      <path d="M0 0c-14-6-18-24-10-36 10 8 14 22 10 36Z" fill={LEAF} />
      <path
        d="M2 2c-2-16 8-30 22-30 0 14-8 26-22 30Z"
        fill={LEAF}
        opacity=".85"
      />
      <path
        d="M0 0c-4-10-6-20-8-30M2 2c4-10 10-20 18-26"
        stroke="#ecfdf5"
        strokeWidth="1"
        fill="none"
        opacity=".7"
      />
    </g>
  );
}

export function Sparkles({ x, y }: { x: number; y: number }) {
  return (
    <g stroke="#10b981" strokeWidth="2.5" strokeLinecap="round">
      <path d={`M${x} ${y}l4-7M${x + 8} ${y + 6}l7-3M${x - 6} ${y - 2}l-2-7`} />
    </g>
  );
}

/** Ordinateur portable ; le contenu de l'écran est passé en enfant. */
export function Laptop({ children }: { children?: ReactNode }) {
  return (
    <>
      <rect x="30" y="24" width="100" height="66" rx="6" fill="#0f172a" />
      <rect x="34" y="28" width="92" height="58" rx="3" fill={SCREEN} />
      <path d="M34 28h92v10C96 34 62 34 34 46Z" fill="#fff" opacity=".06" />
      {children}
      <path d="M16 90h128l-9 10H25Z" fill={SILVER} />
      <rect x="68" y="90" width="24" height="3" rx="1.5" fill="#94a3b8" />
    </>
  );
}

function Bars({ x, y }: { x: number; y: number }) {
  return (
    <>
      {[0, 1, 2, 3].map((i) => (
        <rect
          key={i}
          x={x + i * 9}
          y={y - 8 - i * 8}
          width="6.5"
          height={8 + i * 8}
          rx="1.2"
          fill={BAR}
        />
      ))}
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Scènes                                                              */
/* ------------------------------------------------------------------ */

/** Marketing / communication : mégaphone + courbe de croissance. */
function Marketing() {
  return (
    <>
      <Laptop>
        <path d="M44 52l20-11v30L44 60Z" fill="#fff" />
        <rect x="39" y="51" width="7" height="10" rx="2" fill="#d1fae5" />
        <path d="M50 61l3 9h5l-2-8" fill="#d1fae5" />
        <path
          d="M68 48l5-3M69 56h6M68 64l5 3"
          stroke="#a7f3d0"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <Bars x={86} y={80} />
        <path
          d="M82 66l10-8 8 4 16-16"
          fill="none"
          stroke="#fff"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M109 45h8v8"
          fill="none"
          stroke="#fff"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </Laptop>
      <Sparkles x={140} y={22} />
    </>
  );
}

/** Entretien / CV / emploi : presse-papiers coché et feuillage. */
export function Cv() {
  return (
    <>
      <Leaves x={34} y={104} />
      <rect x="50" y="14" width="74" height="96" rx="9" fill={G} />
      <rect x="57" y="22" width="60" height="82" rx="4" fill="#fff" />
      <rect x="73" y="8" width="28" height="14" rx="5" fill="#064e3b" />
      <circle cx="87" cy="12" r="3" fill="#d1fae5" />
      <circle cx="72" cy="38" r="8" fill="#d1fae5" />
      <circle cx="72" cy="35.5" r="3.5" fill="#047857" />
      <path d="M65 45a7 7 0 0 1 14 0Z" fill="#047857" />
      <path
        d="M86 33h22M86 40h16"
        stroke="#a7f3d0"
        strokeWidth="3"
        strokeLinecap="round"
      />
      {[60, 74, 88].map((y) => (
        <g key={y}>
          <rect
            x="63"
            y={y - 5}
            width="10"
            height="10"
            rx="2.5"
            fill="none"
            stroke="#047857"
            strokeWidth="2"
          />
          <path
            d={`M65.5 ${y}l2.5 2.5 4.5-5`}
            fill="none"
            stroke="#047857"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d={`M79 ${y}h28`}
            stroke="#e2e8f0"
            strokeWidth="3"
            strokeLinecap="round"
          />
        </g>
      ))}
      <Sparkles x={136} y={30} />
    </>
  );
}

/** Campus France : tour Eiffel verte, drapeau français, pile de livres. */
function Campus() {
  return (
    <>
      {/* Drapeau ondulé sur son mât */}
      <rect x="26" y="26" width="3" height="66" rx="1.5" fill="#94a3b8" />
      <path d="M29 28c6-3 10 2 15 0v30c-5 2-9-3-15 0Z" fill="#1d4ed8" />
      <path
        d="M44 28c5-2 9 2 14 0v30c-5 2-9-2-14 0Z"
        fill="#fff"
        stroke="#e2e8f0"
        strokeWidth="1"
      />
      <path d="M58 28c5-2 9 3 14 0v30c-5 3-9-2-14 0Z" fill="#ef4444" />
      <path
        d="M29 28c14-4 28 2 43 0v4c-15 2-29-4-43 0Z"
        fill="#fff"
        opacity=".25"
      />
      {/* Tour */}
      <path d="M106 6l2 0 1.5 26h-5Z" fill="#064e3b" />
      <path d="M103 32h8l5 30h-18Z" fill={G} />
      <rect x="99" y="30" width="16" height="4" rx="1" fill="#064e3b" />
      <path d="M96 62h22l12 44h-10c-2-12-7-18-13-18s-11 6-13 18H84Z" fill={G} />
      <rect x="92" y="60" width="30" height="4" rx="1" fill="#064e3b" />
      <path
        d="M101 40l12 18M113 40l-12 18M98 70l18 26M116 70l-18 26"
        stroke="#a7f3d0"
        strokeWidth="1"
        opacity=".6"
      />
      {/* Livres */}
      <rect x="34" y="96" width="58" height="8" rx="2" fill={G} />
      <rect x="38" y="88" width="50" height="8" rx="2" fill={GOLD} />
      <rect x="32" y="104" width="64" height="7" rx="2" fill="#064e3b" />
      <path
        d="M40 92h44M38 100h50"
        stroke="#fff"
        strokeWidth="1"
        opacity=".5"
      />
    </>
  );
}

/** Entrepreneuriat / projet : écran de croissance + ampoule allumée. */
function Business() {
  return (
    <>
      <Laptop>
        <Bars x={50} y={80} />
        <rect
          x="88"
          y="44"
          width="28"
          height="4"
          rx="2"
          fill="#a7f3d0"
          opacity=".7"
        />
        <rect
          x="88"
          y="54"
          width="20"
          height="4"
          rx="2"
          fill="#a7f3d0"
          opacity=".5"
        />
        <path
          d="M46 64l12-10 10 6 14-14"
          fill="none"
          stroke="#fff"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </Laptop>
      <circle cx="132" cy="22" r="18" fill="#fde68a" opacity=".35" />
      <path
        d="M132 8a12 12 0 0 1 7 21.8V34h-14v-4.2A12 12 0 0 1 132 8Z"
        fill={GOLD}
      />
      <path
        d="M128 22l4 5 4-5"
        fill="none"
        stroke="#fff"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <rect x="125" y="34" width="14" height="4" rx="1.5" fill="#94a3b8" />
      <rect x="127" y="38" width="10" height="3" rx="1.5" fill="#64748b" />
      <path
        d="M132 0v-2M147 8l2-2M117 8l-2-2M152 22h3M109 22h3"
        stroke="#f59e0b"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
    </>
  );
}

/** Numérique / code / IA : écran de code et pastille « étincelle ». */
export function Tech() {
  return (
    <>
      <Laptop>
        <path
          d="M52 44l-8 8 8 8M66 42l-6 20M74 44l8 8-8 8"
          fill="none"
          stroke="#fff"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <rect x="44" y="68" width="40" height="4" rx="2" fill="#a7f3d0" />
        <rect
          x="44"
          y="76"
          width="26"
          height="4"
          rx="2"
          fill="#a7f3d0"
          opacity=".6"
        />
        <rect
          x="90"
          y="42"
          width="26"
          height="4"
          rx="2"
          fill="#a7f3d0"
          opacity=".7"
        />
        <rect
          x="90"
          y="50"
          width="18"
          height="4"
          rx="2"
          fill="#a7f3d0"
          opacity=".5"
        />
        <rect
          x="90"
          y="58"
          width="22"
          height="4"
          rx="2"
          fill="#a7f3d0"
          opacity=".7"
        />
      </Laptop>
      <rect x="118" y="4" width="34" height="34" rx="10" fill={G} />
      <path
        d="M135 11c1.5 5 3 6.5 8 8-5 1.5-6.5 3-8 8-1.5-5-3-6.5-8-8 5-1.5 6.5-3 8-8Z"
        fill="#fff"
      />
      <rect
        x="118"
        y="4"
        width="34"
        height="34"
        rx="10"
        fill="none"
        stroke="#fff"
        strokeWidth="2"
        opacity=".5"
      />
    </>
  );
}

/** Gestion / finance : calculatrice, pièces et camembert. */
export function Finance() {
  return (
    <>
      <rect x="30" y="20" width="58" height="88" rx="9" fill={G} />
      <rect x="37" y="28" width="44" height="18" rx="3" fill="#ecfdf5" />
      <path
        d="M58 37h18"
        stroke="#047857"
        strokeWidth="3"
        strokeLinecap="round"
      />
      {[0, 1, 2, 3].map((r) =>
        [0, 1, 2].map((c) => (
          <rect
            key={`${r}-${c}`}
            x={38 + c * 14}
            y={52 + r * 13}
            width="11"
            height="9"
            rx="2.5"
            fill={r === 3 && c === 2 ? GOLD : "#fff"}
            opacity={r === 3 && c === 2 ? 1 : 0.9}
          />
        )),
      )}
      {/* Pile de pièces (du bas vers le haut) */}
      <ellipse cx="116" cy="106" rx="16" ry="5" fill="#b45309" />
      {[0, 1, 2, 3, 4].map((i) => (
        <g key={i}>
          <rect x="100" y={98 - i * 8} width="32" height="8" fill="#d97706" />
          <ellipse cx="116" cy={98 - i * 8} rx="16" ry="5" fill={GOLD} />
        </g>
      ))}
      {/* Camembert */}
      <circle cx="132" cy="24" r="14" fill="#d1fae5" />
      <path d="M132 24V10a14 14 0 0 1 13.3 18.3Z" fill="#10b981" />
      <path d="M132 24l13.3 4.3A14 14 0 0 1 124 35.4Z" fill="#065f46" />
    </>
  );
}

/** Culture / écriture : livre ouvert, plume et étoiles. */
export function Culture() {
  return (
    <>
      <path
        d="M20 64c30-12 60-2 60 6 0-8 30-18 60-6v46c-30-10-60 0-60 6 0-6-30-16-60-6Z"
        fill={G}
      />
      <path d="M26 60c26-10 50-2 54 6v42c-4-8-28-14-54-6Z" fill="#fff" />
      <path d="M134 60c-26-10-50-2-54 6v42c4-8 28-14 54-6Z" fill="#f8fafc" />
      {[72, 80, 88, 96].map((y) => (
        <g key={y} stroke="#a7f3d0" strokeWidth="2.2" strokeLinecap="round">
          <path d={`M34 ${y - 2}c12-4 26-3 38 2`} />
          <path d={`M88 ${y}c12-5 26-6 38-2`} />
        </g>
      ))}
      {/* Plume */}
      <path d="M126 6c-22 6-38 24-44 52 14-10 30-22 44-52Z" fill={LEAF} />
      <path
        d="M126 6C108 22 94 38 82 58"
        stroke="#ecfdf5"
        strokeWidth="1.5"
        fill="none"
      />
      <path
        d="M40 30l2.5 6 6 2.5-6 2.5-2.5 6-2.5-6-6-2.5 6-2.5Z"
        fill="#f59e0b"
      />
      <path
        d="M58 16l1.5 3.5 3.5 1.5-3.5 1.5-1.5 3.5-1.5-3.5-3.5-1.5 3.5-1.5Z"
        fill="#10b981"
      />
    </>
  );
}

/** Leadership / prise de parole : trophée sur podium et micro. */
export function Leadership() {
  return (
    <>
      <rect x="44" y="86" width="72" height="24" rx="5" fill={G} />
      <rect x="62" y="74" width="36" height="14" rx="3" fill="#064e3b" />
      <path d="M62 14h36v20a18 18 0 0 1-36 0Z" fill={GOLD} />
      <path
        d="M62 20h-8a10 10 0 0 0 10 14M98 20h8a10 10 0 0 1-10 14"
        fill="none"
        stroke="#f59e0b"
        strokeWidth="4"
        strokeLinecap="round"
      />
      <rect x="76" y="50" width="8" height="12" fill="#d97706" />
      <rect x="68" y="62" width="24" height="7" rx="2" fill={GOLD} />
      <path
        d="M80 22l2.6 5.3 5.8.8-4.2 4.1 1 5.8-5.2-2.7-5.2 2.7 1-5.8-4.2-4.1 5.8-.8Z"
        fill="#fff"
      />
      <text
        x="80"
        y="104"
        textAnchor="middle"
        fontSize="13"
        fontWeight="700"
        fill="#fff"
        fontFamily="inherit"
      >
        1
      </text>
      {/* Micro */}
      <rect x="128" y="34" width="12" height="22" rx="6" fill="#0f172a" />
      <path
        d="M124 50a10 10 0 0 0 20 0"
        fill="none"
        stroke="#475569"
        strokeWidth="2.5"
      />
      <path
        d="M134 60v32M126 92h16"
        stroke="#475569"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <Leaves x={30} y={108} />
      <Sparkles x={40} y={30} />
    </>
  );
}

export const TOPIC_SCENES: Record<Topic, () => ReactElement> = {
  campus: Campus,
  cv: Cv,
  marketing: Marketing,
  business: Business,
  tech: Tech,
  finance: Finance,
  culture: Culture,
  leadership: Leadership,
};

/** Illustration de carte : thème déduit du texte, sinon du domaine. */
export function WorkshopTopicArt({
  text,
  slug,
  className = "h-32 w-40",
}: {
  text: string;
  slug: string | null;
  className?: string;
}) {
  const Scene = TOPIC_SCENES[pickTopic(text, slug)];
  return (
    <svg viewBox="0 -4 160 128" aria-hidden className={className}>
      <Backdrop />
      <Scene />
    </svg>
  );
}

/**
 * Définitions des dégradés, à placer une fois en tête du <body> : SVG de
 * taille nulle mais jamais masqué, pour que les url(#ta-…) restent peints.
 */
export function IllustrationDefs() {
  return (
    <svg
      aria-hidden
      focusable="false"
      width="0"
      height="0"
      style={{ position: "absolute", width: 0, height: 0, overflow: "hidden" }}
    >
      <Defs />
    </svg>
  );
}
