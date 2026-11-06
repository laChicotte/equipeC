import type { ReactNode } from "react";
import { LogoMark } from "@/components/layout/Logo";

/**
 * En-tête centré des cartes d'authentification : logo (ou pastille icône),
 * titre, sous-titre. Le visuel disparaît sur les écrans peu hauts pour que la
 * carte tienne sans défilement ; `compact` (formulaires longs, ex. inscription)
 * le masque plus tôt. Sans `icon`, le logo MentorConnect est affiché (maquette).
 */
export function AuthHeader({
  icon,
  title,
  subtitle,
  compact = false,
}: {
  icon?: ReactNode;
  title: ReactNode;
  subtitle: string;
  compact?: boolean;
}) {
  // Visuel : masqué sur téléphone pour les formulaires longs, et sur les écrans peu hauts
  const hideOnShort = compact ? "max-sm:hidden short:hidden" : "tiny:hidden";
  return (
    <div
      className={`flex flex-col items-center text-center ${
        compact ? "mb-4 short:mb-3" : "mb-4 sm:mb-6 short:sm:mb-4 tiny:mb-3 tiny:sm:mb-3"
      }`}
    >
      {icon ? (
        <span className={`mb-4 flex h-14 w-14 short:mb-3 items-center justify-center rounded-2xl bg-brand-50 text-brand-700 ${hideOnShort}`}>
          {icon}
        </span>
      ) : (
        <LogoMark className={`mb-3 h-11 w-14 sm:mb-4 short:mb-3 ${hideOnShort}`} />
      )}
      <h1 className="font-display text-[1.45rem] leading-tight font-bold tracking-tight sm:text-3xl short:sm:text-[1.75rem]">{title}</h1>
      <p className="mt-1 text-sm text-ink-500 sm:mt-1.5 sm:text-base micro:hidden">{subtitle}</p>
    </div>
  );
}

/** « MentorConnect » coloré, pour les titres. */
export const BrandName = () => <span className="text-brand-600">MentorConnect</span>;
