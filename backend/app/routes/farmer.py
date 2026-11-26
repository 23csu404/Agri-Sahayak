
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from app.database.supabase_client import supabase

router = APIRouter(prefix="/farmers", tags=["Farmers"])


# Farmer registration request model
class FarmerCreate(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    phone: str = Field(..., min_length=10, max_length=15)
    state: str
    district: str
    preferred_language: str = "Hindi"


# Register a new farmer
@router.post("/register")
def register_farmer(farmer: FarmerCreate):

    try:
        farmer_data = {
            "name": farmer.name,
            "phone": farmer.phone,
            "state": farmer.state,
            "district": farmer.district,
            "preferred_language": farmer.preferred_language
        }


        response = supabase.table("farmers").insert(
        farmer_data,
        returning="minimal"
        ).execute()

        return {
            "success": True,
            "message": "Farmer registered successfully!",
            "data": response.data
        }

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )
from uuid import UUID

# Get farmer profile by ID
@router.get("/{farmer_id}")
def get_farmer(farmer_id: UUID):

    try:
        response = (
            supabase
            .table("farmers")
            .select("id, name, preferred_language, state, district, created_at")
            .eq("id", str(farmer_id))
            .execute()
        )

        if not response.data:
            raise HTTPException(
                status_code=404,
                detail="Farmer not found"
            )

        return {
            "success": True,
            "data": response.data[0]
        }

    except HTTPException:
        raise

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )