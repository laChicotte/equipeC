import path from "node:path";
import type { NextConfig } from "next";

// Photos de profil : seules les images du dossier « avatars » de NOTRE projet
// Supabase peuvent être affichées et optimisées par next/image.
const supabaseHost = (() => {
  try {
    return new URL(process.env.NEXT_PUBLIC_SUPABASE_URL ?? "").hostname;
  } catch {
    return null;
  }
})();

const nextConfig: NextConfig = {
  images: {
    remotePatterns: supabaseHost
      ? [{ protocol: "https", hostname: supabaseHost, pathname: "/storage/v1/object/public/avatars/**" }]
      : [],
  },
  turbopack: {
    // Fixe la racine du projet : sans cela, Next.js remonte les dossiers
    // et peut prendre un package-lock.json parasite (ex. dans C:\Users\...)
    // pour la racine du workspace.
    root: path.resolve(__dirname),
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
