import Link from "next/link";
import { logout } from "@/features/auth/actions";
import { ROLE_LABELS } from "@/features/profiles/labels";
import type { Profile } from "@/types/database";
import { Avatar } from "@/components/ui/Avatar";
import { Logo } from "./Logo";

const NAV = [
  { href: "/dashboard", label: "Tableau de bord" },
  { href: "/mentors", label: "Mentors" },
  { href: "/profile", label: "Mon profil" },
];

/** En-tête de la zone connectée. */
export function AppHeader({ profile }: { profile: Profile | null }) {
  return (
    <header className="border-b border-zinc-200 bg-white">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-4 py-3">
        <Logo href="/dashboard" />

        <div className="flex items-center gap-3">
          {profile && (
            <div className="hidden items-center gap-2 sm:flex">
              <Avatar name={profile.full_name} size="sm" />
              <div className="leading-tight">
                <p className="text-sm font-medium">{profile.full_name}</p>
                <p className="text-xs text-zinc-500">{ROLE_LABELS[profile.role]}</p>
              </div>
            </div>
          )}
          <form action={logout}>
            <button className="rounded-lg px-3 py-2 text-sm text-zinc-600 hover:bg-zinc-100">
              Déconnexion
            </button>
          </form>
        </div>

        <nav className="flex w-full gap-1 overflow-x-auto text-sm" aria-label="Navigation principale">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="whitespace-nowrap rounded-lg px-3 py-2 text-zinc-700 hover:bg-brand-50 hover:text-brand-800"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
