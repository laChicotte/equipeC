"use client";

import { useActionState } from "react";
import { requestMentorship, type ActionState } from "../actions";
import { Button } from "@/components/ui/Button";

const initialState: ActionState = {};

/**
 * Demande de mentorat (fiche mentor). Le sujet se choisit comme les créneaux
 * de la maquette : des boutons radio, le choix actif en bleu nuit.
 */
export function RequestForm({
  mentorId,
  mentorFirstName,
  domains,
}: {
  mentorId: string;
  mentorFirstName: string;
  domains: { id: number; name: string; short?: string }[];
}) {
  const [state, formAction, pending] = useActionState(requestMentorship, initialState);
  const errors = state.fieldErrors ?? {};

  return (
    <form action={formAction} className="flex flex-col gap-4" noValidate>
      <input type="hidden" name="mentor_id" value={mentorId} />

      {domains.length > 1 ? (
        <fieldset>
          <legend className="mb-2 text-sm font-medium text-ink-900">Sujet de l&apos;accompagnement</legend>
          <div className="grid grid-cols-2 gap-2">
            {domains.map((d, i) => (
              <label key={d.id} className="cursor-pointer" title={d.name}>
                <input
                  type="radio"
                  name="domain_id"
                  value={d.id}
                  defaultChecked={i === 0}
                  className="peer sr-only"
                />
                <span className="block truncate rounded-xl border border-zinc-200 bg-white px-3 py-2.5 text-center text-sm text-ink-700 transition-colors peer-checked:border-ink-900 peer-checked:bg-ink-900 peer-checked:font-medium peer-checked:text-white peer-focus-visible:outline-2 peer-focus-visible:outline-brand-600">
                  {d.short ?? d.name}
                </span>
              </label>
            ))}
          </div>
        </fieldset>
      ) : (
        <input type="hidden" name="domain_id" value={domains[0]?.id ?? ""} />
      )}

      <div className="flex flex-col gap-1.5">
        <label htmlFor="message" className="text-sm font-medium text-ink-900">
          Votre message à {mentorFirstName}
        </label>
        <textarea
          id="message"
          name="message"
          rows={4}
          maxLength={1000}
          aria-invalid={Boolean(errors.message)}
          placeholder="Présentez-vous et expliquez ce que vous attendez de cet accompagnement."
          className={`rounded-xl border bg-white px-3 py-2.5 text-sm outline-none focus:border-brand-600 focus:ring-2 focus:ring-brand-100 ${
            errors.message ? "border-red-500" : "border-zinc-200"
          }`}
        />
        {errors.message && <p className="text-sm text-red-600">{errors.message.join(" ")}</p>}
      </div>

      {state.error && (
        <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {state.error}
        </p>
      )}

      <Button type="submit" variant="dark" disabled={pending} className="w-full py-4 text-base">
        {pending ? "Envoi…" : "Envoyer ma demande"}
      </Button>
    </form>
  );
}
