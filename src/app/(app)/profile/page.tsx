import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/features/auth/queries";
import { logout } from "@/features/auth/actions";
import { getDomains, getProfileDomainIds } from "@/features/profiles/queries";
import { MENTEE_STATUS_LABELS } from "@/features/profiles/labels";
import { ProfileForm } from "@/features/profiles/components/ProfileForm";
import { AvatarUploader } from "@/features/profiles/components/AvatarUploader";
import { RolesCard } from "@/features/profiles/components/RolesCard";
import { isRoleReady } from "@/features/profiles/roles";
import { PROFILE_FORM_ID } from "@/features/profiles/constants";
import { getMentorById, getMentorReviews, type PublicReview } from "@/features/mentors/queries";
import { PageHeader } from "@/components/shared/PageHeader";
import { ButtonLink } from "@/components/ui/Button";
import { ProgressRing } from "@/components/ui/ProgressRing";
import { formatShortDate } from "@/lib/datetime";
import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/types/database";

export const metadata: Metadata = { title: "Mon profil · MentorConnect" };

/**
 * Complétude du profil, champ par champ, avec la section du formulaire
 * concernée (pour le lien « Remplir les X % restants »).
 */
function completion(profile: Profile, domainCount: number) {
  const isMentor = profile.role === "mentor";
  const items: [boolean, string][] = [
    [Boolean(profile.avatar_url), "photo"],
    [Boolean(profile.full_name), "section-identite"],
    [Boolean(profile.city), "section-identite"],
    [Boolean(profile.headline), "section-identite"],
    ...(isMentor
      ? ([
          [Boolean(profile.job_title), "section-identite"],
          [Boolean(profile.organization), "section-identite"],
          [profile.years_experience !== null, "section-cadre"],
          [Boolean(profile.availability), "section-cadre"],
        ] as [boolean, string][])
      : ([
          [Boolean(profile.mentee_status), "section-cadre"],
          [Boolean(profile.goals_summary), "section-cadre"],
        ] as [boolean, string][])),
    [domainCount > 0, "section-expertises"],
    [(isMentor ? profile.skills : profile.needs).length > 0, "section-expertises"],
    [Boolean(profile.bio), "section-parcours"],
  ];
  const done = items.filter(([ok]) => ok).length;
  return {
    percent: Math.round((done / items.length) * 100),
    firstMissing: items.find(([ok]) => !ok)?.[1] ?? null,
  };
}

const initialsOf = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");

