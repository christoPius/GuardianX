from ultralytics import YOLO
import cv2
import numpy as np
from loitering_detector import check_loitering
from datetime import datetime
from event_manager import create_event

model = YOLO("runs/detect/train-3/weights/best.pt")

video_path = "video6125123190915079860.mp4"

polygon_points = []
polygon_closed = False

def mouse_callback(event,x,y,flags,param):
    global polygon_points, polygon_closed
    global line_start, line_end, line_drawing

    if event == cv2.EVENT_LBUTTONDOWN and not polygon_closed:
        polygon_points.append((x,y))

previous_state = {}

window_name = "nightguard ai - zone test"
cv2.namedWindow(window_name)
cv2.setMouseCallback(window_name,mouse_callback)

cap = cv2.VideoCapture(video_path)
ret, frame = cap.read()

if not ret:
    print("could not read the video")
    cap.release()
    exit()

quit_requested = False

while not polygon_closed:
    display_frame = frame.copy()
    for point in polygon_points:
        cv2.circle(display_frame, point, 5, (0,0,255), -1)
    if len(polygon_points) >= 2:
        cv2.polylines(
            display_frame,
            [np.array(polygon_points,np.int32)],
            False,
            (0,255,0),     
            2
        )
    cv2.imshow(window_name, display_frame)
    key = cv2.waitKey(100) & 0xFF
    if key == ord("c") and len(polygon_points)>=3:
        polygon_closed = True
        polygon = np.array(polygon_points, np.int32)
    if key == ord("q"):
        quit_requested = True
        break

    
if quit_requested:
    cap.release()
    cv2.destroyAllWindows()
    exit()



results = model.track(
    source = video_path,
    conf = 0.5,
    imgsz = 960,
    tracker = "bytetrack.yaml",
    persist = True,
    stream = True,
    verbose = False
)

for result in results:
    frame = result.plot()
    cv2.polylines(
    frame,
    [polygon],
    True,
    (0, 255, 0),
    2)

    cv2.putText(
        frame,
        "restricted zone",
        polygon[0],
        cv2.FONT_HERSHEY_SIMPLEX,
        0.7,
        (0,255,0),
        2
    )

    if result.boxes.id is not None:
        
        track_ids = result.boxes.id.int().cpu().tolist()
        boxes = result.boxes.xyxy.cpu().numpy()
        confidences = result.boxes.conf.cpu().numpy()

        for track_id, box, confidence in zip(track_ids, boxes, confidences):
            x1, y1, x2, y2 = box
            center_x = int((x1+x2)/2)
            bottom_y = int(y2)
            point = (center_x, bottom_y)
            cv2.circle(frame,point,5,(0,0,255),-1)
            
            
            inside = cv2.pointPolygonTest(
                polygon,
                point,
                False
            )>=0

            current_time = datetime.now()
            loitering = check_loitering(
                track_id,
                inside,
                current_time
            )

            print("LOITER RESULT:", track_id, loitering)

            if loitering:
                print("loitering event", track_id)
                create_event(
                    event_type='loitering',
                    track_id=track_id,
                    confidence=float(confidence),
                    zone="restricted zone"
                )

            was_inside = previous_state.get(track_id, False)

            if not was_inside and inside:
                print("Zone Entry", track_id)
            elif was_inside and not inside:
                print("zone exit", track_id)
            previous_state[track_id] = inside


    cv2.imshow("nightguard ai - zone test",frame)
    key = cv2.waitKey(100) & 0xFF
    
    if key == ord("q"):
        break


cv2.destroyAllWindows()