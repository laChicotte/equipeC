import type { MentorRating } from "../queries";

/** Note moyenne affichée sous forme « ★ 4,5 (12 avis) ». */
export function RatingStars({ rating }: { rating: MentorRating | null }) {
  if (!rating) return <span className="text-xs text-ink-500">Pas encore d&apos;avis</span>;

  return (
    <span className="inline-flex items-center gap-1 text-sm">
      <span aria-hidden className="text-amber-400">★</span>
      <span className="font-medium">{rating.avg.toLocaleString("fr-FR")}</span>
      <span className="text-ink-500">
        ({rating.count} avis)
      </span>
    </span>
  );
}
