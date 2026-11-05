import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getMenteeInput,
  getMentorById,
  getMentorReviews,
  toMentorInput,
} from "@/features/mentors/queries";
import { formatShortDate } from "@/lib/datetime";
import { scoreMentor } from "@/features/mentors/matching";
import { getCurrentProfile } from "@/features/auth/queries";
import { getActiveMentorshipWith } from "@/features/mentorship/queries";
import { RequestForm } from "@/features/mentorship/components/RequestForm";
import { CAMPUS_FRANCE_NOTICE, DOMAIN_SHORT_LABELS } from "@/features/profiles/labels";
import { ButtonLink } from "@/components/ui/Button";
import { Avatar } from "@/components/ui/Avatar";

export const metadata: Metadata = { title: "Profil du mentor · MentorConnect" };

const sparkle = (
  <svg aria-hidden viewBox="0 0 24 24" className="size-4" fill="currentColor">
    <path d="M12 3c.6 4.2 2.8 6.4 7 7-4.2.6-6.4 2.8-7 7-.6-4.2-2.8-6.4-7-7 4.2-.6 6.4-2.8 7-7ZM19 15c.3 1.9 1.1 2.7 3 3-1.9.3-2.7 1.1-3 3-.3-1.9-1.1-2.7-3-3 1.9-.3 2.7-1.1 3-3Z" />
  </svg>
);
const clock = (
  <svg aria-hidden viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth={1.8}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5l3 2" strokeLinecap="round" />
  </svg>
);

/** Carte d'action (droite) : bloc gris arrondi de la maquette. */
function ActionPanel({ eyebrow, title, children }: { eyebrow: string; title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-3xl bg-background p-6 sm:p-7">
      <p className="text-[11px] font-bold tracking-[0.1em] text-brand-700 uppercase">{eyebrow}</p>
      <p className="mt-2 mb-5 text-xl font-bold">{title}</p>
      {children}
    </div>
  );
}

