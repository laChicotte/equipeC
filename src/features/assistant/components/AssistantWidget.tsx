"use client";

/**
 * Chatbox d'aide MentorConnect : bouton flottant + fenêtre de discussion.
 * 1. Réponses intégrées (base de connaissances, sans réseau) : instantanées.
 * 2. Si `aiEnabled` (clé ANTHROPIC_API_KEY côté serveur) et aucune réponse
 *    claire : complément par l'IA, qui s'appuie sur la même base.
 * Masquée dans la salle de visio pour ne pas gêner l'appel.
 */
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { askAssistantAI, type AssistantTurn } from "../actions";
import { KNOWLEDGE, STARTER_QUESTIONS, searchKnowledge, type AssistantLink } from "../knowledge";
import { LogoMark } from "@/components/layout/Logo";

type Message = {
  id: number;
  role: "user" | "assistant";
  text: string;
  links?: AssistantLink[];
  suggestions?: string[];
};

const WELCOME: Message = {
  id: 0,
  role: "assistant",
  text: "Bonjour ! Je suis l'assistant MentorConnect. Posez-moi une question sur la plateforme, ou choisissez un sujet :",
  suggestions: STARTER_QUESTIONS,
};

function ChatIcon({ className = "size-6" }: { className?: string }) {
  return (
    <svg aria-hidden viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M4 5h16v11H8l-4 4z" />
      <path d="M8 9h8M8 12.5h5" />
    </svg>
  );
}

