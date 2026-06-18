"""Test script to load the model and diagnose issues"""
import os
os.environ["TF_CPP_MIN_LOG_LEVEL"] = "3"

import tensorflow as tf
import numpy as np

print(f"TensorFlow version: {tf.__version__}")

model_path = "./trained_pose_model/best_model.keras"
alt_model_path = "./trained_pose_model/lstm_model.keras"
labels_path = "./trained_pose_model/label_encoder.npy"

print(f"\nAttempting to load model from: {model_path}")

try:
    # Try with compile=False
    model = tf.keras.models.load_model(model_path, compile=False)
    print("✅ Model loaded successfully with compile=False!")
    print(f"Model input shape: {model.input_shape}")
    print(f"Model output shape: {model.output_shape}")
    
    # Load labels
    labels = np.load(labels_path, allow_pickle=True)
    print(f"✅ Labels loaded: {labels}")
    
except Exception as e:
    print(f"❌ Failed to load best_model.keras: {e}")
    print(f"\nTrying alternative model: {alt_model_path}")
    
    try:
        model = tf.keras.models.load_model(alt_model_path, compile=False)
        print("✅ Alternative model loaded successfully!")
        print(f"Model input shape: {model.input_shape}")
        print(f"Model output shape: {model.output_shape}")
    except Exception as e2:
        print(f"❌ Failed to load lstm_model.keras: {e2}")
