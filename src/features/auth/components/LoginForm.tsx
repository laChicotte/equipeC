"use client";

import Link from "next/link";
import { useActionState } from "react";
import { login, type AuthFormState } from "../actions";
import { Field } from "@/components/ui/Input";
import { PasswordField } from "@/components/ui/PasswordField";
import { Button } from "@/components/ui/Button";
import { ArrowRightIcon, LockIcon, MailIcon } from "@/components/ui/icons";

const initialState: AuthFormState = {};

export function LoginForm({ next }: { next?: string }) {
  const [state, formAction, pending] = useActionState(login, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-4" noValidate>
      {next && <input type="hidden" name="next" value={next} />}
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
      <div className="flex flex-col gap-2">
        <PasswordField
          label="Mot de passe"
          name="password"
          autoComplete="current-password"
          placeholder="Entrez votre mot de passe"
          icon={<LockIcon className="h-[18px] w-[18px]" />}
          appearance="outline"
          hideRequiredMark
          required
          errors={state.fieldErrors?.password}
        />
        <Link
          href="/forgot-password"
          className="self-end text-sm font-semibold text-brand-700 hover:underline"
        >
          Mot de passe oublié ?
        </Link>
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
        {pending ? "Connexion…" : "Se connecter"}
      </Button>
    </form>
  );
}
