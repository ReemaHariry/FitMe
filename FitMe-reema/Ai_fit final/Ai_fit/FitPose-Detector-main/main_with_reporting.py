"""
Enhanced main.py with Session Reporting
Integrates session tracking, mistake classification, and report generation.
"""
import os
# Suppress TensorFlow logging
os.environ["TF_CPP_MIN_LOG_LEVEL"] = "3"  # FATAL
# Suppress MediaPipe logging
os.environ["MEDIAPIPE_DISABLE_GPU"] = "1"

import cv2
import mediapipe as mp
import numpy as np
import tensorflow as tf
import logging
import json
from datetime import datetime

# Import form checking
from form_checks import check_pushup_form, check_squat_form, check_situp_form

# ✅ NEW: Import session tracking modules
from session_tracker import SessionTracker
from mistake_classifier import MistakeClassifier
from report_generator import ReportGenerator

# Configure logging
logging.getLogger("tensorflow").setLevel(logging.ERROR)
logging.getLogger("mediapipe").setLevel(logging.ERROR)


def init_mediapipe():
    mp_drawing = mp.solutions.drawing_utils
    mp_drawing_styles = mp.solutions.drawing_styles
    mp_holistic = mp.solutions.holistic
    return mp_drawing, mp_drawing_styles, mp_holistic


def load_model_and_labels(model_dir="./trained_pose_model"):
    """Load trained model and labels."""
    try:
        model_path = os.path.join(model_dir, "best_model.keras")
        model = tf.keras.models.load_model(model_path)

        labels = np.load(os.path.join(model_dir, "label_encoder.npy"), allow_pickle=True)
        labels = np.array([str(x) for x in labels], dtype=object)
        return model, labels
    except Exception as e:
        print(f"Error loading model: {str(e)}")
        return None, None


def extract_pose_features(results):
    """Extract pose features from MediaPipe results."""
    if results.pose_landmarks:
        landmarks = []
        for landmark in results.pose_landmarks.landmark:
            landmarks.extend([landmark.x, landmark.y, landmark.z])
        return np.array(landmarks, dtype=np.float32)
    return None


def process_frame(
    frame,
    holistic,
    mp_drawing,
    mp_drawing_styles,
    mp_holistic,
    model,
    labels,
    feature_buffer,
    session_tracker,  # ✅ NEW: Pass session tracker
    frame_number,     # ✅ NEW: Track frame number
    start_time,       # ✅ NEW: Session start time for timestamps
    sequence_length=50,
):
    """
    Process frame with integrated session tracking.
    """
    if frame is None:
        return None

    # Resize for faster processing
    frame_small = cv2.resize(frame, (520, 300))
    frame_rgb = cv2.cvtColor(frame_small, cv2.COLOR_BGR2RGB)
    results = holistic.process(frame_rgb)

    # Draw skeleton
    mp_drawing.draw_landmarks(
        frame_small,
        results.pose_landmarks,
        mp_holistic.POSE_CONNECTIONS,
        landmark_drawing_spec=mp_drawing_styles.get_default_pose_landmarks_style(),
    )

    # Default values
    predicted_class = None
    confidence = None
    feedback = None

    # Perform pose recognition
    if results.pose_landmarks and model is not None and labels is not None:
        features = extract_pose_features(results)
        if features is not None:
            feature_buffer.append(features)

            # Maintain buffer size
            if len(feature_buffer) > sequence_length:
                feature_buffer.pop(0)

            # Predict only when buffer is full
            if len(feature_buffer) == sequence_length:
                input_features = np.array(feature_buffer, dtype=np.float32).reshape(
                    1, sequence_length, -1
                )
                prediction = model.predict(input_features, verbose=0)

                idx = int(np.argmax(prediction[0]))
                confidence = float(np.max(prediction[0]))
                predicted_class = str(labels[idx])

                # Display exercise prediction
                text = f"{predicted_class}: {confidence:.2f}"
                cv2.putText(
                    frame_small,
                    text,
                    (10, 30),
                    cv2.FONT_HERSHEY_SIMPLEX,
                    0.9,
                    (0, 255, 0),
                    2,
                )

                # ✅ Posture feedback with session tracking
                h, w = frame_small.shape[:2]
                cls = predicted_class.lower().replace(" ", "").replace("-", "_")

                if "push" in cls:
                    feedback, _metrics = check_pushup_form(results, w, h)
                elif "squat" in cls:
                    feedback, _metrics = check_squat_form(results, w, h)
                elif "sit" in cls:
                    feedback, _metrics = check_situp_form(results, w, h)
                else:
                    feedback = None

                # ✅ NEW: Track mistakes in session
                if feedback and "Bad Form" in feedback:
                    # Calculate timestamp
                    timestamp = (datetime.now() - start_time).total_seconds()
                    
                    # Classify the mistake
                    mistake_type, mistake_message, severity = MistakeClassifier.classify_feedback(
                        feedback, predicted_class
                    )
                    
                    if mistake_type:  # Only record if it's an actual mistake
                        session_tracker.record_mistake(
                            timestamp=timestamp,
                            frame_number=frame_number,
                            exercise_type=predicted_class,
                            mistake_type=mistake_type,
                            mistake_message=mistake_message,
                            severity=severity
                        )

                # Show feedback on frame
                if feedback:
                    color = (0, 255, 0) if "Good Form" in feedback else (0, 0, 255)
                    cv2.putText(
                        frame_small,
                        feedback,
                        (10, 70),
                        cv2.FONT_HERSHEY_SIMPLEX,
                        0.75,
                        color,
                        2,
                    )
            else:
                # Buffer not full yet
                cv2.putText(
                    frame_small,
                    f"Buffer: {len(feature_buffer)}/{sequence_length}",
                    (10, 30),
                    cv2.FONT_HERSHEY_SIMPLEX,
                    0.8,
                    (0, 255, 255),
                    2,
                )
    else:
        # No pose detected
        cv2.putText(
            frame_small,
            "No pose detected",
            (10, 30),
            cv2.FONT_HERSHEY_SIMPLEX,
            0.8,
            (0, 0, 255),
            2,
        )

    # ✅ NEW: Increment frame counter
    session_tracker.increment_frame_count()

    # Upscale for display
    frame_out = cv2.resize(frame_small, (1280, 960))
    return frame_out


