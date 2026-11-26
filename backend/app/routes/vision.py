
from fastapi import APIRouter, UploadFile, File, HTTPException

from app.services.vision_service import (
    validate_crop_image,
    predict_crop_disease
)

router = APIRouter(
    prefix="/api/vision",
    tags=["Crop Vision"]
)

MAX_FILE_SIZE = 10 * 1024 * 1024


@router.post("/upload")
async def upload_crop_image(file: UploadFile = File(...)):

    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(
            status_code=400,
            detail="Please upload a valid image file."
        )

    image_bytes = await file.read(MAX_FILE_SIZE + 1)

    if len(image_bytes) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=413,
            detail="Image size must be below 10 MB."
        )

    try:
        # Validate image
        image_details = validate_crop_image(image_bytes)

        # Run trained AI model
        prediction = predict_crop_disease(image_bytes)

        return {
            "success": True,
            "filename": file.filename,
            "message": "Crop disease prediction completed successfully.",
            "image_details": image_details,
            "prediction": prediction
        }

    except ValueError as e:
        raise HTTPException(
            status_code=400,
            detail=str(e)
        )

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Prediction failed: {str(e)}"
        )

    finally:
        await file.close()
