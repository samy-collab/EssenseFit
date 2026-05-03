import { useEffect, useMemo, useState, type FormEvent } from "react";
import {
  createProduct,
  deleteProduct,
  fetchAdminProducts,
  updateProduct,
  uploadProductImage,
  type ProductPayload
} from "../services/productService";
import type { Product } from "../types";

const emptyForm: ProductPayload = {
  name: "",
  description: "",
  price: 0,
  size: "P/M/G",
  color: "",
  stock: 0,
  season: "inverno",
  image: "/brand/pdf-assets/asset-028.png",
  active: true
};

const pdfImageOptions = [
  { label: "Colecao inverno", value: "/brand/pdf-assets/asset-028.png" },
  { label: "Campanha preta", value: "/brand/pdf-assets/asset-004.png" },
  { label: "Top coral", value: "/brand/pdf-assets/asset-005.png" },
  { label: "Conjunto coral", value: "/brand/pdf-assets/asset-006.png" },
  { label: "Treino azul", value: "/brand/pdf-assets/asset-031.png" },
  { label: "Vitrine neutra", value: "/brand/pdf-assets/asset-036.png" },
  { label: "Academia premium", value: "/brand/pdf-assets/asset-039.png" },
  { label: "Top Essence", value: "/brand/pdf-assets/asset-045.png" }
];