def save_report_to_file(report: dict, filename: str = None):
    """Save report to JSON file."""
    if filename is None:
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"session_report_{timestamp}.json"
    
    with open(filename, 'w') as f:
        json.dump(report, f, indent=2)
    
    print(f"\n✅ Report saved to: {filename}")


def print_report_summary(report: dict):
    """Print a formatted summary of the report to console."""
    print("\n" + "="*60)
    print("SESSION REPORT SUMMARY")
    print("="*60)
    
    # Session info
    info = report["session_info"]
    print(f"\nSession: {info['session_name']}")
    print(f"Exercise: {info['exercise_detected']}")
    print(f"Duration: {info['duration_formatted']}")
    print(f"Frames Processed: {info['total_frames_processed']}")
    
    # Overall summary
    overall = report["overall_summary"]
    print(f"\nPerformance: {overall['performance_rating'].upper()}")
    print(f"{overall['message']}")
    
    # Statistics
    stats = report["statistics"]
    print(f"\nTotal Mistakes: {stats['total_mistakes']}")
    print(f"Unique Mistake Types: {stats['unique_mistake_types']}")
    
    # Mistakes detail
    if report["mistakes"]:
        print("\n" + "-"*60)
        print("MISTAKES DETECTED:")
        print("-"*60)
        
        for i, mistake in enumerate(report["mistakes"], 1):
            print(f"\n{i}. {mistake['mistake_message']}")
            print(f"   Occurred: {mistake['count']} time(s)")
            print(f"   First seen: {mistake['first_seen_at']}")
            print(f"   Last seen: {mistake['last_seen_at']}")
            print(f"   Severity: {mistake['severity'].upper()}")
            
            if mistake.get('warning'):
                warning = mistake['warning']
                print(f"\n   ⚠️  WARNING ({warning['level'].upper()}):")
                print(f"   {warning['message']}")
            
            print(f"\n   💡 Correction Tip:")
            print(f"   {mistake['correction_tip']}")
    else:
        print("\n✅ No form issues detected - Perfect session!")
    
    print("\n" + "="*60)


def main():
    # ----------------------------
    # CONFIGURATION
    # ----------------------------
    VIDEO_PATH = "test_videos/squats.mp4"
    # For webcam: VIDEO_PATH = 0
    
    SESSION_NAME = "Morning Squat Practice"  # Optional: name your session
    USER_ID = "user_123"  # In production, this comes from authentication
    # ----------------------------

    print("Initializing FitPose with Session Reporting...")
    
    mp_drawing, mp_drawing_styles, mp_holistic = init_mediapipe()
    model, labels = load_model_and_labels()
    
    if model is None or labels is None:
        print("Could not load model/labels. Will only show skeleton tracking.")

    cap = cv2.VideoCapture(VIDEO_PATH)
    if not cap.isOpened():
        print(f"Cannot open video source: {VIDEO_PATH}")
        return

    # Get video properties
    fps = cap.get(cv2.CAP_PROP_FPS)
    if fps is None or fps <= 0:
        fps = 30.0
    wait_ms = max(1, int(1000 / fps))

    # ✅ NEW: Initialize session tracker
    session_id = f"session_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
    session_tracker = SessionTracker(
        session_id=session_id,
        user_id=USER_ID
    )
    session_tracker.start_session(session_name=SESSION_NAME)
    start_time = datetime.now()
    
    print(f"Session started: {session_id}")
    print("Press SPACE to pause/resume, ESC or Q to quit and generate report\n")

    feature_buffer = []
    paused = False
    frame_number = 0

    with mp_holistic.Holistic(
        min_detection_confidence=0.5,
        min_tracking_confidence=0.5,
    ) as holistic:
        while True:
            if not paused:
                ret, frame = cap.read()
                if not ret:
                    print("\nEnd of video.")
                    break

                processed_frame = process_frame(
                    frame,
                    holistic,
                    mp_drawing,
                    mp_drawing_styles,
                    mp_holistic,
                    model,
                    labels,
                    feature_buffer,
                    session_tracker,  # ✅ Pass tracker
                    frame_number,     # ✅ Pass frame number
                    start_time,       # ✅ Pass start time
                    sequence_length=50,
                )

                if processed_frame is None:
                    break

                cv2.imshow("Exercise Recognition + Form Feedback", processed_frame)
                frame_number += 1

            key = cv2.waitKey(wait_ms) & 0xFF

            # SPACE pause/resume
            if key == 32:
                paused = not paused
            # ESC or Q quit
            elif key == 27 or key == ord("q"):
                break

    cap.release()
    cv2.destroyAllWindows()

    # ✅ NEW: End session and generate report
    print("\nGenerating session report...")
    session_tracker.end_session()
    
    # Get session summary
    session_data = session_tracker.get_session_summary()
    
    # Generate comprehensive report
    report = ReportGenerator.generate_report(session_data)
    
    # Print summary to console
    print_report_summary(report)
    
    # Save to file
    save_report_to_file(report)
    
    # Also print quick summary
    quick_summary = ReportGenerator.generate_quick_summary(session_data)
    print(f"\nQuick Summary: {quick_summary}")


if __name__ == "__main__":
    main()
