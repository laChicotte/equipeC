"use client";

import { useActionState } from "react";
import {
  cancelWorkshop,
  unregisterFromWorkshop,
  type WorkshopActionState,
} from "../actions";

// L'inscription passe par un formulaire : voir <WorkshopRegistrationForm>
const ACTIONS = {
  unregister: {
    action: unregisterFromWorkshop,
    label: "Se désinscrire",
    pending: "…",
    style:
      "border border-slate-200 text-ink-700 hover:bg-slate-100 hover:text-ink-900",
  },
  cancel: {
    action: cancelWorkshop,
    label: "Annuler l'atelier",
    pending: "…",
    style: "border border-red-200 text-red-600 hover:bg-red-50",
  },
} as const;

const initialState: WorkshopActionState = {};

/** Bouton d'action sur un atelier (inscription, désinscription, annulation). */
export function WorkshopButton({
  workshopId,
  kind,
}: {
  workshopId: string;
  kind: keyof typeof ACTIONS;
}) {
  const config = ACTIONS[kind];
  const [state, formAction, pending] = useActionState(
    config.action,
    initialState,
  );
  return (
    <form
      action={formAction}
      onSubmit={(e) => {
        if (
          kind === "cancel" &&
          !window.confirm(
            "Annuler cet atelier ? Les inscrits le verront « Annulé ».",
          )
        ) {
          e.preventDefault();
        }
      }}
      className="flex flex-col items-end gap-1"
    >
      <input type="hidden" name="workshop_id" value={workshopId} />
      <button
        disabled={pending}
        className={`rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors disabled:opacity-60 ${config.style}`}
      >
        {pending ? config.pending : config.label}
      </button>
      {state.error && (
        <p role="alert" className="text-xs text-red-600">
          {state.error}
        </p>
      )}
    </form>
  );
}
