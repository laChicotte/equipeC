"use client";

// Coquille de la zone connectée (design « Mentora ») :
// - barre latérale (ordinateur) / tiroir (mobile) avec le menu et l'encadré d'aide
// - en-tête : recherche, notifications, avatar avec menu (profil, déconnexion)
// Composant client : il connaît l'URL courante et gère tiroir et menu.
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, type ReactNode } from "react";
import { logout } from "@/features/auth/actions";
import { Avatar } from "@/components/ui/Avatar";
import { Logo } from "./Logo";

const icon = (path: ReactNode, className = "size-[22px]") => (
  <svg
    aria-hidden
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.7}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={`shrink-0 ${className}`}
  >
    {path}
  </svg>
);

const ICONS = {
  home: <path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z" />,
  grid: (
    <>
      <rect x="3" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="3" width="7" height="7" rx="1.5" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" />
      <rect x="14" y="14" width="7" height="7" rx="1.5" />
    </>
  ),
  compass: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="m15.5 8.5-2 5-5 2 2-5z" />
    </>
  ),
  messages: (
    <>
      <path d="M4 5h16v11H8l-4 4z" />
      <path d="M8 9h8M8 12.5h5" />
    </>
  ),
  target: (
    <>
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="5" />
      <path d="m12 12 7-7M16 5h3v3" />
    </>
  ),
  book: (
    <>
      <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H12v18H6.5A2.5 2.5 0 0 1 4 18.5z" />
      <path d="M12 3h5.5A2.5 2.5 0 0 1 20 5.5v13a2.5 2.5 0 0 1-2.5 2.5H12" />
    </>
  ),
  calendar: (
    <>
      <rect x="3.5" y="5" width="17" height="15.5" rx="2" />
      <path d="M8 3v4M16 3v4M3.5 10h17M8 14h2M12 14h2M8 17h2" />
    </>
  ),
  briefcase: (
    <>
      <rect x="3" y="7" width="18" height="13" rx="2" />
      <path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M3 13h18" />
    </>
  ),
  search: (
    <>
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </>
  ),
  bell: (
    <>
      <path d="M6 9a6 6 0 1 1 12 0c0 6 2.5 7.5 2.5 7.5h-17S6 15 6 9" />
      <path d="M10 20a2.2 2.2 0 0 0 4 0" />
    </>
  ),
  sparkle: (
    <path d="M12 3c.6 4.2 2.8 6.4 7 7-4.2.6-6.4 2.8-7 7-.6-4.2-2.8-6.4-7-7 4.2-.6 6.4-2.8 7-7ZM19 15c.3 1.9 1.1 2.7 3 3-1.9.3-2.7 1.1-3 3-.3-1.9-1.1-2.7-3-3 1.9-.3 2.7-1.1 3-3Z" />
  ),
  menu: <path d="M4 6h16M4 12h16M4 18h16" />,
};

const NAV = [
  { href: "/dashboard", label: "Accueil", icon: ICONS.home },
  { href: "/mentors", label: "Découvrir", icon: ICONS.compass },
  { href: "/domains", label: "Domaines", icon: ICONS.grid },
  { href: "/mentorships", label: "Messages", icon: ICONS.messages },
  { href: "/goals", label: "Mes objectifs", icon: ICONS.target },
  { href: "/resources", label: "Ressources", icon: ICONS.book },
  { href: "/sessions", label: "Rendez-vous", icon: ICONS.calendar },
  { href: "/opportunities", label: "Opportunités", icon: ICONS.briefcase },
  {
    href: "/profile",
    label: "Mon profil",
    icon: (
      <>
        <circle cx="12" cy="8" r="4" />
        <path d="M4 21a8 8 0 0 1 16 0" />
      </>
    ),
  },
];

type ShellUser = { fullName: string; roleLabel: string; isMentor: boolean } | null;
/** Nombre à afficher en pastille, par lien du menu (ex. { "/mentorships": 2 }). */
type Badges = Record<string, number>;

