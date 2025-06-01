import { tool } from "ai";
import { z } from "zod";
import {
  geocodeAddress as nominatimGeocodeAddress,
  reverseGeocodeCoordinates as nominatimReverseGeocodeCoordinates,
  reverseGeocodeToStructuredAddress,
} from "@/features/geocoding/lib/nominatim-service";
import { positionSchema } from "@/features/ai-assistant/lib/llm-tools/schemas/geojson-schemas";

export const geocodeAddressTool = tool({
  description:
    "Converts a human-readable street address into geographic coordinates (latitude and longitude) and returns it as a GeoJSON Point Feature.",
  parameters: z.object({
    address: z
      .string()
      .describe(
        'The street address to geocode (e.g., "1600 Amphitheatre Parkway, Mountain View, CA").'
      ),
    country: z
      .string()
      .optional()
      .describe(
        "Optional country or country code to help narrow down the search (e.g., 'USA', 'GB')."
      ),
  }),
  execute: async ({ address, country }) => {
    try {
      await new Promise((resolve) => setTimeout(resolve, 2000)); // 2-second delay
      const fullAddress = country ? `${address}, ${country}` : address;
      const pointFeature = await nominatimGeocodeAddress(fullAddress);
      if (pointFeature) {
        return { result: pointFeature };
      }
      return { error: "Address not found or geocoding failed." };
    } catch (error) {
      console.error("geocodeAddressTool error:", error);
      return {
        error: error instanceof Error ? error.message : "Geocoding failed",
      };
    }
  },
});

export const reverseGeocodeCoordinatesTool = tool({
  description:
    "Converts geographic coordinates (latitude and longitude) into a human-readable street address (display name).",
  parameters: z.object({
    coordinates: positionSchema.describe(
      "The geographic coordinates as [longitude, latitude]."
    ),
  }),
  execute: async ({ coordinates }) => {
    try {
      await new Promise((resolve) => setTimeout(resolve, 2000)); // 2-second delay
      const [longitude, latitude] = coordinates;
      if (typeof latitude !== "number" || typeof longitude !== "number") {
        return { error: "Invalid coordinates provided." };
      }
      const addressString = await nominatimReverseGeocodeCoordinates(
        latitude,
        longitude
      );
      if (addressString) {
        return { address: addressString };
      }
      return { error: "Could not find address for the given coordinates." };
    } catch (error) {
      console.error("reverseGeocodeCoordinatesTool error:", error);
      return {
        error:
          error instanceof Error ? error.message : "Reverse geocoding failed",
      };
    }
  },
});

export const reverseGeocodeToStructuredAddressTool = tool({
  description:
    "Converts geographic coordinates (latitude and longitude) into a structured address object.",
  parameters: z.object({
    coordinates: positionSchema.describe(
      "The geographic coordinates as [longitude, latitude]."
    ),
  }),
  execute: async ({ coordinates }) => {
    try {
      await new Promise((resolve) => setTimeout(resolve, 2000)); // 2-second delay
      const [longitude, latitude] = coordinates;
      if (typeof latitude !== "number" || typeof longitude !== "number") {
        return { error: "Invalid coordinates provided." };
      }
      const structuredAddress = await reverseGeocodeToStructuredAddress(
        latitude,
        longitude
      );
      if (structuredAddress) {
        return { address: structuredAddress };
      }
      return {
        error: "Could not find structured address for the given coordinates.",
      };
    } catch (error) {
      console.error("reverseGeocodeToStructuredAddressTool error:", error);
      return {
        error:
          error instanceof Error ? error.message : "Reverse geocoding failed",
      };
    }
  },
});

export const geocodingTools = {
  geocodeAddress: geocodeAddressTool,
  reverseGeocodeCoordinates: reverseGeocodeCoordinatesTool,
  reverseGeocodeToStructuredAddress: reverseGeocodeToStructuredAddressTool,
};
