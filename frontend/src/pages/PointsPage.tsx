import { useEffect, useState } from "react";
import { fetchMyPoints } from "../services/pointsService";
import type { PointsResponse } from "../types";

export function PointsPage() {
  const [data, setData] = useState<PointsResponse | null>(null);

  useEffect(() => {
    fetchMyPoints().then(setData).catch(() => setData(null));
  }, []);

  return (
    <section className="space-y-6">
      <div className="grid gap-6 md:grid-cols-3">
        <div className="card bg-espresso text-white">
          <p className="text-sm uppercase tracking-[0.2em] text-white/70">Total de pontos</p>
          <p className="mt-4 font-display text-6xl">{data?.total_points ?? 0}</p>
        </div>
        <div className="card">
          <p className="text-sm uppercase tracking-[0.2em] text-clay">Check-ins</p>
          <p className="mt-4 font-display text-5xl">{data?.check_in_count ?? 0}</p>
        </div>
        <div className="card">
          <p className="text-sm uppercase tracking-[0.2em] text-clay">Cupons disponiveis</p>
          <p className="mt-4 font-display text-5xl">{data?.available_coupons.length ?? 0}</p>
        </div>
      </div>
      <div className="card">
        <h2 className="section-title">Historico de pontos</h2>
        <div className="mt-6 space-y-4">
          {data?.points_history.map((item) => (
            <div key={item.id} className="flex items-center justify-between rounded-[24px] border border-espresso/10 bg-white/70 p-5">
              <div>
                <p className="font-semibold capitalize text-espresso">{item.description}</p>
                <p className="text-sm text-espresso/70">{new Date(item.created_at).toLocaleDateString("pt-BR")}</p>
              </div>
              <span className="pill">{item.type === "debit" ? "-" : "+"}{item.points} pontos</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
