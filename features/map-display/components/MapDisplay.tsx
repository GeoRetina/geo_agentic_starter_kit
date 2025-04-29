"use client";

import { useRef } from "react";
import "maplibre-gl/dist/maplibre-gl.css";
import "@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css";
import { GeospatialToolbar } from "@/features/geospatial-tools/components/GeospatialToolbar";
import { AnalysisResult } from "@/features/geospatial-tools/components/AnalysisResult";
import { useMapInitialization } from "../hooks/useMapInitialization";
import { useMapDraw } from "../hooks/useMapDraw";
import { useGeospatialAnalysis } from "../hooks/useGeospatialAnalysis";
// import { AddressSearch } from "@/features/geocoding/components/AddressSearch"; // No longer needed here
import type { LngLatBoundsLike } from "maplibre-gl";

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

  // --- Custom Hooks ---
  const { mapRef, isMapLoaded } = useMapInitialization({
    mapContainerRef,
    initialCenter,
    initialZoom,
  });

  // Initialize analysis hook (handles state and analysis logic)
  const {
    analysisResult,
    clearAnalysis,
    handleBufferClick,
    handleDistanceClick,
    handleAreaClick,
    handleCentroidClick,
  } = useGeospatialAnalysis({ mapRef, selectedFeature: null, isMapLoaded });

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

  return (
    <div className="relative" style={{ width, height }}>
      {/* Map container div */}
      <div
        ref={mapContainerRef}
        style={{ width: "100%", height: "100%" }}
        className="rounded-lg shadow-md"
      />

      {/* Toolbar Component */}
      <GeospatialToolbar
        selectedGeometryType={selectedGeometryType}
        onBufferClick={currentHandleBufferClick}
        onDistanceClick={currentHandleDistanceClick}
        onAreaClick={currentHandleAreaClick}
        onCentroidClick={currentHandleCentroidClick}
        onSearchResult={handleGeocodingResult}
      />

      {/* Analysis Result Popup */}
      <AnalysisResult
        isVisible={currentAnalysisResult.isVisible}
        title={currentAnalysisResult.title}
        value={currentAnalysisResult.value}
        unit={currentAnalysisResult.unit}
        onClose={currentClearAnalysis}
      />
    </div>
  );
}
