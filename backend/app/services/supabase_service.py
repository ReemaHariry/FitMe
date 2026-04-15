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


# ============================================================================
# REPORTS MANAGEMENT FUNCTIONS
# ============================================================================

def get_user_reports(user_id: str) -> list:
    """
    Get all reports for a user with session details.
    
    This performs a JOIN between reports and exercise_sessions tables
    to get complete information for each report.
    
    Args:
        user_id: UUID of the user
        
    Returns:
        List of report summary dicts, ordered by generated_at DESC
    """
    try:
        supabase = get_supabase_client()
        
        # First, get all reports for the user
        reports_result = supabase.table("reports").select(
            "id, session_id, exercise_type, form_score, performance_rating, total_mistakes, generated_at"
        ).eq("user_id", user_id).order("generated_at", desc=True).execute()
        
        print(f"DEBUG: Reports result: {reports_result.data}")
        
        # Then, for each report, get the session details
        reports = []
        for report in reports_result.data:
            session_id = report.get("session_id")
            
            # Fetch session details
            session_result = supabase.table("exercise_sessions").select(
                "session_name, duration_seconds"
            ).eq("id", session_id).execute()
            
            session = session_result.data[0] if session_result.data else {}
            
            reports.append({
                "id": report["id"],
                "session_id": report["session_id"],
                "exercise_type": report["exercise_type"],
                "form_score": report["form_score"],
                "performance_rating": report["performance_rating"],
                "total_mistakes": report["total_mistakes"],
                "duration_seconds": session.get("duration_seconds", 0),
                "session_name": session.get("session_name", "Unknown Session"),
                "generated_at": report["generated_at"],
                "created_at": report["generated_at"]  # Use generated_at for created_at
            })
        
        print(f"DEBUG: Final reports: {reports}")
        return reports
        
    except Exception as e:
        print(f"ERROR in get_user_reports: {str(e)}")
        print(f"ERROR type: {type(e)}")
        import traceback
        traceback.print_exc()
        raise


def get_report_by_id(report_id: str, user_id: str) -> Optional[Dict[str, Any]]:
    """
    Get a single report by ID with full details.
    
    SECURITY CHECK: Verifies the report belongs to the requesting user.
    This prevents users from accessing other users' reports.
    
    Args:
        report_id: UUID of the report
        user_id: UUID of the user (for security check)
        
    Returns:
        Dict containing full report data with nested session info, or None if not found
        
    Raises:
        Exception: If report doesn't belong to user (security violation)
    """
    supabase = get_supabase_client()
    
    # Fetch report with session details
    result = supabase.table("reports").select(
        """
        id,
        session_id,
        full_report,
        exercise_type,
        form_score,
        performance_rating,
        total_mistakes,
        generated_at,
        user_id,
        exercise_sessions!inner(
            session_name,
            duration_seconds,
            started_at,
            ended_at
        )
        """
    ).eq("id", report_id).execute()
    
    if not result.data or len(result.data) == 0:
        return None
    
    report = result.data[0]
    
    # SECURITY CHECK: Verify ownership
    if report["user_id"] != user_id:
        raise Exception("Unauthorized: Report does not belong to this user")
    
    # Extract session data
    session = report.get("exercise_sessions", {})
    
    # Return structured response
    return {
        "id": report["id"],
        "session_id": report["session_id"],
        "full_report": report["full_report"],
        "exercise_type": report["exercise_type"],
        "form_score": report["form_score"],
        "performance_rating": report["performance_rating"],
        "total_mistakes": report["total_mistakes"],
        "generated_at": report["generated_at"],
        "session": {
            "session_name": session.get("session_name", "Unknown Session"),
            "duration_seconds": session.get("duration_seconds", 0),
            "started_at": session.get("started_at"),
            "ended_at": session.get("ended_at")
        }
    }


