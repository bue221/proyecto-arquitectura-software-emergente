import type { ReactNode } from "react";

type AppShellProps = {
  children: ReactNode;
};

export function AppShell({ children }: AppShellProps) {
  return (
    <main className="relative min-h-screen overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,oklch(0.94_0.04_170)_0%,transparent_42%),radial-gradient(circle_at_80%_0%,oklch(0.93_0.03_230)_0%,transparent_40%),linear-gradient(180deg,oklch(0.985_0.005_220)_0%,oklch(0.96_0.01_220)_100%)]"
      />
      <div className="relative mx-auto flex w-full max-w-6xl flex-col gap-10 px-6 py-12 md:py-16">
        {children}
      </div>
    </main>
  );
}
