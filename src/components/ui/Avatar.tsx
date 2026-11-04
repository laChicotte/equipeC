/** Avatar avec initiales (pas de stockage d'images pour le MVP). */
export function Avatar({ name, size = "md" }: { name: string; size?: "sm" | "md" | "lg" }) {
  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

  const sizes = { sm: "size-8 text-xs", md: "size-10 text-sm", lg: "size-16 text-xl" };

  return (
    <span
      aria-hidden
      className={`inline-flex shrink-0 items-center justify-center rounded-full bg-brand-100 font-semibold text-brand-800 ${sizes[size]}`}
    >
      {initials || "?"}
    </span>
  );
}
