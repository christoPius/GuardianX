# Frontend video-upload integration

The dashboard's Live View now supports selecting a video, local preview, upload, and start/stop monitoring controls. Existing dashboard, incidents, configuration, and evidence components are preserved.

## Required FastAPI contract (must be implemented on backend)

### `POST /api/sources/video/upload`
Multipart form field: `file`.

Successful JSON response:
```json
{"sourceId":"uploaded-video-<id>","filename":"sample.mp4"}
```
The backend must validate the file, store it in a dedicated upload directory, and retain a mapping from `sourceId` to the saved path.

### `POST /api/monitoring/start`
JSON request:
```json
{"sourceId":"uploaded-video-<id>"}
```
Successful JSON response:
```json
{"isRunning":true,"activeSourceId":"uploaded-video-<id>"}
```
This endpoint must launch the existing detection pipeline against the stored path for that source. It must not merely update the monitoring status flag. It should reject a start request if a monitoring process is already running.

### `POST /api/monitoring/stop`
Successful JSON response:
```json
{"isRunning":false,"activeSourceId":null}
```
This endpoint must stop the running detection process cleanly and update status.

## Important

These frontend calls are wired to the contract above, but the uploaded backend `main.py` did not yet implement these three endpoints. Until they are implemented, the frontend will display an API error when upload/start/stop is attempted. The existing `POST /api/monitoring/status` route only updates a flag and is not a substitute for starting the Python detector.

The local browser preview is not the processed detection stream. Inference, incident creation, snapshots, and H.264 clip generation remain backend responsibilities.
