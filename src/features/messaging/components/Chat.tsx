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
};

const MAX_LENGTH = 2000;

/** Ajoute un message s'il n'est pas déjà présent (il peut arriver deux fois :
 *  par la réponse de l'envoi ET par le temps réel). */
function addMessage(list: Message[], message: Message) {
  if (list.some((m) => m.id === message.id)) return list;
  return [...list, message].sort((a, b) => a.id - b.id);
}

export function Chat({ mentorshipId, currentUserId, names, initialMessages, canWrite }: Props) {
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

  // Faire défiler jusqu'au dernier message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: "end" });
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
    <section className="flex flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
      <header className="flex items-center justify-between border-b border-zinc-200 px-4 py-3">
        <h2 className="font-semibold">Discussion</h2>
        <span className="flex items-center gap-1.5 text-xs text-zinc-500">
          <span
            aria-hidden
            className={`size-2 rounded-full ${live ? "bg-brand-600" : "bg-zinc-300"}`}
          />
          {live ? "En direct" : "Connexion…"}
        </span>
      </header>

      <div
        className="flex h-[55vh] min-h-72 flex-col gap-1 overflow-y-auto bg-zinc-50 px-4 py-4"
        aria-live="polite"
        aria-label="Messages"
      >
        {messages.length === 0 && (
          <p className="m-auto max-w-xs text-center text-sm text-zinc-500">
            Aucun message pour l&apos;instant. Présentez-vous et proposez un premier échange !
          </p>
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
                <p className="my-3 text-center text-xs font-medium text-zinc-500 first-letter:uppercase">
                  {formatDay(message.created_at)}
                </p>
              )}
              <div
                className={`flex items-end gap-2 ${mine ? "flex-row-reverse" : ""} ${
                  sameSenderAsPrevious ? "mt-0.5" : "mt-3"
                }`}
              >
                {!mine && (
                  <span className={sameSenderAsPrevious ? "invisible" : ""}>
                    <Avatar name={name} size="sm" />
                  </span>
                )}
                <div
                  className={`max-w-[80%] rounded-2xl px-3.5 py-2 text-sm shadow-sm ${
                    mine
                      ? "rounded-br-md bg-brand-600 text-white"
                      : "rounded-bl-md bg-white text-zinc-800 ring-1 ring-zinc-200"
                  }`}
                >
                  {!mine && !sameSenderAsPrevious && (
                    <p className="mb-0.5 text-xs font-semibold text-brand-700">{name}</p>
                  )}
                  <p className="break-words whitespace-pre-wrap">{message.content}</p>
                  <p className={`mt-1 text-right text-[11px] ${mine ? "text-white/70" : "text-zinc-400"}`}>
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
        <form onSubmit={send} className="flex items-end gap-2 border-t border-zinc-200 p-3">
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
            className="max-h-40 min-h-11 flex-1 resize-y rounded-xl border border-zinc-300 px-3 py-2.5 text-sm outline-none focus:border-brand-600 focus:ring-2 focus:ring-brand-100"
          />
          <Button type="submit" disabled={sending || !draft.trim()}>
            {sending ? "…" : "Envoyer"}
          </Button>
        </form>
      ) : (
        <p className="border-t border-zinc-200 p-3 text-center text-sm text-zinc-500">
          Ce mentorat est terminé : la conversation est en lecture seule.
        </p>
      )}
      {error && (
        <p role="alert" className="px-3 pb-3 text-sm text-red-600">
          {error}
        </p>
      )}
    </section>
  );
}
