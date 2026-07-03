"""
Pose Utility Functions
Shared utilities for pose detection and feature extraction.
"""
import numpy as np
import mediapipe as mp


def extract_pose_features(results) -> np.ndarray | None:
    """
    Extract pose features from MediaPipe Holistic results.

    Args:
        results: MediaPipe Holistic results object

    Returns:
        np.ndarray of shape (99,) containing x,y,z coordinates for 33 landmarks
        OR None if no pose detected
    """
    if results.pose_landmarks is None:
        return None

    # Extract x, y, z for all 33 pose landmarks
    features = []
    for landmark in results.pose_landmarks.landmark:
        features.extend([landmark.x, landmark.y, landmark.z])

    return np.array(features, dtype=np.float32)


def init_mediapipe() -> tuple:
    """
    Initialize MediaPipe Holistic components.

    Returns:
        Tuple of (holistic_class, drawing_utils, drawing_styles)
    """
    holistic_class = mp.solutions.holistic.Holistic
    drawing_utils = mp.solutions.drawing_utils
    drawing_styles = mp.solutions.drawing_styles

    return holistic_class, drawing_utils, drawing_styles


def calculate_form_score(report: dict, total_frames: int) -> int:
    """
    Calculate a numeric form score (0-100) from the report.

    Since ReportGenerator does not produce a numeric form_score,
    we calculate it based on mistake frequency and performance rating.

    Args:
        report: Complete report dict from ReportGenerator
        total_frames: Total frames processed in the session

    Returns:
        Integer form score from 0 to 100
    """
    # Check if this is a "no pose detected" report
    if report.get("no_pose_detected"):
        return 0  # Return 0 score for sessions with no pose detected

    # Single source of truth: use the score computed by ReportGenerator.
    # The rating is derived FROM this score, so no bucket-clamping is needed.
    overall = report.get("overall_summary", {})
    stored = overall.get("form_score")
    if isinstance(stored, int):
        return stored

    # Fallback (older reports without a stored score): same canonical formula.
    total_mistakes = report["statistics"]["total_mistakes"]
    if total_frames <= 0:
        return 100
    mistake_ratio = total_mistakes / max(total_frames, 1)
    return max(0, min(100, int(100 - (mistake_ratio * 500))))
