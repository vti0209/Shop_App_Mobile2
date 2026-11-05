import React, { createContext, useContext, useMemo, useState, type ReactNode } from 'react';
import type { CartItem, Product } from '../../database/types';

interface CartContextValue {
  items: CartItem[];
  itemCount: number;
  addToCart: (product: Product) => void;
  setQuantity: (productId: number, quantity: number) => void;
  removeFromCart: (productId: number) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [items, setItems] = useState<CartItem[]>([]);

  const value = useMemo<CartContextValue>(() => ({
    items,
    itemCount: items.reduce((total, item) => total + item.quantity, 0),
    addToCart: (product) => {
      setItems((current) => {
        const existing = current.find((item) => item.product.id === product.id);
        return existing
          ? current.map((item) =>
              item.product.id === product.id
                ? { ...item, quantity: item.quantity + 1 }
                : item
            )
          : [...current, { product, quantity: 1 }];
      });
    },
    setQuantity: (productId, quantity) => {
      setItems((current) =>
        quantity <= 0
          ? current.filter((item) => item.product.id !== productId)
          : current.map((item) =>
              item.product.id === productId ? { ...item, quantity } : item
            )
      );
    },
    removeFromCart: (productId) => {
      setItems((current) => current.filter((item) => item.product.id !== productId));
    },
    clearCart: () => setItems([]),
  }), [items]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = (): CartContextValue => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart phải được sử dụng bên trong CartProvider.');
  }
  return context;
};
