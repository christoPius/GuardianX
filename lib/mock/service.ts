import type { NightGuardApiClient } from "@/lib/api/contract";
import type {
  ApiResult,
  CameraSource,
  Incident,
  IncidentFilters,
  MonitoringSettings,
  WallConfiguration,
  ZoneConfiguration,
} from "@/types";
import {
  MOCK_INCIDENTS,
  MOCK_MONITORING_STATUS,
  MOCK_SETTINGS,
  MOCK_SOURCES,
  MOCK_WALLS,
  MOCK_ZONES,
} from "@/lib/mock/data";

// In-memory mutable copies so feedback/config edits persist for the session,
// the way they would round-trip through a real backend.
const incidents: Incident[] = MOCK_INCIDENTS.map((i) => ({ ...i }));
let sources: CameraSource[] = MOCK_SOURCES.map((s) => ({ ...s }));
const zones: Record<string, ZoneConfiguration> = structuredClone(MOCK_ZONES);
const walls: Record<string, WallConfiguration> = structuredClone(MOCK_WALLS);
const settings: Record<string, MonitoringSettings> = structuredClone(MOCK_SETTINGS);

const LATENCY_MS = 350;
const delay = <T,>(value: T): Promise<T> =>
  new Promise((resolve) => setTimeout(() => resolve(value), LATENCY_MS));

function ok<T>(data: T): ApiResult<T> {
  return { ok: true, data };
}

export const mockApiClient: NightGuardApiClient = {
  async getMonitoringStatus() {
    return delay(ok({ ...MOCK_MONITORING_STATUS }));
  },

  async getSources() {
    return delay(ok(sources.map((s) => ({ ...s }))));
  },

  async testSourceConnection(sourceId) {
    const source = sources.find((s) => s.id === sourceId);
    if (!source) return delay({ ok: false, error: "Unknown source." });
    if (source.status === "offline") {
      return delay(ok({ status: "failed" as const, message: "No response from source. Check the connection and try again." }));
    }
    return delay(ok({ status: "ok" as const, message: "Connection succeeded." }));
  },

  async saveSource(source) {
    sources = sources.map((s) => (s.id === source.id ? { ...source } : s));
    return delay(ok({ ...source }));
  },

  async getIncidents(filters?: IncidentFilters) {
    let result = [...incidents];
    if (filters?.severity) {
      result = result.filter((i) => i.severity === filters.severity);
    }
    if (filters?.eventType) {
      result = result.filter((i) => i.eventType === filters.eventType);
    }
    if (filters?.from) {
      const from = new Date(filters.from).getTime();
      result = result.filter((i) => new Date(i.startedAt).getTime() >= from);
    }
    if (filters?.to) {
      const to = new Date(filters.to).getTime();
      result = result.filter((i) => new Date(i.startedAt).getTime() <= to);
    }
    result.sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime());
    return delay(ok(result));
  },

  async getIncident(id) {
    const incident = incidents.find((i) => i.id === id);
    if (!incident) return delay({ ok: false, error: "Incident not found." });
    return delay(ok({ ...incident }));
  },

  async submitFeedback(incidentId, feedback) {
    const incident = incidents.find((i) => i.id === incidentId);
    if (!incident) return delay({ ok: false, error: "Incident not found." });
    incident.feedback = { ...feedback, reviewedAt: new Date().toISOString() };
    return delay(ok({ ...incident }));
  },

  async getZoneConfiguration(sourceId) {
    const zone = zones[sourceId] ?? { sourceId, points: [], updatedAt: null };
    return delay(ok({ ...zone }));
  },

  async saveZoneConfiguration(zone) {
    zones[zone.sourceId] = { ...zone, updatedAt: new Date().toISOString() };
    const source = sources.find((s) => s.id === zone.sourceId);
    if (source) source.hasZoneConfigured = zone.points.length >= 3;
    return delay(ok({ ...zones[zone.sourceId] }));
  },

  async getWallConfiguration(sourceId) {
    const wall = walls[sourceId] ?? { sourceId, points: [], updatedAt: null };
    return delay(ok({ ...wall }));
  },

  async saveWallConfiguration(wall) {
    walls[wall.sourceId] = { ...wall, updatedAt: new Date().toISOString() };
    const source = sources.find((s) => s.id === wall.sourceId);
    if (source) source.hasWallConfigured = wall.points.length >= 2;
    return delay(ok({ ...walls[wall.sourceId] }));
  },

  async getMonitoringSettings(sourceId) {
    const s = settings[sourceId] ?? {
      sourceId,
      monitoringStartTime: "20:00",
      monitoringEndTime: "06:00",
      loiteringDurationSeconds: 90,
      confidenceThreshold: 0.6,
      alertCutoffScore: 30,
    };
    return delay(ok({ ...s }));
  },

  async saveMonitoringSettings(next) {
    settings[next.sourceId] = { ...next };
    return delay(ok({ ...next }));
  },
};
