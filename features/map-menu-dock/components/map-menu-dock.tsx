"use client";

import { useState } from "react";
import { DraftingCompass, Sparkles, FileUp, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { AddressSearchContent } from "@/features/geocoding/components/address-search";
import type { LngLatBoundsLike } from "maplibre-gl";

interface MapMenuDockProps {
  selectedGeometryType: string | null;
  onBufferClick: (radius: number) => void;
  onDistanceClick: () => void;
  onAreaClick: () => void;
  onCentroidClick: () => void;
  onSearchResult: (bounds: LngLatBoundsLike) => void;
}

export function MapMenuDock({
  selectedGeometryType,
  onBufferClick,
  onDistanceClick,
  onAreaClick,
  onCentroidClick,
  onSearchResult,
}: MapMenuDockProps) {
  const [bufferRadius, setBufferRadius] = useState<number>(1);
  const [isBufferPopoverOpen, setIsBufferPopoverOpen] = useState(false);
  const [isSearchPopoverOpen, setIsSearchPopoverOpen] = useState(false);

  const handleBufferSubmit = () => {
    onBufferClick(bufferRadius);
    setIsBufferPopoverOpen(false);
  };

  return (
    <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-10">
      <div className="bg-white dark:bg-slate-800 rounded-full shadow-lg px-4 py-2 flex items-center space-x-3">
        {/* Geocoding Search Popover */}
        <Popover
          open={isSearchPopoverOpen}
          onOpenChange={setIsSearchPopoverOpen}
        >
          <PopoverTrigger asChild>
            <Button
              variant="default"
              size="icon"
              className="h-10 w-10 rounded-full"
              title="Search Address"
            >
              <Search className="h-5 w-5" />
              <span className="sr-only">Search Address</span>
            </Button>
          </PopoverTrigger>
          <PopoverContent
            className="w-auto p-0"
            align="center"
            side="top"
            sideOffset={16}
          >
            <AddressSearchContent
              onSearchResult={onSearchResult}
              onClose={() => setIsSearchPopoverOpen(false)}
            />
          </PopoverContent>
        </Popover>

        {/* Geospatial Tools Popover */}
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="default"
              size="icon"
              className="h-10 w-10 rounded-full"
              title="Geospatial Tools"
            >
              <DraftingCompass className="h-5 w-5" />
              <span className="sr-only">Open geospatial tools</span>
            </Button>
          </PopoverTrigger>
          <PopoverContent
            className="w-[250px] p-0"
            align="center"
            side="top"
            sideOffset={16}
          >
            <div className="p-4 space-y-2">
              <h3 className="text-sm font-medium mb-2">Geospatial Tools</h3>

              {/* Buffer Tool Popover */}
              <Popover
                open={isBufferPopoverOpen}
                onOpenChange={setIsBufferPopoverOpen}
              >
                <PopoverTrigger asChild>
                  <Button
                    disabled={selectedGeometryType !== "Point"}
                    variant={
                      selectedGeometryType === "Point" ? "secondary" : "ghost"
                    }
                    className="w-full justify-start text-left"
                  >
                    Buffer
                  </Button>
                </PopoverTrigger>
                <PopoverContent
                  className="w-[220px] p-4"
                  align="center"
                  side="right"
                  sideOffset={8}
                >
                  <div className="space-y-3">
                    <h4 className="text-sm font-medium leading-none">
                      Buffer Radius (km)
                    </h4>
                    <div className="flex items-center space-x-2">
                      <input
                        type="number"
                        min="0.1"
                        step="0.1"
                        value={bufferRadius}
                        onChange={(e) =>
                          setBufferRadius(parseFloat(e.target.value))
                        }
                        className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                      />
                    </div>
                    <Button
                      onClick={handleBufferSubmit}
                      size="sm"
                      className="w-full h-9"
                    >
                      Apply
                    </Button>
                  </div>
                </PopoverContent>
              </Popover>

              {/* Other Analysis Buttons */}
              <Button
                onClick={onDistanceClick}
                disabled={selectedGeometryType !== "LineString"}
                variant={
                  selectedGeometryType === "LineString" ? "secondary" : "ghost"
                }
                className="w-full justify-start text-left"
              >
                Calculate Distance
              </Button>
              <Button
                onClick={onAreaClick}
                disabled={selectedGeometryType !== "Polygon"}
                variant={
                  selectedGeometryType === "Polygon" ? "secondary" : "ghost"
                }
                className="w-full justify-start text-left"
              >
                Calculate Area
              </Button>
              <Button
                onClick={onCentroidClick}
                disabled={selectedGeometryType !== "Polygon"}
                variant={
                  selectedGeometryType === "Polygon" ? "secondary" : "ghost"
                }
                className="w-full justify-start text-left"
              >
                Calculate Centroid
              </Button>
            </div>
          </PopoverContent>
        </Popover>

        {/* AI Agent Button */}
        <Button
          variant="default"
          size="icon"
          className="h-10 w-10 rounded-full"
          title="AI Assistant"
        >
          <Sparkles className="h-5 w-5" />
          <span className="sr-only">AI Assistant</span>
        </Button>

        {/* File Import Button */}
        <Button
          variant="default"
          size="icon"
          className="h-10 w-10 rounded-full"
          title="Import Data"
        >
          <FileUp className="h-5 w-5" />
          <span className="sr-only">Import Data</span>
        </Button>
      </div>
    </div>
  );
}
