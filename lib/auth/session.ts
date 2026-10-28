export const SESSION_COOKIE = "nightguard_session";
const SESSION_DURATION_SECONDS = 60 * 60 * 8;

export interface AuthSession {
  email: string;
  name: string;
  exp: number;
}

function getSessionSecret(): string | null {
  const configuredSecret = process.env.AUTH_SESSION_SECRET;
  if (configuredSecret) return configuredSecret;

  // This lets a freshly cloned project run locally. Production deployments
  // must set a unique secret so sessions cannot be forged.
  return process.env.NODE_ENV === "production" ? null : "nightguard-local-development-secret";
}

function toBase64Url(value: string | Uint8Array): string {
  const bytes = typeof value === "string" ? new TextEncoder().encode(value) : value;
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function fromBase64UrlBytes(value: string): Uint8Array | null {
  try {
    const base64 = value.replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, "=");
    const binary = atob(padded);
    return Uint8Array.from(binary, (character) => character.charCodeAt(0));
  } catch {
    return null;
  }
}

function fromBase64Url(value: string): string | null {
  const bytes = fromBase64UrlBytes(value);
  return bytes ? new TextDecoder().decode(bytes) : null;
}

function toArrayBuffer(bytes: Uint8Array): ArrayBuffer {
  const copy = new Uint8Array(bytes.byteLength);
  copy.set(bytes);
  return copy.buffer;
}

async function signingKey(): Promise<CryptoKey | null> {
  const secret = getSessionSecret();
  if (!secret) return null;
  return crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"],
  );
}

export async function createSession(email: string, name: string): Promise<string | null> {
  const key = await signingKey();
  if (!key) return null;

  const payload: AuthSession = {
    email,
    name,
    exp: Math.floor(Date.now() / 1000) + SESSION_DURATION_SECONDS,
  };
  const encodedPayload = toBase64Url(JSON.stringify(payload));
  const signature = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(encodedPayload));
  return `${encodedPayload}.${toBase64Url(new Uint8Array(signature))}`;
}

export async function verifySession(value: string | undefined): Promise<AuthSession | null> {
  if (!value) return null;
  const [encodedPayload, encodedSignature, ...rest] = value.split(".");
  if (!encodedPayload || !encodedSignature || rest.length > 0) return null;

  const key = await signingKey();
  const signature = fromBase64UrlBytes(encodedSignature);
  const payload = fromBase64Url(encodedPayload);
  if (!key || !signature || !payload) return null;

  const valid = await crypto.subtle.verify(
    "HMAC",
    key,
    toArrayBuffer(signature),
    new TextEncoder().encode(encodedPayload),
  );
  if (!valid) return null;

  try {
    const parsed = JSON.parse(payload) as Partial<AuthSession>;
    if (
      typeof parsed.email !== "string" ||
      typeof parsed.name !== "string" ||
      typeof parsed.exp !== "number" ||
      parsed.exp <= Math.floor(Date.now() / 1000)
    ) {
      return null;
    }
    return { email: parsed.email, name: parsed.name, exp: parsed.exp };
  } catch {
    return null;
  }
}

export function sessionMaxAge(): number {
  return SESSION_DURATION_SECONDS;
}
