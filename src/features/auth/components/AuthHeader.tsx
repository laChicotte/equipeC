import type { ReactNode } from "react";

/**
 * En-tête centré des cartes d'authentification : pastille icône, titre, sous-titre.
 * La pastille disparaît sur les écrans peu hauts pour que la carte tienne sans
 * défilement ; `compact` (formulaires longs, ex. inscription) la masque plus tôt.
 */
export function AuthHeader({
  icon,
  title,
  subtitle,
  compact = false,
}: {
  icon: ReactNode;
  title: ReactNode;
  subtitle: string;
  compact?: boolean;
}) {
  return (
    <div
      className={`flex flex-col items-center text-center ${
        compact ? "mb-5 [@media(max-height:880px)]:mb-4" : "mb-6 [@media(max-height:720px)]:mb-4"
      }`}
    >
      <span
        className={`mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-50 text-brand-700 ${
          compact ? "[@media(max-height:880px)]:hidden" : "[@media(max-height:720px)]:hidden"
        }`}
      >
        {icon}
      </span>
      <h1 className="font-display text-[1.7rem] leading-tight font-semibold tracking-tight sm:text-3xl">{title}</h1>
      <p className="mt-1.5 text-ink-500">{subtitle}</p>
    </div>
  );
}

/** « MentorConnect » coloré, pour les titres. */
export const BrandName = () => <span className="text-brand-700">MentorConnect</span>;
