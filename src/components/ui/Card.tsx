import type { ComponentProps } from "react";

/**
 * Carte blanche arrondie, ombre légère.
 * `interactive` : élévation au survol (cartes cliquables).
 */
export function Card({ className = "", interactive = false, ...props }: ComponentProps<"div"> & { interactive?: boolean }) {
  return (
    <div
      className={`rounded-3xl border border-slate-200/80 bg-white p-6 shadow-card sm:p-7 ${
        interactive ? "transition-[box-shadow,transform,border-color] duration-300 hover:-translate-y-1 hover:border-slate-300/80 hover:shadow-card-hover" : ""
      } ${className}`}
      {...props}
    />
  );
}
