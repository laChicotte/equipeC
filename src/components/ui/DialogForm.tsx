"use client";

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ComponentProps,
  type ReactNode,
} from "react";
import { controlClasses, describedBy, FieldShell } from "./Input";
import { CloseDialogButton } from "./Modal";
import { buttonClasses, Spinner } from "./Button";
import { CheckCircleIcon, SendIcon } from "./icons";

/**
 * Mise en page des formulaires ouverts dans une <Modal bare> : champs qui
 * défilent, colonne illustrée à droite (grand écran), pied de page fixe
 * « Annuler / Publier ». À placer DANS le <form>.
 */
export function DialogFormLayout({
  aside,
  footer,
  children,
}: {
  aside?: ReactNode;
  footer: ReactNode;
  children: ReactNode;
}) {
  return (
    <>
      <div className="min-h-0 flex-1 overflow-y-auto px-6 py-6 sm:px-8">
        <div className="flex gap-8">
          <div className="min-w-0 flex-1">{children}</div>
          {aside && (
            <div className="hidden w-56 shrink-0 lg:block">{aside}</div>
          )}
        </div>
      </div>
      <footer className="flex flex-col-reverse gap-3 border-t border-slate-100 bg-white px-6 py-4 sm:flex-row sm:items-center sm:justify-end sm:px-8 sm:py-5">
        {footer}
      </footer>
    </>
  );
}

/** Boutons du pied de page : « Annuler » (ferme) et envoi avec icône. */
export function DialogFormActions({
  pending,
  label,
  pendingLabel,
}: {
  pending: boolean;
  label: string;
  pendingLabel: string;
}) {
  return (
    <>
      <CloseDialogButton className={buttonClasses("secondary", "sm:min-w-36")}>
        Annuler
      </CloseDialogButton>
      <button
        type="submit"
        disabled={pending}
        aria-busy={pending || undefined}
        className={buttonClasses("primary", "sm:min-w-56")}
      >
        {pending ? <Spinner /> : <SendIcon className="size-5" />}
        {pending ? pendingLabel : label}
      </button>
    </>
  );
}

/** Colonne décorative : illustration + liste à coches. */
export function FormAside({
  illustration,
  items,
  more = false,
}: {
  illustration: ReactNode;
  items: string[];
  more?: boolean;
}) {
  return (
    <aside
      aria-hidden
      className="relative h-full overflow-hidden rounded-3xl bg-gradient-to-b from-brand-50 to-brand-50/40 px-5 pt-8 pb-6"
    >
      <div className="mb-6 flex justify-center">{illustration}</div>
      <ul className="flex flex-col gap-2.5">
        {items.map((item) => (
          <li
            key={item}
            className="flex items-center gap-2.5 rounded-xl bg-white/80 px-3 py-2 text-sm font-medium text-ink-900 shadow-[0_1px_2px_rgba(23,43,69,0.04)]"
          >
            <CheckCircleIcon className="size-5 shrink-0 text-brand-700" />
            {item}
          </li>
        ))}
        {more && (
          <li className="rounded-xl bg-white/60 px-3 py-1 text-lg leading-none font-bold tracking-widest text-brand-700">
            …
          </li>
        )}
      </ul>
    </aside>
  );
}

/** Zone de texte avec compteur « n / max » sous le champ. */
export function CountedTextArea({
  label,
  name,
  errors,
  icon,
  maxLength,
  defaultValue,
  ...props
}: Omit<ComponentProps<"textarea">, "maxLength"> & {
  label: string;
  name: string;
  errors?: string[];
  icon?: ReactNode;
  maxLength: number;
}) {
  const [count, setCount] = useState(String(defaultValue ?? "").length);
  const hasError = Boolean(errors?.length);
  return (
    <FieldShell
      label={label}
      name={name}
      errors={errors}
      icon={icon}
      required={props.required}
    >
      <textarea
        id={name}
        name={name}
        rows={4}
        maxLength={maxLength}
        defaultValue={defaultValue}
        onChange={(e) => setCount(e.target.value.length)}
        aria-invalid={hasError}
        aria-describedby={describedBy(name, hasError)}
        className={`${controlClasses(hasError, "", "outline")} leading-relaxed`}
        {...props}
      />
      <p className="-mt-0.5 text-right text-xs text-ink-500 tabular-nums">
        {count} / {maxLength}
      </p>
    </FieldShell>
  );
}

