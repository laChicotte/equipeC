import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getMentorById } from "@/features/mentors/queries";
import { RatingStars } from "@/features/mentors/components/RatingStars";
import { getCurrentProfile } from "@/features/auth/queries";
import { getActiveMentorshipWith } from "@/features/mentorship/queries";
import { RequestForm } from "@/features/mentorship/components/RequestForm";
import { Card } from "@/components/ui/Card";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";

export const metadata: Metadata = { title: "Fiche mentor · MentorConnect" };

export default async function MentorDetailPage({ params }: PageProps<"/mentors/[id]">) {
  const { id } = await params;
  const [mentor, viewer] = await Promise.all([getMentorById(id), getCurrentProfile()]);
  if (!mentor) notFound();
  const activeRequest =
    viewer?.role === "mentee" ? await getActiveMentorshipWith(mentor.id) : null;

  const role = [mentor.job_title, mentor.organization].filter(Boolean).join(" · ");
  const isOwnProfile = viewer?.id === mentor.id;

  return (
    <>
      <Link href="/mentors" className="mb-4 inline-block text-sm text-brand-700 hover:underline">
        ← Retour aux mentors
      </Link>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="grid gap-4 lg:col-span-2">
          <Card>
            <div className="flex flex-wrap items-start gap-4">
              <Avatar name={mentor.full_name} size="lg" />
              <div className="min-w-0 flex-1">
                <h1 className="text-2xl font-semibold">{mentor.full_name}</h1>
                {role && <p className="text-zinc-600">{role}</p>}
                <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-zinc-600">
                  <RatingStars rating={mentor.rating} />
                  {mentor.years_experience !== null && (
                    <span>{mentor.years_experience} ans d&apos;expérience</span>
                  )}
                  {mentor.city && <span>📍 {mentor.city}</span>}
                </div>
              </div>
            </div>
            {mentor.headline && <p className="mt-4 font-medium">{mentor.headline}</p>}
          </Card>

          <Card>
            <h2 className="mb-2 font-semibold">Parcours</h2>
            <p className="whitespace-pre-line text-sm text-zinc-700">
              {mentor.bio || "Ce mentor n'a pas encore rédigé sa présentation."}
            </p>
          </Card>
        </div>

        <div className="grid content-start gap-4">
          <Card>
            <h2 className="mb-3 font-semibold">Domaines d&apos;expertise</h2>
            <div className="flex flex-wrap gap-1.5">
              {mentor.domains.map((d) => (
                <Link key={d.id} href={`/mentors?domain=${d.slug}`}>
                  <Badge tone="brand">{d.name}</Badge>
                </Link>
              ))}
            </div>
          </Card>

          <Card>
            <h2 className="mb-1 font-semibold">Disponibilités</h2>
            <p className="text-sm text-zinc-700">{mentor.availability || "Non précisées"}</p>
            {!mentor.is_available && (
              <p className="mt-2 text-sm text-amber-700">
                N&apos;accepte pas de nouvelles demandes pour le moment.
              </p>
            )}
          </Card>

          {viewer?.role === "mentee" && !isOwnProfile && (
            <Card>
              {activeRequest ? (
                <>
                  <h2 className="mb-1 font-semibold">
                    {activeRequest.status === "pending" ? "Demande envoyée" : "Mentorat en cours"}
                  </h2>
                  <p className="mb-3 text-sm text-zinc-600">
                    {activeRequest.status === "pending"
                      ? "Votre demande attend la réponse du mentor."
                      : "Ce mentor vous accompagne déjà."}
                  </p>
                  <Link
                    href={activeRequest.status === "accepted" ? `/mentorships/${activeRequest.id}` : "/mentorships"}
                    className="text-sm font-medium text-brand-700 hover:underline"
                  >
                    Voir mes mentorats →
                  </Link>
                </>
              ) : mentor.is_available ? (
                <>
                  <h2 className="mb-3 font-semibold">Demander un mentorat</h2>
                  <RequestForm
                    mentorId={mentor.id}
                    mentorFirstName={mentor.full_name.split(" ")[0]}
                    domains={mentor.domains}
                  />
                </>
              ) : (
                <p className="text-sm text-zinc-600">Ce mentor n&apos;accepte pas de demande pour le moment.</p>
              )}
            </Card>
          )}
        </div>
      </div>
    </>
  );
}
