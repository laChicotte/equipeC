/**
 * Dates et heures de l'application.
 *
 * Tout est affiché dans un fuseau UNIQUE, celui de Conakry, pour que le serveur
 * (votre PC, Vercel en UTC…) et les navigateurs affichent la même heure.
 * La Guinée est à l'heure GMT (UTC+0) toute l'année, sans heure d'été :
 * une heure saisie « à Conakry » est donc identique à l'heure UTC.
 */
export const APP_TIME_ZONE = "Africa/Conakry";

const fmt = (options: Intl.DateTimeFormatOptions) =>
  new Intl.DateTimeFormat("fr-FR", { timeZone: APP_TIME_ZONE, ...options });

const dayFormat = fmt({ weekday: "long", day: "numeric", month: "long" });
const shortDateFormat = fmt({ day: "numeric", month: "long" });
const timeFormat = fmt({ hour: "2-digit", minute: "2-digit" });
const dayKeyFormat = fmt({ year: "numeric", month: "2-digit", day: "2-digit" });

/** « jeudi 6 novembre à 18:00 » */
export const formatDateTime = (iso: string) => `${formatDay(iso)} à ${formatTime(iso)}`;
/** « jeudi 6 novembre » */
export function formatDay(iso: string) {
  return dayFormat.format(new Date(iso));
}
/** « 6 novembre » */
export const formatShortDate = (iso: string) => shortDateFormat.format(new Date(iso));
/** « 18:00 » */
export function formatTime(iso: string) {
  return timeFormat.format(new Date(iso));
}
/** Clé du jour dans le fuseau de l'application (pour regrouper par jour). */
export const dayKey = (iso: string) => dayKeyFormat.format(new Date(iso));

/**
 * Convertit la valeur d'un champ <input type="datetime-local">
 * (« 2026-11-06T18:00 », heure de Conakry) en date ISO UTC.
 * Valable car Conakry = UTC+0 toute l'année (voir en tête de fichier).
 */
export function conakryInputToISO(value: string): string | null {
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(value)) return null;
  const date = new Date(`${value}:00Z`);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

/** Valeur minimale d'un champ datetime-local : maintenant, heure de Conakry. */
export function nowAsConakryInput(): string {
  return new Date().toISOString().slice(0, 16);
}
