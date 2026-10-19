import { SiteHeader } from "@/components/layout/SiteHeader";
import { ItineraryStudio } from "@/features/studio/components/ItineraryStudio";

export default function HomePage() {
  return (
    <div className="flex min-h-dvh flex-col bg-slate-50">
      <SiteHeader variant="overlay" />
      <ItineraryStudio />
    </div>
  );
}
