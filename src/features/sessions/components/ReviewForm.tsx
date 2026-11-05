"use client";

import { useActionState, useState } from "react";
import { submitReview, type ReviewFormState } from "../actions";
import { Button } from "@/components/ui/Button";

const initialState: ReviewFormState = {};
const LABELS = ["", "Décevante", "Moyenne", "Bien", "Très bien", "Excellente"];

/** Notation d'une séance : 5 étoiles (boutons radio accessibles) + commentaire. */
export function ReviewForm({ sessionId, mentorshipId }: { sessionId: string; mentorshipId: string }) {
  const [state, formAction, pending] = useActionState(submitReview, initialState);
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const shown = hover || rating;

  return (
    <form action={formAction} className="flex flex-col gap-2 rounded-lg bg-amber-50/60 p-3">
      <input type="hidden" name="session_id" value={sessionId} />
      <input type="hidden" name="mentorship_id" value={mentorshipId} />

      <fieldset>
        <legend className="mb-1 text-sm font-medium">Évaluer la séance</legend>
        <div className="flex items-center gap-1" onMouseLeave={() => setHover(0)}>
          {[1, 2, 3, 4, 5].map((n) => (
            <label key={n} className="cursor-pointer" onMouseEnter={() => setHover(n)}>
              <input
                type="radio"
                name="rating"
                value={n}
                checked={rating === n}
                onChange={() => setRating(n)}
                className="peer sr-only"
              />
              <span
                aria-hidden
                className={`block text-2xl leading-none transition-colors peer-focus-visible:outline-2 peer-focus-visible:outline-brand-600 ${
                  n <= shown ? "text-accent-500" : "text-zinc-300"
                }`}
              >
                ★
              </span>
              <span className="sr-only">
                {n} sur 5 ({LABELS[n]})
              </span>
            </label>
          ))}
          <span className="ml-2 text-xs text-zinc-600">{LABELS[shown]}</span>
        </div>
        {state.fieldErrors?.rating && (
          <p className="text-sm text-red-600">{state.fieldErrors.rating.join(" ")}</p>
        )}
      </fieldset>

      <label htmlFor={`comment-${sessionId}`} className="sr-only">
        Commentaire
      </label>
      <textarea
        id={`comment-${sessionId}`}
        name="comment"
        rows={2}
        maxLength={1000}
        placeholder="Un commentaire ? (facultatif)"
        className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm outline-none focus:border-brand-600 focus:ring-2 focus:ring-brand-100"
      />
      {state.error && (
        <p role="alert" className="text-sm text-red-600">
          {state.error}
        </p>
      )}
      <div>
        <Button type="submit" disabled={pending || rating === 0}>
          {pending ? "Envoi…" : "Envoyer mon avis"}
        </Button>
      </div>
    </form>
  );
}
