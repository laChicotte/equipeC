import type { ComponentType, ReactNode } from "react";
import { Logo } from "@/components/layout/Logo";
import { PhotoSlot } from "@/components/ui/PhotoSlot";
import {
  BookOpenIcon,
  ChartIcon,
  FeatherIcon,
  GraduationIcon,
  HandshakeIcon,
  UsersIcon,
} from "@/components/ui/icons";

type Variant = "login" | "signup";

type Panel = {
  photo: string;
  legacySrc?: string;
  motif: "mentoring" | "workshop";
  title: ReactNode;
  text: string;
  highlights: { icon: ComponentType<{ className?: string }>; text: string }[];
};

const PANELS: Record<Variant, Panel> = {
  login: {
    photo: "connexion",
    legacySrc: "/hero.jpg",
    motif: "mentoring",
    title: (
      <>
        Un échange peut changer toute une <span className="text-accent-300 italic">trajectoire.</span>
      </>
    ),
    text: "La plateforme qui connecte les talents de Guinée et d'Afrique à des mentors expérimentés.",
    highlights: [
      { icon: GraduationIcon, text: "Accompagnement personnalisé" },
      { icon: UsersIcon, text: "Réseau de professionnels" },
      { icon: ChartIcon, text: "Évolution concrète" },
    ],
  },
  signup: {
    photo: "inscription",
    motif: "workshop",
    title: (
      <>
        Rejoignez une communauté qui <span className="text-accent-300 italic">transmet.</span>
      </>
    ),
    text: "Mentorés, mentors, auteurs, professionnels : ici, chacun apprend et chacun partage.",
    highlights: [
      { icon: HandshakeIcon, text: "Apprendre de ceux qui savent" },
      { icon: FeatherIcon, text: "Partager son expérience" },
      { icon: BookOpenIcon, text: "Lire, écrire, agir" },
    ],
  },
};

/**
 * Mise en page des pages d'authentification : panneau photo vert forêt à
 * gauche (ordinateur), carte formulaire à droite.
 */
export function AuthShell({ variant = "login", children }: { variant?: Variant; children: ReactNode }) {
  const panel = PANELS[variant];

  return (
    <main className="relative grid flex-1 overflow-hidden bg-background lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      {/* Panneau visuel (ordinateur) */}
      <aside className="relative hidden min-h-screen overflow-hidden rounded-r-[64px] bg-brand-900 lg:sticky lg:top-0 lg:flex lg:h-screen lg:flex-col">
        <PhotoSlot
          name={panel.photo}
          legacySrc={panel.legacySrc}
          alt=""
          sizes="50vw"
          motif={panel.motif}
          tone="dark"
          priority
          className="object-cover object-[center_30%]"
        />
        {/* Voile vert : lisibilité du texte, cohérence avec la marque */}
        <div aria-hidden className="absolute inset-0 bg-gradient-to-b from-brand-900/85 via-brand-900/35 to-brand-900" />
        <div aria-hidden className="absolute inset-0 bg-gradient-to-r from-brand-900/60 to-transparent" />

        {/* Courbes décoratives (ocre et vert) */}
        <svg viewBox="0 0 200 200" aria-hidden className="pointer-events-none absolute top-[34%] -left-10 h-56 w-56 text-accent-400/60">
          <path d="M0 150C40 70 110 30 200 40c-80 15-140 60-180 140Z" fill="currentColor" />
        </svg>
        <svg
          viewBox="0 0 400 80"
          preserveAspectRatio="none"
          aria-hidden
          className="pointer-events-none absolute right-0 bottom-0 h-16 w-2/3 text-brand-600/60"
        >
          <path d="M0 80C140 70 300 40 400 0v80Z" fill="currentColor" />
        </svg>

        <div className="relative px-12 pt-10">
          <Logo tone="light" />
        </div>

        <div className="relative mt-auto px-12 pb-14 text-white">
          <p className="max-w-lg font-display text-[2.6rem] leading-[1.1] font-semibold tracking-tight xl:text-5xl">
            {panel.title}
          </p>
          <p className="mt-5 max-w-md text-lg leading-relaxed text-white/85">{panel.text}</p>

          <ul className="mt-9 flex flex-wrap gap-3">
            {panel.highlights.map(({ icon: Icon, text }) => (
              <li
                key={text}
                className="flex items-center gap-3 rounded-2xl border border-white/20 bg-white/5 px-4 py-3 text-sm leading-snug font-medium backdrop-blur-sm"
              >
                <Icon className="h-6 w-6 shrink-0 text-accent-300" />
                <span className="max-w-[8.5rem]">{text}</span>
              </li>
            ))}
          </ul>
        </div>
      </aside>

      {/* Formulaire */}
      <div className="relative flex flex-col px-4 py-6 sm:px-8 lg:py-10">
        {/* Formes décoratives d'arrière-plan */}
        <div aria-hidden className="pointer-events-none absolute -top-24 -right-24 h-80 w-80 rounded-full bg-accent-50" />
        <div aria-hidden className="pointer-events-none absolute -top-10 right-10 h-56 w-56 rounded-full border-[28px] border-white/70" />

        <div className="relative lg:hidden">
          <Logo />
        </div>
        <div className="relative mx-auto flex w-full max-w-[34rem] flex-1 flex-col justify-center py-8">
          <div className="rounded-[28px] border border-zinc-100 bg-white px-5 py-9 shadow-[0_24px_60px_-24px_rgba(11,58,49,0.25)] sm:px-12 sm:py-10">
            {children}
          </div>
        </div>
      </div>
    </main>
  );
}
