import { HomeHeader } from "@/features/home/components/HomeHeader";
import { FeatureCards } from "@/features/home/components/FeatureCards";
import { MapDisplay } from "@/features/map-display/components/MapDisplay";

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
      <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <HomeHeader />

        {/* Feature cards section */}
        <FeatureCards />

        {/* Map showcase */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-4 text-center">
            Explore Our Interactive Map
          </h2>
          <div className="h-[500px] w-full overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700">
            <MapDisplay
              initialCenter={[-98, 40]}
              initialZoom={2}
              height="100%"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
