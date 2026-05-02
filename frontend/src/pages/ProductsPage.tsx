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
    <section>
      <SectionIntro
        eyebrow="Catalogo"
        title="Todos os produtos"
        description="Peças femininas para treino com foco em disciplina, autoestima e visual premium."
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
