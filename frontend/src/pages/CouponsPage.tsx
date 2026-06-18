import { useEffect, useState } from "react";
import { fetchMyCoupons } from "../services/couponService";
import type { Coupon } from "../types";

export function CouponsPage() {
  const [coupons, setCoupons] = useState<Array<{ id: number; status: "unused" | "used"; coupon: Coupon }>>([]);

  useEffect(() => {
    fetchMyCoupons().then(setCoupons).catch(() => setCoupons([]));
  }, []);

  return (
    <section className="card">
      <h2 className="section-title">Meus cupons</h2>
      <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {coupons.map((entry) => (
          <article key={entry.id} className="rounded-[26px] border border-espresso/10 bg-white/75 p-6">
            <p className="pill">{entry.coupon.code}</p>
            <h3 className="mt-4 font-display text-3xl text-espresso">{entry.coupon.title}</h3>
            <p className="mt-3 text-sm text-espresso/70">{entry.coupon.points_required === 0 ? "Recompensa automática de check-in" : `Resgate: ${entry.coupon.points_required} pontos`}</p>
            <p className="mt-2 text-sm text-espresso/70">Desconto: {entry.coupon.discount_value}%</p>
            <p className="mt-2 text-sm text-espresso/70">Valido até {entry.coupon.expires_at ? new Date(entry.coupon.expires_at).toLocaleDateString("pt-BR") : "sem vencimento"}</p>
            <div className="mt-6 flex items-center justify-between">
              <span className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] ${
                entry.status === "used" ? "bg-espresso/10 text-espresso" : "bg-clay text-white"
              }`}>
                {entry.status === "used" ? "Usado" : "Não usado"}
              </span>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
