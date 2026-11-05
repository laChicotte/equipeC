"use client";

import { useFormStatus } from "react-dom";
import { endMentorship } from "../actions";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      disabled={pending}
      className="text-sm text-zinc-500 underline-offset-2 hover:text-red-600 hover:underline disabled:opacity-60"
    >
      {pending ? "Clôture…" : "Terminer le mentorat"}
    </button>
  );
}

/** Termine le mentorat après confirmation (action irréversible). */
export function EndMentorshipButton({ mentorshipId }: { mentorshipId: string }) {
  return (
    <form
      action={endMentorship}
      onSubmit={(event) => {
        const confirmed = window.confirm(
          "Terminer ce mentorat ?\n\nLa conversation, les séances et les objectifs resteront consultables, mais plus modifiables.",
        );
        if (!confirmed) event.preventDefault();
      }}
    >
      <input type="hidden" name="mentorship_id" value={mentorshipId} />
      <SubmitButton />
    </form>
  );
}
