'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export interface CartItem {
  id: string;
  sku: string;
  name: string;
  price_inr: number;
  images: string[];
  quantity: number;
}

export interface CartContextProduct {
  id: string;
  sku: string;
  name: string;
  price_inr: number;
  images: string[];
}

export type Currency = 'INR' | 'USD' | 'EUR' | 'GBP' | 'AED' | 'AUD';

// Mock Exchange Rates with 3% markup applied (Base INR)
const FX_RATES: Record<Currency, number> = {
  INR: 1,
  USD: 0.012 * 1.03, // Live rate roughly 0.012 + markup
  EUR: 0.011 * 1.03,
  GBP: 0.0093 * 1.03,
  AED: 0.044 * 1.03,
  AUD: 0.018 * 1.03,
};

const CURRENCY_SYMBOLS: Record<Currency, string> = {
  INR: '₹',
  USD: '$',
  EUR: '€',
  GBP: '£',
  AED: 'د.إ',
  AUD: 'A$',
};

interface CartContextType {
  cart: CartItem[];
  currency: Currency;
  currencySymbol: string;
  addToCart: (product: CartContextProduct, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  setCurrency: (currency: Currency) => void;
  formatPrice: (priceInr: number) => string;
  getCartTotalInr: () => number;
  getCartTotalDisplay: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [currency, setCurrencyState] = useState<Currency>('USD'); // Default to international USD

  useEffect(() => {
    // Load guest cart from localStorage
    const savedCart = localStorage.getItem('indithread_cart');
    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart));
      } catch (e) {
        console.error('Error loading cart', e);
      }
    }

    // Geolocation detection mock
    const detectCurrency = async () => {
      try {
        // In real app, call a geoip API. For now mock by locale or browser settings
        const userLocale = navigator.language;
        if (userLocale.includes('IN')) {
          setCurrencyState('INR');
        } else if (userLocale.includes('GB')) {
          setCurrencyState('GBP');
        } else if (userLocale.includes('AE')) {
          setCurrencyState('AED');
        } else if (userLocale.includes('AU')) {
          setCurrencyState('AUD');
        } else if (userLocale.includes('EU') || userLocale.includes('FR') || userLocale.includes('DE')) {
          setCurrencyState('EUR');
        } else {
          setCurrencyState('USD');
        }
      } catch {
        setCurrencyState('USD');
      }
    };
    detectCurrency();
  }, []);

  const saveCart = (newCart: CartItem[]) => {
    setCart(newCart);
    localStorage.setItem('indithread_cart', JSON.stringify(newCart));
  };

  const addToCart = (product: CartContextProduct, quantity = 1) => {
    const existing = cart.find((item) => item.id === product.id);
    if (existing) {
      const updated = cart.map((item) =>
        item.id === product.id ? { ...item, quantity: item.quantity + quantity } : item
      );
      saveCart(updated);
    } else {
      const newItem: CartItem = {
        id: product.id,
        sku: product.sku,
        name: product.name,
        price_inr: typeof product.price_inr === 'string' ? parseFloat(product.price_inr) : product.price_inr,
        images: product.images,
        quantity: quantity,
      };
      saveCart([...cart, newItem]);
    }
  };

  const removeFromCart = (productId: string) => {
    const updated = cart.filter((item) => item.id !== productId);
    saveCart(updated);
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    const updated = cart.map((item) =>
      item.id === productId ? { ...item, quantity } : item
    );
    saveCart(updated);
  };

  const clearCart = () => {
    saveCart([]);
  };

  const setCurrency = (curr: Currency) => {
    setCurrencyState(curr);
  };

  const formatPrice = (priceInr: number) => {
    const rate = FX_RATES[currency];
    const converted = priceInr * rate;
    const symbol = CURRENCY_SYMBOLS[currency];
    return `${symbol}${converted.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const getCartTotalInr = () => {
    return cart.reduce((acc, item) => acc + item.price_inr * item.quantity, 0);
  };

  const getCartTotalDisplay = () => {
    const rate = FX_RATES[currency];
    return getCartTotalInr() * rate;
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        currency,
        currencySymbol: CURRENCY_SYMBOLS[currency],
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        setCurrency,
        formatPrice,
        getCartTotalInr,
        getCartTotalDisplay,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
