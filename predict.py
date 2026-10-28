
from ultralytics import YOLO
import cv2
import numpy as np
from datetime import datetime
import requests

from loitering_detector import check_loitering
from event_manager import create_event
from risk_engine import assess_risk
from incident_deduplicator import should_create_incident
from incident_manager import create_incident
from collections import deque
import os
import tempfile


# -------------------- MODEL CONFIGURATION --------------------

model = YOLO("runs/detect/train-3/weights/best.pt")
video_path = "video6125123190915079860.mp4"


API_URL = "http://127.0.0.1:8000/api/events"


STATUS_URL = "http://127.0.0.1:8000/api/monitoring/status"


def update_monitoring_status(is_running):
    try:
        response = requests.post(
            STATUS_URL,
            json={
                "isRunning": is_running,
                "activeSourceId": "local-video" if is_running else None,
            },
            timeout=3,
        )
        response.raise_for_status()
        print("MONITORING STATUS:", response.json())

    except requests.RequestException as exc:
        print("Could not update monitoring status:", exc)


def send_event_to_api(event, snapshot_url=None):
    """Send a detected event to the FastAPI backend."""
    try:
        response = requests.post(
            API_URL,
            json={
                "event_type": event["event_type"],
                "track_id": event["track_id"],
                "confidence": event.get("confidence") or 0.0,
                "zone": event.get("zone"),
                "direction": event.get("direction"),
                "snapshot_url": snapshot_url,
            },
            timeout=3,
        )
        response.raise_for_status()
        result = response.json()
        print("API EVENT RESPONSE:", result)
        return result

    except requests.RequestException as exc:
        print("Could not send event to FastAPI:", exc)
        return None

def upload_snapshot(frame):
    try:
        success, encoded = cv2.imencode(
            ".jpg",
            frame,
            [cv2.IMWRITE_JPEG_QUALITY, 85],
        )

        if not success:
            print("Could not encode snapshot.")
            return None

        response = requests.post(
            "http://127.0.0.1:8000/api/evidence/snapshot",
            files={
                "file": (
                    "snapshot.jpg",
                    encoded.tobytes(),
                    "image/jpeg",
                )
            },
            timeout=5,
        )
        response.raise_for_status()

        return response.json()["snapshotUrl"]

    except requests.RequestException as exc:
        print("Snapshot upload failed:", exc)
        return None



class ClipRecorder:
    """Record original frames from 5 seconds before to 5 seconds after an incident."""

    def __init__(self, fps):
        self.fps = max(1, round(fps))
        self.pre_frames = self.fps * 5
        self.post_frames = self.fps * 5
        self.buffer = deque(maxlen=self.pre_frames)
        self.pending = []
        self.frame_index = 0

    def add_frame(self, frame):
        """Call once per processed frame, before handling events."""
        self.frame_index += 1
        original = frame.copy()

        # Add this frame to clips already being recorded.
        remaining = []
        for clip in self.pending:
            clip["frames"].append(original.copy())

            if self.frame_index >= clip["end_frame"]:
                self._upload_clip(clip)
            else:
                remaining.append(clip)

        self.pending = remaining
        self.buffer.append(original)

    def start_clip(self, incident_id):
        """Start a clip using the preceding 5 seconds plus 5 future seconds."""
        frames = [frame.copy() for frame in self.buffer]

        # Include the current frame if the buffer is not yet full.
        if not frames:
            print("Clip buffer is empty; cannot create pre-incident footage.")
            return

        self.pending.append({
            "incident_id": incident_id,
            "frames": frames,
            "end_frame": self.frame_index + self.post_frames,
        })

        print(f"Recording incident clip: {incident_id}")

    
    def _upload_clip(self, clip):
        if not clip["frames"]:
            return

        temp_path = None
        h264_path = None

        try:
            height, width = clip["frames"][0].shape[:2]

            with tempfile.NamedTemporaryFile(
                suffix=".mp4", delete=False
            ) as temp:
                temp_path = temp.name

            writer = cv2.VideoWriter(
                temp_path,
                cv2.VideoWriter_fourcc(*"mp4v"),
                self.fps,
                (width, height),
            )

            if not writer.isOpened():
                print("Could not initialize MP4 writer.")
                return

            try:
                for frame in clip["frames"]:
                    writer.write(frame)
            finally:
                writer.release()

            h264_path = temp_path.replace(".mp4", "_h264.mp4")

            # Convert to browser-compatible H.264.
            import subprocess

            subprocess.run(
                [
                    "ffmpeg", "-y",
                    "-i", temp_path,
                    "-an",
                    "-c:v", "libx264",
                    "-pix_fmt", "yuv420p",
                    "-movflags", "+faststart",
                    h264_path,
                ],
                check=True,
                capture_output=True,
                text=True,
            )

            with open(h264_path, "rb") as video_file:
                response = requests.post(
                    f"http://127.0.0.1:8000/api/incidents/"
                    f"{clip['incident_id']}/evidence/clip",
                    files={
                        "file": (
                            "incident.mp4",
                            video_file,
                            "video/mp4",
                        )
                    },
                    timeout=60,
                )

            response.raise_for_status()
            print("H.264 CLIP UPLOADED:", response.json())

        except (requests.RequestException, OSError, subprocess.SubprocessError) as exc:
            print("Clip creation/upload failed:", exc)

        finally:
            for path in (temp_path, h264_path):
                if path and os.path.exists(path):
                    os.remove(path)




# -------------------- EVENT PIPELINE --------------------


def process_event(event, frame, original_frame, clip_recorder):
    snapshot_url = upload_snapshot(frame)
    result = send_event_to_api(event, snapshot_url)

    if result and result.get("created"):
        incident = result.get("incident") or {}
        incident_id = incident.get("id")

        print("INCIDENT CREATED BY API:", incident)

        if incident_id:
            clip_recorder.start_clip(incident_id)

    elif result and result.get("reason") == "duplicate":
        print("Duplicate event suppressed by API.")



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
video_fps = cap.get(cv2.CAP_PROP_FPS)
if not video_fps or video_fps <= 0:
    video_fps = 30
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

update_monitoring_status(True)

clip_recorder = ClipRecorder(video_fps)

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
        original_frame = result.orig_img.copy()
        clip_recorder.add_frame(original_frame)

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
                    process_event(
                        event,
                        frame,
                        original_frame,
                        clip_recorder,
                    )

                # Zone exit.
                elif was_inside and not inside:
                    event = create_event(
                        event_type="zone_exit",
                        track_id=track_id,
                        confidence=float(confidence),
                        zone="restricted zone"
                    )
                    process_event(
                        event,
                        frame,
                        original_frame,
                        clip_recorder,
                    )

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
                    process_event(
                        event,
                        frame,
                        original_frame,
                        clip_recorder,
                    )

        cv2.imshow("NightGuard AI - Zone Test", frame)

        if cv2.waitKey(100) & 0xFF == ord("q"):
            break

finally:
    update_monitoring_status(False)
    cv2.destroyAllWindows()
