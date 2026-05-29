import { api } from "../lib/api";
import type { AuthResponse, User } from "../types";

export async function loginRequest(email: string, password: string) {
  const { data } = await api.post<AuthResponse>("/auth/login", { email, password });
  return data;
}

export async function registerRequest(name: string, email: string, password: string) {
  const { data } = await api.post<AuthResponse>("/auth/register", { name, email, password });
  return data;
}

export async function meRequest() {
  const { data } = await api.get<{ user: User }>("/auth/me");
  return data.user;
}

export function getStravaLoginUrl(options?: { forceApproval?: boolean }) {
  const baseURL = api.defaults.baseURL ?? "http://localhost:8080";
  const url = new URL("/auth/strava/login", baseURL);

  if (options?.forceApproval) {
    url.searchParams.set("approval_prompt", "force");
  }

  return url.toString();
}

export async function updateProfilePhotoRequest(file: File) {
  const formData = new FormData();
  formData.append("image", file);

  const { data } = await api.patch<{ user: User }>("/auth/me/photo", formData, {
    headers: { "Content-Type": "multipart/form-data" }
  });
  return data.user;
}
