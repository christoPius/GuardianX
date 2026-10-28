export interface AuthUser {
  email: string;
  name: string;
}

const LOCAL_DEMO_EMAIL = "admin@nightguard.local";
const LOCAL_DEMO_PASSWORD = "nightguard-demo";

function configuredCredentials(): { user: AuthUser; password: string } | null {
  const email = process.env.AUTH_USER_EMAIL;
  const password = process.env.AUTH_USER_PASSWORD;

  if (email && password) {
    return {
      user: { email, name: process.env.AUTH_USER_NAME ?? "NightGuard Administrator" },
      password,
    };
  }

  if (process.env.NODE_ENV !== "production") {
    return {
      user: { email: LOCAL_DEMO_EMAIL, name: "NightGuard Administrator" },
      password: LOCAL_DEMO_PASSWORD,
    };
  }

  return null;
}

export function isUsingLocalDemoCredentials(): boolean {
  return !process.env.AUTH_USER_EMAIL && process.env.NODE_ENV !== "production";
}

export async function authenticate(email: string, password: string): Promise<AuthUser | null> {
  const configured = configuredCredentials();
  if (!configured) return null;

  return email.trim().toLowerCase() === configured.user.email.toLowerCase() && password === configured.password
    ? configured.user
    : null;
}
