import { useCallback, useEffect, useState } from "react";

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

const CART_KEY = "cart_v1";

const readCart = (): CartItem[] => {
  try {
    const raw = localStorage.getItem(CART_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const saveCart = (next: CartItem[]) => {
  try {
    localStorage.setItem(CART_KEY, JSON.stringify(next));
    window.dispatchEvent(new Event("cart-changed"));
  } catch (error) {
    console.error("Failed to persist cart", error);
  }
};

export function useCart() {
  const [items, setItems] = useState<CartItem[]>(() => readCart());

  useEffect(() => {
    const sync = () => setItems(readCart());
    const handleStorage = (event: StorageEvent) => {
      if (event.key === CART_KEY) sync();
    };

    window.addEventListener("cart-changed", sync as EventListener);
    window.addEventListener("storage", handleStorage);
    return () => {
      window.removeEventListener("cart-changed", sync as EventListener);
      window.removeEventListener("storage", handleStorage);
    };
  }, []);

  const updateCart = useCallback((nextFn: (current: CartItem[]) => CartItem[]) => {
    try {
      const next = nextFn(readCart());
      setItems(next);
      saveCart(next);
    } catch (error) {
      console.error("Failed to update cart", error);
    }
  }, []);

  const addItem = useCallback(
    (item: Omit<CartItem, "quantity">) => {
      updateCart((current) => {
        const existing = current.find((p) => p.id === item.id);
        if (existing) {
          return current.map((p) =>
            p.id === item.id ? { ...p, quantity: p.quantity + 1 } : p,
          );
        }
        return [...current, { ...item, quantity: 1 }];
      });
    },
    [updateCart],
  );

  const removeItem = useCallback(
    (id: string) => {
      updateCart((current) => current.filter((p) => p.id !== id));
    },
    [updateCart],
  );

  const clear = useCallback(() => {
    updateCart(() => []);
  }, [updateCart]);

  const totalPrice = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const totalCount = items.reduce((sum, i) => sum + i.quantity, 0);

  return {
    items,
    addItem,
    removeItem,
    clear,
    totalPrice,
    totalCount,
  };
}

