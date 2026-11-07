import type { ReactNode } from "react";
import { CheckCircleIcon } from "./icons";

/**
 * Briques des fenêtres de détail (atelier, opportunité) : pastilles,
 * informations clés avec icône, encadré vert, liste à coches.
 */

export function DetailPill({
  icon,
  tone = "brand",
  children,
}: {
  icon?: ReactNode;
  tone?: "brand" | "slate" | "red" | "dark";
  children: ReactNode;
}) {
  const tones = {
    brand: "bg-brand-50 text-brand-800",
    slate: "bg-slate-100 text-ink-700",
    red: "bg-red-50 text-red-700 ring-1 ring-red-100",
    dark: "bg-ink-900 text-white",
  };
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold whitespace-nowrap ${tones[tone]}`}
    >
      {icon}
      {children}
    </span>
  );
}

/** Ligne d'informations clés, séparées par un trait vertical. */
export function DetailFacts({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-wrap gap-x-6 gap-y-4 sm:[&>*+*]:border-l sm:[&>*+*]:border-slate-200 sm:[&>*+*]:pl-6">
      {children}
    </div>
  );
}

export function DetailFact({
  icon,
  label,
  value,
  sub,
}: {
  icon: ReactNode;
  label?: string;
  value: ReactNode;
  sub?: ReactNode;
}) {
  return (
    <div className="flex min-w-0 items-center gap-3">
      <span className="shrink-0 text-brand-700 [&>svg]:size-7">{icon}</span>
      <div className="min-w-0 leading-snug">
        {label && <p className="text-xs text-ink-500">{label}</p>}
        <p className="font-bold text-ink-900">{value}</p>
        {sub && <p className="text-sm text-ink-500">{sub}</p>}
      </div>
    </div>
  );
}

/** Encadré vert (objectif, programme, description). */
export function DetailCallout({
  icon,
  title,
  children,
}: {
  icon: ReactNode;
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="flex gap-4 rounded-2xl bg-brand-50/70 p-5">
      <span className="mt-0.5 shrink-0 text-brand-700 [&>svg]:size-9">
        {icon}
      </span>
      <div className="min-w-0">
        <p className="font-bold text-brand-800">{title}</p>
        <div className="mt-1 leading-relaxed break-words whitespace-pre-line text-ink-700">
          {children}
        </div>
      </div>
    </div>
  );
}

export function CheckList({ items }: { items: string[] }) {
  return (
    <ul className="flex flex-col gap-2.5">
      {items.map((item) => (
        <li key={item} className="flex items-start gap-3 text-ink-700">
          <CheckCircleIcon className="mt-0.5 size-5 shrink-0 text-brand-600" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

/**
 * Sépare un texte libre en paragraphe + puces : les lignes qui commencent
 * par « - », « • », « * » ou « ✓ » deviennent une liste à coches.
 */
export function splitBullets(text: string): {
  body: string;
  bullets: string[];
} {
  const bullets: string[] = [];
  const body: string[] = [];
  for (const line of text.split(/\r?\n/)) {
    const m = line.match(/^\s*(?:[-•*✓]|\d+[.)])\s+(.+)$/);
    if (m) bullets.push(m[1].trim());
    else body.push(line);
  }
  return { body: body.join("\n").trim(), bullets };
}

/** Bordure haute du pied de fenêtre. */
export function DetailFooter({ children }: { children: ReactNode }) {
  return <div className="mt-8 border-t border-slate-100 pt-6">{children}</div>;
}

/** Pastille « 0 / 20 inscrits ». */
export function CountPill({
  icon,
  children,
}: {
  icon: ReactNode;
  children: ReactNode;
}) {
  return (
    <span className="inline-flex items-center gap-3 self-start rounded-2xl border border-slate-200 px-5 py-3 text-ink-700 sm:self-auto [&>svg]:size-6 [&>svg]:text-brand-700">
      {icon}
      <span>{children}</span>
    </span>
  );
}

/** Rappel compact affiché à côté d'un formulaire d'inscription / candidature. */
export function FormRecap({
  illustration,
  pill,
  title,
  facts,
}: {
  illustration: ReactNode;
  pill: ReactNode;
  title: string;
  facts: { icon: ReactNode; text: ReactNode }[];
}) {
  return (
    <div className="flex h-full flex-col rounded-3xl bg-gradient-to-br from-brand-50 via-brand-50 to-brand-100 p-6">
      <div className="mb-4 flex justify-center">{illustration}</div>
      <div>{pill}</div>
      <p className="mt-3 text-lg leading-snug font-bold break-words text-ink-900">
        {title}
      </p>
      <ul className="mt-4 flex flex-col gap-2.5 text-sm text-ink-700">
        {facts.map((f, i) => (
          <li key={i} className="flex items-center gap-2.5">
            <span className="shrink-0 text-brand-700 [&>svg]:size-5">
              {f.icon}
            </span>
            <span className="min-w-0">{f.text}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
