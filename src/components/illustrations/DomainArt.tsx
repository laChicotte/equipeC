/**
 * Illustrations de la page Domaines (maquette) : scène par domaine (mêmes
 * thèmes que les ateliers), en-tête (livres, toque, feuillage), assistant
 * d'orientation et panneau indicateur de la bannière. Décoratives.
 */
import { G, GOLD, LEAF, pickTopic, TOPIC_SCENES } from "./TopicArt";

/** Scène d'un domaine (sans halo de fond). */
export function DomainArt({
  slug,
  className = "h-24 w-28",
}: {
  slug: string;
  className?: string;
}) {
  const Scene = TOPIC_SCENES[pickTopic("", slug)];
  return (
    <svg viewBox="0 -4 160 124" aria-hidden className={className}>
      <ellipse cx="80" cy="112" rx="52" ry="4.5" fill="#065f46" opacity=".1" />
      <Scene />
    </svg>
  );
}

/** En-tête : feuillage, pile de livres et toque de diplômé. */
export function DomainsHeroArt({
  className = "h-36 w-80",
}: {
  className?: string;
}) {
  return (
    <svg viewBox="0 0 320 140" aria-hidden className={className}>
      <path d="M40 140c30-60 120-90 280-70v70Z" fill="#ecfdf5" />
      {/* Feuillage */}
      <g transform="translate(70 120)">
        <path d="M0 0c-26-10-34-44-18-66 18 14 26 40 18 66Z" fill={LEAF} />
        <path
          d="M4 2c-4-30 16-56 42-56 0 26-16 48-42 56Z"
          fill={LEAF}
          opacity=".85"
        />
        <path
          d="M-2-6c-22-24-44-30-60-24 14 22 36 30 60 24Z"
          fill={LEAF}
          opacity=".9"
        />
        <path
          d="M2 0c10-20 30-30 50-30"
          stroke="#ecfdf5"
          strokeWidth="1.5"
          fill="none"
          opacity=".6"
        />
      </g>
      {/* Livres */}
      <rect x="96" y="112" width="140" height="16" rx="4" fill="#064e3b" />
      <rect
        x="104"
        y="96"
        width="126"
        height="16"
        rx="4"
        fill="#f8fafc"
        stroke="#cbd5e1"
      />
      <rect x="100" y="80" width="132" height="16" rx="4" fill={G} />
      <rect x="110" y="64" width="116" height="16" rx="4" fill="#047857" />
      <path
        d="M108 104h116M106 88h120M116 72h104M102 120h128"
        stroke="#a7f3d0"
        strokeWidth="1.5"
        opacity=".7"
      />
      {/* Toque */}
      <path d="M140 40v14c0 10 52 10 52 0V40l-26 10Z" fill="#064e3b" />
      <path d="M166 14l54 20-54 20-54-20Z" fill="#065f46" />
      <path d="M166 14l54 20-54 20" fill="#fff" opacity=".08" />
      <path
        d="M166 34l40 6v22"
        stroke="#f59e0b"
        strokeWidth="3"
        fill="none"
        strokeLinecap="round"
      />
      <path d="M202 62h8l-1.5 12h-5Z" fill={GOLD} />
    </svg>
  );
}

/** Assistant d'orientation : petit robot souriant et bulle de discussion. */
export function OrientationBotArt({
  className = "h-36 w-44",
}: {
  className?: string;
}) {
  return (
    <svg viewBox="0 0 180 150" aria-hidden className={className}>
      <path d="M20 150c10-50 60-70 160-60v60Z" fill="#d1fae5" opacity=".7" />
      {/* Bulle */}
      <rect x="118" y="8" width="52" height="34" rx="10" fill={G} />
      <path d="M128 42l-4 10 12-10Z" fill="#047857" />
      {[132, 144, 156].map((x) => (
        <circle key={x} cx={x} cy="25" r="3.5" fill="#fff" />
      ))}
      {/* Corps */}
      <ellipse
        cx="90"
        cy="122"
        rx="30"
        ry="22"
        fill="#f8fafc"
        stroke="#e2e8f0"
        strokeWidth="2"
      />
      <ellipse cx="90" cy="118" rx="12" ry="8" fill="#d1fae5" />
      {/* Tête */}
      <rect
        x="46"
        y="40"
        width="88"
        height="70"
        rx="32"
        fill="#fff"
        stroke="#e2e8f0"
        strokeWidth="2"
      />
      <rect x="56" y="50" width="68" height="50" rx="24" fill="#0f172a" />
      <ellipse cx="76" cy="72" rx="6" ry="8" fill="#34d399" />
      <ellipse cx="104" cy="72" rx="6" ry="8" fill="#34d399" />
      <path
        d="M80 86c6 6 14 6 20 0"
        stroke="#34d399"
        strokeWidth="3.5"
        fill="none"
        strokeLinecap="round"
      />
      <rect x="38" y="64" width="10" height="22" rx="5" fill={G} />
      <rect x="132" y="64" width="10" height="22" rx="5" fill={G} />
      {/* Éclats */}
      <g stroke="#10b981" strokeWidth="3.5" strokeLinecap="round">
        <path d="M30 34l-8-6M38 22l-3-9M24 50h-10" />
      </g>
    </svg>
  );
}

/** Panneau indicateur à trois directions (bannière « vous hésitez ? »). */
export function SignpostArt({
  className = "h-32 w-40",
}: {
  className?: string;
}) {
  return (
    <svg viewBox="0 0 170 140" aria-hidden className={className}>
      <ellipse cx="84" cy="132" rx="46" ry="5" fill="#022c22" opacity=".35" />
      <rect x="78" y="10" width="10" height="122" rx="3" fill="#cbd5e1" />
      <path d="M90 22h56l14 12-14 12H90Z" fill="#fff" />
      <path d="M76 52H24L10 64l14 12h52Z" fill={GOLD} />
      <path d="M90 82h46l14 12-14 12H90Z" fill="#34d399" />
      <path
        d="M100 34h34M22 64h40M100 94h28"
        stroke="#065f46"
        strokeWidth="3.5"
        strokeLinecap="round"
        opacity=".55"
      />
      <circle cx="83" cy="10" r="6" fill={GOLD} />
      <path
        d="M130 124c4-14 16-18 24-14-6 10-14 14-24 14ZM40 128c-2-12 6-20 16-20-2 10-8 16-16 20Z"
        fill={LEAF}
      />
    </svg>
  );
}
