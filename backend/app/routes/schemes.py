
from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel, Field, HttpUrl
from typing import Optional
from app.database.supabase_client import supabase

router = APIRouter(
    prefix="/schemes",
    tags=["Government Schemes"]
)


# Request model
class SchemeCreate(BaseModel):
    scheme_name: str = Field(..., min_length=3)
    scheme_code: Optional[str] = None
    description: Optional[str] = None
    ministry: Optional[str] = None

    scheme_level: str = Field(
        ...,
        pattern="^(Central|State)$"
    )

    state: Optional[str] = None
    eligibility: Optional[str] = None
    benefits: Optional[str] = None
    official_url: Optional[HttpUrl] = None


# 1. Add a government scheme
@router.post("/add")
def add_scheme(scheme: SchemeCreate):

    try:
        scheme_data = scheme.model_dump(
            mode="json",
            exclude_none=True
        )

        response = (
            supabase
            .table("government_schemes")
            .insert(scheme_data)
            .execute()
        )

        return {
            "success": True,
            "message": "Government scheme added successfully!",
            "data": response.data
        }

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )


# 2. Get all active schemes
@router.get("/")
def get_schemes():

    try:
        response = (
            supabase
            .table("government_schemes")
            .select("*")
            .eq("is_active", True)
            .execute()
        )

        return {
            "success": True,
            "total_schemes": len(response.data),
            "data": response.data
        }

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )


# 3. Search schemes by name

@router.get("/search")
def search_schemes(name: str):
    try:
        response = (
            supabase.table("government_schemes")
            .select("*")
            .eq("is_active", True)
            .or_(
                f"scheme_name.ilike.%{name}%,scheme_code.ilike.%{name}%"
            )
            .execute()
        )

        return {
            "success": True,
            "total_schemes": len(response.data),
            "data": response.data
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# 4. Filter schemes by state
@router.get("/state/{state_name}")
def get_state_schemes(state_name: str):

    try:
        response = (
            supabase
            .table("government_schemes")
            .select("*")
            .eq("is_active", True)
            .or_(
                f"scheme_level.eq.Central,state.eq.{state_name}"
            )
            .execute()
        )

        return {
            "success": True,
            "state": state_name,
            "total_schemes": len(response.data),
            "data": response.data
        }

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )
