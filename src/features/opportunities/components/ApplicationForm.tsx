"use client";

import { useActionState } from "react";
import { applyToOpportunity, type ApplicationFormState } from "../actions";
import { Field } from "@/components/ui/Input";
import {
  CountedTextArea,
  labelIconClasses,
  RevealActions,
} from "@/components/ui/DialogForm";
import { MessageIcon, PencilIcon, SendIcon } from "@/components/ui/icons";

const initialState: ApplicationFormState = {};

/**
 * Candidature à une opportunité : présentation + moyen de contact, transmis
 * à l'auteur de l'annonce. Affiché par <FormSwap> à la place du détail.
 */
export function ApplicationForm({ opportunityId }: { opportunityId: string }) {
  const [state, formAction, pending] = useActionState(
    applyToOpportunity,
    initialState,
  );
  const errors = state.fieldErrors ?? {};

  return (
    <form action={formAction} className="flex flex-col gap-4" noValidate>
      <input type="hidden" name="opportunity_id" value={opportunityId} />
      <CountedTextArea
        label="Pourquoi cette opportunité vous intéresse"
        icon={<PencilIcon className={labelIconClasses} />}
        name="motivation"
        rows={3}
        maxLength={1000}
        placeholder="Présentez-vous en quelques phrases : formation, expérience, motivation…"
        errors={errors.motivation}
        required
      />
      <Field
        label="Téléphone ou e-mail pour vous recontacter"
        icon={<MessageIcon className={labelIconClasses} />}
        appearance="outline"
        name="contact"
        maxLength={120}
        autoComplete="email"
        placeholder="Ex. +224 6XX XX XX XX ou prenom@exemple.com"
        errors={errors.contact}
        required
      />
      {state.error && (
        <p
          role="alert"
          className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          {state.error}
        </p>
      )}
      <RevealActions
        pending={pending}
        label="Envoyer ma candidature"
        pendingLabel="Envoi…"
        icon={<SendIcon className="size-5" />}
      />
    </form>
  );
}
