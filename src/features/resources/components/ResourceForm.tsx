"use client";

import { useActionState } from "react";
import { createResource, type ResourceFormState } from "../actions";
import { RESOURCE_KIND_LABELS } from "@/features/profiles/labels";
import { Field, SelectField, TextAreaField } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

const initialState: ResourceFormState = {};

/** Publication d'une ressource (mentors). */
export function ResourceForm({ domains }: { domains: { id: number; name: string }[] }) {
  const [state, formAction, pending] = useActionState(createResource, initialState);
  const errors = state.fieldErrors ?? {};

  return (
    <form key={state.savedAt ?? 0} action={formAction} className="grid gap-4 sm:grid-cols-2" noValidate>
      <SelectField
        label="Type"
        required
        name="kind"
        placeholder="Choisir…"
        options={Object.entries(RESOURCE_KIND_LABELS).map(([value, k]) => ({ value, label: `${k.icon} ${k.label}` }))}
        errors={errors.kind}
      />
      <SelectField
        label="Domaine"
        name="domain_id"
        placeholder="Tous domaines"
        options={domains.map((d) => ({ value: String(d.id), label: d.name }))}
        errors={errors.domain_id}
      />
      <div className="sm:col-span-2">
        <Field label="Titre" name="title" maxLength={150} errors={errors.title} required />
      </div>
      <div className="sm:col-span-2">
        <TextAreaField
          label="Pourquoi est-ce utile ?"
          name="description"
          rows={3}
          maxLength={1000}
          placeholder="Votre conseil ou le contenu de la ressource, en quelques lignes."
          errors={errors.description}
          required
        />
      </div>
      <div className="sm:col-span-2">
        <Field
          label="Lien (facultatif)"
          name="url"
          type="url"
          inputMode="url"
          placeholder="https://"
          errors={errors.url}
        />
      </div>
      {state.error && (
        <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700 sm:col-span-2">
          {state.error}
        </p>
      )}
      {state.savedAt && !state.error && (
        <p role="status" className="rounded-xl bg-brand-50 px-4 py-3 text-sm font-medium text-brand-800 sm:col-span-2">
          Ressource publiée ✓
        </p>
      )}
      <div className="sm:col-span-2">
        <Button type="submit" disabled={pending} className="w-full sm:w-auto">
          {pending ? "Publication…" : "Publier la ressource"}
        </Button>
      </div>
    </form>
  );
}
