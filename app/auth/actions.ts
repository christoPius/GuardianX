"use server";

import { redirect } from "next/navigation";
import { authenticate } from "@/lib/auth/credentials";
import { createSession } from "@/lib/auth/session";
import { clearSession, setSession } from "@/lib/auth/server";

export type LoginActionState = { error?: string } | undefined;

function safeNextPath(value: FormDataEntryValue | null): string {
  if (typeof value !== "string" || !value.startsWith("/") || value.startsWith("//")) return "/dashboard";
  return value;
}

export async function login(_: LoginActionState, formData: FormData): Promise<LoginActionState> {
  const email = formData.get("email");
  const password = formData.get("password");

  if (typeof email !== "string" || typeof password !== "string" || !email.trim() || !password) {
    return { error: "Enter your email and password." };
  }

  const user = await authenticate(email, password);
  if (!user) return { error: "The email or password is incorrect." };

  const session = await createSession(user.email, user.name);
  if (!session) return { error: "Authentication is not configured. Contact an administrator." };

  await setSession(session);
  redirect(safeNextPath(formData.get("next")));
}

export async function logout(): Promise<never> {
  await clearSession();
  redirect("/login");
}
