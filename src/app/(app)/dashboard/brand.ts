/**
 * Charte graphique V1 — pilote, appliquée uniquement au haut du tableau de
 * bord mentor (bienvenue, statistiques, bannière de partage).
 * Volontairement locale : rien ici ne modifie les styles des autres pages.
 * À généraliser (globals.css) seulement après validation visuelle.
 */
import { Inter, Manrope } from "next/font/google";

/** Titres */
export const manrope = Manrope({ subsets: ["latin"], weight: ["600", "700", "800"], display: "swap" });
/** Textes et composants */
export const inter = Inter({ subsets: ["latin"], weight: ["400", "500", "600"], display: "swap" });

export const BRAND_V1 = {
  primary: "#087F65",
  deepGreen: "#064D42",
  night: "#101B33",
  background: "#F6F8FA",
  mint: "#E9F8F1",
  amber: "#E9A94D",
  muted: "#64748B",
  border: "#E3E8EE",
} as const;
