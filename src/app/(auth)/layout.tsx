import { existsSync } from "node:fs";
import path from "node:path";
import Image from "next/image";
import type { ReactNode } from "react";
import { Logo } from "@/components/layout/Logo";

const HERO_PHOTO = existsSync(path.join(process.cwd(), "public", "hero.jpg"));

/** Connexion / inscription : photo et message à gauche, formulaire à droite. */
export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <main className="grid flex-1 bg-white lg:grid-cols-2">
      {/* Panneau visuel (ordinateur) */}
      <aside className="relative hidden overflow-hidden bg-ink-900 lg:block">
        {HERO_PHOTO && (
          <Image src="/hero.jpg" alt="" fill priority sizes="50vw" className="object-cover object-[center_35%]" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-ink-900 via-ink-900/60 to-ink-900/10" />
        <div className="absolute inset-x-0 bottom-0 p-12 text-white">
          <p className="inline-block border-t-2 border-accent-400 pt-1 text-xs font-bold tracking-[0.16em] text-accent-400 uppercase">
            MentorConnect
          </p>
          <p className="mt-5 max-w-md text-4xl leading-tight font-bold tracking-tight">
            Un échange peut changer toute une trajectoire.
          </p>
          <p className="mt-4 max-w-md text-white/75">
            Des mentors expérimentés, engagés pour faire grandir les talents de Guinée et d&apos;Afrique.
          </p>
        </div>
      </aside>

      {/* Formulaire */}
      <div className="flex flex-col px-4 py-8 sm:px-10">
        <Logo />
        <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center py-10">{children}</div>
      </div>
    </main>
  );
}
