import { create } from "zustand";
import type { Feature, Geometry } from "geojson";

interface DrawState {
  drawnFeature: Feature<Geometry> | null;
  setDrawnFeature: (feature: Feature<Geometry> | null) => void;
}

export const useDrawStore = create<DrawState>((set) => ({
  drawnFeature: null,
  setDrawnFeature: (feature) => set({ drawnFeature: feature }),
}));
