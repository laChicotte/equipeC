"use client";

import { useActionState } from "react";
import { saveProfile, type ProfileFormState } from "../actions";
import { MENTEE_STATUS_LABELS } from "../labels";
import { Field, SelectField, TextAreaField } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import type { Domain, Profile } from "@/types/database";

const initialState: ProfileFormState = {};

const STATUS_OPTIONS = Object.entries(MENTEE_STATUS_LABELS).map(([value, label]) => ({
  value,
  label,
}));

type Props = {
  profile: Profile;
  domains: Domain[];
  selectedDomainIds: number[];
  mode: "onboarding" | "edit";
};

export function ProfileForm({ profile, domains, selectedDomainIds, mode }: Props) {
  const [state, formAction, pending] = useActionState(saveProfile, initialState);
  const errors = state.fieldErrors ?? {};
  const isMentor = profile.role === "mentor";

  return (
    <form action={formAction} className="flex flex-col gap-6" noValidate>
      <input type="hidden" name="mode" value={mode} />

      <section className="grid gap-4 sm:grid-cols-2">
        <Field
          label="Nom complet"
          name="full_name"
          defaultValue={profile.full_name}
          errors={errors.full_name}
          required
        />
        <Field label="Ville" name="city" defaultValue={profile.city ?? ""} errors={errors.city} />
        <div className="sm:col-span-2">
          <Field
            label={isMentor ? "Titre court (ex. « Experte en marketing digital »)" : "Titre court (ex. « Étudiante en informatique »)"}
            name="headline"
            defaultValue={profile.headline ?? ""}
            errors={errors.headline}
          />
        </div>
      </section>

      {isMentor ? (
        <section className="grid gap-4 sm:grid-cols-2">
          <Field
            label="Poste actuel"
            name="job_title"
            defaultValue={profile.job_title ?? ""}
            errors={errors.job_title}
            required
          />
          <Field
            label="Organisation"
            name="organization"
            defaultValue={profile.organization ?? ""}
            errors={errors.organization}
          />
          <Field
            label="Années d'expérience"
            name="years_experience"
            type="number"
            min={0}
            max={60}
            inputMode="numeric"
            defaultValue={profile.years_experience ?? ""}
            errors={errors.years_experience}
            required
          />
          <Field
            label="Disponibilités"
            name="availability"
            placeholder="ex. Mardi et jeudi soir, 1 h par semaine"
            defaultValue={profile.availability ?? ""}
            errors={errors.availability}
          />
          <label className="flex items-center gap-2 text-sm sm:col-span-2">
            <input
              type="checkbox"
              name="is_available"
              defaultChecked={profile.is_available}
              className="size-4 accent-brand-600"
            />
            J&apos;accepte de nouvelles demandes de mentorat
          </label>
        </section>
      ) : (
        <section className="grid gap-4">
          <SelectField
            label="Votre situation"
            name="mentee_status"
            options={STATUS_OPTIONS}
            placeholder="Choisir…"
            defaultValue={profile.mentee_status ?? ""}
            errors={errors.mentee_status}
            required
          />
          <TextAreaField
            label="Vos objectifs"
            name="goals_summary"
            placeholder="ex. Préparer mon dossier Campus France et trouver une formation en data."
            defaultValue={profile.goals_summary ?? ""}
            errors={errors.goals_summary}
            required
          />
        </section>
      )}

      <TextAreaField
        label={isMentor ? "Votre parcours" : "Présentez-vous"}
        name="bio"
        hint="Facultatif, 2000 caractères maximum."
        defaultValue={profile.bio ?? ""}
        errors={errors.bio}
      />

      <fieldset>
        <legend className="mb-2 text-sm font-medium text-zinc-800">
          {isMentor ? "Vos domaines d'expertise" : "Les domaines qui vous intéressent"}
        </legend>
        <div className="flex flex-wrap gap-2">
          {domains.map((domain) => (
            <label
              key={domain.id}
              className="cursor-pointer rounded-full border border-zinc-300 bg-white px-3 py-1.5 text-sm has-[:checked]:border-brand-600 has-[:checked]:bg-brand-50 has-[:checked]:text-brand-800"
            >
              <input
                type="checkbox"
                name="domain_ids"
                value={domain.id}
                defaultChecked={selectedDomainIds.includes(domain.id)}
                className="sr-only"
              />
              {domain.name}
            </label>
          ))}
        </div>
        {errors.domain_ids && (
          <p className="mt-2 text-sm text-red-600">{errors.domain_ids.join(" ")}</p>
        )}
      </fieldset>

      {state.error && (
        <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {state.error}
        </p>
      )}
      {state.success && (
        <p role="status" className="rounded-lg bg-brand-50 px-3 py-2 text-sm text-brand-800">
          {state.success}
        </p>
      )}

      <div>
        <Button type="submit" disabled={pending}>
          {pending ? "Enregistrement…" : mode === "onboarding" ? "Terminer" : "Enregistrer"}
        </Button>
      </div>
    </form>
  );
}
