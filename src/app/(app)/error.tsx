"use client"; // Les pages d'erreur sont obligatoirement des composants client

import { ErrorScreen } from "@/components/shared/ErrorScreen";

/** Erreur dans la zone connectée : le menu latéral reste disponible. */
export default function AppError({ error, retry }: { error: unknown; retry: () => void }) {
  return <ErrorScreen error={error} retry={retry} />;
}
