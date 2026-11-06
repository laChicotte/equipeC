import type { Metadata, Viewport } from "next";
import { Geist_Mono, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { LogoMark } from "@/components/layout/Logo";

// Police unique : géométrique, moderne et lisible (titres et textes)
const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
});


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

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="fr"
      className={`${jakarta.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col font-sans text-ink-900">
        {/* Écran de lancement de l'application installée (voir .app-splash dans globals.css) */}
        <div aria-hidden className="app-splash">
          <LogoMark tone="light" className="h-20 w-24" />
          <p className="text-2xl font-extrabold tracking-tight">
            Mentor<span className="text-accent-400">Connect</span>
          </p>
        </div>
        {children}
      </body>
    </html>
  );
}
