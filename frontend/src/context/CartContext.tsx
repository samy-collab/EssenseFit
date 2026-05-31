import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { CartItem, Product } from "../types";

type CartContextValue = {
  items: CartItem[];
  addItem: (product: Product) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  removeItem: (productId: number) => void;
  clearCart: () => void;
  itemCount: number;
  total: number;
};

const CART_KEY = "essencefit_cart";
const CartContext = createContext<CartContextValue | undefined>(undefined);

function getInitialItems(): CartItem[] {
  if (typeof window === "undefined") return [];

  try {
    const stored = window.localStorage.getItem(CART_KEY);
    if (!stored) return [];
    const parsed = JSON.parse(stored) as CartItem[];
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((item) => item?.product?.id && item.quantity > 0);
  } catch {
    return [];
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(getInitialItems);

  useEffect(() => {
    window.localStorage.setItem(CART_KEY, JSON.stringify(items));
  }, [items]);

  function addItem(product: Product) {
    setItems((current) => {
      const existing = current.find((item) => item.product.id === product.id);
      if (existing) {
        return current.map((item) =>
          item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...current, { product, quantity: 1 }];
    });
  }

  function updateQuantity(productId: number, quantity: number) {
    const safeQuantity = Number.isFinite(quantity) ? Math.max(0, Math.floor(quantity)) : 0;
    setItems((current) =>
      current
        .map((item) => (item.product.id === productId ? { ...item, quantity: safeQuantity } : item))
        .filter((item) => item.quantity > 0)
    );
  }

  function removeItem(productId: number) {
    setItems((current) => current.filter((item) => item.product.id !== productId));
  }

  function clearCart() {
    setItems([]);
  }

  const total = useMemo(
    () => items.reduce((sum, item) => sum + item.product.price * item.quantity, 0),
    [items]
  );

  const itemCount = useMemo(
    () => items.reduce((sum, item) => sum + item.quantity, 0),
    [items]
  );

  const value = useMemo(
    () => ({ items, addItem, updateQuantity, removeItem, clearCart, itemCount, total }),
    [items, itemCount, total]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within CartProvider");
  }
  return context;
}
