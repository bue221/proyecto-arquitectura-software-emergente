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
  { href: "/", label: "Explorar" },
  { href: "/trips", label: "Viajes" },
  { href: "/profile", label: "Perfil" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const { ready, isAuthenticated, profile, logout } = useAuth();

  return (
    <header className="sticky top-0 z-40 border-b border-border/80 bg-white/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight text-foreground">
          <span className="flex size-9 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm">
            <Plane className="size-4" aria-hidden />
          </span>
          <span className="text-[15px]">
            Ruta<span className="text-primary">CO</span>
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
                    ? "bg-foreground text-background"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground",
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          {!ready ? (
            <div className="h-9 w-24 animate-pulse rounded-full bg-muted" />
          ) : isAuthenticated && profile ? (
            <DropdownMenu>
              <DropdownMenuTrigger
                className={cn(
                  buttonVariants({ variant: "outline" }),
                  "h-10 gap-2 rounded-full border-border px-2 pl-3 shadow-sm",
                )}
              >
                <Menu className="size-4 text-muted-foreground" />
                <Avatar className="size-7">
                  <AvatarFallback className="bg-foreground text-[11px] text-background">
                    {initialsFromName(profile.displayName)}
                  </AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 rounded-xl">
                <DropdownMenuLabel className="font-normal">
                  <p className="text-sm font-semibold text-foreground">{profile.displayName}</p>
                  <p className="text-xs text-muted-foreground">{profile.email}</p>
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
              className={cn(buttonVariants({ variant: "default" }), "h-10 rounded-full px-5")}
            >
              Iniciar sesión
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
