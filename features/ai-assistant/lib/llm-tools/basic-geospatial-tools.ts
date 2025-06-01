import { tool } from "ai";
import { z } from "zod";
import {
  calculatePolygonArea,
  calculateDistance,
  createPointBuffer,
  calculateCentroid,
} from "@/features/geospatial-analysis/lib/turf-utils";
import type { Feature, Point, Polygon } from "geojson";
import {
  pointFeatureSchema,
  polygonFeatureSchema,
  featureSchema,
  METRIC_UNITS_GEOJSON_ENUM,
} from "./schemas/geojson-schemas";

export const calculatePolygonAreaTool = tool({
  description:
    "Calculates the area of a GeoJSON Polygon feature in square meters.",
  parameters: z.object({
    polygon: polygonFeatureSchema,
  }),
  execute: async ({ polygon }) => {
    try {
      const area = calculatePolygonArea(polygon as Feature<Polygon>);
      return { area };
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : "Calculation failed",
      };
    }
  },
});

export const calculateDistanceTool = tool({
  description: "Calculates the distance between two GeoJSON Point features.",
  parameters: z.object({
    point1: pointFeatureSchema,
    point2: pointFeatureSchema,
    units: z
      .enum(METRIC_UNITS_GEOJSON_ENUM)
      .optional()
      .default("kilometers")
      .describe(
        "Units for distance calculation (kilometers or meters). Defaults to 'kilometers'."
      ),
  }),
  execute: async ({ point1, point2, units }) => {
    try {
      const distance = calculateDistance(
        point1 as Feature<Point>,
        point2 as Feature<Point>,
        units
      );
      return { distance, unit: units };
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : "Calculation failed",
      };
    }
  },
});

export const createPointBufferTool = tool({
  description: "Creates a buffer around a GeoJSON Point feature.",
  parameters: z.object({
    point: pointFeatureSchema,
    radius: z
      .number()
      .positive()
      .describe("The buffer radius (a positive number)."),
    units: z
      .enum(METRIC_UNITS_GEOJSON_ENUM)
      .optional()
      .default("meters")
      .describe(
        "Units for the radius (kilometers or meters). Defaults to 'meters'."
      ),
  }),
  execute: async ({ point, radius, units }) => {
    try {
      const bufferFeature = createPointBuffer(
        point as Feature<Point>,
        radius,
        units
      );
      if (!bufferFeature) {
        return { error: "Buffer creation resulted in undefined feature." };
      }
      return { bufferFeature };
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : "Calculation failed",
      };
    }
  },
});

export const calculateCentroidTool = tool({
  description:
    "Calculates the centroid of a GeoJSON feature (e.g., Polygon, LineString).",
  parameters: z.object({
    feature: featureSchema,
  }),
  execute: async ({ feature }) => {
    try {
      const centroid = calculateCentroid(feature as Feature<any>);
      return { centroid };
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : "Calculation failed",
      };
    }
  },
});

export const geospatialTools = {
  calculatePolygonArea: calculatePolygonAreaTool,
  calculateDistance: calculateDistanceTool,
  createPointBuffer: createPointBufferTool,
  calculateCentroid: calculateCentroidTool,
};
