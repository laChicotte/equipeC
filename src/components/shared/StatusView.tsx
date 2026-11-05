import type { ReactNode } from "react";

/** Écran plein d'état (404, erreur) : icône, titre, texte, actions. */
export function StatusView({
  icon,
  title,
  children,
  actions,
}: {
  icon: string;
  title: string;
  children: ReactNode;
  actions: ReactNode;
}) {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center px-4 py-16 text-center">
      <span aria-hidden className="mb-4 text-5xl">
        {icon}
      </span>
      <h1 className="text-2xl font-semibold">{title}</h1>
      <div className="mt-2 text-zinc-600">{children}</div>
      <div className="mt-6 flex flex-wrap justify-center gap-3">{actions}</div>
    </div>
  );
}
