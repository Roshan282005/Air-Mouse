"""
Gesture Model Training Pipeline

This module provides training utilities for gesture recognition models.
Gestures: thumbs_up, thumbs_down, palm_open, fist

Export: TensorFlow Lite, ONNX for web deployment
"""

import numpy as np
import tensorflow as tf
from tensorflow import keras
from tensorflow.keras import layers
import json
import os

class GestureModel:
    """Simple gesture classification model using MediaPipe hand landmarks."""

    def __init__(self, num_classes=5):
        self.num_classes = num_classes
        self.model = self._build_model()

    def _build_model(self):
        """Build a simple CNN for gesture classification."""
        model = keras.Sequential([
            layers.Input(shape=(21, 3)),  # 21 hand landmarks, 3 coords each
            layers.Flatten(),
            layers.Dense(128, activation='relu'),
            layers.Dropout(0.2),
            layers.Dense(64, activation='relu'),
            layers.Dropout(0.2),
            layers.Dense(self.num_classes, activation='softmax'),
        ])
        model.compile(
            optimizer='adam',
            loss='sparse_categorical_crossentropy',
            metrics=['accuracy'],
        )
        return model

    def train(self, X_train, y_train, X_val, y_val, epochs=50):
        """Train the gesture model."""
        history = self.model.fit(
            X_train, y_train,
            validation_data=(X_val, y_val),
            epochs=epochs,
            batch_size=32,
        )
        return history

    def export_tflite(self, output_path='models/gesture_model.tflite'):
        """Export model to TensorFlow Lite format."""
        converter = tf.lite.TFLiteConverter.from_keras_model(self.model)
        converter.target_spec.supported_ops = [
            tf.lite.OpsSet.TFLITE_BUILTINS,
            tf.lite.OpsSet.SELECT_TF_OPS,
        ]
        tflite_model = converter.convert()
        
        os.makedirs(os.path.dirname(output_path), exist_ok=True)
        with open(output_path, 'wb') as f:
            f.write(tflite_model)
        print(f"Exported TFLite model to {output_path}")

    def export_onnx(self, output_path='models/gesture_model.onnx'):
        """Export model to ONNX format for web deployment."""
        try:
            import tf2onnx
            import onnx
            
            # Convert to ONNX
            spec = (tf.TensorSpec((None, 21, 3), tf.float32, name="input"),)
            output_path = output_path.replace('.onnx', '')
            model_proto, _ = tf2onnx.convert.from_keras(self.model, input_signature=spec)
            
            os.makedirs(os.path.dirname(output_path + '.onnx'), exist_ok=True)
            onnx.save_model(model_proto, output_path + '.onnx')
            print(f"Exported ONNX model to {output_path}.onnx")
        except ImportError:
            print("tf2onnx not installed. Install with: pip install tf2onnx")

if __name__ == '__main__':
    # Placeholder for training
    print("Gesture model training module loaded")
    model = GestureModel()
    print(f"Model summary:")
    model.model.summary()
