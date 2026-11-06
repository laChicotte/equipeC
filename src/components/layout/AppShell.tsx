"use client";

// Coquille de la zone connectée (design « Mentora ») :
// - barre latérale (ordinateur) / tiroir (mobile) avec le menu et l'encadré d'aide
// - en-tête : recherche, notifications, avatar avec menu (profil, déconnexion)
// Composant client : il connaît l'URL courante et gère tiroir et menu.
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { logout } from "@/features/auth/actions";
import { switchRole } from "@/features/profiles/actions";
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
  // « Mentorat » regroupe les échanges et les rendez-vous (onglets dans la page)
  { href: "/mentorships", label: "Mentorat", icon: ICONS.messages, also: ["/sessions"] },
  { href: "/goals", label: "Mes objectifs", icon: ICONS.target },
  { href: "/resources", label: "Bibliothèque", icon: ICONS.book },
  {
    href: "/workshops",
    label: "Ateliers",
    icon: (
      <>
        <circle cx="9" cy="8" r="3" />
        <circle cx="17" cy="9" r="2.5" />
        <path d="M3 20a6 6 0 0 1 12 0M14.5 15.5A5 5 0 0 1 21 20" />
      </>
    ),
  },
  { href: "/opportunities", label: "Opportunités", icon: ICONS.briefcase },
  {
    href: "/impact",
    label: "Impact",
    icon: <path d="M4 20V10M10 20V4M16 20v-7M22 20H2" />,
  },
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

type ShellUser = {
  fullName: string;
  roleLabel: string;
  isMentor: boolean;
  avatarUrl: string | null;
  /** Double rôle : mode vers lequel basculer (profil complet), sinon null */
  switchTo: "mentor" | "mentee" | null;
} | null;
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
            const active = [item.href, ...(("also" in item && item.also) || [])].some(
              (href) => pathname === href || pathname.startsWith(`${href}/`),
            );
            const count = badges[item.href] ?? 0;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={onNavigate}
                  aria-current={active ? "page" : undefined}
                  className={`relative flex items-center gap-4 rounded-2xl px-4 py-2.5 text-[15px] transition-colors duration-200 ${
                    active
                      ? "bg-brand-50 font-semibold text-brand-700 before:absolute before:inset-y-2.5 before:left-0 before:w-1 before:rounded-full before:bg-brand-500"
                      : "text-ink-500 hover:bg-slate-50 hover:text-ink-900"
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

      {/* Encadré d'aide (vert forêt) — masqué sur les écrans peu hauts */}
      <div className="px-5 pt-4 [@media(max-height:760px)]:hidden">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-dark p-5 text-white">
          <div aria-hidden className="absolute -top-12 -right-12 size-36 rounded-full bg-brand-500/35 blur-2xl" />
          <span className="relative text-accent-400">{icon(ICONS.sparkle, "size-6")}</span>
          <p className="relative mt-3 text-lg font-bold">Besoin d&apos;aide ?</p>
          <p className="relative mt-1 text-sm text-white/70">
            {user?.isMentor
              ? "Partagez vos conseils avec toute la communauté."
              : "Nos mentors sont là pour vous accompagner."}
          </p>
          <Link
            href={user?.isMentor ? "/resources" : "/mentors"}
            onClick={onNavigate}
            className="relative mt-4 block rounded-xl border border-white/20 bg-white/5 px-4 py-2.5 text-center text-sm font-medium transition-colors hover:bg-white/10"
          >
            {user?.isMentor ? "Partager une ressource" : "Trouver un mentor"}
          </Link>
        </div>
      </div>

      {/* Compte : toujours visible en bas du menu (profil, déconnexion) */}
      {user && (
        <div className="m-5 mt-4 flex items-center gap-3 rounded-2xl border border-slate-200/70 p-3">
          <Link href="/profile" onClick={onNavigate} className="flex min-w-0 flex-1 items-center gap-3" title="Mon profil">
            <Avatar name={user.fullName} src={user.avatarUrl} size="sm" />
            <span className="min-w-0 leading-tight">
              <span className="block truncate text-sm font-semibold text-ink-900">{user.fullName}</span>
              <span className="block text-xs text-ink-500">{user.roleLabel} · Mon profil</span>
            </span>
          </Link>
          {user.switchTo && (
            <form action={switchRole}>
              <input type="hidden" name="role" value={user.switchTo} />
              <button
                aria-label={user.switchTo === "mentor" ? "Passer en mode mentor" : "Passer en mode mentoré"}
                title={user.switchTo === "mentor" ? "Passer en mode mentor" : "Passer en mode mentoré"}
                className="inline-flex size-9 items-center justify-center rounded-xl text-ink-500 transition-colors hover:bg-brand-50 hover:text-brand-700"
              >
                {icon(<path d="M7 7h11l-3-3M17 17H6l3 3" />, "size-5")}
              </button>
            </form>
          )}
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
  const drawerRef = useRef<HTMLElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);

  // Tiroir mobile accessible : focus dans le menu à l'ouverture, Échap pour
  // fermer, Tab qui reste dans le menu, page derrière non défilable, et focus
  // rendu au bouton ☰ à la fermeture.
  useEffect(() => {
    if (!open) return;
    const drawer = drawerRef.current;
    const menuButton = menuButtonRef.current;
    const focusables = () =>
      Array.from(
        drawer?.querySelectorAll<HTMLElement>('a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])') ?? [],
      );
    focusables()[0]?.focus();

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
        return;
      }
      if (event.key !== "Tab") return;
      const items = focusables();
      if (items.length === 0) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
      menuButton?.focus();
    };
  }, [open]);

  return (
    <div className="flex min-h-full flex-1">
      {/* Ordinateur : barre latérale fixe */}
      <aside className="sticky top-0 hidden h-dvh w-72 shrink-0 border-r border-slate-200/70 bg-white lg:block">
        <SidebarContent user={user} badges={badges} />
      </aside>

      {/* Mobile : tiroir latéral */}
      {open && (
        <div className="fixed inset-0 z-40 lg:hidden" role="dialog" aria-modal="true" aria-label="Menu">
          {/* Fond cliquable : retiré de l'ordre de tabulation (Échap ferme aussi le menu) */}
          <button
            aria-label="Fermer le menu"
            tabIndex={-1}
            className="absolute inset-0 bg-ink-900/40"
            onClick={() => setOpen(false)}
          />
          <aside ref={drawerRef} className="absolute inset-y-0 left-0 w-80 max-w-[85%] overflow-y-auto bg-white shadow-xl">
            <SidebarContent user={user} badges={badges} onNavigate={() => setOpen(false)} />
          </aside>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Mobile uniquement : le compte, la déconnexion et les notifications sont dans la barre latérale */}
        <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-slate-200/70 bg-white/95 px-4 py-3 backdrop-blur sm:px-8 lg:hidden">
          <button
            ref={menuButtonRef}
            onClick={() => setOpen(true)}
            aria-label="Ouvrir le menu"
            aria-expanded={open}
            className="-ml-1 rounded-xl p-2 text-ink-900 hover:bg-slate-100 lg:hidden"
          >
            {icon(ICONS.menu)}
          </button>
          <Logo href="/dashboard" />
        </header>

        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-8 lg:py-10">{children}</main>
      </div>
    </div>
  );
}
