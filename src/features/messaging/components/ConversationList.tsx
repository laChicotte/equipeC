import Link from "next/link";
import type { MentorshipView } from "@/features/mentorship/queries";
import { Avatar } from "@/components/ui/Avatar";
import { DOMAIN_SHORT_LABELS } from "@/features/profiles/labels";

/**
 * Liste des conversations (messagerie) : un mentorat actif ou terminé = une
 * discussion. Affichée à gauche de la discussion sur ordinateur.
 * Aucune donnée inventée : nom, domaine et statut viennent du mentorat.
 */
export function ConversationList({
  mentorships,
  currentUserId,
  activeId,
}: {
  mentorships: MentorshipView[];
  currentUserId: string;
  activeId?: string;
}) {
  const conversations = mentorships
    .filter((m) => m.status === "accepted" || m.status === "ended")
    // Actives d'abord, puis les plus récentes
    .sort((a, b) =>
      a.status === b.status ? b.created_at.localeCompare(a.created_at) : a.status === "accepted" ? -1 : 1,
    );

  return (
    <nav
      aria-label="Conversations"
      className="flex flex-col overflow-hidden rounded-3xl border border-slate-200/70 bg-white shadow-card"
    >
      <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
        <h2 className="font-bold text-ink-900">Conversations</h2>
        <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-ink-500">
          {conversations.length}
        </span>
      </div>

      {conversations.length === 0 ? (
        <p className="px-5 py-6 text-sm text-ink-500">
          Vos discussions apparaîtront ici dès qu&apos;un mentorat sera accepté.
        </p>
      ) : (
        <ul className="flex max-h-[60vh] flex-col overflow-y-auto p-2">
          {conversations.map((m) => {
            const partner = m.mentor.id === currentUserId ? m.mentee : m.mentor;
            const active = m.id === activeId;
            const ended = m.status === "ended";
            return (
              <li key={m.id}>
                <Link
                  href={`/mentorships/${m.id}`}
                  aria-current={active ? "page" : undefined}
                  className={`flex items-center gap-3 rounded-2xl px-3 py-3 transition-colors ${
                    active ? "bg-brand-50 ring-1 ring-brand-100" : "hover:bg-slate-50"
                  }`}
                >
                  <span className="relative">
                    <Avatar name={partner.full_name} src={partner.avatar_url} size="md" />
                    {!ended && (
                      <span
                        aria-hidden
                        className="absolute right-0 bottom-0 size-2.5 rounded-full bg-accent-400 ring-2 ring-white"
                      />
                    )}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className={`block truncate text-sm font-semibold ${active ? "text-brand-700" : "text-ink-900"}`}>
                      {partner.full_name}
                    </span>
                    <span className="block truncate text-xs text-ink-500">
                      {m.domain ? (DOMAIN_SHORT_LABELS[m.domain.slug] ?? m.domain.name) : "Mentorat"}
                      {ended && " · terminé"}
                    </span>
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </nav>
  );
}
