import type { Feature, Point } from "geojson";

// Interface for the relevant parts of a Nominatim GeoJSON feature's properties
interface NominatimAddressProperties {
  display_name: string;
  address?: {
    road?: string;
    city?: string;
    county?: string;
    state?: string;
    postcode?: string;
    country?: string;
    country_code?: string;
  };
}

// Interface for a Nominatim GeoJSON feature with specific properties
interface NominatimFeature extends Feature<Point, NominatimAddressProperties> {
  bbox?: [number, number, number, number]; // minLng, minLat, maxLng, maxLat
}

// Interface for the Nominatim GeoJSON response
interface NominatimGeoJsonResponse {
  type: "FeatureCollection";
  licence: string;
  features: NominatimFeature[];
}

const NOMINATIM_BASE_URL = "https://nominatim.openstreetmap.org";
const USER_AGENT =
  "GeoAgenticStarterKit (Development; https://github.com/georetina/geo_agentic_starter_kit)";

// Geocodes an address string to a GeoJSON Point Feature.
export async function geocodeAddress(
  address: string
): Promise<Feature<Point> | null> {
  const params = new URLSearchParams({
    q: address,
    format: "geojson",
    limit: "1",
    addressdetails: "1",
  });
  const url = `${NOMINATIM_BASE_URL}/search?${params.toString()}`;

  try {
    const response = await fetch(url, {
      headers: { "User-Agent": USER_AGENT },
    });
    if (!response.ok) {
      console.error(
        `Nominatim API error: ${response.status} ${response.statusText}`
      );
      return null;
    }
    const data: NominatimGeoJsonResponse = await response.json();

    if (data.features && data.features.length > 0) {
      const feature = data.features[0];
      if (feature.geometry && feature.geometry.type === "Point") {
        return feature as Feature<Point>;
      }
      console.warn("Nominatim result does not have Point geometry:", feature);
      return null;
    }
    return null;
  } catch (error) {
    console.error("Geocoding request failed:", error);
    return null;
  }
}

// Reverse geocodes coordinates (latitude, longitude) to an address string (display_name).
export async function reverseGeocodeCoordinates(
  latitude: number,
  longitude: number
): Promise<string | null> {
  const params = new URLSearchParams({
    lat: latitude.toString(),
    lon: longitude.toString(),
    format: "geojson",
    addressdetails: "1",
  });
  const url = `${NOMINATIM_BASE_URL}/reverse?${params.toString()}`;

  try {
    const response = await fetch(url, {
      headers: { "User-Agent": USER_AGENT },
    });
    if (!response.ok) {
      console.error(
        `Nominatim API error: ${response.status} ${response.statusText}`
      );
      return null;
    }
    const data: NominatimGeoJsonResponse = await response.json();

    if (data.features && data.features.length > 0) {
      return data.features[0].properties.display_name || null;
    }
    return null;
  } catch (error) {
    console.error("Reverse geocoding request failed:", error);
    return null;
  }
}

// Reverse geocodes coordinates (latitude, longitude) to a structured address object.
export async function reverseGeocodeToStructuredAddress(
  latitude: number,
  longitude: number
): Promise<NominatimAddressProperties | null> {
  const params = new URLSearchParams({
    lat: latitude.toString(),
    lon: longitude.toString(),
    format: "geojson",
    addressdetails: "1",
  });
  const url = `${NOMINATIM_BASE_URL}/reverse?${params.toString()}`;

  try {
    const response = await fetch(url, {
      headers: { "User-Agent": USER_AGENT },
    });

    if (!response.ok) {
      console.error(
        `Nominatim API error: ${response.status} ${response.statusText}`
      );
      return null;
    }
    const data: NominatimGeoJsonResponse = await response.json();
    if (data.features && data.features.length > 0) {
      return data.features[0].properties;
    }
    return null;
  } catch (error) {
    console.error("Reverse geocoding to structured address failed:", error);
    return null;
  }
}
