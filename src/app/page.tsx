import Link from "next/link";
import { Logo } from "@/components/layout/Logo";
import { ButtonLink } from "@/components/ui/Button";
import { getCurrentUserId } from "@/features/auth/queries";
import { getDomains } from "@/features/profiles/queries";

// Profils cibles du cahier des charges (§2.3)
const AUDIENCES = [
  { icon: "🎓", title: "Étudiants", text: "Orientation, choix d'études, projet Campus France." },
  { icon: "📄", title: "Jeunes diplômés", text: "CV, entretiens, premier emploi." },
  { icon: "🚀", title: "Entrepreneurs", text: "Structurer, financer et développer son activité." },
  { icon: "💡", title: "Porteurs de projet", text: "Passer de l'idée à un projet concret." },
  { icon: "🔄", title: "En reconversion", text: "Changer de voie avec l'aide de professionnels." },
];

const STEPS = [
  { title: "Créez votre profil", text: "Indiquez vos domaines, votre situation et vos objectifs." },
  { title: "Trouvez votre mentor", text: "Recherche par domaine et recommandations personnalisées, expliquées." },
  { title: "Échangez", text: "Discussion en temps réel et séances en visio, directement sur la plateforme." },
  { title: "Progressez", text: "Objectifs partagés, barre de progression et évaluation des séances." },
];

const FEATURES = [
  { icon: "🔎", title: "Catalogue de mentors", text: "Filtrez par domaine d'expertise ou par mot-clé." },
  { icon: "✨", title: "Recommandations", text: "Un score de compatibilité qui explique pourquoi chaque mentor vous correspond." },
  { icon: "💬", title: "Chat en temps réel", text: "Les messages arrivent instantanément, sans recharger la page." },
  { icon: "🎥", title: "Séances en visio", text: "Planifiez une séance : le lien de visio sécurisé est créé automatiquement." },
  { icon: "🎯", title: "Objectifs", text: "Fixez des objectifs concrets et suivez votre progression." },
  { icon: "⭐", title: "Évaluations", text: "Notez les séances : la qualité de l'accompagnement est visible." },
];

/** Aperçu visuel de l'application (HTML pur, aucune image à charger). */
function HeroPreview() {
  return (
    <div aria-hidden className="relative mx-auto w-full max-w-sm select-none">
      <div className="absolute -inset-4 -z-10 rounded-[2rem] bg-gradient-to-br from-brand-100 via-white to-amber-100 blur-xl" />
      <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-xl">
        <div className="mb-3 flex items-center justify-between">
          <p className="text-sm font-semibold">Recommandé pour vous</p>
          <span className="rounded-full bg-brand-600 px-2 py-0.5 text-xs font-bold text-white">92 %</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="inline-flex size-10 items-center justify-center rounded-full bg-brand-100 text-sm font-semibold text-brand-800">
            FD
          </span>
          <div>
            <p className="text-sm font-semibold">Fatoumata D.</p>
            <p className="text-xs text-zinc-500">Conseillère en orientation · 11 ans</p>
          </div>
        </div>
        <ul className="mt-3 space-y-1 text-xs text-zinc-600">
          <li><span className="text-brand-600">✓</span> Domaine en commun : Campus France</li>
          <li><span className="text-brand-600">✓</span> Correspond à vos objectifs : « master »</li>
        </ul>
      </div>

      <div className="mt-4 ml-8 rounded-2xl border border-zinc-200 bg-zinc-50 p-3 shadow-lg">
        <div className="mb-2 max-w-[85%] rounded-2xl rounded-bl-md bg-white px-3 py-2 text-xs ring-1 ring-zinc-200">
          On prépare ton entretien Campus France demain à 18 h ?
        </div>
        <div className="ml-auto max-w-[70%] rounded-2xl rounded-br-md bg-brand-600 px-3 py-2 text-xs text-white">
          Parfait, merci ! 🙏
        </div>
        <div className="mt-3 flex items-center justify-between rounded-xl bg-white px-3 py-2 text-xs ring-1 ring-zinc-200">
          <span>🎥 Séance demain · 18:00</span>
          <span className="font-semibold text-brand-700">Rejoindre</span>
        </div>
      </div>
    </div>
  );
}

