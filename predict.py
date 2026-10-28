
from ultralytics import YOLO
import cv2
import numpy as np
from datetime import datetime

from loitering_detector import check_loitering
from event_manager import create_event
from risk_engine import assess_risk
from incident_deduplicator import should_create_incident
from incident_manager import create_incident


# -------------------- MODEL CONFIGURATION --------------------

model = YOLO("runs/detect/train-3/weights/best.pt")
video_path = "video6125123190915079860.mp4"


# -------------------- EVENT PIPELINE --------------------

def process_event(event):
    """Assess risk and create an incident if the event is accepted."""

    risk_result = assess_risk(event)

    print("\nEVENT:", event)
    print("RISK:", risk_result)

    if not should_create_incident(event):
        print("Duplicate event suppressed.")
        return None

    incident = create_incident(event, risk_result)

    print("INCIDENT CREATED:", incident)
    return incident


# -------------------- POLYGON SELECTION --------------------

polygon_points = []
polygon_closed = False
previous_state = {}


def mouse_callback(event, x, y, flags, param):
    global polygon_points, polygon_closed

    if event == cv2.EVENT_LBUTTONDOWN and not polygon_closed:
        polygon_points.append((x, y))


window_name = "NightGuard AI - Zone Test"
cv2.namedWindow(window_name)
cv2.setMouseCallback(window_name, mouse_callback)

cap = cv2.VideoCapture(video_path)
ret, frame = cap.read()

if not ret:
    print("Could not read the video.")
    cap.release()
    cv2.destroyAllWindows()
    raise SystemExit(1)

quit_requested = False

while not polygon_closed:
    display_frame = frame.copy()

    for point in polygon_points:
        cv2.circle(display_frame, point, 5, (0, 0, 255), -1)

    if len(polygon_points) >= 2:
        cv2.polylines(
            display_frame,
            [np.array(polygon_points, np.int32)],
            False,
            (0, 255, 0),
            2
        )

    cv2.putText(
        display_frame,
        "Click polygon points | C = confirm | Q = quit",
        (10, 30),
        cv2.FONT_HERSHEY_SIMPLEX,
        0.6,
        (255, 255, 255),
        2
    )

    cv2.imshow(window_name, display_frame)
    key = cv2.waitKey(30) & 0xFF

    if key == ord("c") and len(polygon_points) >= 3:
        polygon_closed = True
        polygon = np.array(polygon_points, np.int32)
        print("Restricted zone confirmed.")

    elif key == ord("q"):
        quit_requested = True
        break

cap.release()

if quit_requested:
    cv2.destroyAllWindows()
    raise SystemExit(0)


# -------------------- PERSON TRACKING --------------------

results = model.track(
    source=video_path,
    conf=0.5,
    imgsz=960,
    tracker="bytetrack.yaml",
    persist=True,
    stream=True,
    verbose=False
)

try:
    for result in results:
        frame = result.plot()

        # Draw the configured restricted zone.
        cv2.polylines(
            frame,
            [polygon],
            True,
            (0, 255, 0),
            2
        )

        cv2.putText(
            frame,
            "Restricted Zone",
            tuple(polygon[0]),
            cv2.FONT_HERSHEY_SIMPLEX,
            0.7,
            (0, 255, 0),
            2
        )

        if result.boxes.id is not None:
            track_ids = result.boxes.id.int().cpu().tolist()
            boxes = result.boxes.xyxy.cpu().numpy()
            confidences = result.boxes.conf.cpu().numpy()

            for track_id, box, confidence in zip(
                track_ids, boxes, confidences
            ):
                x1, y1, x2, y2 = box

                center_x = int((x1 + x2) / 2)
                bottom_y = int(y2)
                point = (center_x, bottom_y)

                cv2.circle(frame, point, 5, (0, 0, 255), -1)

                inside = (
                    cv2.pointPolygonTest(polygon, point, False) >= 0
                )

                current_time = datetime.now()
                was_inside = previous_state.get(track_id, False)

                # Zone entry.
                if not was_inside and inside:
                    event = create_event(
                        event_type="zone_entry",
                        track_id=track_id,
                        confidence=float(confidence),
                        zone="restricted zone"
                    )
                    process_event(event)

                # Zone exit.
                elif was_inside and not inside:
                    event = create_event(
                        event_type="zone_exit",
                        track_id=track_id,
                        confidence=float(confidence),
                        zone="restricted zone"
                    )
                    process_event(event)

                previous_state[track_id] = inside

                # Loitering detection.
                loitering = check_loitering(
                    track_id,
                    inside,
                    current_time
                )

                if loitering:
                    event = create_event(
                        event_type="loitering",
                        track_id=track_id,
                        confidence=float(confidence),
                        zone="restricted zone"
                    )
                    process_event(event)

        cv2.imshow("NightGuard AI - Zone Test", frame)

        if cv2.waitKey(100) & 0xFF == ord("q"):
            break

finally:
    cv2.destroyAllWindows()
