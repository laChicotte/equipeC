import { deleteGoal, setGoalStatus } from "../actions";
import { getGoals, type GoalView } from "../queries";
import { GoalForm } from "./GoalForm";
import { Card } from "@/components/ui/Card";
import { formatDueDate, todayInConakry } from "@/lib/datetime";
import type { GoalStatus } from "@/types/database";

const NEXT_STATUS: Record<GoalStatus, GoalStatus> = {
  todo: "in_progress",
  in_progress: "done",
  done: "todo",
};

const STATUS_UI: Record<GoalStatus, { label: string; icon: string; className: string }> = {
  todo: { label: "À faire", icon: "○", className: "border-zinc-300 text-zinc-500" },
  in_progress: { label: "En cours", icon: "◐", className: "border-amber-400 bg-amber-50 text-amber-700" },
  done: { label: "Fait", icon: "✓", className: "border-brand-600 bg-brand-600 text-white" },
};

function GoalRow({ goal, canEdit }: { goal: GoalView; canEdit: boolean }) {
  const ui = STATUS_UI[goal.status];
  const next = STATUS_UI[NEXT_STATUS[goal.status]];

  const badge = (
    <span
      className={`inline-flex size-6 shrink-0 items-center justify-center rounded-full border text-xs font-bold ${ui.className}`}
    >
      {ui.icon}
    </span>
  );

  return (
    <li className="group flex items-start gap-3 py-2">
      {canEdit ? (
        // Un clic fait avancer l'objectif : À faire → En cours → Fait → À faire
        <form action={setGoalStatus}>
          <input type="hidden" name="goal_id" value={goal.id} />
          <input type="hidden" name="mentorship_id" value={goal.mentorship_id} />
          <input type="hidden" name="status" value={NEXT_STATUS[goal.status]} />
          <button
            className="rounded-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600"
            aria-label={`${goal.title} : ${ui.label}. Passer à « ${next.label} »`}
            title={`Passer à « ${next.label} »`}
          >
            {badge}
          </button>
        </form>
      ) : (
        <span aria-label={ui.label}>{badge}</span>
      )}

      <div className="min-w-0 flex-1">
        <p className={`text-sm break-words ${goal.status === "done" ? "text-zinc-400 line-through" : ""}`}>
          {goal.title}
        </p>
        <p className="text-xs text-zinc-500">
          {ui.label}
          {goal.due_date && (
            <span className={goal.overdue ? "font-medium text-red-600" : ""}>
              {" "}
              · {goal.overdue ? "en retard, " : ""}échéance le {formatDueDate(goal.due_date)}
            </span>
          )}
        </p>
      </div>

      {canEdit && (
        <form action={deleteGoal}>
          <input type="hidden" name="goal_id" value={goal.id} />
          <input type="hidden" name="mentorship_id" value={goal.mentorship_id} />
          <button
            aria-label={`Supprimer l'objectif « ${goal.title} »`}
            className="rounded px-1.5 text-zinc-400 opacity-60 group-hover:opacity-100 hover:bg-red-50 hover:text-red-600 focus-visible:opacity-100"
          >
            ×
          </button>
        </form>
      )}
    </li>
  );
}

/** Bloc « Objectifs » de l'espace de mentorat : progression + liste + ajout. */
export async function GoalsPanel({
  mentorshipId,
  canEdit,
}: {
  mentorshipId: string;
  /** Mentorat actif : ajout, changement d'état et suppression possibles */
  canEdit: boolean;
}) {
  const { goals, done, total, percent } = await getGoals(mentorshipId);

  return (
    <Card>
      <div className="mb-2 flex items-baseline justify-between">
        <h2 className="font-semibold">Objectifs</h2>
        {total > 0 && (
          <span className="text-sm text-zinc-600">
            {done}/{total} atteint{done > 1 ? "s" : ""}
          </span>
        )}
      </div>

      {total > 0 && (
        <div
          role="progressbar"
          aria-label="Progression des objectifs"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={percent}
          className="mb-3 h-2.5 overflow-hidden rounded-full bg-zinc-100"
        >
          <div
            className="h-full rounded-full bg-brand-600 transition-[width] duration-500"
            style={{ width: `${percent}%` }}
          />
        </div>
      )}

      {total > 0 ? (
        <ul className="mb-3 divide-y divide-zinc-100">
          {goals.map((goal) => (
            <GoalRow key={goal.id} goal={goal} canEdit={canEdit} />
          ))}
        </ul>
      ) : (
        <p className="mb-3 text-sm text-zinc-600">
          Fixez ensemble des objectifs concrets pour suivre la progression.
        </p>
      )}

      {canEdit && <GoalForm mentorshipId={mentorshipId} minDate={todayInConakry()} />}
    </Card>
  );
}
