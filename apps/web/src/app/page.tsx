import Link from "next/link";
import { ArrowRight, Luggage, MapPinned, ShieldCheck } from "lucide-react";

import { AppShell } from "@/components/layout/AppShell";
import { buttonVariants } from "@/components/ui/button";
import { AirportMap } from "@/features/airports/components/AirportMap";
import { cn } from "@/lib/utils";

export default function HomePage() {
  return (
    <AppShell wide>
      <section className="mb-10 space-y-6 text-center md:mb-14">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">
          Viajes personales · Colombia
        </p>
        <h1 className="mx-auto max-w-3xl font-display text-4xl leading-[1.1] tracking-tight text-foreground sm:text-5xl md:text-6xl">
          Encontrá tu ruta, armá el itinerario y listá la maleta.
        </h1>
        <p className="mx-auto max-w-2xl text-base text-muted-foreground sm:text-lg">
          Una experiencia clara para planear trayectos entre aeropuertos colombianos — con login,
          perfil y checklist de lo que llevás.
        </p>

        <div className="mx-auto flex max-w-3xl flex-col overflow-hidden rounded-full border border-border bg-white shadow-search sm:flex-row sm:items-stretch">
          <div className="flex flex-1 flex-col gap-0.5 border-b border-border px-5 py-3 text-left sm:border-b-0 sm:border-r">
            <span className="text-[11px] font-semibold uppercase tracking-wide text-foreground">
              Origen
            </span>
            <span className="text-sm text-muted-foreground">Elegí un id del mapa</span>
          </div>
          <div className="flex flex-1 flex-col gap-0.5 border-b border-border px-5 py-3 text-left sm:border-b-0 sm:border-r">
            <span className="text-[11px] font-semibold uppercase tracking-wide text-foreground">
              Destino
            </span>
            <span className="text-sm text-muted-foreground">Otro aeropuerto</span>
          </div>
          <div className="flex flex-1 flex-col gap-0.5 px-5 py-3 text-left">
            <span className="text-[11px] font-semibold uppercase tracking-wide text-foreground">
              Fecha
            </span>
            <span className="text-sm text-muted-foreground">Cuando viajás</span>
          </div>
          <Link
            href="/trips"
            className={cn(
              buttonVariants({ variant: "default" }),
              "m-2 h-12 shrink-0 rounded-full px-6 sm:self-center",
            )}
          >
            Planear viaje
            <ArrowRight className="size-4" />
          </Link>
        </div>
      </section>

      <AirportMap />

      <section className="mt-12 grid gap-4 md:grid-cols-3">
        {[
          {
            icon: MapPinned,
            title: "Mapa confiable",
            body: "Coordenadas adaptadas por el Airport Service, con Redis y circuit breaker detrás.",
          },
          {
            icon: ShieldCheck,
            title: "Login con JWT",
            body: "El Gateway emite el token; tus viajes quedan protegidos en el edge.",
          },
          {
            icon: Luggage,
            title: "Maleta lista",
            body: "En cada viaje podés marcar qué llevás: documentos, ropa, cargadores…",
          },
        ].map((item) => (
          <article
            key={item.title}
            className="rounded-3xl border border-border bg-card p-6 shadow-card transition hover:-translate-y-0.5 hover:shadow-search"
          >
            <item.icon className="mb-4 size-6 text-primary" />
            <h3 className="text-lg font-semibold">{item.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.body}</p>
          </article>
        ))}
      </section>
    </AppShell>
  );
}
