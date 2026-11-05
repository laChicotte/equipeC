// Vérifie la configuration Supabase de .env.local SANS jamais afficher les clés.
// Usage : npm run check:supabase

try {
  process.loadEnvFile(".env.local");
} catch {
  console.error("❌ Fichier .env.local introuvable. Copiez .env.example en .env.local.");
  process.exit(1);
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim();
let ok = true;
const fail = (msg) => {
  console.error("❌ " + msg);
  ok = false;
};

// 1. URL
if (!url) {
  fail("NEXT_PUBLIC_SUPABASE_URL est vide.");
} else {
  try {
    const u = new URL(url);
    if (u.protocol !== "https:") fail("L'URL doit commencer par https://");
    else if (!u.hostname.endsWith(".supabase.co"))
      console.warn("⚠️  L'URL ne se termine pas par .supabase.co (normal seulement en auto-hébergement).");
    else console.log(`✅ URL valide (projet : ${u.hostname.split(".")[0]})`);
  } catch {
    fail("NEXT_PUBLIC_SUPABASE_URL n'est pas une URL valide.");
  }
}

// 2. Clé : doit être PUBLIQUE (publishable ou anon), jamais secrète
if (!key) {
  fail("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY est vide.");
} else if (key.startsWith("sb_secret_")) {
  fail("Vous avez collé la clé SECRÈTE (sb_secret_...). Remplacez-la par la clé publishable, et ne la partagez pas.");
} else if (key.startsWith("sb_publishable_")) {
  console.log("✅ Clé publishable détectée");
} else if (key.split(".").length === 3) {
  let role;
  try {
    role = JSON.parse(Buffer.from(key.split(".")[1], "base64url").toString()).role;
  } catch {}
  if (role === "service_role")
    fail("Vous avez collé la clé SERVICE_ROLE (secrète). Utilisez la clé anon / publishable.");
  else if (role === "anon") console.log("✅ Ancienne clé anon détectée (fonctionne)");
  else fail("Clé JWT non reconnue.");
} else {
  fail("Format de clé non reconnu (attendu : sb_publishable_... ou ancienne clé anon).");
}

// 3. Test réel de connexion
if (ok) {
  try {
    const res = await fetch(new URL("/auth/v1/health", url), {
      headers: { apikey: key },
      signal: AbortSignal.timeout(30000),
    });
    if (res.ok) console.log("✅ Connexion à Supabase réussie");
    else if (res.status === 401 || res.status === 403)
      fail(`Supabase refuse la clé (HTTP ${res.status}) : vérifiez qu'elle correspond bien à ce projet.`);
    else fail(`Réponse inattendue de Supabase (HTTP ${res.status}). Le projet est peut-être en pause ou en cours de création.`);
  } catch (e) {
    fail(`Impossible de joindre Supabase (${e.name}) : vérifiez l'URL et votre connexion Internet.`);
  }
}

// 4. Variables du script de démo (facultatives pour l'application)
const secret = process.env.SUPABASE_SECRET_KEY?.trim();
const demoPassword = process.env.DEMO_PASSWORD ?? "";
for (const name of Object.keys(process.env)) {
  if (name.startsWith("NEXT_PUBLIC_") && /SECRET|SERVICE/i.test(name)) {
    fail(`${name} : une clé secrète ne doit JAMAIS avoir le préfixe NEXT_PUBLIC_ (elle serait envoyée aux navigateurs).`);
  }
}
if (!secret) {
  console.log("ℹ️  SUPABASE_SECRET_KEY absente (nécessaire seulement pour npm run seed)");
} else if (secret.startsWith("sb_publishable_")) {
  fail("SUPABASE_SECRET_KEY contient la clé publishable, pas la clé secrète.");
} else if (secret.startsWith("sb_secret_") || secret.split(".").length === 3) {
  console.log("✅ Clé secrète présente (script de démo)");
} else {
  fail("SUPABASE_SECRET_KEY : format non reconnu (attendu sb_secret_... ou clé service_role).");
}
if (secret && demoPassword.length < 12) {
  fail("DEMO_PASSWORD : 12 caractères minimum pour les comptes de démo.");
}

console.log(ok ? "\n🎉 Supabase est prêt." : "\nConfiguration incomplète : corrigez les points ci-dessus.");
// exitCode plutôt que process.exit() : évite un plantage de Node sous Windows
// quand la connexion réseau est encore en cours de fermeture.
process.exitCode = ok ? 0 : 1;
