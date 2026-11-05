import Link from "next/link";
import { Logo } from "./Logo";
import { CAMPUS_FRANCE_NOTICE } from "@/features/profiles/labels";

const LINKS = [
  { href: "/mentors", label: "Nos mentors" },
  { href: "/#domaines", label: "Domaines" },
  { href: "/charte", label: "Charte du mentorat" },
  { href: "/signup?role=mentor", label: "Devenir mentor" },
];

/** Pied de page des pages publiques (vert forêt). */
export function PublicFooter() {
  return (
    <footer className="bg-brand-950 px-4 pt-14 pb-8 text-white sm:px-8">
      <div className="mx-auto grid max-w-7xl gap-10 md:grid-cols-[1.4fr_1fr]">
        <div>
          <Logo tone="light" />
          <p className="mt-5 max-w-sm font-display text-xl leading-snug text-white/90 italic">
            Une expérience à partager, un avenir à construire.
          </p>
          <p className="mt-4 text-sm text-white/60">
            Né au Salon international du livre jeunesse de Conakry · Novembre Numérique 2026
          </p>
        </div>
        <nav aria-label="Liens utiles">
          <p className="text-xs font-bold tracking-[0.14em] text-accent-300 uppercase">Explorer</p>
          <ul className="mt-4 grid grid-cols-2 gap-x-6 gap-y-3 text-sm text-white/80">
            {LINKS.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="hover:text-white hover:underline">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
      <div className="mx-auto mt-12 max-w-7xl border-t border-white/10 pt-6 text-xs leading-relaxed text-white/50">
        <p>© 2026 MentorConnect · Conakry</p>
        <p className="mt-2">{CAMPUS_FRANCE_NOTICE}</p>
      </div>
    </footer>
  );
}