function SidebarContent({
  user,
  badges,
  onNavigate,
}: {
  user: ShellUser;
  badges: Badges;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();

  return (
    <div className="flex h-full flex-col">
      <div className="px-7 pt-7 pb-6">
        <Logo href="/dashboard" />
      </div>

      <nav aria-label="Navigation principale" className="flex-1 overflow-y-auto px-5">
        <ul className="flex flex-col gap-1">
          {NAV.map((item) => {
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
            const count = badges[item.href] ?? 0;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={onNavigate}
                  aria-current={active ? "page" : undefined}
                  className={`flex items-center gap-4 rounded-2xl px-4 py-2.5 text-[15px] transition-colors ${
                    active
                      ? "bg-brand-50 font-semibold text-brand-700"
                      : "text-ink-500 hover:bg-zinc-50 hover:text-ink-900"
                  }`}
                >
                  {icon(item.icon)}
                  <span className="flex-1">{item.label}</span>
                  {count > 0 && (
                    <span className="inline-flex size-6 items-center justify-center rounded-full bg-accent-400 text-xs font-bold text-ink-900">
                      {count}
                      <span className="sr-only"> en attente</span>
                    </span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Encadré d'aide (bleu nuit) — masqué sur les écrans peu hauts */}
      <div className="px-5 pt-4 [@media(max-height:760px)]:hidden">
        <div className="rounded-3xl bg-ink-900 p-5 text-white">
          <span className="text-accent-400">{icon(ICONS.sparkle, "size-6")}</span>
          <p className="mt-3 font-bold">Besoin d&apos;aide ?</p>
          <p className="mt-1 text-sm text-white/70">
            {user?.isMentor
              ? "Partagez vos conseils avec toute la communauté."
              : "Nos mentors sont là pour vous accompagner."}
          </p>
          <Link
            href={user?.isMentor ? "/resources" : "/mentors"}
            onClick={onNavigate}
            className="mt-4 block rounded-xl border border-white/20 bg-white/5 px-4 py-2.5 text-center text-sm font-medium transition-colors hover:bg-white/10"
          >
            {user?.isMentor ? "Partager une ressource" : "Trouver un mentor"}
          </Link>
        </div>
      </div>

      {/* Compte : toujours visible en bas du menu (profil, déconnexion) */}
      {user && (
        <div className="m-5 mt-4 flex items-center gap-3 rounded-2xl border border-zinc-100 p-3">
          <Link href="/profile" onClick={onNavigate} className="flex min-w-0 flex-1 items-center gap-3" title="Mon profil">
            <Avatar name={user.fullName} size="sm" />
            <span className="min-w-0 leading-tight">
              <span className="block truncate text-sm font-semibold text-ink-900">{user.fullName}</span>
              <span className="block text-xs text-ink-500">{user.roleLabel} · Mon profil</span>
            </span>
          </Link>
          <form action={logout}>
            <button
              aria-label="Se déconnecter"
              title="Se déconnecter"
              className="inline-flex size-9 items-center justify-center rounded-xl text-ink-500 transition-colors hover:bg-red-50 hover:text-red-600"
            >
              {icon(<path d="M15 4h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-3M10 17l5-5-5-5M15 12H3" />, "size-5")}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

/** Bouton rond de l'en-tête (recherche, notifications). */
function RoundLink({ href, label, children }: { href: string; label: string; children: ReactNode }) {
  return (
    <Link
      href={href}
      aria-label={label}
      title={label}
      className="relative inline-flex size-12 items-center justify-center rounded-full bg-zinc-100 text-ink-900 transition-colors hover:bg-zinc-200"
    >
      {children}
    </Link>
  );
}

function UserMenu({ user }: { user: ShellUser }) {
  const [open, setOpen] = useState(false);
  if (!user) return null;

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="Menu du compte"
        aria-expanded={open}
        className="flex items-center gap-3 rounded-full py-1 pr-1 pl-1 ring-2 ring-transparent transition hover:bg-zinc-50 hover:ring-brand-100 xl:pl-4"
      >
        <span className="hidden text-right leading-tight xl:block">
          <span className="block text-sm font-semibold text-ink-900">{user.fullName.split(" ")[0]}</span>
          <span className="block text-xs text-ink-500">{user.roleLabel}</span>
        </span>
        <span className="inline-flex size-12 items-center justify-center rounded-full bg-brand-100 font-semibold text-brand-800">
          {user.fullName
            .split(/\s+/)
            .slice(0, 2)
            .map((p) => p[0]?.toUpperCase())
            .join("")}
        </span>
      </button>
      {open && (
        <>
          {/* Clic à côté : fermeture */}
          <button aria-label="Fermer le menu du compte" className="fixed inset-0 z-40 cursor-default" onClick={() => setOpen(false)} />
          <div className="absolute right-0 z-50 mt-3 w-64 rounded-2xl border border-zinc-100 bg-white p-2 shadow-xl">
            <div className="px-3 py-2">
              <p className="truncate font-semibold">{user.fullName}</p>
              <p className="text-sm text-ink-500">{user.roleLabel}</p>
            </div>
            <Link
              href="/profile"
              onClick={() => setOpen(false)}
              className="block rounded-xl px-3 py-2.5 text-sm hover:bg-zinc-50"
            >
              Mon profil
            </Link>
            <form action={logout}>
              <button className="w-full rounded-xl px-3 py-2.5 text-left text-sm text-red-600 hover:bg-red-50">
                Déconnexion
              </button>
            </form>
          </div>
        </>
      )}
    </div>
  );
}

export function AppShell({
  user,
  badges = {},
  children,
}: {
  user: ShellUser;
  badges?: Badges;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const hasBadge = Object.values(badges).some((n) => n > 0);

  return (
    <div className="flex min-h-full flex-1">
      {/* Ordinateur : barre latérale fixe */}
      <aside className="sticky top-0 hidden h-dvh w-72 shrink-0 border-r border-zinc-100 bg-white lg:block">
        <SidebarContent user={user} badges={badges} />
      </aside>

      {/* Mobile : tiroir latéral */}
      {open && (
        <div className="fixed inset-0 z-40 lg:hidden" role="dialog" aria-modal="true" aria-label="Menu">
          <button aria-label="Fermer le menu" className="absolute inset-0 bg-ink-900/40" onClick={() => setOpen(false)} />
          <aside className="absolute inset-y-0 left-0 w-80 max-w-[85%] bg-white shadow-xl">
            <SidebarContent user={user} badges={badges} onNavigate={() => setOpen(false)} />
          </aside>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-zinc-100 bg-white/95 px-4 py-4 backdrop-blur sm:px-8">
          <button
            onClick={() => setOpen(true)}
            aria-label="Ouvrir le menu"
            aria-expanded={open}
            className="-ml-1 rounded-xl p-2 text-ink-900 hover:bg-zinc-100 lg:hidden"
          >
            {icon(ICONS.menu)}
          </button>
          <div className="lg:hidden">
            <Logo href="/dashboard" />
          </div>

          <div className="ml-auto flex items-center gap-3 sm:gap-4">
            <RoundLink href="/mentors" label="Rechercher un mentor">
              {icon(ICONS.search, "size-5")}
            </RoundLink>
            <RoundLink
              href="/mentorships"
              label={hasBadge ? "Notifications : nouvelles demandes" : "Notifications"}
            >
              {icon(ICONS.bell, "size-5")}
              {hasBadge && (
                <span aria-hidden className="absolute top-3 right-3.5 size-2 rounded-full bg-red-500 ring-2 ring-zinc-100" />
              )}
            </RoundLink>
            <UserMenu user={user} />
          </div>
        </header>

        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-8 lg:py-10">{children}</main>
      </div>
    </div>
  );
}