export default async function HomePage() {
  // Domaines : lecture publique (règle RLS « domains: lecture publique »)
  const [domains, userId] = await Promise.all([getDomains(), getCurrentUserId()]);
  const loggedIn = Boolean(userId);

  return (
    <>
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-4">
        <Logo />
        <nav className="flex items-center gap-2">
          {loggedIn ? (
            <ButtonLink href="/dashboard">Mon espace</ButtonLink>
          ) : (
            <>
              <Link href="/login" className="rounded-lg px-3 py-2 text-sm text-zinc-700 hover:bg-zinc-100">
                Connexion
              </Link>
              <ButtonLink href="/signup">S&apos;inscrire</ButtonLink>
            </>
          )}
        </nav>
      </header>

      <main className="flex-1">
        {/* Accroche */}
        <section className="mx-auto grid w-full max-w-6xl items-center gap-12 px-4 py-12 md:grid-cols-2 md:py-20">
          <div>
            <p className="mb-4 inline-flex rounded-full bg-brand-50 px-3 py-1 text-xs font-medium text-brand-800 ring-1 ring-brand-100">
              Mois du Numérique · Conakry 2026
            </p>
            <h1 className="text-4xl font-bold tracking-tight text-balance sm:text-5xl">
              Le bon mentor, <span className="text-brand-700">au bon moment.</span>
            </h1>
            <p className="mt-5 max-w-xl text-lg text-zinc-600">
              MentorConnect met en relation les jeunes avec des professionnels expérimentés pour
              les accompagner dans leurs études, leur insertion et leurs projets, par chat et en
              visio.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              {loggedIn ? (
                <ButtonLink href="/mentors">Trouver un mentor</ButtonLink>
              ) : (
                <>
                  <ButtonLink href="/signup?role=mentee">Je cherche un mentor</ButtonLink>
                  <ButtonLink href="/signup?role=mentor" variant="secondary">
                    Je deviens mentor
                  </ButtonLink>
                </>
              )}
            </div>
            <p className="mt-4 text-sm text-zinc-500">Gratuit · Inscription en moins d&apos;une minute</p>
          </div>
          <HeroPreview />
        </section>

        {/* Pour qui ? */}
        <section className="border-y border-zinc-200 bg-white py-14">
          <div className="mx-auto w-full max-w-6xl px-4">
            <h2 className="mb-2 text-2xl font-semibold">Pour qui ?</h2>
            <p className="mb-8 text-zinc-600">Pour toute personne qui veut apprendre, progresser ou concrétiser un projet.</p>
            <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
              {AUDIENCES.map((a) => (
                <li key={a.title} className="rounded-2xl border border-zinc-200 p-4">
                  <span aria-hidden className="text-2xl">{a.icon}</span>
                  <p className="mt-2 font-semibold">{a.title}</p>
                  <p className="mt-1 text-sm text-zinc-600">{a.text}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Comment ça marche */}
        <section className="mx-auto w-full max-w-6xl px-4 py-14">
          <h2 className="mb-8 text-2xl font-semibold">Comment ça marche</h2>
          <ol className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((step, index) => (
              <li key={step.title} className="relative rounded-2xl border border-zinc-200 bg-white p-5">
                <span className="mb-3 inline-flex size-9 items-center justify-center rounded-full bg-accent-400 font-bold">
                  {index + 1}
                </span>
                <h3 className="font-semibold">{step.title}</h3>
                <p className="mt-1 text-sm text-zinc-600">{step.text}</p>
              </li>
            ))}
          </ol>
        </section>

        {/* Fonctionnalités */}
        <section className="bg-brand-800 py-14 text-white">
          <div className="mx-auto w-full max-w-6xl px-4">
            <h2 className="mb-8 text-2xl font-semibold">Tout l&apos;accompagnement, au même endroit</h2>
            <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {FEATURES.map((f) => (
                <li key={f.title} className="rounded-2xl bg-white/10 p-5 ring-1 ring-white/15">
                  <span aria-hidden className="text-2xl">{f.icon}</span>
                  <h3 className="mt-2 font-semibold">{f.title}</h3>
                  <p className="mt-1 text-sm text-white/80">{f.text}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Domaines (lus en base) */}
        {domains.length > 0 && (
          <section className="mx-auto w-full max-w-6xl px-4 py-14">
            <h2 className="mb-2 text-2xl font-semibold">Domaines d&apos;accompagnement</h2>
            <p className="mb-8 text-zinc-600">Des mentors issus de tous les secteurs.</p>
            <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {domains.map((domain) => (
                <li key={domain.id} className="rounded-xl border border-zinc-200 bg-white p-4">
                  <p className="font-medium">{domain.name}</p>
                  <p className="mt-1 text-sm text-zinc-600">{domain.description}</p>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Appel aux mentors */}
        {!loggedIn && (
          <section className="mx-auto mb-14 w-full max-w-6xl px-4">
            <div className="flex flex-col items-start justify-between gap-4 rounded-3xl bg-amber-50 p-8 ring-1 ring-amber-200 md:flex-row md:items-center">
              <div>
                <h2 className="text-xl font-semibold">Vous êtes professionnel ?</h2>
                <p className="mt-1 max-w-xl text-zinc-700">
                  Partagez votre expérience : quelques heures par mois peuvent changer un parcours.
                </p>
              </div>
              <ButtonLink href="/signup?role=mentor">Devenir mentor</ButtonLink>
            </div>
          </section>
        )}
      </main>

      <footer className="border-t border-zinc-200 bg-white">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-3 px-4 py-6 text-xs text-zinc-500">
          <p>
            MentorConnect · Hackathon d&apos;innovation numérique · Salon international du livre de
            jeunesse de Conakry · Mois du Numérique 2026
          </p>
          <p>
            L&apos;accompagnement Campus France relève du conseil et du partage d&apos;expérience : il
            ne garantit ni l&apos;admission dans un établissement, ni l&apos;obtention d&apos;un visa.
          </p>
        </div>
      </footer>
    </>
  );
}
