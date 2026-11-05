import type { Metadata, Viewport } from "next";
import { Geist_Mono, Literata, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

// Police principale : géométrique et lisible (interface, textes)
const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
});

// Police des titres éditoriaux : conçue pour la lecture (thème « Lire demain »)
const literata = Literata({
  variable: "--font-literata",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  style: ["normal", "italic"],
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
  themeColor: "#0b3a31",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="fr"
      className={`${jakarta.variable} ${literata.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col font-sans text-ink-900">{children}</body>
    </html>
  );
}
