import { signInWithProvider } from "../actions";
import { FacebookLogo, GitHubLogo, GoogleLogo } from "@/components/ui/icons";

/**
 * Facebook est masqué tant que l'application Facebook n'est pas publiée
 * (en mode « Développement », seuls ses testeurs peuvent se connecter).
 * Pour le réafficher : variable d'environnement AUTH_FACEBOOK_ENABLED=true
 * (lue côté serveur), puis redémarrage / redéploiement.
 */
const FACEBOOK_ENABLED = process.env.AUTH_FACEBOOK_ENABLED === "true";

const PROVIDERS = [
  { id: "google", name: "Google", logo: <GoogleLogo /> },
  ...(FACEBOOK_ENABLED ? [{ id: "facebook", name: "Facebook", logo: <FacebookLogo /> }] : []),
  { id: "github", name: "GitHub", logo: <GitHubLogo className="h-5 w-5 text-ink-900" /> },
];

/** Séparateur « Ou continuer avec » + boutons des fournisseurs actifs (Google, GitHub, Facebook si activé). */
export function OAuthButtons({ next }: { next?: string }) {
  return (
    <div className="mt-4 sm:mt-5 short:sm:mt-4">
      <div className="flex items-center gap-4 text-sm text-ink-500">
        <span className="h-px flex-1 bg-slate-200" />
        Ou continuer avec
        <span className="h-px flex-1 bg-slate-200" />
      </div>
      <form action={signInWithProvider} className={`mt-3 grid gap-3 sm:mt-4 short:sm:mt-3 ${PROVIDERS.length === 3 ? "sm:grid-cols-3" : "grid-cols-2"}`}>
        {next && <input type="hidden" name="next" value={next} />}
        {PROVIDERS.map((p) => (
          <button
            key={p.id}
            type="submit"
            name="provider"
            value={p.id}
            aria-label={`Continuer avec ${p.name}`}
            className="flex items-center justify-center gap-2.5 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-semibold sm:py-3 short:sm:py-2.5 text-ink-900 shadow-sm transition-colors hover:border-slate-300 hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600"
          >
            {p.logo}
            {/* Libellé complet quand il y a la place, sinon le nom seul (téléphone à 2 boutons, ordinateur à 3) */}
            <span className={PROVIDERS.length === 3 ? "sm:hidden" : "hidden sm:inline"}>Continuer avec {p.name}</span>
            <span className={PROVIDERS.length === 3 ? "hidden sm:inline" : "sm:hidden"}>{p.name}</span>
          </button>
        ))}
      </form>
    </div>
  );
}
