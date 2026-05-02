import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { createOrder } from "../services/orderService";

export function CartPage() {
  const { items, total, updateQuantity, clearCart } = useCart();
  const { refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [shippingAddress, setShippingAddress] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("pix");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleCreateOrder() {
    if (items.length === 0) {
      setError("Adicione produtos ao carrinho.");
      return;
    }

    try {
      setLoading(true);
      setError("");
      await createOrder({
        season: items[0]?.product.season ?? "outono",
        payment_method: paymentMethod,
        shipping_address: shippingAddress,
        notes,
        items: items.map((item) => ({
          product_id: item.product.id,
          quantity: item.quantity
        }))
      });
      clearCart();
      await refreshProfile();
      navigate("/meus-pedidos");
    } catch {
      setError("Nao foi possivel criar o pedido.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="grid gap-6 lg:grid-cols-[1fr_360px]">
      <div className="card">
        <h2 className="section-title">Carrinho</h2>
        <div className="mt-8 space-y-5">
          {items.map((item) => (
            <div key={item.product.id} className="flex items-center gap-4 rounded-[22px] border border-espresso/10 bg-white/70 p-4">
              <img src={item.product.image} alt={item.product.name} className="h-24 w-24 rounded-2xl object-cover" />
              <div className="flex-1">
                <h3 className="font-semibold text-espresso">{item.product.name}</h3>
                <p className="text-sm text-espresso/70">{item.product.color} • {item.product.size}</p>
                <input
                  className="mt-2 w-20 rounded-xl border border-espresso/15 bg-white px-3 py-2"
                  type="number"
                  min={1}
                  value={item.quantity}
                  onChange={(event) => updateQuantity(item.product.id, Number(event.target.value))}
                />
              </div>
              <span className="font-bold text-clay">R$ {(item.product.price * item.quantity).toFixed(2)}</span>
            </div>
          ))}
        </div>
      </div>
      <aside className="card">
        <h3 className="font-display text-3xl text-espresso">Resumo</h3>
        <div className="mt-6 space-y-3 text-sm text-espresso/75">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span>R$ {total.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span>Frete</span>
            <span>Gratis acima de R$ 299</span>
          </div>
        </div>
        <div className="mt-6 space-y-3">
          <input className="w-full rounded-2xl border border-espresso/15 bg-white px-4 py-3" placeholder="Endereco de entrega" value={shippingAddress} onChange={(event) => setShippingAddress(event.target.value)} />
          <select className="w-full rounded-2xl border border-espresso/15 bg-white px-4 py-3" value={paymentMethod} onChange={(event) => setPaymentMethod(event.target.value)}>
            <option value="pix">PIX</option>
            <option value="cartao">Cartao</option>
            <option value="boleto">Boleto</option>
          </select>
          <textarea className="w-full rounded-2xl border border-espresso/15 bg-white px-4 py-3" placeholder="Observacoes" value={notes} onChange={(event) => setNotes(event.target.value)} />
          {error ? <p className="text-sm text-red-600">{error}</p> : null}
        </div>
        <button className="button-primary mt-8 w-full" type="button" onClick={handleCreateOrder} disabled={loading}>
          {loading ? "Criando pedido..." : "Finalizar compra"}
        </button>
      </aside>
    </section>
  );
}
