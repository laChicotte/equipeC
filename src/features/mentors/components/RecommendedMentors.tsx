import Link from "next/link";
import { getAvailableMentors } from "../queries";
import { recommendMentors } from "../matching";
import { RatingStars } from "./RatingStars";
import { getProfileDomainIds } from "@/features/profiles/queries";
import { getMyMentorships } from "@/features/mentorship/queries";
import { Avatar } from "@/components/ui/Avatar";
import { Card } from "@/components/ui/Card";
import type { Profile } from "@/types/database";

/** « Mentors recommandés pour vous » (tableau de bord du mentoré). */
export async function RecommendedMentors({ profile }: { profile: Profile }) {
  const [domainIds, mentors, mentorships] = await Promise.all([
    getProfileDomainIds(profile.id),
    getAvailableMentors(),
    getMyMentorships(),
  ]);

  // On ne recommande pas un mentor avec qui une demande est déjà en cours
  const excluded = new Set(
    mentorships
      .filter((m) => m.status === "pending" || m.status === "accepted")
      .map((m) => m.mentor.id),
  );
  const candidates = mentors.filter((m) => !excluded.has(m.id));

  const recommendations = recommendMentors(
    {
      domainIds,
      menteeStatus: profile.mentee_status,
      text: [profile.goals_summary, profile.headline, profile.bio].filter(Boolean).join(" "),
    },
    candidates.map((m) => ({
      id: m.id,
      domains: m.domains,
      text: [m.headline, m.job_title, m.organization, m.bio].filter(Boolean).join(" "),
      yearsExperience: m.years_experience,
      rating: m.rating,
    })),
  );
  const byId = new Map(candidates.map((m) => [m.id, m]));

  return (
    <Card>
      <div className="mb-1 flex items-center gap-2">
        <h2 className="font-semibold">Mentors recommandés pour vous</h2>
        <span className="rounded-full bg-brand-50 px-2 py-0.5 text-xs font-medium text-brand-800">
          ✨ Sur mesure
        </span>
      </div>
      <p className="mb-4 text-xs text-zinc-500">
        Selon vos domaines, vos objectifs et votre situation.
      </p>

      {recommendations.length === 0 ? (
        <p className="text-sm text-zinc-600">
          Pas encore de recommandation.{" "}
          <Link href="/profile" className="font-medium text-brand-700 hover:underline">
            Précisez vos domaines et vos objectifs
          </Link>{" "}
          ou{" "}
          <Link href="/mentors" className="font-medium text-brand-700 hover:underline">
            parcourez tous les mentors
          </Link>
          .
        </p>
      ) : (
        <ul className="grid gap-3 lg:grid-cols-3">
          {recommendations.map((reco) => {
            const mentor = byId.get(reco.mentorId)!;
            return (
              <li key={reco.mentorId}>
                <Link
                  href={`/mentors/${mentor.id}`}
                  className="flex h-full flex-col gap-3 rounded-xl border border-zinc-200 p-4 transition hover:border-brand-600 hover:shadow-sm"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex min-w-0 items-center gap-2">
                      <Avatar name={mentor.full_name} size="sm" />
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold">{mentor.full_name}</p>
                        {mentor.job_title && (
                          <p className="truncate text-xs text-zinc-500">{mentor.job_title}</p>
                        )}
                      </div>
                    </div>
                    <span
                      className="shrink-0 rounded-full bg-brand-600 px-2 py-0.5 text-xs font-bold text-white"
                      title="Score de compatibilité"
                    >
                      {reco.score} %
                    </span>
                  </div>
                  <ul className="flex flex-col gap-1 text-xs text-zinc-600">
                    {reco.reasons.slice(0, 3).map((reason) => (
                      <li key={reason} className="flex gap-1.5">
                        <span aria-hidden className="text-brand-600">✓</span>
                        {reason}
                      </li>
                    ))}
                  </ul>
                  <div className="mt-auto">
                    <RatingStars rating={mentor.rating} />
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </Card>
  );
}
