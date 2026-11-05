import type { ComponentProps } from "react";

/** Carte blanche très arrondie (style de la maquette). */
export function Card({ className = "", ...props }: ComponentProps<"div">) {
  return (
    <div
      className={`rounded-3xl border border-zinc-100 bg-white p-6 shadow-[0_1px_3px_rgba(23,43,69,0.04)] sm:p-7 ${className}`}
      {...props}
    />
  );
}
