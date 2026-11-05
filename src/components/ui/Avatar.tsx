import Image from "next/image";

const SIZES = {
  sm: { box: "size-8 text-xs", px: 32 },
  md: { box: "size-10 text-sm", px: 40 },
  lg: { box: "size-16 text-xl", px: 64 },
  card: { box: "size-20 text-2xl", px: 80 },
  xl: { box: "size-28 text-4xl", px: 112 },
  "2xl": { box: "size-36 text-5xl sm:size-44", px: 176 },
} as const;

/**
 * Photo de profil (migration 0006), ou initiales sur fond vert si la personne
 * n'a pas de photo. `className` permet une taille ou une forme sur mesure.
 */
export function Avatar({
  name,
  src,
  size = "md",
  className = "",
  rounded = "full",
}: {
  name: string;
  src?: string | null;
  size?: keyof typeof SIZES;
  className?: string;
  rounded?: "full" | "3xl";
}) {
  const { box, px } = SIZES[size];
  const shape = rounded === "full" ? "rounded-full" : "rounded-3xl";
  if (src) {
    return (
      <Image
        src={src}
        alt=""
        width={px * 2}
        height={px * 2}
        className={`shrink-0 object-cover ${shape} ${box} ${className}`}
      />
    );
  }
  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
  return (
    <span
      aria-hidden
      className={`inline-flex shrink-0 items-center justify-center bg-brand-100 font-semibold text-brand-800 ${shape} ${box} ${className}`}
    >
      {initials || "?"}
    </span>
  );
}
