import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { SectionIntro } from "../components/SectionIntro";
import { fetchProducts } from "../services/productService";
import type { Product } from "../types";

const webImages = {
  hero: "https://images.pexels.com/photos/6516234/pexels-photo-6516234.jpeg?auto=compress&cs=tinysrgb&w=1800",
  studio: "https://images.pexels.com/photos/8483394/pexels-photo-8483394.jpeg?auto=compress&cs=tinysrgb&w=1200",
  motion: "https://images.pexels.com/photos/8957661/pexels-photo-8957661.jpeg?auto=compress&cs=tinysrgb&w=1400",
  outdoor: "https://images.pexels.com/photos/29705699/pexels-photo-29705699.jpeg?auto=compress&cs=tinysrgb&w=1400",
  detail: "https://images.pexels.com/photos/5770475/pexels-photo-5770475.jpeg?auto=compress&cs=tinysrgb&w=1200",
  duo: "https://images.pexels.com/photos/6311389/pexels-photo-6311389.jpeg?auto=compress&cs=tinysrgb&w=1200"
};

const seasonLinks = [
  { label: "Inverno", slug: "inverno", image: webImages.studio, tone: "Camadas firmês para treino, rua e dias frios." },
  { label: "Outono", slug: "outono", image: webImages.duo, tone: "Tons sobrios, textura e rotina sem esforco." },
  { label: "Verao", slug: "verao", image: webImages.outdoor, tone: "Leveza, cor e frescor para movimento ao ar livre." },
  { label: "Primavera", slug: "primavera", image: webImages.motion, tone: "Energia visual para danca, pilates e caminhada." }
];

const markers = ["Activewear feminino", "Check-in fitness", "Pontos e cupons", "Colecoes por estacao"];

