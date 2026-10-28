import type {
  CameraSource,
  Incident,
  MonitoringSettings,
  MonitoringStatus,
  WallConfiguration,
  ZoneConfiguration,
} from "@/types";

// ---------------------------------------------------------------------------
// DEMO / MOCK DATA — clearly boundaried here so it is obvious what is real
// (structure, types, UI behavior) vs. placeholder (the actual numbers).
// None of this is a system metric; it exists only to exercise every UI state.
// ---------------------------------------------------------------------------

const now = Date.now();
const minutesAgo = (m: number) => new Date(now - m * 60_000).toISOString();

export const MOCK_SOURCES: CameraSource[] = [
  {
    id: "src-rear",
    displayName: "Rear Perimeter",
    sourceType: "rtsp",
    connectionLabel: "rtsp://•••@192.168.1.42/stream1",
    status: "online",
    lastSeenAt: minutesAgo(0.2),
    hasZoneConfigured: true,
    hasWallConfigured: true,
  },
  {
    id: "src-gate",
    displayName: "Front Gate",
    sourceType: "onvif",
    connectionLabel: "onvif://•••@192.168.1.44/onvif1",
    status: "online",
    lastSeenAt: minutesAgo(1),
    hasZoneConfigured: true,
    hasWallConfigured: false,
  },
  {
    id: "src-side",
    displayName: "Side Alley",
    sourceType: "usb",
    connectionLabel: "USB camera 0",
    status: "offline",
    lastSeenAt: minutesAgo(340),
    hasZoneConfigured: false,
    hasWallConfigured: false,
  },
];

export const MOCK_MONITORING_STATUS: MonitoringStatus = {
  isRunning: true,
  activeSourceId: "src-rear",
  backendReachable: true,
  lastEventAt: minutesAgo(12),
};

export const MOCK_INCIDENTS: Incident[] = [
  {
    id: "inc-1001",
    sourceId: "src-rear",
    sourceName: "Rear Perimeter",
    eventType: "possible_wall_climbing",
    severity: "high",
    score: 70,
    trackId: 7,
    startedAt: minutesAgo(12),
    endedAt: minutesAgo(11.6),
    evidenceFactors: [
      { label: "Near wall", points: 10 },
      { label: "Restricted zone entered", points: 30 },
      { label: "Possible wall climbing", points: 40 },
    ],
    explanation:
      "Possible wall climbing detected. Track 7 approached the rear wall, showed sustained upward movement for 1.8 seconds, and crossed from the external region into the restricted zone.",
    evidence: {
      snapshotUrl: "/mock/evidence/wall-climb-snapshot.svg",
      clipUrl: "/mock/evidence/wall-climb-clip.mp4",
    },
    feedback: { status: "unreviewed", note: null, reviewedAt: null },
  },
  {
    id: "inc-1000",
    sourceId: "src-gate",
    sourceName: "Front Gate",
    eventType: "restricted_zone_entry",
    severity: "medium",
    score: 45,
    trackId: 4,
    startedAt: minutesAgo(58),
    endedAt: minutesAgo(57.5),
    evidenceFactors: [
      { label: "During monitoring hours", points: 15 },
      { label: "Restricted zone entered", points: 30 },
    ],
    explanation:
      "Track 4 entered the configured restricted zone near the front gate during active monitoring hours. No boundary crossing or climbing behavior was observed.",
    evidence: {
      snapshotUrl: "/mock/evidence/zone-entry-snapshot.svg",
      clipUrl: "/mock/evidence/zone-entry-clip.mp4",
    },
    feedback: { status: "unreviewed", note: null, reviewedAt: null },
  },
  {
    id: "inc-0998",
    sourceId: "src-rear",
    sourceName: "Rear Perimeter",
    eventType: "loitering",
    severity: "low",
    score: 15,
    trackId: 2,
    startedAt: minutesAgo(190),
    endedAt: minutesAgo(186),
    evidenceFactors: [{ label: "Loitering detected", points: 15 }],
    explanation:
      "Track 2 remained in the monitored area for longer than the configured loitering duration without entering a restricted zone.",
    evidence: {
      snapshotUrl: "/mock/evidence/loitering-snapshot.svg",
      clipUrl: "/mock/evidence/loitering-clip.mp4",
    },
    feedback: { status: "unreviewed", note: null, reviewedAt: null },
  },
  {
    id: "inc-0991",
    sourceId: "src-gate",
    sourceName: "Front Gate",
    eventType: "boundary_crossing",
    severity: "medium",
    score: 35,
    trackId: 1,
    startedAt: minutesAgo(410),
    endedAt: minutesAgo(409.6),
    evidenceFactors: [{ label: "Boundary crossed", points: 20 }, { label: "During monitoring hours", points: 15 }],
    explanation:
      "Track 1 crossed the configured boundary line at the front gate during active monitoring hours.",
    evidence: {
      snapshotUrl: "/mock/evidence/boundary-snapshot.svg",
      clipUrl: null,
    },
    feedback: {
      status: "false_alarm",
      note: "Delivery courier, expected — matches the 6pm parcel drop-off.",
      reviewedAt: minutesAgo(400),
    },
  },
  {
    id: "inc-0987",
    sourceId: "src-rear",
    sourceName: "Rear Perimeter",
    eventType: "possible_wall_climbing",
    severity: "high",
    score: 90,
    trackId: 9,
    startedAt: minutesAgo(1400),
    endedAt: null,
    evidenceFactors: [
      { label: "Restricted zone entered", points: 30 },
      { label: "Possible wall climbing", points: 40 },
      { label: "Multiple people involved", points: 10 },
      { label: "During monitoring hours", points: 15 },
    ],
    explanation:
      "Track 9 and a second, unresolved track were observed near the rear wall with sustained upward movement. Evidence capture for this incident did not complete before the source disconnected.",
    evidence: {
      snapshotUrl: null,
      clipUrl: null,
    },
    feedback: { status: "unreviewed", note: null, reviewedAt: null },
  },
  {
    id: "inc-0980",
    sourceId: "src-gate",
    sourceName: "Front Gate",
    eventType: "loitering",
    severity: "low",
    score: 15,
    trackId: 3,
    startedAt: minutesAgo(2200),
    endedAt: minutesAgo(2195),
    evidenceFactors: [{ label: "Loitering detected", points: 15 }],
    explanation:
      "Track 3 remained near the front gate longer than the configured loitering duration.",
    evidence: {
      snapshotUrl: "/mock/evidence/loitering-2-snapshot.svg",
      clipUrl: null,
    },
    feedback: {
      status: "confirmed",
      note: "Watched the clip — unfamiliar person waiting by the gate for several minutes.",
      reviewedAt: minutesAgo(2100),
    },
  },
];

