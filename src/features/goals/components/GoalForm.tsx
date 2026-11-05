"use client";

import { useActionState } from "react";
import { createGoal, type GoalFormState } from "../actions";
import { Button } from "@/components/ui/Button";

const initialState: GoalFormState = {};

/** Ajout d'un objectif : titre + échéance facultative. */
export function GoalForm({ mentorshipId, minDate }: { mentorshipId: string; minDate: string }) {
  const [state, formAction, pending] = useActionState(createGoal, initialState);
  const errors = state.fieldErrors ?? {};

  return (
    // key : le formulaire est recréé (donc vidé) après chaque ajout réussi
    <form key={state.savedAt ?? 0} action={formAction} className="flex flex-col gap-2" noValidate>
      <input type="hidden" name="mentorship_id" value={mentorshipId} />
      <div className="flex flex-col gap-2 sm:flex-row">
        <label htmlFor="goal-title" className="sr-only">
          Nouvel objectif
        </label>
        <input
          id="goal-title"
          name="title"
          maxLength={200}
          placeholder="ex. Finaliser mon CV"
          aria-invalid={Boolean(errors.title)}
          className="min-w-0 flex-1 rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-brand-600 focus:ring-2 focus:ring-brand-100"
        />
        <label htmlFor="goal-due" className="sr-only">
          Échéance (facultative)
        </label>
        <input
          id="goal-due"
          name="due_date"
          type="date"
          min={minDate}
          title="Échéance (facultative)"
          className="rounded-lg border border-zinc-300 px-3 py-2 text-sm text-zinc-700 outline-none focus:border-brand-600 focus:ring-2 focus:ring-brand-100"
        />
        <Button type="submit" disabled={pending} className="py-2">
          {pending ? "…" : "Ajouter"}
        </Button>
      </div>
      {[...(errors.title ?? []), ...(errors.due_date ?? [])].map((message) => (
        <p key={message} className="text-sm text-red-600">
          {message}
        </p>
      ))}
      {state.error && (
        <p role="alert" className="text-sm text-red-600">
          {state.error}
        </p>
      )}
    </form>
  );
}
