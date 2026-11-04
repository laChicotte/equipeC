import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

/**
 * Emplacement réservé : montre où une fonctionnalité du backlog arrivera.
 * À supprimer de chaque page quand la tâche correspondante est développée.
 */
export function ComingSoon({
  task,
  title,
  items,
}: {
  task: string;
  title: string;
  items: string[];
}) {
  return (
    <Card className="border-dashed">
      <div className="mb-3 flex items-center gap-2">
        <Badge tone="accent">{task}</Badge>
        <h2 className="font-semibold">{title}</h2>
      </div>
      <ul className="list-disc space-y-1 pl-5 text-sm text-zinc-600">
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </Card>
  );
}
