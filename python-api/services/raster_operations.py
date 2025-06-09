import rasterio
from rasterio.io import MemoryFile
import numpy as np

def calculate_ndvi_from_bytes(
    image_bytes: bytes, red_band_number: int, nir_band_number: int
):
    """
    Calculates NDVI from image bytes.

    Args:
        image_bytes: Bytes of the raster image file (e.g., GeoTIFF).
        red_band_number: The band number for the Red channel (1-indexed).
        nir_band_number: The band number for the Near-Infrared channel (1-indexed).

    Returns:
        A dictionary containing the NDVI array (as a list of lists)
        and summary statistics (min, max, mean NDVI).
        Returns an error message if bands are out of range or calculation fails.
    """
    try:
        with MemoryFile(image_bytes) as memfile:
            with memfile.open() as dataset:
                if not (0 < red_band_number <= dataset.count and 0 < nir_band_number <= dataset.count):
                    return {"error": f"Band numbers out of range. Image has {dataset.count} bands."}

                # Read the red and NIR bands
                red = dataset.read(red_band_number).astype(np.float32)
                nir = dataset.read(nir_band_number).astype(np.float32)

                # Calculate NDVI
                # Handle division by zero by setting result to 0 where denominator is zero
                denominator = nir + red
                ndvi = np.where(denominator == 0, 0, (nir - red) / denominator)

                # Clip NDVI values to the theoretical range [-1, 1] if necessary,
                # though true NDVI should inherently be in this range if inputs are correct.
                ndvi = np.clip(ndvi, -1, 1)

                # Replace any remaining NaNs or Infs (e.g., if red or nir were NaN)
                ndvi[np.isnan(ndvi)] = 0  # Or a specific NoData value
                ndvi[np.isinf(ndvi)] = 0  # Or a specific NoData value


                return {
                    "message": "NDVI calculated successfully",
                    "ndvi_array": ndvi.tolist(), # Convert numpy array to list of lists for JSON
                    "statistics": {
                        "min": float(np.min(ndvi)),
                        "max": float(np.max(ndvi)),
                        "mean": float(np.mean(ndvi)),
                    },
                    "shape": ndvi.shape
                }

    except rasterio.errors.RasterioIOError as e:
        return {"error": f"Rasterio I/O Error: Could not read image. {str(e)}"}
    except Exception as e:
        return {"error": f"An unexpected error occurred: {str(e)}"} 