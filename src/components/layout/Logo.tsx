import Link from "next/link";

export function Logo({ href = "/" }: { href?: string }) {
  return (
    <Link href={href} className="flex items-center gap-2 font-semibold text-zinc-900">
      <span className="inline-flex size-8 items-center justify-center rounded-lg bg-brand-600 text-sm font-bold text-white">
        M
      </span>
      <span>
        Mentor<span className="text-brand-700">Connect</span>
      </span>
    </Link>
  );
}
