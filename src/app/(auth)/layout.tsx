import type { ReactNode } from "react";
import { Logo } from "@/components/layout/Logo";

/** Mise en page des écrans de connexion et d'inscription. */
export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <main className="flex flex-1 flex-col items-center px-4 py-10">
      <div className="mb-8">
        <Logo />
      </div>
      <div className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
        {children}
      </div>
    </main>
  );
}
