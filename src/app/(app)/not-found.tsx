import { StatusView } from "@/components/shared/StatusView";
import { ButtonLink } from "@/components/ui/Button";

/**
 * 404 dans la zone connectée (notFound() : mentor inexistant, espace de
 * mentorat auquel on n'a pas accès…). Le menu latéral reste visible.
 */
export default function AppNotFound() {
  return (
    <StatusView
      icon="🔎"
      title="Introuvable"
      actions={
        <>
          <ButtonLink href="/dashboard">Mon tableau de bord</ButtonLink>
          <ButtonLink href="/mentors" variant="secondary">
            Trouver un mentor
          </ButtonLink>
        </>
      }
    >
      Ce contenu n&apos;existe pas ou vous n&apos;y avez pas accès.
    </StatusView>
  );
}
