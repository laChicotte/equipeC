import { existsSync } from "node:fs";
import path from "node:path";
import Image from "next/image";
import type { ComponentType } from "react";
import { BookOpenIcon, FeatherIcon, HandshakeIcon, UsersIcon } from "./icons";

/**
 * Emplacement photo (composant serveur).
 *
 * Cherche public/images/<name>.webp|.jpg|.jpeg|.png : si le fichier existe, il
 * est affiché (optimisé par next/image) ; sinon, une illustration aux couleurs
 * de MentorConnect le remplace. Il suffit donc de déposer une photo portant le
 * bon nom pour qu'elle apparaisse — voir public/images/CREDITS.md.
 *
 * Le parent doit être positionné (relative) et dimensionné (aspect-* ou hauteur).
 */
const EXTENSIONS = ["webp", "jpg", "jpeg", "png"];

function findPhoto(name: string): string | null {
  for (const ext of EXTENSIONS) {
    if (existsSync(path.join(process.cwd(), "public", "images", `${name}.${ext}`))) {
      return `/images/${name}.${ext}`;
    }
  }
  return null;
}

/** true si la photo a été déposée (pour adapter un voile ou un texte). */
export const hasPhoto = (name: string) => findPhoto(name) !== null;

type Motif = "mentoring" | "books" | "workshop" | "writing";

const MOTIFS: Record<Motif, ComponentType<{ className?: string }>> = {
  mentoring: HandshakeIcon,
  books: BookOpenIcon,
  workshop: UsersIcon,
  writing: FeatherIcon,
};

export function PhotoSlot({
  name,
  alt,
  sizes,
  motif = "books",
  priority = false,
  tone = "light",
  legacySrc,
  className = "object-cover",
}: {
  /** Nom du fichier attendu dans public/images (sans extension). */
  name: string;
  /** Texte alternatif ; "" pour une image purement décorative. */
  alt: string;
  sizes: string;
  /** Pictogramme de l'illustration de remplacement. */
  motif?: Motif;
  priority?: boolean;
  /** Illustration claire (fond papier) ou sombre (fond vert forêt). */
  tone?: "light" | "dark";
  /** Ancienne photo à utiliser si la nouvelle n'est pas encore déposée. */
  legacySrc?: string;
  className?: string;
}) {
  const legacy =
    legacySrc && existsSync(path.join(process.cwd(), "public", legacySrc)) ? legacySrc : null;
  const src = findPhoto(name) ?? legacy;

  if (src) {
    return <Image src={src} alt={alt} fill priority={priority} sizes={sizes} className={className} />;
  }

  const Motif = MOTIFS[motif];
  const dark = tone === "dark";
  return (
    <div
      aria-hidden
      className={`absolute inset-0 overflow-hidden ${
        dark
          ? "bg-gradient-to-br from-brand-800 via-brand-900 to-brand-950 text-brand-300"
          : "bg-gradient-to-br from-paper via-paper-200 to-accent-50 text-brand-700"
      }`}
    >
      {/* Lignes de page, comme un cahier */}
      <svg className="absolute inset-0 h-full w-full opacity-[0.12]" preserveAspectRatio="none">
        <defs>
          <pattern id={`lines-${name}`} width="40" height="28" patternUnits="userSpaceOnUse">
            <path d="M0 27.5h40" stroke="currentColor" strokeWidth="1" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill={`url(#lines-${name})`} />
      </svg>
      {/* Arc ocre et pastille centrale */}
      <div className="absolute -right-1/4 -bottom-1/3 aspect-square w-3/4 rounded-full border-[18px] border-accent-400/30" />
      {/* Sombre = fond derrière du texte : pictogramme en haut à droite pour ne pas le gêner */}
      <div className={`absolute inset-0 flex ${dark ? "items-start justify-end p-8" : "items-center justify-center"}`}>
        <span
          className={`flex aspect-square w-1/4 max-w-32 min-w-16 items-center justify-center rounded-full ${
            dark ? "bg-white/10" : "bg-white/80 shadow-sm"
          }`}
        >
          <Motif className="h-1/2 w-1/2" />
        </span>
      </div>
    </div>
  );
}
