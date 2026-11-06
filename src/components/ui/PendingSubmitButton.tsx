"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

/**
 * Bouton d'envoi qui affiche un état « en cours » dès que son formulaire part
 * (clic ou touche Entrée). Utile quand la réponse prend quelques secondes,
 * comme une analyse par l'IA. Fonctionne avec les formulaires GET classiques.
 */
export function PendingSubmitButton({
  children,
  pendingLabel,
  className = "",
}: {
  children: ReactNode;
  pendingLabel: string;
  className?: string;
}) {
  const ref = useRef<HTMLButtonElement>(null);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    const form = ref.current?.form;
    if (!form) return;
    const onSubmit = () => setPending(true);
    // Retour arrière (cache du navigateur) : on réaffiche le bouton normal
    const onPageShow = (event: PageTransitionEvent) => event.persisted && setPending(false);
    form.addEventListener("submit", onSubmit);
    window.addEventListener("pageshow", onPageShow);
    return () => {
      form.removeEventListener("submit", onSubmit);
      window.removeEventListener("pageshow", onPageShow);
    };
  }, []);

  return (
    <button ref={ref} type="submit" aria-busy={pending} disabled={pending} className={`${className} disabled:cursor-wait`}>
      {pending ? (
        <span className="inline-flex items-center justify-center gap-2">
          <svg aria-hidden viewBox="0 0 24 24" className="size-4 animate-spin" fill="none">
            <circle cx="12" cy="12" r="9" stroke="currentColor" strokeOpacity="0.3" strokeWidth="3" />
            <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
          </svg>
          <span role="status">{pendingLabel}</span>
        </span>
      ) : (
        children
      )}
    </button>
  );
}
