import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { topUpAccountCredit } from "../services/accountCreditService";
import { createOrder } from "../services/orderService";


const PIX_RECEIVER = {
  key: "02889475093",
  name: "SAMUEL ALOISIO DE BASTIANI",
  city: "SAO PAULO"
};

const CART_HERO_IMAGE = "https://images.pexels.com/photos/5632402/pexels-photo-5632402.jpeg?auto=compress&cs=tinysrgb&w=1800";
const CART_DETAIL_IMAGE = "https://images.pexels.com/photos/7679655/pexels-photo-7679655.jpeg?auto=compress&cs=tinysrgb&w=1200";

function normalizePixText(value: string, maxLength: number) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toUpperCase()
    .replace(/[^A-Z0-9 $%*+\-./:]/g, "")
    .slice(0, maxLength);
}

function emvField(id: string, value: string) {
  return `${id}${String(value.length).padStart(2, "0")}${value}`;
}

function crc16(payload: string) {
  let crc = 0xffff;

  for (let index = 0; index < payload.length; index += 1) {
    crc ^= payload.charCodeAt(index) << 8;
    for (let bit = 0; bit < 8; bit += 1) {
      crc = crc & 0x8000 ? (crc << 1) ^ 0x1021 : crc << 1;
      crc &= 0xffff;
    }
  }

  return crc.toString(16).toUpperCase().padStart(4, "0");
}

function buildPixPayload(amount: number) {
  const merchantAccountInfo =
    emvField("00", "br.gov.bcb.pix") +
    emvField("01", PIX_RECEIVER.key);

  const additionalData = emvField("05", "ESSENCEFIT");
  const payloadWithoutCrc =
    emvField("00", "01") +
    emvField("26", merchantAccountInfo) +
    emvField("52", "0000") +
    emvField("53", "986") +
    emvField("54", amount.toFixed(2)) +
    emvField("58", "BR") +
    emvField("59", normalizePixText(PIX_RECEIVER.name, 25)) +
    emvField("60", normalizePixText(PIX_RECEIVER.city, 15)) +
    emvField("62", additionalData) +
    "6304";

  return `${payloadWithoutCrc}${crc16(payloadWithoutCrc)}`;
}

