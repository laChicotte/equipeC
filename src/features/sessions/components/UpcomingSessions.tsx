import Link from "next/link";
import { getUpcomingSessions } from "../queries";
import { JoinLink } from "./SessionItem";
import { Card } from "@/components/ui/Card";
import { formatDateTime } from "@/lib/datetime";
import type { UserRole } from "@/types/database";

/** Prochaines séances, tous mentorats confondus (tableau de bord). */
export async function UpcomingSessions({ viewerRole }: { viewerRole: UserRole }) {
  const sessions = await getUpcomingSessions();

  return (
    <Card>
      <h2 className="mb-3 font-semibold">Prochaines séances</h2>
      {sessions.length === 0 ? (
        <p className="text-sm text-zinc-600">
          Aucune séance prévue. Planifiez-en une depuis l&apos;espace d&apos;un mentorat actif.
        </p>
      ) : (
        <ul className="flex flex-col divide-y divide-zinc-100">
          {sessions.map((s) => {
            const other =
              viewerRole === "mentor" ? s.mentorship.mentee.full_name : s.mentorship.mentor.full_name;
            return (
              <li key={s.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                <div>
                  <p className="text-sm font-medium first-letter:uppercase">
                    {formatDateTime(s.scheduled_at)}
                  </p>
                  <p className="text-xs text-zinc-500">
                    avec{" "}
                    <Link
                      href={`/mentorships/${s.mentorship.id}`}
                      className="font-medium text-brand-700 hover:underline"
                    >
                      {other}
                    </Link>
                    {s.topic && <> · {s.topic}</>}
                  </p>
                </div>
                <JoinLink session={s} />
              </li>
            );
          })}
        </ul>
      )}
    </Card>
  );
}
