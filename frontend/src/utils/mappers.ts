import type { Product, ProductApi } from "../types";

export function normalizeSeason(season: string): Product["season"] {
  if (season === "verão") {
    return "verao";
  }
  return season as Product["season"];
}

export function mapProduct(product: ProductApi): Product {
  return {
    id: product.id,
    slug: product.slug,
    name: product.name,
    description: product.description,
    price: product.price,
    size: product.size_label,
    color: product.color,
    season: normalizeSeason(product.season),
    image: product.image_url,
    active: product.is_active,
    stock: product.stock
  };
}
