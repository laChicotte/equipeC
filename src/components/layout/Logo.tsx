import Link from "next/link";

/** Symbole : deux traits qui se rejoignent (le mentor et le mentoré). */
export function LogoMark({ className = "h-7 w-9" }: { className?: string }) {
  return (
    <svg viewBox="0 0 36 28" aria-hidden className={className}>
      <rect x="2" y="9" width="22" height="9" rx="4.5" transform="rotate(-38 13 13.5)" fill="#19a08a" />
      <rect x="12" y="10" width="22" height="9" rx="4.5" transform="rotate(-38 23 14.5)" fill="#e5a03f" />
      <rect x="12" y="10" width="11" height="9" rx="4.5" transform="rotate(-38 23 14.5)" fill="#13836f" opacity="0.55" />
    </svg>
  );
}

export function Logo({ href = "/", tone = "dark" }: { href?: string; tone?: "dark" | "light" }) {
  return (
    <Link href={href} className="flex items-center gap-2.5" aria-label="MentorConnect, accueil">
      <LogoMark />
      <span
        className={`text-[1.05rem] font-extrabold tracking-[0.12em] uppercase ${
          tone === "light" ? "text-white" : "text-ink-900"
        }`}
      >
        Mentor<span className={tone === "light" ? "text-brand-300" : "text-brand-600"}>Connect</span>
      </span>
    </Link>
  );
}
