import type { ReactNode } from "react";

/** En-tête de page (maquettes) : surtitre souligné, grand titre, description. */
export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
      <div className="max-w-3xl">
        {eyebrow && <p className="eyebrow mb-4 inline-block border-b-2 border-brand-600 pb-0.5">{eyebrow}</p>}
        <h1 className="text-3xl leading-tight font-bold tracking-tight text-ink-900 sm:text-4xl">{title}</h1>
        {description && <p className="mt-3 text-lg text-ink-500">{description}</p>}
      </div>
      {actions}
    </div>
  );
}
