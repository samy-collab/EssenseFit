import { api } from "../lib/api";
import type { Product, ProductApi } from "../types";
import { mapProduct } from "../utils/mappers";

export type ProductPayload = {
  name: string;
  description: string;
  price: number;
  size: string;
  color: string;
  stock: number;
  season: string;
  image: string;
  active: boolean;
};

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

export async function fetchAdminProducts() {
  const { data } = await api.get<ProductApi[]>("/admin/products");
  return data.map(mapProduct);
}

export async function createProduct(payload: ProductPayload) {
  const { data } = await api.post<ProductApi>("/products", payload);
  return mapProduct(data);
}

export async function updateProduct(id: number, payload: ProductPayload) {
  const { data } = await api.put<ProductApi>(`/products/${id}`, payload);
  return mapProduct(data);
}

export async function deleteProduct(id: number) {
  await api.delete(`/products/${id}`);
}

export async function uploadProductImage(file: File) {
  const formData = new FormData();
  formData.append("image", file);

  const { data } = await api.post<{ url: string }>("/uploads", formData);
  return data.url;
}
