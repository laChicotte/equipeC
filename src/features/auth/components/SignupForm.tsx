"use client";

import { useActionState } from "react";
import { signup, type AuthFormState } from "../actions";
import { Field } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import type { UserRole } from "@/types/database";

const initialState: AuthFormState = {};

const ROLE_OPTIONS: { value: UserRole; title: string; text: string }[] = [
  { value: "mentee", title: "Je cherche un mentor", text: "Étudiant, jeune diplômé, entrepreneur…" },
  { value: "mentor", title: "Je veux accompagner", text: "Professionnel expérimenté" },
];

export function SignupForm({ defaultRole = "mentee" }: { defaultRole?: UserRole }) {
  const [state, formAction, pending] = useActionState(signup, initialState);

  if (state.info) {
    return (
      <p role="status" className="rounded-lg bg-brand-50 px-3 py-3 text-sm text-brand-800">
        {state.info}
      </p>
    );
  }

  return (
    <form action={formAction} className="flex flex-col gap-4" noValidate>
      <fieldset className="flex flex-col gap-2">
        <legend className="mb-1.5 text-sm font-medium text-ink-700">Vous êtes…</legend>
        <div className="grid gap-2 sm:grid-cols-2">
          {ROLE_OPTIONS.map((option) => (
            <label
              key={option.value}
              className="flex cursor-pointer flex-col rounded-xl border border-zinc-300 bg-white p-3 has-[:checked]:border-brand-600 has-[:checked]:bg-brand-50"
            >
              <span className="flex items-center gap-2 text-sm font-medium">
                <input
                  type="radio"
                  name="role"
                  value={option.value}
                  defaultChecked={option.value === defaultRole}
                  className="accent-brand-600"
                />
                {option.title}
              </span>
              <span className="pl-6 text-xs text-ink-500">{option.text}</span>
            </label>
          ))}
        </div>
        {state.fieldErrors?.role && (
          <p className="text-sm text-red-600">{state.fieldErrors.role.join(" ")}</p>
        )}
      </fieldset>

      <Field
        label="Nom complet"
        name="full_name"
        autoComplete="name"
        required
        errors={state.fieldErrors?.full_name}
      />
      <Field
        label="Email"
        name="email"
        type="email"
        autoComplete="email"
        required
        errors={state.fieldErrors?.email}
      />
      <Field
        label="Mot de passe (8 caractères minimum)"
        name="password"
        type="password"
        autoComplete="new-password"
        required
        errors={state.fieldErrors?.password}
      />

      <div>
        <label className="flex items-start gap-3 text-sm text-ink-700">
          <input type="checkbox" name="charter" required className="mt-0.5 size-4 shrink-0 accent-brand-600" />
          <span>
            J&apos;ai lu et j&apos;accepte la{" "}
            <a href="/charte" target="_blank" className="font-semibold text-brand-700 underline-offset-2 hover:underline">
              charte du mentorat
            </a>
            .
          </span>
        </label>
        {state.fieldErrors?.charter && (
          <p className="mt-1 text-sm text-red-600">{state.fieldErrors.charter.join(" ")}</p>
        )}
      </div>

      {state.error && (
        <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {state.error}
        </p>
      )}

      <Button type="submit" disabled={pending}>
        {pending ? "Création du compte…" : "Créer mon compte"}
      </Button>
    </form>
  );
}
