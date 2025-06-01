import { z } from "zod";

// Preprocessor to handle stringified JSON
const parseJsonString = (val: unknown) => {
  if (typeof val === "string") {
    try {
      return JSON.parse(val);
    } catch (e) {
      // If parsing fails, Zod will catch the type mismatch later
      return val;
    }
  }
  return val;
};

// Base GeoJSON Schemas
export const propertiesSchema = z
  .record(z.string(), z.any())
  .nullable()
  .optional();

export const positionSchema = z
  .array(z.number())
  .min(2)
  .max(3)
  .describe("A single position: [longitude, latitude, optional altitude]");

// Geometry Schemas
export const pointGeometrySchema = z.object({
  type: z.literal("Point"),
  coordinates: positionSchema,
});

const linearRingSchema = z
  .array(positionSchema)
  .min(4)
  .describe(
    "A linear ring (array of positions). First and last position must be the same."
  );

export const polygonCoordinatesSchema = z
  .array(linearRingSchema)
  .describe(
    "Array of linear rings. First is exterior, others are interior holes."
  );

export const polygonGeometrySchema = z.object({
  type: z.literal("Polygon"),
  coordinates: polygonCoordinatesSchema,
});

export const lineStringCoordinatesSchema = z.array(positionSchema).min(2);

export const lineStringGeometrySchema = z.object({
  type: z.literal("LineString"),
  coordinates: lineStringCoordinatesSchema,
});

// Generic Geometry Schema - useful for features that can accept various geometry types
export const genericGeometrySchema = z.union([
  pointGeometrySchema,
  polygonGeometrySchema,
  lineStringGeometrySchema,
  // Fallback for other potential GeoJSON geometry types, keeping it flexible.
  z
    .object({ type: z.string(), coordinates: z.any() })
    .describe("A generic GeoJSON Geometry object."),
]);

// Helper to create a preprocessed Feature schema
const createFeatureSchema = <T extends z.ZodTypeAny>(
  geometrySchema: T,
  description: string
) => {
  return z
    .preprocess(
      parseJsonString,
      z.object({
        type: z.literal("Feature"),
        geometry: geometrySchema,
        properties: propertiesSchema,
      })
    )
    .describe(description);
};

// Specific Feature Schemas
export const pointFeatureSchema = createFeatureSchema(
  pointGeometrySchema,
  "A GeoJSON Point Feature. Accepts a valid GeoJSON Point object or a stringified JSON representation of it."
);

export const polygonFeatureSchema = createFeatureSchema(
  polygonGeometrySchema,
  "A GeoJSON Polygon Feature. Accepts a valid GeoJSON Polygon object or a stringified JSON representation of it."
);

export const lineStringFeatureSchema = createFeatureSchema(
  lineStringGeometrySchema,
  "A GeoJSON LineString Feature. Accepts a valid GeoJSON LineString object or a stringified JSON representation of it."
);

// Generic Feature Schema for tools that can operate on any feature type
export const featureSchema = createFeatureSchema(
  genericGeometrySchema,
  "A GeoJSON Feature (e.g., Point, Polygon, LineString). Accepts a valid GeoJSON Feature object or a stringified JSON representation of it."
);

export const METRIC_UNITS_GEOJSON_ENUM = ["kilometers", "meters"] as const;
