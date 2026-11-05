"use client";

// Coquille de la zone connectée : barre latérale gauche (ordinateur)
// et tiroir latéral ouvert par un bouton ☰ (mobile).
// Composant client : il doit connaître l'URL courante (onglet actif)
// et gérer l'ouverture du tiroir.
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, type ReactNode } from "react";
import { logout } from "@/features/auth/actions";
import { Avatar } from "@/components/ui/Avatar";
import { Logo } from "./Logo";

const icon = (path: ReactNode) => (
  <svg
    aria-hidden
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.8}
    strokeLinecap="round"
    strokeLinejoin="round"
    className="size-5 shrink-0"
  >
    {path}
  </svg>
);

const NAV = [
  {
    href: "/dashboard",
    label: "Accueil",
    icon: icon(<path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z" />),
  },
  {
    href: "/mentors",
    label: "Trouver un mentor",
    icon: icon(
      <>
        <circle cx="11" cy="11" r="7" />
        <path d="m20 20-3.5-3.5" />
      </>,
    ),
  },
  {
    href: "/mentorships",
    label: "Mes mentorats",
    icon: icon(
      <>
        <circle cx="9" cy="8" r="3.5" />
        <circle cx="17" cy="9.5" r="2.5" />
        <path d="M2.5 20a6.5 6.5 0 0 1 13 0M15 14.5a5 5 0 0 1 6.5 4.8" />
      </>,
    ),
  },
  {
    href: "/resources",
    label: "Ressources",
    icon: icon(
      <>
        <path d="M4 19.5V5a2 2 0 0 1 2-2h12v16H6a2 2 0 0 0-2 2" />
        <path d="M8 7h6M8 11h6" />
      </>,
    ),
  },
  {
    href: "/opportunities",
    label: "Opportunités",
    icon: icon(
      <>
        <rect x="3" y="7" width="18" height="13" rx="2" />
        <path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M3 13h18" />
      </>,
    ),
  },
  {
    href: "/profile",
    label: "Mon profil",
    icon: icon(
      <>
        <circle cx="12" cy="8" r="4" />
        <path d="M4 21a8 8 0 0 1 16 0" />
      </>,
    ),
  },
];

type ShellUser = { fullName: string; roleLabel: string } | null;

function SidebarContent({
  user,
  onNavigate,
}: {
  user: ShellUser;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();

  return (
    <div className="flex h-full flex-col">
      <div className="px-5 py-5">
        <Logo href="/dashboard" />
      </div>

      <nav aria-label="Navigation principale" className="flex-1 px-3">
        <ul className="flex flex-col gap-1">
          {NAV.map((item) => {
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={onNavigate}
                  aria-current={active ? "page" : undefined}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                    active
                      ? "bg-brand-50 text-brand-800"
                      : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900"
                  }`}
                >
                  {item.icon}
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="border-t border-zinc-200 p-3">
        {user && (
          <div className="mb-2 flex items-center gap-3 px-2 py-1">
            <Avatar name={user.fullName} size="sm" />
            <div className="min-w-0 leading-tight">
              <p className="truncate text-sm font-medium">{user.fullName}</p>
              <p className="text-xs text-zinc-500">{user.roleLabel}</p>
            </div>
          </div>
        )}
        <form action={logout}>
          <button className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-zinc-600 hover:bg-zinc-100">
            {icon(<path d="M15 4h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-3M10 17l5-5-5-5M15 12H3" />)}
            Déconnexion
          </button>
        </form>
      </div>
    </div>
  );
}

export function AppShell({ user, children }: { user: ShellUser; children: ReactNode }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex min-h-full flex-1">
      {/* Ordinateur : barre latérale fixe */}
      <aside className="sticky top-0 hidden h-dvh w-64 shrink-0 border-r border-zinc-200 bg-white md:block">
        <SidebarContent user={user} />
      </aside>

      {/* Mobile : tiroir latéral */}
      {open && (
        <div className="fixed inset-0 z-40 md:hidden" role="dialog" aria-modal="true" aria-label="Menu">
          <button
            aria-label="Fermer le menu"
            className="absolute inset-0 bg-black/40"
            onClick={() => setOpen(false)}
          />
          <aside className="absolute inset-y-0 left-0 w-72 max-w-[85%] bg-white shadow-xl">
            <SidebarContent user={user} onNavigate={() => setOpen(false)} />
          </aside>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Mobile : barre du haut avec le bouton ☰ */}
        <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-zinc-200 bg-white/95 px-4 py-3 backdrop-blur md:hidden">
          <button
            onClick={() => setOpen(true)}
            aria-label="Ouvrir le menu"
            aria-expanded={open}
            className="-ml-2 rounded-lg p-2 text-zinc-700 hover:bg-zinc-100"
          >
            {icon(<path d="M4 6h16M4 12h16M4 18h16" />)}
          </button>
          <Logo href="/dashboard" />
        </header>

        <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-6 sm:px-6 md:py-8">{children}</main>
      </div>
    </div>
  );
}
