import { api } from "../lib/api";
import type { PointsResponse } from "../types";

export async function fetchMyPoints() {
  const { data } = await api.get<PointsResponse>("/points/my");
  return data;
}
