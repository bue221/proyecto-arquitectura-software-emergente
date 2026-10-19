import type { ReactNode } from "react";

import { SiteHeader } from "@/components/layout/SiteHeader";

type AppShellProps = {
  children: ReactNode;
  wide?: boolean;
};

export function AppShell({ children, wide = false }: AppShellProps) {
  return (
    <div className="relative flex min-h-dvh flex-col bg-background">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-[420px] bg-[radial-gradient(ellipse_at_top,_rgba(227,28,95,0.08),_transparent_55%)]"
      />
      <SiteHeader />
      <main
        className={
          wide
            ? "relative mx-auto w-full max-w-7xl flex-1 px-4 pb-16 pt-8 sm:px-6"
            : "relative mx-auto w-full max-w-6xl flex-1 px-4 pb-16 pt-8 sm:px-6"
        }
      >
        {children}
      </main>
      <footer className="mt-auto border-t border-border bg-white">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-8 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <p>
            © {new Date().getFullYear()} RutaCO — itinerarios personales sobre aeropuertos de
            Colombia.
          </p>
          <p className="text-xs">El navegador solo habla con el API Gateway interno.</p>
        </div>
      </footer>
    </div>
  );
}
