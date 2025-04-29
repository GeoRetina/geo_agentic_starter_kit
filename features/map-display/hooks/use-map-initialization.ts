"use client";

import { useEffect, useRef, useState, RefObject } from "react";
import maplibregl, { Map } from "maplibre-gl";
import type { FeatureCollection } from "geojson";

const EMPTY_FEATURE_COLLECTION: FeatureCollection = {
  type: "FeatureCollection",
  features: [],
};

interface UseMapInitializationProps {
  mapContainerRef: RefObject<HTMLDivElement | null>;
  initialCenter: [number, number];
  initialZoom: number;
}

export function useMapInitialization({
  mapContainerRef,
  initialCenter,
  initialZoom,
}: UseMapInitializationProps) {
  const mapRef = useRef<Map | null>(null);
  const [isMapLoaded, setIsMapLoaded] = useState(false);

  useEffect(() => {
    if (mapRef.current || !mapContainerRef.current) return; // Initialize map only once

    const mapInstance = new maplibregl.Map({
      container: mapContainerRef.current,
      style: {
        version: 8,
        sources: {
          "osm-tiles": {
            type: "raster",
            tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
            tileSize: 256,
            attribution: "© OpenStreetMap contributors",
          },
        },
        layers: [
          {
            id: "osm-layer",
            type: "raster",
            source: "osm-tiles",
            minzoom: 0,
            maxzoom: 19,
          },
        ],
      },
      center: [initialCenter[0], initialCenter[1]],
      zoom: initialZoom,
    });

    mapInstance.addControl(new maplibregl.NavigationControl(), "top-right");
    mapInstance.addControl(new maplibregl.ScaleControl(), "bottom-left");

    mapInstance.on("load", () => {
      // Add source and layers for analysis results ONCE on load
      if (!mapInstance.getSource("analysis-layer-source")) {
        mapInstance.addSource("analysis-layer-source", {
          type: "geojson",
          data: EMPTY_FEATURE_COLLECTION,
        });

        mapInstance.addLayer({
          id: "analysis-polygon-fill",
          type: "fill",
          source: "analysis-layer-source",
          filter: ["==", "$type", "Polygon"],
          paint: {
            "fill-color": "#f08", // Magenta for visibility
            "fill-opacity": 0.4,
          },
        });
        mapInstance.addLayer({
          id: "analysis-polygon-outline",
          type: "line",
          source: "analysis-layer-source",
          filter: ["==", "$type", "Polygon"],
          paint: {
            "line-color": "#f08",
            "line-width": 2,
          },
        });
        mapInstance.addLayer({
          id: "analysis-point",
          type: "circle",
          source: "analysis-layer-source",
          filter: ["==", "$type", "Point"],
          paint: {
            "circle-radius": 6,
            "circle-color": "#f08",
            "circle-stroke-width": 2,
            "circle-stroke-color": "#ffffff",
          },
        });
      }
      setIsMapLoaded(true);
    });

    mapRef.current = mapInstance;

    // Cleanup function
    return () => {
      mapRef.current?.remove();
      mapRef.current = null;
      setIsMapLoaded(false);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mapContainerRef, initialCenter[0], initialCenter[1], initialZoom]); // Dependencies ensure re-init if center/zoom props change

  return { mapRef, isMapLoaded };
}
