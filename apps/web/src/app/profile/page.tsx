"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { toast } from "sonner";

import { AppShell } from "@/components/layout/AppShell";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/features/auth/AuthProvider";
import { initialsFromName } from "@/lib/auth/session";
import { cn } from "@/lib/utils";

export default function ProfilePage() {
  const router = useRouter();
  const { ready, isAuthenticated, profile, updateProfile } = useAuth();
  const [displayName, setDisplayName] = useState("");
  const [homeCity, setHomeCity] = useState("");
  const [bio, setBio] = useState("");

  useEffect(() => {
    if (!ready) return;
    if (!isAuthenticated || !profile) {
      router.replace("/login");
      return;
    }
    setDisplayName(profile.displayName);
    setHomeCity(profile.homeCity);
    setBio(profile.bio);
  }, [ready, isAuthenticated, profile, router]);

  if (!ready || !profile) {
    return (
      <AppShell>
        <div className="h-40 animate-pulse rounded-3xl bg-muted" />
      </AppShell>
    );
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    updateProfile({
      displayName: displayName.trim(),
      homeCity: homeCity.trim(),
      bio: bio.trim(),
    });
    toast.success("Perfil actualizado");
  }

  return (
    <AppShell>
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">Perfil</p>
          <h1 className="mt-2 font-display text-4xl tracking-tight">Tu cuenta de viajero</h1>
        </div>
        <Link
          href="/trips"
          className={cn(buttonVariants({ variant: "outline" }), "rounded-full")}
        >
          Ver mis viajes
        </Link>
      </div>

      <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
        <aside className="rounded-3xl border border-border bg-card p-6 shadow-card">
          <Avatar className="size-24">
            <AvatarFallback className="bg-foreground text-2xl text-background">
              {initialsFromName(profile.displayName)}
            </AvatarFallback>
          </Avatar>
          <p className="mt-4 text-lg font-semibold">{profile.displayName}</p>
          <p className="text-sm text-muted-foreground">{profile.email}</p>
          <p className="mt-3 text-xs uppercase tracking-wide text-muted-foreground">
            Subject JWT · {profile.subject}
          </p>
        </aside>

        <form
          onSubmit={onSubmit}
          className="space-y-5 rounded-3xl border border-border bg-card p-6 shadow-card sm:p-8"
        >
          <div className="space-y-2">
            <Label htmlFor="displayName">Nombre público</Label>
            <Input
              id="displayName"
              required
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="h-12 rounded-xl"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="homeCity">Ciudad base</Label>
            <Input
              id="homeCity"
              value={homeCity}
              onChange={(e) => setHomeCity(e.target.value)}
              className="h-12 rounded-xl"
              placeholder="Medellín"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="bio">Sobre vos</Label>
            <textarea
              id="bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={4}
              className="w-full rounded-xl border border-input bg-transparent px-3 py-3 text-sm outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring"
              placeholder="Viajo por trabajo y me gusta llegar con la maleta lista."
            />
          </div>
          <Button type="submit" className="h-12 rounded-xl px-8">
            Guardar perfil
          </Button>
        </form>
      </div>
    </AppShell>
  );
}
