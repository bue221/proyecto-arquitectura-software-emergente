import type { Metadata } from "next";
import { Inter } from "next/font/google";

import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/features/auth/AuthProvider";
import { cn } from "@/lib/utils";

import "./globals.css";

const sans = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "RutaCO — Itinerary Studio",
  description: "Mapa interactivo de aeropuertos colombianos e itinerarios personales",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={cn("font-sans", sans.variable)}>
      <body className="min-h-screen antialiased">
        <AuthProvider>
          {children}
          <Toaster richColors closeButton position="top-right" />
        </AuthProvider>
      </body>
    </html>
  );
}