export const MOCK_ZONES: Record<string, ZoneConfiguration> = {
  "src-rear": {
    sourceId: "src-rear",
    points: [
      { x: 0.62, y: 0.35 },
      { x: 0.93, y: 0.4 },
      { x: 0.9, y: 0.82 },
      { x: 0.58, y: 0.78 },
    ],
    updatedAt: minutesAgo(4000),
  },
  "src-gate": {
    sourceId: "src-gate",
    points: [
      { x: 0.15, y: 0.2 },
      { x: 0.45, y: 0.22 },
      { x: 0.4, y: 0.6 },
      { x: 0.1, y: 0.55 },
    ],
    updatedAt: minutesAgo(6000),
  },
  "src-side": { sourceId: "src-side", points: [], updatedAt: null },
};

export const MOCK_WALLS: Record<string, WallConfiguration> = {
  "src-rear": {
    sourceId: "src-rear",
    points: [
      { x: 0.55, y: 0.15 },
      { x: 0.97, y: 0.22 },
    ],
    updatedAt: minutesAgo(4000),
  },
  "src-gate": { sourceId: "src-gate", points: [], updatedAt: null },
  "src-side": { sourceId: "src-side", points: [], updatedAt: null },
};

export const MOCK_SETTINGS: Record<string, MonitoringSettings> = {
  "src-rear": {
    sourceId: "src-rear",
    monitoringStartTime: "20:00",
    monitoringEndTime: "06:00",
    loiteringDurationSeconds: 90,
    confidenceThreshold: 0.6,
    alertCutoffScore: 30,
  },
  "src-gate": {
    sourceId: "src-gate",
    monitoringStartTime: "21:00",
    monitoringEndTime: "05:30",
    loiteringDurationSeconds: 120,
    confidenceThreshold: 0.65,
    alertCutoffScore: 30,
  },
  "src-side": {
    sourceId: "src-side",
    monitoringStartTime: "20:00",
    monitoringEndTime: "06:00",
    loiteringDurationSeconds: 90,
    confidenceThreshold: 0.6,
    alertCutoffScore: 30,
  },
};
