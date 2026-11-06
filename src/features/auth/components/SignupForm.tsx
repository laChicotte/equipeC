"use client";

import type { ComponentType } from "react";
import { useActionState, useState } from "react";
import { signup, type AuthFormState } from "../actions";
import { Field } from "@/components/ui/Input";
import { PasswordField } from "@/components/ui/PasswordField";
import { Button } from "@/components/ui/Button";
import { ArrowRightIcon, CheckIcon, SparkleIcon, FeatherIcon, GraduationIcon, LockIcon, MailIcon, UserIcon } from "@/components/ui/icons";
import type { UserRole } from "@/types/database";

const initialState: AuthFormState = {};

// Les valeurs (« mentee » / « mentor ») sont celles attendues par l'action serveur
const ROLE_OPTIONS: { value: UserRole; title: string; text: string; icon: ComponentType<{ className?: string }> }[] = [
  { value: "mentee", title: "Apprendre", text: "Étudiant, diplômé, entrepreneur, lecteur…", icon: GraduationIcon },
  { value: "mentor", title: "Transmettre", text: "Professionnel, auteur… (3 ans d'expérience min.)", icon: FeatherIcon },
];

const iconClass = "h-[18px] w-[18px]";

/** Ce qui se passe après l'inscription, selon le rôle choisi (parcours réel de l'application). */
const ROLE_HINTS: Record<UserRole, string> = {
  mentee: "Juste après, vous décrirez votre objectif : nous vous proposerons des mentors compatibles.",
  mentor: "Juste après, vous indiquerez vos domaines et disponibilités pour apparaître auprès des mentorés.",
};

export function SignupForm({ defaultRole = "mentee" }: { defaultRole?: UserRole }) {
  const [state, formAction, pending] = useActionState(signup, initialState);
  // Rôle sélectionné : adapte le texte d'aide et le bouton (la valeur envoyée reste celle du bouton radio)
  const [role, setRole] = useState<UserRole>(defaultRole);

  if (state.info) {
    return (
      <p role="status" className="rounded-xl bg-brand-50 px-4 py-4 text-sm leading-relaxed text-brand-800">
        {state.info}
      </p>
    );
  }

  return (
    <form action={formAction} className="flex flex-col gap-3 sm:gap-4 short:sm:gap-3 tiny:sm:gap-2.5" noValidate>
      <fieldset>
        <legend className="mb-2 text-sm font-semibold text-ink-900 tiny:mb-1.5">Vous êtes ici pour…</legend>
        <div className="grid grid-cols-2 gap-2 sm:gap-2.5">
          {ROLE_OPTIONS.map(({ value, title, text, icon: Icon }) => (
            <label
              key={value}
              className="group flex cursor-pointer flex-col gap-1.5 rounded-2xl border border-slate-200 bg-white p-2.5 sm:p-3 short:sm:p-2.5 transition-colors hover:border-brand-200 has-[:checked]:border-brand-600 has-[:checked]:bg-brand-50 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-brand-600"
            >
              <input
                type="radio"
                name="role"
                value={value}
                defaultChecked={value === defaultRole}
                onChange={() => setRole(value)}
                className="sr-only"
              />
              {/* Ligne 1 : icône, rôle, pastille de sélection */}
              <span className="flex items-center gap-2.5">
                <span className="inline-flex size-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-brand-600 group-has-[:checked]:bg-white max-sm:hidden">
                  <Icon className="size-[18px]" />
                </span>
                <span className="flex-1 font-semibold text-ink-900">{title}</span>
                <span className="inline-flex size-5 shrink-0 items-center justify-center rounded-full border border-slate-300 text-transparent group-has-[:checked]:border-brand-600 group-has-[:checked]:bg-brand-700 group-has-[:checked]:text-white">
                  <CheckIcon className="size-3" />
                </span>
              </span>
              {/* Ligne 2 : description (masquée sur téléphone et sur les écrans peu hauts) */}
              <span className="text-xs leading-snug text-ink-500 max-sm:hidden short:hidden">{text}</span>
            </label>
          ))}
        </div>
        {/* Aide adaptée au rôle (masquée sur téléphone et sur les écrans peu hauts : pas de défilement) */}
        <p
          key={role}
          aria-live="polite"
          className="mt-2.5 flex animate-fade-up items-start gap-2 rounded-xl bg-slate-50 px-3 py-2 text-xs leading-snug text-ink-700 [animation-duration:350ms] max-sm:hidden [@media(max-height:960px)]:hidden"
        >
          <SparkleIcon className="mt-px size-3.5 shrink-0 text-brand-500" />
          {ROLE_HINTS[role]}
        </p>
        {state.fieldErrors?.role && (
          <p className="mt-1.5 text-sm text-red-600">{state.fieldErrors.role.join(" ")}</p>
        )}
      </fieldset>

      <Field
        label="Nom complet"
        name="full_name"
        autoComplete="name"
        className="max-sm:py-2.5 short:py-2.5"
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
        className="max-sm:py-2.5 short:py-2.5"
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
        className="max-sm:py-2.5 short:py-2.5"
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
        loading={pending}
        className="bg-gradient-to-r from-brand-600 to-brand-700 py-3 text-base hover:from-brand-700 hover:to-brand-700 sm:py-3.5 short:sm:py-3"
      >
        {!pending && <ArrowRightIcon className="h-5 w-5" />}
        {pending ? "Création du compte…" : role === "mentor" ? "Créer mon compte mentor" : "Créer mon compte"}
      </Button>
    </form>
  );
}
