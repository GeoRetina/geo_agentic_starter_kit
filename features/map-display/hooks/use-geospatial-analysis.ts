"use client";

import { useState, useCallback, RefObject } from "react";
import maplibregl from "maplibre-gl";
import * as turf from "@turf/turf";
import {
  calculatePolygonArea,
  createPointBuffer,
  calculateCentroid,
} from "@/features/geospatial-analysis/lib/turf-utils";
import type {
  Feature,
  Point,
  Polygon,
  LineString,
  FeatureCollection,
  Geometry,
} from "geojson";

const EMPTY_FEATURE_COLLECTION: FeatureCollection = {
  type: "FeatureCollection",
  features: [],
};

interface AnalysisResultState {
  isVisible: boolean;
  title: string;
  value: string | number | null;
  unit: string;
}

interface UseGeospatialAnalysisProps {
  mapRef: RefObject<maplibregl.Map | null>;
  selectedFeature: Feature<Geometry> | null;
  isMapLoaded: boolean;
}

export function useGeospatialAnalysis({
  mapRef,
  selectedFeature,
  isMapLoaded,
}: UseGeospatialAnalysisProps) {
  const [analysisResult, setAnalysisResult] = useState<AnalysisResultState>({
    isVisible: false,
    title: "",
    value: null,
    unit: "",
  });

  // Updates the dedicated analysis layer on the map
  const updateAnalysisLayer = useCallback(
    (geojson: FeatureCollection) => {
      if (
        mapRef.current &&
        isMapLoaded &&
        mapRef.current.getSource("analysis-layer-source")
      ) {
        (
          mapRef.current.getSource(
            "analysis-layer-source"
          ) as maplibregl.GeoJSONSource
        ).setData(geojson);
      } else if (isMapLoaded) {
        console.warn("Analysis layer source not found, skipping update.");
      }
    },
    [mapRef, isMapLoaded]
  );

  // Clears the analysis result popup and the map layer
  const clearAnalysis = useCallback(() => {
    setAnalysisResult({ isVisible: false, title: "", value: null, unit: "" });
    updateAnalysisLayer(EMPTY_FEATURE_COLLECTION);
  }, [updateAnalysisLayer]);

  // --- Analysis Handlers ---

  const handleBufferClick = useCallback(
    (radius: number) => {
      if (!selectedFeature || selectedFeature.geometry.type !== "Point") return;
      clearAnalysis();

      const point = selectedFeature as Feature<Point>;
      const buffered = createPointBuffer(point, radius, "kilometers");

      if (buffered) {
        const newData: FeatureCollection = {
          type: "FeatureCollection",
          features: [buffered],
        };
        updateAnalysisLayer(newData);
        setAnalysisResult({
          isVisible: true,
          title: "Buffer Created",
          value: radius.toString(),
          unit: "km radius",
        });
      } else {
        console.error("Failed to create buffer");
      }
    },
    [selectedFeature, clearAnalysis, updateAnalysisLayer]
  );

  const handleDistanceClick = useCallback(() => {
    if (!selectedFeature || selectedFeature.geometry.type !== "LineString")
      return;
    clearAnalysis();

    const line = selectedFeature as Feature<LineString>;
    const distance = turf.length(line, { units: "kilometers" });

    setAnalysisResult({
      isVisible: true,
      title: "Line Distance",
      value: distance.toFixed(2),
      unit: "km",
    });
    // No visual layer for distance
  }, [selectedFeature, clearAnalysis]);

  const handleAreaClick = useCallback(() => {
    if (!selectedFeature || selectedFeature.geometry.type !== "Polygon") return;
    clearAnalysis();

    const polygon = selectedFeature as Feature<Polygon>;
    const area = calculatePolygonArea(polygon);
    const areaInSqKm = area / 1000000;

    setAnalysisResult({
      isVisible: true,
      title: "Polygon Area",
      value: areaInSqKm.toFixed(2),
      unit: "km²",
    });
    // No visual layer for area
  }, [selectedFeature, clearAnalysis]);

  const handleCentroidClick = useCallback(() => {
    if (
      !selectedFeature ||
      (selectedFeature.geometry.type !== "Polygon" &&
        selectedFeature.geometry.type !== "LineString")
    )
      return;
    clearAnalysis();

    const feature = selectedFeature;
    const centroid = calculateCentroid(feature);

    if (centroid) {
      const newData: FeatureCollection = {
        type: "FeatureCollection",
        features: [centroid],
      };
      updateAnalysisLayer(newData);
      setAnalysisResult({
        isVisible: true,
        title: "Centroid Calculated",
        value: `[${centroid.geometry.coordinates[0].toFixed(
          4
        )}, ${centroid.geometry.coordinates[1].toFixed(4)}]`,
        unit: "",
      });
    } else {
      console.error("Failed to calculate centroid");
    }
  }, [selectedFeature, clearAnalysis, updateAnalysisLayer]);

  return {
    analysisResult,
    clearAnalysis,
    handleBufferClick,
    handleDistanceClick,
    handleAreaClick,
    handleCentroidClick,
  };
}