/** 05 · Avis & impact (lecture seule, mentors uniquement). */
function ReviewsSection({
  rating,
  reviews,
}: {
  rating: { avg: number; count: number } | null;
  reviews: PublicReview[];
}) {
  const latest = reviews.slice(0, 2);
  return (
    <section
      id="section-avis"
      className="grid gap-6 rounded-3xl border border-zinc-100 bg-white p-6 shadow-[0_1px_3px_rgba(23,43,69,0.04)] sm:p-8 lg:grid-cols-[16rem_1fr] lg:gap-12"
    >
      <div>
        <span className="inline-flex size-9 items-center justify-center rounded-lg border border-zinc-200 text-xs font-semibold text-ink-500">
          05
        </span>
        <h2 className="mt-4 text-xl font-bold">Avis & impact</h2>
        <p className="mt-2 text-sm leading-relaxed text-ink-500">
          Ce que vos mentorés disent de vos séances. Les avis sont laissés après chaque séance terminée.
        </p>
        <div className="mt-5 flex items-center gap-4">
          <div className="rounded-2xl bg-background px-4 py-3 text-center">
            <p className="text-2xl font-bold text-brand-700">{rating ? rating.avg.toLocaleString("fr-FR") : "–"}</p>
            <p className="text-[11px] text-ink-500">sur 5,0</p>
          </div>
          <div>
            <p aria-label={rating ? `${rating.avg} sur 5` : "Pas encore noté"} className="text-accent-400">
              {"★".repeat(Math.round(rating?.avg ?? 0))}
              <span className="text-zinc-200">{"★".repeat(5 - Math.round(rating?.avg ?? 0))}</span>
            </p>
            <p className="text-xs text-ink-500">
              {rating ? `${rating.count} avis de mentoré${rating.count > 1 ? "s" : ""}` : "Aucun avis pour l'instant"}
            </p>
          </div>
        </div>
      </div>

      {latest.length === 0 ? (
        <p className="self-center rounded-2xl bg-background p-6 text-sm text-ink-500">
          Vos premiers avis apparaîtront ici après vos premières séances.
        </p>
      ) : (
        <ul className="grid content-start gap-4 sm:grid-cols-2">
          {latest.map((r, i) => (
            <li key={i} className="flex flex-col justify-between gap-5 rounded-2xl bg-background p-5">
              <p className="text-sm leading-relaxed text-ink-700 italic">
                « {r.comment || "Séance très utile."} »
              </p>
              <div className="flex items-center gap-3">
                <span className="inline-flex size-9 items-center justify-center rounded-full bg-brand-100 text-xs font-bold text-brand-800">
                  {initialsOf(r.reviewer_first_name)}
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-semibold">{r.reviewer_first_name}</p>
                  <p className="text-xs text-ink-500">
                    <span className="text-accent-400">{"★".repeat(r.rating)}</span> · {formatShortDate(r.created_at)}
                  </p>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export default async function ProfilePage() {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/dashboard");
  const isMentor = profile.role === "mentor";

  const supabase = await createClient();
  const [domains, selected, claims, mentor, reviews] = await Promise.all([
    getDomains(),
    getProfileDomainIds(profile.id, profile.role),
    supabase.auth.getClaims(),
    isMentor ? getMentorById(profile.id) : Promise.resolve(null),
    isMentor ? getMentorReviews(profile.id) : Promise.resolve([]),
  ]);
  const email = (claims.data?.claims.email as string | undefined) ?? null;
  const { percent, firstMissing } = completion(profile, selected.length);

  const subtitle = [
    isMentor ? profile.job_title : profile.mentee_status && MENTEE_STATUS_LABELS[profile.mentee_status],
    isMentor ? profile.organization : null,
    profile.city,
  ]
    .filter(Boolean)
    .join(" • ");
  const statusPill = isMentor
    ? profile.is_available
      ? { label: "Mentor actif · Disponible", on: true }
      : { label: "Mentor · Indisponible", on: false }
    : { label: "Mentoré(e)", on: true };

  return (
    <>
      <PageHeader
        eyebrow={isMentor ? "Espace mentor · Profil public" : "Espace mentoré · Mon profil"}
        title="Mon profil"
        description={
          isMentor
            ? "Personnalisez votre identité de mentor, vos créneaux et vos expertises pour recevoir les demandes qui vous correspondent."
            : "Présentez-vous et précisez vos besoins : c'est ce qui nous permet de vous recommander les bons mentors."
        }
        actions={
          <div className="flex gap-3">
            {isMentor && (
              <ButtonLink href={`/mentors/${profile.id}`} variant="secondary">
                <svg aria-hidden viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth={1.8}>
                  <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12Z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
                Aperçu public
              </ButtonLink>
            )}
            <button
              type="submit"
              form={PROFILE_FORM_ID}
              className="inline-flex items-center gap-2 rounded-xl bg-brand-700 px-5 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-brand-800"
            >
              ✓ Sauvegarder
            </button>
          </div>
        }
      />

      {/* Carte d'identité */}
      <section className="relative mb-6 overflow-hidden rounded-3xl border border-zinc-100 bg-white p-6 shadow-[0_1px_3px_rgba(23,43,69,0.04)] sm:p-8">
        <div aria-hidden className="pointer-events-none absolute -top-24 -right-24 size-72 rounded-full bg-brand-50 blur-3xl" />
        <div className="relative flex flex-col gap-8 lg:flex-row lg:items-center">
          <div className="flex flex-1 flex-col gap-6 sm:flex-row sm:items-center">
            <div id="photo" className="relative shrink-0 scroll-mt-24 self-start sm:self-center">
              <AvatarUploader userId={profile.id} name={profile.full_name} avatarUrl={profile.avatar_url} />
              {isRoleReady(profile) && (
                <span
                  title="Profil complété"
                  className="pointer-events-none absolute top-[88px] -right-1.5 inline-flex size-8 items-center justify-center rounded-full border-4 border-white bg-brand-600 text-xs font-bold text-white"
                >
                  ✓
                </span>
              )}
            </div>
            <div className="min-w-0">
              <h2 className="truncate text-2xl font-bold sm:text-3xl">{profile.full_name}</h2>
              <span
                className={`mt-2 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${
                  statusPill.on ? "bg-brand-100 text-brand-800" : "bg-zinc-100 text-ink-500"
                }`}
              >
                <span aria-hidden className={`size-1.5 rounded-full ${statusPill.on ? "bg-brand-600" : "bg-zinc-400"}`} />
                {statusPill.label}
              </span>
              {subtitle && <p className="mt-2 text-ink-500">{subtitle}</p>}
              <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2">
                {isMentor && (
                  <Link
                    href={`/mentors/${profile.id}`}
                    className="inline-flex items-center gap-2 rounded-lg border border-zinc-200 px-3 py-2 text-sm font-medium text-ink-900 transition-colors hover:bg-zinc-50"
                  >
                    <svg aria-hidden viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth={1.8}>
                      <path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5" strokeLinecap="round" />
                    </svg>
                    Voir mon profil public
                  </Link>
                )}
                <form action={logout}>
                  <button className="inline-flex items-center gap-2 rounded-lg px-2 py-2 text-sm font-semibold text-red-600 transition-colors hover:bg-red-50">
                    <svg aria-hidden viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth={1.8}>
                      <path d="M15 4h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-3M10 17l-5-5 5-5M5 12h11" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    Se déconnecter
                  </button>
                </form>
              </div>
            </div>
          </div>

          {/* Complétude */}
          <div className="flex items-center gap-5 rounded-2xl bg-background p-5 lg:w-[26rem]">
            <ProgressRing percent={percent} label="Complété" size={92} />
            <div className="min-w-0">
              <p className="font-semibold">{percent === 100 ? "Confiance maximale" : "Profil à compléter"}</p>
              <p className="mt-1 text-sm text-ink-500">
                {isMentor
                  ? "Un profil complet inspire confiance et ressort mieux dans les recommandations des mentorés."
                  : "Un profil complet permet de vous recommander des mentors plus pertinents."}
              </p>
              {firstMissing && (
                <a href={`#${firstMissing}`} className="mt-2 inline-block text-sm font-semibold text-brand-700 hover:underline">
                  Remplir les {100 - percent} % restants →
                </a>
              )}
            </div>
          </div>
        </div>
      </section>

      <RolesCard profile={profile} />

      <ProfileForm
        profile={profile}
        domains={domains}
        selectedDomainIds={selected}
        mode="edit"
        email={email}
        extra={isMentor ? <ReviewsSection rating={mentor?.rating ?? null} reviews={reviews} /> : undefined}
      />
    </>
  );
}
