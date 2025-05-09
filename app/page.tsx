import { MapDisplay } from "@/features/map-display/components/map-display";
import { MapPin } from "lucide-react";

export default function Home() {
  return (
    <main className="flex flex-col h-screen w-screen overflow-hidden">
      <header className="flex items-center justify-between px-5 py-3 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 z-10">
        <div className="flex items-center gap-2">
          <MapPin className="h-5 w-5 text-primary" />
          <h1 className="text-lg font-medium bg-gradient-to-r from-primary to-blue-500 dark:from-blue-400 dark:to-primary bg-clip-text text-transparent">
            GeoAgentic
          </h1>
        </div>
      </header>

      <div className="flex-1 relative">
        <MapDisplay
          initialCenter={[-98, 40]}
          initialZoom={3}
          height="100%"
          width="100%"
        />
      </div>
    </main>
  );
}
