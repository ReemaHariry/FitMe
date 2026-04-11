O_PATH = 0                           # webcam
```

### Controls
| Key | Action |
|-----|--------|
| `SPACE` | Pause / Resume |
| `Q` or `ESC` | Quit |
 the Project

### Prerequisites
- Python 3.10
- Virtual environment at `../grad/` (relative to `FitPose-Detector-main/`)

### Install dependencies
```cmd
..\grad\Scripts\pip.exe install -r requirements.txt
..\grad\Scripts\pip.exe install "numpy==1.26.4" --force-reinstall --no-deps
```

### Run inference
From inside `FitPose-Detector-main/`:
```cmd
..\grad\Scripts\python.exe main.py
```

### Switch video
Edit line in `main.py`:
```python
VIDEO_PATH = "test_videos/pushup.mp4"   # or situp.mp4, squats.mp4
VIDEhoulder_hip_dx > 120 pixels`) are defined in pixel space and depend on the frame resolution (520×300 in this case).

### Why `best_model.keras` and not `lstm_model.keras`?
`best_model.keras` is saved by `ModelCheckpoint` whenever validation loss improves during training. `lstm_model.keras` is saved at the very end of training regardless of performance. The best checkpoint is used for inference because it represents the model state with the lowest overfitting, not necessarily the last epoch.

---

## Runninger time. The 50-frame buffer captures roughly 1.5–2 seconds of movement (at 25–30 FPS), which is enough to observe one full repetition of most exercises. The LSTM was trained on exactly 50-frame sequences, so inference must match this exactly.

### Normalized vs Pixel Coordinates
MediaPipe returns landmark coordinates normalized to `[0.0, 1.0]` relative to the frame dimensions. `form_checks.py` converts these to pixel coordinates by multiplying by `w` and `h`. This is necessary because the angle thresholds (e.g., `sshow()
```

---

## Key Concepts Explained

### MediaPipe Holistic vs Pose
The code uses `mp.solutions.holistic` (Holistic) rather than `mp.solutions.pose` (Pose-only). Holistic detects pose, face mesh, and hand landmarks simultaneously in a single pass. For this project only `results.pose_landmarks` is used, but Holistic was chosen for potential future extension to hand/face analysis.

### Why a Sliding Window Buffer?
A single frame cannot tell you if someone is doing a squat — you need to see the motion ov
      │
      ▼ (when buffer == 50)
np.array(buffer).reshape(1, 50, 99)
      │
      ▼
LSTM model.predict()
      │
      ▼
argmax → class index → label string + confidence
      │
      ├──────────────────────────────────────────┐
      │                                          │
      ▼                                          ▼
form_checks.py                          cv2.putText(label)
(geometric angle rules)
      │
      ▼
cv2.putText(feedback)
      │
      ▼
cv2.resize(1280×960)
      │
      ▼
cv2.im
cv2.resize(520×300)
      │
      ▼
BGR → RGB conversion
      │
      ▼
MediaPipe Holistic.process()
      │
      ├──────────────────────────────────────────┐
      │                                          │
      ▼                                          ▼
pose_landmarks (33 points)              draw_landmarks()
      │                                  (skeleton overlay)
      ▼
extract_pose_features()
→ [x,y,z × 33] = 99 floats
      │
      ▼
feature_buffer.append()   ← sliding window, max 50 framesger with `min_detection_confidence=0.5` and `min_tracking_confidence=0.5`.
6. Enters the main `while True` loop:
   - Reads the next frame with `cap.read()`.
   - Calls `process_frame()`.
   - Displays with `cv2.imshow()`.
   - Calls `cv2.waitKey(wait_ms)` to pace playback and capture keyboard input.
   - `SPACE (32)` toggles `paused` flag.
   - `ESC (27)` or `Q` breaks the loop.
7. Releases the video capture and destroys all OpenCV windows on exit.

---

## Data Flow Diagram

```
Video Frame (BGR)
      │
      ▼``python
frame_out = cv2.resize(frame_small, (1280, 960))
```
The processed small frame is scaled up 2.46× for comfortable viewing.

---

#### `main()`

The main loop:

1. Sets `VIDEO_PATH = "test_videos/squats.mp4"` (change to switch videos, or use `0` for webcam).
2. Initializes MediaPipe and loads the model.
3. Opens the video with `cv2.VideoCapture(VIDEO_PATH)`.
4. Reads the video's native FPS and computes `wait_ms = 1000 / fps` to play at natural speed.
5. Creates the `mp_holistic.Holistic` context manaredicted class name is normalized (lowercased, spaces/hyphens removed) and substring-matched to route to the correct form check function. This is intentionally flexible to handle label variations like `"push_up"`, `"pushup"`, `"Push Up"`, etc.

**Step 8 — Text overlay**

Two `cv2.putText()` calls render:
1. `"squat: 0.97"` in green at position `(10, 30)` — the classification result.
2. `"Good Form"` in green or `"Bad Form: ..."` in red at position `(10, 70)` — the form feedback.

**Step 9 — Upscale for display**
`features. `model.predict()` returns a softmax probability array. `argmax` picks the highest-probability class index, and `labels[idx]` maps it back to the string name.

**Step 7 — Form check routing**
```python
cls = predicted_class.lower().replace(" ", "").replace("-", "_")
if "push" in cls:
    feedback, _metrics = check_pushup_form(results, w, h)
elif "squat" in cls:
    feedback, _metrics = check_squat_form(results, w, h)
elif "sit" in cls:
    feedback, _metrics = check_situp_form(results, w, h)
```
The p Until 50 frames are accumulated, the screen shows `"Buffer: X/50"`. Once full, every new frame triggers a prediction (the oldest frame is dropped, the newest is added).

