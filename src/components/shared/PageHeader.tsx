import type { ReactNode } from "react";

export function PageHeader({
  title,
  description,
  actions,
}: {
  title: string;
  description?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-ink-900">{title}</h1>
        {description && <p className="mt-2 text-ink-500">{description}</p>}
      </div>
      {actions}
    </div>
  );
}
