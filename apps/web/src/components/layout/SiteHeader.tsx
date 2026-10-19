"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Menu, Plane } from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { buttonVariants } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/features/auth/AuthProvider";
import { initialsFromName } from "@/lib/auth/session";
import { cn } from "@/lib/utils";

const nav = [
  { href: "/", label: "Studio" },
  { href: "/trips", label: "Viajes" },
  { href: "/profile", label: "Perfil" },
];

type SiteHeaderProps = {
  variant?: "default" | "overlay";
};

export function SiteHeader({ variant = "default" }: SiteHeaderProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { ready, isAuthenticated, profile, logout } = useAuth();

  return (
    <header
      className={cn(
        "sticky top-0 z-40 h-16 border-b backdrop-blur-md",
        variant === "overlay"
          ? "border-white/50 bg-white/70"
          : "border-slate-200/80 bg-white/90",
      )}
    >
      <div className="mx-auto flex h-full w-full max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight text-slate-900">
          <span className="flex size-9 items-center justify-center rounded-full bg-emerald-600 text-white shadow-sm">
            <Plane className="size-4" aria-hidden />
          </span>
          <span className="text-[15px]">
            Ruta<span className="text-emerald-600">CO</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {nav.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "rounded-full px-4 py-2 text-sm font-medium transition-colors",
                  active
                    ? "bg-slate-900 text-white"
                    : "text-slate-500 hover:bg-slate-100 hover:text-slate-900",
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          {!ready ? (
            <div className="h-9 w-24 animate-pulse rounded-full bg-slate-200" />
          ) : isAuthenticated && profile ? (
            <DropdownMenu>
              <DropdownMenuTrigger
                className={cn(
                  buttonVariants({ variant: "outline" }),
                  "h-10 gap-2 rounded-full border-slate-200 px-2 pl-3 shadow-sm",
                )}
              >
                <Menu className="size-4 text-slate-500" />
                <Avatar className="size-7">
                  <AvatarFallback className="bg-slate-900 text-[11px] text-white">
                    {initialsFromName(profile.displayName)}
                  </AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 rounded-xl">
                <DropdownMenuLabel className="font-normal">
                  <p className="text-sm font-semibold text-slate-900">{profile.displayName}</p>
                  <p className="text-xs text-slate-500">{profile.email}</p>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => router.push("/trips")}>Mis viajes</DropdownMenuItem>
                <DropdownMenuItem onClick={() => router.push("/profile")}>
                  Cuenta y perfil
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => {
                    logout();
                    router.push("/login");
                  }}
                >
                  Cerrar sesión
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link
              href="/login"
              className={cn(
                buttonVariants({ variant: "default" }),
                "h-10 rounded-full bg-emerald-600 px-5 hover:bg-emerald-500",
              )}
            >
              Iniciar sesión
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
