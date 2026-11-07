/**
 * Illustrations de la Bibliothèque (maquette) : une scène par ressource
 * (mêmes thèmes que les ateliers + bouclier pour la cybersécurité), le
 * visuel d'en-tête et l'ampoule de la bannière. Décoratives.
 */
import {
  G,
  GOLD,
  LEAF,
  Laptop,
  Leaves,
  pickTopic,
  Sparkles,
  TOPIC_SCENES,
} from "./TopicArt";

/** Bouclier avec cadenas (cybersécurité). */
function Shield() {
  return (
    <>
      <path
        d="M80 10l40 14v30c0 28-18 46-40 56-22-10-40-28-40-56V24Z"
        fill={G}
      />
      <path
        d="M80 20l30 10v24c0 21-13 35-30 44-17-9-30-23-30-44V30Z"
        fill="#047857"
      />
      <path d="M80 10l40 14v8L80 18Z" fill="#fff" opacity=".12" />
      <rect x="66" y="54" width="28" height="22" rx="4" fill="#fff" />
      <path
        d="M71 54v-6a9 9 0 0 1 18 0v6"
        fill="none"
        stroke="#fff"
        strokeWidth="4"
      />
      <circle cx="80" cy="63" r="3.5" fill="#047857" />
      <rect x="78.5" y="64" width="3" height="7" rx="1.5" fill="#047857" />
    </>
  );
}

/** Illustration d'une carte de ressource : thème déduit du texte, sinon du domaine. */
export function ResourceArt({
  text,
  slug,
  className = "h-24 w-28",
}: {
  text: string;
  slug: string | null;
  className?: string;
}) {
  const Scene = /cyber|sécurité informatique|piratage|mot de passe/i.test(text)
    ? Shield
    : TOPIC_SCENES[pickTopic(text, slug)];
  return (
    <svg viewBox="0 -4 160 124" aria-hidden className={className}>
      <ellipse cx="80" cy="112" rx="52" ry="4.5" fill="#065f46" opacity=".1" />
      <Scene />
    </svg>
  );
}

/** En-tête : livres, ordinateur avec toque, feuillage. */
export function LibraryHeroArt({
  className = "h-36 w-80",
}: {
  className?: string;
}) {
  return (
    <svg viewBox="0 0 320 140" aria-hidden className={className}>
      <ellipse cx="170" cy="130" rx="130" ry="6" fill="#065f46" opacity=".1" />
      {/* Feuillages */}
      <Leaves x={30} y={126} />
      <g transform="translate(286 118) scale(1.4)">
        <path d="M0 0c-14-6-18-24-10-36 10 8 14 22 10 36Z" fill={LEAF} />
        <path
          d="M2 2c-2-16 8-30 22-30 0 14-8 26-22 30Z"
          fill={LEAF}
          opacity=".85"
        />
        <path
          d="M-2 -4c-12-14-24-18-34-14 8 12 20 18 34 14Z"
          fill={LEAF}
          opacity=".9"
        />
      </g>
      {/* Livres */}
      <rect x="40" y="104" width="96" height="12" rx="3" fill="#064e3b" />
      <rect x="46" y="92" width="86" height="12" rx="3" fill={G} />
      <rect x="40" y="80" width="90" height="12" rx="3" fill="#047857" />
      <rect x="48" y="116" width="92" height="10" rx="3" fill={G} />
      <path
        d="M52 86h72M54 98h72M50 110h80"
        stroke="#fff"
        strokeWidth="1.5"
        opacity=".5"
      />
      {/* Ordinateur avec toque */}
      <g transform="translate(116 -2) rotate(-6 80 60)">
        <Laptop>
          <path
            d="M80 44l22 8-22 8-22-8Z"
            fill="none"
            stroke="#fff"
            strokeWidth="3"
            strokeLinejoin="round"
          />
          <path
            d="M66 55v9c6 4 22 4 28 0v-9"
            fill="none"
            stroke="#fff"
            strokeWidth="3"
            strokeLinecap="round"
          />
        </Laptop>
      </g>
      <g transform="translate(-20 0)">
        <Sparkles x={56} y={30} />
      </g>
    </svg>
  );
}

/** Bannière : ampoule allumée sur une pile de livres. */
export function BulbBooksArt({
  className = "h-32 w-40",
}: {
  className?: string;
}) {
  return (
    <svg viewBox="0 -8 170 148" aria-hidden className={className}>
      <rect x="22" y="100" width="110" height="14" rx="4" fill="#064e3b" />
      <rect x="30" y="86" width="96" height="14" rx="4" fill={G} />
      <rect x="18" y="114" width="118" height="14" rx="4" fill={G} />
      <path
        d="M36 92h84M28 106h98M24 120h106"
        stroke="#fff"
        strokeWidth="1.5"
        opacity=".55"
      />
      <circle cx="78" cy="44" r="30" fill="#fde68a" opacity=".3" />
      <path
        d="M78 18a22 22 0 0 1 13 39.7V68H65V57.7A22 22 0 0 1 78 18Z"
        fill={GOLD}
      />
      <path
        d="M71 44l7 8 7-8"
        fill="none"
        stroke="#fff"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <rect x="66" y="68" width="24" height="6" rx="2" fill="#cbd5e1" />
      <rect x="69" y="74" width="18" height="6" rx="2" fill="#94a3b8" />
      <g stroke="#fbbf24" strokeWidth="3.5" strokeLinecap="round">
        <path d="M78 4V-2M106 14l5-5M50 14l-5-5M118 42h7M31 42h7" />
      </g>
    </svg>
  );
}
