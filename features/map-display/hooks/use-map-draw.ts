"use client";

import {
  useEffect,
  useRef,
  useState,
  MutableRefObject,
  useCallback,
} from "react";
import MapboxDraw from "@mapbox/mapbox-gl-draw";
import maplibregl, { IControl } from "maplibre-gl";
import type { Feature, Geometry, FeatureCollection } from "geojson";

const EMPTY_FEATURE_COLLECTION: FeatureCollection = {
  type: "FeatureCollection",
  features: [],
};

// Define the custom styles for MapboxDraw
const drawStyles = [
  // ACTIVE (being drawn)
  // line stroke
  {
    id: "gl-draw-line",
    type: "line",
    filter: ["all", ["==", "$type", "LineString"], ["==", "active", "true"]],
    layout: {
      "line-cap": "round",
      "line-join": "round",
    },
    paint: {
      "line-color": "#3b82f6",
      "line-width": 2,
    },
  },
  // polygon fill
  {
    id: "gl-draw-polygon-fill",
    type: "fill",
    filter: ["all", ["==", "$type", "Polygon"], ["==", "active", "true"]],
    paint: {
      "fill-color": "#3b82f6",
      "fill-outline-color": "#3b82f6",
      "fill-opacity": 0.1,
    },
  },
  // polygon outline
  {
    id: "gl-draw-polygon-stroke",
    type: "line",
    filter: ["all", ["==", "$type", "Polygon"], ["==", "active", "true"]],
    layout: {
      "line-cap": "round",
      "line-join": "round",
    },
    paint: {
      "line-color": "#3b82f6",
      "line-width": 2,
    },
  },
  // vertex point halos
  {
    id: "gl-draw-polygon-and-line-vertex-halo",
    type: "circle",
    filter: [
      "all",
      ["==", "meta", "vertex"],
      ["==", "$type", "Point"],
      ["!=", "mode", "static"],
    ],
    paint: {
      "circle-radius": 5,
      "circle-color": "#fff",
    },
  },
  // vertex points
  {
    id: "gl-draw-polygon-and-line-vertex",
    type: "circle",
    filter: [
      "all",
      ["==", "meta", "vertex"],
      ["==", "$type", "Point"],
      ["!=", "mode", "static"],
    ],
    paint: {
      "circle-radius": 3,
      "circle-color": "#3b82f6",
    },
  },
  // point stroke
  {
    id: "gl-draw-point-stroke-active",
    type: "circle",
    filter: [
      "all",
      ["==", "$type", "Point"],
      ["==", "active", "true"],
      ["!=", "meta", "midpoint"],
    ],
    paint: {
      "circle-radius": 7,
      "circle-color": "#fff",
    },
  },
  // point fill
  {
    id: "gl-draw-point-active",
    type: "circle",
    filter: [
      "all",
      ["==", "$type", "Point"],
      ["!=", "meta", "midpoint"],
      ["==", "active", "true"],
    ],
    paint: {
      "circle-radius": 5,
      "circle-color": "#3b82f6",
    },
  },

  // INACTIVE (static)
  {
    id: "gl-draw-polygon-fill-static",
    type: "fill",
    filter: ["all", ["==", "mode", "static"], ["==", "$type", "Polygon"]],
    paint: {
      "fill-color": "#404040",
      "fill-outline-color": "#404040",
      "fill-opacity": 0.1,
    },
  },
  {
    id: "gl-draw-polygon-stroke-static",
    type: "line",
    filter: ["all", ["==", "mode", "static"], ["==", "$type", "Polygon"]],
    layout: {
      "line-cap": "round",
      "line-join": "round",
    },
    paint: {
      "line-color": "#404040",
      "line-width": 2,
    },
  },
  {
    id: "gl-draw-line-static",
    type: "line",
    filter: ["all", ["==", "mode", "static"], ["==", "$type", "LineString"]],
    layout: {
      "line-cap": "round",
      "line-join": "round",
    },
    paint: {
      "line-color": "#404040",
      "line-width": 2,
    },
  },
  {
    id: "gl-draw-point-static",
    type: "circle",
    filter: ["all", ["==", "mode", "static"], ["==", "$type", "Point"]],
    paint: {
      "circle-radius": 5,
      "circle-color": "#404040",
    },
  },
];

