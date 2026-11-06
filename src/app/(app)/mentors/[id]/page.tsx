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
import { ArrowLeftIcon, CheckIcon, SparkleIcon, StarIcon } from "@/components/ui/icons";

export const metadata: Metadata = { title: "Profil du mentor · MentorConnect" };

const clock = (
  <svg aria-hidden viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth={1.8}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5l3 2" strokeLinecap="round" />
  </svg>
);

/** Carte d'action (droite) : bloc gris arrondi de la maquette. */
function ActionPanel({ eyebrow, title, children }: { eyebrow: string; title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-3xl border border-slate-200/70 bg-white p-6 shadow-card sm:p-7">
      <p className="text-[11px] font-bold tracking-[0.1em] text-brand-600 uppercase">{eyebrow}</p>
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
  ].filter(Boolean) as string[];
  // Bouton « Demander » visible en permanence sur mobile (barre fixe en bas)
  const canRequest = isMentee && !activeRequest && mentor.is_available;
  const showScore = compatibility && compatibility.score >= 20;

  return (
    <article className={`mx-auto max-w-6xl ${canRequest ? "pb-24 lg:pb-0" : ""}`}>
      <Link
        href="/mentors"
        className="group mb-5 inline-flex items-center gap-2 text-sm font-semibold text-ink-500 transition-colors hover:text-ink-900"
      >
        <ArrowLeftIcon className="size-4 transition-transform group-hover:-translate-x-0.5" />
        Tous les mentors
      </Link>

      {/* En-tête : bandeau bleu nuit, halo émeraude */}
      <header className="relative overflow-hidden rounded-[2rem] bg-ink-950 p-6 text-white sm:p-10">
        <div aria-hidden className="absolute -top-24 -right-16 size-80 rounded-full bg-brand-500/30 blur-[90px]" />
        <div aria-hidden className="absolute -bottom-32 left-10 size-72 rounded-full bg-accent-400/15 blur-[90px]" />
        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-6">
          <Avatar
            name={mentor.full_name}
            src={mentor.avatar_url}
            size="profile"
            rounded="3xl"
            className="bg-gradient-to-br from-brand-400 to-brand-600 font-extrabold text-white ring-4 ring-white/10"
          />
          <div className="min-w-0 flex-1">
            <p className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-white/80">
              <span aria-hidden className={`size-2 rounded-full ${mentor.is_available ? "bg-accent-400" : "bg-slate-400"}`} />
              {mentor.is_available ? "Accepte de nouveaux mentorés" : "Complet pour le moment"}
            </p>
            <h1 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl">{mentor.full_name}</h1>
            {subtitle && <p className="mt-1.5 text-lg text-white/70">{subtitle}</p>}
            <ul className="mt-4 flex flex-wrap gap-2 text-sm">
              {stats.map((stat, i) => (
                <li key={stat} className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-white/85">
                  {i === 0 && <StarIcon className="size-3.5 text-amber-400" />}
                  {stat}
                </li>
              ))}
            </ul>
          </div>

          {showScore && (
            <div className="w-full shrink-0 rounded-2xl bg-white/10 p-4 backdrop-blur sm:w-56" title={compatibility.reasons.join(" · ")}>
              <p className="flex items-center justify-between text-sm font-semibold">
                <span className="inline-flex items-center gap-1.5 text-white/80">
                  <SparkleIcon className="size-4 text-accent-400" /> Compatibilité
                </span>
                <span className="text-xl font-extrabold">{compatibility.score}%</span>
              </p>
              <div
                role="progressbar"
                aria-label="Compatibilité"
                aria-valuenow={compatibility.score}
                aria-valuemin={0}
                aria-valuemax={100}
                className="mt-3 h-2 overflow-hidden rounded-full bg-white/15"
              >
                <div
                  className="h-full rounded-full bg-gradient-to-r from-brand-400 to-accent-300"
                  style={{ width: `${Math.min(compatibility.score, 100)}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </header>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_360px] lg:items-start">
        <div className="rounded-[2rem] border border-slate-200/70 bg-white p-6 shadow-card sm:p-10">
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
                className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-ink-700 transition-colors hover:border-brand-500 hover:text-brand-700"
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
                      className="inline-block rounded-full bg-brand-50 px-3.5 py-1.5 text-sm font-medium text-brand-700 ring-1 ring-brand-100 ring-inset transition-colors hover:bg-brand-100"
                    >
                      {skill}
                    </Link>
                  </li>
                ))}
              </ul>
            </>
          )}

          {/* Engagements de tout mentor (cahier des charges : profil des mentors) */}
          <div className="mt-8 rounded-2xl bg-slate-50 p-5 ring-1 ring-slate-200/70">
            <h2 className="text-base font-bold">Les engagements de chaque mentor</h2>
            <ul className="mt-3 grid gap-2 text-sm text-ink-700 sm:grid-cols-2">
              {[
                "Écoute, bienveillance et professionnalisme",
                "Partage d'expérience et de connaissances",
                "Disponibilités réalistes, séances honorées",
                "Vous aider à décider par vous-même, sans faire à votre place",
              ].map((item) => (
                <li key={item} className="flex gap-2">
                  <CheckIcon className="mt-0.5 size-4 shrink-0 text-brand-500" />
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
                <li key={i} className="rounded-2xl border border-slate-200/70 p-4">
                  <div className="flex items-center justify-between gap-2 text-sm">
                    <span className="font-semibold">{r.reviewer_first_name}</span>
                    <span aria-label={`${r.rating} sur 5`} className="text-amber-400">
                      {"★".repeat(r.rating)}
                      <span className="text-slate-200">{"★".repeat(5 - r.rating)}</span>
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
            <div className="mt-8 rounded-2xl bg-brand-50 p-5 ring-1 ring-brand-100">
              <p className="mb-2 inline-flex items-center gap-1.5 text-sm font-bold text-brand-700">
                <SparkleIcon className="size-4 text-brand-500" /> Pourquoi ce mentor pour vous ?
              </p>
              <ul className="space-y-1.5 text-sm text-ink-700">
                {compatibility.reasons.map((r) => (
                  <li key={r} className="flex gap-2">
                    <CheckIcon className="mt-0.5 size-4 shrink-0 text-brand-500" /> {r}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        </div>

        {/* Carte d'action (droite) */}
        <aside id="demande" className="scroll-mt-24 lg:sticky lg:top-8">
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
          ) : isMentee && mentor.is_available && !viewer?.is_mentee ? (
            // Mode mentoré mais profil incomplet : la base refuserait la demande
            <ActionPanel eyebrow="Dernière étape" title="Complétez votre profil">
              <p className="text-sm leading-relaxed text-ink-500">
                Pour envoyer une demande à {mentor.full_name.split(" ")[0]}, décrivez d&apos;abord votre objectif et
                vos domaines d&apos;intérêt. Cela prend une minute, et vos recommandations seront plus justes.
              </p>
              <ButtonLink href="/onboarding" variant="dark" className="mt-5 w-full py-4 text-base">
                Compléter mon profil
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

      {canRequest && (
        <div className="fixed inset-x-0 bottom-0 z-30 border-t border-slate-200 bg-white/95 px-4 py-3 backdrop-blur lg:hidden">
          <a
            href="#demande"
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-600 py-3.5 font-semibold text-white shadow-sm transition-[background-color,transform] active:scale-[0.97]"
          >
            Demander un mentorat à {mentor.full_name.split(" ")[0]}
          </a>
        </div>
      )}
    </article>
  );
}