export function AdminPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [form, setForm] = useState<ProductPayload>(emptyForm);
  const [editingProductId, setEditingProductId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const activeProducts = useMemo(
    () => products.filter((product) => product.active).length,
    [products]
  );

  useEffect(() => {
    loadProducts();
  }, []);

  async function loadProducts() {
    setLoading(true);
    try {
      const items = await fetchAdminProducts();
      setProducts(items);
    } finally {
      setLoading(false);
    }
  }

  function updateField<Key extends keyof ProductPayload>(key: Key, value: ProductPayload[Key]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function editProduct(product: Product) {
    setEditingProductId(product.id);
    setForm({
      name: product.name,
      description: product.description,
      price: product.price,
      size: product.size,
      color: product.color,
      stock: product.stock ?? 0,
      season: product.season === "verão" ? "verao" : product.season,
      image: product.image,
      active: product.active
    });
    setMessage("");
    setError("");
  }

  function resetForm() {
    setEditingProductId(null);
    setForm(emptyForm);
    setMessage("");
    setError("");
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setMessage("");
    setError("");

    try {
      if (editingProductId) {
        await updateProduct(editingProductId, form);
        setMessage("Produto atualizado com sucesso.");
      } else {
        await createProduct(form);
        setMessage("Produto cadastrado com sucesso.");
      }
      resetForm();
      await loadProducts();
    } catch {
      setError("Nao foi possivel salvar. Confira os campos e tente novamente.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(product: Product) {
    const confirmed = window.confirm(`Remover ${product.name} do catalogo?`);
    if (!confirmed) {
      return;
    }

    try {
      await deleteProduct(product.id);
      setMessage("Produto removido do catalogo.");
      await loadProducts();
      if (editingProductId === product.id) {
        resetForm();
      }
    } catch {
      setError("Nao foi possivel remover o produto.");
    }
  }

  async function handleImageUpload(file: File | undefined) {
    if (!file) {
      return;
    }

    setUploading(true);
    setMessage("");
    setError("");

    try {
      const imageUrl = await uploadProductImage(file);
      updateField("image", imageUrl);
      setMessage("Imagem enviada com sucesso. Salve o produto para aplicar.");
    } catch {
      setError("Nao foi possivel enviar a imagem. Use PNG, JPG, WEBP ou GIF ate 5MB.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <section className="space-y-6">
      <div className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
        <div className="card flex items-center justify-center bg-[#f7f1ec]">
          <img
            src="/brand/logos/LOGOESSENSEFIT.png"
            alt="Essence Fit"
            className="max-h-52 w-full object-contain"
          />
        </div>
        <div className="card bg-[linear-gradient(135deg,#3e2a23_0%,#6a493e_60%,#c58f68_120%)] text-white">
          <p className="text-sm uppercase tracking-[0.2em] text-white/70">Painel Admin</p>
          <h2 className="mt-4 font-display text-5xl">Controle da operacao Essence Fit</h2>
          <p className="mt-4 max-w-2xl text-white/75">
            Cadastre produtos, escolha imagens extraidas do PDF da marca e mantenha a
            vitrine alinhada com a colecao de inverno.
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="card">
          <p className="text-sm text-clay">Produtos ativos</p>
          <p className="mt-4 font-display text-5xl">{loading ? "..." : activeProducts}</p>
        </div>
        <div className="card">
          <p className="text-sm text-clay">Colecao do PDF</p>
          <p className="mt-4 font-display text-5xl">Inverno</p>
        </div>
        <div className="card">
          <p className="text-sm text-clay">Check-in</p>
          <p className="mt-4 font-display text-5xl">30 dias</p>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <form className="card space-y-5" onSubmit={handleSubmit}>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="pill">{editingProductId ? "Edicao" : "Cadastro"}</p>
              <h3 className="mt-4 font-display text-3xl text-espresso">
                {editingProductId ? "Editar produto" : "Novo produto"}
              </h3>
            </div>
            {editingProductId ? (
              <button className="button-secondary" type="button" onClick={resetForm}>
                Cancelar
              </button>
            ) : null}
          </div>

          <label className="block text-sm font-semibold text-espresso">
            Nome
            <input
              className="mt-2 w-full rounded-2xl border border-espresso/15 bg-white px-4 py-3 font-normal"
              value={form.name}
              onChange={(event) => updateField("name", event.target.value)}
              required
            />
          </label>

          <label className="block text-sm font-semibold text-espresso">
            Descricao
            <textarea
              className="mt-2 min-h-28 w-full rounded-2xl border border-espresso/15 bg-white px-4 py-3 font-normal"
              value={form.description}
              onChange={(event) => updateField("description", event.target.value)}
            />
          </label>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block text-sm font-semibold text-espresso">
              Preco
              <input
                className="mt-2 w-full rounded-2xl border border-espresso/15 bg-white px-4 py-3 font-normal"
                min="0"
                step="0.01"
                type="number"
                value={form.price}
                onChange={(event) => updateField("price", Number(event.target.value))}
                required
              />
            </label>
            <label className="block text-sm font-semibold text-espresso">
              Estoque
              <input
                className="mt-2 w-full rounded-2xl border border-espresso/15 bg-white px-4 py-3 font-normal"
                min="0"
                type="number"
                value={form.stock}
                onChange={(event) => updateField("stock", Number(event.target.value))}
                required
              />
            </label>
            <label className="block text-sm font-semibold text-espresso">
              Tamanhos
              <input
                className="mt-2 w-full rounded-2xl border border-espresso/15 bg-white px-4 py-3 font-normal"
                value={form.size}
                onChange={(event) => updateField("size", event.target.value)}
                required
              />
            </label>
            <label className="block text-sm font-semibold text-espresso">
              Cor
              <input
                className="mt-2 w-full rounded-2xl border border-espresso/15 bg-white px-4 py-3 font-normal"
                value={form.color}
                onChange={(event) => updateField("color", event.target.value)}
                required
              />
            </label>
            <label className="block text-sm font-semibold text-espresso">
              Estacao
              <select
                className="mt-2 w-full rounded-2xl border border-espresso/15 bg-white px-4 py-3 font-normal"
                value={form.season}
                onChange={(event) => updateField("season", event.target.value)}
              >
                <option value="inverno">Inverno</option>
                <option value="outono">Outono</option>
                <option value="verao">Verao</option>
                <option value="primavera">Primavera</option>
              </select>
            </label>
            <label className="flex items-center gap-3 pt-8 text-sm font-semibold text-espresso">
              <input
                checked={form.active}
                className="h-5 w-5 accent-clay"
                type="checkbox"
                onChange={(event) => updateField("active", event.target.checked)}
              />
              Produto ativo
            </label>
          </div>

          <label className="block text-sm font-semibold text-espresso">
            Imagem do produto
            <select
              className="mt-2 w-full rounded-2xl border border-espresso/15 bg-white px-4 py-3 font-normal"
              value={form.image}
              onChange={(event) => updateField("image", event.target.value)}
            >
              {pdfImageOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <label className="block text-sm font-semibold text-espresso">
            Upload de imagem
            <input
              accept="image/png,image/jpeg,image/webp,image/gif"
              className="mt-2 w-full rounded-2xl border border-espresso/15 bg-white px-4 py-3 font-normal"
              disabled={uploading}
              type="file"
              onChange={(event) => handleImageUpload(event.target.files?.[0])}
            />
            <span className="mt-2 block text-xs font-normal text-espresso/60">
              {uploading ? "Enviando imagem..." : "PNG, JPG, WEBP ou GIF ate 5MB."}
            </span>
          </label>

          <label className="block text-sm font-semibold text-espresso">
            URL personalizada
            <input
              className="mt-2 w-full rounded-2xl border border-espresso/15 bg-white px-4 py-3 font-normal"
              value={form.image}
              onChange={(event) => updateField("image", event.target.value)}
              required
            />
          </label>

          <div className="overflow-hidden rounded-[24px] border border-espresso/10 bg-white">
            <img src={form.image} alt="Previa do produto" className="h-72 w-full object-cover" />
          </div>

          {message ? <p className="text-sm font-semibold text-green-700">{message}</p> : null}
          {error ? <p className="text-sm font-semibold text-red-600">{error}</p> : null}

          <button className="button-primary w-full" type="submit" disabled={saving}>
            {saving ? "Salvando..." : editingProductId ? "Salvar alteracoes" : "Cadastrar produto"}
          </button>
        </form>

        <div className="card">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="pill">Catalogo</p>
              <h3 className="mt-4 font-display text-3xl text-espresso">Produtos no site</h3>
            </div>
            <button className="button-secondary" type="button" onClick={loadProducts}>
              Atualizar
            </button>
          </div>

          <div className="mt-6 space-y-4">
            {loading ? <p className="text-espresso/70">Carregando produtos...</p> : null}
            {!loading && products.length === 0 ? (
              <p className="text-espresso/70">Nenhum produto cadastrado ainda.</p>
            ) : null}
            {products.map((product) => (
              <article
                key={product.id}
                className="grid gap-4 rounded-[24px] border border-espresso/10 bg-white/70 p-4 sm:grid-cols-[120px_1fr]"
              >
                <img
                  src={product.image}
                  alt={product.name}
                  className="h-32 w-full rounded-2xl object-cover sm:h-full"
                />
                <div className="space-y-3">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-clay">
                        {product.season}
                      </p>
                      <h4 className="font-display text-2xl text-espresso">{product.name}</h4>
                    </div>
                    <span className="font-bold text-clay">R$ {product.price.toFixed(2)}</span>
                  </div>
                  <p className="text-sm text-espresso/70">{product.description}</p>
                  <div className="flex flex-wrap gap-2 text-xs font-semibold text-espresso/70">
                    <span className="rounded-full bg-sand px-3 py-1">{product.color}</span>
                    <span className="rounded-full bg-sand px-3 py-1">{product.size}</span>
                    <span className="rounded-full bg-sand px-3 py-1">
                      Estoque: {product.stock ?? 0}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button className="button-secondary py-2" type="button" onClick={() => editProduct(product)}>
                      Editar
                    </button>
                    <button className="button-secondary py-2" type="button" onClick={() => handleDelete(product)}>
                      Remover
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
