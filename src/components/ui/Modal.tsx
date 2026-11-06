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
  size = "md",
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
  size?: "md" | "lg";
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
          size === "lg" ? "max-w-3xl" : "max-w-xl"
        }`}
      >
        <div className="flex max-h-[85vh] flex-col">
          <header className="flex items-start justify-between gap-4 border-b border-slate-100 px-6 pt-6 pb-4 sm:px-8">
            <div className="min-w-0">
              {eyebrow && <div className="mb-2">{eyebrow}</div>}
              <h2 className="text-xl font-bold sm:text-2xl">{title}</h2>
            </div>
            <button
              type="button"
              onClick={() => dialog.current?.close()}
              aria-label="Fermer"
              className="inline-flex size-10 shrink-0 items-center justify-center rounded-full bg-background text-ink-700 transition-colors hover:bg-slate-200"
            >
              <svg aria-hidden viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth={2}>
                <path d="M6 6l12 12M18 6 6 18" strokeLinecap="round" />
              </svg>
            </button>
          </header>
          <div className="overflow-y-auto px-6 py-6 sm:px-8">{children}</div>
        </div>
      </dialog>
    </>
  );
}


/** Second déclencheur d'une même fenêtre (évite de dupliquer un formulaire dans la page). */
export function OpenDialogButton({ dialogId, className, children }: { dialogId: string; className?: string; children: ReactNode }) {
  return (
    <button
      type="button"
      aria-haspopup="dialog"
      onClick={() => (document.getElementById(dialogId) as HTMLDialogElement | null)?.showModal()}
      className={className}
    >
      {children}
    </button>
  );
}
