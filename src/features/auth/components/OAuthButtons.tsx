import { signInWithProvider } from "../actions";
import { FacebookLogo, GitHubLogo, GoogleLogo } from "@/components/ui/icons";

const PROVIDERS = [
  { id: "google", name: "Google", logo: <GoogleLogo /> },
  { id: "facebook", name: "Facebook", logo: <FacebookLogo /> },
  { id: "github", name: "GitHub", logo: <GitHubLogo className="h-5 w-5 text-ink-900" /> },
];

/** Séparateur « Ou continuer avec » + boutons Google / Facebook / GitHub. */
export function OAuthButtons({ next }: { next?: string }) {
  return (
    <div className="mt-7">
      <div className="flex items-center gap-4 text-sm text-ink-500">
        <span className="h-px flex-1 bg-zinc-200" />
        Ou continuer avec
        <span className="h-px flex-1 bg-zinc-200" />
      </div>
      <form action={signInWithProvider} className="mt-5 grid gap-3 sm:grid-cols-3">
        {next && <input type="hidden" name="next" value={next} />}
        {PROVIDERS.map((p) => (
          <button
            key={p.id}
            type="submit"
            name="provider"
            value={p.id}
            aria-label={`Continuer avec ${p.name}`}
            className="flex items-center justify-center gap-2.5 rounded-xl border border-zinc-200 bg-white px-3 py-3 text-sm font-semibold text-ink-900 shadow-sm transition-colors hover:border-zinc-300 hover:bg-zinc-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600"
          >
            {p.logo}
            {/* Mobile : libellé complet (boutons empilés) ; ordinateur : nom seul (3 colonnes) */}
            <span className="sm:hidden">Continuer avec {p.name}</span>
            <span className="hidden sm:inline">{p.name}</span>
          </button>
        ))}
      </form>
    </div>
  );
}
