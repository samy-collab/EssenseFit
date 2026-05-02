import { useEffect, useState } from "react";
import { fetchMyOrders } from "../services/orderService";
import type { Order } from "../types";

export function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    fetchMyOrders().then(setOrders).catch(() => setOrders([]));
  }, []);

  return (
    <section className="card">
      <h2 className="section-title">Meus pedidos</h2>
      <div className="mt-8 space-y-4">
        {orders.map((order) => (
          <div key={order.id} className="rounded-[24px] border border-espresso/10 bg-white/70 p-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.2em] text-clay">Pedido #{order.order_number}</p>
                <h3 className="mt-1 text-xl font-semibold text-espresso">{order.status}</h3>
              </div>
              <div className="text-sm text-espresso/70">
                {order.items.length} itens • {new Date(order.created_at).toLocaleDateString("pt-BR")}
              </div>
            </div>
            <p className="mt-4 text-lg font-bold text-espresso">R$ {order.total_amount.toFixed(2)}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
