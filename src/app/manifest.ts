import type { MetadataRoute } from "next";

/**
 * Manifeste de l'application installable (PWA) : permet d'ajouter MentorConnect
 * à l'écran d'accueil d'un téléphone, avec son icône, et de l'ouvrir en plein
 * écran comme une application. Servi à l'adresse /manifest.webmanifest.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "MentorConnect",
    short_name: "MentorConnect",
    description:
      "Mentorat et transmission des savoirs : jeunes, mentors, auteurs et professionnels de Guinée et d'Afrique.",
    lang: "fr",
    // Ouvre l'espace personnel ; sans session, le proxy redirige vers la connexion
    start_url: "/dashboard",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    // Écran de lancement Android : icône (logo) centrée sur ce fond sarcelle foncé
    background_color: "#0a3533",
    theme_color: "#0a3533",
    categories: ["education", "social"],
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
    shortcuts: [
      { name: "Trouver un mentor", url: "/mentors", icons: [{ src: "/icons/icon-192.png", sizes: "192x192" }] },
      { name: "Mon mentorat", url: "/mentorships", icons: [{ src: "/icons/icon-192.png", sizes: "192x192" }] },
    ],
  };
}
