import Link from "next/link";

/**
 * Logo MentorConnect (émeraude et bleu nuit).
 * Symbole : deux traits qui se rejoignent (le mentor et le mentoré).
 * tone="light" : variante pour fond sombre (le second trait passe en blanc).
 */
export function LogoMark({ className = "h-7 w-9", tone = "dark" }: { className?: string; tone?: "dark" | "light" }) {
  return (
    <svg viewBox="0 0 36 28" aria-hidden className={className}>
      <rect x="2" y="9" width="22" height="9" rx="4.5" transform="rotate(-38 13 13.5)" fill="#10b981" />
      <rect
        x="12"
        y="10"
        width="22"
        height="9"
        rx="4.5"
        transform="rotate(-38 23 14.5)"
        fill={tone === "light" ? "#ffffff" : "#0f172a"}
      />
      <rect x="12" y="10" width="11" height="9" rx="4.5" transform="rotate(-38 23 14.5)" fill="#059669" opacity="0.85" />
    </svg>
  );
}

export function Logo({ href = "/", tone = "dark" }: { href?: string; tone?: "dark" | "light" }) {
  return (
    <Link href={href} className="flex items-center gap-2.5" aria-label="MentorConnect, accueil">
      <LogoMark tone={tone} />
      <span
        className={`text-[1.2rem] font-extrabold tracking-tight ${tone === "light" ? "text-white" : "text-ink-900"}`}
      >
        Mentor<span className={tone === "light" ? "text-accent-400" : "text-brand-500"}>Connect</span>
      </span>
    </Link>
  );
}
