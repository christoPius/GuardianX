import type {
  ApiResult,
  CameraSource,
  Incident,
  IncidentFilters,
  MonitoringSettings,
  MonitoringStatus,
  OwnerFeedback,
  WallConfiguration,
  ZoneConfiguration,
} from "@/types";

// ---------------------------------------------------------------------------
// NightGuardApiClient — the single contract every screen talks to.
//
// Nothing in `app/` or `components/` should import from `lib/mock` or call
// `fetch` directly. They call `getApiClient()` from `lib/api/index.ts`,
// which resolves to either the mock implementation (`lib/mock/service.ts`)
// or the real FastAPI implementation (`lib/api/http-client.ts`) based on
// `NEXT_PUBLIC_API_BASE_URL`. Swapping backends never touches a component.
//
// EXPECTED FASTAPI CONTRACT (document for Rohith / backend integration):
//   GET    /api/monitoring/status
//   GET    /api/sources
//   GET    /api/incidents?severity=&eventType=&from=&to=
//   GET    /api/incidents/{id}
//   POST   /api/incidents/{id}/feedback        { status, note }
//   GET    /api/sources/{id}/zone
//   PUT    /api/sources/{id}/zone               { points }
//   GET    /api/sources/{id}/wall
//   PUT    /api/sources/{id}/wall                { points }
//   GET    /api/sources/{id}/settings
//   PUT    /api/sources/{id}/settings            MonitoringSettings
//   POST   /api/sources/{id}/test-connection
// If the real routes differ, adapt `http-client.ts` — never this contract
// or the components that depend on it, unless the mismatch is structural.
// ---------------------------------------------------------------------------

export interface NightGuardApiClient {
  getMonitoringStatus(): Promise<ApiResult<MonitoringStatus>>;

  getSources(): Promise<ApiResult<CameraSource[]>>;
  testSourceConnection(sourceId: string): Promise<ApiResult<{ status: "ok" | "failed"; message: string }>>;
  saveSource(source: CameraSource): Promise<ApiResult<CameraSource>>;

  getIncidents(filters?: IncidentFilters): Promise<ApiResult<Incident[]>>;
  getIncident(id: string): Promise<ApiResult<Incident>>;
  submitFeedback(incidentId: string, feedback: OwnerFeedback): Promise<ApiResult<Incident>>;

  getZoneConfiguration(sourceId: string): Promise<ApiResult<ZoneConfiguration>>;
  saveZoneConfiguration(zone: ZoneConfiguration): Promise<ApiResult<ZoneConfiguration>>;

  getWallConfiguration(sourceId: string): Promise<ApiResult<WallConfiguration>>;
  saveWallConfiguration(wall: WallConfiguration): Promise<ApiResult<WallConfiguration>>;

  getMonitoringSettings(sourceId: string): Promise<ApiResult<MonitoringSettings>>;
  saveMonitoringSettings(settings: MonitoringSettings): Promise<ApiResult<MonitoringSettings>>;
}
