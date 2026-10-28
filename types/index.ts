// ---------------------------------------------------------------------------
// NightGuard AI — shared domain types
//
// These types describe the data contract the frontend expects from the
// FastAPI backend. Until the real API exists, `lib/mock` implements this
// same shape so the UI never has to change when the backend comes online.
// ---------------------------------------------------------------------------

export type Severity = "low" | "medium" | "high";

export type EventType =
  | "loitering"
  | "restricted_zone_entry"
  | "boundary_crossing"
  | "possible_wall_climbing";

export type ReviewStatus = "unreviewed" | "confirmed" | "false_alarm";

export type ConnectionStatus = "online" | "offline" | "connecting" | "error";

export interface CameraSource {
  id: string;
  displayName: string;
  sourceType: "rtsp" | "usb" | "file" | "onvif";
  /** Never the full private URL — a redacted label only, e.g. "rtsp://•••@192.168.1.42/stream1" */
  connectionLabel: string;
  status: ConnectionStatus;
  lastSeenAt: string | null;
  hasZoneConfigured: boolean;
  hasWallConfigured: boolean;
}

export interface NormalizedPoint {
  /** 0–1, relative to frame width */
  x: number;
  /** 0–1, relative to frame height */
  y: number;
}

export interface ZoneConfiguration {
  sourceId: string;
  /** Ordered polygon points, normalized 0–1. Empty if not yet configured. */
  points: NormalizedPoint[];
  updatedAt: string | null;
}

export interface WallConfiguration {
  sourceId: string;
  /** Ordered points describing the wall/boundary line or region, normalized 0–1. */
  points: NormalizedPoint[];
  updatedAt: string | null;
}

export interface MonitoringSettings {
  sourceId: string;
  monitoringStartTime: string; // "HH:mm"
  monitoringEndTime: string; // "HH:mm"
  loiteringDurationSeconds: number;
  confidenceThreshold: number; // 0–1
  alertCutoffScore: number; // 0–100, incidents below this are logged but not alerted
}

export interface EvidenceFactor {
  label: string;
  points: number;
}

export interface EvidenceAsset {
  snapshotUrl: string | null;
  clipUrl: string | null;
}

export interface OwnerFeedback {
  status: ReviewStatus;
  note: string | null;
  reviewedAt: string | null;
}

export interface Incident {
  id: string;
  sourceId: string;
  sourceName: string;
  eventType: EventType;
  severity: Severity;
  score: number;
  trackId: number;
  startedAt: string;
  endedAt: string | null;
  evidenceFactors: EvidenceFactor[];
  explanation: string;
  evidence: EvidenceAsset;
  feedback: OwnerFeedback;
}

export interface MonitoringStatus {
  isRunning: boolean;
  activeSourceId: string | null;
  backendReachable: boolean;
  lastEventAt: string | null;
}

export interface IncidentFilters {
  severity?: Severity;
  eventType?: EventType;
  from?: string;
  to?: string;
}

/** Standard envelope every service call resolves to, mirroring a REST client. */
export type ApiResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: string };
