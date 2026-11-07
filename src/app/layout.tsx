import type { Metadata, Viewport } from "next";
import { Geist_Mono } from "next/font/google";
import { inter } from "@/lib/fonts";
import "./globals.css";
import { LogoMark } from "@/components/layout/Logo";
import { IllustrationDefs } from "@/components/illustrations/TopicArt";
import { AssistantWidget } from "@/features/assistant/components/AssistantWidget";

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "MentorConnect",
  description:
    "Plateforme de mentorat et de transmission des savoirs : jeunes, mentors, auteurs et professionnels de Guinée et d'Afrique.",
  applicationName: "MentorConnect",
  // iPhone : « Sur l'écran d'accueil » ouvre l'appli en plein écran (icône : app/apple-icon.png)
  appleWebApp: {
    title: "MentorConnect",
    capable: true,
    statusBarStyle: "default",
  },
};

// Couleur de la barre du navigateur / du téléphone (vert forêt de la marque)
export const viewport: Viewport = {
  themeColor: "#0a3533",
};

/**
 * Écran de lancement : décide AVANT l'affichage s'il faut le montrer
 * (application installée : toujours ; navigateur : première page de la session),
 * puis le retire quand la page est chargée ET qu'il est resté affiché
 * au moins SPLASH_MS (le logo se voit ~4,5 s, même si la page est déjà prête).
 */
const SPLASH_MS = 4500;
const SPLASH_SCRIPT = `(function(){var d=document.documentElement;var t0=Date.now();var app=window.matchMedia&&matchMedia("(display-mode: standalone)").matches;try{if(!app&&sessionStorage.getItem("mc-splash"))return;sessionStorage.setItem("mc-splash","1")}catch(e){}d.classList.add("splash");function done(){setTimeout(function(){d.classList.add("app-ready")},Math.max(0,${SPLASH_MS}-(Date.now()-t0)))}if(document.readyState==="complete")done();else addEventListener("load",done)})()`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    // suppressHydrationWarning : le script de lancement ajoute des classes sur <html> avant React
    <html
      lang="fr"
      className={`${inter.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: SPLASH_SCRIPT }} />
      </head>
      <body className="flex min-h-full flex-col font-sans text-ink-900">
        {/* Dégradés des illustrations, définis une seule fois (voir TopicArt.tsx) */}
        <IllustrationDefs />
        {/* Écran de lancement : logo qui tourne pendant le chargement (voir .app-splash dans globals.css) */}
        <div aria-hidden className="app-splash">
          <span className="app-splash-logo inline-flex size-24 items-center justify-center rounded-3xl bg-white/10 ring-1 ring-white/15">
            <LogoMark tone="light" className="h-12 w-16" />
          </span>
          <p className="text-2xl font-bold tracking-tight">
            Mentor<span className="text-accent-400">Connect</span>
          </p>
          {/* Barre qui se remplit pendant l'affichage du logo */}
          <span className="app-splash-bar block h-1 w-40 overflow-hidden rounded-full bg-white/15">
            <span className="block h-full rounded-full bg-accent-400" />
          </span>
          <p className="text-sm text-white/70">Chargement…</p>
        </div>
        {children}
        {/* Chatbox d'aide sur toutes les pages (IA en complément si ANTHROPIC_API_KEY est configurée) */}
        <AssistantWidget aiEnabled={Boolean(process.env.ANTHROPIC_API_KEY)} />
      </body>
    </html>
  );
}
