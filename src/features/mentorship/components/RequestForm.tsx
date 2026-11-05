"use client";

import { useActionState } from "react";
import { requestMentorship, type ActionState } from "../actions";
import { SelectField, TextAreaField } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

const initialState: ActionState = {};

/** Formulaire de demande de mentorat (affiché sur la fiche d'un mentor). */
export function RequestForm({
  mentorId,
  mentorFirstName,
  domains,
}: {
  mentorId: string;
  mentorFirstName: string;
  domains: { id: number; name: string }[];
}) {
  const [state, formAction, pending] = useActionState(requestMentorship, initialState);
  const errors = state.fieldErrors ?? {};

  return (
    <form action={formAction} className="flex flex-col gap-4" noValidate>
      <input type="hidden" name="mentor_id" value={mentorId} />

      {domains.length > 1 ? (
        <SelectField
          label="Sujet de l'accompagnement"
          name="domain_id"
          options={domains.map((d) => ({ value: String(d.id), label: d.name }))}
          errors={errors.domain_id}
        />
      ) : (
        <input type="hidden" name="domain_id" value={domains[0]?.id ?? ""} />
      )}

      <TextAreaField
        label={`Votre message à ${mentorFirstName}`}
        name="message"
        rows={5}
        placeholder="Présentez-vous en quelques lignes et expliquez ce que vous attendez de cet accompagnement."
        errors={errors.message}
        required
      />

      {state.error && (
        <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {state.error}
        </p>
      )}

      <Button type="submit" disabled={pending}>
        {pending ? "Envoi…" : "Envoyer ma demande"}
      </Button>
    </form>
  );
}
