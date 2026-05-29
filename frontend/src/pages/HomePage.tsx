import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ProductCard } from "../components/ProductCard";
import { SectionIntro } from "../components/SectionIntro";
import { fetchProducts } from "../services/productService";
import type { Product } from "../types";

const seasonLinks = [
  { label: "Inverno", slug: "inverno", image: "/brand/pdf-assets/asset-039.png", tone: "Treino aquecido, textura firme e camadas inteligentes." },
  { label: "Outono", slug: "outono", image: "/brand/pdf-assets/asset-044.png", tone: "Tons sobrios para rotina, deslocamento e academia." },
  { label: "Verao", slug: "verao", image: "/brand/pdf-assets/asset-031.png", tone: "Leveza, sustentacao e frescor para dias intensos." },
  { label: "Primavera", slug: "primavera", image: "/brand/pdf-assets/asset-048.png", tone: "Cores vivas para movimento, pilates e caminhada." }
];

const metrics = [
  { value: "30", label: "dias de check-in fitness" },
  { value: "4", label: "colecoes por estacao" },
  { value: "1", label: "compra para liberar pontos" }
];

const benefits = [
  { title: "Compra com proposito", description: "Produtos organizados por clima, treino e ocasiao para reduzir escolha aleatoria." },
  { title: "Rotina conectada", description: "Depois da primeira compra, o check-in transforma frequencia em progresso visivel." },
  { title: "Recompensa clara", description: "Pontos e cupons ficam separados para recompra, sem misturar loja e acompanhamento." }
];

export function HomePage() {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);

  useEffect(() => {
    fetchProducts()
      .then((items) => setFeaturedProducts(items.slice(0, 3)))
      .catch(() => setFeaturedProducts([]));
  }, []);

  return (
    <div className="space-y-0">
      <section className="relative -mx-4 overflow-hidden bg-theme-hero text-white sm:-mx-6 lg:-mx-8">
        <div className="absolute inset-0">
          <img
            src="/brand/pdf-assets/asset-028.png"
            alt="Colecao Essence Fit"
            className="h-full w-full object-cover opacity-55"
          />
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(15,14,12,0.94)_0%,rgba(15,14,12,0.72)_42%,rgba(15,14,12,0.18)_100%)]" />
        </div>

        <div className="page-shell relative grid min-h-[620px] items-end gap-10 py-12 lg:grid-cols-[0.92fr_0.58fr] lg:py-16">
          <div className="max-w-3xl pb-4">
            <p className="inline-flex rounded-full border border-white/25 bg-white/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-white/85 backdrop-blur">
              Essence Fit
            </p>
            <h2 className="mt-6 font-display text-5xl leading-[0.95] text-white sm:text-7xl lg:text-8xl">
              Performance com aparencia de rotina real.
            </h2>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-white/78">
              Moda fitness feminina com colecoes por estacao, check-in de disciplina e recompensas que fazem sentido depois da compra.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/produtos" className="button-primary bg-theme-card text-theme-primary hover:bg-[#f0c7b2]">
                Explorar colecao
              </Link>
              <Link to="/check-in-fitness" className="inline-flex items-center justify-center rounded-md border border-white/35 px-5 py-3 text-sm font-bold text-white transition hover:bg-theme-card hover:text-theme-primary">
                Ver check-in
              </Link>
            </div>
          </div>

          <div className="grid gap-3 self-end sm:grid-cols-3 lg:grid-cols-1">
            {metrics.map((metric) => (
              <div key={metric.label} className="border-l-2 border-[#f0c7b2] bg-white/10 p-5 backdrop-blur-md">
                <p className="font-display text-4xl text-white">{metric.value}</p>
                <p className="mt-1 text-sm font-semibold uppercase tracking-[0.14em] text-white/70">{metric.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section-band bg-theme-shell">
        <div className="mx-auto grid max-w-7xl gap-5 md:grid-cols-3">
          {benefits.map((benefit, index) => (
            <div key={benefit.title} className="border-t border-theme pt-5">
              <span className="text-xs font-black uppercase tracking-[0.2em] text-theme-accent">0{index + 1}</span>
              <h3 className="mt-4 font-display text-3xl leading-tight text-theme-primary">{benefit.title}</h3>
              <p className="mt-3 leading-7 text-theme-secondary">{benefit.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="section-band bg-theme-card">
        <div className="mx-auto max-w-7xl">
          <SectionIntro
            eyebrow="Colecoes do ano"
            title="Cada estacao com uma linguagem propria"
            description="A loja separa as pecas por contexto de uso, temperatura e sensacao no corpo, deixando a compra mais objetiva."
          />
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {seasonLinks.map((season) => (
              <Link
                key={season.slug}
                to={`/produtos/estacao/${season.slug}`}
                className="group relative min-h-[360px] overflow-hidden rounded-lg bg-stone-900 text-white shadow-[0_18px_50px_rgba(33,31,28,0.12)]"
              >
                <img
                  src={season.image}
                  alt={`Colecao ${season.label}`}
                  className="absolute inset-0 h-full w-full object-cover opacity-72 transition duration-500 group-hover:scale-105 group-hover:opacity-88"
                />
                <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(15,14,12,0.10)_0%,rgba(15,14,12,0.82)_100%)]" />
                <div className="absolute inset-x-0 bottom-0 p-6">
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-white/70">Essence Fit</p>
                  <h3 className="mt-3 font-display text-4xl text-white">{season.label}</h3>
                  <p className="mt-3 text-sm leading-6 text-white/78">{season.tone}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="section-band bg-theme-band">
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[0.72fr_1fr] lg:items-center">
          <div>
            <p className="pill">Check-in Fitness</p>
            <h2 className="mt-5 font-display text-4xl leading-tight text-theme-primary sm:text-5xl">
              A compra abre uma area de acompanhamento, nao so um pedido.
            </h2>
            <p className="mt-5 text-lg leading-8 text-theme-secondary">
              O fluxo separa loja, treino e recompensa: primeiro a cliente compra, depois registra consistencia e acompanha pontos para trocar por cupons.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/cadastro" className="button-primary">Criar conta</Link>
              <Link to="/meus-pontos" className="button-secondary">Ver pontos</Link>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <img
              src="/brand/pdf-assets/asset-055.png"
              alt="Treino Essence Fit"
              className="h-[460px] w-full rounded-lg object-cover shadow-[0_22px_65px_rgba(33,31,28,0.16)]"
            />
            <div className="grid content-end gap-4">
              <div className="rounded-lg bg-theme-hero p-6 text-white">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-white/55">Categorias</p>
                <div className="mt-5 grid grid-cols-2 gap-3 text-sm font-semibold text-white/86">
                  <span>Leggings</span>
                  <span>Tops</span>
                  <span>Shorts</span>
                  <span>Conjuntos</span>
                  <span>Casacos</span>
                  <span>Macaquinhos</span>
                </div>
              </div>
              <img
                src="/brand/pdf-assets/asset-062.png"
                alt="Detalhe Essence Fit"
                className="h-56 w-full rounded-lg object-cover shadow-[0_22px_65px_rgba(33,31,28,0.12)]"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="section-band bg-theme-shell pb-6">
        <div className="mx-auto max-w-7xl">
          <SectionIntro
            eyebrow="Mais vendidos"
            title="Selecao feminina para treino e movimento"
            description="Modelagem bonita, zero transparencia e conforto extremo em pecas pensadas para academia, corrida, pilates, danca e funcional."
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
        </div>
      </section>
    </div>
  );
}
