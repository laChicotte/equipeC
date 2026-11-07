/**
 * Illustrations de la page Opportunités (maquette) : une scène par offre,
 * choisie d'après son texte (titre, description, organisation), sinon
 * d'après son type. Ex. mangues → cagette, agricole → pousse, master → toque.
 * Plus le mégaphone de l'en-tête et le visuel de la bannière. Décoratives.
 */
import type { ReactElement } from "react";
import type { OpportunityKind } from "@/types/database";
import {
  Culture,
  Cv,
  Finance,
  G,
  GOLD,
  LEAF,
  Leadership,
  Leaves,
  Sparkles,
} from "./TopicArt";

type Scene =
  | "cv"
  | "fruits"
  | "sprout"
  | "code"
  | "grad"
  | "finance"
  | "trophy"
  | "book"
  | "calendar"
  | "briefcase";

const KEYWORDS: [Scene, RegExp][] = [
  ["cv", /entretien|\bcv\b|embauche|lettre de motivation/i],
  ["fruits", /mangue|fruit|récolte|ananas|agrume/i],
  ["sprout", /agri|agro|plante|élevage|maraîch|environnement|climat|vert/i],
  [
    "code",
    /développe(ment|ur)|\bweb\b|informatique|numérique|react|logiciel|\bdata\b|\bia\b|code/i,
  ],
  ["grad", /bourse|master|licence|doctorat|études|universit/i],
  ["finance", /financement|subvention|crédit|prêt|investiss/i],
  ["trophy", /concours|prix|compétition|hackathon|challenge/i],
  ["book", /formation|cours|certifica|apprentissage/i],
  ["calendar", /événement|salon|forum|conférence|rencontre/i],
];

const BY_KIND: Record<OpportunityKind, Scene> = {
  emploi: "briefcase",
  stage: "briefcase",
  bourse: "grad",
  financement: "finance",
  concours: "trophy",
  formation: "book",
  evenement: "calendar",
  atelier: "cv",
};

function pickScene(text: string, kind: OpportunityKind): Scene {
  return (
    KEYWORDS.find(([, re]) => re.test(text))?.[0] ??
    BY_KIND[kind] ??
    "briefcase"
  );
}

/* ------------------------------------------------------------------ */

function Shadow() {
  return (
    <ellipse cx="80" cy="112" rx="50" ry="4.5" fill="#065f46" opacity=".1" />
  );
}

/** Pousse dans une motte de terre (agriculture, environnement). */
function Sprout() {
  return (
    <>
      <path d="M38 104c8-22 76-22 84 0Z" fill="#92400e" />
      <path
        d="M50 96c10-8 50-8 60 0"
        stroke="#b45309"
        strokeWidth="3"
        fill="none"
        strokeLinecap="round"
      />
      <path
        d="M80 96V48"
        stroke="#047857"
        strokeWidth="5"
        strokeLinecap="round"
      />
      <path d="M80 70c-22 2-38-12-40-32 22 0 38 12 40 32Z" fill={LEAF} />
      <path d="M80 58c4-24 24-38 46-36-2 24-22 38-46 36Z" fill={LEAF} />
      <path
        d="M80 70C66 60 52 50 42 40M80 58c12-12 26-24 44-34"
        stroke="#ecfdf5"
        strokeWidth="1.4"
        fill="none"
        opacity=".7"
      />
    </>
  );
}

/** Cagette de mangues (coopérative, récolte). */
function Fruits() {
  return (
    <>
      {[
        [48, 58, "#fbbf24"],
        [70, 52, "#f59e0b"],
        [94, 54, "#84cc16"],
        [114, 58, "#fbbf24"],
        [60, 62, "#facc15"],
        [84, 62, "#f59e0b"],
        [106, 64, "#a3e635"],
      ].map(([cx, cy, fill], i) => (
        <ellipse
          key={i}
          cx={cx as number}
          cy={cy as number}
          rx="13"
          ry="11"
          fill={fill as string}
        />
      ))}
      <path d="M92 42c6-8 16-8 20-4-6 6-14 8-20 4Z" fill={LEAF} />
      <path d="M26 66h108l-6 40H32Z" fill="#b45309" />
      <path d="M28 78h104M30 92h100" stroke="#78350f" strokeWidth="3" />
      <path d="M26 66h108v8H26Z" fill="#d97706" />
      <path
        d="M58 66v40M102 66v40"
        stroke="#92400e"
        strokeWidth="2.5"
        opacity=".6"
      />
    </>
  );
}

/** Fenêtre de code (stage / emploi dans le numérique). */
function CodeWindow() {
  return (
    <>
      <rect
        x="30"
        y="20"
        width="100"
        height="80"
        rx="9"
        fill="#ecfdf5"
        stroke="#047857"
        strokeWidth="4"
      />
      <path d="M30 29a9 9 0 0 1 9-9h82a9 9 0 0 1 9 9v9H30Z" fill={G} />
      {[44, 54, 64].map((x) => (
        <circle key={x} cx={x} cy="29" r="3" fill="#ecfdf5" />
      ))}
      <path
        d="M62 54l-12 12 12 12M86 50l-10 32M98 54l12 12-12 12"
        fill="none"
        stroke="#047857"
        strokeWidth="5.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </>
  );
}

/** Toque de diplômé avec pompon doré (bourses, études). */
function GradCap() {
  return (
    <>
      <path d="M48 58v22c0 12 64 12 64 0V58L80 70Z" fill="#064e3b" />
      <path d="M80 28l60 22-60 22-60-22Z" fill={G} />
      <path d="M80 28l60 22-60 22" fill="#fff" opacity=".08" />
      <circle cx="80" cy="50" r="3.5" fill="#064e3b" />
      <path
        d="M80 50l46 6v28"
        stroke="#f59e0b"
        strokeWidth="3"
        fill="none"
        strokeLinecap="round"
      />
      <path d="M121 84h10l-2 14h-6Z" fill={GOLD} />
    </>
  );
}