interface UseMapDrawProps {
  mapRef: MutableRefObject<maplibregl.Map | null>;
  isMapLoaded: boolean;
  onAnalysisClearNeeded: () => void;
}

export function useMapDraw({
  mapRef,
  isMapLoaded,
  onAnalysisClearNeeded,
}: UseMapDrawProps) {
  const drawRef = useRef<MapboxDraw | null>(null);
  const [selectedGeometryType, setSelectedGeometryType] = useState<
    string | null
  >(null);
  const [selectedFeature, setSelectedFeature] =
    useState<Feature<Geometry> | null>(null);

  // Clears the analysis layer on the map
  const clearAnalysisLayer = useCallback(() => {
    if (mapRef.current?.getSource("analysis-layer-source")) {
      (
        mapRef.current.getSource(
          "analysis-layer-source"
        ) as maplibregl.GeoJSONSource
      ).setData(EMPTY_FEATURE_COLLECTION);
    }
  }, [mapRef]);

  // Handles draw events: clears analysis and updates selection state
  const handleDrawEvent = useCallback(() => {
    onAnalysisClearNeeded();
    clearAnalysisLayer();

    if (!drawRef.current) return;

    const selected = drawRef.current.getSelected().features;
    if (selected.length > 0) {
      const feature = selected[0];
      setSelectedFeature(feature);
      setSelectedGeometryType(feature.geometry.type);
    } else {
      setSelectedFeature(null);
      setSelectedGeometryType(null);
    }
  }, [onAnalysisClearNeeded, clearAnalysisLayer]);

  useEffect(() => {
    if (!isMapLoaded || !mapRef.current || drawRef.current) return;

    // Configure MapboxDraw constants to align with MapLibre classes
    // @ts-ignore
    MapboxDraw.constants.classes.CANVAS = "maplibregl-canvas";
    // @ts-ignore
    MapboxDraw.constants.classes.CONTROL_BASE = "maplibregl-ctrl";
    // @ts-ignore
    MapboxDraw.constants.classes.CONTROL_PREFIX = "maplibregl-ctrl-";
    // @ts-ignore
    MapboxDraw.constants.classes.CONTROL_GROUP = "maplibregl-ctrl-group";
    // @ts-ignore
    MapboxDraw.constants.classes.ATTRIBUTION = "maplibregl-ctrl-attrib";

    const drawInstance = new MapboxDraw({
      displayControlsDefault: false,
      styles: drawStyles,
      controls: { point: true, line_string: true, polygon: true, trash: true },
    });

    drawRef.current = drawInstance;
    // Force cast via unknown for MapLibre compatibility
    mapRef.current.addControl(drawInstance as unknown as IControl, "top-right");

    // Attach draw event listeners
    const map = mapRef.current;
    map.on("draw.selectionchange", handleDrawEvent);
    map.on("draw.create", handleDrawEvent);
    map.on("draw.delete", handleDrawEvent);
    map.on("draw.update", handleDrawEvent);
    map.on("draw.modechange", handleDrawEvent);

    // Cleanup listeners and control
    return () => {
      if (map) {
        map.off("draw.selectionchange", handleDrawEvent);
        map.off("draw.create", handleDrawEvent);
        map.off("draw.delete", handleDrawEvent);
        map.off("draw.update", handleDrawEvent);
        map.off("draw.modechange", handleDrawEvent);
        try {
          if (drawRef.current) {
            // Force cast via unknown for MapLibre compatibility
            map.removeControl(drawRef.current as unknown as IControl);
          }
        } catch (e) {
          console.warn("Error removing draw control:", e);
        }
      }
      drawRef.current = null;
    };
  }, [mapRef, isMapLoaded, handleDrawEvent]);

  return { drawRef, selectedFeature, selectedGeometryType };
}