export function CartPage() {
  const { items, total, itemCount, updateQuantity, removeItem, clearCart } = useCart();
  const { user, isAuthenticated, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [cep, setCep] = useState("");
  const [street, setStreet] = useState("");
  const [number, setNumber] = useState("");
  const [complement, setComplement] = useState("");
  const [neighborhood, setNeighborhood] = useState("");
  const [city, setCity] = useState("");
  const [stateUf, setStateUf] = useState("");
  const [addressLoading, setAddressLoading] = useState(false);
  const [addressError, setAddressError] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("pix");
  const [creditAmount, setCreditAmount] = useState("");
  const [creditPaymentMethod, setCreditPaymentMethod] = useState("pix");
  const [creditLoading, setCreditLoading] = useState(false);
  const [creditStatus, setCreditStatus] = useState("");
  const [notes, setNotes] = useState("");
  const [copyStatus, setCopyStatus] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const cepDigits = cep.replace(/\D/g, "");
  const accountCredit = user?.account_credit ?? 0;
  const creditAmountValue = Number(creditAmount.replace(",", ".")) || 0;
  const creditMissingAmount = Math.max(total - accountCredit, 0);
  const pixPayload = useMemo(() => buildPixPayload(total), [total]);
  const creditPixPayload = useMemo(() => buildPixPayload(Math.max(creditAmountValue, 0.01)), [creditAmountValue]);
  const pixQrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=280x280&data=${encodeURIComponent(pixPayload)}`;
  const creditPixQrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(creditPixPayload)}`;

  const shippingAddress = useMemo(() => {
    const parts = [
      street && number ? `${street}, ${number}` : street,
      complement,
      neighborhood,
      city && stateUf ? `${city} - ${stateUf}` : city || stateUf,
      cepDigits ? `CEP ${cepDigits.replace(/(\d{5})(\d{3})/, "$1-$2")}` : ""
    ].filter(Boolean);

    return parts.join(" | ");
  }, [cepDigits, city, complement, neighborhood, number, stateUf, street]);

  useEffect(() => {
    if (cepDigits.length !== 8) {
      setAddressError("");
      return;
    }

    let cancelled = false;

    async function fetchAddress() {
      try {
        setAddressLoading(true);
        setAddressError("");
        const response = await fetch(`https://viacep.com.br/ws/${cepDigits}/json/`);
        const data = await response.json() as {
          erro?: boolean;
          logradouro?: string;
          bairro?: string;
          localidade?: string;
          uf?: string;
        };

        if (cancelled) return;

        if (data.erro) {
          setAddressError("CEP nao encontrado. Preencha o endereco manualmente.");
          return;
        }

        setStreet(data.logradouro ?? "");
        setNeighborhood(data.bairro ?? "");
        setCity(data.localidade ?? "");
        setStateUf(data.uf ?? "");
      } catch {
        if (!cancelled) setAddressError("Nao foi possivel buscar o CEP. Preencha manualmente.");
      } finally {
        if (!cancelled) setAddressLoading(false);
      }
    }

    fetchAddress();

    return () => {
      cancelled = true;
    };
  }, [cepDigits]);

  async function handleCopyPix() {
    try {
      await navigator.clipboard.writeText(pixPayload);
      setCopyStatus("Codigo Pix copiado.");
    } catch {
      setCopyStatus("Nao foi possivel copiar automaticamente.");
    }
  }

  async function handleTopUpCredit() {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    if (creditAmountValue <= 0) {
      setCreditStatus("Informe um valor para adicionar credito.");
      return;
    }

    try {
      setCreditLoading(true);
      setCreditStatus("");
      await topUpAccountCredit({ amount: creditAmountValue, payment_method: creditPaymentMethod });
      await refreshProfile();
      setCreditAmount("");
      setCreditStatus("Credito adicionado a sua conta.");
    } catch {
      setCreditStatus("Nao foi possivel adicionar credito agora.");
    } finally {
      setCreditLoading(false);
    }
  }

  async function handleCreateOrder() {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    if (items.length === 0) {
      setError("Adicione produtos ao carrinho.");
      return;
    }

    if (paymentMethod === "account_credit" && accountCredit < total) {
      setError("Seu credito na conta ainda nao cobre o total. Adicione credito para finalizar.");
      return;
    }

    if (!cepDigits || !street || !number || !neighborhood || !city || !stateUf) {
      setError("Preencha CEP, rua, numero, bairro, cidade e UF para finalizar.");
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

  if (items.length === 0) {
    return (
      <section className="grid min-h-[calc(100vh-170px)] items-center">
        <div className="relative overflow-hidden rounded-lg border border-white/10 bg-theme-hero text-white shadow-[0_30px_90px_var(--shadow-strong)]">
          <img src={CART_HERO_IMAGE} alt="Sacolas de compras em loja" className="absolute inset-0 h-full w-full object-cover opacity-48" />
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(8,10,9,0.96),rgba(8,10,9,0.62)_54%,rgba(8,10,9,0.18))]" />

          <div className="relative flex min-h-[560px] items-end p-6 sm:p-10 lg:p-12">
            <div className="max-w-2xl pb-4">
              <p className="inline-flex rounded-full border border-white/25 bg-white/12 px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-white/82 backdrop-blur">Sacola vazia</p>
              <h2 className="mt-5 font-display text-5xl leading-tight text-white sm:text-6xl lg:text-7xl">Ops, seu carrinho ainda esta vazio.</h2>
              <p className="mt-5 max-w-xl text-lg leading-8 text-white/76">Explore a colecao e escolha as pecas que combinam com seu treino.</p>
              <Link to="/produtos" className="button-primary mt-8 bg-white px-6 py-3 text-theme-inverse hover:bg-theme-accent hover:text-white">Ver produtos</Link>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-7">
      <div className="relative overflow-hidden rounded-lg border border-white/10 bg-theme-hero text-white shadow-[0_28px_90px_var(--shadow-strong)]">
        <img src={CART_HERO_IMAGE} alt="Sacolas e checkout de compras" className="absolute inset-0 h-full w-full object-cover opacity-34" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_78%_25%,rgba(226,169,151,0.34),transparent_34%),linear-gradient(90deg,rgba(8,10,9,0.97),rgba(8,10,9,0.74)_46%,rgba(8,10,9,0.28))]" />
        <div className="relative grid gap-8 p-6 sm:p-8 lg:grid-cols-[1fr_340px] lg:items-end">
          <div className="max-w-3xl">
            <p className="inline-flex rounded-full border border-white/25 bg-white/12 px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-white/82 backdrop-blur">Checkout Essence Fit</p>
            <h2 className="mt-4 font-display text-5xl leading-tight text-white sm:text-6xl">Sua compra com visual de vitrine.</h2>
            <p className="mt-4 max-w-2xl text-base leading-7 text-white/74">Revise as pecas, confirme a entrega e pague por Pix em uma experiencia mais limpa, escura e editorial.</p>
          </div>
          <div className="rounded-lg border border-white/18 bg-white/10 p-4 backdrop-blur-md">
            <div className="flex items-center justify-between border-b border-white/15 pb-3 text-sm text-white/72">
              <span>Itens</span>
              <strong className="text-white">{itemCount}</strong>
            </div>
            <div className="flex items-center justify-between pt-3 text-sm text-white/72">
              <span>Total agora</span>
              <strong className="text-2xl text-white">R$ {total.toFixed(2)}</strong>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-2 text-center text-[0.68rem] font-black uppercase tracking-[0.12em] text-white/72">
              <span className="rounded-md bg-white/12 px-2 py-2">Sacola</span>
              <span className="rounded-md bg-white/12 px-2 py-2">Entrega</span>
              <span className="rounded-md bg-white/12 px-2 py-2">Pix</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_430px]">
        <div className="space-y-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="pill">Sacola</p>
              <h3 className="mt-3 font-display text-4xl leading-tight text-theme-primary">{itemCount} {itemCount === 1 ? "item selecionado" : "itens selecionados"}</h3>
            </div>
            <Link to="/produtos" className="button-secondary w-fit px-4 py-2 hover:-translate-y-0.5 hover:border-theme-accent hover:text-theme-accent">Continuar comprando</Link>
          </div>

          <div className="overflow-hidden rounded-lg border border-theme bg-theme-card shadow-[0_24px_70px_var(--shadow-soft)]">
            {items.map((item, index) => (
              <article key={item.product.id} className={`group grid gap-4 p-4 transition duration-300 hover:bg-theme-muted sm:grid-cols-[132px_1fr_auto] sm:items-center sm:p-5 ${index > 0 ? "border-t border-theme" : ""}`}>
                <Link to={`/produtos/${item.product.id}`} className="image-finish h-44 overflow-hidden rounded-lg border border-theme bg-theme-hero shadow-[0_18px_46px_var(--shadow-soft)] sm:h-34">
                  <img src={item.product.image} alt={item.product.name} className="h-full w-full object-cover transition duration-500 group-hover:scale-110" />
                </Link>

                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="rounded-full bg-theme-card px-3 py-1 text-xs font-bold uppercase tracking-[0.16em] text-theme-accent shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">{item.product.season}</p>
                    <span className="rounded-full border border-theme px-3 py-1 text-xs font-bold text-theme-secondary">{item.product.color} / {item.product.size}</span>
                  </div>
                  <Link to={`/produtos/${item.product.id}`} className="mt-3 block font-display text-3xl leading-tight text-theme-primary transition hover:text-theme-accent">
                    {item.product.name}
                  </Link>
                  <p className="mt-2 text-sm text-theme-secondary">Peca adicionada a sua sacola. Ajuste a quantidade antes de finalizar.</p>
                  <div className="mt-4 flex flex-wrap items-center gap-3">
                    <div className="flex w-fit items-center rounded-full border border-theme bg-theme-card p-1 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
                      <button type="button" className="flex h-9 w-9 items-center justify-center rounded-full text-lg font-bold text-theme-primary transition hover:bg-theme-accent hover:text-white" onClick={() => updateQuantity(item.product.id, item.quantity - 1)} aria-label="Diminuir quantidade">-</button>
                      <span className="w-10 text-center text-sm font-black text-theme-primary">{item.quantity}</span>
                      <button type="button" className="flex h-9 w-9 items-center justify-center rounded-full text-lg font-bold text-theme-primary transition hover:bg-theme-accent hover:text-white" onClick={() => updateQuantity(item.product.id, item.quantity + 1)} aria-label="Aumentar quantidade">+</button>
                    </div>
                    <button type="button" className="rounded-full border border-theme px-4 py-2 text-sm font-bold text-theme-secondary transition hover:border-theme-accent hover:text-theme-accent" onClick={() => removeItem(item.product.id)}>Remover</button>
                  </div>
                </div>

                <div className="rounded-lg border border-theme bg-[linear-gradient(145deg,var(--theme-card-muted),var(--theme-card))] p-4 text-left shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] sm:min-w-[154px] sm:text-right">
                  <p className="text-xs font-bold uppercase tracking-[0.14em] text-theme-muted">Subtotal</p>
                  <p className="mt-1 text-2xl font-black text-theme-primary">R$ {(item.product.price * item.quantity).toFixed(2)}</p>
                  <p className="mt-1 text-xs text-theme-secondary">R$ {item.product.price.toFixed(2)} cada</p>
                </div>
              </article>
            ))}
          </div>
        </div>

        <aside className="space-y-4 xl:sticky xl:top-28 xl:self-start">
          <div className="overflow-hidden rounded-lg border border-theme bg-theme-card shadow-[0_24px_70px_var(--shadow-soft)]">
            <div className="relative min-h-40 overflow-hidden border-b border-theme p-5 text-white">
              <img src={CART_DETAIL_IMAGE} alt="Detalhe de vitrine fitness" className="absolute inset-0 h-full w-full object-cover opacity-54 transition duration-700 hover:scale-105" />
              <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(8,10,9,0.92),rgba(8,10,9,0.36))]" />
              <div className="relative">
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-white/72">Resumo</p>
                <h3 className="mt-2 font-display text-3xl text-white">Pedido</h3>
                <p className="mt-2 text-sm leading-6 text-white/70">Frete gratis em compras acima de R$ 299.</p>
              </div>
            </div>
            <div className="space-y-4 p-5 text-sm text-theme-secondary">
              <div className="flex justify-between border-b border-theme pb-3"><span>Subtotal</span><span>R$ {total.toFixed(2)}</span></div>
              <div className="flex justify-between border-b border-theme pb-3"><span>Frete</span><span>{total >= 299 ? "Gratis" : "Gratis acima de R$ 299"}</span></div>
              <div className="flex justify-between text-xl font-black text-theme-primary"><span>Total</span><span>R$ {total.toFixed(2)}</span></div>
            </div>
          </div>

          <div className="rounded-lg border border-theme bg-theme-card p-5 shadow-[0_20px_60px_var(--shadow-soft)]">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-theme-accent">Entrega</p>
            <div className="mt-5 space-y-4">
              <div>
                <label className="text-xs font-bold uppercase tracking-[0.14em] text-theme-muted" htmlFor="cep">CEP</label>
                <input id="cep" className="mt-2 w-full rounded-md border border-theme bg-theme-muted px-4 py-3 transition focus:border-theme-accent focus:outline-none focus:ring-2 focus:ring-theme-accent/20" placeholder="00000-000" inputMode="numeric" maxLength={9} value={cep} onChange={(event) => setCep(event.target.value.replace(/\D/g, "").replace(/(\d{5})(\d{0,3})/, (_match, first, second) => second ? `${first}-${second}` : first))} />
                {addressLoading ? <p className="mt-2 text-xs font-bold text-theme-accent">Buscando endereco...</p> : null}
                {addressError ? <p className="mt-2 text-xs font-bold text-red-400">{addressError}</p> : null}
              </div>
              <div>
                <label className="text-xs font-bold uppercase tracking-[0.14em] text-theme-muted" htmlFor="street">Rua / Avenida</label>
                <input id="street" className="mt-2 w-full rounded-md border border-theme bg-theme-muted px-4 py-3 transition focus:border-theme-accent focus:outline-none focus:ring-2 focus:ring-theme-accent/20" placeholder="Rua" value={street} onChange={(event) => setStreet(event.target.value)} />
              </div>
              <div className="grid gap-3 sm:grid-cols-[0.7fr_1fr]">
                <div>
                  <label className="text-xs font-bold uppercase tracking-[0.14em] text-theme-muted" htmlFor="number">Numero</label>
                  <input id="number" className="mt-2 w-full rounded-md border border-theme bg-theme-muted px-4 py-3 transition focus:border-theme-accent focus:outline-none focus:ring-2 focus:ring-theme-accent/20" placeholder="123" value={number} onChange={(event) => setNumber(event.target.value)} />
                </div>
                <div>
                  <label className="text-xs font-bold uppercase tracking-[0.14em] text-theme-muted" htmlFor="complement">Complemento</label>
                  <input id="complement" className="mt-2 w-full rounded-md border border-theme bg-theme-muted px-4 py-3 transition focus:border-theme-accent focus:outline-none focus:ring-2 focus:ring-theme-accent/20" placeholder="Apto, bloco" value={complement} onChange={(event) => setComplement(event.target.value)} />
                </div>
              </div>
              <div>
                <label className="text-xs font-bold uppercase tracking-[0.14em] text-theme-muted" htmlFor="neighborhood">Bairro</label>
                <input id="neighborhood" className="mt-2 w-full rounded-md border border-theme bg-theme-muted px-4 py-3 transition focus:border-theme-accent focus:outline-none focus:ring-2 focus:ring-theme-accent/20" placeholder="Bairro" value={neighborhood} onChange={(event) => setNeighborhood(event.target.value)} />
              </div>
              <div className="grid gap-3 sm:grid-cols-[1fr_0.45fr]">
                <div>
                  <label className="text-xs font-bold uppercase tracking-[0.14em] text-theme-muted" htmlFor="city">Cidade</label>
                  <input id="city" className="mt-2 w-full rounded-md border border-theme bg-theme-muted px-4 py-3 transition focus:border-theme-accent focus:outline-none focus:ring-2 focus:ring-theme-accent/20" placeholder="Cidade" value={city} onChange={(event) => setCity(event.target.value)} />
                </div>
                <div>
                  <label className="text-xs font-bold uppercase tracking-[0.14em] text-theme-muted" htmlFor="stateUf">UF</label>
                  <input id="stateUf" className="mt-2 w-full rounded-md border border-theme bg-theme-muted px-4 py-3 uppercase transition focus:border-theme-accent focus:outline-none focus:ring-2 focus:ring-theme-accent/20" placeholder="UF" maxLength={2} value={stateUf} onChange={(event) => setStateUf(event.target.value.toUpperCase())} />
                </div>
              </div>
              {shippingAddress ? <p className="rounded-md border border-theme bg-theme-muted p-3 text-xs leading-5 text-theme-secondary">Entrega: {shippingAddress}</p> : null}
            </div>
          </div>

          <div className="rounded-lg border border-theme bg-theme-card p-5 shadow-[0_20px_60px_var(--shadow-soft)]">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-theme-accent">Pagamento</p>
            <div className="mt-5 space-y-4">
              <select className="w-full rounded-md border border-theme bg-theme-muted px-4 py-3 transition focus:border-theme-accent focus:outline-none focus:ring-2 focus:ring-theme-accent/20" value={paymentMethod} onChange={(event) => setPaymentMethod(event.target.value)}>
                <option value="pix">PIX</option>
                <option value="account_credit">Credito na conta</option>
                <option value="cartao">Cartao</option>
                <option value="boleto">Boleto</option>
              </select>
              {paymentMethod === "pix" ? (
                <div className="rounded-lg border border-theme bg-theme-muted p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
                  <div className="grid gap-4 sm:grid-cols-[136px_1fr] sm:items-center">
                    <img src={pixQrCodeUrl} alt="QR Code Pix para pagamento" className="h-32 w-32 rounded-md bg-white p-2 shadow-[0_18px_40px_var(--shadow-soft)] transition hover:scale-105 sm:h-32 sm:w-32" />
                    <div className="min-w-0">
                      <p className="text-xs font-bold uppercase tracking-[0.14em] text-theme-accent">Pix copia e cola</p>
                      <p className="mt-2 text-sm leading-6 text-theme-secondary">{PIX_RECEIVER.name}</p>
                      <p className="text-sm leading-6 text-theme-secondary">R$ {total.toFixed(2)}</p>
                      <button type="button" className="button-secondary mt-3 w-full px-4 py-2 hover:border-theme-accent hover:text-theme-accent" onClick={handleCopyPix}>Copiar codigo Pix</button>
                      {copyStatus ? <p className="mt-2 text-xs font-bold text-theme-accent">{copyStatus}</p> : null}
                    </div>
                  </div>
                  <textarea className="mt-4 h-20 w-full rounded-md border border-theme bg-theme-card px-3 py-2 text-xs text-theme-secondary" readOnly value={pixPayload} />
                </div>
              ) : null}
              {paymentMethod === "account_credit" ? (
                <div className="rounded-lg border border-theme bg-theme-muted p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
                  <div className="flex items-start justify-between gap-4 border-b border-theme pb-4">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-[0.14em] text-theme-accent">Credito na conta</p>
                      <p className="mt-2 text-sm leading-6 text-theme-secondary">Use o saldo da sua conta para finalizar a compra.</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-bold uppercase tracking-[0.14em] text-theme-muted">Saldo</p>
                      <p className="text-xl font-black text-theme-primary">R$ {accountCredit.toFixed(2)}</p>
                    </div>
                  </div>
                  {creditMissingAmount > 0 ? (
                    <p className="mt-4 rounded-md border border-theme bg-theme-card p-3 text-sm font-bold text-theme-secondary">Faltam R$ {creditMissingAmount.toFixed(2)} para pagar este pedido com credito.</p>
                  ) : (
                    <p className="mt-4 rounded-md border border-theme bg-theme-card p-3 text-sm font-bold text-theme-accent">Seu saldo cobre o total deste pedido.</p>
                  )}
                  <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_0.85fr]">
                    <input className="w-full rounded-md border border-theme bg-theme-card px-4 py-3 transition focus:border-theme-accent focus:outline-none focus:ring-2 focus:ring-theme-accent/20" placeholder="Valor para adicionar" inputMode="decimal" value={creditAmount} onChange={(event) => setCreditAmount(event.target.value.replace(/[^0-9,.]/g, ""))} />
                    <select className="w-full rounded-md border border-theme bg-theme-card px-4 py-3 transition focus:border-theme-accent focus:outline-none focus:ring-2 focus:ring-theme-accent/20" value={creditPaymentMethod} onChange={(event) => setCreditPaymentMethod(event.target.value)}>
                      <option value="pix">Adicionar via Pix</option>
                      <option value="cartao">Adicionar via cartao</option>
                      <option value="boleto">Adicionar via boleto</option>
                    </select>
                  </div>
                  {creditPaymentMethod === "pix" && creditAmountValue > 0 ? (
                    <div className="mt-4 grid gap-3 rounded-md border border-theme bg-theme-card p-3 sm:grid-cols-[104px_1fr] sm:items-center">
                      <img src={creditPixQrCodeUrl} alt="QR Code Pix para adicionar credito" className="h-24 w-24 rounded-md bg-white p-2" />
                      <p className="text-xs leading-5 text-theme-secondary">QR Code para adicionar R$ {creditAmountValue.toFixed(2)} de credito via Pix.</p>
                    </div>
                  ) : null}
                  <button type="button" className="button-secondary mt-4 w-full px-4 py-2 hover:border-theme-accent hover:text-theme-accent" onClick={handleTopUpCredit} disabled={creditLoading}>{creditLoading ? "Adicionando credito..." : "Adicionar credito"}</button>
                  {creditStatus ? <p className="mt-3 text-xs font-bold text-theme-accent">{creditStatus}</p> : null}
                </div>
              ) : null}
              <textarea className="w-full rounded-md border border-theme bg-theme-muted px-4 py-3 transition focus:border-theme-accent focus:outline-none focus:ring-2 focus:ring-theme-accent/20" placeholder="Observacoes" value={notes} onChange={(event) => setNotes(event.target.value)} />
              {error ? <p className="text-sm font-bold text-red-400">{error}</p> : null}
              {!isAuthenticated ? <p className="text-sm leading-6 text-theme-muted">Para finalizar, voce sera direcionado ao login. O carrinho fica salvo.</p> : null}
              <button className="button-primary w-full shadow-[0_18px_44px_rgba(203,111,84,0.26)] hover:-translate-y-0.5" type="button" onClick={handleCreateOrder} disabled={loading}>{loading ? "Criando pedido..." : isAuthenticated ? "Finalizar compra" : "Entrar para finalizar"}</button>
              <button className="button-secondary w-full hover:border-theme-accent hover:text-theme-accent" type="button" onClick={clearCart}>Limpar carrinho</button>
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
}
