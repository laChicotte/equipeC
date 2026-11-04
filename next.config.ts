import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
