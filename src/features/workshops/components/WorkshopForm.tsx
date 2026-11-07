"use client";

import { useActionState } from "react";
import { createWorkshop, type WorkshopFormState } from "../actions";
import { WORKSHOP_DURATIONS, WORKSHOP_DURATION_LABELS } from "../constants";
import { Field, SelectField } from "@/components/ui/Input";
import {
  CountedTextArea,
  DialogFormActions,
  DialogFormLayout,
  FormAside,
  labelIconClasses,
} from "@/components/ui/DialogForm";
import { WorkshopIllustration } from "@/components/ui/illustrations";
import {
  CalendarIcon,
  ClockIcon,
  DocumentIcon,
  LayersIcon,
  PencilIcon,
  UsersIcon,
  VideoIcon,
} from "@/components/ui/icons";

const initialState: WorkshopFormState = {};

/** Formulaire « Organiser un atelier » (mentors). Heure de Conakry. À ouvrir dans une <Modal bare size="xl">. */
export function WorkshopForm({
  domains,
  minDate,
}: {
  domains: { id: number; label: string }[];
  minDate: string;
}) {
  const [state, formAction, pending] = useActionState(
    createWorkshop,
    initialState,
  );
  const errors = state.fieldErrors ?? {};

  return (
    <form
      action={formAction}
      className="flex min-h-0 flex-1 flex-col"
      noValidate
    >
      <DialogFormLayout
        aside={
          <FormAside
            illustration={<WorkshopIllustration />}
            items={[
              "Salle de visio incluse",
              "Inscriptions en ligne",
              "De 2 à 100 places",
              "Heure de Conakry",
            ]}
          />
        }
        footer={
          <>
            <p className="flex items-center gap-2 text-xs text-ink-500 sm:mr-auto">
              <VideoIcon className="size-4 shrink-0 text-brand-700" />
              Une salle de visio est créée automatiquement pour l&apos;atelier.
            </p>
            <DialogFormActions
              pending={pending}
              label="Publier l'atelier"
              pendingLabel="Publication…"
            />
          </>
        }
      >
        <div className="grid gap-5 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Field
              label="Titre de l'atelier"
              icon={<DocumentIcon className={labelIconClasses} />}
              appearance="outline"
              name="title"
              maxLength={120}
              placeholder="Ex. Réussir son entretien Campus France"
              errors={errors.title}
              required
            />
          </div>
          <div className="sm:col-span-2">
            <CountedTextArea
              label="Programme"
              icon={<PencilIcon className={labelIconClasses} />}
              name="description"
              maxLength={1000}
              placeholder="Ce que les participants vont apprendre, à qui s'adresse l'atelier…"
              errors={errors.description}
              required
            />
          </div>
          <SelectField
            label="Domaine"
            icon={<LayersIcon className={labelIconClasses} />}
            appearance="outline"
            name="domain_id"
            placeholder="Tous publics"
            options={domains.map((d) => ({
              value: String(d.id),
              label: d.label,
            }))}
            errors={errors.domain_id}
          />
          <Field
            label="Date et heure (Conakry)"
            icon={<CalendarIcon className={labelIconClasses} />}
            appearance="outline"
            name="scheduled_at"
            type="datetime-local"
            min={minDate}
            errors={errors.scheduled_at}
            required
          />
          <SelectField
            label="Durée"
            icon={<ClockIcon className={labelIconClasses} />}
            appearance="outline"
            name="duration_min"
            defaultValue="60"
            options={WORKSHOP_DURATIONS.map((d) => ({
              value: String(d),
              label: WORKSHOP_DURATION_LABELS[d],
            }))}
            errors={errors.duration_min}
          />
          <Field
            label="Places"
            icon={<UsersIcon className={labelIconClasses} />}
            appearance="outline"
            name="capacity"
            type="number"
            min={2}
            max={100}
            defaultValue={20}
            inputMode="numeric"
            errors={errors.capacity}
          />
          {state.error && (
            <p
              role="alert"
              className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700 sm:col-span-2"
            >
              {state.error}
            </p>
          )}
          {state.success && (
            <p
              role="status"
              className="rounded-xl bg-brand-50 px-4 py-3 text-sm font-medium text-brand-800 sm:col-span-2"
            >
              ✓ {state.success}
            </p>
          )}
        </div>
      </DialogFormLayout>
    </form>
  );
}
