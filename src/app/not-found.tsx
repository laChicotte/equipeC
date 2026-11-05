import { StatusView } from "@/components/shared/StatusView";
import { ButtonLink } from "@/components/ui/Button";
import { Logo } from "@/components/layout/Logo";

/** Page 404 des adresses inconnues (hors zone connectée). */
export default function NotFound() {
  return (
    <main className="flex flex-1 flex-col items-center px-4 py-10">
      <Logo />
      <StatusView
        icon="🧭"
        title="Page introuvable"
        actions={
          <>
            <ButtonLink href="/">Retour à l&apos;accueil</ButtonLink>
            <ButtonLink href="/dashboard" variant="secondary">
              Mon espace
            </ButtonLink>
          </>
        }
      >
        Cette page n&apos;existe pas ou a été déplacée.
      </StatusView>
    </main>
  );
}
