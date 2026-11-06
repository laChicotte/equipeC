import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isCurrentUserAdmin } from "@/features/admin/access";
import { getAdminOverview } from "@/features/admin/queries";
import { hasAdminKey } from "@/lib/supabase/admin";
import { MENTORSHIP_STATUS_LABELS, ROLE_LABELS } from "@/features/profiles/labels";
import { PageHeader } from "@/components/shared/PageHeader";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import type { MentorshipStatus } from "@/types/database";

export const metadata: Metadata = { title: "Administration · MentorConnect" };

const dateFmt = new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "short", year: "numeric" });
const dateTimeFmt = new Intl.DateTimeFormat("fr-FR", { dateStyle: "medium", timeStyle: "short", timeZone: "Africa/Conakry" });
const fmt = (iso: string | null) => (iso ? dateFmt.format(new Date(iso)) : "—");

const STATUS_TONE: Record<MentorshipStatus, "brand" | "accent" | "neutral"> = {
  pending: "accent",
  accepted: "brand",
  declined: "neutral",
  ended: "neutral",
  cancelled: "neutral",
};

function Stat({ value, label }: { value: number; label: string }) {
  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-card">
      <p className="text-2xl font-bold tracking-tight text-ink-900">{value}</p>
      <p className="mt-0.5 text-sm text-ink-500">{label}</p>
    </div>
  );
}

/** Tableau défilant horizontalement dans sa carte (jamais la page) sur petit écran. */
function Table({ head, children }: { head: string[]; children: React.ReactNode }) {
  return (
    <div className="-mx-6 overflow-x-auto px-6 sm:-mx-7 sm:px-7">
      <table className="w-full min-w-[640px] text-left text-sm">
        <thead>
          <tr className="border-b border-slate-200 text-xs tracking-wide text-ink-500 uppercase">
            {head.map((h) => (
              <th key={h} className="py-2.5 pr-4 font-semibold">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">{children}</tbody>
      </table>
    </div>
  );
}

/**
 * Espace administrateur (lecture seule) : inscrits, demandes et mentorats, séances.
 * Réservé aux adresses de ADMIN_EMAILS ; pour tout autre compte, la page n'existe pas.
 */
export default async function AdminPage() {
  if (!(await isCurrentUserAdmin())) notFound();

  if (!hasAdminKey()) {
    return (
      <>
        <PageHeader eyebrow="Administration" title="Espace administrateur" />
        <Card>
          <p className="text-ink-700">
            La clé serveur <code className="rounded bg-slate-100 px-1.5 py-0.5 text-sm">SUPABASE_SECRET_KEY</code> n&apos;est
            pas configurée : elle est nécessaire pour lire les données de toute la plateforme.
          </p>
        </Card>
      </>
    );
  }

  const { users, mentorships, sessions, totals, errors } = await getAdminOverview();

  return (
    <>
      <PageHeader
        eyebrow="Administration"
        title="Espace administrateur"
        description="Vue d'ensemble de la plateforme, en lecture seule : inscrits, demandes et mentorats, séances à venir."
      />

      {errors.length > 0 && (
        <p role="alert" className="mb-6 rounded-2xl bg-red-50 p-4 text-sm text-red-700 ring-1 ring-red-200">
          Certaines données n&apos;ont pas pu être chargées : {errors.join(" · ")}
        </p>
      )}

      <section aria-label="Chiffres clés" className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <Stat value={totals.users} label="Inscrits" />
        <Stat value={totals.mentors} label="Profils mentor complets" />
        <Stat value={totals.mentees} label="Profils mentoré complets" />
        <Stat value={totals.incomplete} label="Profils incomplets" />
        <Stat value={totals.pending} label="Demandes en attente" />
        <Stat value={totals.active} label="Mentorats actifs" />
        <Stat value={totals.sessions} label="Séances planifiées (total)" />
        <Stat value={totals.reviews} label="Évaluations de séances" />
        <Stat value={totals.messages} label="Messages échangés" />
        <Stat value={totals.resources} label="Ressources partagées" />
        <Stat value={totals.workshops} label="Ateliers" />
        <Stat value={totals.opportunities} label="Opportunités" />
      </section>

      <div className="flex flex-col gap-6">
        <Card>
          <h2 className="mb-4 text-xl font-bold">Inscrits ({users.length})</h2>
          <Table head={["Nom", "E-mail", "Mode actif", "Profils complets", "Inscription", "Dernière connexion"]}>
            {users.map((u) => (
              <tr key={u.id}>
                <td className="py-2.5 pr-4 font-medium text-ink-900">{u.fullName}</td>
                <td className="py-2.5 pr-4 text-ink-700">{u.email ?? "—"}</td>
                <td className="py-2.5 pr-4">{ROLE_LABELS[u.role]}</td>
                <td className="py-2.5 pr-4">
                  <span className="flex flex-wrap gap-1">
                    {u.isMentor && <Badge tone="brand">Mentor</Badge>}
                    {u.isMentee && <Badge tone="brand">Mentoré</Badge>}
                    {!u.isMentor && !u.isMentee && <Badge tone="accent">Incomplet</Badge>}
                  </span>
                </td>
                <td className="py-2.5 pr-4 text-ink-700">{fmt(u.createdAt)}</td>
                <td className="py-2.5 pr-4 text-ink-700">{fmt(u.lastSignInAt)}</td>
              </tr>
            ))}
          </Table>
        </Card>

        <Card>
          <h2 className="mb-4 text-xl font-bold">Demandes et mentorats ({mentorships.length})</h2>
          {mentorships.length === 0 ? (
            <p className="text-ink-500">Aucune demande pour le moment.</p>
          ) : (
            <Table head={["Mentoré", "Mentor", "Domaine", "Statut", "Demande du"]}>
              {mentorships.map((m) => (
                <tr key={m.id}>
                  <td className="py-2.5 pr-4 font-medium text-ink-900">{m.mentee}</td>
                  <td className="py-2.5 pr-4">{m.mentor}</td>
                  <td className="py-2.5 pr-4 text-ink-700">{m.domain ?? "—"}</td>
                  <td className="py-2.5 pr-4">
                    <Badge tone={STATUS_TONE[m.status]}>{MENTORSHIP_STATUS_LABELS[m.status]}</Badge>
                  </td>
                  <td className="py-2.5 pr-4 text-ink-700">{fmt(m.createdAt)}</td>
                </tr>
              ))}
            </Table>
          )}
        </Card>

        <Card>
          <h2 className="mb-4 text-xl font-bold">Séances à venir ({sessions.length})</h2>
          {sessions.length === 0 ? (
            <p className="text-ink-500">Aucune séance planifiée.</p>
          ) : (
            <Table head={["Date", "Sujet", "Mentor", "Mentoré"]}>
              {sessions.map((s) => (
                <tr key={s.id}>
                  <td className="py-2.5 pr-4 whitespace-nowrap text-ink-900">{dateTimeFmt.format(new Date(s.scheduledAt))}</td>
                  <td className="py-2.5 pr-4">{s.topic || "Séance de mentorat"}</td>
                  <td className="py-2.5 pr-4">{s.mentor}</td>
                  <td className="py-2.5 pr-4">{s.mentee}</td>
                </tr>
              ))}
            </Table>
          )}
        </Card>
      </div>
    </>
  );
}
