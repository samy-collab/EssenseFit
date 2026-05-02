import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { ProductCard } from "../components/ProductCard";
import { SectionIntro } from "../components/SectionIntro";
import { fetchProducts } from "../services/productService";
import type { Product } from "../types";

export function SeasonProductsPage() {
  const { season = "" } = useParams();
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    fetchProducts(season)
      .then(setProducts)
      .catch(() => setProducts([]));
  }, [season]);

  return (
    <section>
      <SectionIntro
        eyebrow="Estacao"
        title={`Produtos para ${season}`}
        description="Selecao organizada por estacao para destacar tecidos, cores e conforto adequados ao clima."
      />
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}
