"use client";

import { useState, useEffect } from "react";
import {
  DraftingCompass,
  Sparkles,
  FileUp,
  Search,
  MapPin,
  Layers,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { AddressSearchContent } from "@/features/geocoding/components/address-search";
import { AIChat } from "@/features/ai-assistant/components/ai-chat";
import type { LngLatBoundsLike } from "maplibre-gl";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

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
  const [isAIChatOpen, setIsAIChatOpen] = useState(false);
  const [activeButton, setActiveButton] = useState<string | null>(null);

  const handleBufferSubmit = () => {
    onBufferClick(bufferRadius);
    setIsBufferPopoverOpen(false);
  };

  const toggleAIChat = () => {
    setIsAIChatOpen(!isAIChatOpen);
    setActiveButton(isAIChatOpen ? null : "ai");
  };

  // Reset active button when AI chat is closed
  useEffect(() => {
    if (!isAIChatOpen && activeButton === "ai") {
      setActiveButton(null);
    }
  }, [isAIChatOpen, activeButton]);

  return (
    <>
      <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-10">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="bg-white/75 dark:bg-slate-900/85 backdrop-blur-lg rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.12)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.25)] border border-white/20 dark:border-slate-800/50 px-4 py-2.5"
        >
          <div className="flex items-center gap-1.5">
            {/* Geocoding Search Popover */}
            <Popover
              open={isSearchPopoverOpen}
              onOpenChange={(open: boolean) => {
                setIsSearchPopoverOpen(open);
                setActiveButton(open ? "search" : null);
              }}
            >
              <PopoverTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn(
                    "h-11 w-11 rounded-xl transition-all duration-300 relative overflow-hidden group",
                    activeButton === "search"
                      ? "bg-slate-100/90 dark:bg-slate-700/70 text-slate-900 dark:text-slate-100"
                      : "hover:bg-slate-100/60 dark:hover:bg-slate-800/60"
                  )}
                  title="Search Address"
                >
                  <Search
                    className={cn(
                      "h-5 w-5 transition-all duration-300",
                      activeButton === "search"
                        ? "text-blue-500"
                        : "group-hover:scale-110"
                    )}
                  />
                  {activeButton === "search" && (
                    <motion.div
                      layoutId="activeIndicator"
                      className="absolute bottom-1 left-1/2 -translate-x-1/2 h-1 w-1/2 bg-blue-500 rounded-full"
                    />
                  )}
                  <span className="sr-only">Search Address</span>
                </Button>
              </PopoverTrigger>
              <PopoverContent
                className="w-auto p-0 rounded-xl shadow-lg border border-gray-200/80 dark:border-gray-800/80"
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
            <Popover
              onOpenChange={(open: boolean) => {
                setActiveButton(open ? "geo" : null);
              }}
            >
              <PopoverTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn(
                    "h-11 w-11 rounded-xl transition-all duration-300 relative overflow-hidden group",
                    activeButton === "geo"
                      ? "bg-slate-100/90 dark:bg-slate-700/70 text-slate-900 dark:text-slate-100"
                      : "hover:bg-slate-100/60 dark:hover:bg-slate-800/60"
                  )}
                  title="Geospatial Tools"
                >
                  <DraftingCompass
                    className={cn(
                      "h-5 w-5 transition-all duration-300",
                      activeButton === "geo"
                        ? "text-indigo-500"
                        : "group-hover:scale-110"
                    )}
                  />
                  {activeButton === "geo" && (
                    <motion.div
                      layoutId="activeIndicator"
                      className="absolute bottom-1 left-1/2 -translate-x-1/2 h-1 w-1/2 bg-indigo-500 rounded-full"
                    />
                  )}
                  <span className="sr-only">Open geospatial tools</span>
                </Button>
              </PopoverTrigger>
              <PopoverContent
                className="w-[280px] p-0 rounded-xl shadow-lg border border-gray-200/80 dark:border-gray-800/80 overflow-hidden"
                align="center"
                side="top"
                sideOffset={16}
              >
                <div className="bg-gradient-to-br from-indigo-50 to-white dark:from-slate-800 dark:to-slate-900 p-5 space-y-3">
                  <h3 className="text-sm font-medium mb-3 flex items-center gap-2 text-indigo-700 dark:text-indigo-300">
                    <MapPin className="h-4 w-4" />
                    <span>Geospatial Tools</span>
                  </h3>

                  {/* Buffer Tool Popover */}
                  <Popover
                    open={isBufferPopoverOpen}
                    onOpenChange={setIsBufferPopoverOpen}
                  >
                    <PopoverTrigger asChild>
                      <Button
                        disabled={selectedGeometryType !== "Point"}
                        variant="ghost"
                        className={cn(
                          "w-full justify-start text-left rounded-lg transition-all duration-200",
                          selectedGeometryType === "Point"
                            ? "bg-indigo-100/80 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 font-medium"
                            : "hover:bg-white/80 dark:hover:bg-slate-800/80"
                        )}
                      >
                        Buffer
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent
                      className="w-[240px] p-0 rounded-xl shadow-lg border border-gray-200/80 dark:border-gray-800/80 overflow-hidden"
                      align="center"
                      side="right"
                      sideOffset={8}
                    >
                      <div className="bg-gradient-to-br from-slate-50 to-white dark:from-slate-900 dark:to-slate-800 p-5 space-y-3">
                        <h4 className="text-sm font-medium leading-none flex items-center gap-2 text-slate-700 dark:text-slate-300">
                          <div className="h-2 w-2 rounded-full bg-indigo-500"></div>
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
                            className="flex h-9 w-full rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/30 disabled:cursor-not-allowed disabled:opacity-50"
                          />
                        </div>
                        <Button
                          onClick={handleBufferSubmit}
                          size="sm"
                          className="w-full h-9 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-600 text-white border-none shadow-md hover:shadow-lg transition-all duration-200"
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
                    variant="ghost"
                    className={cn(
                      "w-full justify-start text-left rounded-lg transition-all duration-200",
                      selectedGeometryType === "LineString"
                        ? "bg-indigo-100/80 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 font-medium"
                        : "hover:bg-white/80 dark:hover:bg-slate-800/80"
                    )}
                  >
                    Calculate Distance
                  </Button>
                  <Button
                    onClick={onAreaClick}
                    disabled={selectedGeometryType !== "Polygon"}
                    variant="ghost"
                    className={cn(
                      "w-full justify-start text-left rounded-lg transition-all duration-200",
                      selectedGeometryType === "Polygon"
                        ? "bg-indigo-100/80 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 font-medium"
                        : "hover:bg-white/80 dark:hover:bg-slate-800/80"
                    )}
                  >
                    Calculate Area
                  </Button>
                  <Button
                    onClick={onCentroidClick}
                    disabled={selectedGeometryType !== "Polygon"}
                    variant="ghost"
                    className={cn(
                      "w-full justify-start text-left rounded-lg transition-all duration-200",
                      selectedGeometryType === "Polygon"
                        ? "bg-indigo-100/80 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 font-medium"
                        : "hover:bg-white/80 dark:hover:bg-slate-800/80"
                    )}
                  >
                    Calculate Centroid
                  </Button>
                </div>
              </PopoverContent>
            </Popover>

            {/* Divider */}
            <div className="h-7 w-px bg-slate-200/80 dark:bg-slate-700/80 mx-1"></div>

            {/* AI Assistant Button */}
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "h-11 w-11 rounded-xl transition-all duration-300 relative overflow-hidden group",
                activeButton === "ai"
                  ? "bg-amber-100/80 dark:bg-amber-900/50 text-amber-900 dark:text-amber-100"
                  : "hover:bg-slate-100/60 dark:hover:bg-slate-800/60"
              )}
              title="AI Assistant"
              onClick={toggleAIChat}
            >
              <Sparkles
                className={cn(
                  "h-5 w-5 transition-all duration-300",
                  activeButton === "ai"
                    ? "text-amber-500"
                    : "text-amber-500 group-hover:scale-110"
                )}
              />
              {activeButton === "ai" && (
                <motion.div
                  layoutId="activeIndicator"
                  className="absolute bottom-1 left-1/2 -translate-x-1/2 h-1 w-1/2 bg-amber-500 rounded-full"
                />
              )}
              <span className="sr-only">AI Assistant</span>
            </Button>

            {/* Layer Manager Button */}
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "h-11 w-11 rounded-xl transition-all duration-300 relative overflow-hidden group",
                activeButton === "layers"
                  ? "bg-blue-100/80 dark:bg-blue-900/50 text-blue-900 dark:text-blue-100"
                  : "hover:bg-slate-100/60 dark:hover:bg-slate-800/60"
              )}
              title="Layer Manager"
              onClick={() =>
                setActiveButton(activeButton === "layers" ? null : "layers")
              }
            >
              <Layers
                className={cn(
                  "h-5 w-5 transition-all duration-300 text-blue-500",
                  activeButton === "layers" ? "" : "group-hover:scale-110"
                )}
              />
              {activeButton === "layers" && (
                <motion.div
                  layoutId="activeIndicator"
                  className="absolute bottom-1 left-1/2 -translate-x-1/2 h-1 w-1/2 bg-blue-500 rounded-full"
                />
              )}
              <span className="sr-only">Layer Manager</span>
            </Button>

            {/* File Import Button */}
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "h-11 w-11 rounded-xl transition-all duration-300 relative overflow-hidden group",
                activeButton === "import"
                  ? "bg-green-100/80 dark:bg-green-900/50 text-green-900 dark:text-green-100"
                  : "hover:bg-slate-100/60 dark:hover:bg-slate-800/60"
              )}
              title="Import Data"
              onClick={() =>
                setActiveButton(activeButton === "import" ? null : "import")
              }
            >
              <FileUp
                className={cn(
                  "h-5 w-5 transition-all duration-300 text-green-500",
                  activeButton === "import" ? "" : "group-hover:scale-110"
                )}
              />
              {activeButton === "import" && (
                <motion.div
                  layoutId="activeIndicator"
                  className="absolute bottom-1 left-1/2 -translate-x-1/2 h-1 w-1/2 bg-green-500 rounded-full"
                />
              )}
              <span className="sr-only">Import Data</span>
            </Button>
          </div>
        </motion.div>
      </div>

      {/* AI Chat Component */}
      <AnimatePresence>
        {isAIChatOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
          >
            <AIChat
              isOpen={isAIChatOpen}
              onClose={() => setIsAIChatOpen(false)}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