export function HomePage() {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);

  useEffect(() => {
    fetchProducts()
      .then((items) => setFeaturedProducts(items.slice(0, 3)))
      .catch(() => setFeaturedProducts([]));
  }, []);

  return (
    <div className="space-y-0">
      <section className="relative -mx-4 min-h-[calc(100vh-104px)] overflow-hidden bg-theme-hero text-white sm:-mx-6 lg:-mx-8">
        <img src={webImages.hero} alt="Editorial de moda fitness Essence Fit" className="absolute inset-0 h-full w-full object-cover opacity-72" />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(8,10,9,0.92)_0%,rgba(8,10,9,0.56)_48%,rgba(8,10,9,0.18)_100%)]" />
        <div className="fabric-texture absolute inset-0" />

        <div className="page-shell relative grid min-h-[calc(100vh-104px)] items-end gap-10 py-12 lg:grid-cols-[0.78fr_0.72fr] lg:py-16">
          <div className="max-w-3xl pb-8">
            <p className="inline-flex rounded-full border border-white/25 bg-white/12 px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-white/88 backdrop-blur">
              Essence Fit Lookbook
            </p>
            <h2 className="mt-6 font-display text-5xl leading-[0.92] text-white sm:text-7xl lg:text-8xl">
              Moda fitness com pele, movimento e presenca.
            </h2>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-white/80">
              Uma vitrine menos dura para roupas que vivem fora da foto: treino, rua, rotina e recompensa no mesmo fluxo.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/produtos" className="button-primary bg-theme-card text-theme-primary hover:bg-[#f2d0c8]">Ver coleção</Link>
              <Link to="/check-in-fitness" className="inline-flex items-center justify-center rounded-md border border-white/35 px-5 py-3 text-sm font-bold text-white transition hover:bg-theme-card hover:text-theme-primary">Check-in</Link>
            </div>
          </div>

          <div className="hidden self-end pb-8 lg:block">
            <div className="ml-auto max-w-md border-l border-white/28 pl-6">
              <p className="text-sm leading-7 text-white/76">
                Looks reais, recortes grandes e menos caixas. A Home funciona como editorial da marca antes de virar catálogo.
              </p>
              <div className="mt-6 flex flex-wrap gap-2">
                {markers.map((item) => (
                  <span key={item} className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.12em] text-white/72 backdrop-blur">
                    {item}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section-band bg-theme-shell py-16">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div className="space-y-6">
            <p className="pill">Direcao visual</p>
            <h2 className="font-display text-4xl leading-tight text-theme-primary sm:text-6xl">
              O site respira melhor quando a roupa aparece em cena.
            </h2>
            <p className="max-w-xl text-lg leading-8 text-theme-secondary">
              Em vez de empilhar cards, a Home abre espaco para imagem grande, detalhes de textura e chamadas curtas. A cliente entende a energia da marca antes de comparar produtos.
            </p>
            <div className="grid gap-4 border-y border-theme py-6 sm:grid-cols-3">
              <div>
                <p className="font-display text-4xl text-theme-primary">4</p>
                <p className="mt-1 text-xs font-bold uppercase tracking-[0.14em] text-theme-muted">estacoes</p>
              </div>
              <div>
                <p className="font-display text-4xl text-theme-primary">30</p>
                <p className="mt-1 text-xs font-bold uppercase tracking-[0.14em] text-theme-muted">check-ins</p>
              </div>
              <div>
                <p className="font-display text-4xl text-theme-primary">1</p>
                <p className="mt-1 text-xs font-bold uppercase tracking-[0.14em] text-theme-muted">compra inicial</p>
              </div>
            </div>
          </div>

          <div className="grid min-h-[620px] grid-cols-5 grid-rows-6 gap-4">
            <div className="image-finish col-span-3 row-span-4 overflow-hidden rounded-lg bg-theme-hero shadow-[0_24px_70px_var(--shadow-soft)]">
              <img src={webImages.studio} alt="Activewear em estudio" className="h-full w-full object-cover" />
            </div>
            <div className="image-finish col-span-2 row-span-3 overflow-hidden rounded-lg bg-theme-hero shadow-[0_20px_60px_var(--shadow-soft)]">
              <img src={webImages.detail} alt="Moda fitness inclusiva" className="h-full w-full object-cover" />
            </div>
            <div className="col-span-2 row-span-3 flex items-end rounded-lg bg-theme-primary p-6 text-theme-inverse shadow-[0_20px_60px_var(--shadow-soft)]">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] opacity-65">Sensacao</p>
                <p className="mt-3 font-display text-4xl leading-tight">conforto que parece editorial</p>
              </div>
            </div>
            <div className="image-finish col-span-3 row-span-2 overflow-hidden rounded-lg bg-theme-hero shadow-[0_20px_60px_var(--shadow-soft)]">
              <img src={webImages.motion} alt="Grupo em movimento" className="h-full w-full object-cover" />
            </div>
          </div>
        </div>
      </section>

      <section className="section-band bg-theme-card py-16">
        <div className="mx-auto max-w-7xl">
          <SectionIntro
            eyebrow="Colecoes"
            title="Escolha por clima, energia e rotina"
            description="As estacoes aparecem como cenas de campanha. O clique leva para o catálogo filtrado, mas a primeira leitura e visual."
          />
          <div className="grid gap-4 lg:grid-cols-4">
            {seasonLinks.map((season, index) => (
              <Link
                key={season.slug}
                to={`/produtos/estacao/${season.slug}`}
                className={`group image-finish relative min-h-[520px] overflow-hidden rounded-lg bg-theme-hero text-white shadow-[0_24px_70px_rgba(25,27,24,0.16)] ${index === 1 ? "lg:translate-y-10" : ""} ${index === 2 ? "lg:-translate-y-6" : ""}`}
              >
                <img src={season.image} alt={`Coleção ${season.label}`} className="absolute inset-0 h-full w-full object-cover opacity-82 transition duration-700 group-hover:scale-105 group-hover:opacity-95" />
                <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(8,10,9,0.05)_0%,rgba(8,10,9,0.84)_100%)]" />
                <div className="absolute inset-x-0 bottom-0 z-[2] p-6">
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-white/62">Coleção</p>
                  <h3 className="mt-2 font-display text-4xl text-white">{season.label}</h3>
                  <p className="mt-3 text-sm leading-6 text-white/78">{season.tone}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="section-band bg-theme-band py-16">
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[1fr_0.82fr] lg:items-center">
          <div className="relative min-h-[620px] overflow-hidden rounded-lg bg-theme-hero text-white shadow-[0_28px_80px_var(--shadow-strong)]">
            <img src={webImages.outdoor} alt="Activewear ao ar livre" className="absolute inset-0 h-full w-full object-cover opacity-76" />
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(8,10,9,0.05),rgba(8,10,9,0.78))]" />
            <div className="absolute inset-x-0 bottom-0 z-[2] p-7 sm:p-9">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-white/62">Check-in Fitness</p>
              <h2 className="mt-3 max-w-2xl font-display text-5xl leading-tight text-white sm:text-6xl">
                O treino tambem faz parte da experiência de compra.
              </h2>
            </div>
          </div>

          <div className="space-y-8 lg:pl-8">
            <p className="pill">Depois da compra</p>
            <h2 className="font-display text-4xl leading-tight text-theme-primary sm:text-5xl">
              Pontos, cupons e constancia sem transformar a Home em dashboard.
            </h2>
            <p className="text-lg leading-8 text-theme-secondary">
              A Home mostra o conceito; as telas internas cuidam da operação. Assim a primeira impressao fica leve, visual e aspiracional.
            </p>
            <div className="space-y-4 border-l border-theme pl-5">
              {[
                ["01", "Primeira compra libera a área fitness"],
                ["02", "Check-ins registram frequencia"],
                ["03", "Pontos viram cupons para recompra"]
              ].map(([number, text]) => (
                <div key={number}>
                  <span className="text-xs font-black uppercase tracking-[0.2em] text-theme-accent">{number}</span>
                  <p className="mt-1 text-xl font-bold text-theme-primary">{text}</p>
                </div>
              ))}
            </div>
            <div className="flex flex-wrap gap-3">
              <Link to="/check-in-fitness" className="button-primary">Abrir check-in</Link>
              <Link to="/meus-pontos" className="button-secondary">Ver pontos</Link>
            </div>
          </div>
        </div>
      </section>

      <section className="section-band bg-theme-shell pb-10 pt-16">
        <div className="mx-auto max-w-7xl">
          <SectionIntro
            eyebrow="Mais vistos"
            title="Produtos aparecem como campanha, não como prateleira"
            description="A prateleira completa continua no catálogo. Aqui, os destaques entram como imagens grandes para manter a Home limpa."
            action={<Link to="/produtos" className="button-secondary">Ver catálogo</Link>}
          />
          <div className="grid gap-5 lg:grid-cols-3">
            {featuredProducts.map((product, index) => (
              <Link
                key={product.id}
                to={`/produtos/${product.id}`}
                className={`group image-finish relative min-h-[460px] overflow-hidden rounded-lg bg-theme-hero text-white shadow-[0_24px_70px_rgba(25,27,24,0.16)] ${index === 0 ? "lg:col-span-2" : ""}`}
              >
                <img src={product.image} alt={product.name} className="absolute inset-0 h-full w-full object-cover opacity-82 transition duration-700 group-hover:scale-105 group-hover:opacity-95" />
                <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(8,10,9,0.04)_0%,rgba(8,10,9,0.86)_100%)]" />
                <div className="absolute inset-x-0 bottom-0 z-[2] p-6 sm:p-7">
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-white/62">{product.season}</p>
                  <h3 className="mt-3 max-w-xl font-display text-4xl leading-tight text-white sm:text-5xl">{product.name}</h3>
                  <div className="mt-4 flex flex-wrap items-center gap-3 text-sm font-bold text-white/80">
                    <span>R$ {product.price.toFixed(2)}</span>
                    <span className="h-1 w-1 rounded-full bg-white/50" />
                    <span>{product.color}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
