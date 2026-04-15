"""
Supabase Service Module

This is the single source of truth for Supabase client initialization.
All database and auth operations go through this service.

Why centralize this?
- Single client instance prevents connection issues
- Easy to mock for testing
- Consistent error handling
- One place to update if Supabase config changes
"""

from supabase import create_client, Client
from typing import Optional, Dict, Any
from app.config import settings


# ============================================================================
# SUPABASE CLIENT INITIALIZATION
# ============================================================================

# Global client instance (initialized once)
_supabase_client: Optional[Client] = None


def get_supabase_client() -> Client:
    """
    Get or create the Supabase client instance.
    
    This uses the SERVICE ROLE KEY which bypasses Row Level Security.
    Use this for server-side operations only - never expose this key to frontend!
    
    Returns:
        Client: Initialized Supabase client
        
    Raises:
        ValueError: If Supabase credentials are not configured
    """
    global _supabase_client
    
    if _supabase_client is None:
        if not settings.supabase_url or not settings.supabase_service_key:
            raise ValueError(
                "Supabase credentials not configured. "
                "Please set SUPABASE_URL and SUPABASE_SERVICE_KEY in .env file"
            )
        
        # Create client with positional arguments (compatible with all versions)
        _supabase_client = create_client(
            settings.supabase_url,
            settings.supabase_service_key
        )
    
    return _supabase_client


# ============================================================================
# PROFILE MANAGEMENT FUNCTIONS
# ============================================================================

def save_profile(user_id: str, profile_data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Save or update user profile in the profiles table.
    
    Uses upsert pattern: if profile exists, update it; if not, create it.
    
    Args:
        user_id: UUID of the user
        profile_data: Dictionary containing profile fields
        
    Returns:
        Dict containing the saved profile data
        
    Raises:
        Exception: If database operation fails
    """
    supabase = get_supabase_client()
    
    # Prepare data for database
    db_data = {
        "user_id": user_id,
        "full_name": profile_data.get("full_name"),
        "gender": profile_data.get("gender"),
        "age": profile_data.get("age"),
        "height": profile_data.get("height"),
        "weight": profile_data.get("weight"),
        "fitness_goal": profile_data.get("fitness_goal"),
        "training_days_per_week": profile_data.get("training_days_per_week"),
        "preferred_workout_duration": profile_data.get("preferred_workout_duration"),
        "onboarding_complete": profile_data.get("onboarding_complete", True),
    }
    
    # Upsert: insert or update if exists
    # on_conflict tells Supabase which field to check for conflicts
    result = supabase.table("profiles").upsert(
        db_data,
        on_conflict="user_id"
    ).execute()
    
    if result.data:
        return result.data[0]
    else:
        raise Exception("Failed to save profile")


def get_profile(user_id: str) -> Optional[Dict[str, Any]]:
    """
    Fetch user profile from the profiles table.
    
    Args:
        user_id: UUID of the user
        
    Returns:
        Dict containing profile data, or None if not found
    """
    supabase = get_supabase_client()
    
    result = supabase.table("profiles").select("*").eq("user_id", user_id).execute()
    
    if result.data and len(result.data) > 0:
        return result.data[0]
    return None


def update_onboarding_status(user_id: str, complete: bool) -> Dict[str, Any]:
    """
    Update only the onboarding_complete flag for a user.
    
    Args:
        user_id: UUID of the user
        complete: True if onboarding is complete, False otherwise
        
    Returns:
        Dict containing updated profile data
        
    Raises:
        Exception: If update fails
    """
    supabase = get_supabase_client()
    
    result = supabase.table("profiles").update({
        "onboarding_complete": complete
    }).eq("user_id", user_id).execute()
    
    if result.data:
        return result.data[0]
    else:
        raise Exception("Failed to update onboarding status")


# ============================================================================
# AUTHENTICATION HELPER FUNCTIONS
# ============================================================================

def verify_token(token: str) -> Optional[Dict[str, Any]]:
    """
    Verify a JWT token and return the user data.
    
    This calls Supabase's get_user() which:
    - Validates the token signature
    - Checks if token is expired
    - Returns the user object if valid
    
    Args:
        token: JWT access token from Authorization header
        
    Returns:
        Dict containing user data if valid, None if invalid
    """
    try:
        supabase = get_supabase_client()
        response = supabase.auth.get_user(token)
        
        if response and response.user:
            return {
                "id": response.user.id,
                "email": response.user.email,
                "user_metadata": response.user.user_metadata or {}
            }
        return None
    except Exception as e:
        print(f"Token verification failed: {str(e)}")
        return None
