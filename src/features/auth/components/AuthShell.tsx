import type { ComponentType, ReactNode } from "react";
import Link from "next/link";
import { Logo } from "@/components/layout/Logo";
import { PhotoSlot } from "@/components/ui/PhotoSlot";
import {
  BookOpenIcon,
  ChartIcon,
  FeatherIcon,
  GraduationIcon,
  HandshakeIcon,
  RocketIcon,
  UsersIcon,
} from "@/components/ui/icons";

type Variant = "login" | "signup";
type Icon = ComponentType<{ className?: string }>;

type Panel = {
  photo: string;
  legacySrc?: string;
  badge: string;
  title: ReactNode;
  text: string;
  features: { icon: Icon; title: string; text: string }[];
};

/** « MentorConnect » en émeraude, souligné d'un trait de pinceau (maquette). */
function BrandSwoosh() {
  return (
    <span className="relative inline-block text-accent-400">
      MentorConnect
      <svg
        viewBox="0 0 300 14"
        preserveAspectRatio="none"
        aria-hidden
        className="absolute -bottom-3 left-[18%] h-3 w-[62%] text-accent-400"
      >
        <path d="M2 10C80 2 200 1 298 7" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
      </svg>
    </span>
  );
}

const PANELS: Record<Variant, Panel> = {
  login: {
    photo: "connexion",
    legacySrc: "/hero.jpg",
    badge: "Mentorat · Orientation · Carrière",
    title: (
      <>
        Connectez-vous à votre espace <BrandSwoosh />
      </>
    ),
    text: "Échangez, apprenez et progressez avec des mentors expérimentés de Guinée et d'Afrique.",
    features: [
      { icon: GraduationIcon, title: "Accompagnement personnalisé", text: "Bénéficiez de conseils adaptés à vos objectifs." },
      { icon: UsersIcon, title: "Réseau de professionnels", text: "Échangez avec des experts de divers domaines." },
      { icon: ChartIcon, title: "Suivi de votre progression", text: "Fixez vos objectifs et mesurez vos avancées." },
    ],
  },
  signup: {
    // Même photo que la connexion tant qu'aucune photo « inscription » n'est déposée
    photo: "inscription",
    legacySrc: "/images/connexion.webp",
    badge: "Apprendre · Transmettre · Agir",
    title: (
      <>
        Rejoignez la communauté <BrandSwoosh />
      </>
    ),
    text: "Mentorés, mentors, auteurs, professionnels : ici, chacun apprend et chacun partage.",
    features: [
      { icon: HandshakeIcon, title: "Apprendre de ceux qui savent", text: "Des mentors qui ont déjà parcouru le chemin." },
      { icon: FeatherIcon, title: "Partager son expérience", text: "Quelques heures par mois peuvent changer une trajectoire." },
      { icon: BookOpenIcon, title: "Lire, écrire, agir", text: "Bibliothèque, ateliers et opportunités au même endroit." },
    ],
  },
};

/**
 * Mise en page des pages d'authentification (maquette « Connexion ») :
 * panneau sarcelle foncé avec photo à gauche (ordinateur), carte formulaire à droite.
 * Ordinateur : tient dans l'écran sans défilement ; les éléments secondaires
 * disparaissent sur les écrans peu hauts.
 */
