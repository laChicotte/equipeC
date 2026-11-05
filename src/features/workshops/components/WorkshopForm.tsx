"use client";

import { useActionState } from "react";
import { createWorkshop, type WorkshopFormState } from "../actions";
import { WORKSHOP_DURATIONS, WORKSHOP_DURATION_LABELS } from "../constants";
import { Field, SelectField, TextAreaField } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

const initialState: WorkshopFormState = {};

/** Formulaire « Organiser un atelier » (mentors). Heure de Conakry. */
export function WorkshopForm({
  domains,
  minDate,
}: {
  domains: { id: number; label: string }[];
  minDate: string;
}) {
  const [state, formAction, pending] = useActionState(createWorkshop, initialState);
  const errors = state.fieldErrors ?? {};

  return (
    <form action={formAction} className="flex flex-col gap-4" noValidate>
      <Field label="Titre de l'atelier *" name="title" maxLength={120} placeholder="ex. Réussir son entretien Campus France" errors={errors.title} />
      <TextAreaField
        label="Programme *"
        name="description"
        maxLength={1000}
        rows={3}
        placeholder="Ce que les participants vont apprendre, à qui s'adresse l'atelier…"
        errors={errors.description}
      />
      <SelectField
        label="Domaine"
        name="domain_id"
        placeholder="Tous publics"
        options={domains.map((d) => ({ value: String(d.id), label: d.label }))}
        errors={errors.domain_id}
      />
      <Field
        label="Date et heure (heure de Conakry) *"
        name="scheduled_at"
        type="datetime-local"
        min={minDate}
        errors={errors.scheduled_at}
      />
      <div className="grid grid-cols-2 gap-3">
        <SelectField
          label="Durée"
          name="duration_min"
          defaultValue="60"
          options={WORKSHOP_DURATIONS.map((d) => ({ value: String(d), label: WORKSHOP_DURATION_LABELS[d] }))}
          errors={errors.duration_min}
        />
        <Field label="Places" name="capacity" type="number" min={2} max={100} defaultValue={20} inputMode="numeric" errors={errors.capacity} />
      </div>
      {state.error && (
        <p role="alert" className="text-sm text-red-600">
          {state.error}
        </p>
      )}
      {state.success && (
        <p role="status" className="rounded-lg bg-brand-50 px-3 py-2 text-sm text-brand-800">
          ✓ {state.success}
        </p>
      )}
      <Button type="submit" disabled={pending}>
        {pending ? "Publication…" : "Publier l'atelier"}
      </Button>
      <p className="text-xs text-ink-500">Une salle de visio est créée automatiquement pour l&apos;atelier.</p>
    </form>
  );
}
