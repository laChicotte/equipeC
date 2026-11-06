"use client";

import { useEffect } from "react";
import { StatusView } from "./StatusView";
import { Button, ButtonLink } from "@/components/ui/Button";

/**
 * Contenu commun des pages d'erreur (error.tsx).
 * En production, Next.js masque le détail des erreurs serveur : on n'affiche
 * qu'un message générique et l'identifiant technique (digest) pour les logs.
 */
export function ErrorScreen({ error, retry }: { error: unknown; retry: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  const digest =
    error instanceof Error && "digest" in error ? String((error as { digest?: string }).digest ?? "") : "";

  return (
    <StatusView
      icon="⚠️"
      title="Un problème est survenu"
      actions={
        <>
          {/* retry() : recharge les données et réaffiche la page (Next.js 16) */}
          <Button onClick={() => retry()}>Réessayer</Button>
          <ButtonLink href="/dashboard" variant="secondary">
            Mon tableau de bord
          </ButtonLink>
        </>
      }
    >
      <p>Vérifiez votre connexion Internet puis réessayez.</p>
      {digest && <p className="mt-2 text-xs text-slate-400">Référence : {digest}</p>}
    </StatusView>
  );
}
