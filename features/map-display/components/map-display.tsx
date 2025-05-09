"use client";

import { useRef, useState, useEffect } from "react";
import "maplibre-gl/dist/maplibre-gl.css";
import "@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css";
import { MapMenuDock } from "@/features/map-menu-dock/components/map-menu-dock";
import { AnalysisResult } from "@/features/map-display/components/analysis-result";
import { useMapInitialization } from "../hooks/use-map-initialization";
import { useMapDraw } from "../hooks/use-map-draw";
import { useGeospatialAnalysis } from "../hooks/use-geospatial-analysis";
import type { LngLatBoundsLike } from "maplibre-gl";
import { Loader2 } from "lucide-react";

interface MapDisplayProps {
  initialCenter?: [number, number];
  initialZoom?: number;
  height?: string;
  width?: string;
}

export function MapDisplay({
  initialCenter = [0, 0],
  initialZoom = 3,
  height = "100%",
  width = "100%",
}: MapDisplayProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [isInitializing, setIsInitializing] = useState(true);

  // --- Custom Hooks ---
  const { mapRef, isMapLoaded } = useMapInitialization({
    mapContainerRef,
    initialCenter,
    initialZoom,
  });

  // Initialize analysis hook (handles state and analysis logic)
  const { clearAnalysis } = useGeospatialAnalysis({
    mapRef,
    selectedFeature: null,
    isMapLoaded,
  });

  // Initialize draw hook (handles drawing and selection state)
  const { selectedFeature, selectedGeometryType } = useMapDraw({
    mapRef,
    isMapLoaded,
    onAnalysisClearNeeded: clearAnalysis, // Link draw events to clearing analysis
  });

  // Re-run analysis hook when selectedFeature changes to update handlers
  const {
    analysisResult: currentAnalysisResult,
    handleBufferClick: currentHandleBufferClick,
    handleDistanceClick: currentHandleDistanceClick,
    handleAreaClick: currentHandleAreaClick,
    handleCentroidClick: currentHandleCentroidClick,
    clearAnalysis: currentClearAnalysis,
  } = useGeospatialAnalysis({ mapRef, selectedFeature, isMapLoaded });

  // Callback for geocoding results
  const handleGeocodingResult = (bounds: LngLatBoundsLike) => {
    if (mapRef.current) {
      mapRef.current.fitBounds(bounds, {
        padding: 100,
        maxZoom: 18,
      });
    }
  };

  // Hide loading indicator after map is loaded
  useEffect(() => {
    if (isMapLoaded) {
      const timer = setTimeout(() => {
        setIsInitializing(false);
      }, 500); // Add a slight delay to ensure smooth transition
      return () => clearTimeout(timer);
    }
  }, [isMapLoaded]);

  return (
    <div className="relative overflow-hidden" style={{ width, height }}>
      {/* Map container with rounded corners and shadow */}
      <div className="absolute inset-0 bg-gray-100 dark:bg-gray-900">
        <div
          ref={mapContainerRef}
          style={{ width: "100%", height: "100%" }}
          className="rounded-lg shadow-md overflow-hidden relative"
        />
      </div>

      {/* Loading indicator */}
      {isInitializing && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm z-30 rounded-lg">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="h-10 w-10 text-primary animate-spin" />
            <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
              Initializing Map
            </p>
          </div>
        </div>
      )}

      {/* Sidebar for analysis results */}
      <AnalysisResult
        isVisible={currentAnalysisResult.isVisible}
        title={currentAnalysisResult.title}
        value={currentAnalysisResult.value}
        unit={currentAnalysisResult.unit}
        onClose={currentClearAnalysis}
      />

      {/* Toolbar*/}
      <MapMenuDock
        selectedGeometryType={selectedGeometryType}
        onBufferClick={currentHandleBufferClick}
        onDistanceClick={currentHandleDistanceClick}
        onAreaClick={currentHandleAreaClick}
        onCentroidClick={currentHandleCentroidClick}
        onSearchResult={handleGeocodingResult}
      />
    </div>
  );
}
