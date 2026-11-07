"use client";

import { useRef, type ReactNode } from "react";

/**
 * Fenêtre de détail : un déclencheur (carte ou bouton) ouvre le contenu
 * complet par-dessus la page, sans faire défiler la liste.
 * <dialog> natif : focus piégé, touche Échap, lecteur d'écran.
 */
export function Modal({
  trigger,
  triggerClassName = "",
  triggerLabel,
  title,
  eyebrow,
  icon,
  description,
  size = "md",
  bare = false,
  headless = false,
  dialogId,
  children,
}: {
  /** Contenu du bouton déclencheur (uniquement des éléments en ligne : <span>…) */
  trigger: ReactNode;
  triggerClassName?: string;
  /** Nom accessible du déclencheur, si son texte ne suffit pas */
  triggerLabel?: string;
  title: string;
  eyebrow?: ReactNode;
  /** Pictogramme dans une tuile verte, à gauche du titre */
  icon?: ReactNode;
  /** Phrase d'introduction sous le titre */
  description?: ReactNode;
  size?: "md" | "lg" | "xl";
  /**
   * Le contenu gère lui-même défilement et marges (formulaires avec pied de
   * page fixe : voir <DialogFormLayout>).
   */
  bare?: boolean;
  /** Pas de bandeau d'en-tête : le contenu affiche lui-même son titre */
  headless?: boolean;
  /** Identifiant de la fenêtre, pour l'ouvrir aussi avec <OpenDialogButton> */
  dialogId?: string;
  children: ReactNode;
}) {
  const dialog = useRef<HTMLDialogElement>(null);

  return (
    <>
      <button
        type="button"
        aria-label={triggerLabel}
        aria-haspopup="dialog"
        onClick={() => dialog.current?.showModal()}
        className={triggerClassName}
      >
        {trigger}
      </button>
      <dialog
        ref={dialog}
        id={dialogId}
        aria-label={title}
        // Clic sur le fond (hors de la boîte) : fermeture
        onClick={(e) => {
          if (e.target === e.currentTarget) e.currentTarget.close();
        }}
        className={`m-auto w-[calc(100%-2rem)] rounded-3xl bg-white p-0 text-ink-900 shadow-[0_30px_80px_-20px_rgba(23,43,69,0.45)] backdrop:bg-ink-900/50 backdrop:backdrop-blur-sm ${
          size === "xl" ? "max-w-5xl" : size === "lg" ? "max-w-3xl" : "max-w-xl"
        }`}
      >
        {headless ? (
          // Sans bandeau : le contenu porte son propre titre (<h2>), croix flottante
          <div className="relative max-h-[90vh] overflow-y-auto">
            <button
              type="button"
              onClick={() => dialog.current?.close()}
              aria-label="Fermer"
              className="absolute top-4 right-4 z-10 inline-flex size-11 items-center justify-center rounded-full bg-background/90 text-ink-700 backdrop-blur transition-colors hover:bg-slate-200 sm:top-6 sm:right-6"
            >
              <svg
                aria-hidden
                viewBox="0 0 24 24"
                className="size-5"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path d="M6 6l12 12M18 6 6 18" strokeLinecap="round" />
              </svg>
            </button>
            {children}
          </div>
        ) : (
          <div className="flex max-h-[90vh] flex-col">
            <header className="relative flex items-start justify-between gap-4 overflow-hidden border-b border-slate-100 px-6 pt-6 pb-5 sm:px-8">
              {icon && <HeaderSwoosh />}
              <div className="relative flex min-w-0 items-start gap-4 sm:gap-5">
                {icon && (
                  <span className="hidden size-16 shrink-0 items-center justify-center rounded-2xl bg-brand-50 text-brand-700 sm:inline-flex [&>svg]:size-8">
                    {icon}
                  </span>
                )}
                <div className="min-w-0">
                  {eyebrow && <div className="mb-1.5">{eyebrow}</div>}
                  <h2 className="text-xl font-bold sm:text-2xl">{title}</h2>
                  {description && (
                    <p className="mt-1 text-sm text-ink-500">{description}</p>
                  )}
                </div>
              </div>
              <button
                type="button"
                onClick={() => dialog.current?.close()}
                aria-label="Fermer"
                className={`relative inline-flex size-10 shrink-0 items-center justify-center rounded-full text-ink-700 transition-colors hover:bg-slate-200 ${
                  icon
                    ? "bg-white shadow-sm ring-1 ring-slate-200/70"
                    : "bg-background"
                }`}
              >
                <svg
                  aria-hidden
                  viewBox="0 0 24 24"
                  className="size-5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path d="M6 6l12 12M18 6 6 18" strokeLinecap="round" />
                </svg>
              </button>
            </header>
            {bare ? (
              <div className="flex min-h-0 flex-1 flex-col">{children}</div>
            ) : (
              <div className="overflow-y-auto px-6 py-6 sm:px-8">
                {children}
              </div>
            )}
          </div>
        )}
      </dialog>
    </>
  );
}

/** Vague verte décorative en haut à droite de l'en-tête. */
function HeaderSwoosh() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 320 120"
      preserveAspectRatio="none"
      className="pointer-events-none absolute top-0 right-0 h-full w-72 sm:w-96"
    >
      <path d="M90 0C150 40 200 95 320 110V0Z" className="fill-brand-50" />
      <path d="M170 0c25 45 75 80 150 92V0Z" className="fill-brand-100/80" />
      <path d="M230 0c15 30 45 52 90 62V0Z" className="fill-brand-200/60" />
    </svg>
  );
}

/** Bouton « Annuler » : ferme la fenêtre qui le contient. */
export function CloseDialogButton({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={(e) => e.currentTarget.closest("dialog")?.close()}
      className={className}
    >
      {children}
    </button>
  );
}

/** Second déclencheur d'une même fenêtre (évite de dupliquer un formulaire dans la page). */
export function OpenDialogButton({
  dialogId,
  className,
  children,
}: {
  dialogId: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-haspopup="dialog"
      onClick={() =>
        (
          document.getElementById(dialogId) as HTMLDialogElement | null
        )?.showModal()
      }
      className={className}
    >
      {children}
    </button>
  );
}
