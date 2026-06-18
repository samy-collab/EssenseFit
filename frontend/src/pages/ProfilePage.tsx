import { ChangeEvent, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { fetchActiveCoupons } from "../services/couponService";
import { fetchMyOrders } from "../services/orderService";
import type { Coupon, Order } from "../types";

function formatDate(value?: string) {
  if (!value) return "Não informado";
  return new Date(value).toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" });
}

function formatCurrency(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export function ProfilePage() {
  const { user, updateProfilePhoto } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchMyOrders().then(setOrders).catch(() => setOrders([]));
    fetchActiveCoupons().then(setCoupons).catch(() => setCoupons([]));
  }, []);

  const profileImage = user?.profile_image_url || user?.strava_profile_image_url;
  const isAdmin = user?.role === "ADMIN";
  const accountCreditLabel = isAdmin ? "Ilimitado" : formatCurrency(user?.account_credit ?? 0);
  const initials = useMemo(() => {
    const name = user?.name?.trim() || user?.email || "EF";
    return name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("");
  }, [user]);

  const currentPoints = user?.points ?? 0;
  const pointCoupons = coupons
    .filter((coupon) => coupon.points_required > 0)
    .sort((a, b) => a.points_required - b.points_required);
  const nextCoupon = pointCoupons.find((coupon) => coupon.points_required > currentPoints);
  const availableCoupon = pointCoupons.find((coupon) => coupon.points_required <= currentPoints);
  const pointsToNextCoupon = nextCoupon ? nextCoupon.points_required - currentPoints : 0;
  const couponProgressLabel = nextCoupon
    ? `${pointsToNextCoupon} pontos para ${nextCoupon.title}`
    : availableCoupon
      ? `Cupom disponível: ${availableCoupon.title}`
      : "Sem cupons por pontos ativos";

  const totalSpent = orders.reduce((sum, order) => sum + order.total_amount, 0);
  const completedOrders = orders.filter((order) => ["confirmed", "paid", "delivered", "completed"].includes(order.status.toLowerCase())).length;
  const purchaseCount = user?.confirmed_orders ?? completedOrders;

  async function handlePhotoChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    setError("");
    setUploading(true);
    try {
      await updateProfilePhoto(file);
    } catch {
      setError("Não foi possível atualizar a foto. Use JPG, PNG, WEBP ou GIF com até 5MB.");
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  }

  return (
    <div className="space-y-8">
      <section className="overflow-hidden rounded-lg bg-theme-hero text-white shadow-[0_24px_80px_var(--shadow-strong)]">
        <div className="grid gap-8 p-6 sm:p-8 lg:grid-cols-[0.72fr_1fr] lg:p-10">
          <div className="flex flex-col items-start gap-5">
            <div className="relative">
              {profileImage ? (
                <img src={profileImage} alt={user?.name ?? "Perfil"} className="h-36 w-36 rounded-lg object-cover ring-4 ring-white/12" />
              ) : (
                <div className="flex h-36 w-36 items-center justify-center rounded-lg bg-white/10 text-5xl font-black ring-4 ring-white/12">
                  {initials}
                </div>
              )}
            </div>
            <label className="button-primary cursor-pointer bg-white text-theme-primary hover:bg-[#f0c7b2]">
              {uploading ? "Enviando..." : "Adicionar foto"}
              <input className="sr-only" type="file" accept="image/jpeg,image/png,image/webp,image/gif" onChange={handlePhotoChange} disabled={uploading} />
            </label>
            {error ? <p className="text-sm text-[#f0c7b2]">{error}</p> : null}
            {user?.strava_profile_image_url && !user.profile_image_url ? (
              <p className="text-sm leading-6 text-white/62">Usando automaticamente a foto da sua conta Strava.</p>
            ) : null}
          </div>

          <div className="self-end">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#f0c7b2]">Meu perfil</p>
            <h2 className="mt-4 font-display text-5xl leading-tight sm:text-6xl">{user?.name}</h2>
            <p className="mt-3 text-lg text-white/68">{user?.email}</p>
            <div className="mt-8 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <div className="border-l-2 border-[#f0c7b2] bg-white/8 p-4">
                <p className="font-display text-3xl">{formatDate(user?.created_at)}</p>
                <p className="mt-2 text-xs font-bold uppercase tracking-[0.14em] text-white/55">Conta criada</p>
              </div>
              <div className="border-l-2 border-[#f0c7b2] bg-white/8 p-4">
                <p className="font-display text-3xl">{purchaseCount}</p>
                <p className="mt-2 text-xs font-bold uppercase tracking-[0.14em] text-white/55">Compras feitas</p>
              </div>
              <div className="border-l-2 border-[#f0c7b2] bg-white/8 p-4">
                <p className="font-display text-3xl">{currentPoints}</p>
                <p className="mt-2 text-xs font-bold uppercase tracking-[0.14em] text-white/55">Pontos atuais</p>
              </div>
              <div className="border-l-2 border-[#f0c7b2] bg-white/8 p-4">
                <p className="font-display text-3xl">{accountCreditLabel}</p>
                <p className="mt-2 text-xs font-bold uppercase tracking-[0.14em] text-white/55">Créditos</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[0.42fr_1fr]">
        <aside className="card self-start">
          <p className="pill">Resumo</p>
          <div className="mt-6 space-y-5">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.16em] text-theme-muted">Total comprado</p>
              <p className="mt-2 font-display text-4xl text-theme-primary">{formatCurrency(totalSpent)}</p>
            </div>
            <div className="border-t border-theme pt-5">
              <p className="text-sm font-bold uppercase tracking-[0.16em] text-theme-muted">Créditos disponíveis</p>
              <p className="mt-2 text-lg font-bold text-theme-primary">{accountCreditLabel}</p>
            </div>
            <div className="border-t border-theme pt-5">
              <p className="text-sm font-bold uppercase tracking-[0.16em] text-theme-muted">Próximo cupom</p>
              <p className="mt-2 text-lg font-bold text-theme-primary">{couponProgressLabel}</p>
              {nextCoupon ? <p className="mt-1 text-sm text-theme-secondary">Você tem {currentPoints} de {nextCoupon.points_required} pontos.</p> : null}
            </div>
            <div className="border-t border-theme pt-5">
              <p className="text-sm font-bold uppercase tracking-[0.16em] text-theme-muted">Origem da conta</p>
              <p className="mt-2 text-lg font-bold text-theme-primary">{user?.strava_athlete_id ? "Strava conectado" : "Email e senha"}</p>
            </div>
            <div className="border-t border-theme pt-5">
              <p className="text-sm font-bold uppercase tracking-[0.16em] text-theme-muted">Check-in</p>
              <p className="mt-2 text-lg font-bold text-theme-primary">{user?.check_in_unlocked ? "Liberado" : "Bloqueado"}</p>
            </div>
          </div>
        </aside>

        <section className="card">
          <div className="flex flex-col gap-4 border-b border-theme pb-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="pill">Histórico</p>
              <h3 className="section-title mt-4">Minhas compras</h3>
            </div>
            <Link to="/produtos" className="button-secondary">Comprar novamente</Link>
          </div>

          <div className="mt-6 space-y-4">
            {orders.length === 0 ? (
              <div className="rounded-lg border border-dashed border-theme p-6 text-theme-secondary">
                Você ainda não tem compras registradas.
              </div>
            ) : null}

            {orders.map((order) => (
              <article key={order.id} className="rounded-lg border border-theme bg-theme-muted p-5">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.18em] text-theme-accent">Pedido #{order.order_number}</p>
                    <h4 className="mt-2 text-xl font-black text-theme-primary">{order.status}</h4>
                    <p className="mt-1 text-sm text-theme-muted">{formatDate(order.created_at)} · {order.items.length} itens</p>
                  </div>
                  <p className="text-xl font-black text-theme-primary">{formatCurrency(order.total_amount)}</p>
                </div>
                <div className="mt-4 grid gap-2 border-t border-theme pt-4">
                  {order.items.map((item) => (
                    <div key={item.id} className="flex justify-between gap-3 text-sm text-theme-secondary">
                      <span>{item.quantity}x {item.product_name}</span>
                      <span className="font-bold text-theme-primary">{formatCurrency(item.line_total)}</span>
                    </div>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </section>
      </section>
    </div>
  );
}
