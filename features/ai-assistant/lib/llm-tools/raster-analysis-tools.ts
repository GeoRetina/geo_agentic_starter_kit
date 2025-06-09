import { z } from "zod";
import { tool } from "ai";
import {
  performNdviAnalysisAction,
  type NdviAnalysisResult,
} from "@/features/geospatial-analysis/actions/perform-ndvi-analysis";

export const rasterAnalysisTools = {
  calculateNdviFromUrl: tool({
    description:
      "Calculates the Normalized Difference Vegetation Index (NDVI) from a given GeoTIFF image URL. " +
      "The user must provide the URL of the GeoTIFF image, and the band numbers for the Red and Near-Infrared (NIR) channels. " +
      "Returns NDVI statistics (min, max, mean) and a success or error message. The full NDVI array is processed server-side but not returned directly via this tool to avoid excessive data transfer.",
    parameters: z.object({
      imageUrl: z
        .string()
        .url()
        .describe("The publicly accessible URL of the GeoTIFF raster image."),
      redBand: z
        .number()
        .int()
        .positive()
        .describe(
          "The 1-indexed band number for the Red channel (e.g., 4 for Landsat 8 OLI)."
        ),
      nirBand: z
        .number()
        .int()
        .positive()
        .describe(
          "The 1-indexed band number for the Near-Infrared (NIR) channel (e.g., 5 for Landsat 8 OLI)."
        ),
    }),
    execute: async ({
      imageUrl,
      redBand,
      nirBand,
    }): Promise<
      | NdviAnalysisResult
      | {
          error: string;
          statistics: { min: number; max: number; mean: number };
          message: string;
        }
    > => {
      console.log(
        `LLM tool: Calculating NDVI for image URL: ${imageUrl}, Red band: ${redBand}, NIR band: ${nirBand}`
      );
      try {
        const result = await performNdviAnalysisAction({
          imageUrl,
          redBand,
          nirBand,
        });

        if (result.error) {
          return {
            message:
              result.message || "NDVI analysis via URL encountered an error.",
            error: result.error,
            statistics: result.statistics, // Ensure stats are returned even on error as per schema
          };
        }
        return {
          message: result.message || "NDVI analysis successful.",
          statistics: result.statistics,
          // ndvi_array and shape are intentionally omitted here for brevity to the LLM
        };
      } catch (error) {
        console.error("Error executing calculateNdviFromUrl tool:", error);
        const errorMessage =
          error instanceof Error ? error.message : "An unknown error occurred.";
        return {
          message: "Failed to execute NDVI analysis tool.",
          error: `Tool execution failed: ${errorMessage}`,
          statistics: { min: 0, max: 0, mean: 0 }, // Default stats on tool execution failure
        };
      }
    },
  }),
};
