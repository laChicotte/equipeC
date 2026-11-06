/**
 * Polices du Design System MentorConnect (charte « vert profond et émeraude »).
 * Inter : police principale (titres SemiBold/Bold, textes Regular/Medium).
 * Exposée en variable CSS --font-inter, utilisée par la classe `font-ui`
 * (globals.css). Pendant la refonte, seules les pages migrées l'utilisent.
 */
import { Inter } from "next/font/google";

export const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-inter",
  display: "swap",
});
