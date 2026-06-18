import { api } from "../lib/api";
import type { Order } from "../types";

export async function createOrder(payload: {
  season: string;
  payment_method: string;
  shipping_address: string;
  notes: string;
  user_coupon_id?: number;
  items: Array<{ product_id: number; quantity: number }>;
}) {
  const { data } = await api.post<Order>("/orders", payload);
  return data;
}

export async function fetchMyOrders() {
  const { data } = await api.get<Order[]>("/orders/my");
  return data;
}
