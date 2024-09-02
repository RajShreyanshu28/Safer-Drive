# Safer-Drive
 Driving made Safer....
# SaferDrive

SafeDrive is a drowsiness detection application using YOLO (You Only Look Once) for real-time object detection. The application monitors driver behavior, detects signs of drowsiness or yawning, and triggers alerts if necessary. It utilizes the Twilio API to send emergency messages with location information when the alert is triggered.

![image](https://github.com/user-attachments/assets/c888aa4a-0fd6-4896-8288-b10c79eaf4dc)

Make sure to add an Emergency Contact here, so that you can receive the emergency message there.

Alarm triggers:
![image](https://github.com/user-attachments/assets/1af79041-5c92-426f-8867-5dfc406a7870)

## Features

- Real-time video feed analysis using YOLO model
- Detection of drowsiness and yawning
- Alerts triggered when drowsiness is detected
- Emergency message sent via Twilio API with location information
- Web interface for monitoring and control

## Requirements

- Python 3.12 or higher
- Flask
- OpenCV
- Ultralytics (YOLO)
- Twilio
  
## Installation

1. **Clone the Repository**

    ```bash
    git clone https://github.com/RajShreyanshu28/SafeDrive.git
    cd SafeDrive
    ```

2. **Set Up a Virtual Environment**

    ```bash
    python -m venv venv
    source venv/bin/activate  # On Windows use `venv\Scripts\activate`
    ```

3. **Configure Environment Variables**

    Create a `.env` file in the root directory and add the following environment variables:

    ```plaintext
    TWILIO_ACCOUNT_SID=your_twilio_account_sid
    TWILIO_AUTH_TOKEN=your_twilio_auth_token
    TWILIO_NUMBER=your_twilio_phone_number
    ```

## Usage

1. **Run the Application**

    ```bash
    python app.py
    ```

2. **Access the Web Interface**

    Open a web browser and go to `http://127.0.0.1:5000` to access the SaferDrive web interface.

3. **Control the Prediction**

    Use the web interface to start and stop the prediction and check for alerts.

## Acknowledgments

- [YOLO](https://github.com/ultralytics/yolov8) for object detection
- [Twilio](https://www.twilio.com/) for communication APIs
- [Flask](https://flask.palletsprojects.com/) for web framework
- [Javascript] 


