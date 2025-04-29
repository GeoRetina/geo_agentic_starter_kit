import * as turf from "@turf/turf";
import type { Feature, Point, Polygon, MultiPolygon } from "geojson";

/**
 * Calculates the area of a polygon feature.
 * @param polygon - The polygon feature.
 * @returns The area in square meters.
 */
export function calculatePolygonArea(polygon: Feature<Polygon>): number {
  return turf.area(polygon);
}

/**
 * Calculates the distance between two point features.
 * @param point1 - The first point feature.
 * @param point2 - The second point feature.
 * @param units - The units for the distance calculation (e.g., 'kilometers', 'miles'). Defaults to 'kilometers'.
 * @returns The distance between the two points.
 */
export function calculateDistance(
  point1: Feature<Point>,
  point2: Feature<Point>,
  units: turf.Units = "kilometers"
): number {
  return turf.distance(point1, point2, { units });
}

/**
 * Creates a buffer around a point feature.
 * @param point - The point feature.
 * @param radius - The buffer radius.
 * @param units - The units for the radius (e.g., 'kilometers', 'meters'). Defaults to 'meters'.
 * @returns A polygon or multipolygon feature representing the buffer, or undefined if buffering fails.
 */
export function createPointBuffer(
  point: Feature<Point>,
  radius: number,
  units: turf.Units = "meters"
): Feature<Polygon | MultiPolygon> | undefined {
  const buffered = turf.buffer(point, radius, { units });
  // Note: turf.buffer might return undefined in some edge cases,
  // even if not always explicitly reflected in older type definitions.
  return buffered;
}

/**
 * Calculates the centroid of a GeoJSON feature.
 * Handles various geometry types (Polygon, MultiPolygon, LineString, etc.).
 * @param feature - The input GeoJSON feature.
 * @returns A Point feature representing the centroid.
 */
export function calculateCentroid(feature: Feature<any>): Feature<Point> {
  return turf.centroid(feature);
}
