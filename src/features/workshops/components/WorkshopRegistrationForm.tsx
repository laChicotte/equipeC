"use client";

import { useActionState } from "react";
import { registerToWorkshop, type RegistrationFormState } from "../actions";
import { WORKSHOP_LEVELS, WORKSHOP_LEVEL_LABELS } from "../constants";
import { SelectField } from "@/components/ui/Input";
import {
  CountedTextArea,
  labelIconClasses,
  RevealActions,
} from "@/components/ui/DialogForm";
import { ChartIcon, PencilIcon, UserPlusIcon } from "@/components/ui/icons";

const initialState: RegistrationFormState = {};

/**
 * Formulaire d'inscription à un atelier : niveau + attentes, transmis à
 * l'animateur pour qu'il adapte son contenu. Affiché par <FormSwap> à la place du détail.
 */
export function WorkshopRegistrationForm({
  workshopId,
}: {
  workshopId: string;
}) {
  const [state, formAction, pending] = useActionState(
    registerToWorkshop,
    initialState,
  );
  const errors = state.fieldErrors ?? {};

  return (
    <form action={formAction} className="flex flex-col gap-4" noValidate>
      <input type="hidden" name="workshop_id" value={workshopId} />
      <SelectField
        label="Votre niveau sur ce sujet"
        icon={<ChartIcon className={labelIconClasses} />}
        appearance="outline"
        name="level"
        required
        placeholder="Choisir…"
        options={WORKSHOP_LEVELS.map((l) => ({
          value: l,
          label: WORKSHOP_LEVEL_LABELS[l],
        }))}
        errors={errors.level}
      />
      <CountedTextArea
        label="Qu'attendez-vous de cet atelier ?"
        icon={<PencilIcon className={labelIconClasses} />}
        name="expectations"
        rows={3}
        maxLength={500}
        placeholder="Ex. Préparer mon entretien du mois prochain, savoir quelles questions on me posera…"
        errors={errors.expectations}
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
        label="Confirmer mon inscription"
        pendingLabel="Inscription…"
        icon={<UserPlusIcon className="size-5" />}
      />
    </form>
  );
}
