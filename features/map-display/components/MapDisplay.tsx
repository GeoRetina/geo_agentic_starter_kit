"use client";

import { useEffect, useRef, useState } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import MapboxDraw from "@mapbox/mapbox-gl-draw";
import "@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css";

interface MapDisplayProps {
  initialCenter?: [number, number];
  initialZoom?: number;
  height?: string;
  width?: string;
}

export function MapDisplay({
  initialCenter = [0, 0],
  initialZoom = 2,
  height = "600px",
  width = "100%",
}: MapDisplayProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  useEffect(() => {
    if (map.current || !mapContainer.current) return;

    map.current = new maplibregl.Map({
      container: mapContainer.current,
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

    map.current.addControl(new maplibregl.NavigationControl(), "top-right");
    map.current.addControl(new maplibregl.ScaleControl(), "bottom-left");

    // Configure MapboxDraw class constants to work with maplibre
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

    // Custom styles for draw tools that avoid dasharray issues
    const drawStyles = [
      // ACTIVE (being drawn)
      // line stroke
      {
        id: "gl-draw-line",
        type: "line",
        filter: [
          "all",
          ["==", "$type", "LineString"],
          ["!=", "mode", "static"],
        ],
        layout: {
          "line-cap": "round",
          "line-join": "round",
        },
        paint: {
          "line-color": "#3bb2d0",
          "line-width": 2,
        },
      },
      // polygon fill
      {
        id: "gl-draw-polygon-fill",
        type: "fill",
        filter: ["all", ["==", "$type", "Polygon"], ["!=", "mode", "static"]],
        paint: {
          "fill-color": "#3bb2d0",
          "fill-outline-color": "#3bb2d0",
          "fill-opacity": 0.1,
        },
      },
      // polygon mid points
      {
        id: "gl-draw-polygon-midpoint",
        type: "circle",
        filter: ["all", ["==", "$type", "Point"], ["==", "meta", "midpoint"]],
        paint: {
          "circle-radius": 3,
          "circle-color": "#fbb03b",
        },
      },
      // polygon outline
      {
        id: "gl-draw-polygon-stroke",
        type: "line",
        filter: ["all", ["==", "$type", "Polygon"], ["!=", "mode", "static"]],
        layout: {
          "line-cap": "round",
          "line-join": "round",
        },
        paint: {
          "line-color": "#3bb2d0",
          "line-width": 2,
        },
      },
      // vertex point halos
      {
        id: "gl-draw-point-point-stroke",
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
        id: "gl-draw-point",
        type: "circle",
        filter: [
          "all",
          ["==", "meta", "vertex"],
          ["==", "$type", "Point"],
          ["!=", "mode", "static"],
        ],
        paint: {
          "circle-radius": 3,
          "circle-color": "#fbb03b",
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
        filter: [
          "all",
          ["==", "mode", "static"],
          ["==", "$type", "LineString"],
        ],
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

    // Initialize the draw tools with custom styles
    const draw = new MapboxDraw({
      displayControlsDefault: false,
      styles: drawStyles,
      controls: {
        point: true,
        line_string: true,
        polygon: true,
        trash: true,
      },
    });

    // Add draw tools to the map
    // @ts-ignore - Ignoring type compatibility issues between mapbox-gl-draw and maplibre-gl
    map.current.addControl(draw, "top-right");

    map.current.on("load", () => {
      setMapLoaded(true);
    });

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [initialCenter, initialZoom]);

  return (
    <div
      ref={mapContainer}
      style={{ width, height }}
      className="rounded-lg shadow-md"
    />
  );
}
