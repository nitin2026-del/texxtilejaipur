import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { detectCurrency, convertFromINR, formatPrice as fmt, getProductPrice } from '../lib/currency';
import type { CurrencyCode } from '../types';
import { CURRENCIES } from '../types';

interface CurrencyState {
  currency: CurrencyCode;
  setCurrency: (currency: CurrencyCode) => void;
  formatPrice: (amountInr: number) => string;
  convertPrice: (amountInr: number) => number;
  getPrice: (product: {
    price_inr: number;
    price_usd?: number | null;
    price_eur?: number | null;
    price_gbp?: number | null;
    price_aud?: number | null;
  }) => number;
  formatProductPrice: (product: {
    price_inr: number;
    price_usd?: number | null;
    price_eur?: number | null;
    price_gbp?: number | null;
    price_aud?: number | null;
  }) => string;
  currencyInfo: () => typeof CURRENCIES[CurrencyCode];
}

export const useCurrencyStore = create<CurrencyState>()(
  persist(
    (set, get) => ({
      currency: detectCurrency(),

      setCurrency: (currency: CurrencyCode) => set({ currency }),

      formatPrice: (amountInr: number) => {
        const { currency } = get();
        const converted = convertFromINR(amountInr, currency);
        return fmt(converted, currency);
      },

      convertPrice: (amountInr: number) => {
        const { currency } = get();
        return convertFromINR(amountInr, currency);
      },

      getPrice: (product) => {
        const { currency } = get();
        return getProductPrice(product, currency);
      },

      formatProductPrice: (product) => {
        const { currency } = get();
        const price = getProductPrice(product, currency);
        return fmt(price, currency);
      },

      currencyInfo: () => {
        const { currency } = get();
        return CURRENCIES[currency];
      },
    }),
    {
      name: 'hiya-wear-currency',
      partialize: (state) => ({ currency: state.currency }),
    }
  )
);
