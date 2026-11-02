
from datetime import datetime
from threading import Lock
from typing import Any

from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from event_manager import create_event
from risk_engine import assess_risk
from incident_manager import create_incident
from incident_deduplicator import should_create_incident
import sqlite3
import json
from pathlib import Path
import shutil
from pathlib import Path
from uuid import uuid4

from fastapi import File, UploadFile
from fastapi.staticfiles import StaticFiles
import subprocess
import sys
from fastapi import Form
from fastapi.responses import JSONResponse

app = FastAPI(
    title="NightGuard AI API",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

DB_PATH = Path(__file__).resolve().parent / "nightguard.db"

SNAPSHOT_DIR = Path(__file__).resolve().parent / "evidence" / "snapshots"
SNAPSHOT_DIR.mkdir(parents=True, exist_ok=True)

CLIP_DIR = Path(__file__).resolve().parent / "evidence" / "clips"
CLIP_DIR.mkdir(parents=True, exist_ok=True)

app.mount(
    "/evidence/clips",
    StaticFiles(directory=str(CLIP_DIR)),
    name="clips",
)

app.mount(
    "/evidence/snapshots",
    StaticFiles(directory=str(SNAPSHOT_DIR)),
    name="snapshots",
)

incident_lock = Lock()
last_event_at: str | None = None


def get_db_connection():
    connection = sqlite3.connect(DB_PATH, timeout=10)
    connection.row_factory = sqlite3.Row
    return connection


def initialize_database():
    with get_db_connection() as connection:
        connection.execute("""
            CREATE TABLE IF NOT EXISTS incidents (
                id TEXT PRIMARY KEY,
                started_at TEXT NOT NULL,
                data_json TEXT NOT NULL
            )
        """)


initialize_database()


monitoring_running = False
active_source_id = None

BASE_DIR = Path(__file__).resolve().parent

UPLOAD_DIR = BASE_DIR / "uploads" / "videos"
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

# Uploaded sources available during the current backend session.
uploaded_sources: dict[str, dict[str, str]] = {}

# Detector subprocess management.
detector_process: subprocess.Popen | None = None
monitoring_lock = Lock()

MAX_VIDEO_SIZE = 500 * 1024 * 1024  # 500 MB
ALLOWED_VIDEO_EXTENSIONS = {".mp4", ".avi", ".mov", ".mkv"}


def to_frontend_incident(raw: dict[str, Any]) -> dict[str, Any]:
    event_type = raw.get("event_type")

    event_type_map = {
        "loitering": "loitering",
        "zone_entry": "restricted_zone_entry",
        "zone_exit": "restricted_zone_entry",
        "line_crossing": "boundary_crossing",
        "wall_climbing": "possible_wall_climbing",
    }

    severity = str(raw.get("risk_level", "LOW")).lower()
    if severity not in {"low", "medium", "high"}:
        severity = "low"

    timestamp = raw.get("timestamp") or datetime.now().isoformat()

    return {
        "id": raw["incident_id"],
        "sourceId": active_source_id or "local-video",
        "sourceName": (
            uploaded_sources.get(active_source_id, {}).get("filename", "Local video")
            if active_source_id
            else "Local video"
        ),
        "eventType": event_type_map.get(event_type, "boundary_crossing"),
        "severity": severity,
        "score": float(raw.get("risk_score") or 0),
        "trackId": int(raw.get("track_id") or 0),
        "startedAt": timestamp,
        "endedAt": None,
        "evidenceFactors": [
            {
                "label": raw.get("event_type", "event"),
                "points": float(raw.get("risk_score") or 0),
            }
        ],
        "explanation": raw.get("reason") or "Event detected",
        "evidence": {
            "snapshotUrl": raw.get("snapshot_url"),
            "clipUrl": None,
        },
        "feedback": {
            "status": "unreviewed",
            "note": None,
            "reviewedAt": None,
        },
    }


class EventRequest(BaseModel):
    event_type: str
    track_id: int
    confidence: float = 0.0
    zone: str | None = None
    direction: str | None = None
    snapshot_url: str | None = None


@app.get("/api/monitoring/status")
def get_monitoring_status():
    return {
        "isRunning": monitoring_running,
        "activeSourceId": active_source_id,
        "backendReachable": True,
        "lastEventAt": last_event_at,
    }

class StartMonitoringRequest(BaseModel):
    sourceId: str


@app.post("/api/monitoring/start")
def start_monitoring(payload: StartMonitoringRequest):
    global detector_process, monitoring_running, active_source_id

    with monitoring_lock:
        if detector_process is not None and detector_process.poll() is None:
            raise HTTPException(
                status_code=409,
                detail="Monitoring is already running.",
            )

        source = uploaded_sources.get(payload.sourceId)

        if source is None:
            raise HTTPException(
                status_code=404,
                detail="Uploaded video source not found. Upload it again.",
            )

        video_path = Path(source["path"])

        if not video_path.is_file():
            raise HTTPException(
                status_code=404,
                detail="Uploaded video file does not exist.",
            )

        try:
            detector_process = subprocess.Popen(
                [
                    sys.executable,
                    str(BASE_DIR / "predict.py"),
                    "--video",
                    str(video_path),
                    "--source-id",
                    payload.sourceId,
                ],
                cwd=str(BASE_DIR),
            )

        except OSError as exc:
            detector_process = None
            raise HTTPException(
                status_code=500,
                detail=f"Could not start detector: {exc}",
            )

        monitoring_running = True
        active_source_id = payload.sourceId

    return {
        "isRunning": True,
        "activeSourceId": payload.sourceId,
    }


@app.post("/api/monitoring/stop")
def stop_monitoring():
    global detector_process, monitoring_running, active_source_id

    with monitoring_lock:
        if detector_process is not None:
            if detector_process.poll() is None:
                detector_process.terminate()

                try:
                    detector_process.wait(timeout=10)
                except subprocess.TimeoutExpired:
                    detector_process.kill()
                    detector_process.wait()

            detector_process = None

        monitoring_running = False
        active_source_id = None

    return {
        "isRunning": False,
        "activeSourceId": None,
    }

@app.post("/api/monitoring/status")
def update_monitoring_status(payload: dict):
    global monitoring_running, active_source_id

    monitoring_running = bool(payload.get("isRunning", False))
    active_source_id = (
        payload.get("activeSourceId")
        if monitoring_running
        else None
    )

    return {
        "ok": True,
        "isRunning": monitoring_running,
        "activeSourceId": active_source_id,
    }




@app.post("/api/sources/video/upload")
def upload_video(file: UploadFile = File(...)):
    original_name = Path(file.filename or "").name
    extension = Path(original_name).suffix.lower()

    if extension not in ALLOWED_VIDEO_EXTENSIONS:
        raise HTTPException(
            status_code=415,
            detail="Unsupported video format. Use MP4, AVI, MOV or MKV.",
        )

    source_id = f"uploaded-video-{uuid4().hex[:12]}"
    filename = f"{source_id}{extension}"
    destination = UPLOAD_DIR / filename

    total_size = 0

    try:
        with destination.open("wb") as output:
            while True:
                chunk = file.file.read(1024 * 1024)

                if not chunk:
                    break

                total_size += len(chunk)

                if total_size > MAX_VIDEO_SIZE:
                    raise HTTPException(
                        status_code=413,
                        detail="Video exceeds the 500 MB upload limit.",
                    )

                output.write(chunk)

    except Exception:
        destination.unlink(missing_ok=True)
        raise

    finally:
        file.file.close()

    uploaded_sources[source_id] = {
        "sourceId": source_id,
        "filename": original_name,
        "path": str(destination),
    }

    return {
        "sourceId": source_id,
        "filename": original_name,
    }


@app.get("/api/sources")
def get_sources():
    return [
        {
            "id": source["sourceId"],
            "name": source["filename"],
            "type": "video",
            "status": "available",
        }
        for source in uploaded_sources.values()
    ]



@app.get("/api/incidents")
def get_incidents(
    severity: str | None = None,
    eventType: str | None = Query(default=None, alias="eventType"),
    from_: str | None = Query(default=None, alias="from"),
    to: str | None = None,
):
    with get_db_connection() as connection:
        rows = connection.execute(
            "SELECT data_json FROM incidents ORDER BY started_at DESC"
        ).fetchall()

    result = [json.loads(row["data_json"]) for row in rows]

    if severity:
        result = [
            item for item in result
            if item["severity"] == severity.lower()
        ]

    if eventType:
        result = [
            item for item in result
            if item["eventType"] == eventType
        ]

    if from_:
        result = [
            item for item in result
            if item["startedAt"] >= from_
        ]

    if to:
        result = [
            item for item in result
            if item["startedAt"] <= to
        ]

    return result


@app.get("/api/incidents/{incident_id}")
def get_incident(incident_id: str):
    with get_db_connection() as connection:
        row = connection.execute(
            "SELECT data_json FROM incidents WHERE id = ?",
            (incident_id,),
        ).fetchone()

    if row is None:
        raise HTTPException(
            status_code=404,
            detail="Incident not found",
        )

    return json.loads(row["data_json"])


@app.post("/api/evidence/snapshot")
def upload_snapshot(file: UploadFile = File(...)):
    if file.content_type != "image/jpeg":
        raise HTTPException(
            status_code=415,
            detail="Only JPEG snapshots are accepted",
        )

    filename = f"{uuid4().hex}.jpg"
    destination = SNAPSHOT_DIR / filename

    try:
        with destination.open("wb") as output:
            shutil.copyfileobj(file.file, output)
    finally:
        file.file.close()

    return {
        "snapshotUrl": f"/evidence/snapshots/{filename}"
    }

@app.post("/api/incidents/{incident_id}/evidence/clip")
def upload_incident_clip(
    incident_id: str,
    file: UploadFile = File(...),
):
    if file.content_type != "video/mp4":
        raise HTTPException(
            status_code=415,
            detail="Only MP4 clips are accepted",
        )

    with get_db_connection() as connection:
        row = connection.execute(
            "SELECT data_json FROM incidents WHERE id = ?",
            (incident_id,),
        ).fetchone()

        if row is None:
            raise HTTPException(
                status_code=404,
                detail="Incident not found",
            )

        incident = json.loads(row["data_json"])

        filename = f"{uuid4().hex}.mp4"
        destination = CLIP_DIR / filename

        try:
            with destination.open("wb") as output:
                shutil.copyfileobj(file.file, output)
        finally:
            file.file.close()

        incident["evidence"]["clipUrl"] = (
            f"/evidence/clips/{filename}"
        )

        connection.execute(
            "UPDATE incidents SET data_json = ? WHERE id = ?",
            (json.dumps(incident), incident_id),
        )

    return {
        "incidentId": incident_id,
        "clipUrl": incident["evidence"]["clipUrl"],
    }


@app.post("/api/events", status_code=201)
def receive_event(payload: EventRequest):
    global last_event_at

    event = create_event(
        event_type=payload.event_type,
        track_id=payload.track_id,
        confidence=payload.confidence,
        zone=payload.zone,
        direction=payload.direction,
    )

    if not should_create_incident(event):
        return {"created": False, "reason": "duplicate", "incident": None}

    risk_result = assess_risk(event)
    raw_incident = create_incident(event, risk_result)
    raw_incident["snapshot_url"] = payload.snapshot_url
    frontend_incident = to_frontend_incident(raw_incident)

    with incident_lock:
        with get_db_connection() as connection:
            connection.execute(
                """
                INSERT OR IGNORE INTO incidents
                    (id, started_at, data_json)
                VALUES (?, ?, ?)
                """,
                (
                    frontend_incident["id"],
                    frontend_incident["startedAt"],
                    json.dumps(frontend_incident),
                ),
        )

        last_event_at = event["timestamp"]

    return {"created": True, "incident": frontend_incident}
