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
    <header className="sticky top-0 z-40 border-b border-paper-200/80 bg-paper/90 backdrop-blur">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-6 px-4 py-4 sm:px-8">
        <Logo />
        <nav aria-label="Navigation principale" className="hidden items-center gap-8 text-[15px] font-medium text-ink-700 lg:flex">
          {LINKS.map((l) => (
            <Link key={l.href} href={l.href} className="transition-colors hover:text-brand-700">
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
                <Link href="/login" className="px-2 font-semibold text-ink-900 hover:text-brand-700">
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
            className="inline-flex size-11 items-center justify-center rounded-xl text-ink-900 hover:bg-paper-200 focus-visible:outline-2 focus-visible:outline-brand-600 lg:hidden"
          >
            {open ? <CloseIcon className="size-6" /> : <MenuIcon className="size-6" />}
          </button>
        </div>
      </div>

      {open && (
        <nav
          id="menu-mobile"
          aria-label="Navigation principale"
          className="border-t border-paper-200 bg-paper px-4 pt-2 pb-6 sm:px-8 lg:hidden"
        >
          <ul className="flex flex-col">
            {LINKS.map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className="block border-b border-paper-200 py-4 text-lg font-semibold text-ink-900"
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
