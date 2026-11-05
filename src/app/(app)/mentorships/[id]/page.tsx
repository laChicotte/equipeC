import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getCurrentProfile } from "@/features/auth/queries";
import { getMentorshipById } from "@/features/mentorship/queries";
import { MentorshipCard } from "@/features/mentorship/components/MentorshipCard";
import { EndMentorshipButton } from "@/features/mentorship/components/EndMentorshipButton";
import { getMessages } from "@/features/messaging/queries";
import { Chat } from "@/features/messaging/components/Chat";
import { SessionsPanel } from "@/features/sessions/components/SessionsPanel";
import { GoalsPanel } from "@/features/goals/components/GoalsPanel";
import { getMentorshipTestimonials } from "@/features/impact/queries";
import { TestimonialForm } from "@/features/impact/components/TestimonialForm";

export const metadata: Metadata = { title: "Espace de mentorat · MentorConnect" };

export default async function MentorshipPage({ params }: PageProps<"/mentorships/[id]">) {
  const { id } = await params;
  const [profile, mentorship] = await Promise.all([getCurrentProfile(), getMentorshipById(id)]);
  if (!profile) redirect("/dashboard");
  // Introuvable OU pas participant (RLS ne renvoie rien) : même réponse 404
  if (!mentorship) notFound();

  // La conversation existe pour un mentorat actif (écriture) ou terminé (lecture seule)
  const hasChat = mentorship.status === "accepted" || mentorship.status === "ended";
  const isEnded = mentorship.status === "ended";
  const [messages, testimonials] = await Promise.all([
    hasChat ? getMessages(mentorship.id) : Promise.resolve([]),
    isEnded ? getMentorshipTestimonials(mentorship.id) : Promise.resolve(null),
  ]);
  const partner = profile.id === mentorship.mentor.id ? mentorship.mentee : mentorship.mentor;
  // Double rôle : le rôle tenu dans CE mentorat (pas le mode actif)
  const roleHere = profile.id === mentorship.mentor.id ? "mentor" : "mentee";
  const names = {
    [mentorship.mentor.id]: mentorship.mentor.full_name,
    [mentorship.mentee.id]: mentorship.mentee.full_name,
  };

  return (
    <>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <Link href="/mentorships" className="text-sm text-brand-700 hover:underline">
          ← Mes mentorats
        </Link>
        {mentorship.status === "accepted" && <EndMentorshipButton mentorshipId={mentorship.id} />}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="grid content-start gap-4 lg:col-span-2">
          {hasChat ? (
            <Chat
              mentorshipId={mentorship.id}
              currentUserId={profile.id}
              names={names}
              initialMessages={messages}
              canWrite={mentorship.status === "accepted"}
            />
          ) : (
            <MentorshipCard mentorship={mentorship} viewerRole={roleHere} />
          )}
        </div>

        {hasChat && (
          <div className="grid content-start gap-4">
            {isEnded && testimonials && (
              <section className="rounded-3xl border border-brand-100 bg-brand-50/60 p-5">
                <p className="eyebrow">Restitution</p>
                <h2 className="mt-2 text-lg font-bold">Bilan de fin de mentorat</h2>
                <p className="mt-1 mb-4 text-sm text-ink-500">
                  Racontez ce que cet accompagnement a changé : votre bilan aide les futurs participants.
                </p>
                <TestimonialForm
                  mentorshipId={mentorship.id}
                  isMentor={roleHere === "mentor"}
                  initial={testimonials.mine}
                />
                {testimonials.other && (
                  <blockquote className="mt-5 rounded-2xl bg-white p-4 text-sm text-ink-700">
                    <p className="text-xs font-semibold text-ink-500">Le bilan de {partner.full_name.split(" ")[0]}</p>
                    <p className="mt-1 italic">« {testimonials.other.content} »</p>
                  </blockquote>
                )}
              </section>
            )}
            <SessionsPanel
              mentorshipId={mentorship.id}
              isActive={mentorship.status === "accepted"}
              currentUserId={profile.id}
              names={names}
            />
            <GoalsPanel
              mentorshipId={mentorship.id}
              canEdit={mentorship.status === "accepted"}
              domainSlug={mentorship.domain?.slug}
            />
            <MentorshipCard mentorship={mentorship} viewerRole={roleHere} />
          </div>
        )}
      </div>
    </>
  );
}
