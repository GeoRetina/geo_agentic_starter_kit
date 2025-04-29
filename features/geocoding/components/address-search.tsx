"use client";

import { useState } from "react";
import maplibregl, { LngLatBoundsLike } from "maplibre-gl";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import type { FeatureCollection, BBox, Feature } from "geojson";

interface AddressSearchContentProps {
  onSearchResult: (bounds: LngLatBoundsLike) => void;
  onClose: () => void; // Function to close the popover
}

// Keep the Nominatim interfaces
interface NominatimFeature extends Feature {
  bbox: BBox;
}
interface NominatimGeoJsonResponse extends FeatureCollection {
  licence: string;
  features: NominatimFeature[];
}

// This component contains the input and logic inside the address search popover
export function AddressSearchContent({
  onSearchResult,
  onClose,
}: AddressSearchContentProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setIsLoading(true);
    setError(null);

    const params = new URLSearchParams({
      q: searchQuery,
      format: "geojson",
      limit: "1",
      addressdetails: "1",
    });
    const nominatimUrl = `https://nominatim.openstreetmap.org/search?${params.toString()}`;
    const userAgent =
      "GeoAgenticStarterKit/0.1 (Development; https://github.com/georetina/geo_agentic_starter_kit)"; // Required by Nominatim

    try {
      const response = await fetch(nominatimUrl, {
        headers: { "User-Agent": userAgent },
      });
      if (!response.ok)
        throw new Error(`Nominatim API error: ${response.statusText}`);
      const data: NominatimGeoJsonResponse = await response.json();
      // console.log("Nominatim Response:", data); // DEBUG

      if (data.features && data.features.length > 0) {
        const result = data.features[0];
        // console.log("Found Feature:", result); // DEBUG
        const bbox = result.bbox;

        if (!bbox || bbox.length !== 4) {
          console.error("Invalid bbox:", bbox);
          throw new Error("Could not determine location bounds.");
        }

        // console.log("Nominatim BBox:", bbox); // DEBUG

        // Correctly construct bounds using [minLng, minLat], [maxLng, maxLat]
        const bounds: LngLatBoundsLike = [
          [bbox[0], bbox[1]],
          [bbox[2], bbox[3]],
        ];

        // console.log("Calculated Bounds for fitBounds:", bounds); // DEBUG

        onSearchResult(bounds);
        onClose();
      } else {
        setError("Address not found.");
      }
    } catch (err: any) {
      console.error("Geocoding error:", err);
      setError(err.message || "Failed to fetch address.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <div className="p-4 w-full max-w-sm">
      <label
        htmlFor="address-search-input"
        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 mb-2 block"
      >
        Search Address
      </label>
      <div className="relative flex items-center">
        <Input
          id="address-search-input"
          type="text"
          placeholder="Enter address..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyPress={handleKeyPress}
          disabled={isLoading}
          className="pr-10"
          autoFocus
        />
        <Button
          type="button"
          size="icon"
          variant="ghost"
          className="absolute right-1 h-8 w-8"
          onClick={handleSearch}
          disabled={isLoading}
          aria-label="Search"
        >
          <Search className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
        </Button>
      </div>
      {error && (
        <p className="mt-2 text-xs text-red-600 dark:text-red-400">{error}</p>
      )}
    </div>
  );
}
