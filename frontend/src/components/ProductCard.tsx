import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import type { Product } from "../types";

export function ProductCard({ product }: { product: Product }) {
  const { addItem } = useCart();

  return (
    <article className="group overflow-hidden rounded-lg border border-theme bg-theme-card shadow-[0_18px_50px_var(--shadow-soft)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_28px_80px_var(--shadow-strong)]">
      <Link to={`/produtos/${product.id}`} className="block">
        <div className="image-finish relative aspect-[4/5] overflow-hidden bg-theme-muted">
          <img
            src={product.image}
            alt={product.name}
            className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
          />
          <div className="absolute inset-x-0 top-0 z-[2] flex items-start justify-between p-4">
            <span className="rounded-md bg-theme-card px-3 py-1 text-xs font-bold uppercase tracking-[0.16em] text-theme-secondary shadow-sm backdrop-blur">
              {product.season}
            </span>
            <span className="rounded-md bg-theme-primary px-3 py-1 text-xs font-black text-theme-inverse backdrop-blur">
              R$ {product.price.toFixed(2)}
            </span>
          </div>
          <div className="absolute inset-x-4 bottom-4 z-[2] rounded-lg border border-white/24 bg-black/28 p-3 text-white shadow-[0_16px_42px_rgba(0,0,0,0.20)] backdrop-blur-md">
            <p className="text-[0.66rem] font-bold uppercase tracking-[0.18em] text-white/70">Acabamento</p>
            <div className="mt-2 flex items-center justify-between gap-3 text-xs font-semibold">
              <span className="truncate">{product.color}</span>
              <span className="shrink-0 rounded-full bg-white/18 px-2 py-1">{product.size}</span>
            </div>
          </div>
        </div>
      </Link>
      <div className="space-y-4 p-5">
        <div className="space-y-2">
          <h3 className="font-display text-2xl leading-tight text-theme-primary">{product.name}</h3>
          <p className="line-clamp-2 text-sm leading-6 text-theme-secondary">{product.description}</p>
        </div>
        <div className="grid grid-cols-3 gap-2 border-y border-theme py-3 text-[0.68rem] font-bold uppercase tracking-[0.12em] text-theme-muted">
          <span>Suporte</span>
          <span>Toque firme</span>
          <span>Uso real</span>
        </div>
        <div className="grid gap-2 sm:grid-cols-2">
          <button type="button" className="button-primary w-full px-4" onClick={() => addItem(product)}>
            Adicionar
          </button>
          <Link to={`/produtos/${product.id}`} className="button-secondary w-full px-4">
            Ver detalhe
          </Link>
        </div>
      </div>
    </article>
  );
}
