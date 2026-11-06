import Link from "next/link";

const TABS = [
  { href: "/mentorships", label: "Mentorats et messages" },
  { href: "/sessions", label: "Rendez-vous" },
] as const;

/** Onglets de l'espace « Mentorat » : relations et échanges, puis agenda des séances. */
export function MentorshipTabs({ active }: { active: (typeof TABS)[number]["href"] }) {
  return (
    <nav aria-label="Espace mentorat" className="mb-8 flex gap-2 border-b border-slate-200">
      {TABS.map((tab) => {
        const current = tab.href === active;
        return (
          <Link
            key={tab.href}
            href={tab.href}
            aria-current={current ? "page" : undefined}
            className={`-mb-px border-b-2 px-4 py-3 text-sm font-semibold transition-colors ${
              current ? "border-brand-600 text-brand-700" : "border-transparent text-ink-500 hover:text-ink-900"
            }`}
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
