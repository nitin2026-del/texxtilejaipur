'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { trackMetaEvent } from '@/utils/metaTracking';
import { supabase } from '@/lib/supabase';

export interface CartItem {
  id: string;
  sku: string;
  name: string;
  price_inr: number;
  images: string[];
  quantity: number;
  category?: string;
  isFreeGift?: boolean;
}

export interface Coupon {
  id: string;
  code: string;
  type: 'percent' | 'fixed';
  value: number;
}

export interface CartContextProduct {
  id: string;
  sku: string;
  name: string;
  price_inr: number;
  images: string[];
  category?: string;
}

export type Currency = 'INR' | 'USD' | 'EUR' | 'GBP' | 'AED' | 'AUD' | 'NZD' | 'CAD';

export const FX_RATES: Record<Currency, number> = {
  INR: 1,
  USD: 0.010769, // Calibrated so 6500 INR = $70.00 USD
  EUR: 0.009870, // Scaled proportionally (was €73.65, now €64.15)
  GBP: 0.008340, // Scaled proportionally (£54.21)
  AED: 0.039480, // Scaled proportionally
  AUD: 0.016150, // Scaled proportionally
  NZD: 0.020000, // Scaled proportionally (~130 NZD)
  CAD: 0.016500,
};

const CURRENCY_SYMBOLS: Record<Currency, string> = {
  INR: '₹',
  USD: '$',
  EUR: '€',
  GBP: '£',
  AED: 'د.إ',
  AUD: 'A$',
  NZD: 'NZ$',
  CAD: 'C$',
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
  getCartSubtotalInr: () => number;
  getCartTotalInr: () => number;
  getCartTotalDisplay: () => number;
  appliedCoupon: Coupon | null;
  applyCoupon: (code: string) => Promise<{ success: boolean; message: string; shortfallInr?: number }>;
  removeCoupon: () => void;
  comboOffer: any;
  eligibleCountForFreeGift: number;
  isEligibleForFreeGift: boolean;
  hasClaimedFreeGift: boolean;
  addFreeGift: (product: CartContextProduct) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { tierDiscountPercentage } = useAuth();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [currency, setCurrencyState] = useState<Currency>('USD'); // Default to international USD
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [comboOffer, setComboOffer] = useState<any>(null);
  const [rewardProduct, setRewardProduct] = useState<CartContextProduct | null>(null);

  useEffect(() => {
    // Load combo offer
    supabase.from('site_settings').select('value').eq('key', 'SYS_COMBO_OFFER').maybeSingle().then(({ data }) => {
      if (data && data.value && data.value.is_active) {
        setComboOffer(data.value);
      }
    });

    // Load guest cart from localStorage
    const savedCart = localStorage.getItem('textilejaipur_cart');
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
        const userLocale = navigator.language;
        if (userLocale.includes('IN')) {
          setCurrencyState('INR');
        } else if (userLocale.includes('GB')) {
          setCurrencyState('GBP');
        } else if (userLocale.includes('AE')) {
          setCurrencyState('AED');
        } else if (userLocale.includes('AU')) {
          setCurrencyState('AUD');
        } else if (userLocale.includes('NZ')) {
          setCurrencyState('NZD');
        } else if (userLocale.includes('CA')) {
          setCurrencyState('CAD');
        } else if (userLocale.includes('EU') || userLocale.includes('FR') || userLocale.includes('DE')) {
          setCurrencyState('EUR');
        } else {
          setCurrencyState('USD');
        }
      } catch {
        setCurrencyState('USD');
      }
    };

    // Check if user has a saved preference first
    const savedCurrency = localStorage.getItem('textilejaipur_currency') as Currency;
    if (savedCurrency && FX_RATES[savedCurrency]) {
      setCurrencyState(savedCurrency);
    } else {
      detectCurrency();
    }
  }, []);

  const saveCart = (newCart: CartItem[]) => {
    setCart(newCart);
    localStorage.setItem('textilejaipur_cart', JSON.stringify(newCart));
    localStorage.setItem('textilejaipur_cart_updated_at', Date.now().toString());
  };

  const addToCart = (product: CartContextProduct, quantity = 1) => {
    const parsedPriceInr = typeof product.price_inr === 'string' ? parseFloat(product.price_inr) : product.price_inr;

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
        price_inr: parsedPriceInr,
        images: product.images,
        quantity: quantity,
        category: product.category,
      };
      saveCart([...cart, newItem]);
      
      const productPrice = Number((parsedPriceInr * FX_RATES['USD']).toFixed(2));
      trackMetaEvent('AddToCart', {
        content_ids: [product.id],
        content_type: 'product',
        value: productPrice,
        currency: 'USD'
      });
    }
  };

  const addFreeGift = (product: CartContextProduct) => {
    const newItem: CartItem = {
      id: product.id,
      sku: product.sku,
      name: product.name,
      price_inr: 0,
      images: product.images,
      quantity: 1,
      category: product.category,
      isFreeGift: true
    };
    // Remove any existing free gifts to enforce max 1 free gift per order
    const filteredCart = cart.filter(item => !item.isFreeGift);
    saveCart([...filteredCart, newItem]);
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
    localStorage.setItem('textilejaipur_currency', curr);
  };

  const formatPrice = (priceInr: number) => {
    const rate = FX_RATES[currency];
    const converted = priceInr * rate;
    const symbol = CURRENCY_SYMBOLS[currency];
    return `${symbol}${converted.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const computedCart = React.useMemo(() => {
    if (!comboOffer || !comboOffer.is_active) return cart;
    
    const eligibleCount = cart.reduce((sum, item) => {
      // Exclude free gifts from the count to prevent loops
      if (item.isFreeGift) return sum;
      
      const rewardCat = comboOffer.reward_category?.toLowerCase();
      if (rewardCat && item.category?.toLowerCase() === rewardCat) {
        return sum;
      }

      const reqCat = comboOffer.required_category?.toLowerCase();
      if (!reqCat || reqCat === '' || item.category?.toLowerCase() === reqCat) {
        return sum + item.quantity;
      }
      return sum;
    }, 0);

    const isEligible = eligibleCount >= (comboOffer.required_qty || 2);

    if (isEligible) {
      // If eligible, ensure any item marked as FreeGift is priced at 0.
      return cart.map(item => item.isFreeGift ? { ...item, price_inr: 0 } : item);
    } else {
      // If NOT eligible, completely remove any free gifts from the cart.
      return cart.filter(item => !item.isFreeGift);
    }
  }, [cart, comboOffer]);

  const eligibleCountForFreeGift = React.useMemo(() => {
    if (!comboOffer || !comboOffer.is_active) return 0;
    return cart.reduce((sum, item) => {
      if (item.isFreeGift) return sum;
      
      // Do not count items from the reward category towards the trigger requirement
      const rewardCat = comboOffer.reward_category?.toLowerCase();
      if (rewardCat && item.category?.toLowerCase() === rewardCat) {
        return sum;
      }

      const reqCat = comboOffer.required_category?.toLowerCase();
      if (!reqCat || reqCat === '' || item.category?.toLowerCase() === reqCat) {
        return sum + item.quantity;
      }
      return sum;
    }, 0);
  }, [cart, comboOffer]);

  const isEligibleForFreeGift = React.useMemo(() => {
    if (!comboOffer || !comboOffer.is_active) return false;
    return eligibleCountForFreeGift >= (comboOffer.required_qty || 2);
  }, [comboOffer, eligibleCountForFreeGift]);

  const hasClaimedFreeGift = cart.some(item => item.isFreeGift);

  const getCartSubtotalInr = () => {
    return computedCart.reduce((acc, item) => acc + item.price_inr * item.quantity, 0);
  };



  const getCartTotalInr = () => {
    let subtotal = getCartSubtotalInr();
    
    // 1. Apply Tier Discount first
    if (tierDiscountPercentage > 0) {
      subtotal = subtotal - (subtotal * (tierDiscountPercentage / 100));
    }

    if (!appliedCoupon) return Math.max(0, subtotal);
    
    // 2. Apply Promo Code Discount
    let total = subtotal;
    if (appliedCoupon.type === 'percent') {
      total = subtotal - (subtotal * (appliedCoupon.value / 100));
    } else {
      total = subtotal - appliedCoupon.value;
    }
    return Math.max(0, total);
  };

  const getCartTotalDisplay = () => {
    const rate = FX_RATES[currency];
    return getCartTotalInr() * rate;
  };

  const applyCoupon = async (code: string) => {
    const cleanCode = code.trim().toUpperCase();
    
    try {
      if (cleanCode.startsWith('SYS_')) {
        return { success: false, message: 'Invalid or expired promo code.' };
      }

      const { data: couponData, error } = await supabase
        .from('coupons')
        .select('*')
        .eq('code', cleanCode)
        .eq('is_active', true)
        .single();

      if (error || !couponData) {
        return { success: false, message: 'Invalid or expired promo code.' };
      }

      // Check minimum order value
      if (couponData.min_order_value && getCartSubtotalInr() < couponData.min_order_value) {
        const shortfall = couponData.min_order_value - getCartSubtotalInr();
        const formattedShortfall = formatPrice(shortfall);
        return { success: false, message: `Add ${formattedShortfall} more to use this coupon!`, shortfallInr: shortfall };
      }

      const coupon: Coupon = {
        id: couponData.id,
        code: couponData.code,
        type: couponData.discount_type === 'percentage' ? 'percent' : 'fixed',
        value: couponData.discount_value
      };

      setAppliedCoupon(coupon);
      return { success: true, message: 'Coupon applied successfully!' };
    } catch (e) {
      console.error('Error validating coupon:', e);
      return { success: false, message: 'Error applying coupon. Please try again.' };
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
  };

  return (
    <CartContext.Provider
      value={{
        cart: computedCart,
        currency,
        currencySymbol: CURRENCY_SYMBOLS[currency],
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        setCurrency,
        formatPrice,
        getCartSubtotalInr,
        getCartTotalInr,
        getCartTotalDisplay,
        appliedCoupon,
        applyCoupon,
        removeCoupon,
        comboOffer,
        eligibleCountForFreeGift,
        isEligibleForFreeGift,
        hasClaimedFreeGift,
        addFreeGift,
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
