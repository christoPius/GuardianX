from ultralytics import YOLO

model = YOLO("runs/detect/train-3/weights/best.pt")

model.predict(
    source="C:\\Users\\Steve Jose\\GuardianX\\video6125123190915079871.mp4",
    show=True,
    conf=0.5
)