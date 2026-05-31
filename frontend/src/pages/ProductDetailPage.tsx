import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { fetchProduct } from "../services/productService";
import type { Product } from "../types";

type GalleryImage = {
  src: string;
  alt: string;
};

const productGalleries: Record<string, GalleryImage[]> = {
  "conjunto-studio-sculpt-preto": [
    {
      src: "https://images.pexels.com/photos/6516177/pexels-photo-6516177.jpeg?auto=compress&cs=tinysrgb&w=1400",
      alt: "Modelo usando top e legging preta em alongamento de estudio"
    },
    {
      src: "https://images.pexels.com/photos/6516202/pexels-photo-6516202.jpeg?auto=compress&cs=tinysrgb&w=1400",
      alt: "Modelo com conjunto preto e tapete de treino em estudio claro"
    },
    {
      src: "https://images.pexels.com/photos/15231709/pexels-photo-15231709.jpeg?auto=compress&cs=tinysrgb&w=1400",
      alt: "Modelo de costas usando conjunto preto em ensaio fitness"
    }
  ],
  "set-flow-pastel-pilates": [
    {
      src: "https://images.pexels.com/photos/8483394/pexels-photo-8483394.jpeg?auto=compress&cs=tinysrgb&w=1400",
      alt: "Modelos usando activewear pastel em estudio neutro"
    },
    {
      src: "https://images.pexels.com/photos/8483397/pexels-photo-8483397.jpeg?auto=compress&cs=tinysrgb&w=1400",
      alt: "Conjuntos pastel em pose sentada com fundo bege"
    },
    {
      src: "https://images.pexels.com/photos/8483355/pexels-photo-8483355.jpeg?auto=compress&cs=tinysrgb&w=1400",
      alt: "Detalhe aproximado de modelos usando activewear em tons claros"
    }
  ],
  "conjunto-gray-power-studio": [
    {
      src: "https://images.pexels.com/photos/6311389/pexels-photo-6311389.jpeg?auto=compress&cs=tinysrgb&w=1400",
      alt: "Modelo usando top cinza e legging em estudio"
    },
    {
      src: "https://images.pexels.com/photos/6311448/pexels-photo-6311448.jpeg?auto=compress&cs=tinysrgb&w=1400",
      alt: "Modelo sentada usando conjunto cinza de treino"
    },
    {
      src: "https://images.pexels.com/photos/7583818/pexels-photo-7583818.jpeg?auto=compress&cs=tinysrgb&w=1400",
      alt: "Modelo usando top cinza e legging preta em retrato fitness"
    }
  ],
  "conjunto-outdoor-energy-azul": [
    {
      src: "https://images.pexels.com/photos/29242373/pexels-photo-29242373.jpeg?auto=compress&cs=tinysrgb&w=1400",
      alt: "Modelo usando top e legging azul ao ar livre"
    },
    {
      src: "https://images.pexels.com/photos/29242400/pexels-photo-29242400.jpeg?auto=compress&cs=tinysrgb&w=1400",
      alt: "Detalhe de conjunto azul em treino externo"
    },
    {
      src: "https://images.pexels.com/photos/7239877/pexels-photo-7239877.jpeg?auto=compress&cs=tinysrgb&w=1400",
      alt: "Modelo usando legging azul em pose de alongamento"
    }
  ],
  "macacao-balance-soft": [
    {
      src: "https://images.pexels.com/photos/5770475/pexels-photo-5770475.jpeg?auto=compress&cs=tinysrgb&w=1400",
      alt: "Modelo usando bodysuit nude em pose elegante"
    },
    {
      src: "https://images.pexels.com/photos/9167197/pexels-photo-9167197.jpeg?auto=compress&cs=tinysrgb&w=1400",
      alt: "Modelo com bodysuit nude em ensaio de estudio"
    },
    {
      src: "https://images.pexels.com/photos/5253966/pexels-photo-5253966.jpeg?auto=compress&cs=tinysrgb&w=1400",
      alt: "Modelo vestindo bodysuit em tom neutro"
    }
  ],
  "short-studio-cycling-preto": [
    {
      src: "https://images.pexels.com/photos/6516171/pexels-photo-6516171.jpeg?auto=compress&cs=tinysrgb&w=1400",
      alt: "Modelo usando crop top e short cycling preto em estudio"
    },
    {
      src: "https://images.pexels.com/photos/7341729/pexels-photo-7341729.jpeg?auto=compress&cs=tinysrgb&w=1400",
      alt: "Grupo usando shorts cycling pretos em ensaio fitness"
    },
    {
      src: "https://images.pexels.com/photos/15300123/pexels-photo-15300123.jpeg?auto=compress&cs=tinysrgb&w=1400",
      alt: "Modelo usando top preto e short cycling em academia"
    }
  ]
};

