import { Link } from "react-router-dom";
import type { Product } from "../types";

export function ProductCard({ product }: { product: Product }) {
  return (
    <article className="card overflow-hidden p-0">
      <img src={product.image} alt={product.name} className="h-72 w-full object-cover" />
      <div className="space-y-4 p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="pill">{product.season}</p>
            <h3 className="mt-3 font-display text-2xl text-espresso">{product.name}</h3>
          </div>
          <span className="text-lg font-bold text-clay">R$ {product.price.toFixed(2)}</span>
        </div>
        <p className="text-sm text-espresso/70">{product.description}</p>
        <div className="flex items-center justify-between text-sm text-espresso/75">
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
