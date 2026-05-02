import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { fetchProduct } from "../services/productService";
import type { Product } from "../types";

export function ProductDetailPage() {
  const { id } = useParams();
  const { addItem } = useCart();
  const [product, setProduct] = useState<Product | null>(null);

  useEffect(() => {
    if (!id) return;
    fetchProduct(id).then(setProduct).catch(() => setProduct(null));
  }, [id]);

  if (!product) {
    return <div className="card">Produto nao encontrado.</div>;
  }

  return (
    <section className="grid gap-8 lg:grid-cols-[1fr_0.9fr]">
      <div className="card overflow-hidden p-0">
        <img src={product.image} alt={product.name} className="h-full min-h-[420px] w-full object-cover" />
      </div>
      <div className="card">
        <p className="pill">{product.season}</p>
        <h2 className="mt-4 font-display text-5xl text-espresso">{product.name}</h2>
        <p className="mt-4 text-lg leading-8 text-espresso/70">{product.description}</p>
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          <div className="rounded-3xl bg-white/70 p-5">
            <p className="text-sm uppercase tracking-[0.2em] text-clay">Preco</p>
            <p className="mt-2 text-3xl font-bold text-espresso">R$ {product.price.toFixed(2)}</p>
          </div>
          <div className="rounded-3xl bg-white/70 p-5">
            <p className="text-sm uppercase tracking-[0.2em] text-clay">Detalhes</p>
            <p className="mt-2 text-base text-espresso">{product.color} • {product.size}</p>
          </div>
        </div>
        <div className="mt-8 flex flex-wrap gap-3">
          <button
            type="button"
            className="button-primary"
            onClick={() => addItem(product)}
          >
            Adicionar ao carrinho
          </button>
          <Link to="/produtos" className="button-secondary">
            Voltar ao catalogo
          </Link>
        </div>
      </div>
    </section>
  );
}
