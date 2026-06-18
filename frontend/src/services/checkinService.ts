import { api } from "../lib/api";
import type { CheckIn } from "../types";

export async function fetchMyCheckIns() {
  const { data } = await api.get<CheckIn[]>("/checkins/my");
  return data;
}

export async function createCheckIn(payload: {
  activity_type: string;
  duration_min: number;
  calories_burned?: number;
  description: string;
  date: string;
  image?: string;
}) {
  const { data } = await api.post<CheckIn>("/checkins", payload);
  return data;
}

export async function uploadCheckInImage(file: File) {
  const formData = new FormData();
  formData.append("image", file);

  const { data } = await api.post<{ url: string }>("/uploads", formData);

  return data.url;
}
