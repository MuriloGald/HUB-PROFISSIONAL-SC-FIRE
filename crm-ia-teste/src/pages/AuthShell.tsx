import type { ReactNode } from "react";
import { isMockMode } from "@/lib/backend";

/** Moldura visual das telas de autenticação. */
export function AuthShell({ title, subtitle, children }: {
  title: string;
  subtitle: string;
  children: ReactNode;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-secondary p-4">
      <div className="w-full max-w-md">
        <div className="mb-6 flex flex-col items-center text-center">
          <img src="/logo-sc-fire.png" alt="SC Fire" className="mb-3 h-14 w-14 rounded-2xl bg-white object-contain p-1.5 shadow-sm" />
          <h1 className="font-display text-xl font-semibold">{title}</h1>
          <p className="text-sm text-muted-foreground">{subtitle}</p>
        </div>
        <div className="rounded-xl border bg-card p-6 shadow-sm">{children}</div>
        {isMockMode && (
          <p className="mt-4 text-center text-xs text-muted-foreground">
            Modo demonstração · admin: <b>galdinomus@gmail.com</b> / <b>scfire2026</b>
          </p>
        )}
      </div>
    </div>
  );
}
