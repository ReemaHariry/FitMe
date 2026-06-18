"""
User Profile Routes

Handles user profile management and onboarding completion.
"""

from fastapi import APIRouter, HTTPException, Header, Depends, status
from pydantic import BaseModel, Field
from typing import Optional
from app.services.supabase_service import (
    get_supabase_client,
    save_profile,
    get_profile,
    verify_token
)


# ============================================================================
# PYDANTIC MODELS
# ============================================================================

class ProfileUpdateRequest(BaseModel):
    """Request body for updating user profile (onboarding data)"""
    gender: str = Field(..., pattern="^(male|female)$", description="User's gender")
    age: int = Field(..., ge=13, le=100, description="User's age")
    height: float = Field(..., ge=100, le=250, description="Height in cm")
    weight: float = Field(..., ge=30, le=300, description="Weight in kg")
    fitness_goal: str = Field(..., pattern="^(lose_weight|build_muscle|maintain)$")
    training_days_per_week: int = Field(..., ge=1, le=7)
    preferred_workout_duration: int = Field(..., ge=15, le=180, description="Duration in minutes")


class ProfileResponse(BaseModel):
    """Response after saving profile"""
    message: str
    onboarding_complete: bool


class ProfileDataResponse(BaseModel):
    """Full profile data response"""
    id: str
    user_id: str
    full_name: Optional[str]
    gender: Optional[str]
    age: Optional[int]
    height: Optional[float]
    weight: Optional[float]
    fitness_goal: Optional[str]
    training_days_per_week: Optional[int]
    preferred_workout_duration: Optional[int]
    onboarding_complete: bool


# ============================================================================
# DEPENDENCY: Get Current User
# ============================================================================

async def get_current_user(authorization: Optional[str] = Header(None)) -> dict:
    """
    Dependency to extract and verify the current user from JWT token.
    
    This is reusable across all protected endpoints.
    
    Args:
        authorization: Authorization header with Bearer token
        
    Returns:
        dict: User data from token
        
    Raises:
        HTTPException: If token is missing, invalid, or expired
    """
    if not authorization:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required"
        )
    
    parts = authorization.split()
    if len(parts) != 2 or parts[0].lower() != "bearer":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication token format"
        )
    
    token = parts[1]
    user_data = verify_token(token)
    
    if not user_data:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Session expired, please log in again"
        )
    
    return user_data


# ============================================================================
# ROUTER SETUP
# ============================================================================

router = APIRouter(
    prefix="/users",
    tags=["Users"]
)


# ============================================================================
# ENDPOINT: POST /users/profile
# ============================================================================

@router.post("/profile", response_model=ProfileResponse)
async def update_profile(
    data: ProfileUpdateRequest,
    current_user: dict = Depends(get_current_user)
):
    """
    Save or update user profile with onboarding data.
    
    This endpoint:
    1. Takes all onboarding form data
    2. Saves it to the profiles table
    3. Sets onboarding_complete = True
    4. Returns success message
    
    Uses upsert pattern: creates profile if doesn't exist, updates if it does.
    
    Requires: Authorization header with valid Bearer token
    """
    try:
        user_id = current_user["id"]
        
        # Prepare profile data
        profile_data = {
            "full_name": current_user.get("user_metadata", {}).get("full_name"),
            "gender": data.gender,
            "age": data.age,
            "height": data.height,
            "weight": data.weight,
            "fitness_goal": data.fitness_goal,
            "training_days_per_week": data.training_days_per_week,
            "preferred_workout_duration": data.preferred_workout_duration,
            "onboarding_complete": True,
        }
        
        # Save to database
        save_profile(user_id, profile_data)
        
        return ProfileResponse(
            message="Profile saved successfully",
            onboarding_complete=True
        )
        
    except Exception as e:
        print(f"Profile save error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to save profile. Please try again."
        )


# ============================================================================
# ENDPOINT: GET /users/profile
# ============================================================================

@router.get("/profile", response_model=ProfileDataResponse)
async def get_user_profile(current_user: dict = Depends(get_current_user)):
    """
    Get current user's profile data.
    
    Returns all profile fields from the profiles table.
    
    Requires: Authorization header with valid Bearer token
    """
    try:
        user_id = current_user["id"]
        
        # Fetch profile from database
        profile = get_profile(user_id)
        
        if not profile:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Profile not found"
            )
        
        return ProfileDataResponse(**profile)
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Profile fetch error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch profile"
        )
