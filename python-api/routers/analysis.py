from fastapi import APIRouter, File, UploadFile, HTTPException, Query
from typing import Annotated 
from services.raster_operations import calculate_ndvi_from_bytes

router = APIRouter(
    prefix="/analyze",
    tags=["analysis"],
)

# 0.0.0.0:8001/analyze/ndvi/?red_band=1&nir_band=2

@router.post("/ndvi/")
async def compute_ndvi(
    image_file: Annotated[UploadFile, File(description="A GeoTIFF or similar raster file.")],
    red_band: Annotated[int, Query(description="The band number for the Red channel (1-indexed).", ge=1)],
    nir_band: Annotated[int, Query(description="The band number for the Near-Infrared channel (1-indexed).", ge=1)]
):
    """
    Computes the Normalized Difference Vegetation Index (NDVI) for a given raster image.

    - **image_file**: The uploaded raster image (e.g., GeoTIFF).
    - **red_band**: The 1-indexed band number for the Red channel.
    - **nir_band**: The 1-indexed band number for the Near-Infrared channel.
    """
    try:
        image_bytes = await image_file.read()
        if not image_bytes:
            raise HTTPException(status_code=400, detail="Image file is empty.")

        result = calculate_ndvi_from_bytes(
            image_bytes=image_bytes,
            red_band_number=red_band,
            nir_band_number=nir_band
        )

        if "error" in result:
            raise HTTPException(status_code=400, detail=result["error"])

        # For now, we return the full NDVI array. In a real application, you might:
        # 1. Save the NDVI array as a new GeoTIFF and return a URL or path to it.
        # 2. Return only statistics or a downsampled version if the array is too large.
        # 3. Implement a way to stream or tile the result.
        return result

    except HTTPException as http_exc: # Re-raise HTTPExceptions
        raise http_exc
    except Exception as e:
        # Log the exception for debugging
        print(f"Unexpected error in /ndvi endpoint: {e}")
        raise HTTPException(status_code=500, detail=f"An unexpected error occurred: {str(e)}") 