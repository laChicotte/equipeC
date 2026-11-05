"use client";

import { useState, type ComponentProps } from "react";
import { EyeIcon, EyeOffIcon } from "@/components/ui/icons";
import { FieldShell, controlClasses, describedBy, type FieldExtras } from "./Input";

/** Champ mot de passe avec bouton « afficher / masquer ». */
export function PasswordField({
  label,
  name,
  errors,
  hint,
  icon,
  appearance,
  hideRequiredMark,
  className = "",
  ...props
}: Omit<ComponentProps<"input">, "type"> & {
  label: string;
  name: string;
  errors?: string[];
  hint?: string;
} & FieldExtras) {
  const [visible, setVisible] = useState(false);
  const hasError = Boolean(errors?.length);

  return (
    <FieldShell
      label={label}
      name={name}
      errors={errors}
      hint={hint}
      icon={icon}
      required={props.required && !hideRequiredMark}
    >
      <div className="relative">
        <input
          id={name}
          name={name}
          type={visible ? "text" : "password"}
          aria-invalid={hasError}
          aria-describedby={describedBy(name, hasError, hint)}
          className={controlClasses(hasError, `pr-11 ${className}`, appearance)}
          {...props}
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? "Masquer le mot de passe" : "Afficher le mot de passe"}
          aria-pressed={visible}
          className="absolute inset-y-0 right-0 flex w-11 items-center justify-center rounded-r-xl text-ink-500 transition-colors hover:text-ink-900 focus-visible:outline-2 focus-visible:outline-brand-600"
        >
          {visible ? <EyeOffIcon className="h-[18px] w-[18px]" /> : <EyeIcon className="h-[18px] w-[18px]" />}
        </button>
      </div>
    </FieldShell>
  );
}