const SwapContext = createContext<{ open: () => void; close: () => void }>({
  open: () => {},
  close: () => {},
});
/** Revient au détail (bouton « Retour » du formulaire). */
export const useCloseReveal = () => useContext(SwapContext).close;

/**
 * Fenêtre de détail qui bascule sur un formulaire court (inscription,
 * candidature) : le formulaire REMPLACE le détail dans la même fenêtre, en
 * haut, sans défilement. À gauche un rappel de l'offre, à droite les champs.
 * Revient au détail à la fermeture de la fenêtre.
 */
export function FormSwap({
  recap,
  form,
  eyebrow,
  title,
  intro,
  children,
}: {
  /** Rappel compact (titre, date, lieu…) affiché à gauche du formulaire */
  recap: ReactNode;
  form: ReactNode;
  eyebrow: string;
  title: string;
  intro?: string;
  /** Le détail complet, avec un <OpenFormButton> dans son pied */
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);

  // Fenêtre refermée : on retrouvera le détail à la prochaine ouverture
  useEffect(() => {
    const dialog = root.current?.closest("dialog");
    if (!dialog) return;
    const reset = () => setOpen(false);
    dialog.addEventListener("close", reset);
    return () => dialog.removeEventListener("close", reset);
  }, []);

  useEffect(() => {
    if (!open || !root.current) return;
    // Haut de la fenêtre, puis focus sur le premier champ
    const scroller = root.current
      .closest("dialog")
      ?.querySelector<HTMLElement>(".overflow-y-auto");
    scroller?.scrollTo({ top: 0 });
    root.current
      .querySelector<HTMLElement>("select, input:not([type=hidden]), textarea")
      ?.focus({ preventScroll: true });
  }, [open]);

  return (
    <SwapContext
      value={{ open: () => setOpen(true), close: () => setOpen(false) }}
    >
      <div ref={root}>
        {open ? (
          <div className="grid gap-6 p-6 sm:p-8 md:grid-cols-[2fr_3fr] md:gap-8">
            <div className="hidden md:block">{recap}</div>
            <section aria-label={title} className="min-w-0">
              <p className="eyebrow pr-14">{eyebrow}</p>
              <h2 className="mt-1 text-2xl font-bold text-ink-900">{title}</h2>
              {intro && <p className="mt-1 text-sm text-ink-500">{intro}</p>}
              <div className="mt-5">{form}</div>
            </section>
          </div>
        ) : (
          children
        )}
      </div>
    </SwapContext>
  );
}

/** Bouton du pied de détail qui affiche le formulaire de <FormSwap>. */
export function OpenFormButton({
  label,
  icon,
}: {
  label: string;
  icon?: ReactNode;
}) {
  const { open } = useContext(SwapContext);
  return (
    <button
      type="button"
      onClick={open}
      className={buttonClasses("primary", "py-3.5 text-base sm:min-w-64")}
    >
      {icon}
      {label}
    </button>
  );
}

/** Pied de détail : résumé à gauche, action à droite. */
export function ActionRow({
  summary,
  children,
}: {
  summary?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
      {summary ?? <span />}
      {children}
    </div>
  );
}

/** Boutons d'un formulaire de <FormSwap> : « Retour » et validation. */
export function RevealActions({
  pending,
  label,
  pendingLabel,
  icon,
}: {
  pending: boolean;
  label: string;
  pendingLabel: string;
  icon?: ReactNode;
}) {
  const close = useCloseReveal();
  return (
    <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
      <button
        type="button"
        onClick={close}
        className={buttonClasses("secondary", "sm:min-w-32")}
      >
        Retour
      </button>
      <button
        type="submit"
        disabled={pending}
        aria-busy={pending || undefined}
        className={buttonClasses("primary", "sm:min-w-56")}
      >
        {pending ? <Spinner /> : icon}
        {pending ? pendingLabel : label}
      </button>
    </div>
  );
}

/** Classes des pictogrammes devant les libellés. */
export const labelIconClasses = "size-5 text-brand-700";
