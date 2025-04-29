import { MapDisplay } from "@/features/map-display/components/map-display";

export default function Home() {
  return (
    <div className="h-screen w-screen overflow-hidden">
      <MapDisplay
        initialCenter={[-98, 40]}
        initialZoom={3}
        height="100%"
        width="100%"
      />
    </div>
  );
}
