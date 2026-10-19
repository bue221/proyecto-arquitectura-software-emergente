import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";

import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/features/auth/AuthProvider";
import { cn } from "@/lib/utils";

import "./globals.css";

const sans = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3001";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "RutaCO — Itinerarios aéreos en Colombia",
    template: "%s · RutaCO",
  },
  description:
    "Studio interactivo para planear vuelos entre aeropuertos colombianos: mapa libre, checklist de maleta y planes en destino.",
  applicationName: "RutaCO",
  keywords: [
    "itinerarios",
    "aeropuertos Colombia",
    "BOG",
    "MDE",
    "viajes",
    "packing list",
    "RutaCO",
  ],
  authors: [{ name: "RutaCO" }],
  creator: "RutaCO",
  publisher: "RutaCO",
  category: "travel",
  icons: {
    icon: [{ url: "/icon.svg", type: "image/svg+xml" }],
    apple: [{ url: "/apple-icon", sizes: "180x180", type: "image/png" }],
  },
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    title: "RutaCO",
    statusBarStyle: "default",
  },
  openGraph: {
    type: "website",
    locale: "es_CO",
    url: siteUrl,
    siteName: "RutaCO",
    title: "RutaCO — Itinerarios aéreos en Colombia",
    description:
      "Elegí origen y destino en el mapa, armá planes recomendados y tu maleta. Arquitectura de microservicios + Next.js.",
  },
  twitter: {
    card: "summary_large_image",
    title: "RutaCO — Itinerarios aéreos en Colombia",
    description: "Mapa interactivo, planes en destino y checklist de maleta.",
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: "/",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#059669" },
    { media: "(prefers-color-scheme: dark)", color: "#064e3b" },
  ],
  width: "device-width",
  initialScale: 1,
  colorScheme: "light",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "RutaCO",
    applicationCategory: "TravelApplication",
    operatingSystem: "Web",
    description:
      "Planificador de itinerarios personales entre aeropuertos de Colombia con mapa interactivo.",
    url: siteUrl,
    inLanguage: "es-CO",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "COP",
    },
  };

  return (
    <html lang="es" className={cn("font-sans", sans.variable)}>
      <body className="min-h-dvh antialiased">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <AuthProvider>
          {children}
          <Toaster richColors closeButton position="top-right" />
        </AuthProvider>
      </body>
    </html>
  );
}
