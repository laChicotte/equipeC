"use client";

import { useActionState } from "react";
import { createOpportunity, type OpportunityFormState } from "../actions";
import { OPPORTUNITY_KIND_LABELS } from "@/features/profiles/labels";
import { Field, SelectField } from "@/components/ui/Input";
import {
  CountedTextArea,
  DialogFormActions,
  DialogFormLayout,
  FormAside,
  labelIconClasses,
} from "@/components/ui/DialogForm";
import { BriefcaseIllustration } from "@/components/ui/illustrations";
import {
  BuildingIcon,
  CalendarIcon,
  DocumentIcon,
  LayersIcon,
  LinkIcon,
  MapPinIcon,
  PencilIcon,
} from "@/components/ui/icons";

const initialState: OpportunityFormState = {};

/** Types mis en avant dans la colonne illustrée. */
const ASIDE_KINDS = [
  "stage",
  "emploi",
  "bourse",
  "financement",
  "evenement",
] as const;

/** Partage d'une opportunité (tous les membres). À ouvrir dans une <Modal bare size="xl">. */
export function OpportunityForm({ minDate }: { minDate: string }) {
  const [state, formAction, pending] = useActionState(
    createOpportunity,
    initialState,
  );
  const errors = state.fieldErrors ?? {};

  return (
    <form
      key={state.savedAt ?? 0}
      action={formAction}
      className="flex min-h-0 flex-1 flex-col"
      noValidate
    >
      <DialogFormLayout
        aside={
          <FormAside
            illustration={<BriefcaseIllustration />}
            items={ASIDE_KINDS.map((k) => OPPORTUNITY_KIND_LABELS[k].label)}
            more
          />
        }
        footer={
          <DialogFormActions
            pending={pending}
            label="Publier l'opportunité"
            pendingLabel="Publication…"
          />
        }
      >
        <div className="grid gap-5 sm:grid-cols-[3fr_2fr]">
          <SelectField
            label="Type d'opportunité"
            icon={<LayersIcon className={labelIconClasses} />}
            appearance="outline"
            required
            name="kind"
            placeholder="Choisir le type d'opportunité…"
            options={Object.entries(OPPORTUNITY_KIND_LABELS).map(
              ([value, k]) => ({ value, label: k.label }),
            )}
            errors={errors.kind}
          />
          <Field
            label="Date limite (facultative)"
            icon={<CalendarIcon className={labelIconClasses} />}
            appearance="outline"
            name="deadline"
            type="date"
            min={minDate}
            errors={errors.deadline}
          />
          <div className="sm:col-span-2">
            <Field
              label="Intitulé"
              icon={<DocumentIcon className={labelIconClasses} />}
              appearance="outline"
              name="title"
              maxLength={150}
              placeholder="Ex. Stage en développement web"
              errors={errors.title}
              required
            />
          </div>
          <Field
            label="Organisation"
            icon={<BuildingIcon className={labelIconClasses} />}
            appearance="outline"
            name="organization"
            maxLength={120}
            placeholder="Ex. IFG, Campus France, Orange Guinée…"
            errors={errors.organization}
          />
          <Field
            label="Lieu"
            icon={<MapPinIcon className={labelIconClasses} />}
            appearance="outline"
            name="location"
            maxLength={80}
            placeholder="Ex. Conakry, en ligne, hybride…"
            errors={errors.location}
          />
          <div className="sm:col-span-2">
            <CountedTextArea
              label="Description"
              icon={<PencilIcon className={labelIconClasses} />}
              name="description"
              maxLength={1500}
              placeholder="Profil recherché, conditions, avantages, comment postuler…"
              errors={errors.description}
              required
            />
          </div>
          <div className="sm:col-span-2">
            <Field
              label="Lien (facultatif)"
              icon={<LinkIcon className={labelIconClasses} />}
              leading={<LinkIcon className="size-5" />}
              appearance="outline"
              name="url"
              type="url"
              inputMode="url"
              placeholder="https://"
              errors={errors.url}
            />
          </div>
          {state.error && (
            <p
              role="alert"
              className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700 sm:col-span-2"
            >
              {state.error}
            </p>
          )}
          {state.savedAt && !state.error && (
            <p
              role="status"
              className="rounded-xl bg-brand-50 px-4 py-3 text-sm font-medium text-brand-800 sm:col-span-2"
            >
              Opportunité partagée ✓
            </p>
          )}
        </div>
      </DialogFormLayout>
    </form>
  );
}
