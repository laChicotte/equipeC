import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getCurrentProfile } from "@/features/auth/queries";
import { getMentorshipById, getMyMentorships } from "@/features/mentorship/queries";
import { MentorshipCard } from "@/features/mentorship/components/MentorshipCard";
import { EndMentorshipButton } from "@/features/mentorship/components/EndMentorshipButton";
import { getMessages } from "@/features/messaging/queries";
import { Chat } from "@/features/messaging/components/Chat";
import { ConversationList } from "@/features/messaging/components/ConversationList";
import { SessionsPanel } from "@/features/sessions/components/SessionsPanel";
import { GoalsPanel } from "@/features/goals/components/GoalsPanel";
import { getMentorshipTestimonials } from "@/features/impact/queries";
import { TestimonialForm } from "@/features/impact/components/TestimonialForm";
import { DOMAIN_SHORT_LABELS } from "@/features/profiles/labels";
import { ArrowLeftIcon } from "@/components/ui/icons";

export const metadata: Metadata = { title: "Espace de mentorat · MentorConnect" };

export default async function MentorshipPage({ params }: PageProps<"/mentorships/[id]">) {
  const { id } = await params;
  const [profile, mentorship, all] = await Promise.all([
    getCurrentProfile(),
    getMentorshipById(id),
    getMyMentorships(),
  ]);
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
  const domainLabel = mentorship.domain
    ? (DOMAIN_SHORT_LABELS[mentorship.domain.slug] ?? mentorship.domain.name)
    : null;
  const partnerSubtitle = [roleHere === "mentor" ? "Votre mentoré" : "Votre mentor", domainLabel]
    .filter(Boolean)
    .join(" · ");

  return (
    <>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-2">
        <Link
          href="/mentorships"
          className="group inline-flex items-center gap-2 text-sm font-semibold text-ink-500 transition-colors hover:text-ink-900"
        >
          <ArrowLeftIcon className="size-4 transition-transform group-hover:-translate-x-0.5" />
          Mes mentorats
        </Link>
        {mentorship.status === "accepted" && <EndMentorshipButton mentorshipId={mentorship.id} />}
      </div>

      {hasChat ? (
        // Ordinateur : conversations | discussion | séances et objectifs (très grand écran)
        <div className="grid gap-5 lg:grid-cols-[17rem_minmax(0,1fr)] 2xl:grid-cols-[17rem_minmax(0,1fr)_22rem]">
          <aside className="hidden lg:block">
            <div className="sticky top-6">
              <ConversationList mentorships={all} currentUserId={profile.id} activeId={mentorship.id} />
            </div>
          </aside>

          <div className="min-w-0">
            <Chat
              mentorshipId={mentorship.id}
              currentUserId={profile.id}
              names={names}
              initialMessages={messages}
              canWrite={mentorship.status === "accepted"}
              partner={{ name: partner.full_name, avatarUrl: partner.avatar_url, subtitle: partnerSubtitle }}
            />
          </div>

          {/* Panneaux : sous la discussion, à droite sur très grand écran */}
          <div className="grid content-start gap-5 md:grid-cols-2 lg:col-start-2 2xl:col-start-3 2xl:row-start-1 2xl:grid-cols-1">
            {isEnded && testimonials && (
              <section className="rounded-3xl border border-brand-100 bg-brand-50/60 p-5 md:col-span-2 2xl:col-span-1">
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
            <div className="md:col-span-2 2xl:col-span-1">
              <MentorshipCard mentorship={mentorship} viewerRole={roleHere} showOpenLink={false} />
            </div>
          </div>
        </div>
      ) : (
        <div className="mx-auto max-w-2xl">
          <MentorshipCard mentorship={mentorship} viewerRole={roleHere} showOpenLink={false} />
        </div>
      )}
    </>
  );
}
