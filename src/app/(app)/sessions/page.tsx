import type { Metadata } from "next";
import { getCurrentProfile } from "@/features/auth/queries";
import { getAllMySessions } from "@/features/sessions/queries";
import { SessionRow } from "@/features/sessions/components/NextSessionCard";
import { PageHeader } from "@/components/shared/PageHeader";
import { Card } from "@/components/ui/Card";
import { ButtonLink } from "@/components/ui/Button";

export const metadata: Metadata = { title: "Rendez-vous · MentorConnect" };

/** Tous les rendez-vous (séances), à venir puis passés. */
export default async function SessionsPage() {
  const [profile, sessions] = await Promise.all([getCurrentProfile(), getAllMySessions()]);
  const role = profile?.role ?? "mentee";
  const upcoming = sessions.filter((s) => s.phase === "upcoming" || s.phase === "live");
  const past = sessions.filter((s) => s.phase === "past").reverse();
  const cancelled = sessions.filter((s) => s.phase === "cancelled").length;

  return (
    <>
      <PageHeader
        eyebrow="Agenda"
        title="Rendez-vous"
        description="Vos séances de mentorat en visioconférence."
        actions={<ButtonLink href="/mentorships">Planifier une séance</ButtonLink>}
      />

      <section className="mb-10">
        <p className="eyebrow mb-4">À venir ({upcoming.length})</p>
        {upcoming.length === 0 ? (
          <Card className="text-ink-500">
            Aucune séance prévue. Les séances se planifient dans l&apos;espace d&apos;un mentorat actif.
          </Card>
        ) : (
          <Card className="divide-y divide-zinc-100 py-2 sm:py-2">
            {upcoming.map((s) => (
              <div key={s.id} className="py-5">
                <SessionRow session={s} viewerRole={role} />
              </div>
            ))}
          </Card>
        )}
      </section>

      {past.length > 0 && (
        <section>
          <p className="eyebrow mb-4">Passées ({past.length})</p>
          <Card className="divide-y divide-zinc-100 py-2 opacity-90 sm:py-2">
            {past.map((s) => (
              <div key={s.id} className="py-5">
                <SessionRow session={s} viewerRole={role} />
              </div>
            ))}
          </Card>
          {cancelled > 0 && (
            <p className="mt-3 text-sm text-ink-500">
              {cancelled} séance{cancelled > 1 ? "s" : ""} annulée{cancelled > 1 ? "s" : ""} non affichée
              {cancelled > 1 ? "s" : ""}.
            </p>
          )}
        </section>
      )}
    </>
  );
}