function getProductGallery(product: Product): GalleryImage[] {
  const specificGallery = productGalleries[product.slug];
  if (specificGallery?.length) return specificGallery;

  return [
    {
      src: product.image,
      alt: product.name
    }
  ];
}

export function ProductDetailPage() {
  const { id } = useParams();
  const { addItem } = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  useEffect(() => {
    if (!id) return;
    fetchProduct(id).then(setProduct).catch(() => setProduct(null));
  }, [id]);

  useEffect(() => {
    setActiveImageIndex(0);
  }, [product?.id]);

  const gallery = useMemo(() => (product ? getProductGallery(product) : []), [product]);
  const activeImage = gallery[activeImageIndex] ?? gallery[0];

  function goToPreviousImage() {
    setActiveImageIndex((current) => (current === 0 ? gallery.length - 1 : current - 1));
  }

  function goToNextImage() {
    setActiveImageIndex((current) => (current + 1) % gallery.length);
  }

  if (!product || !activeImage) {
    return <div className="card">Produto nao encontrado.</div>;
  }

  return (
    <section className="grid gap-8 lg:grid-cols-[1fr_0.9fr]">
      <div className="grid gap-4">
        <div className="image-finish relative overflow-hidden rounded-lg border border-theme bg-theme-hero shadow-[0_28px_80px_var(--shadow-strong)]">
          <img src={activeImage.src} alt={activeImage.alt} className="h-full min-h-[560px] w-full object-cover" />
          {gallery.length > 1 ? (
            <>
              <button
                type="button"
                className="absolute left-4 top-1/2 z-[3] flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/30 bg-black/45 text-2xl font-bold text-white backdrop-blur transition hover:bg-white hover:text-theme-primary"
                onClick={goToPreviousImage}
                aria-label="Imagem anterior"
              >
                ‹
              </button>
              <button
                type="button"
                className="absolute right-4 top-1/2 z-[3] flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/30 bg-black/45 text-2xl font-bold text-white backdrop-blur transition hover:bg-white hover:text-theme-primary"
                onClick={goToNextImage}
                aria-label="Proxima imagem"
              >
                ›
              </button>
              <div className="absolute bottom-4 right-4 z-[3] rounded-full bg-black/48 px-3 py-1 text-xs font-bold uppercase tracking-[0.12em] text-white backdrop-blur">
                {activeImageIndex + 1} / {gallery.length}
              </div>
            </>
          ) : null}
        </div>
        <div className="grid grid-cols-3 gap-3">
          {gallery.map((image, index) => (
            <button
              key={`${image.src}-${index}`}
              type="button"
              className={`image-finish h-28 overflow-hidden rounded-lg border bg-theme-muted shadow-[0_14px_38px_var(--shadow-soft)] transition ${index === activeImageIndex ? "border-theme-accent opacity-100" : "border-theme opacity-68 hover:opacity-100"}`}
              onClick={() => setActiveImageIndex(index)}
              aria-label={`Ver imagem ${index + 1}`}
            >
              <img src={image.src} alt={image.alt} className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      </div>

      <div className="card self-start">
        <p className="pill">{product.season}</p>
        <h2 className="mt-4 font-display text-5xl leading-tight text-theme-primary">{product.name}</h2>
        <p className="mt-4 text-lg leading-8 text-theme-secondary">{product.description}</p>
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          <div className="rounded-lg border border-theme bg-theme-card p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.42)]">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-theme-accent">Preco</p>
            <p className="mt-2 text-3xl font-black text-theme-primary">R$ {product.price.toFixed(2)}</p>
          </div>
          <div className="rounded-lg border border-theme bg-theme-card p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.42)]">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-theme-accent">Detalhes</p>
            <p className="mt-2 text-base font-semibold text-theme-primary">{product.color} | {product.size}</p>
          </div>
        </div>
        <div className="mt-6 grid gap-3 rounded-lg border border-theme bg-theme-muted p-5 text-sm leading-6 text-theme-secondary">
          <div className="flex justify-between gap-4 border-b border-theme pb-3"><span>Toque</span><strong className="text-theme-primary">Firme e macio</strong></div>
          <div className="flex justify-between gap-4 border-b border-theme pb-3"><span>Cobertura</span><strong className="text-theme-primary">Uso intenso</strong></div>
          <div className="flex justify-between gap-4"><span>Estilo</span><strong className="text-theme-primary">Treino e rotina</strong></div>
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
