"""
Export Models to Web-Compatible Formats

This script converts trained models from TensorFlow to TF Lite or ONNX
for on-device inference in the browser.
"""

import os
import sys
from gesture_model import GestureModel
from gaze_model import GazeModel

def export_all_models(output_dir='../public/models'):
    """Export all models for web deployment."""
    os.makedirs(output_dir, exist_ok=True)

    print("=" * 60)
    print("Air-Mouse ML Model Export Pipeline")
    print("=" * 60)

    # Export Gesture Model
    print("\n[1/2] Exporting Gesture Recognition Model...")
    try:
        gesture_model = GestureModel(num_classes=5)
        gesture_model.export_tflite(f'{output_dir}/gesture_model.tflite')
        gesture_model.export_onnx(f'{output_dir}/gesture_model')
        print("✓ Gesture model exported successfully")
    except Exception as e:
        print(f"✗ Error exporting gesture model: {e}")

    # Export Gaze Model
    print("\n[2/2] Exporting Gaze Estimation Model...")
    try:
        gaze_model = GazeModel()
        gaze_model.export_tflite(f'{output_dir}/gaze_model.tflite')
        print("✓ Gaze model exported successfully")
    except Exception as e:
        print(f"✗ Error exporting gaze model: {e}")

    print("\n" + "=" * 60)
    print(f"Models exported to: {output_dir}")
    print("=" * 60)

if __name__ == '__main__':
    export_all_models()
