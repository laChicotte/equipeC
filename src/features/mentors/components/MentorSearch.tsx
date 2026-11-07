"use client";

import { useState, type ReactNode } from "react";
import { SearchIcon, SparkleIcon } from "@/components/ui/icons";
import { PendingSubmitButton } from "@/components/ui/PendingSubmitButton";

type Mode = "keyword" | "goal";

/**
 * Barre de recherche unique à deux onglets :
 * - « Mot-clé » : paramètre q (filtre sur le nom, l'expertise…)
 * - « Décrire mon objectif » : paramètre objectif (recherche intelligente)
 * Formulaires GET : la recherche reste dans l'URL (partageable, bouton retour).
 */
export function MentorSearch({
  domain,
  q,
  objectif,
  aiEnabled = false,
}: {
  domain?: string;
  q?: string;
  objectif?: string;
  /** Analyse par l'IA disponible (sinon : mots-clés) */
  aiEnabled?: boolean;
}) {
  const [mode, setMode] = useState<Mode>(objectif ? "goal" : "keyword");

  const tab = (value: Mode, label: ReactNode, icon: ReactNode) => (
    <button
      type="button"
      role="tab"
      id={`tab-${value}`}
      aria-selected={mode === value}
      aria-controls={`panel-${value}`}
      onClick={() => setMode(value)}
      className={`inline-flex flex-1 items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors sm:flex-none sm:px-4 ${
        mode === value
          ? "bg-white text-ink-900 shadow-sm ring-1 ring-slate-200"
          : "text-ink-500 hover:text-ink-900"
      }`}
    >
      {icon}
      {label}
    </button>
  );

  return (
    <div className="rounded-3xl border border-slate-100 bg-white p-3 shadow-[0_1px_3px_rgba(23,43,69,0.05)]">
      <div
        role="tablist"
        aria-label="Type de recherche"
        className="flex gap-1.5 rounded-2xl bg-slate-50 p-1"
      >
        {tab("keyword", "Mot-clé", <SearchIcon className="size-4" />)}
        {tab(
          "goal",
          <>
            <span className="sm:hidden">Mon objectif</span>
            <span className="hidden sm:inline">Décrire mon objectif</span>
          </>,
          <SparkleIcon className="size-4 text-accent-500" />,
        )}
      </div>

      <form
        action="/mentors"
        role="tabpanel"
        id={`panel-${mode}`}
        aria-labelledby={`tab-${mode}`}
        className="flex flex-col gap-2 p-2 pt-3 sm:flex-row sm:items-center"
      >
        {domain && <input type="hidden" name="domain" value={domain} />}
        {mode === "keyword" ? (
          <>
            {objectif && (
              <input type="hidden" name="objectif" value={objectif} />
            )}
            <label htmlFor="q" className="sr-only">
              Rechercher une expertise, un mentor
            </label>
            <div className="flex min-w-0 flex-1 items-center gap-3 rounded-xl border border-slate-200 px-4 focus-within:border-brand-600 focus-within:ring-2 focus-within:ring-brand-100">
              <SearchIcon className="size-5 shrink-0 text-ink-500" />
              <input
                key="q"
                id="q"
                name="q"
                defaultValue={q}
                placeholder="Nom, expertise, compétence…"
                className="min-w-0 flex-1 bg-transparent py-3.5 text-base outline-none placeholder:text-ink-500/70"
              />
            </div>
          </>
        ) : (
          <>
            <label htmlFor="objectif" className="sr-only">
              Votre objectif, en une phrase
            </label>
            <input
              key="objectif"
              id="objectif"
              name="objectif"
              defaultValue={objectif}
              maxLength={300}
              placeholder="Ex : Je veux publier mon premier recueil de nouvelles…"
              className="min-w-0 flex-1 rounded-xl border border-slate-200 px-4 py-3.5 text-base outline-none placeholder:text-ink-500/70 focus:border-brand-600 focus:ring-2 focus:ring-brand-100"
            />
          </>
        )}
        <PendingSubmitButton
          key={mode}
          pendingLabel={
            mode === "keyword"
              ? "Recherche…"
              : aiEnabled
                ? "L'IA analyse…"
                : "Analyse…"
          }
          className="rounded-xl bg-brand-800 px-7 py-3.5 font-semibold text-white shadow-sm transition-[background-color,transform] duration-200 hover:bg-brand-800 active:scale-[0.97] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600"
        >
          {mode === "keyword" ? "Rechercher" : "Analyser"}
        </PendingSubmitButton>
      </form>
      {mode === "goal" && (
        <p className="px-3 pb-2 text-xs text-ink-500">
          {aiEnabled
            ? "Notre IA comprend votre objectif, choisit les mentors les plus adaptés et explique chaque choix."
            : "Nous repérons les domaines de votre phrase et classons les mentors par compatibilité."}
        </p>
      )}
    </div>
  );
}
