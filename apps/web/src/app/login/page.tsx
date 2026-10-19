"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { toast } from "sonner";

import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/features/auth/AuthProvider";

export default function LoginPage() {
  const router = useRouter();
  const { login, isAuthenticated, ready } = useAuth();
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (ready && isAuthenticated) {
      router.replace("/trips");
    }
  }, [ready, isAuthenticated, router]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      await login(displayName, email);
      toast.success("Bienvenido a RutaCO");
      router.push("/trips");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "No se pudo iniciar sesión");
    } finally {
      setBusy(false);
    }
  }

  return (
    <AppShell>
      <div className="mx-auto grid max-w-5xl gap-10 md:grid-cols-2 md:items-center">
        <div className="space-y-4">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
            Cuenta de viajero
          </p>
          <h1 className="font-display text-4xl leading-tight tracking-tight text-foreground md:text-5xl">
            Entrá y armá tu próximo itinerario.
          </h1>
          <p className="text-base text-muted-foreground md:text-lg">
            Login demo vía API Gateway (JWT). Sin contraseña en este entorno académico: usamos tu
            nombre y correo para emitir el token.
          </p>
        </div>

        <form
          onSubmit={onSubmit}
          className="space-y-5 rounded-3xl border border-border bg-card p-6 shadow-card sm:p-8"
        >
          <div className="space-y-2">
            <Label htmlFor="displayName">Nombre</Label>
            <Input
              id="displayName"
              required
              placeholder="Ana Rojas"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="h-12 rounded-xl"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Correo</Label>
            <Input
              id="email"
              required
              type="email"
              placeholder="ana@ruta.co"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-12 rounded-xl"
            />
          </div>
          <Button type="submit" disabled={busy} className="h-12 w-full rounded-xl text-base">
            {busy ? "Entrando…" : "Continuar"}
          </Button>
          <p className="text-center text-sm text-muted-foreground">
            ¿Solo querés ver el mapa?{" "}
            <Link href="/" className="font-medium text-foreground underline-offset-4 hover:underline">
              Explorar sin cuenta
            </Link>
          </p>
        </form>
      </div>
    </AppShell>
  );
}
