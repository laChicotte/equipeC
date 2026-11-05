"use client";

import type { ComponentType } from "react";
import { useActionState } from "react";
import { signup, type AuthFormState } from "../actions";
import { Field } from "@/components/ui/Input";
import { PasswordField } from "@/components/ui/PasswordField";
import { Button } from "@/components/ui/Button";
import { ArrowRightIcon, CheckIcon, FeatherIcon, GraduationIcon, LockIcon, MailIcon, UserIcon } from "@/components/ui/icons";
import type { UserRole } from "@/types/database";

const initialState: AuthFormState = {};

// Les valeurs (« mentee » / « mentor ») sont celles attendues par l'action serveur
const ROLE_OPTIONS: { value: UserRole; title: string; text: string; icon: ComponentType<{ className?: string }> }[] = [
  { value: "mentee", title: "Apprendre", text: "Étudiant, diplômé, entrepreneur, lecteur…", icon: GraduationIcon },
  { value: "mentor", title: "Transmettre", text: "Professionnel, auteur… (3 ans d'expérience min.)", icon: FeatherIcon },
];

const iconClass = "h-[18px] w-[18px]";

export function SignupForm({ defaultRole = "mentee" }: { defaultRole?: UserRole }) {
  const [state, formAction, pending] = useActionState(signup, initialState);

  if (state.info) {
    return (
      <p role="status" className="rounded-xl bg-brand-50 px-4 py-4 text-sm leading-relaxed text-brand-800">
        {state.info}
      </p>
    );
  }

  return (
    <form action={formAction} className="flex flex-col gap-4 [@media(max-height:720px)]:lg:gap-3" noValidate>
      <fieldset>
        <legend className="mb-2 text-sm font-semibold text-ink-900">Vous êtes ici pour…</legend>
        <div className="grid gap-2.5 sm:grid-cols-2">
          {ROLE_OPTIONS.map(({ value, title, text, icon: Icon }) => (
            <label
              key={value}
              className="group flex cursor-pointer flex-col gap-1.5 rounded-2xl border border-zinc-200 bg-white p-3 transition-colors hover:border-brand-200 has-[:checked]:border-brand-600 has-[:checked]:bg-brand-50 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-brand-600"
            >
              <input
                type="radio"
                name="role"
                value={value}
                defaultChecked={value === defaultRole}
                className="sr-only"
              />
              {/* Ligne 1 : icône, rôle, pastille de sélection */}
              <span className="flex items-center gap-2.5">
                <span className="inline-flex size-8 shrink-0 items-center justify-center rounded-lg bg-paper text-brand-700 group-has-[:checked]:bg-white">
                  <Icon className="size-[18px]" />
                </span>
                <span className="flex-1 font-semibold text-ink-900">{title}</span>
                <span className="inline-flex size-5 shrink-0 items-center justify-center rounded-full border border-zinc-300 text-transparent group-has-[:checked]:border-brand-600 group-has-[:checked]:bg-brand-600 group-has-[:checked]:text-white">
                  <CheckIcon className="size-3" />
                </span>
              </span>
              {/* Ligne 2 : description (masquée sur les écrans très peu hauts) */}
              <span className="text-xs leading-snug text-ink-500 [@media(max-height:720px)]:lg:hidden">{text}</span>
            </label>
          ))}
        </div>
        {state.fieldErrors?.role && (
          <p className="mt-1.5 text-sm text-red-600">{state.fieldErrors.role.join(" ")}</p>
        )}
      </fieldset>

      <Field
        label="Nom complet"
        name="full_name"
        autoComplete="name"
        placeholder="Prénom et nom"
        icon={<UserIcon className={iconClass} />}
        appearance="outline"
        hideRequiredMark
        required
        errors={state.fieldErrors?.full_name}
      />
      <Field
        label="Email"
        name="email"
        type="email"
        autoComplete="email"
        placeholder="Entrez votre adresse email"
        icon={<MailIcon className={iconClass} />}
        appearance="outline"
        hideRequiredMark
        required
        errors={state.fieldErrors?.email}
      />
      <PasswordField
        label="Mot de passe"
        name="password"
        autoComplete="new-password"
        placeholder="8 caractères minimum"
        icon={<LockIcon className={iconClass} />}
        appearance="outline"
        hideRequiredMark
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

      <Button
        type="submit"
        disabled={pending}
        className="bg-gradient-to-r from-brand-600 to-brand-700 py-3.5 text-base hover:from-brand-700 hover:to-brand-700"
      >
        <ArrowRightIcon className="h-5 w-5" />
        {pending ? "Création du compte…" : "Créer mon compte"}
      </Button>
    </form>
  );
}
