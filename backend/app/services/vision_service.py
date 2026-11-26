
import json
from pathlib import Path
from io import BytesIO
from functools import lru_cache

import numpy as np
import tensorflow as tf
from PIL import Image, UnidentifiedImageError

from app.services.disease_info import get_disease_info


# ==========================================
# PROJECT PATHS
# ==========================================

PROJECT_ROOT = Path(__file__).resolve().parents[3]

MODEL_PATH = (
    PROJECT_ROOT
    / "ai_models"
    / "disease_classification"
    / "weights"
    / "agrisahayak_finetuned_best.keras"
)

MAPPING_PATH = (
    PROJECT_ROOT
    / "ai_models"
    / "disease_classification"
    / "class_mapping.json"
)

MAX_IMAGE_PIXELS = 20_000_000
IMAGE_SIZE = (224, 224)


# ==========================================
# LOAD TRAINED MODEL
# ==========================================

@lru_cache(maxsize=1)
def load_crop_model():

    if not MODEL_PATH.exists():
        raise FileNotFoundError(
            f"Trained model not found: {MODEL_PATH}"
        )

    model = tf.keras.models.load_model(
        MODEL_PATH,
        compile=False
    )

    if model.output_shape[-1] != 17:
        raise ValueError(
            "Model output does not match the expected 17 classes."
        )

    return model


# ==========================================
# LOAD CLASS MAPPING
# ==========================================

@lru_cache(maxsize=1)
def load_class_mapping():

    if not MAPPING_PATH.exists():
        raise FileNotFoundError(
            f"Class mapping not found: {MAPPING_PATH}"
        )

    with open(MAPPING_PATH, "r", encoding="utf-8") as file:
        mapping = json.load(file)

    index_mapping = {
        int(index): class_name
        for class_name, index in mapping.items()
    }

    if len(index_mapping) != 17:
        raise ValueError(
            "Expected exactly 17 classes in class_mapping.json."
        )

    return index_mapping


# ==========================================
# IMAGE VALIDATION
# ==========================================

def validate_crop_image(image_bytes: bytes):

    try:
        image = Image.open(BytesIO(image_bytes))

        image.verify()

        image = Image.open(BytesIO(image_bytes))

        width, height = image.size

        if width <= 0 or height <= 0:
            raise ValueError("Invalid image dimensions.")

        if width * height > MAX_IMAGE_PIXELS:
            raise ValueError("Image resolution is too large.")

        return {
            "valid": True,
            "width": width,
            "height": height,
            "format": image.format,
            "mode": image.mode
        }

    except (UnidentifiedImageError, OSError, ValueError) as e:
        raise ValueError(f"Invalid image: {str(e)}")


# ==========================================
# IMAGE PREPROCESSING
# ==========================================

def preprocess_crop_image(image_bytes: bytes):

    try:
        image = Image.open(BytesIO(image_bytes))

        image = image.convert("RGB")

        image = image.resize(
            IMAGE_SIZE,
            Image.Resampling.BILINEAR
        )

        image_array = np.asarray(
            image,
            dtype=np.float32
        )

        # Keep pixel values in 0-255 range.
        # No additional /255 normalization.

        image_array = np.expand_dims(
            image_array,
            axis=0
        )

        return image_array

    except (UnidentifiedImageError, OSError) as e:
        raise ValueError(
            f"Unable to preprocess image: {str(e)}"
        )


# ==========================================
# CROP DISEASE PREDICTION
# ==========================================

def predict_crop_disease(image_bytes: bytes):

    try:

        # Validate uploaded image
        validate_crop_image(image_bytes)

        # Preprocess image
        image_array = preprocess_crop_image(image_bytes)

        # Load model and class mapping
        model = load_crop_model()

        class_mapping = load_class_mapping()

        # Generate prediction
        predictions = model.predict(
            image_array,
            verbose=0
        )

        probabilities = predictions[0]

        if len(probabilities) != 17:
            raise ValueError(
                "Unexpected number of prediction outputs."
            )

        predicted_index = int(
            np.argmax(probabilities)
        )

        confidence = (
            float(probabilities[predicted_index]) * 100
        )

        # Identify predicted class
        class_name = class_mapping[predicted_index]

        crop_name, disease_name = class_name.split(
            "___", 1
        )

        is_healthy = disease_name.lower() == "healthy"

        # Retrieve disease-specific guidance
        guidance = get_disease_info(class_name)

        return {
            "crop_name": crop_name,

            "disease_name": disease_name.replace("_", " "),

            "confidence": round(confidence, 2),

            "status": (
                "Healthy"
                if is_healthy
                else "Disease Detected"
            ),

            "class_name": class_name,

            "guidance": guidance
        }

    except (UnidentifiedImageError, OSError) as e:

        raise ValueError(
            f"Unable to process image: {str(e)}"
        )
