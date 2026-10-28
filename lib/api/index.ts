import type { NightGuardApiClient } from "@/lib/api/contract";
import { mockApiClient } from "@/lib/mock/service";
import { httpApiClient } from "@/lib/api/http-client";

// UI code and components must import `getApiClient` from here — never
// `lib/mock` or `lib/api/http-client` directly. This is the integration
// boundary: set NEXT_PUBLIC_API_BASE_URL once FastAPI is deployed and the
// entire app switches from mock data to the real backend with no other
// changes.
export function getApiClient(): NightGuardApiClient {
  const hasRealBackend = Boolean(process.env.NEXT_PUBLIC_API_BASE_URL);
  return hasRealBackend ? httpApiClient : mockApiClient;
}

export const usingMockBackend = !process.env.NEXT_PUBLIC_API_BASE_URL;

export type { NightGuardApiClient } from "@/lib/api/contract";