**Step 6 — LSTM prediction**
```python
input_features = np.array(feature_buffer).reshape(1, 50, 99)
prediction = model.predict(input_features, verbose=0)
idx = int(np.argmax(prediction[0]))
confidence = float(np.max(prediction[0]))
predicted_class = str(labels[idx])
```
The buffer is reshaped to `(1, 50, 99)` — batch size 1, 50 timesteps, 99 rks(frame_small, results.pose_landmarks, mp_holistic.POSE_CONNECTIONS, ...)
```
Draws the skeleton overlay (dots at each landmark, lines connecting them) directly onto `frame_small` in-place.

**Step 5 — Feature buffer management**

The LSTM model requires a sequence of 50 frames, not a single frame. A Python list `feature_buffer` acts as a sliding window:
```python
feature_buffer.append(features)
if len(feature_buffer) > sequence_length:
    feature_buffer.pop(0)   # remove oldest frame
```
This is a FIFO queue.k to `1280×960` at the end for display.

**Step 2 — Color conversion**
```python
frame_rgb = cv2.cvtColor(frame_small, cv2.COLOR_BGR2RGB)
```
OpenCV reads frames in BGR order. MediaPipe requires RGB. This conversion is mandatory.

**Step 3 — MediaPipe Holistic inference**
```python
results = holistic.process(frame_rgb)
```
Runs the full holistic model on the frame. `results.pose_landmarks` contains the 33 body landmarks if a person is detected.

**Step 4 — Skeleton drawing**
```python
mp_drawing.draw_landmaose landmarks into a 99-float NumPy array — identical to what was done during training. This ensures the inference input matches the training data format exactly.

Returns `None` if no pose was detected in the frame.

---

#### `process_frame(...)`

The core per-frame processing function. Called once per video frame.

**Step 1 — Resize down**
```python
frame_small = cv2.resize(frame, (520, 300))
```
Processing at a smaller resolution is significantly faster for MediaPipe inference. The frame is upscaled bacweights from the training checkpoint.

Loads `label_encoder.npy` with `np.load(..., allow_pickle=True)`. The `allow_pickle=True` flag is required because the array contains Python string objects. All labels are explicitly cast to `str` to avoid any object type issues downstream.

If loading fails (file not found, version mismatch, etc.), returns `(None, None)` and the program continues in skeleton-only mode.

---

#### `extract_pose_features(results)`

Takes a MediaPipe `results` object and flattens all 33 pg TensorFlow or MediaPipe.

---

#### `init_mediapipe()`

Returns three MediaPipe solution objects:
- `mp_drawing` — utility for drawing landmarks and connections onto frames
- `mp_drawing_styles` — pre-built visual styles (colored dots and lines for the skeleton)
- `mp_holistic` — the Holistic solution class (detects pose, face, and hands simultaneously)

---

#### `load_model_and_labels(model_dir)`

Loads `best_model.keras` using `tf.keras.models.load_model()`. This restores the full model architecture and 
- If `|nose_x - shoulder_x| > 80 pixels` → head is jutting forward, straining the neck → "Don't pull your neck forward"

---

### 4. `main.py`

The **entry point and real-time inference loop**. Ties everything together.

#### Environment Setup (top of file)

```python
os.environ["TF_CPP_MIN_LOG_LEVEL"] = "3"
os.environ["MEDIAPIPE_DISABLE_GPU"] = "1"
```

Suppresses TensorFlow's verbose C++ logs and disables GPU for MediaPipe (avoids CUDA errors on machines without a compatible GPU). These must be set before importinion of the knee vs. the toe.
- If `knee_x - toe_x > 25 pixels` AND `knee_angle < 150°` (i.e., actually in a squat) → "Knees too far past toes"

---

#### `check_situp_form(results, w, h)`

Uses left shoulder, hip, knee, and nose.

**Torso angle** = `calculate_angle(shoulder, hip, knee)`
- Measures how much the torso has curled up.
- If `> 165°` → body is nearly flat, not curling enough → "Curl up more (not enough range)"

