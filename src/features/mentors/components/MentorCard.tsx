import Link from "next/link";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { RatingStars } from "./RatingStars";
import type { MentorSummary } from "../queries";

/** Carte d'un mentor dans le catalogue (toute la carte est cliquable). */
export function MentorCard({ mentor }: { mentor: MentorSummary }) {
  const role = [mentor.job_title, mentor.organization].filter(Boolean).join(" · ");

  return (
    <Link
      href={`/mentors/${mentor.id}`}
      className="flex flex-col gap-3 rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm transition hover:border-brand-600 hover:shadow-md"
    >
      <div className="flex items-start gap-3">
        <Avatar name={mentor.full_name} />
        <div className="min-w-0">
          <p className="font-semibold">{mentor.full_name}</p>
          {role && <p className="truncate text-sm text-zinc-600">{role}</p>}
        </div>
      </div>

      {mentor.headline && <p className="text-sm text-zinc-700">{mentor.headline}</p>}

      <div className="flex flex-wrap gap-1.5">
        {mentor.domains.map((d) => (
          <Badge key={d.id} tone="brand">
            {d.name}
          </Badge>
        ))}
      </div>

      <div className="mt-auto flex items-center justify-between pt-1 text-sm text-zinc-500">
        <RatingStars rating={mentor.rating} />
        {mentor.years_experience !== null && <span>{mentor.years_experience} ans d&apos;exp.</span>}
      </div>
    </Link>
  );
}
