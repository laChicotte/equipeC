import type { ComponentProps } from "react";

type FieldProps = ComponentProps<"input"> & {
  label: string;
  name: string;
  errors?: string[];
};

const controlClasses = (hasError: boolean) =>
  `w-full rounded-lg border bg-white px-3 py-2.5 text-sm outline-none transition-colors focus:border-brand-600 focus:ring-2 focus:ring-brand-100 ${
    hasError ? "border-red-500" : "border-zinc-300"
  }`;

function FieldShell({
  label,
  name,
  errors,
  hint,
  children,
}: {
  label: string;
  name: string;
  errors?: string[];
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={name} className="text-sm font-medium text-zinc-800">
        {label}
      </label>
      {children}
      {hint && !errors?.length && <p className="text-xs text-zinc-500">{hint}</p>}
      {Boolean(errors?.length) && (
        <p id={`${name}-error`} className="text-sm text-red-600">
          {errors!.join(" ")}
        </p>
      )}
    </div>
  );
}

/** Zone de texte multiligne. */
export function TextAreaField({
  label,
  name,
  errors,
  hint,
  ...props
}: ComponentProps<"textarea"> & { label: string; name: string; errors?: string[]; hint?: string }) {
  const hasError = Boolean(errors?.length);
  return (
    <FieldShell label={label} name={name} errors={errors} hint={hint}>
      <textarea
        id={name}
        name={name}
        rows={4}
        aria-invalid={hasError}
        aria-describedby={hasError ? `${name}-error` : undefined}
        className={controlClasses(hasError)}
        {...props}
      />
    </FieldShell>
  );
}

/** Liste déroulante. */
export function SelectField({
  label,
  name,
  errors,
  options,
  placeholder,
  ...props
}: ComponentProps<"select"> & {
  label: string;
  name: string;
  errors?: string[];
  options: { value: string; label: string }[];
  placeholder?: string;
}) {
  const hasError = Boolean(errors?.length);
  return (
    <FieldShell label={label} name={name} errors={errors}>
      <select
        id={name}
        name={name}
        aria-invalid={hasError}
        aria-describedby={hasError ? `${name}-error` : undefined}
        className={controlClasses(hasError)}
        {...props}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </FieldShell>
  );
}

/** Champ de formulaire avec libellé et messages d'erreur accessibles. */
export function Field({ label, name, errors, className = "", ...props }: FieldProps) {
  const errorId = `${name}-error`;
  const hasError = Boolean(errors?.length);

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={name} className="text-sm font-medium text-zinc-800">
        {label}
      </label>
      <input
        id={name}
        name={name}
        aria-invalid={hasError}
        aria-describedby={hasError ? errorId : undefined}
        className={`rounded-lg border bg-white px-3 py-2.5 text-sm outline-none transition-colors focus:border-brand-600 focus:ring-2 focus:ring-brand-100 ${
          hasError ? "border-red-500" : "border-zinc-300"
        } ${className}`}
        {...props}
      />
      {hasError && (
        <p id={errorId} className="text-sm text-red-600">
          {errors!.join(" ")}
        </p>
      )}
    </div>
  );
}
