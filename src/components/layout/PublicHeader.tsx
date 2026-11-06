"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Logo } from "./Logo";
import { ButtonLink } from "@/components/ui/Button";
import { CloseIcon, MenuIcon } from "@/components/ui/icons";

const LINKS = [
  { href: "/#piliers", label: "Notre mission" },
  { href: "/#parcours", label: "Comment ça marche" },
  { href: "/#domaines", label: "Domaines" },
  { href: "/mentors", label: "Nos mentors" },
];

// Liens du menu : trait vert qui se déploie sous le lien au survol (et au focus clavier)

/** En-tête des pages publiques : menu horizontal (ordinateur) ou tiroir (mobile). */
export function PublicHeader({ loggedIn }: { loggedIn: boolean }) {
  const [open, setOpen] = useState(false);

  // Échap ferme le menu mobile
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/70 bg-white/85 backdrop-blur-md">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-6 px-4 py-4 sm:px-8">
        <Logo />
        <nav aria-label="Navigation principale" className="hidden items-center gap-8 text-[15px] font-medium text-ink-700 lg:flex">
          {LINKS.map((l) => (
            <Link key={l.href} href={l.href} className="relative transition-colors after:absolute after:-bottom-1.5 after:left-0 after:h-0.5 after:w-full after:origin-left after:scale-x-0 after:rounded-full after:bg-brand-600 after:transition-transform after:duration-300 hover:text-brand-700 hover:after:scale-x-100 focus-visible:after:scale-x-100 motion-reduce:after:transition-none">
              {l.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Masqués sur mobile (repris dans le tiroir) ; enveloppe car ButtonLink impose inline-flex */}
          <div className="hidden items-center gap-4 sm:flex">
            {loggedIn ? (
              <ButtonLink href="/dashboard">Mon espace</ButtonLink>
            ) : (
              <>
                <Link href="/login" className="mx-2 font-semibold text-ink-900 relative transition-colors after:absolute after:-bottom-1.5 after:left-0 after:h-0.5 after:w-full after:origin-left after:scale-x-0 after:rounded-full after:bg-brand-600 after:transition-transform after:duration-300 hover:text-brand-700 hover:after:scale-x-100 focus-visible:after:scale-x-100 motion-reduce:after:transition-none">
                  Se connecter
                </Link>
                <ButtonLink href="/signup">Commencer</ButtonLink>
              </>
            )}
          </div>
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            aria-expanded={open}
            aria-controls="menu-mobile"
            aria-label={open ? "Fermer le menu" : "Ouvrir le menu"}
            className="inline-flex size-11 items-center justify-center rounded-xl text-ink-900 hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-brand-600 lg:hidden"
          >
            {open ? <CloseIcon className="size-6" /> : <MenuIcon className="size-6" />}
          </button>
        </div>
      </div>

      {open && (
        <nav
          id="menu-mobile"
          aria-label="Navigation principale"
          className="border-t border-slate-200 bg-white px-4 pt-2 pb-6 sm:px-8 lg:hidden"
        >
          <ul className="flex flex-col">
            {LINKS.map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className="block border-b border-slate-100 py-4 text-lg font-semibold text-ink-900"
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
          <div className="mt-6 flex flex-col gap-3">
            {loggedIn ? (
              <ButtonLink href="/dashboard">Mon espace</ButtonLink>
            ) : (
              <>
                <ButtonLink href="/signup">Commencer gratuitement</ButtonLink>
                <ButtonLink href="/login" variant="secondary">
                  Se connecter
                </ButtonLink>
              </>
            )}
          </div>
        </nav>
      )}
    </header>
  );
}
