import type { NightGuardApiClient } from "@/lib/api/contract";
import type { ApiResult } from "@/types";

// Real implementation, wired up against the FastAPI contract documented in
// `contract.ts`. Not exercised until NEXT_PUBLIC_API_BASE_URL is set — see
// `lib/api/index.ts` for the switch. If the backend's actual routes or
// payload shapes differ from what's assumed here, this is the file to
// adapt; the contract interface and the components that call it should not
// need to change unless the mismatch is structural.

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";

async function request<T>(path: string, init?: RequestInit): Promise<ApiResult<T>> {
  try {
    const res = await fetch(`${BASE_URL}${path}`, {
      ...init,
      headers: { "Content-Type": "application/json", ...init?.headers },
    });
    if (!res.ok) {
      return { ok: false, error: `Request failed (${res.status}): ${res.statusText}` };
    }
    const data = (await res.json()) as T;
    return { ok: true, data };
  } catch {
    return { ok: false, error: "Backend unreachable." };
  }
}

export const httpApiClient: NightGuardApiClient = {
  getMonitoringStatus: () => request("/api/monitoring/status"),

  getSources: () => request("/api/sources"),
  testSourceConnection: (sourceId) =>
    request(`/api/sources/${sourceId}/test-connection`, { method: "POST" }),
  saveSource: (source) =>
    request(`/api/sources/${source.id}`, { method: "PUT", body: JSON.stringify(source) }),

  getIncidents: (filters) => {
    const params = new URLSearchParams();
    if (filters?.severity) params.set("severity", filters.severity);
    if (filters?.eventType) params.set("eventType", filters.eventType);
    if (filters?.from) params.set("from", filters.from);
    if (filters?.to) params.set("to", filters.to);
    const qs = params.toString();
    return request(`/api/incidents${qs ? `?${qs}` : ""}`);
  },
  getIncident: (id) => request(`/api/incidents/${id}`),
  submitFeedback: (incidentId, feedback) =>
    request(`/api/incidents/${incidentId}/feedback`, {
      method: "POST",
      body: JSON.stringify(feedback),
    }),

  getZoneConfiguration: (sourceId) => request(`/api/sources/${sourceId}/zone`),
  saveZoneConfiguration: (zone) =>
    request(`/api/sources/${zone.sourceId}/zone`, { method: "PUT", body: JSON.stringify(zone) }),

  getWallConfiguration: (sourceId) => request(`/api/sources/${sourceId}/wall`),
  saveWallConfiguration: (wall) =>
    request(`/api/sources/${wall.sourceId}/wall`, { method: "PUT", body: JSON.stringify(wall) }),

  getMonitoringSettings: (sourceId) => request(`/api/sources/${sourceId}/settings`),
  saveMonitoringSettings: (settings) =>
    request(`/api/sources/${settings.sourceId}/settings`, {
      method: "PUT",
      body: JSON.stringify(settings),
    }),
};
