// Zustand store for managing imported raster layers
import { create } from "zustand";

export interface RasterLayer {
  id: string;
  name: string;
  file: File;
  // We can add more metadata here later, like CRS, bounds, etc., once extracted.
}

interface RasterLayersState {
  rasterLayers: RasterLayer[];
  addRasterLayer: (file: File) => void;
  removeRasterLayer: (id: string) => void;
  getRasterLayerById: (id: string) => RasterLayer | undefined;
}

export const useRasterLayersStore = create<RasterLayersState>((set, get) => ({
  rasterLayers: [],
  addRasterLayer: (file) => {
    const newLayer: RasterLayer = {
      id: crypto.randomUUID(), // Simple unique ID
      name: file.name,
      file: file,
    };
    set((state) => ({ rasterLayers: [...state.rasterLayers, newLayer] }));
    console.log("Added raster layer:", newLayer);
  },
  removeRasterLayer: (id) =>
    set((state) => ({
      rasterLayers: state.rasterLayers.filter((layer) => layer.id !== id),
    })),
  getRasterLayerById: (id) => {
    return get().rasterLayers.find((layer) => layer.id === id);
  },
}));
