import type { ReactNode } from "react";

type Tone = "brand" | "neutral" | "accent";

const tones: Record<Tone, string> = {
  brand: "bg-brand-50 text-brand-800 ring-brand-100",
  neutral: "bg-zinc-100 text-ink-700 ring-zinc-200",
  accent: "bg-amber-50 text-amber-800 ring-amber-200",
};

export function Badge({ children, tone = "neutral" }: { children: ReactNode; tone?: Tone }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${tones[tone]}`}
    >
      {children}
    </span>
  );
}
