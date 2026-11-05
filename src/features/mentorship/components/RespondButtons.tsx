"use client";

import { useActionState } from "react";
import { respondToRequest, type ActionState } from "../actions";
import { Button } from "@/components/ui/Button";

const initialState: ActionState = {};

/** Boutons Accepter / Refuser d'une demande (côté mentor). */
export function RespondButtons({ mentorshipId }: { mentorshipId: string }) {
  const [state, formAction, pending] = useActionState(respondToRequest, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-2">
      <input type="hidden" name="mentorship_id" value={mentorshipId} />
      <div className="flex flex-wrap gap-2">
        {/* Le bouton cliqué envoie sa propre valeur "decision" */}
        <Button type="submit" name="decision" value="accepted" disabled={pending}>
          Accepter
        </Button>
        <Button type="submit" name="decision" value="declined" variant="secondary" disabled={pending}>
          Refuser
        </Button>
      </div>
      {state.error && (
        <p role="alert" className="text-sm text-red-600">
          {state.error}
        </p>
      )}
    </form>
  );
}