export function AuthShell({ variant = "login", children }: { variant?: Variant; children: ReactNode }) {
  const panel = PANELS[variant];

  return (
    <main className="relative grid min-h-dvh flex-1 overflow-hidden bg-mint lg:h-dvh lg:min-h-0 lg:grid-cols-[minmax(0,1.08fr)_minmax(0,1fr)] lg:grid-rows-[minmax(0,1fr)]">
      {/* Panneau visuel (ordinateur) */}
      <aside className="relative hidden overflow-hidden rounded-tr-[140px] bg-gradient-dark text-white lg:flex lg:h-full lg:flex-col">
        {/* Photo à droite, fondue dans le sarcelle */}
        <div className="absolute inset-y-0 right-0 w-[58%]">
          <PhotoSlot
            name={panel.photo}
            legacySrc={panel.legacySrc}
            alt=""
            sizes="30vw"
            motif="mentoring"
            tone="dark"
            priority
            className="object-cover object-[center_45%]"
          />
          {/* Fondus légers : la photo reste lumineuse, seuls les bords se fondent dans le sarcelle */}
          <div aria-hidden className="absolute inset-0 bg-gradient-to-r from-[#0b2e31] from-0% via-[#0b2e31]/25 via-30% to-transparent to-60%" />
          <div aria-hidden className="absolute inset-0 bg-gradient-to-b from-[#0f172a]/70 from-0% via-transparent via-25% to-transparent" />
          <div aria-hidden className="absolute inset-x-0 bottom-0 h-1/4 bg-gradient-to-t from-[#0a3f39] to-transparent" />
        </div>

        <div className="relative flex h-full flex-col px-12 py-10 xl:px-16 short:py-8 tiny:py-6">
          <div>
            <Logo tone="light" />
            <p className="mt-1 pl-[46px] text-sm text-white/75">La plateforme de mentorat en Afrique</p>
          </div>

          <div className="my-auto max-w-[27rem] py-6">
            <p className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/5 px-4 py-2 text-sm font-medium text-white/90 backdrop-blur-sm [@media(max-height:700px)]:hidden">
              <RocketIcon className="size-4 text-accent-400" />
              {panel.badge}
            </p>
            <h2 className="mt-6 font-display text-[2.6rem] leading-[1.08] font-extrabold tracking-tight xl:text-[3rem] short:mt-5 short:text-[2.4rem] tiny:mt-4 tiny:text-[2.1rem]">
              {panel.title}
            </h2>
            <p className="mt-7 max-w-sm leading-relaxed text-white/80 short:mt-5">{panel.text}</p>

            <ul className="mt-7 flex flex-col gap-4 short:mt-5 short:gap-3 tiny:gap-2.5">
              {panel.features.map(({ icon: FeatureIcon, title, text }) => (
                <li key={title} className="flex items-center gap-4">
                  <span className="inline-flex size-12 shrink-0 items-center justify-center rounded-xl bg-brand-500/25 text-accent-400 ring-1 ring-white/10 short:size-10">
                    <FeatureIcon className="size-6" />
                  </span>
                  <span className="min-w-0">
                    <span className="block font-semibold">{title}</span>
                    <span className="block text-sm text-white/70 tiny:hidden">{text}</span>
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Encart communauté : informations vraies uniquement (pas de faux chiffres) */}
          <div className="flex max-w-xl items-center gap-5 rounded-2xl border border-white/15 bg-white/5 px-6 py-5 backdrop-blur-sm [@media(max-height:820px)]:hidden">
            <span aria-hidden className="flex -space-x-3">
              {[GraduationIcon, UsersIcon, FeatherIcon].map((PillIcon, i) => (
                <span
                  key={i}
                  className="inline-flex size-11 items-center justify-center rounded-full bg-ink-900 text-accent-400 ring-2 ring-white/80"
                >
                  <PillIcon className="size-5" />
                </span>
              ))}
            </span>
            <p className="flex-1 text-sm leading-snug text-white/85">
              Rejoignez une communauté de jeunes et de mentors engagés.
            </p>
            <span aria-hidden className="h-10 w-px bg-white/20" />
            <p className="leading-tight">
              <span className="block text-2xl font-extrabold text-accent-400">100 %</span>
              <span className="text-sm text-white/75">gratuit</span>
            </p>
          </div>
        </div>
      </aside>

      {/* Formulaire */}
      <div className="relative flex flex-col px-3 py-3 sm:px-8 sm:py-6 lg:h-full lg:overflow-x-hidden lg:overflow-y-auto short:sm:py-4 tiny:sm:py-3">
        {/* Formes décoratives d'arrière-plan (vert d'eau), dans un calque qui coupe
            ce qui dépasse : sinon elles créeraient une barre de défilement */}
        <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -top-24 -right-24 h-80 w-80 rounded-full bg-accent-50" />
          <div className="absolute -top-10 right-10 h-56 w-56 rounded-full border-[28px] border-white/70" />
          <div className="absolute -right-20 -bottom-28 h-72 w-96 rounded-[50%] bg-accent-50" />
        </div>

        {/* Logo au-dessus de la carte : tablette seulement (sur téléphone, la carte l'affiche déjà) */}
        <div className="relative hidden sm:block lg:hidden">
          <Logo />
        </div>
        {/* my-auto : centré verticalement, sans couper le haut si l'écran est très petit */}
        <div className="relative mx-auto my-auto w-full max-w-[34rem] sm:py-6 lg:py-0">
          <div className="rounded-3xl border border-slate-200/80 bg-white px-4 py-5 shadow-[0_24px_60px_-24px_rgba(11,58,49,0.25)] sm:rounded-[28px] sm:px-10 sm:py-8 short:sm:py-6 tiny:py-4 tiny:sm:py-5">
            {children}
          </div>
        </div>
      </div>
    </main>
  );
}

/** Onglets « Se connecter / S'inscrire » en haut de la carte (maquette). */
export function AuthTabs({ active }: { active: Variant }) {
  const tabs = [
    {
      id: "login" as const,
      href: "/login",
      label: "Se connecter",
      icon: (
        <>
          <circle cx="12" cy="8" r="4" />
          <path d="M4 21a8 8 0 0 1 16 0" />
        </>
      ),
    },
    {
      id: "signup" as const,
      href: "/signup",
      label: "S'inscrire",
      icon: (
        <>
          <circle cx="10" cy="8" r="4" />
          <path d="M2 21a8 8 0 0 1 14.5-4.7M19 14v6M16 17h6" />
        </>
      ),
    },
  ];

  return (
    <nav
      aria-label="Connexion ou inscription"
      className="mb-4 grid grid-cols-2 gap-1 rounded-2xl bg-slate-50 p-1 ring-1 ring-slate-100 sm:mb-6 short:sm:mb-4 tiny:mb-3 tiny:sm:mb-3"
    >
      {tabs.map((tab) => {
        const current = tab.id === active;
        return (
          <Link
            key={tab.id}
            href={tab.href}
            aria-current={current ? "page" : undefined}
            className={`flex items-center justify-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold sm:py-2.5 short:sm:py-2 transition-colors focus-visible:outline-2 focus-visible:outline-brand-600 sm:text-[15px] ${
              current
                ? "border-b-2 border-brand-600 bg-accent-50 text-brand-700"
                : "text-ink-900 hover:bg-white"
            }`}
          >
            <svg
              aria-hidden
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.8}
              strokeLinecap="round"
              strokeLinejoin="round"
              className="size-5"
            >
              {tab.icon}
            </svg>
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
