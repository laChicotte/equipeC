"use client";

import { useEffect, useMemo, useRef, useState, type FormEvent, type KeyboardEvent } from "react";
import { createClient } from "@/lib/supabase/client";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { dayKey, formatDay, formatTime } from "@/lib/datetime";
import type { Message } from "@/types/database";

type Props = {
  mentorshipId: string;
  currentUserId: string;
  /** Noms affichés, indexés par identifiant de profil */
  names: Record<string, string>;
  initialMessages: Message[];
  /** false si le mentorat est terminé : historique en lecture seule */
  canWrite: boolean;
  /** Interlocuteur affiché dans l'en-tête de la discussion */
  partner?: { name: string; avatarUrl: string | null; subtitle?: string };
  /** Utilisateur connecté (avatar de ses propres messages) */
  me?: { avatarUrl: string | null };
};

/** Icône « envoyer » (avion en papier). */
const SendIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden className="size-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 3 10.5 13.5" />
    <path d="m21 3-6.5 18-4-7.5L3 9.5Z" />
  </svg>
);

const MAX_LENGTH = 2000;

/** Ajoute un message s'il n'est pas déjà présent (il peut arriver deux fois :
 *  par la réponse de l'envoi ET par le temps réel). */
function addMessage(list: Message[], message: Message) {
  if (list.some((m) => m.id === message.id)) return list;
  return [...list, message].sort((a, b) => a.id - b.id);
}