/** Mallette (emploi, stage). */
function Briefcase() {
  return (
    <>
      <path
        d="M64 40v-8a6 6 0 0 1 6-6h20a6 6 0 0 1 6 6v8h-7v-7H71v7Z"
        fill="#064e3b"
      />
      <rect x="32" y="40" width="96" height="64" rx="11" fill={G} />
      <path
        d="M32 52a12 12 0 0 1 12-12h72a12 12 0 0 1 12 12v12c-16 7-31 10-48 10S48 71 32 64Z"
        fill="#047857"
      />
      <rect x="72" y="66" width="16" height="13" rx="3" fill={GOLD} />
      <Sparkles x={134} y={30} />
    </>
  );
}

/** Calendrier avec date entourée (événements). */
function Calendar() {
  return (
    <>
      <rect
        x="38"
        y="24"
        width="84"
        height="82"
        rx="11"
        fill="#fff"
        stroke="#d1fae5"
        strokeWidth="2"
      />
      <path d="M38 35a11 11 0 0 1 11-11h62a11 11 0 0 1 11 11v11H38Z" fill={G} />
      <rect x="56" y="16" width="6" height="16" rx="3" fill="#064e3b" />
      <rect x="98" y="16" width="6" height="16" rx="3" fill="#064e3b" />
      {[0, 1, 2].map((r) =>
        [0, 1, 2, 3].map((c) => (
          <rect
            key={`${r}${c}`}
            x={48 + c * 17}
            y={54 + r * 15}
            width="11"
            height="9"
            rx="2"
            fill="#d1fae5"
          />
        )),
      )}
      <circle
        cx="87.5"
        cy="73.5"
        r="10"
        fill="none"
        stroke="#f59e0b"
        strokeWidth="3"
      />
    </>
  );
}

const SCENES: Record<Scene, () => ReactElement> = {
  cv: Cv,
  fruits: Fruits,
  sprout: Sprout,
  code: CodeWindow,
  grad: GradCap,
  finance: Finance,
  trophy: Leadership,
  book: Culture,
  calendar: Calendar,
  briefcase: Briefcase,
};

/** Illustration d'une carte d'opportunité. */
export function OpportunityArt({
  text,
  kind,
  className = "h-20 w-24",
}: {
  text: string;
  kind: OpportunityKind;
  className?: string;
}) {
  const S = SCENES[pickScene(text, kind)];
  return (
    <svg viewBox="0 -4 160 124" aria-hidden className={className}>
      <Shadow />
      <S />
    </svg>
  );
}

/** Mégaphone avec ondes (en-tête de la page). */
export function MegaphoneArt({
  className = "h-32 w-44",
}: {
  className?: string;
}) {
  return (
    <svg viewBox="0 0 180 130" aria-hidden className={className}>
      <g transform="rotate(-18 90 70)">
        <rect x="34" y="58" width="22" height="26" rx="5" fill="#a7f3d0" />
        <path d="M52 56l60-30v90L52 86Z" fill={G} />
        <ellipse cx="112" cy="71" rx="12" ry="45" fill="#34d399" />
        <ellipse cx="112" cy="71" rx="7" ry="34" fill="#065f46" />
        <path d="M60 86l8 26h12l-6-22" fill="#047857" />
        <path d="M52 56l60-30v14L52 66Z" fill="#fff" opacity=".12" />
      </g>
      <g stroke="#10b981" strokeWidth="4.5" strokeLinecap="round">
        <path d="M140 48l14-6M144 66h16M140 84l14 6" />
      </g>
      <g stroke="#a3e635" strokeWidth="4" strokeLinecap="round">
        <path d="M70 14l-4-10M86 10l2-10M100 14l6-9M10 40l-8-4" />
      </g>
    </svg>
  );
}

/** Toque, mallette, livres et plante (bannière « Vous recrutez ? »). */
export function RecruitArt({
  className = "h-32 w-44",
}: {
  className?: string;
}) {
  return (
    <svg viewBox="0 0 190 140" aria-hidden className={className}>
      <Leaves x={26} y={124} />
      {/* Livres */}
      <rect x="40" y="112" width="116" height="12" rx="3" fill="#047857" />
      <rect x="46" y="100" width="104" height="12" rx="3" fill="#f97316" />
      <rect x="40" y="124" width="120" height="10" rx="3" fill="#064e3b" />
      <path
        d="M50 106h96M46 118h104"
        stroke="#fff"
        strokeWidth="1.5"
        opacity=".6"
      />
      {/* Mallette */}
      <path
        d="M84 54v-7a5 5 0 0 1 5-5h18a5 5 0 0 1 5 5v7h-6v-6H90v6Z"
        fill="#064e3b"
      />
      <rect x="58" y="54" width="80" height="46" rx="9" fill={G} />
      <path
        d="M58 64a10 10 0 0 1 10-10h60a10 10 0 0 1 10 10v8c-13 6-26 8-40 8s-27-2-40-8Z"
        fill="#047857"
      />
      <rect x="91" y="72" width="14" height="11" rx="2.5" fill={GOLD} />
      {/* Toque */}
      <path d="M78 30v12c0 8 40 8 40 0V30L98 38Z" fill="#064e3b" />
      <path d="M98 12l40 15-40 15-40-15Z" fill={G} />
      <path
        d="M98 27l30 4v18"
        stroke="#f59e0b"
        strokeWidth="2.5"
        fill="none"
        strokeLinecap="round"
      />
      <path d="M124 49h8l-1.5 10h-5Z" fill={GOLD} />
    </svg>
  );
}
