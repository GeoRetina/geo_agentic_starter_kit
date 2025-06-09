"use client";

import { useState, useRef, type ChangeEvent, type FormEvent } from "react";
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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, AlertTriangle, UploadCloud, FileCheck2 } from "lucide-react";
import { useRasterLayersStore } from "@/features/map-layers/store/raster-layers-store";
import { toast } from "sonner";

interface GeoTiffImportDialogProps {
  children: React.ReactNode;
}

export function GeoTiffImportDialog({ children }: GeoTiffImportDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const addRasterLayer = useRasterLayersStore((state) => state.addRasterLayer);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (
        file.type === "image/tiff" ||
        file.name.toLowerCase().endsWith(".tif") ||
        file.name.toLowerCase().endsWith(".tiff")
      ) {
        setSelectedFile(file);
        setError(null);
      } else {
        setError("Invalid file type. Please upload a GeoTIFF (.tif or .tiff).");
        setSelectedFile(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
      }
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedFile) {
      setError("Please select a GeoTIFF file.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await new Promise((resolve) => setTimeout(resolve, 200));

      addRasterLayer(selectedFile);
      toast.success(`File Imported: ${selectedFile.name}`, {
        description: "The GeoTIFF file has been added to the layer list.",
      });
      setIsOpen(false);
    } catch (e) {
      const errorMsg =
        e instanceof Error
          ? e.message
          : "An unexpected error occurred during import.";
      setError(errorMsg);
      toast.error("Import Error", {
        description: errorMsg,
      });
    }
    setIsLoading(false);
  };

  const resetForm = () => {
    setSelectedFile(null);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
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
      <DialogContent className="sm:max-w-[480px] bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-2xl rounded-xl">
        <DialogHeader className="pt-2">
          <DialogTitle className="text-xl font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <UploadCloud className="h-6 w-6 text-green-500" />
            Import GeoTIFF File
          </DialogTitle>
          <DialogDescription className="text-slate-600 dark:text-slate-400 pt-1">
            Select a GeoTIFF (.tif or .tiff) file to import it as a new map
            layer.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6 py-2">
          <div className="space-y-2">
            <Label
              htmlFor="geotiffFileImport"
              className="text-sm font-medium text-slate-700 dark:text-slate-300"
            >
              GeoTIFF File
            </Label>
            <Input
              id="geotiffFileImport"
              ref={fileInputRef}
              type="file"
              accept=".tif,.tiff,image/tiff"
              onChange={handleFileChange}
              className="file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-transparent dark:file:bg-transparent file:text-green-700 dark:file:text-green-300 hover:file:text-green-600 dark:hover:file:text-green-200 transition-colors duration-200 border-slate-300 dark:border-slate-700 focus:ring-green-500 dark:bg-slate-850"
              disabled={isLoading}
            />
          </div>

          {error && (
            <div className="flex items-center gap-2 p-3 rounded-md bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700/50">
              <AlertTriangle className="h-5 w-5 text-red-500 dark:text-red-400" />
              <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
            </div>
          )}

          {selectedFile && !error && (
            <div className="flex items-center gap-2 p-3 rounded-md bg-sky-50 dark:bg-sky-900/30 border border-sky-200 dark:border-sky-700/50">
              <FileCheck2 className="h-5 w-5 text-sky-600 dark:text-sky-400" />
              <div>
                <p className="text-sm font-medium text-sky-700 dark:text-sky-300">
                  File ready: {selectedFile.name}
                </p>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  Size: {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                </p>
              </div>
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
              disabled={isLoading || !selectedFile}
              className="bg-green-600 hover:bg-green-700 text-white dark:bg-green-500 dark:hover:bg-green-600 min-w-[120px]"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Importing...
                </>
              ) : (
                "Import Selected File"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
