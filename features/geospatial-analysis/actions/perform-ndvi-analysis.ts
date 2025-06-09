"use server";

import { z } from "zod";

const NdviResponseSchema = z.object({
  message: z.string(),
  ndvi_array: z.array(z.array(z.number())).optional(),
  statistics: z.object({
    min: z.number(),
    max: z.number(),
    mean: z.number(),
  }),
  shape: z.tuple([z.number(), z.number()]).optional(),
  error: z.string().optional(),
});

export type NdviAnalysisResult = z.infer<typeof NdviResponseSchema>;

interface PerformNdviAnalysisParams {
  rasterFile?: File;
  imageUrl?: string;
  redBand: number;
  nirBand: number;
}

export async function performNdviAnalysisAction(
  params: PerformNdviAnalysisParams
): Promise<NdviAnalysisResult> {
  const { rasterFile, imageUrl, redBand, nirBand } = params;

  const defaultErrorStats = { min: 0, max: 0, mean: 0 };

  if (!rasterFile && !imageUrl) {
    return {
      message: "Input error",
      error: "Either a raster file or an image URL must be provided.",
      statistics: defaultErrorStats,
    };
  }
  if (rasterFile && imageUrl) {
    return {
      message: "Input error",
      error: "Provide either a raster file or an image URL, not both.",
      statistics: defaultErrorStats,
    };
  }

  const formData = new FormData();
  // red_band and nir_band will be sent as query parameters

  try {
    if (rasterFile) {
      formData.append("image_file", rasterFile);
    } else if (imageUrl) {
      const response = await fetch(imageUrl);
      if (!response.ok) {
        return {
          message: "Fetch error",
          error: `Failed to fetch image from URL: ${response.statusText}`,
          statistics: defaultErrorStats,
        };
      }
      const imageBlob = await response.blob();
      let filename = "image_from_url.tif";
      try {
        const urlPath = new URL(imageUrl).pathname;
        const parts = urlPath.split("/");
        if (parts.length > 0 && parts[parts.length - 1]) {
          filename = parts[parts.length - 1];
        }
      } catch (e) {
        console.warn(
          "Could not parse filename from imageUrl, using default:",
          imageUrl
        );
      }
      formData.append("image_file", imageBlob, filename);
    }

    const pythonApiUrl = process.env.PYTHON_API_URL || "http://localhost:8001";

    const url = new URL(`${pythonApiUrl}/analyze/ndvi/`);
    url.searchParams.append("red_band", redBand.toString());
    url.searchParams.append("nir_band", nirBand.toString());

    const analysisResponse = await fetch(url.toString(), {
      method: "POST",
      body: formData,
    });

    if (!analysisResponse.ok) {
      const errorData = await analysisResponse.json().catch(() => null);
      const detail = errorData?.detail || analysisResponse.statusText;
      return {
        message: "Analysis error",
        error: `NDVI analysis failed: ${detail}`,
        statistics: defaultErrorStats,
      };
    }

    const resultJson = await analysisResponse.json();
    const parsedResult = NdviResponseSchema.safeParse(resultJson);

    if (!parsedResult.success) {
      console.error("Zod parsing error:", parsedResult.error.errors);
      return {
        message: "Response parsing error",
        error: `Failed to parse NDVI response from server: ${parsedResult.error.message}`,
        statistics: defaultErrorStats,
      };
    }

    return parsedResult.data;
  } catch (error) {
    console.error("Error in performNdviAnalysisAction:", error);
    let errorMessage = "An unexpected error occurred during NDVI analysis.";
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    return {
      message: "Unexpected error",
      error: errorMessage,
      statistics: defaultErrorStats,
    };
  }
}