export function Chat({ mentorshipId, currentUserId, names, initialMessages, canWrite, partner, me }: Props) {
  // Un seul client Supabase navigateur pour toute la vie du composant
  const supabase = useMemo(() => createClient(), []);
  const [messages, setMessages] = useState(initialMessages);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [live, setLive] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  // Dernier message connu, lu par le rattrapage sans relancer l'abonnement
  const lastIdRef = useRef(initialMessages.at(-1)?.id ?? 0);

  useEffect(() => {
    lastIdRef.current = messages.at(-1)?.id ?? 0;
  }, [messages]);

  // Abonnement temps réel aux nouveaux messages de CE mentorat
  useEffect(() => {
    // Rattrapage : à chaque (re)connexion, on recharge les messages arrivés
    // pendant la connexion du canal ou une coupure réseau.
    async function catchUp() {
      const { data } = await supabase
        .from("messages")
        .select("id, mentorship_id, sender_id, content, created_at")
        .eq("mentorship_id", mentorshipId)
        .gt("id", lastIdRef.current)
        .order("id");
      if (data?.length) {
        setMessages((list) => (data as Message[]).reduce(addMessage, list));
      }
    }

    const channel = supabase
      .channel(`mentorship:${mentorshipId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `mentorship_id=eq.${mentorshipId}`,
        },
        (payload) => setMessages((list) => addMessage(list, payload.new as Message)),
      )
      .subscribe((status) => {
        setLive(status === "SUBSCRIBED");
        if (status === "SUBSCRIBED") void catchUp();
      });

    // Nettoyage quand on quitte la page : on se désabonne
    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, mentorshipId]);

  // Faire défiler jusqu'au dernier message (sans animation au premier affichage)
  const firstScroll = useRef(true);
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: "end", behavior: firstScroll.current ? "auto" : "smooth" });
    firstScroll.current = false;
  }, [messages.length]);

  async function send(event?: FormEvent) {
    event?.preventDefault();
    const content = draft.trim();
    if (!content || sending) return;

    setSending(true);
    setError(null);
    // RLS vérifie : sender_id = moi ET mentorat accepté dont je suis participant
    const { data, error: insertError } = await supabase
      .from("messages")
      .insert({ mentorship_id: mentorshipId, sender_id: currentUserId, content })
      .select("id, mentorship_id, sender_id, content, created_at")
      .single();
    setSending(false);

    if (insertError || !data) {
      setError("Le message n'a pas pu être envoyé. Vérifiez votre connexion.");
      return;
    }
    setDraft("");
    setMessages((list) => addMessage(list, data as Message));
  }

  // Entrée = envoyer, Maj+Entrée = retour à la ligne
  function onKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing) {
      event.preventDefault();
      void send();
    }
  }

  return (
    <section className="flex flex-col overflow-hidden rounded-3xl border border-slate-200/70 bg-white shadow-card lg:h-full">
      {/* En-tête : interlocuteur + état de la connexion temps réel */}
      <header className="flex items-center gap-3 border-b border-slate-100 px-5 py-4">
        {partner && <Avatar name={partner.name} src={partner.avatarUrl} size="md" />}
        <div className="min-w-0 flex-1">
          <h2 className="truncate font-bold text-ink-900">{partner?.name ?? "Discussion"}</h2>
          {partner?.subtitle && <p className="truncate text-xs text-ink-500">{partner.subtitle}</p>}
        </div>
        <span
          className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${
            live ? "bg-brand-50 text-brand-700" : "bg-slate-100 text-ink-500"
          }`}
        >
          <span aria-hidden className="relative flex size-2">
            {live && <span className="absolute inline-flex size-full animate-ping rounded-full bg-accent-400 opacity-60" />}
            <span className={`relative inline-flex size-2 rounded-full ${live ? "bg-accent-400" : "bg-slate-300"}`} />
          </span>
          {live ? "En direct" : "Connexion…"}
        </span>
      </header>

      <div
        className="flex h-[58vh] min-h-80 flex-col overflow-y-auto bg-white px-4 py-5 sm:px-6 lg:h-auto lg:min-h-0 lg:flex-1"
        aria-live="polite"
        aria-label="Messages"
      >
        {messages.length === 0 && (
          <div className="m-auto flex max-w-xs flex-col items-center text-center">
            <span className="flex size-14 items-center justify-center rounded-2xl bg-brand-50 text-brand-600">
              <SendIcon />
            </span>
            <p className="mt-4 font-semibold text-ink-900">Aucun message pour l&apos;instant</p>
            <p className="mt-1 text-sm text-ink-500">Présentez-vous et proposez un premier échange !</p>
          </div>
        )}

        {messages.map((message, index) => {
          const mine = message.sender_id === currentUserId;
          const previous = messages[index - 1];
          const newDay = !previous || dayKey(previous.created_at) !== dayKey(message.created_at);
          const sameSenderAsPrevious = !newDay && previous?.sender_id === message.sender_id;
          const name = names[message.sender_id] ?? "Participant";

          return (
            <div key={message.id}>
              {newDay && (
                <p className="my-4 flex items-center gap-3 text-xs font-medium text-ink-500 first-letter:uppercase">
                  <span aria-hidden className="h-px flex-1 bg-slate-200" />
                  <span className="rounded-full bg-white px-3 py-1 shadow-sm ring-1 ring-slate-200/70">
                    {formatDay(message.created_at)}
                  </span>
                  <span aria-hidden className="h-px flex-1 bg-slate-200" />
                </p>
              )}
              <div
                className={`flex animate-fade-up items-end gap-2 [animation-duration:300ms] ${mine ? "flex-row-reverse" : ""} ${
                  sameSenderAsPrevious ? "mt-1" : "mt-4"
                }`}
              >
                <span className={sameSenderAsPrevious ? "invisible" : ""}>
                  <Avatar
                    name={name}
                    src={mine ? (me?.avatarUrl ?? null) : partner && name === partner.name ? partner.avatarUrl : null}
                    size="sm"
                  />
                </span>
                <div
                  className={`max-w-[80%] px-4 py-2.5 text-sm leading-relaxed sm:max-w-[70%] ${
                    mine
                      ? "rounded-2xl rounded-br-md bg-brand-50 text-ink-900 shadow-sm ring-1 ring-brand-100"
                      : "rounded-2xl rounded-bl-md bg-slate-50 text-ink-800 shadow-sm ring-1 ring-slate-200/70"
                  }`}
                >
                  {!sameSenderAsPrevious && <p className="mb-0.5 text-xs font-semibold text-brand-700">{name}</p>}
                  <p className="break-words whitespace-pre-wrap">{message.content}</p>
                  <p className="mt-1 text-right text-[11px] text-ink-500">
                    <time dateTime={message.created_at}>{formatTime(message.created_at)}</time>
                  </p>
                </div>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {canWrite ? (
        <form onSubmit={send} className="border-t border-slate-100 bg-white p-3 sm:p-4">
          <div className="flex items-end gap-2 rounded-2xl border border-slate-200 bg-white p-1.5 transition-colors focus-within:border-brand-500 focus-within:bg-white focus-within:ring-2 focus-within:ring-brand-100">
            <label htmlFor="chat-input" className="sr-only">
              Votre message
            </label>
            <textarea
              id="chat-input"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={onKeyDown}
              maxLength={MAX_LENGTH}
              rows={1}
              placeholder="Écrire un message…"
              className="max-h-40 min-h-10 flex-1 resize-none bg-transparent px-3 py-2.5 text-sm outline-none placeholder:text-ink-500/70"
            />
            <Button
              type="submit"
              loading={sending}
              disabled={!draft.trim()}
              aria-label="Envoyer le message"
              className="size-10 shrink-0 rounded-xl p-0!"
            >
              {!sending && <SendIcon />}
            </Button>
          </div>
          <p className="mt-1.5 hidden px-1 text-[11px] text-ink-500 sm:block">
            Entrée pour envoyer · Maj + Entrée pour aller à la ligne
          </p>
        </form>
      ) : (
        <p className="border-t border-slate-100 p-4 text-center text-sm text-ink-500">
          Ce mentorat est terminé : la conversation est en lecture seule.
        </p>
      )}
      {error && (
        <p role="alert" className="px-4 pb-3 text-sm text-red-600">
          {error}
        </p>
      )}
    </section>
  );
}
