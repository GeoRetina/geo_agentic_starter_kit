import { tool } from "ai";
import { z } from "zod";
import {
  calculatePolygonArea,
  calculateDistance,
  createPointBuffer,
  calculateCentroid,
} from "@/features/geospatial-analysis/lib/turf-utils";
import type { Feature, Point, Polygon } from "geojson";
import { METRIC_UNITS_GEOJSON_ENUM } from "@/features/ai-assistant/lib/constants";

// Preprocessor to handle stringified JSON
const parseJsonString = (val: unknown) => {
  if (typeof val === "string") {
    try {
      return JSON.parse(val);
    } catch (e) {
      return val; // If parsing fails, Zod will catch the type mismatch
    }
  }
  return val;
};

// Base GeoJSON Schemas
const propertiesSchema = z.record(z.string(), z.any()).nullable().optional();

const positionSchema = z
  .array(z.number())
  .min(2)
  .max(3)
  .describe("A single position: [longitude, latitude, optional altitude]");

const pointGeometrySchema = z.object({
  type: z.literal("Point"),
  coordinates: positionSchema,
});

const pointFeatureObjectSchema = z.object({
  type: z.literal("Feature"),
  geometry: pointGeometrySchema,
  properties: propertiesSchema,
});

export const pointFeatureSchema = z
  .preprocess(parseJsonString, pointFeatureObjectSchema)
  .describe("A GeoJSON Point Feature object. Can be a stringified JSON.");

const linearRingSchema = z
  .array(positionSchema)
  .min(4)
  .describe(
    "A linear ring (array of positions). First and last position must be the same."
  );

const polygonCoordinatesSchema = z
  .array(linearRingSchema)
  .describe(
    "Array of linear rings. First is exterior, others are interior holes."
  );

const polygonGeometrySchema = z.object({
  type: z.literal("Polygon"),
  coordinates: polygonCoordinatesSchema,
});

const polygonFeatureObjectSchema = z.object({
  type: z.literal("Feature"),
  geometry: polygonGeometrySchema,
  properties: propertiesSchema,
});

export const polygonFeatureSchema = z
  .preprocess(parseJsonString, polygonFeatureObjectSchema)
  .describe("A GeoJSON Polygon Feature object. Can be a stringified JSON.");

const lineStringCoordinatesSchema = z.array(positionSchema).min(2);
const lineStringGeometrySchema = z.object({
  type: z.literal("LineString"),
  coordinates: lineStringCoordinatesSchema,
});

const genericGeometrySchema = z.union([
  pointGeometrySchema,
  polygonGeometrySchema,
  lineStringGeometrySchema,

  z.object({ type: z.string(), coordinates: z.any() }),
]);

const genericFeatureObjectSchema = z.object({
  type: z.literal("Feature"),
  geometry: genericGeometrySchema,
  properties: propertiesSchema,
});

export const featureSchema = z
  .preprocess(parseJsonString, genericFeatureObjectSchema)
  .describe(
    "A GeoJSON Feature (e.g., Point, Polygon, LineString). Can be a stringified JSON."
  );

// Tools definition using the refined schemas
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
