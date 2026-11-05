"use client";

import { useActionState } from "react";
import { requestPasswordReset, updatePassword, type AuthFormState } from "../actions";
import { Field } from "@/components/ui/Input";
import { PasswordField } from "@/components/ui/PasswordField";
import { Button } from "@/components/ui/Button";
import { ArrowRightIcon, LockIcon, MailIcon } from "@/components/ui/icons";

const initialState: AuthFormState = {};

const submitClasses =
  "mt-1 bg-gradient-to-r from-brand-600 to-brand-700 py-3.5 text-base hover:from-brand-700 hover:to-brand-700";

function ErrorBox({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
      {message}
    </p>
  );
}

/** Étape 1 : demander le lien par email. */
export function ForgotPasswordForm() {
  const [state, formAction, pending] = useActionState(requestPasswordReset, initialState);

  if (state.info) {
    return (
      <p role="status" className="rounded-xl bg-brand-50 px-4 py-4 text-sm leading-relaxed text-brand-800">
        {state.info}
      </p>
    );
  }

  return (
    <form action={formAction} className="flex flex-col gap-5" noValidate>
      <Field
        label="Email"
        name="email"
        type="email"
        autoComplete="email"
        placeholder="Entrez votre adresse email"
        icon={<MailIcon className="h-[18px] w-[18px]" />}
        appearance="outline"
        hideRequiredMark
        required
        errors={state.fieldErrors?.email}
      />
      <ErrorBox message={state.error} />
      <Button type="submit" disabled={pending} className={submitClasses}>
        <ArrowRightIcon className="h-5 w-5" />
        {pending ? "Envoi…" : "Recevoir le lien"}
      </Button>
    </form>
  );
}

/** Étape 2 : choisir le nouveau mot de passe. */
export function ResetPasswordForm() {
  const [state, formAction, pending] = useActionState(updatePassword, initialState);
  const lock = <LockIcon className="h-[18px] w-[18px]" />;

  return (
    <form action={formAction} className="flex flex-col gap-5" noValidate>
      <PasswordField
        label="Nouveau mot de passe"
        name="password"
        autoComplete="new-password"
        placeholder="Au moins 8 caractères"
        icon={lock}
        appearance="outline"
        hideRequiredMark
        required
        errors={state.fieldErrors?.password}
      />
      <PasswordField
        label="Confirmer le mot de passe"
        name="confirm"
        autoComplete="new-password"
        placeholder="Retapez le mot de passe"
        icon={lock}
        appearance="outline"
        hideRequiredMark
        required
        errors={state.fieldErrors?.confirm}
      />
      <ErrorBox message={state.error} />
      <Button type="submit" disabled={pending} className={submitClasses}>
        <ArrowRightIcon className="h-5 w-5" />
        {pending ? "Enregistrement…" : "Enregistrer"}
      </Button>
    </form>
  );
}
