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
import { ArrowLeftIcon, ChartIcon, CheckIcon, DocumentIcon } from "@/components/ui/icons";

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
  // Liste des conversations seulement s'il y en a plusieurs (sinon colonne inutile)
  const conversations = all.filter((m) => m.status === "accepted" || m.status === "ended");
  const showList = conversations.length > 1;
  const requestDate = new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "long", year: "numeric" }).format(
    new Date(mentorship.created_at),
  );
  const partnerSubtitle = [roleHere === "mentor" ? "Votre mentoré" : "Votre mentor", domainLabel]
    .filter(Boolean)
    .join(" · ");

  return (
    <>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-2">
        <Link
          href="/mentorships"
          className="group inline-flex items-center gap-3 text-2xl font-bold tracking-tight text-ink-900 transition-colors hover:text-brand-800"
        >
          <ArrowLeftIcon className="size-6 transition-transform group-hover:-translate-x-1" />
          Mes mentorats
        </Link>
        <div className="flex items-center gap-3">
          <span
            className="inline-flex items-center gap-2 rounded-full bg-brand-50 px-4 py-2 text-sm font-semibold text-brand-800 ring-1 ring-brand-200"
          >
            {mentorship.status === "accepted" ? (
              <span aria-hidden className="size-2 rounded-full bg-accent-400" />
            ) : (
              <span aria-hidden className="inline-flex size-5 items-center justify-center rounded-full bg-brand-700 text-white">
                <CheckIcon className="size-3" />
              </span>
            )}
            {mentorship.status === "accepted" ? "Mentorat actif" : "Mentorat terminé"}
          </span>
          {mentorship.status === "accepted" && <EndMentorshipButton mentorshipId={mentorship.id} />}
        </div>
      </div>

      {hasChat ? (
        // Ordinateur : [conversations si plusieurs] | discussion (pleine hauteur, fixe) | panneaux
        <div
          className={`grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_22rem] ${
            showList ? "xl:grid-cols-[16rem_minmax(0,1fr)_22rem]" : ""
          }`}
        >
          {showList && (
            <aside className="hidden xl:sticky xl:top-6 xl:block">
              <ConversationList mentorships={all} currentUserId={profile.id} activeId={mentorship.id} />
            </aside>
          )}

          <div className="min-w-0 lg:sticky lg:top-6 lg:h-[calc(100dvh-8.5rem)] lg:min-h-[30rem]">
            <Chat
              mentorshipId={mentorship.id}
              currentUserId={profile.id}
              names={names}
              initialMessages={messages}
              canWrite={mentorship.status === "accepted"}
              partner={{ name: partner.full_name, avatarUrl: partner.avatar_url, subtitle: partnerSubtitle }}
              me={{ avatarUrl: profile.avatar_url }}
            />
          </div>

          {/* Panneaux : à droite sur ordinateur, sous la discussion sur téléphone */}
          <div className="flex min-w-0 flex-col gap-4">
            {isEnded && testimonials && (
              <section className="rounded-3xl border border-brand-100 bg-brand-50/60 p-5">
                <div className="flex items-start gap-3">
                  <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-xl bg-white text-brand-700 ring-1 ring-brand-100">
                    <ChartIcon className="size-5" />
                  </span>
                  <div>
                    <p className="eyebrow">Restitution</p>
                    <h2 className="mt-0.5 text-lg font-bold">Bilan de fin de mentorat</h2>
                  </div>
                </div>
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
            {/* Demande initiale : repliée (nom et statut sont déjà en haut de page) */}
            <details className="group rounded-3xl border border-slate-200/80 bg-white p-5 shadow-card">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-sm font-semibold text-ink-900 [&::-webkit-details-marker]:hidden">
                <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-700">
                  <DocumentIcon className="size-5" />
                </span>
                <span className="flex-1">
                  Demande initiale
                  <span className="mt-0.5 block text-xs font-normal text-ink-500">
                    {requestDate}
                    {domainLabel ? ` · ${domainLabel}` : ""}
                  </span>
                </span>
                <span aria-hidden className="text-ink-500 transition-transform group-open:rotate-180">⌄</span>
              </summary>
              {mentorship.message ? (
                <blockquote className="mt-4 rounded-2xl border-l-4 border-brand-200 bg-slate-50 px-4 py-3 text-sm whitespace-pre-line text-ink-700">
                  {mentorship.message}
                </blockquote>
              ) : (
                <p className="mt-4 text-sm text-ink-500">Pas de message joint à la demande.</p>
              )}
            </details>
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
