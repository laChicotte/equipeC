"use client";

import { useActionState, useState } from "react";
import { saveTestimonial, type TestimonialFormState } from "../actions";
import { Button } from "@/components/ui/Button";

const initialState: TestimonialFormState = {};

/** Bilan de fin de mentorat (étape 7 « restitution des expériences »). */
export function TestimonialForm({
  mentorshipId,
  isMentor,
  initial,
}: {
  mentorshipId: string;
  isMentor: boolean;
  initial: { content: string; is_public: boolean } | null;
}) {
  const [state, formAction, pending] = useActionState(saveTestimonial, initialState);
  const [length, setLength] = useState(initial?.content.length ?? 0);
  const errors = state.fieldErrors ?? {};

  return (
    <form action={formAction} className="flex flex-col gap-3" noValidate>
      <input type="hidden" name="mentorship_id" value={mentorshipId} />
      <div className="flex items-baseline justify-between">
        <label htmlFor="content" className="text-sm font-medium text-ink-700">
          {isMentor ? "Ce que cet accompagnement a permis" : "Ce que ce mentorat m'a apporté"}
        </label>
        <span className="text-xs text-ink-500">{length}/1000</span>
      </div>
      <textarea
        id="content"
        name="content"
        rows={4}
        maxLength={1000}
        defaultValue={initial?.content ?? ""}
        onChange={(e) => setLength(e.target.value.length)}
        placeholder={
          isMentor
            ? "ex. Nous avons structuré son projet, il a obtenu son premier financement…"
            : "ex. Grâce à ma mentore, j'ai déposé mon dossier et gagné en confiance…"
        }
        className="w-full rounded-xl border border-zinc-200 bg-white px-3.5 py-3 text-sm leading-relaxed outline-none focus:border-brand-600 focus:ring-2 focus:ring-brand-100"
      />
      {errors.content && <p className="text-sm text-red-600">{errors.content.join(" ")}</p>}
      <label className="flex items-start gap-2.5 text-sm text-ink-700">
        <input type="checkbox" name="is_public" defaultChecked={initial?.is_public ?? true} className="mt-0.5 size-4 accent-brand-600" />
        <span>
          Partager ce témoignage sur la page « Impact »
          <span className="block text-xs text-ink-500">Seuls votre prénom, votre rôle et le domaine apparaissent.</span>
        </span>
      </label>
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
        {pending ? "Enregistrement…" : initial ? "Mettre à jour mon bilan" : "Enregistrer mon bilan"}
      </Button>
    </form>
  );
}
