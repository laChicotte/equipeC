import type { ReactNode } from "react";

/** En-tête centré des cartes d'authentification : pastille icône, titre, sous-titre. */
export function AuthHeader({ icon, title, subtitle }: { icon: ReactNode; title: ReactNode; subtitle: string }) {
  return (
    <div className="mb-8 flex flex-col items-center text-center">
      <span className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-50 text-brand-700">
        {icon}
      </span>
      <h1 className="font-display text-[1.7rem] leading-tight font-semibold tracking-tight sm:text-3xl">{title}</h1>
      <p className="mt-2 text-ink-500">{subtitle}</p>
    </div>
  );
}

/** « MentorConnect » coloré, pour les titres. */
export const BrandName = () => <span className="text-brand-700">MentorConnect</span>;
