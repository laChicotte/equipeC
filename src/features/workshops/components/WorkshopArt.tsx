/**
 * Illustrations vertes de la page Ateliers (maquette) : visuel d'en-tête
 * et cible de la bannière (cartes : voir TopicArt.tsx). Décoratives.
 */

/** Visuel d'en-tête : écran de visio, pastilles flottantes, halo vert. */
export function WorkshopsHeroArt({
  className = "h-48 w-72",
}: {
  className?: string;
}) {
  return (
    <svg viewBox="0 0 300 200" aria-hidden className={className}>
      <path
        d="M60 30c50-40 170-35 215 15s20 140-50 150-170 0-190-55S10 70 60 30Z"
        className="fill-brand-50"
      />
      <path
        d="M120 10c60-15 140 10 160 60"
        fill="none"
        stroke="currentColor"
        strokeWidth="18"
        strokeLinecap="round"
        className="text-brand-100"
      />
      {/* Écran */}
      <rect
        x="70"
        y="56"
        width="160"
        height="104"
        rx="10"
        className="fill-ink-900"
      />
      <rect x="77" y="63" width="146" height="90" rx="4" fill="#fff" />
      <rect
        x="82"
        y="68"
        width="82"
        height="80"
        rx="4"
        className="fill-brand-100"
      />
      <circle cx="123" cy="96" r="13" className="fill-brand-600" />
      <path d="M99 148a24 24 0 0 1 48 0Z" className="fill-brand-700" />
      {[68, 96, 124].map((y) => (
        <g key={y}>
          <rect
            x="169"
            y={y}
            width="49"
            height="24"
            rx="4"
            className="fill-brand-50"
          />
          <circle cx="193" cy={y + 9} r="5" className="fill-brand-500" />
          <path
            d={`M184 ${y + 24}a9 9 0 0 1 18 0Z`}
            className="fill-brand-700"
          />
        </g>
      ))}
      <path d="M135 160h30l6 18h-42Z" className="fill-slate-300" />
      <rect
        x="115"
        y="176"
        width="70"
        height="6"
        rx="3"
        className="fill-slate-400"
      />
      {/* Pastilles flottantes */}
      <g>
        <rect
          x="28"
          y="40"
          width="44"
          height="44"
          rx="12"
          className="fill-brand-600"
        />
        <rect
          x="38"
          y="54"
          width="18"
          height="16"
          rx="3"
          fill="none"
          stroke="#fff"
          strokeWidth="2.5"
        />
        <path
          d="M56 59l7-4v14l-7-4"
          fill="none"
          stroke="#fff"
          strokeWidth="2.5"
          strokeLinejoin="round"
        />
      </g>
      <g>
        <rect
          x="236"
          y="22"
          width="48"
          height="48"
          rx="14"
          className="fill-brand-700"
        />
        <path
          d="M246 44l14-7 14 7-14 7Z"
          fill="none"
          stroke="#fff"
          strokeWidth="2.5"
          strokeLinejoin="round"
        />
        <path
          d="M252 47v7c4 3 12 3 16 0v-7"
          fill="none"
          stroke="#fff"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
      </g>
    </svg>
  );
}

/** Cible avec flèche et livres (bannière « suivi personnalisé »). */
export function TargetArt({ className = "h-32 w-36" }: { className?: string }) {
  return (
    <svg viewBox="0 0 150 130" aria-hidden className={className}>
      <rect
        x="22"
        y="104"
        width="96"
        height="10"
        rx="3"
        className="fill-brand-200"
      />
      <rect
        x="28"
        y="114"
        width="90"
        height="8"
        rx="3"
        className="fill-amber-400"
      />
      <circle cx="72" cy="62" r="44" fill="#fff" />
      <circle cx="72" cy="62" r="34" className="fill-brand-600" />
      <circle cx="72" cy="62" r="24" fill="#fff" />
      <circle cx="72" cy="62" r="14" className="fill-brand-600" />
      <circle cx="72" cy="62" r="5" fill="#fff" />
      <path
        d="M72 62l50-40"
        stroke="currentColor"
        strokeWidth="4"
        strokeLinecap="round"
        className="text-amber-400"
      />
      <path d="M118 18l12-4-4 12-8 2Z" className="fill-amber-400" />
      <path
        d="M128 70c10-6 16 0 14 10-8 2-14-2-14-10ZM124 90c8-8 16-4 16 4-6 4-12 2-16-4Z"
        className="fill-brand-300"
      />
      <path d="M16 30l3 3-3 3-3-3ZM28 14l2 2-2 2-2-2Z" fill="#fff" />
    </svg>
  );
}
