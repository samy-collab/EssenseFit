import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ProductCard } from "../components/ProductCard";
import { SectionIntro } from "../components/SectionIntro";
import { fetchProducts } from "../services/productService";
import type { Product } from "../types";

const seasonLinks = [
  { label: "Inverno", slug: "inverno" },
  { label: "Outono", slug: "outono" },
  { label: "Verao", slug: "verao" },
  { label: "Primavera", slug: "primavera" }
];

export function HomePage() {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);

  useEffect(() => {
    fetchProducts()
      .then((items) => setFeaturedProducts(items.slice(0, 3)))
      .catch(() => setFeaturedProducts([]));
  }, []);

  return (
    <div className="space-y-10">
      <section className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
        <div className="card overflow-hidden bg-[linear-gradient(135deg,#fff8f4_0%,#f3d9d0_55%,#c58f68_150%)]">
          <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="space-y-6">
              <p className="pill">Essence Fit</p>
              <h2 className="font-display text-5xl leading-tight text-espresso sm:text-6xl">
                Moda fitness feminina com recompensa por constancia.
              </h2>
              <p className="max-w-xl text-lg leading-8 text-espresso/75">
                Treine, registre, evolua e ganhe beneficios. A loja une estilo,
                check-in fitness e cupons por pontos em uma experiencia premium.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link to="/produtos" className="button-primary">
                  Explorar colecao
                </Link>
                <Link to="/cadastro" className="button-secondary">
                  Criar conta
                </Link>
              </div>
            </div>
            <div className="rounded-[28px] bg-white/55 p-4 shadow-soft">
              <img
                src="https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=900&q=80"
                alt="Essence Fit"
                className="h-full min-h-[320px] w-full rounded-[24px] object-cover"
              />
            </div>
          </div>
        </div>
        <div className="grid gap-6">
          <div className="card">
            <p className="pill">Check-in Fitness</p>
            <h3 className="mt-4 font-display text-3xl">30 dias de foco, mais recompra.</h3>
            <p className="mt-3 text-espresso/70">
              A primeira compra libera uma area exclusiva para registrar atividades e transformar disciplina em desconto.
            </p>
          </div>
          <div className="card bg-espresso text-white">
            <p className="text-sm uppercase tracking-[0.2em] text-white/70">Categorias</p>
            <ul className="mt-4 space-y-3 text-lg">
              <li>Leggings</li>
              <li>Tops</li>
              <li>Shorts</li>
              <li>Conjuntos</li>
              <li>Casacos Desportivos</li>
              <li>Macaquinhos</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="card">
        <SectionIntro
          eyebrow="Colecoes do ano"
          title="Produtos por estacao"
          description="A navegacao por estacao organiza a experiencia de compra e ajuda a combinar clima, treino e estilo."
        />
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {seasonLinks.map((season) => (
            <Link
              key={season.slug}
              to={`/produtos/estacao/${season.slug}`}
              className="rounded-[24px] border border-espresso/10 bg-white/70 p-6 transition hover:-translate-y-1 hover:shadow-soft"
            >
              <p className="text-sm uppercase tracking-[0.2em] text-clay">Essence Fit</p>
              <h3 className="mt-4 font-display text-3xl text-espresso">{season.label}</h3>
              <p className="mt-3 text-sm text-espresso/70">Ver selecao pensada para esta estacao.</p>
            </Link>
          ))}
        </div>
      </section>

      <section>
        <SectionIntro
          eyebrow="Mais vendidos"
          title="Selecao feminina para treino e movimento"
          description="Modelagem bonita, zero transparencia e conforto extremo em peças pensadas para academia, corrida, pilates, danca e funcional."
          action={
            <Link to="/produtos" className="button-secondary">
              Ver todos
            </Link>
          }
        />
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {featuredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>
    </div>
  );
}
