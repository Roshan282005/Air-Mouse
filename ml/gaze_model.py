"""
Gaze Estimation Model

Predicts gaze direction from eye region images or face landmarks.
Exports to TF Lite / ONNX for web deployment.
"""

import numpy as np
import tensorflow as tf
from tensorflow import keras
from tensorflow.keras import layers
import os

class GazeModel:
    """Gaze estimation model from face landmarks."""

    def __init__(self):
        self.model = self._build_model()

    def _build_model(self):
        """Build gaze estimation model."""
        model = keras.Sequential([
            layers.Input(shape=(468, 3)),  # MediaPipe face landmarks
            layers.Flatten(),
            layers.Dense(256, activation='relu'),
            layers.Dropout(0.3),
            layers.Dense(128, activation='relu'),
            layers.Dropout(0.2),
            layers.Dense(2, activation='linear'),  # (x, y) gaze coordinates
        ])
        model.compile(
            optimizer='adam',
            loss='mse',
            metrics=['mae'],
        )
        return model

    def train(self, X_train, y_train, X_val, y_val, epochs=100):
        """Train gaze model."""
        history = self.model.fit(
            X_train, y_train,
            validation_data=(X_val, y_val),
            epochs=epochs,
            batch_size=16,
        )
        return history

    def export_tflite(self, output_path='models/gaze_model.tflite'):
        """Export to TFLite."""
        converter = tf.lite.TFLiteConverter.from_keras_model(self.model)
        tflite_model = converter.convert()
        os.makedirs(os.path.dirname(output_path), exist_ok=True)
        with open(output_path, 'wb') as f:
            f.write(tflite_model)
        print(f"Exported TFLite gaze model to {output_path}")

if __name__ == '__main__':
    print("Gaze model module loaded")
    model = GazeModel()
    print("Gaze model ready for training")
