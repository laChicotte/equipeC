import Link from "next/link";
import type { ComponentProps } from "react";

/** Variantes de bouton (primaire émeraude, secondaire blanc, fantôme, sombre). */
type Variant = "primary" | "secondary" | "ghost" | "dark";

// Retour visuel : léger enfoncement au clic, ombre au survol (désactivés si
// l'utilisateur demande moins d'animations, voir globals.css).
const base =
  "inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold transition-[background-color,border-color,color,box-shadow,transform] duration-200 active:scale-[0.97] disabled:pointer-events-none disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500";

const variants: Record<Variant, string> = {
  primary: "bg-brand-600 text-white shadow-sm shadow-brand-600/20 hover:bg-brand-700 hover:shadow-md hover:shadow-brand-600/25",
  secondary: "border border-slate-200 bg-white text-ink-900 hover:border-slate-300 hover:bg-slate-50",
  ghost: "text-ink-700 hover:bg-slate-100",
  dark: "bg-ink-900 text-white hover:bg-ink-800",
};

export function buttonClasses(variant: Variant = "primary", className = "") {
  return `${base} ${variants[variant]} ${className}`;
}

/** Indicateur de chargement (bouton pendant l'envoi d'un formulaire). */
export function Spinner({ className = "size-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className={`animate-spin ${className}`} fill="none">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeOpacity="0.25" strokeWidth="3" />
      <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

/** Bouton classique (formulaires, actions). `loading` : indicateur + désactivé. */
export function Button({
  variant = "primary",
  className,
  loading = false,
  children,
  disabled,
  ...props
}: ComponentProps<"button"> & { variant?: Variant; loading?: boolean }) {
  return (
    <button className={buttonClasses(variant, className)} disabled={disabled || loading} aria-busy={loading || undefined} {...props}>
      {loading && <Spinner />}
      {children}
    </button>
  );
}

/** Lien qui a l'apparence d'un bouton. */
export function ButtonLink({
  variant = "primary",
  className,
  ...props
}: ComponentProps<typeof Link> & { variant?: Variant }) {
  return <Link className={buttonClasses(variant, className)} {...props} />;
}
