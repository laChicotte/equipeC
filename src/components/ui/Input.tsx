import type { ComponentProps, ReactNode } from "react";

/**
 * Champs de formulaire (style « rempli » des maquettes) : fond gris clair,
 * passage au blanc avec un halo vert au focus, astérisque automatique sur
 * les champs obligatoires, aide et erreurs accessibles.
 */
export type FieldAppearance = "filled" | "outline";

/** « filled » : fond gris (formulaires de l'app) ; « outline » : fond blanc bordé (connexion). */
export const controlClasses = (hasError: boolean, className = "", appearance: FieldAppearance = "filled") =>
  `w-full rounded-[10px] border px-3.5 py-3 text-sm text-ink-900 outline-none transition-colors placeholder:text-ink-500/60 focus:border-brand-600 focus:bg-white focus:ring-2 focus:ring-brand-100 disabled:opacity-60 ${
    hasError
      ? "border-red-500 bg-red-50/40"
      : appearance === "outline"
        ? "border-slate-200 bg-white"
        : "border-transparent bg-background"
  } ${className}`;

export function FieldShell({
  label,
  name,
  errors,
  hint,
  required,
  icon,
  children,
}: {
  label: string;
  name: string;
  errors?: string[];
  hint?: string;
  required?: boolean;
  /** Petite icône affichée devant le libellé. */
  icon?: ReactNode;
  children: ReactNode;
}) {
  const hasError = Boolean(errors?.length);
  // Les anciens libellés « … * » restent compatibles : pas de double astérisque
  const text = label.replace(/\s*\*$/, "");
  const showStar = required || label.trim().endsWith("*");
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={name} className="flex items-center gap-2 text-sm font-semibold text-ink-900">
        {icon}
        <span>
          {text}
          {showStar && <span className="text-red-500"> *</span>}
        </span>
      </label>
      {children}
      {hasError ? (
        <p id={`${name}-error`} className="text-sm text-red-600">
          {errors!.join(" ")}
        </p>
      ) : (
        hint && (
          <p id={`${name}-hint`} className="text-xs text-ink-500">
            {hint}
          </p>
        )
      )}
    </div>
  );
}

export const describedBy = (name: string, hasError: boolean, hint?: string) =>
  hasError ? `${name}-error` : hint ? `${name}-hint` : undefined;

type CommonProps = { label: string; name: string; errors?: string[]; hint?: string };

export type FieldExtras = {
  icon?: ReactNode;
  appearance?: FieldAppearance;
  /** Garde `required` pour le navigateur sans afficher l'astérisque. */
  hideRequiredMark?: boolean;
  /** Icône affichée à l'intérieur du champ, à gauche. */
  leading?: ReactNode;
};

/** Champ texte (et date, nombre, e-mail…). */
export function Field({
  label,
  name,
  errors,
  hint,
  icon,
  appearance,
  hideRequiredMark,
  leading,
  className = "",
  ...props
}: ComponentProps<"input"> & CommonProps & FieldExtras) {
  const hasError = Boolean(errors?.length);
  const input = (
    <input
      id={name}
      name={name}
      aria-invalid={hasError}
      aria-describedby={describedBy(name, hasError, hint)}
      className={controlClasses(hasError, `${leading ? "pl-11" : ""} ${className}`, appearance)}
      {...props}
    />
  );
  return (
    <FieldShell
      label={label}
      name={name}
      errors={errors}
      hint={hint}
      icon={icon}
      required={props.required && !hideRequiredMark}
    >
      {leading ? (
        <div className="relative">
          <span className="pointer-events-none absolute inset-y-0 left-3.5 flex items-center text-ink-500">{leading}</span>
          {input}
        </div>
      ) : (
        input
      )}
    </FieldShell>
  );
}

/** Zone de texte multiligne. */
export function TextAreaField({
  label,
  name,
  errors,
  hint,
  icon,
  appearance,
  ...props
}: ComponentProps<"textarea"> & CommonProps & Pick<FieldExtras, "icon" | "appearance">) {
  const hasError = Boolean(errors?.length);
  return (
    <FieldShell label={label} name={name} errors={errors} hint={hint} icon={icon} required={props.required}>
      <textarea
        id={name}
        name={name}
        rows={4}
        aria-invalid={hasError}
        aria-describedby={describedBy(name, hasError, hint)}
        className={`${controlClasses(hasError, "", appearance)} leading-relaxed`}
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
  hint,
  options,
  placeholder,
  icon,
  appearance,
  ...props
}: ComponentProps<"select"> &
  CommonProps &
  Pick<FieldExtras, "icon" | "appearance"> & {
    options: { value: string; label: string }[];
    placeholder?: string;
  }) {
  const hasError = Boolean(errors?.length);
  return (
    <FieldShell label={label} name={name} errors={errors} hint={hint} icon={icon} required={props.required}>
      <select
        id={name}
        name={name}
        aria-invalid={hasError}
        aria-describedby={describedBy(name, hasError, hint)}
        className={`${controlClasses(hasError, "", appearance)} cursor-pointer`}
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
