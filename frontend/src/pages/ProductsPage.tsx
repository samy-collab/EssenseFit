import { useEffect, useState } from "react";
import { ProductCard } from "../components/ProductCard";
import { SectionIntro } from "../components/SectionIntro";
import { fetchProducts } from "../services/productService";
import type { Product } from "../types";

export function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts()
      .then(setProducts)
      .finally(() => setLoading(false));
  }, []);

  return (
    <section className="space-y-8">
      <div className="relative overflow-hidden rounded-lg bg-theme-hero px-6 py-12 text-white shadow-[0_24px_70px_var(--shadow-strong)] sm:px-8">
        <img
          src="https://images.pexels.com/photos/6453528/pexels-photo-6453528.jpeg?auto=compress&cs=tinysrgb&w=1800"
          alt="Catálogo Essence Fit"
          className="absolute inset-0 h-full w-full object-cover opacity-58"
        />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(8,10,9,0.90),rgba(8,10,9,0.48))]" />
        <div className="relative max-w-3xl">
          <p className="inline-flex rounded-full border border-white/25 bg-white/12 px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-white/86 backdrop-blur">Catálogo</p>
          <h2 className="mt-5 font-display text-4xl leading-tight text-white sm:text-6xl">Produtos com modelos e detalhe de vitrine real</h2>
          <p className="mt-4 max-w-2xl text-base leading-7 text-white/78">Peças femininas em modelos reais para enxergar caimento, proporcao, cor e acabamento antes de escolher.</p>
        </div>
      </div>

      <SectionIntro
        eyebrow="Disponiveis"
        title="Todos os produtos"
        description="Imagem grande, informacao direta e detalhes de uso para escolher com mais seguranca."
      />
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {loading ? <div className="card">Carregando produtos...</div> : null}
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}
