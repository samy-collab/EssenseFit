import { Link } from "react-router-dom";
import type { Product } from "../types";

export function ProductCard({ product }: { product: Product }) {
  return (
    <article className="group overflow-hidden rounded-lg border border-theme bg-theme-card shadow-[0_18px_50px_var(--shadow-soft)] transition hover:-translate-y-1 hover:shadow-[0_24px_70px_var(--shadow-strong)]">
      <Link to={`/produtos/${product.id}`} className="block">
        <div className="relative aspect-[4/5] overflow-hidden bg-theme-muted">
          <img
            src={product.image}
            alt={product.name}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          />
          <span className="absolute left-4 top-4 rounded-md bg-theme-card px-3 py-1 text-xs font-bold uppercase tracking-[0.16em] text-theme-secondary shadow-sm">
            {product.season}
          </span>
        </div>
      </Link>
      <div className="space-y-4 p-5">
        <div className="flex items-start justify-between gap-4">
          <h3 className="font-display text-2xl leading-tight text-theme-primary">{product.name}</h3>
          <span className="shrink-0 text-base font-black text-theme-accent">R$ {product.price.toFixed(2)}</span>
        </div>
        <p className="line-clamp-2 text-sm leading-6 text-theme-secondary">{product.description}</p>
        <div className="flex items-center justify-between border-t border-theme pt-4 text-xs font-bold uppercase tracking-[0.14em] text-theme-muted">
          <span>{product.color}</span>
          <span>{product.size}</span>
        </div>
        <Link to={`/produtos/${product.id}`} className="button-primary w-full">
          Ver detalhe
        </Link>
      </div>
    </article>
  );
}
