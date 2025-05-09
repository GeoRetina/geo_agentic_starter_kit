"use client";

import { useState } from "react";
import maplibregl, { LngLatBoundsLike } from "maplibre-gl";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, MapPin, Loader2 } from "lucide-react";
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

      if (data.features && data.features.length > 0) {
        const result = data.features[0];

        const bbox = result.bbox;

        if (!bbox || bbox.length !== 4) {
          console.error("Invalid bbox:", bbox);
          throw new Error("Could not determine location bounds.");
        }

        // Correctly construct bounds using [minLng, minLat], [maxLng, maxLat]
        const bounds: LngLatBoundsLike = [
          [bbox[0], bbox[1]],
          [bbox[2], bbox[3]],
        ];

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
    <div className="p-5 w-full max-w-sm">
      <div className="flex items-center gap-2 mb-3">
        <MapPin className="h-4 w-4 text-primary" />
        <label
          htmlFor="address-search-input"
          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 block"
        >
          Search Address
        </label>
      </div>
      <div className="relative flex items-center">
        <div className="relative w-full">
          <Input
            id="address-search-input"
            type="text"
            placeholder="Enter address or location..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleKeyPress}
            disabled={isLoading}
            className="pr-10 pl-4 py-2 h-10 bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 focus-visible:ring-primary/30 rounded-lg"
            autoFocus
          />
          <Button
            type="button"
            size="icon"
            variant="ghost"
            className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full hover:bg-gray-200/70 dark:hover:bg-gray-700/70"
            onClick={handleSearch}
            disabled={isLoading}
            aria-label="Search"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin text-primary" />
            ) : (
              <Search className="h-4 w-4 text-gray-500 dark:text-gray-400" />
            )}
          </Button>
        </div>
      </div>
      {error ? (
        <div className="mt-3 p-2 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30 rounded text-xs text-red-600 dark:text-red-400 flex items-center gap-1">
          <div className="h-1.5 w-1.5 rounded-full bg-red-500"></div>
          {error}
        </div>
      ) : (
        <div className="mt-3 text-xs text-gray-500 dark:text-gray-400">
          Enter a location name, address, or coordinates
        </div>
      )}
    </div>
  );
}
