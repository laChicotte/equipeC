"use client";

import { useActionState } from "react";
import { createSession, type SessionFormState } from "../actions";
import { DURATIONS, DURATION_LABELS } from "../constants";
import { Field, SelectField } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

const initialState: SessionFormState = {};

/** Formulaire de planification d'une séance (heure de Conakry). */
export function SessionForm({ mentorshipId, minDate }: { mentorshipId: string; minDate: string }) {
  const [state, formAction, pending] = useActionState(createSession, initialState);
  const errors = state.fieldErrors ?? {};

  return (
    <form action={formAction} className="flex flex-col gap-3" noValidate>
      <input type="hidden" name="mentorship_id" value={mentorshipId} />
      <Field
        label="Date et heure (heure de Conakry)"
        name="scheduled_at"
        type="datetime-local"
        min={minDate}
        required
        errors={errors.scheduled_at}
      />
      <SelectField
        label="Durée"
        name="duration_min"
        defaultValue="60"
        options={DURATIONS.map((d) => ({ value: String(d), label: DURATION_LABELS[d] }))}
        errors={errors.duration_min}
      />
      <Field
        label="Sujet (facultatif)"
        name="topic"
        maxLength={200}
        placeholder="ex. Relecture de mon CV"
        errors={errors.topic}
      />
      {state.error && (
        <p role="alert" className="text-sm text-red-600">
          {state.error}
        </p>
      )}
      {state.success && (
        <p role="status" className="rounded-lg bg-brand-50 px-3 py-2 text-sm text-brand-800">
          {state.success}
        </p>
      )}
      <Button type="submit" disabled={pending}>
        {pending ? "Planification…" : "Planifier la séance"}
      </Button>
    </form>
  );
}