**Neck forward proxy**
- Computes horizontal pixel distance between nose and shoulder.vy)`.
- Uses `arctan2(|vx|, |vy|)` to get the angle from vertical (0° = perfectly upright, 90° = horizontal).
- If `> 55°` → "Keep chest up (too much forward lean)"

**Rounded back proxy**
- Computes horizontal pixel distance between averaged shoulder and averaged hip: `shoulder_hip_dx`.
- If `|shoulder_hip_dx| > 120 pixels` → shoulders have drifted far from hips horizontally, suggesting a rounded or collapsed back → "Avoid rounding (keep back neutral)"

**Knee past toes proxy**
- Compares the x-pixel positms are over-bent, too low → "Don't go too low"

Returns `("Good Form" | "Bad Form: ...", metrics_dict)`.

---

#### `check_squat_form(results, w, h)`

Uses both left and right landmarks, averaging them for stability (reduces noise from camera angle asymmetry).

**Knee angle** = `calculate_angle(hip, knee, ankle)`
- Measures squat depth. A standing position ≈ 170–180°. A deep squat ≈ 60–90°.
- If `< 55°` → "Control depth (too deep/unstable)"

**Torso lean angle**
- Computes the vector from hip to shoulder: `(vx, form(results, w, h)`

Extracts left-side landmarks: shoulder, hip, knee (for back), and shoulder, elbow, wrist (for arm).

**Back angle** = `calculate_angle(shoulder, hip, knee)`
- Measures how straight the body is from shoulder through hip to knee.
- A perfect plank position = ~180°.
- If `back_angle < 160°` → "Straighten your back"

**Elbow angle** = `calculate_angle(shoulder, elbow, wrist)`
- Measures arm bend.
- If `> 170°` → arms are nearly straight, not enough bend → "Bend elbows more"
- If `< 40°` → arors: ba = a - b,  bc = c - b
cos(θ) = (ba · bc) / (|ba| × |bc|)
θ = arccos(cos(θ))  →  degrees
```

`np.clip(cosang, -1.0, 1.0)` prevents domain errors in `arccos` due to floating-point imprecision. Returns `0.0` if either vector has zero length (degenerate case).

#### `_xy(landmarks, idx, w, h)`

Helper that converts a MediaPipe landmark's normalized coordinates (0.0–1.0) to pixel coordinates by multiplying by frame width `w` and height `h`. Returns a `(x_pixels, y_pixels)` tuple.

---

#### `check_pushup_ overfitting by making the model robust to lighting, angle, and scale variations.

---

### 3. `form_checks.py`

This module implements **rule-based biomechanical form analysis**. It does not use machine learning — instead it uses geometric angle calculations on the MediaPipe landmark coordinates to detect common form errors.

#### `calculate_angle(a, b, c)`

The core geometric primitive. Given three 2D points `a`, `b`, `c`, it computes the angle at vertex `b` (i.e., angle ABC) in degrees.

The math:
```
vect

---

**`augment_image(image)`** (module-level function)

Uses Albumentations to apply a randomized augmentation pipeline:
- `HorizontalFlip(p=0.5)` — mirrors the image 50% of the time
- `Rotate(limit=15, p=0.5)` — random rotation up to ±15°
- `RandomBrightnessContrast(p=0.3)` — random brightness/contrast shift
- `ShiftScaleRotate(...)` — combined shift, scale, rotate
- `HueSaturationValue(...)` — color jitter
- `GaussianBlur(blur_limit=(3,7), p=0.3)` — random blur

This increases dataset diversity and reducesin_test_split`.
4. Creates the LSTM model.
5. Adds two callbacks:
   - **ModelCheckpoint**: saves `best_model.keras` whenever `val_loss` improves.
   - **EarlyStopping**: stops training if `val_loss` doesn't improve for 5 consecutive epochs, restoring the best weights.
6. Trains with `validation_split=0.2` (so effectively 64% train, 16% val, 20% test).
7. Evaluates on the held-out test set and prints accuracy.
8. Saves `lstm_model.keras` (final epoch model) and `label_encoder.npy`.
9. Calls `plot_training_history()`.ess of sequence length, which is then fed to the final Dense layer.

The model is compiled with:
- **Optimizer**: Adam (adaptive learning rate)
- **Loss**: `sparse_categorical_crossentropy` (integer labels, multi-class)
- **Metric**: accuracy

---

**`train_model(self, epochs=60, batch_size=8)`**

Orchestrates the full training run:
1. Calls `prepare_dataset()` to get `X` (shape: `[N, 50, 99]`) and `y` (string labels).
2. Encodes labels with `LabelEncoder` → integer array.
3. Splits 80/20 train/test with `traong Short-Term Memory) networks are designed to learn patterns in sequences, making them ideal here.

**Why Attention?** Not all frames in a 50-frame window are equally informative. The attention mechanism learns to assign higher weight to the most discriminative frames (e.g., the bottom of a squat vs. the standing position).

**Why GlobalAveragePooling1D?** After the attention + concatenation step, the tensor still has a time dimension. GAP averages across all timesteps, producing a fixed-size vector regardlntion([x, x])                  ← self-attention: weights important timesteps
    ↓
Concatenate([x, attention])        ← combine LSTM output with attention output
    ↓
Dense(64, relu)
    ↓
BatchNormalization + Dropout(0.3)
    ↓
GlobalAveragePooling1D()           ← collapses time dimension to single vector
    ↓
Dense(num_classes, softmax)        ← output probability per class
```

**Why LSTM?** Exercise movements are temporal sequences — a squat is not a single pose but a series of poses over time. LSTM (L each sample is the exercise class name (e.g., `"squat"`).

Videos with fewer than 10 valid frames are discarded to avoid noise.

---

**`create_lstm_model(self, input_shape, num_classes)`**

Builds the neural network using the Keras functional API:

```
Input (50, 99)
    ↓
LSTM(128, return_sequences=True)   ← learns temporal patterns across frames
    ↓
BatchNormalization + Dropout(0.3)
    ↓
LSTM(64, return_sequences=True)    ← deeper temporal abstraction
    ↓
BatchNormalization + Dropout(0.3)
    ↓
Atteames)
  sit_up/
    1/
    ...
  squat/
    1/
    ...
```

For each video folder, it collects all frame feature vectors in sorted order (to preserve temporal sequence). It then applies **padding and truncation** to a fixed `MAX_SEQUENCE_LENGTH = 50`:
- If a video has more than 50 frames, only the first 50 are used.
- If fewer than 50, zero vectors are appended until the sequence is length 50.

This produces a dataset where each sample is shape `(50, 99)` — 50 timesteps, 99 features per timestep. The label for.z, ..., lm32.x, lm32.y, lm32.z]
```

This 99-float vector is the feature representation of a single frame. After extraction, `augment_image()` is called on the image (though the augmented image itself is not used further — the augmentation was intended to be applied before landmark extraction for data diversity).

---

**`prepare_dataset(self)`**

Walks the dataset directory tree:
```
dataset_path/
  push_up/
    1/  (video 1 frames)
      frame_00001.png
      frame_00002.png
      ...
    2/  (video 2 frs, initializes `mp.solutions.pose` for landmark detection, and creates a `LabelEncoder` from scikit-learn to convert string class names (`"push_up"`, `"squat"`, `"sit_up"`) into integer indices for the model.

---

**`extract_pose_features(self, image_path)`**

Reads a single image with OpenCV, converts BGR → RGB (MediaPipe requires RGB), then runs `mp.solutions.pose.Pose` on it. If landmarks are detected, it flattens all 33 landmarks into a 1D array of 99 floats:

```
[lm0.x, lm0.y, lm0.z, lm1.x, lm1.y, lm1eo_dataset/sit_up_video/` → `image_dataset/sit_up/`
- `video_dataset/squat_video/` → `image_dataset/squat/`

The resulting `image_dataset/` directory structure is what `train_model.py` expects.

---

### 2. `trained_pose_model/train_model.py`

This is the **full training pipeline**. It reads the image dataset, extracts pose features using MediaPipe, builds an LSTM model with attention, trains it, and saves the result.

#### Class: `PoseModelTrainer`

**`__init__(self, dataset_path, export_dir)`**

Sets up pather. This ensures each video's frames go into their own sequentially numbered folder, which the training pipeline later treats as one "video sample".

**`extract_frames_from_all_videos(input_folder, output_base_folder, fps=10)`**

Iterates all `.mp4` files in a folder and calls `extract_frames_from_video` for each, placing each video's frames in a new numbered subdirectory.

**`__main__` block**

Hardcodes paths for three exercise categories:
- `video_dataset/push_up_video/` → `image_dataset/push_up/`
- `vidhen calculates a `frame_interval` to sample frames at the desired output FPS:

```python
frame_interval = int(video_fps / fps)
```

For example, if the video is 30 FPS and you want 5 FPS output, `frame_interval = 6`, meaning every 6th frame is saved. Each saved frame is written as a zero-padded PNG: `frame_00001.png`, `frame_00002.png`, etc.

**`get_next_directory(output_base_dir)`**

Scans the output base directory for existing numbered subdirectories (e.g., `1/`, `2/`, `3/`) and returns the next available numbules to landmarks
    → OpenCV renders skeleton + label + feedback on frame
    → cv2.imshow() displays result
```

---

## File-by-File Breakdown

### 1. `exercise_dataset/extract_video.py`

This is a **data preparation utility** used before training. It converts raw `.mp4` exercise videos into individual frame images that the training pipeline can process.

#### Key Functions

**`extract_frames_from_video(video_path, output_dir, fps=5)`**

Opens a video with `cv2.VideoCapture`, reads the native FPS of the video, ter sample)
    → best_model.keras        (saved best checkpoint)
    → label_encoder.npy       (class name array)

PHASE 2 — INFERENCE (real-time, main.py)
─────────────────────────────────────────
Video file (or webcam)
    → OpenCV reads frames
    → MediaPipe Holistic detects 33 pose landmarks per frame
    → 99-float feature vector extracted (33 landmarks × x,y,z)
    → Sliding window buffer of 50 frames accumulated
    → LSTM model predicts exercise class + confidence
    → form_checks.py applies geometric r
└── test_videos/
    ├── squats.mp4
    ├── pushup.mp4
    ├── situp.mp4
    └── squartss.mp4
```

---

## Pipeline Overview

The project has two distinct phases:

```
PHASE 1 — TRAINING (offline, done once)
────────────────────────────────────────
Raw exercise videos
    → extract_video.py        (extract frames at N fps)
    → image_dataset/          (folders: push_up/, sit_up/, squat/)
    → train_model.py          (MediaPipe pose extraction per frame)
    → LSTM model training     (sequences of 50 frames p Pinned dependency versions
│
├── trained_pose_model/
│   ├── train_model.py             # Full model training pipeline
│   ├── best_model.keras           # Best checkpoint saved during training
│   ├── lstm_model.keras           # Final saved model after training
│   ├── label_encoder.npy          # NumPy array of class label strings
│   └── training_history.png       # Accuracy/loss plot from training run
│
├── exercise_dataset/
│   └── extract_video.py           # Utility to extract frames from raw videos
│sing `ImportError` at runtime.
- **TensorFlow 2.18.0** requires `numpy>=1.26.0,<2.1.0` — 1.26.4 sits perfectly in that range.
- **OpenCV 4.10.0.84** uses the `cp37-abi3` ABI tag, meaning it is compatible with Python 3.7+ and does not enforce a NumPy 2.x requirement.

---

## Project Structure

```
FitPose-Detector-main/
│
├── main.py                        # Entry point — video loop, inference, display
├── form_checks.py                 # Rule-based biomechanical form analysis
├── requirements.txt               # rendering, display |
| **NumPy** | 1.26.4 | Numerical arrays, landmark math, feature vectors |
| **scikit-learn** | 1.3.2 | Label encoding, train/test split |
| **Matplotlib** | 3.7.3 | Plotting training accuracy/loss curves |
| **Albumentations** | 1.4.22 | Image augmentation during training |

### Why these specific versions?
- **NumPy 1.26.4** is critical. MediaPipe 0.10.9, scikit-learn 1.3.2, and matplotlib 3.7.3 were all compiled against NumPy 1.x. NumPy 2.x breaks binary compatibility with these packages, cauion label, confidence score, and feedback text directly onto the video frames using **OpenCV**.

The system is fully offline — no cloud API calls. Everything runs locally using the trained `.keras` model files.

---

## Tech Stack

| Library | Version | Role |
|---|---|---|
| **Python** | 3.10 | Runtime language |
| **TensorFlow / Keras** | 2.18.0 / 3.6.0 | LSTM model training and inference |
| **MediaPipe** | 0.10.9 | Real-time human pose landmark detection |
| **OpenCV (cv2)** | 4.10.0.84 | Video I/O, frameector is a real-time exercise classification and form-feedback system. It uses computer vision and deep learning to:

1. Detect human body pose landmarks from a video using **MediaPipe**.
2. Classify which exercise is being performed (squat, push-up, sit-up) using a trained **LSTM neural network**.
3. Analyze the detected pose geometry using **rule-based biomechanical checks** to give real-time form feedback (e.g., "Straighten your back", "Knees too far past toes").
4. Render the skeleton overlay, classificat#tech-stack)
3. [Project Structure](#project-structure)
4. [Pipeline Overview](#pipeline-overview)
5. [File-by-File Breakdown](#file-by-file-breakdown)
   - [extract_video.py](#1-exercise_datasetextract_videopy)
   - [train_model.py](#2-trained_pose_modeltrain_modelpy)
   - [form_checks.py](#3-form_checkspy)
   - [main.py](#4-mainpy)
6. [Data Flow Diagram](#data-flow-diagram)
7. [Key Concepts Explained](#key-concepts-explained)
8. [Running the Project](#running-the-project)

---

## Project Overview

FitPose Det# FitPose Detector — Full Codebase Documentation

## Table of Contents
1. [Project Overview](#project-overview)
2. [Tech Stack](
# FitPose Detector — Full Codebase Documentation

## Table of Contents
1. [Project Overview](#project-overview)
2. [Tech Stack](#tech-stack)
3. [Project Structure](#project-structure)
4. [Pipeline Overview](#pipeline-overview)
5. [File-by-File Breakdown](#file-by-file-breakdown)
6. [Data Flow Diagram](#data-flow-diagram)
7. [Key Concepts Explained](#key-concepts-explained)
8. [Running the Project](#running-the-project)

---

## Project Overview

FitPose Detector is a real-time exercise classification and form-feedback system. It uses computer vision and deep learning to:

1. Detect human body pose landmarks from a video using **MediaPipe**.
2. Classify which exercise is being performed (squat, push-up, sit-up) using a trained **LSTM neural network**.
3. Analyze the detected pose geometry using **rule-based biomechanical checks** to give real-time form feedback (e.g., "Straighten your back", "Knees too far past toes").
4. Render the skeleton overlay, classification label, confidence score, and feedback text directly onto the video frames using **OpenCV**.

The system is fully offline — no cloud API calls. Everything runs locally using the trained `.keras` model files.

---

## Tech Stack

| Library | Version | Role |
|---|---|---|
| Python | 3.10 | Runtime language |
| TensorFlow / Keras | 2.18.0 / 3.6.0 | LSTM model training and inference |
| MediaPipe | 0.10.9 | Real-time human pose landmark detection |
| OpenCV (cv2) | 4.10.0.84 | Video I/O, frame rendering, display |
| NumPy | 1.26.4 | Numerical arrays, landmark math, feature vectors |
| scikit-learn | 1.3.2 | Label encoding, train/test split |
| Matplotlib | 3.7.3 | Plotting training accuracy/loss curves |
| Albumentations | 1.4.22 | Image augmentation during training |

### Why these specific versions?

NumPy 1.26.4 is critical. MediaPipe 0.10.9, scikit-learn 1.3.2, and matplotlib 3.7.3 were all compiled against NumPy 1.x. NumPy 2.x breaks binary compatibility with these packages, causing `ImportError` at runtime. TensorFlow 2.18.0 requires `numpy>=1.26.0,<2.1.0` — version 1.26.4 sits perfectly in that range. OpenCV 4.10.0.84 uses the `cp37-abi3` ABI tag, meaning it is compatible with Python 3.7+ and does not enforce a NumPy 2.x requirement.

---

## Project Structure

```
FitPose-Detector-main/
│
├── main.py                        # Entry point — video loop, inference, display
├── form_checks.py                 # Rule-based biomechanical form analysis
├── requirements.txt               # Pinned dependency versions
│
├── trained_pose_model/
│   ├── train_model.py             # Full model training pipeline
│   ├── best_model.keras           # Best checkpoint saved during training
│   ├── lstm_model.keras           # Final saved model after training
│   ├── label_encoder.npy          # NumPy array of class label strings
│   └── training_history.png       # Accuracy/loss plot from training run
│
├── exercise_dataset/
│   └── extract_video.py           # Utility to extract frames from raw videos
│
└── test_videos/
    ├── squats.mp4
    ├── pushup.mp4
    ├── situp.mp4
    └── squartss.mp4
```

---

## Pipeline Overview

The project has two distinct phases:

```
PHASE 1 — TRAINING (offline, done once)
────────────────────────────────────────
Raw exercise videos
    → extract_video.py        (extract frames at N fps)
    → image_dataset/          (folders: push_up/, sit_up/, squat/)
    → train_model.py          (MediaPipe pose extraction per frame)
    → LSTM model training     (sequences of 50 frames per sample)
    → best_model.keras        (saved best checkpoint)
    → label_encoder.npy       (class name array)

PHASE 2 — INFERENCE (real-time, main.py)
─────────────────────────────────────────
Video file (or webcam)
    → OpenCV reads frames
    → MediaPipe Holistic detects 33 pose landmarks per frame
    → 99-float feature vector extracted (33 landmarks × x,y,z)
    → Sliding window buffer of 50 frames accumulated
    → LSTM model predicts exercise class + confidence
    → form_checks.py applies geometric rules to landmarks
    → OpenCV renders skeleton + label + feedback on frame
    → cv2.imshow() displays result
```

---

## File-by-File Breakdown

### 1. `exercise_dataset/extract_video.py`

This is a data preparation utility used before training. It converts raw `.mp4` exercise videos into individual frame images that the training pipeline can process.

**`extract_frames_from_video(video_path, output_dir, fps=5)`**

Opens a video with `cv2.VideoCapture`, reads the native FPS of the video, then calculates a `frame_interval` to sample frames at the desired output FPS:

```python
frame_interval = int(video_fps / fps)
```

For example, if the video is 30 FPS and you want 5 FPS output, `frame_interval = 6`, meaning every 6th frame is saved. Each saved frame is written as a zero-padded PNG: `frame_00001.png`, `frame_00002.png`, etc.

**`get_next_directory(output_base_dir)`**

Scans the output base directory for existing numbered subdirectories (e.g., `1/`, `2/`, `3/`) and returns the next available number. This ensures each video's frames go into their own sequentially numbered folder, which the training pipeline later treats as one "video sample".

**`extract_frames_from_all_videos(input_folder, output_base_folder, fps=10)`**

Iterates all `.mp4` files in a folder and calls `extract_frames_from_video` for each, placing each video's frames in a new numbered subdirectory.

**`__main__` block**

Hardcodes paths for three exercise categories:
- `video_dataset/push_up_video/` → `image_dataset/push_up/`
- `video_dataset/sit_up_video/` → `image_dataset/sit_up/`
- `video_dataset/squat_video/` → `image_dataset/squat/`

The resulting `image_dataset/` directory structure is what `train_model.py` expects.

---

### 2. `trained_pose_model/train_model.py`

This is the full training pipeline. It reads the image dataset, extracts pose features using MediaPipe, builds an LSTM model with attention, trains it, and saves the result.

**`PoseModelTrainer.__init__(self, dataset_path, export_dir)`**

Sets up paths, initializes `mp.solutions.pose` for landmark detection, and creates a `LabelEncoder` from scikit-learn to convert string class names (`"push_up"`, `"squat"`, `"sit_up"`) into integer indices for the model.

**`extract_pose_features(self, image_path)`**

Reads a single image with OpenCV, converts BGR to RGB (MediaPipe requires RGB), then runs `mp.solutions.pose.Pose` on it. If landmarks are detected, it flattens all 33 landmarks into a 1D array of 99 floats:

```
[lm0.x, lm0.y, lm0.z, lm1.x, lm1.y, lm1.z, ..., lm32.x, lm32.y, lm32.z]
```

This 99-float vector is the feature representation of a single frame. After extraction, `augment_image()` is called on the image to apply data augmentation for training diversity.

**`prepare_dataset(self)`**

Walks the dataset directory tree. For each video folder, it collects all frame feature vectors in sorted order (to preserve temporal sequence). It then applies padding and truncation to a fixed `MAX_SEQUENCE_LENGTH = 50`:
- If a video has more than 50 frames, only the first 50 are used.
- If fewer than 50, zero vectors are appended until the sequence is length 50.

This produces a dataset where each sample is shape `(50, 99)` — 50 timesteps, 99 features per timestep. Videos with fewer than 10 valid frames are discarded to avoid noise.

**`create_lstm_model(self, input_shape, num_classes)`**

Builds the neural network using the Keras functional API:

```
Input (50, 99)
    ↓
LSTM(128, return_sequences=True)   ← learns temporal patterns across frames
    ↓
BatchNormalization + Dropout(0.3)
    ↓
LSTM(64, return_sequences=True)    ← deeper temporal abstraction
    ↓
BatchNormalization + Dropout(0.3)
    ↓
Attention([x, x])                  ← self-attention: weights important timesteps
    ↓
Concatenate([x, attention])        ← combine LSTM output with attention output
    ↓
Dense(64, relu)
    ↓
BatchNormalization + Dropout(0.3)
    ↓
GlobalAveragePooling1D()           ← collapses time dimension to single vector
    ↓
Dense(num_classes, softmax)        ← output probability per class
```

Why LSTM? Exercise movements are temporal sequences — a squat is not a single pose but a series of poses over time. LSTM (Long Short-Term Memory) networks are designed to learn patterns in sequences, making them ideal here.

Why Attention? Not all frames in a 50-frame window are equally informative. The attention mechanism learns to assign higher weight to the most discriminative frames (e.g., the bottom of a squat vs. the standing position).

Why GlobalAveragePooling1D? After the attention + concatenation step, the tensor still has a time dimension. GAP averages across all timesteps, producing a fixed-size vector regardless of sequence length, which is then fed to the final Dense layer.

The model is compiled with Adam optimizer, `sparse_categorical_crossentropy` loss (integer labels, multi-class), and accuracy metric.

**`train_model(self, epochs=60, batch_size=8)`**

Orchestrates the full training run:
1. Calls `prepare_dataset()` to get `X` (shape: `[N, 50, 99]`) and `y` (string labels).
2. Encodes labels with `LabelEncoder` to integer array.
3. Splits 80/20 train/test with `train_test_split`.
4. Creates the LSTM model.
5. Adds two callbacks:
   - `ModelCheckpoint`: saves `best_model.keras` whenever `val_loss` improves.
   - `EarlyStopping`: stops training if `val_loss` doesn't improve for 5 consecutive epochs, restoring the best weights.
6. Trains with `validation_split=0.2` (effectively 64% train, 16% val, 20% test).
7. Evaluates on the held-out test set and prints accuracy.
8. Saves `lstm_model.keras` and `label_encoder.npy`.

**`augment_image(image)`**

Uses Albumentations to apply a randomized augmentation pipeline:
- `HorizontalFlip(p=0.5)` — mirrors the image 50% of the time
- `Rotate(limit=15, p=0.5)` — random rotation up to ±15°
- `RandomBrightnessContrast(p=0.3)` — random brightness/contrast shift
- `ShiftScaleRotate(...)` — combined shift, scale, rotate
- `HueSaturationValue(...)` — color jitter
- `GaussianBlur(blur_limit=(3,7), p=0.3)` — random blur

This increases dataset diversity and reduces overfitting by making the model robust to lighting, angle, and scale variations.

---

### 3. `form_checks.py`

This module implements rule-based biomechanical form analysis. It does not use machine learning — instead it uses geometric angle calculations on the MediaPipe landmark coordinates to detect common form errors.

**`calculate_angle(a, b, c)`**

The core geometric primitive. Given three 2D points `a`, `b`, `c`, it computes the angle at vertex `b` (angle ABC) in degrees.

```
vectors: ba = a - b,  bc = c - b
cos(θ) = (ba · bc) / (|ba| × |bc|)
θ = arccos(cos(θ))  →  degrees
```

`np.clip(cosang, -1.0, 1.0)` prevents domain errors in `arccos` due to floating-point imprecision. Returns `0.0` if either vector has zero length (degenerate case).

**`_xy(landmarks, idx, w, h)`**

Helper that converts a MediaPipe landmark's normalized coordinates (0.0–1.0) to pixel coordinates by multiplying by frame width `w` and height `h`. Returns a `(x_pixels, y_pixels)` tuple.

**`check_pushup_form(results, w, h)`**

Extracts left-side landmarks: shoulder, hip, knee (for back), and shoulder, elbow, wrist (for arm).

- Back angle = `calculate_angle(shoulder, hip, knee)`. A perfect plank = ~180°. If `< 160°` → "Straighten your back"
- Elbow angle = `calculate_angle(shoulder, elbow, wrist)`. If `> 170°` → "Bend elbows more". If `< 40°` → "Don't go too low"

**`check_squat_form(results, w, h)`**

Uses both left and right landmarks, averaging them for stability (reduces noise from camera angle asymmetry).

- Knee angle = `calculate_angle(hip, knee, ankle)`. Measures squat depth. If `< 55°` → "Control depth (too deep/unstable)"
- Torso lean: computes vector from hip to shoulder, uses `arctan2(|vx|, |vy|)` to get angle from vertical. If `> 55°` → "Keep chest up (too much forward lean)"
- Rounded back proxy: horizontal pixel distance between averaged shoulder and averaged hip. If `> 120 pixels` → "Avoid rounding (keep back neutral)"
- Knee past toes: if `knee_x - toe_x > 25 pixels` AND `knee_angle < 150°` → "Knees too far past toes"

**`check_situp_form(results, w, h)`**

Uses left shoulder, hip, knee, and nose.

- Torso angle = `calculate_angle(shoulder, hip, knee)`. If `> 165°` → body is nearly flat → "Curl up more (not enough range)"
- Neck forward: horizontal pixel distance between nose and shoulder. If `> 80 pixels` → "Don't pull your neck forward"

---

### 4. `main.py`

The entry point and real-time inference loop. Ties everything together.

**Environment setup (top of file)**

```python
os.environ["TF_CPP_MIN_LOG_LEVEL"] = "3"
os.environ["MEDIAPIPE_DISABLE_GPU"] = "1"
```

These must be set before importing TensorFlow or MediaPipe. They suppress TensorFlow's verbose C++ logs and disable GPU for MediaPipe to avoid CUDA errors on machines without a compatible GPU.

**`init_mediapipe()`**

Returns three MediaPipe solution objects: `mp_drawing` (draws landmarks/connections), `mp_drawing_styles` (pre-built visual styles for the skeleton), and `mp_holistic` (the Holistic solution class that detects pose, face, and hands simultaneously).

**`load_model_and_labels(model_dir)`**

Loads `best_model.keras` using `tf.keras.models.load_model()`, restoring the full model architecture and weights. Loads `label_encoder.npy` with `allow_pickle=True` (required because the array contains Python string objects). If loading fails, returns `(None, None)` and the program continues in skeleton-only mode.

**`extract_pose_features(results)`**

Flattens all 33 pose landmarks into a 99-float NumPy array — identical to what was done during training. This ensures the inference input matches the training data format exactly.

**`process_frame(...)`**

The core per-frame processing function:

Step 1 — Resize to 520×300 for faster MediaPipe inference.

Step 2 — Convert BGR to RGB. OpenCV reads frames in BGR order; MediaPipe requires RGB.

Step 3 — Run `holistic.process(frame_rgb)`. `results.pose_landmarks` contains the 33 body landmarks if a person is detected.

Step 4 — Draw skeleton overlay with `mp_drawing.draw_landmarks()`.

Step 5 — Feature buffer management. The LSTM requires a sequence of 50 frames. A Python list acts as a FIFO sliding window:
```python
feature_buffer.append(features)
if len(feature_buffer) > sequence_length:
    feature_buffer.pop(0)
```
Until 50 frames are accumulated, the screen shows `"Buffer: X/50"`.

Step 6 — LSTM prediction once buffer is full:
```python
input_features = np.array(feature_buffer).reshape(1, 50, 99)
prediction = model.predict(input_features, verbose=0)
idx = int(np.argmax(prediction[0]))
confidence = float(np.max(prediction[0]))
predicted_class = str(labels[idx])
```

Step 7 — Form check routing. The predicted class name is normalized (lowercased, spaces/hyphens removed) and substring-matched to route to the correct form check function. This handles label variations like `"push_up"`, `"pushup"`, `"Push Up"`, etc.

Step 8 — Text overlay. Two `cv2.putText()` calls render the classification result in green at `(10, 30)` and the form feedback in green (Good Form) or red (Bad Form) at `(10, 70)`.

Step 9 — Upscale to 1280×960 for comfortable display.

**`main()`**

The main loop:
1. Sets `VIDEO_PATH = "test_videos/squats.mp4"` (change to switch videos, or use `0` for webcam).
2. Initializes MediaPipe and loads the model.
3. Opens the video with `cv2.VideoCapture(VIDEO_PATH)`.
4. Reads the video's native FPS and computes `wait_ms = 1000 / fps` to play at natural speed.
5. Creates the `mp_holistic.Holistic` context manager with `min_detection_confidence=0.5` and `min_tracking_confidence=0.5`.
6. Enters the main `while True` loop: reads frames, processes them, displays with `cv2.imshow()`, and handles keyboard input.
7. Releases the video capture and destroys all OpenCV windows on exit.

---

## Data Flow Diagram

```
Video Frame (BGR)
      │
      ▼
cv2.resize(520×300)
      │
      ▼
BGR → RGB conversion
      │
      ▼
MediaPipe Holistic.process()
      │
      ├──────────────────────────────────────────┐
      │                                          │
      ▼                                          ▼
pose_landmarks (33 points)              draw_landmarks()
      │                                  (skeleton overlay)
      ▼
extract_pose_features()
→ [x,y,z × 33] = 99 floats
      │
      ▼
feature_buffer.append()   ← sliding window, max 50 frames
      │
      ▼ (when buffer == 50)
np.array(buffer).reshape(1, 50, 99)
      │
      ▼
LSTM model.predict()
      │
      ▼
argmax → class index → label string + confidence
      │
      ├──────────────────────────────────────────┐
      │                                          │
      ▼                                          ▼
form_checks.py                          cv2.putText(label)
(geometric angle rules)
      │
      ▼
cv2.putText(feedback)
      │
      ▼
cv2.resize(1280×960)
      │
      ▼
cv2.imshow()
```

---

## Key Concepts Explained

**MediaPipe Holistic vs Pose**

The code uses `mp.solutions.holistic` rather than `mp.solutions.pose`. Holistic detects pose, face mesh, and hand landmarks simultaneously in a single pass. For this project only `results.pose_landmarks` is used, but Holistic was chosen for potential future extension to hand/face analysis.

**Why a Sliding Window Buffer?**

A single frame cannot tell you if someone is doing a squat — you need to see the motion over time. The 50-frame buffer captures roughly 1.5–2 seconds of movement (at 25–30 FPS), which is enough to observe one full repetition of most exercises. The LSTM was trained on exactly 50-frame sequences, so inference must match this exactly.

**Normalized vs Pixel Coordinates**

MediaPipe returns landmark coordinates normalized to `[0.0, 1.0]` relative to the frame dimensions. `form_checks.py` converts these to pixel coordinates by multiplying by `w` and `h`. This is necessary because the angle thresholds (e.g., `shoulder_hip_dx > 120 pixels`) are defined in pixel space and depend on the frame resolution (520×300 in this case).

**Why `best_model.keras` and not `lstm_model.keras`?**

`best_model.keras` is saved by `ModelCheckpoint` whenever validation loss improves during training. `lstm_model.keras` is saved at the very end of training regardless of performance. The best checkpoint is used for inference because it represents the model state with the lowest overfitting, not necessarily the last epoch.

**Why BatchNormalization and Dropout together?**

BatchNormalization normalizes the activations of each layer, stabilizing and speeding up training. Dropout randomly zeros out 30% of neurons during training, forcing the network to learn redundant representations and preventing over-reliance on any single neuron. Together they are a standard regularization combo for deep sequence models.

---

## Running the Project

### Prerequisites
- Python 3.10
- Virtual environment at `../grad/` (relative to `FitPose-Detector-main/`)

### Install dependencies
```cmd
..\grad\Scripts\pip.exe install -r requirements.txt
..\grad\Scripts\pip.exe install "numpy==1.26.4" --force-reinstall --no-deps
```

### Run inference
From inside `FitPose-Detector-main/`:
```cmd
..\grad\Scripts\python.exe main.py
```

### Switch video
Edit this line in `main.py`:
```python
VIDEO_PATH = "test_videos/pushup.mp4"   # or situp.mp4, squats.mp4
VIDEO_PATH = 0                           # webcam
```

### Controls
| Key | Action |
|-----|--------|
| SPACE | Pause / Resume |
| Q or ESC | Quit |
