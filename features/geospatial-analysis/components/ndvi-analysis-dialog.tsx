"use client";

import { useState, type FormEvent, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Loader2,
  CheckCircle,
  AlertTriangle,
  Layers,
  BarChart3,
} from "lucide-react";
import {
  useRasterLayersStore,
  type RasterLayer,
} from "@/features/map-layers/store/raster-layers-store";
import {
  performNdviAnalysisAction,
  type NdviAnalysisResult,
} from "@/features/geospatial-analysis/actions/perform-ndvi-analysis";
import { toast } from "sonner";

interface NdviAnalysisDialogProps {
  children: React.ReactNode;
  onAnalysisComplete?: (result: NdviAnalysisResult, layerName?: string) => void;
}

export function NdviAnalysisDialog({
  children,
  onAnalysisComplete,
}: NdviAnalysisDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedLayerId, setSelectedLayerId] = useState<string>("");
  const [redBand, setRedBand] = useState<string>("");
  const [nirBand, setNirBand] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successfulAnalysisResult, setSuccessfulAnalysisResult] =
    useState<NdviAnalysisResult | null>(null);

  const { rasterLayers, getRasterLayerById } = useRasterLayersStore();

  useEffect(() => {
    if (selectedLayerId && !getRasterLayerById(selectedLayerId)) {
      setSelectedLayerId("");
      setSuccessfulAnalysisResult(null);
    }
  }, [rasterLayers, selectedLayerId, getRasterLayerById]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const selectedLayer = getRasterLayerById(selectedLayerId);

    if (!selectedLayer) {
      setError("Please select a raster layer.");
      setSuccessfulAnalysisResult(null);
      return;
    }
    if (!redBand || !nirBand) {
      setError("Please enter Red and NIR band numbers.");
      setSuccessfulAnalysisResult(null);
      return;
    }

    const redBandNum = parseInt(redBand, 10);
    const nirBandNum = parseInt(nirBand, 10);

    if (
      isNaN(redBandNum) ||
      isNaN(nirBandNum) ||
      redBandNum <= 0 ||
      nirBandNum <= 0
    ) {
      setError("Band numbers must be positive integers.");
      setSuccessfulAnalysisResult(null);
      return;
    }
    if (redBandNum === nirBandNum) {
      setError("Red and NIR band numbers cannot be the same.");
      setSuccessfulAnalysisResult(null);
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccessfulAnalysisResult(null);

    try {
      const result = await performNdviAnalysisAction({
        rasterFile: selectedLayer.file,
        redBand: redBandNum,
        nirBand: nirBandNum,
      });

      if (result.error) {
        setError(result.error);
        setSuccessfulAnalysisResult(null);
        toast.error("NDVI Analysis Failed", { description: result.error });
      } else {
        setSuccessfulAnalysisResult(result);
        setError(null);
        toast.success("NDVI Analysis Successful", {
          description: `${result.message} for ${
            selectedLayer.name
          }. Min: ${result.statistics.min.toFixed(
            3
          )}, Max: ${result.statistics.max.toFixed(
            3
          )}, Mean: ${result.statistics.mean.toFixed(3)}`,
        });
        if (onAnalysisComplete) {
          onAnalysisComplete(result, selectedLayer.name);
        }
      }
    } catch (e) {
      const errorMsg =
        e instanceof Error ? e.message : "An unexpected error occurred.";
      setError(errorMsg);
      setSuccessfulAnalysisResult(null);
      toast.error("NDVI Analysis Error", { description: errorMsg });
    }
    setIsLoading(false);
  };

  const resetForm = () => {
    setSelectedLayerId("");
    setRedBand("");
    setNirBand("");
    setError(null);
    setSuccessfulAnalysisResult(null);
    setIsLoading(false);
  };

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      resetForm();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[525px] bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-2xl rounded-xl">
        <DialogHeader className="pt-2">
          <DialogTitle className="text-xl font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <Layers className="h-6 w-6 text-teal-500" />
            NDVI Calculation
          </DialogTitle>
          <DialogDescription className="text-slate-600 dark:text-slate-400 pt-1">
            Select an imported raster layer and specify Red/NIR bands to
            calculate NDVI.
          </DialogDescription>
        </DialogHeader>
        {rasterLayers.length === 0 ? (
          <div className="py-8 text-center text-slate-500 dark:text-slate-400">
            <p>No raster layers imported yet.</p>
            <p className="text-sm">
              Please import a GeoTIFF file first using the main "Import GeoTIFF
              Data" button.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6 py-2">
            <div className="space-y-2">
              <Label
                htmlFor="rasterLayerSelect"
                className="text-sm font-medium text-slate-700 dark:text-slate-300"
              >
                Select Raster Layer
              </Label>
              <Select
                value={selectedLayerId}
                onValueChange={(value) => {
                  setSelectedLayerId(value);
                  setSuccessfulAnalysisResult(null);
                  setError(null);
                }}
                disabled={isLoading}
              >
                <SelectTrigger
                  id="rasterLayerSelect"
                  className="w-full border-slate-300 dark:border-slate-700 focus:ring-teal-500 dark:bg-slate-850"
                >
                  <SelectValue placeholder="Choose an imported raster..." />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-slate-850 border-slate-300 dark:border-slate-700">
                  {rasterLayers.map((layer: RasterLayer) => (
                    <SelectItem
                      key={layer.id}
                      value={layer.id}
                      className="hover:bg-slate-100 dark:hover:bg-slate-800 focus:bg-teal-50 dark:focus:bg-teal-700/30"
                    >
                      {layer.name} (
                      {(layer.file.size / (1024 * 1024)).toFixed(2)} MB)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label
                  htmlFor="redBandNdvi"
                  className="text-sm font-medium text-slate-700 dark:text-slate-300"
                >
                  Red Band Number
                </Label>
                <Input
                  id="redBandNdvi"
                  type="number"
                  min="1"
                  placeholder="e.g., 4"
                  value={redBand}
                  onChange={(e) => {
                    setRedBand(e.target.value);
                    setSuccessfulAnalysisResult(null);
                    setError(null);
                  }}
                  className="border-slate-300 dark:border-slate-700 focus:ring-teal-500 dark:bg-slate-850"
                  disabled={isLoading || !selectedLayerId}
                />
              </div>
              <div className="space-y-2">
                <Label
                  htmlFor="nirBandNdvi"
                  className="text-sm font-medium text-slate-700 dark:text-slate-300"
                >
                  NIR Band Number
                </Label>
                <Input
                  id="nirBandNdvi"
                  type="number"
                  min="1"
                  placeholder="e.g., 5"
                  value={nirBand}
                  onChange={(e) => {
                    setNirBand(e.target.value);
                    setSuccessfulAnalysisResult(null);
                    setError(null);
                  }}
                  className="border-slate-300 dark:border-slate-700 focus:ring-teal-500 dark:bg-slate-850"
                  disabled={isLoading || !selectedLayerId}
                />
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 p-3 rounded-md bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700/50">
                <AlertTriangle className="h-5 w-5 text-red-500 dark:text-red-400" />
                <p className="text-sm text-red-700 dark:text-red-300">
                  {error}
                </p>
              </div>
            )}

            {successfulAnalysisResult && !successfulAnalysisResult.error && (
              <div className="p-4 rounded-md bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-700/50 space-y-2">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0" />
                  <h4 className="text-md font-semibold text-green-700 dark:text-green-300">
                    NDVI Analysis Succeeded
                  </h4>
                </div>
                <p className="text-sm text-slate-700 dark:text-slate-300">
                  <span className="font-medium">Layer:</span>{" "}
                  {getRasterLayerById(selectedLayerId)?.name || "N/A"}
                </p>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
                  <p className="text-slate-600 dark:text-slate-400">
                    <span className="font-medium">Min NDVI:</span>{" "}
                    {successfulAnalysisResult.statistics.min.toFixed(4)}
                  </p>
                  <p className="text-slate-600 dark:text-slate-400">
                    <span className="font-medium">Max NDVI:</span>{" "}
                    {successfulAnalysisResult.statistics.max.toFixed(4)}
                  </p>
                  <p className="text-slate-600 dark:text-slate-400">
                    <span className="font-medium">Mean NDVI:</span>{" "}
                    {successfulAnalysisResult.statistics.mean.toFixed(4)}
                  </p>
                  {successfulAnalysisResult.shape && (
                    <p className="text-slate-600 dark:text-slate-400">
                      <span className="font-medium">Dimensions:</span>{" "}
                      {successfulAnalysisResult.shape[0]}x
                      {successfulAnalysisResult.shape[1]}
                    </p>
                  )}
                </div>
                {successfulAnalysisResult.message &&
                  successfulAnalysisResult.message !==
                    "NDVI calculated successfully" && (
                    <p className="text-xs text-slate-500 dark:text-slate-400 pt-1">
                      {successfulAnalysisResult.message}
                    </p>
                  )}
              </div>
            )}

            <DialogFooter className="sm:justify-between gap-2 pt-2">
              <DialogClose asChild>
                <Button
                  type="button"
                  variant="outline"
                  onClick={resetForm}
                  className="border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancel
                </Button>
              </DialogClose>
              <Button
                type="submit"
                disabled={isLoading || !selectedLayerId || !redBand || !nirBand}
                className="bg-teal-600 hover:bg-teal-700 text-white dark:bg-teal-500 dark:hover:bg-teal-600 min-w-[120px]"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />{" "}
                    Calculating...
                  </>
                ) : (
                  "Calculate NDVI"
                )}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
