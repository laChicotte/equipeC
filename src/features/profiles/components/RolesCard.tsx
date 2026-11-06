import { switchRole } from "../actions";
import { MIN_MENTOR_YEARS } from "../constants";
import type { Profile, UserRole } from "@/types/database";

const ROLES: { role: UserRole; title: string; icon: string; pitch: string }[] = [
  {
    role: "mentor",
    title: "Mentor",
    icon: "🧑‍🏫",
    pitch: `Accompagnez des jeunes dans votre domaine (${MIN_MENTOR_YEARS} ans d'expérience minimum).`,
  },
  {
    role: "mentee",
    title: "Mentoré(e)",
    icon: "🌱",
    pitch: "Faites-vous accompagner dans un autre domaine que le vôtre.",
  },
];

/**
 * « Mes rôles » (migration 0007) : une même personne, avec la même adresse
 * e-mail, peut être mentor dans son domaine ET mentorée dans un autre.
 * Chaque mode a son propre profil, ses domaines, ses mentorats et son agenda.
 */
export function RolesCard({ profile }: { profile: Profile }) {
  return (
    <section className="mb-6 rounded-3xl border border-slate-100 bg-white p-6 shadow-[0_1px_3px_rgba(23,43,69,0.04)] sm:p-8">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-lg font-bold">Mes rôles</h2>
        <p className="text-sm text-ink-500">Un seul compte, deux façons de participer.</p>
      </div>
      <ul className="mt-4 grid gap-3 sm:grid-cols-2">
        {ROLES.map(({ role, title, icon, pitch }) => {
          const active = profile.role === role;
          const ready = role === "mentor" ? profile.is_mentor : profile.is_mentee;
          return (
            <li
              key={role}
              className={`flex flex-col gap-3 rounded-2xl p-5 ${active ? "bg-ink-900 text-white" : "bg-background"}`}
            >
              <div className="flex items-center justify-between gap-2">
                <p className="flex items-center gap-2 font-bold">
                  <span aria-hidden className="text-xl">{icon}</span> {title}
                </p>
                <span
                  className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                    active ? "bg-brand-700 text-white" : ready ? "bg-brand-50 text-brand-800" : "bg-slate-200 text-ink-500"
                  }`}
                >
                  {active ? (ready ? "Mode actif" : "Mode actif · à compléter") : ready ? "Profil complet" : "Non activé"}
                </span>
              </div>
              <p className={`text-sm ${active ? "text-white/75" : "text-ink-500"}`}>{pitch}</p>
              {!active && (
                <form action={switchRole} className="mt-auto">
                  <input type="hidden" name="role" value={role} />
                  <button className="w-full rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-ink-900 ring-1 ring-slate-200 transition-colors hover:ring-ink-900">
                    {ready ? `Passer en mode ${title.toLowerCase()}` : `Devenir aussi ${title.toLowerCase()} →`}
                  </button>
                </form>
              )}
            </li>
          );
        })}
      </ul>
      <p className="mt-4 text-xs text-ink-500">
        Chaque mode a ses propres domaines, mentorats et rendez-vous. Le formulaire ci-dessous modifie le profil du mode actif.
      </p>
    </section>
  );
}
