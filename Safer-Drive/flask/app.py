from flask import Flask, render_template, Response, request, jsonify, redirect, url_for, session
import cv2
from ultralytics import YOLO  # Import your YOLO model and prediction functions
import time
from twilio.rest import Client
from dotenv import load_dotenv
import os
from flask_cors import CORS

load_dotenv()
app = Flask(__name__)
CORS(app)
# Path to your YOLO model weights
model_path = r'runs/detect/train6/weights/best.pt'

# Initialize your YOLO model
try:
    model = YOLO(model_path)
    print("Model loaded successfully.")
except Exception as e:
    print(f"Error loading model: {e}")
    model = None

cap = cv2.VideoCapture(0)
is_predicting = False
alert_triggered = False
yawning_detected = False
drowsiness_start_time = None

def final_answer(val):
    global drowsiness_start_time, yawning_detected, alert_triggered
    if val == 0:
        if drowsiness_start_time is None:
            drowsiness_start_time = time.time()
        elif time.time() - drowsiness_start_time >= 5:
            alert_triggered = True
            return "SLEEPY"
    else:
        drowsiness_start_time = None

    if val == 2:
        yawning_detected = True
        return "YAWNING"
    else:
        yawning_detected = False
    return ""

def gen_frames():
    while True:
        ret, frame = cap.read()
        if not ret:
            break

        if is_predicting and model:
            annotated_frame = predict_frame(frame, model)
        else:
            annotated_frame = frame

        ret, buffer = cv2.imencode('.jpg', annotated_frame)
        frame = buffer.tobytes()

        yield (b'--frame\r\n'
               b'Content-Type: image/jpeg\r\n\r\n' + frame + b'\r\n')

def predict_frame(frame, model):
    results = model(frame)

    for result in results:
        if result.boxes:
            boxes = result.boxes.xyxy.cpu().numpy()
            classes = result.boxes.cls.cpu().numpy()
            confidences = result.boxes.conf.cpu().numpy()

            # Get the index of the highest confidence
            max_conf_index = confidences.argmax()

            # Extract the most confident prediction
            max_conf_box = boxes[max_conf_index]
            max_conf_class = classes[max_conf_index]
            max_conf = confidences[max_conf_index]

            answer = final_answer(max_conf_class)

            # Set yawning_detected flag when yawning is detected
            if answer == "YAWNING":
                global yawning_detected
                yawning_detected = True

            # Ensure coordinates are valid
            try:
                x1, y1, x2, y2 = map(int, max_conf_box)
                label = f'Class: {int(max_conf_class)}, Confidence: {max_conf:.2f}'
                color = (0, 255, 0)  # Green color for the bounding box

                cv2.rectangle(frame, (x1, y1), (x2, y2), color, 2)
                cv2.putText(frame, label, (x1, y1 - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.9, color, 2)
            except ValueError as e:
                print(f"Error in drawing rectangle: {e}")
                print(f"Coordinates: {max_conf_box}")

    return frame

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/video_feed')
def video_feed():
    return Response(gen_frames(), mimetype='multipart/x-mixed-replace; boundary=frame')

@app.route('/toggle_prediction', methods=['POST'])
def toggle_prediction():
    global is_predicting, alert_triggered, drowsiness_start_time
    is_predicting = not is_predicting
    if not is_predicting:
        # Reset alert status when stopping prediction
        alert_triggered = False
        drowsiness_start_time = None
    return jsonify({'is_predicting': is_predicting})

@app.route('/check_alert')
def check_alert():
    global alert_triggered, yawning_detected
    response = {'alert': alert_triggered, 'yawning': yawning_detected}
    if alert_triggered:
        alert_triggered = False  # Reset the alert flag
    if yawning_detected:
        yawning_detected = False  # Reset the yawning flag
    return jsonify(response)

emergency_numbers = []

@app.route('/alert_timeout', methods=['POST'])
def alert_timeout():
    data = request.get_json()
    latitude = data.get('latitude', None)
    longitude = data.get('longitude', None)

    global emergency_numbers
    print(f"Received emergency numbers from the alertside function: {emergency_numbers}")
    if latitude and longitude and emergency_numbers:
        print(f"This is an emergency message. I've got into an accident and need help. Please help me out. My current location is https://www.google.com/maps/search/?api=1&query={latitude},{longitude}")
        account_sid = os.getenv('TWILIO_ACCOUNT_SID')
        auth_token = os.getenv('TWILIO_AUTH_TOKEN')
        twilio_number = os.getenv('TWILIO_NUMBER')
        client = Client(account_sid, auth_token)

        for number in emergency_numbers:
            message = client.messages.create(
                body = f"This is an emergency message from {number}. I've got into an accident and need help. Please help me out. My current location is https://www.google.com/maps/search/?api=1&query={latitude},{longitude}",
                from_=twilio_number,
                to=number
            )
            print(f"Message sent to {number}: {message.body}")

        return jsonify({'message': 'Emergency alerts sent'}), 200
    else:
        print("No emergency numbers or geolocation data available.")
        return jsonify({'message': 'Failed to send alerts'}), 400


@app.route('/alert')
def alert():
    return render_template('alert.html')

@app.route('/process_number', methods=['POST'])
def process_number():
    data = request.get_json()
    numbers = data.get('numbers', None)  # Extract the numbers from the request

    if numbers:
        print(f"Received emergency numbers: {numbers}")
        global emergency_numbers  # Store the numbers in a global variable
        emergency_numbers = numbers
        return jsonify({'message': 'Emergency numbers received successfully!'}), 200
    else:
        return jsonify({'message': 'No numbers received'}), 400


if __name__ == '__main__':
    app.run(debug=True)