export function AssistantWidget({ aiEnabled = false }: { aiEnabled?: boolean }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([WELCOME]);
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);
  const nextId = useRef(1);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Ouverture : focus sur le champ ; Échap ferme et rend le focus au bouton
  useEffect(() => {
    if (!open) return;
    inputRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        buttonRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  // Défilement vers le dernier message
  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, thinking]);

  // Pas de chatbox pendant un appel vidéo
  if (pathname?.includes("/visio")) return null;
  // Écran de discussion sur téléphone : le bouton recouvrirait l'envoi des messages
  const hideOnPhone = /^\/mentorships\/[^/]+$/.test(pathname ?? "") ? "max-lg:hidden" : "";

  const push = (m: Omit<Message, "id">) => setMessages((list) => [...list, { ...m, id: nextId.current++ }]);

  async function ask(question: string) {
    const q = question.trim();
    if (!q || thinking) return;
    const history: AssistantTurn[] = messages.filter((m) => m.id !== 0).map((m) => ({ role: m.role, text: m.text }));
    push({ role: "user", text: q });
    setInput("");

    const matches = searchKnowledge(q);
    const best = matches[0];
    // Réponse intégrée si la correspondance est nette (ou si l'IA n'est pas disponible)
    if (best && (best.score >= 2 || !aiEnabled)) {
      const related = matches.slice(1).filter((m) => m.score >= best.score - 1).map((m) => m.entry.question);
      push({ role: "assistant", text: best.entry.answer, links: best.entry.links, suggestions: related.length ? related : undefined });
      return;
    }

    if (aiEnabled) {
      setThinking(true);
      const answer = await askAssistantAI(q, history).catch(() => null);
      setThinking(false);
      if (answer) {
        push({ role: "assistant", text: answer, links: best?.entry.links });
        return;
      }
    }

    push({
      role: "assistant",
      text: "Je n'ai pas de réponse précise à cette question. Voici les sujets sur lesquels je peux vous aider :",
      suggestions: KNOWLEDGE.slice(0, 6).map((k) => k.question),
    });
  }

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    void ask(input);
  };

  return (
    <>
      {open && (
        <section
          role="dialog"
          aria-modal="false"
          aria-labelledby="assistant-titre"
          className="fixed inset-x-3 bottom-[9.5rem] z-50 flex max-h-[min(34rem,calc(100dvh-11rem))] flex-col overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-2xl sm:inset-x-auto sm:right-6 sm:bottom-24 sm:w-[24rem]"
        >
          {/* En-tête */}
          <header className="flex items-center gap-3 bg-gradient-dark px-4 py-3.5 text-white">
            <span className="inline-flex size-9 items-center justify-center rounded-xl bg-white/10 ring-1 ring-white/15">
              <LogoMark tone="light" className="h-5 w-7" />
            </span>
            <div className="min-w-0 flex-1">
              <h2 id="assistant-titre" className="text-sm font-bold">
                Assistant MentorConnect
              </h2>
              <p className="text-xs text-white/70">{aiEnabled ? "Réponses guidées et IA" : "Réponses sur le fonctionnement de la plateforme"}</p>
            </div>
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                buttonRef.current?.focus();
              }}
              aria-label="Fermer l'assistant"
              className="inline-flex size-9 items-center justify-center rounded-xl text-white/80 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline-2 focus-visible:outline-white"
            >
              <svg aria-hidden viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" className="size-5">
                <path d="M6 6l12 12M18 6 6 18" />
              </svg>
            </button>
          </header>

          {/* Messages */}
          <div ref={listRef} aria-live="polite" className="flex flex-1 flex-col gap-3 overflow-y-auto bg-mint/60 p-4">
            {messages.map((m) => (
              <div key={m.id} className={`flex flex-col gap-2 ${m.role === "user" ? "items-end" : "items-start"}`}>
                <p
                  className={`max-w-[88%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed whitespace-pre-line ${
                    m.role === "user" ? "rounded-br-md bg-brand-700 text-white" : "rounded-bl-md bg-white text-ink-900 shadow-sm ring-1 ring-slate-200/70"
                  }`}
                >
                  {m.text}
                </p>
                {m.links && m.links.length > 0 && (
                  <div className="flex max-w-[88%] flex-wrap gap-2">
                    {m.links.map((l) => (
                      <Link
                        key={l.href}
                        href={l.href}
                        onClick={() => setOpen(false)}
                        className="inline-flex items-center gap-1 rounded-full bg-brand-700 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-brand-800"
                      >
                        {l.label} <span aria-hidden>→</span>
                      </Link>
                    ))}
                  </div>
                )}
                {m.suggestions && m.suggestions.length > 0 && (
                  <div className="flex max-w-[92%] flex-wrap gap-2">
                    {m.suggestions.map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => void ask(s)}
                        disabled={thinking}
                        className="rounded-full border border-brand-200 bg-white px-3 py-1.5 text-left text-xs font-medium text-brand-800 transition-colors hover:bg-brand-50 disabled:opacity-60"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
            {thinking && (
              <p role="status" className="inline-flex w-fit items-center gap-1.5 rounded-2xl bg-white px-3.5 py-2.5 text-sm text-ink-500 shadow-sm ring-1 ring-slate-200/70">
                <span className="size-1.5 animate-pulse rounded-full bg-brand-500" />
                <span className="size-1.5 animate-pulse rounded-full bg-brand-500 [animation-delay:150ms]" />
                <span className="size-1.5 animate-pulse rounded-full bg-brand-500 [animation-delay:300ms]" />
                <span className="sr-only">L&apos;assistant rédige une réponse…</span>
              </p>
            )}
          </div>

          {/* Saisie */}
          <form onSubmit={onSubmit} className="flex items-center gap-2 border-t border-slate-200/80 bg-white p-3">
            <label htmlFor="assistant-question" className="sr-only">
              Votre question
            </label>
            <input
              ref={inputRef}
              id="assistant-question"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              maxLength={500}
              autoComplete="off"
              placeholder="Posez votre question…"
              className="min-w-0 flex-1 rounded-[10px] border border-slate-200 px-3.5 py-2.5 text-sm outline-none placeholder:text-ink-500/70 focus:border-brand-600 focus:ring-2 focus:ring-brand-100"
            />
            <button
              type="submit"
              disabled={!input.trim() || thinking}
              aria-label="Envoyer la question"
              className="inline-flex size-10 shrink-0 items-center justify-center rounded-xl bg-brand-700 text-white transition-colors hover:bg-brand-800 disabled:opacity-50"
            >
              <svg aria-hidden viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="size-5">
                <path d="M5 12h14M13 6l6 6-6 6" />
              </svg>
            </button>
          </form>
        </section>
      )}

      {/* Bouton flottant */}
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-label={open ? "Fermer l'assistant" : "Ouvrir l'assistant d'aide"}
        className={`${hideOnPhone} fixed right-4 bottom-20 z-50 inline-flex size-14 items-center justify-center rounded-full bg-brand-700 text-white shadow-lg shadow-brand-700/30 transition-[background-color,transform] duration-200 hover:bg-brand-800 active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600 sm:right-6 sm:bottom-6`}
      >
        {open ? (
          <svg aria-hidden viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" className="size-6">
            <path d="M6 6l12 12M18 6 6 18" />
          </svg>
        ) : (
          <ChatIcon />
        )}
      </button>
    </>
  );
}
