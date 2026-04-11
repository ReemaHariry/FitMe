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

# ✅ NEW: import posture feedback functions (you create form_checks.py)
from form_checks import check_pushup_form, check_squat_form, check_situp_form

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
        # Make sure labels are normal python strings
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
    sequence_length=50,
):
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

    # Default text
    predicted_class = None
    confidence = None
    feedback = None

    # Perform pose recognition only if pose exists and model loaded
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

                # ✅ Display exercise prediction
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

                # ✅ NEW: Posture feedback (rule-based)
                h, w = frame_small.shape[:2]

                # handle label variations
                cls = predicted_class.lower().replace(" ", "").replace("-", "_")

                if "push" in cls:  # push_up
                    feedback, _metrics = check_pushup_form(results, w, h)
                elif "squat" in cls:
                    feedback, _metrics = check_squat_form(results, w, h)
                elif "sit" in cls:  # sit_up
                    feedback, _metrics = check_situp_form(results, w, h)
                else:
                    feedback = None

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
                # Buffer not full yet -> tell user
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

    # Upscale for display
    frame_out = cv2.resize(frame_small, (1280, 960))
    return frame_out


def main():
    # ----------------------------
    # CHANGE THIS PATH IF NEEDED
    # ----------------------------
    VIDEO_PATH = "test_videos/squats.mp4"
    # Webcam option:
    # VIDEO_PATH = 0
    # ----------------------------

    mp_drawing, mp_drawing_styles, mp_holistic = init_mediapipe()

    model, labels = load_model_and_labels()
    if model is None or labels is None:
        print("Could not load model/labels. Will only show skeleton tracking.")

    cap = cv2.VideoCapture(VIDEO_PATH)
    if not cap.isOpened():
        print(f"Cannot open video source: {VIDEO_PATH}")
        return

    # natural speed
    fps = cap.get(cv2.CAP_PROP_FPS)
    if fps is None or fps <= 0:
        fps = 30.0
    wait_ms = max(1, int(1000 / fps))

    feature_buffer = []
    paused = False

    with mp_holistic.Holistic(
        min_detection_confidence=0.5,
        min_tracking_confidence=0.5,
    ) as holistic:
        while True:
            if not paused:
                ret, frame = cap.read()
                if not ret:
                    print("End of video or cannot read frame.")
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
                    sequence_length=50,
                )

                if processed_frame is None:
                    break

                cv2.imshow("Exercise Recognition + Form Feedback", processed_frame)

            key = cv2.waitKey(wait_ms) & 0xFF

            # SPACE pause/resume
            if key == 32:
                paused = not paused
            # ESC or Q quit
            elif key == 27 or key == ord("q"):
                break

    cap.release()
    cv2.destroyAllWindows()


if __name__ == "__main__":
    main()
