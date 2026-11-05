"use client";

import { useActionState } from "react";
import { createOpportunity, type OpportunityFormState } from "../actions";
import { OPPORTUNITY_KIND_LABELS } from "@/features/profiles/labels";
import { Field, SelectField, TextAreaField } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

const initialState: OpportunityFormState = {};

/** Partage d'une opportunité (tous les membres). */
export function OpportunityForm({ minDate }: { minDate: string }) {
  const [state, formAction, pending] = useActionState(createOpportunity, initialState);
  const errors = state.fieldErrors ?? {};

  return (
    <form key={state.savedAt ?? 0} action={formAction} className="grid gap-3 sm:grid-cols-2" noValidate>
      <SelectField
        label="Type"
        name="kind"
        placeholder="Choisir…"
        options={Object.entries(OPPORTUNITY_KIND_LABELS).map(([value, k]) => ({
          value,
          label: `${k.icon} ${k.label}`,
        }))}
        errors={errors.kind}
      />
      <Field
        label="Date limite (facultative)"
        name="deadline"
        type="date"
        min={minDate}
        errors={errors.deadline}
      />
      <div className="sm:col-span-2">
        <Field label="Intitulé" name="title" maxLength={150} errors={errors.title} required />
      </div>
      <Field label="Organisation" name="organization" maxLength={120} errors={errors.organization} />
      <Field label="Lieu" name="location" maxLength={80} placeholder="ex. Conakry, en ligne" errors={errors.location} />
      <div className="sm:col-span-2">
        <TextAreaField
          label="Description"
          name="description"
          rows={4}
          maxLength={1500}
          placeholder="Profil recherché, conditions, comment postuler…"
          errors={errors.description}
          required
        />
      </div>
      <div className="sm:col-span-2">
        <Field label="Lien (facultatif)" name="url" type="url" inputMode="url" placeholder="https://" errors={errors.url} />
      </div>
      {state.error && (
        <p role="alert" className="text-sm text-red-600 sm:col-span-2">
          {state.error}
        </p>
      )}
      {state.savedAt && !state.error && (
        <p role="status" className="text-sm text-brand-700 sm:col-span-2">
          Opportunité partagée ✓
        </p>
      )}
      <div className="sm:col-span-2">
        <Button type="submit" disabled={pending}>
          {pending ? "Partage…" : "Partager l'opportunité"}
        </Button>
      </div>
    </form>
  );
}