def create_session(
    user_id: str,
    exercise_type: str,
    session_name: str,
    duration_seconds: float,
    form_score: int,
    performance_rating: str,
    total_mistakes: int,
    total_frames_processed: int,
    started_at: str,
    ended_at: str
) -> str:
    """
    Create a new exercise session record.
    
    This will be called by the AI pipeline when a workout session completes.
    
    Args:
        user_id: UUID of the user
        exercise_type: Type of exercise (e.g., "squat", "pushup")
        session_name: Human-readable session name
        duration_seconds: Total duration in seconds
        form_score: Overall form score (0-100)
        performance_rating: Rating (excellent/good/fair/needs_improvement)
        total_mistakes: Total number of mistakes detected
        total_frames_processed: Number of video frames analyzed
        started_at: ISO timestamp when session started
        ended_at: ISO timestamp when session ended
        
    Returns:
        str: UUID of the created session
    """
    supabase = get_supabase_client()
    
    session_data = {
        "user_id": user_id,
        "exercise_type": exercise_type,
        "session_name": session_name,
        "duration_seconds": duration_seconds,
        "form_score": form_score,
        "performance_rating": performance_rating,
        "total_mistakes": total_mistakes,
        "total_frames_processed": total_frames_processed,
        "status": "completed",
        "started_at": started_at,
        "ended_at": ended_at
    }
    
    result = supabase.table("exercise_sessions").insert(session_data).execute()
    
    if result.data and len(result.data) > 0:
        return result.data[0]["id"]
    else:
        raise Exception("Failed to create session")


def create_report(
    session_id: str,
    user_id: str,
    report: Dict[str, Any],
    exercise_type: str,
    form_score: int,
    performance_rating: str,
    total_mistakes: int
) -> str:
    """
    Create a new report record.
    
    This stores the complete ReportGenerator output in the full_report JSONB field.
    
    Args:
        session_id: UUID of the exercise session
        user_id: UUID of the user
        report: Complete report dict from ReportGenerator.generate_report()
        exercise_type: Type of exercise
        form_score: Overall form score (0-100)
        performance_rating: Rating (excellent/good/fair/needs_improvement)
        total_mistakes: Total number of mistakes
        
    Returns:
        str: UUID of the created report
    """
    supabase = get_supabase_client()
    
    report_data = {
        "session_id": session_id,
        "user_id": user_id,
        "full_report": report,  # JSONB field - stores entire report structure
        "exercise_type": exercise_type,
        "form_score": form_score,
        "performance_rating": performance_rating,
        "total_mistakes": total_mistakes
    }
    
    result = supabase.table("reports").insert(report_data).execute()
    
    if result.data and len(result.data) > 0:
        return result.data[0]["id"]
    else:
        raise Exception("Failed to create report")


def get_user_stats(user_id: str) -> Dict[str, Any]:
    """
    Get aggregate statistics for a user across all sessions.
    
    This calculates:
    - Total number of completed sessions
    - Total minutes trained
    - Average form score across all sessions
    - Most practiced exercise type
    
    Args:
        user_id: UUID of the user
        
    Returns:
        Dict containing aggregate stats
    """
    supabase = get_supabase_client()
    
    # Fetch all completed sessions for the user
    result = supabase.table("exercise_sessions").select(
        "duration_seconds, form_score, exercise_type"
    ).eq("user_id", user_id).eq("status", "completed").execute()
    
    sessions = result.data
    
    if not sessions or len(sessions) == 0:
        return {
            "total_sessions": 0,
            "total_minutes": 0,
            "average_form_score": None,
            "best_exercise": None
        }
    
    # Calculate total sessions
    total_sessions = len(sessions)
    
    # Calculate total minutes
    total_seconds = sum(s.get("duration_seconds", 0) for s in sessions)
    total_minutes = round(total_seconds / 60, 1)
    
    # Calculate average form score (only for sessions with scores)
    scores = [s["form_score"] for s in sessions if s.get("form_score") is not None]
    average_form_score = round(sum(scores) / len(scores), 1) if scores else None
    
    # Find most common exercise type
    exercise_counts = {}
    for session in sessions:
        ex_type = session.get("exercise_type")
        if ex_type:
            exercise_counts[ex_type] = exercise_counts.get(ex_type, 0) + 1
    
    best_exercise = max(exercise_counts, key=exercise_counts.get) if exercise_counts else None
    
    return {
        "total_sessions": total_sessions,
        "total_minutes": total_minutes,
        "average_form_score": average_form_score,
        "best_exercise": best_exercise
    }
