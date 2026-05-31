import { api } from "../lib/api";
import type { User } from "../types";

export async function topUpAccountCredit(payload: { amount: number; payment_method: string }) {
  const { data } = await api.post<{ user: User }>("/account-credit/top-up", payload);
  return data.user;
}
