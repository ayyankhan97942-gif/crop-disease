# Crop Disease Identifier from Leaf Images

## Problem Statement
Farmers often cannot identify crop diseases at an early stage. Late detection leads to crop damage and financial loss. Therefore, we need a system that can detect plant diseases using leaf images.

---

## Problem Understanding
1. Most plant diseases appear on leaves.
2. Each disease has a different visual pattern.
3. Early detection can save crops.
4. AI can analyze images and identify patterns accurately.

---

## Approach
1. Collected a dataset of leaf images.
2. Cleaned and resized the images.
3. Trained a CNN model for classification.
4. Integrated the trained model into a web application.
5. User uploads an image and gets the prediction result.

---

## Proposed Solution
A web-based application that:
1. Allows users to upload a leaf image
2. Detects the disease
3. Shows prediction confidence percentage

It is simple and easy to use.

---

## System Architecture
User → Web Interface → Backend Server → Trained Model → Result Display

---

## Database Design

### Users Table
1. user_id
2. name
3. email

### Prediction Table
1. prediction_id
2. image_path
3. predicted_disease
4. confidence_score
5. timestamp

---

## Dataset Selected
1. PlantVillage Dataset
2. Healthy and diseased leaf images
3. Multiple crop categories

---

## Model Selected
1. Convolutional Neural Network (CNN)
2. Image size: 224x224
3. Activation Function: ReLU
4. Output Layer: Softmax (Multi-class classification)
5. Optimizer: Adam

---

## Technology Stack
**Frontend:**
1. HTML
2. CSS
3. Streamlit (optional)

**Backend:**
1. Python
2. Flask

**Machine Learning:**
1. TensorFlow / Keras
2. OpenCV

**Tools:**
1. Google Colab
2. GitHub

---

## API Documentation & Testing

### Endpoint
`POST /predict`

### Input
. Leaf Image (JPG/PNG)

### Output (JSON)
```json
{
  "disease": "Tomato Early Blight",
  "confidence": "95%"
}