export default async function MentorDetailPage({ params }: PageProps<"/mentors/[id]">) {
  const { id } = await params;
  const [mentor, viewer] = await Promise.all([getMentorById(id), getCurrentProfile()]);
  if (!mentor) notFound();

  // Double rôle : en mode mentoré, on peut voir sa propre fiche de mentor
  const isSelf = viewer?.id === mentor.id;
  const isMentee = viewer?.role === "mentee" && !isSelf;
  const [activeRequest, menteeInput, reviews] = await Promise.all([
    isMentee ? getActiveMentorshipWith(mentor.id) : Promise.resolve(null),
    getMenteeInput(viewer),
    getMentorReviews(mentor.id),
  ]);
  const isCampusFrance = mentor.domains.some((d) => d.slug === "campus-france");
  const compatibility = menteeInput ? scoreMentor(menteeInput, toMentorInput(mentor)) : null;

  const subtitle = [mentor.job_title, mentor.organization].filter(Boolean).join(" · ");
  const stats = [
    mentor.rating
      ? `${mentor.rating.avg.toLocaleString("fr-FR")} · ${mentor.rating.count} avis`
      : "Nouveau mentor",
    mentor.years_experience !== null ? `${mentor.years_experience} ans d'expérience` : null,
    mentor.city,
  ].filter(Boolean);

  return (
    <article className="mx-auto max-w-5xl overflow-hidden rounded-[2rem] bg-white shadow-[0_20px_60px_-20px_rgba(23,43,69,0.25)]">
      {/* En-tête gris */}
      <header className="relative flex flex-col gap-6 bg-background p-6 sm:flex-row sm:items-center sm:p-12">
        <Link
          href="/mentors"
          aria-label="Fermer et revenir aux mentors"
          className="absolute top-5 right-5 inline-flex size-12 items-center justify-center rounded-full bg-white text-ink-900 shadow-sm transition-colors hover:bg-zinc-100 sm:top-6 sm:right-6"
        >
          <svg aria-hidden viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth={2}>
            <path d="M6 6l12 12M18 6 6 18" strokeLinecap="round" />
          </svg>
        </Link>

        <Avatar
          name={mentor.full_name}
          src={mentor.avatar_url}
          size="2xl"
          rounded="3xl"
          className="bg-gradient-to-br from-brand-100 to-brand-200 font-extrabold"
        />
        <div className="min-w-0 pr-12">
          {compatibility && compatibility.score >= 20 && (
            <p className="inline-flex items-center gap-1.5 text-sm font-bold text-brand-700" title={compatibility.reasons.join(" · ")}>
              {sparkle} {compatibility.score}% compatible
            </p>
          )}
          <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">{mentor.full_name}</h1>
          {subtitle && <p className="mt-2 text-lg text-ink-500 sm:text-xl">{subtitle}</p>}
          <p className="mt-4 inline-flex flex-wrap items-center gap-x-2 text-ink-700">
            <span aria-hidden className="text-lg text-accent-400">★</span>
            {stats.join(" · ")}
          </p>
        </div>
      </header>

      <div className="grid gap-10 p-6 sm:p-12 lg:grid-cols-[1.3fr_1fr]">
        {/* À propos + expertises */}
        <div>
          <h2 className="text-xl font-bold">À propos</h2>
          {mentor.headline && <p className="mt-2 font-medium text-ink-900">{mentor.headline}</p>}
          <p className="mt-2 leading-relaxed whitespace-pre-line text-ink-500">
            {mentor.bio || "Ce mentor n'a pas encore rédigé sa présentation."}
          </p>

          <h2 className="mt-8 text-xl font-bold">Expertises</h2>
          <div className="mt-4 flex flex-wrap gap-3">
            {mentor.domains.map((d) => (
              <Link
                key={d.id}
                href={`/mentors?domain=${d.slug}`}
                title={d.name}
                className="rounded-full border border-zinc-200 px-5 py-2.5 text-sm text-ink-700 transition-colors hover:border-ink-900"
              >
                {DOMAIN_SHORT_LABELS[d.slug] ?? d.name}
              </Link>
            ))}
          </div>
          {mentor.skills.length > 0 && (
            <>
              <h3 className="mt-6 text-sm font-semibold text-ink-900">Compétences précises</h3>
              <ul className="mt-3 flex flex-wrap gap-2">
                {mentor.skills.map((skill) => (
                  <li key={skill}>
                    <Link
                      href={`/mentors?q=${encodeURIComponent(skill)}`}
                      className="inline-block rounded-full bg-brand-50 px-3.5 py-1.5 text-sm font-medium text-brand-800 ring-1 ring-brand-100 ring-inset hover:bg-brand-100"
                    >
                      {skill}
                    </Link>
                  </li>
                ))}
              </ul>
            </>
          )}

          {/* Engagements de tout mentor (cahier des charges : profil des mentors) */}
          <div className="mt-8 rounded-2xl border border-zinc-100 p-5">
            <h2 className="text-base font-bold">Les engagements de chaque mentor</h2>
            <ul className="mt-3 grid gap-2 text-sm text-ink-700 sm:grid-cols-2">
              {[
                "Écoute, bienveillance et professionnalisme",
                "Partage d'expérience et de connaissances",
                "Disponibilités réalistes, séances honorées",
                "Vous aider à décider par vous-même, sans faire à votre place",
              ].map((item) => (
                <li key={item} className="flex gap-2">
                  <span aria-hidden className="text-brand-600">✓</span>
                  {item}
                </li>
              ))}
            </ul>
            <Link href="/charte" className="mt-3 inline-block text-xs font-semibold text-brand-700 hover:underline">
              Lire la charte du mentorat →
            </Link>
          </div>

          <h2 className="mt-8 text-xl font-bold">Avis des mentorés</h2>
          {reviews.length === 0 ? (
            <p className="mt-2 text-sm text-ink-500">Pas encore d&apos;avis : soyez le premier à être accompagné !</p>
          ) : (
            <ul className="mt-4 flex flex-col gap-3">
              {reviews.map((r, i) => (
                <li key={i} className="rounded-2xl border border-zinc-100 p-4">
                  <div className="flex items-center justify-between gap-2 text-sm">
                    <span className="font-semibold">{r.reviewer_first_name}</span>
                    <span aria-label={`${r.rating} sur 5`} className="text-accent-400">
                      {"★".repeat(r.rating)}
                      <span className="text-zinc-200">{"★".repeat(5 - r.rating)}</span>
                    </span>
                  </div>
                  {r.comment && <p className="mt-1 text-sm text-ink-500">« {r.comment} »</p>}
                  <p className="mt-1 text-xs text-ink-500/70">{formatShortDate(r.created_at)}</p>
                </li>
              ))}
            </ul>
          )}

          {isCampusFrance && (
            <p className="mt-6 rounded-2xl bg-amber-50 p-4 text-xs leading-relaxed text-amber-900 ring-1 ring-amber-200">
              ℹ️ {CAMPUS_FRANCE_NOTICE}
            </p>
          )}

          {compatibility && compatibility.reasons.length > 0 && (
            <div className="mt-8 rounded-2xl bg-brand-50 p-5">
              <p className="mb-2 text-sm font-bold text-brand-800">Pourquoi ce mentor pour vous ?</p>
              <ul className="space-y-1 text-sm text-ink-700">
                {compatibility.reasons.map((r) => (
                  <li key={r}>✓ {r}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Carte d'action (droite) */}
        <aside className="content-start">
          {isMentee && activeRequest?.status === "accepted" ? (
            <ActionPanel eyebrow="Mentorat en cours" title="Planifiez votre prochaine séance">
              <ButtonLink href={`/mentorships/${activeRequest.id}`} variant="dark" className="w-full py-4 text-base">
                Ouvrir l&apos;espace de mentorat
              </ButtonLink>
              <p className="mt-3 flex items-center justify-center gap-2 text-xs text-ink-500">
                {clock} Chat, séances en visio et objectifs
              </p>
            </ActionPanel>
          ) : isMentee && activeRequest?.status === "pending" ? (
            <ActionPanel eyebrow="Demande envoyée" title="En attente de réponse">
              <p className="text-sm text-ink-500">
                {mentor.full_name.split(" ")[0]} va examiner votre demande. Vous serez prévenu(e) dans
                « Mentorat ».
              </p>
              <ButtonLink href="/mentorships" variant="secondary" className="mt-5 w-full">
                Voir mes demandes
              </ButtonLink>
            </ActionPanel>
          ) : isMentee && mentor.is_available ? (
            <ActionPanel eyebrow="Disponibilités" title={mentor.availability || "À convenir ensemble"}>
              <RequestForm
                mentorId={mentor.id}
                mentorFirstName={mentor.full_name.split(" ")[0]}
                domains={mentor.domains.map((d) => ({ ...d, short: DOMAIN_SHORT_LABELS[d.slug] }))}
              />
              <p className="mt-3 flex items-center justify-center gap-2 text-center text-xs text-ink-500">
                {clock} Les séances se planifient ensemble après acceptation
              </p>
            </ActionPanel>
          ) : (
            <ActionPanel eyebrow="Disponibilités" title={mentor.availability || "Non précisées"}>
              <p className="text-sm text-ink-500">
                {!mentor.is_available
                  ? "Ce mentor n'accepte pas de nouvelles demandes pour le moment."
                  : viewer?.id === mentor.id
                    ? "C'est votre profil public, tel que les mentorés le voient."
                    : "Seuls les mentorés peuvent envoyer une demande de mentorat."}
              </p>
            </ActionPanel>
          )}
        </aside>
      </div>
    </article>
  );
}
