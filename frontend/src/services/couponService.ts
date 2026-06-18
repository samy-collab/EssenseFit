import { api } from "../lib/api";
import type { Coupon } from "../types";

export async function fetchActiveCoupons() {
  const { data } = await api.get<Coupon[]>("/coupons");
  return data;
}

export async function fetchMyCoupons() {
  const { data } = await api.get<Array<{ id: number; status: "unused" | "used"; coupon: Coupon }>>("/coupons/my");
  return data;
}

export async function redeemCoupon(couponId: number) {
  const { data } = await api.post("/coupons/redeem", { coupon_id: couponId });
  return data;
}
