import { api } from "../lib/api";
import type { Product, ProductApi } from "../types";
import { mapProduct } from "../utils/mappers";

export async function fetchProducts(season?: string) {
  const { data } = await api.get<ProductApi[]>("/products", {
    params: season ? { season } : undefined
  });
  return data.map(mapProduct);
}

export async function fetchProduct(id: string) {
  const { data } = await api.get<ProductApi>(`/products/${id}`);
  return mapProduct(data);
}
