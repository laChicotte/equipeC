"use client"; // Les pages d'erreur sont obligatoirement des composants client

import { ErrorScreen } from "@/components/shared/ErrorScreen";

/** Erreur sur une page publique (accueil, connexion…). */
export default function RootError({ error, retry }: { error: unknown; retry: () => void }) {
  return (
    <main className="flex flex-1 flex-col">
      <ErrorScreen error={error} retry={retry} />
    </main>
  );
}
