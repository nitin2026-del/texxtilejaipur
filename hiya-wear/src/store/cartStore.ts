import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CartItem, Product } from '../types';

interface CartState {
  items: CartItem[];
  isOpen: boolean;

  addItem: (product: Product, quantity?: number, size?: string) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  itemCount: () => number;
  totalInr: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,

      addItem: (product: Product, quantity = 1, size?: string) => {
        const { items } = get();
        const existingIndex = items.findIndex(
          (i) => i.product_id === product.id && i.selected_size === size
        );

        if (existingIndex >= 0) {
          const updated = [...items];
          const newQty = Math.min(
            updated[existingIndex].quantity + quantity,
            product.stock_quantity
          );
          updated[existingIndex] = { ...updated[existingIndex], quantity: newQty };
          set({ items: updated, isOpen: true });
        } else {
          const newItem: CartItem = {
            id: `${product.id}-${size ?? 'default'}-${Date.now()}`,
            product_id: product.id,
            product: {
              id: product.id,
              name: product.name,
              sku: product.sku,
              images: product.images,
              price_inr: product.price_inr,
              price_usd: product.price_usd,
              price_eur: product.price_eur,
              price_gbp: product.price_gbp,
              price_aud: product.price_aud,
              stock_quantity: product.stock_quantity,
            },
            quantity: Math.min(quantity, product.stock_quantity),
            selected_size: size,
          };
          set({ items: [...items, newItem], isOpen: true });
        }
      },

      removeItem: (productId: string) => {
        set((state) => ({
          items: state.items.filter((i) => i.product_id !== productId),
        }));
      },

      updateQuantity: (productId: string, quantity: number) => {
        if (quantity <= 0) {
          get().removeItem(productId);
          return;
        }
        set((state) => ({
          items: state.items.map((i) =>
            i.product_id === productId
              ? { ...i, quantity: Math.min(quantity, i.product.stock_quantity) }
              : i
          ),
        }));
      },

      clearCart: () => set({ items: [] }),

      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),
      toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),

      itemCount: () => get().items.reduce((sum, i) => sum + i.quantity, 0),

      totalInr: () =>
        get().items.reduce((sum, i) => sum + i.product.price_inr * i.quantity, 0),
    }),
    {
      name: 'hiya-wear-cart',
      partialize: (state) => ({ items: state.items }),
    }
  )
);
