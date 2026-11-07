/**
 * Petites illustrations vertes (colonnes décoratives des formulaires).
 * Purement décoratives : aria-hidden.
 */

const deep = "fill-brand-700";
const mid = "fill-brand-500";
const light = "fill-brand-200";

/** Mallette avec éclats (opportunités). */
export function BriefcaseIllustration({
  className = "h-28 w-32",
}: {
  className?: string;
}) {
  return (
    <svg viewBox="0 0 128 112" aria-hidden className={className}>
      <ellipse cx="64" cy="104" rx="44" ry="5" className={light} opacity=".6" />
      <path
        d="M48 34v-8a6 6 0 0 1 6-6h20a6 6 0 0 1 6 6v8h-7v-7H55v7Z"
        className={deep}
      />
      <rect x="20" y="34" width="88" height="62" rx="10" className={mid} />
      <path
        d="M20 44a10 10 0 0 1 10-10h68a10 10 0 0 1 10 10v14c-16 8-30 11-44 11s-28-3-44-11Z"
        className={deep}
      />
      <rect x="56" y="60" width="16" height="12" rx="3" fill="#fff" />
      <path
        d="M100 14v8M96 18h8"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        className="text-brand-500"
      />
      <path
        d="M112 30l7-6M114 40h9M106 20l3-8"
        stroke="currentColor"
        strokeWidth="3.5"
        strokeLinecap="round"
        className="text-brand-500"
      />
    </svg>
  );
}

/** Écran de visio avec participants (ateliers). */
export function WorkshopIllustration({
  className = "h-28 w-32",
}: {
  className?: string;
}) {
  return (
    <svg viewBox="0 0 128 112" aria-hidden className={className}>
      <ellipse cx="64" cy="104" rx="44" ry="5" className={light} opacity=".6" />
      <rect x="14" y="16" width="100" height="68" rx="8" className={deep} />
      <rect x="20" y="22" width="88" height="56" rx="4" fill="#fff" />
      {/* Animateur */}
      <rect x="24" y="26" width="48" height="48" rx="4" className={light} />
      <circle cx="48" cy="44" r="8" className={mid} />
      <path d="M33 74a15 15 0 0 1 30 0Z" className={deep} />
      {/* Participants */}
      {[26, 52].map((y) => (
        <g key={y}>
          <rect
            x="76"
            y={y}
            width="28"
            height="22"
            rx="4"
            className="fill-brand-50"
          />
          <circle cx="90" cy={y + 8} r="4.5" className={mid} />
          <path d={`M82 ${y + 22}a8 8 0 0 1 16 0Z`} className={deep} />
        </g>
      ))}
      <path d="M54 84h20l4 14H50Z" className={mid} />
      <rect x="42" y="96" width="44" height="5" rx="2.5" className={deep} />
      <path
        d="M112 8l4-6M118 14h7M104 6l-1-6"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        className="text-brand-500"
      />
    </svg>
  );
}
