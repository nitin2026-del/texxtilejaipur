// ===========================
// HIYA WEAR — Type Definitions
// ===========================

export type UserRole = 'customer' | 'admin' | 'editor';

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  role: UserRole;
  avatar_url: string | null;
  phone: string | null;
  country: string | null;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
}

export interface Product {
  id: string;
  sku: string;
  name: string;
  slug: string;
  description: string | null;
  category_id: string | null;
  category?: Category;
  price_inr: number;
  price_usd: number | null;
  price_eur: number | null;
  price_gbp: number | null;
  price_aud: number | null;
  stock_quantity: number;
  is_active: boolean;
  is_featured: boolean;
  images: string[];
  details: {
    material?: string;
    origin?: string;
    care?: string;
    sizes?: string[];
    weight?: string;
  } | null;
  meta_title: string | null;
  meta_description: string | null;
  created_at: string;
  updated_at: string;
}

export interface CartItem {
  id: string;
  product_id: string;
  product: Pick<Product, 'id' | 'name' | 'sku' | 'images' | 'price_inr' | 'price_usd' | 'price_eur' | 'price_gbp' | 'price_aud' | 'stock_quantity'>;
  quantity: number;
  selected_size?: string;
}

export interface ShippingAddress {
  id: string;
  user_id: string;
  full_name: string;
  address_line1: string;
  address_line2: string | null;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  phone: string;
  is_default: boolean;
  created_at: string;
}

export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'refunded';

export interface Order {
  id: string;
  user_id: string;
  order_number: string;
  total_amount: number;
  currency: string;
  status: OrderStatus;
  payment_status: PaymentStatus;
  shipping_address_id: string;
  shipping_address?: ShippingAddress;
  shipping_cost: number;
  tracking_number: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  order_items?: OrderItem[];
  payments?: Payment[];
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  product_name: string;
  sku: string;
  quantity: number;
  price_at_time: number;
  currency: string;
  selected_size: string | null;
  product?: Pick<Product, 'images' | 'name'>;
}

export interface Payment {
  id: string;
  order_id: string;
  payment_method: string;
  transaction_id: string | null;
  amount: number;
  currency: string;
  status: PaymentStatus;
  created_at: string;
}

export interface WishlistItem {
  id: string;
  user_id: string;
  product_id: string;
  product?: Product;
  created_at: string;
}

export interface Review {
  id: string;
  product_id: string;
  user_id: string;
  rating: number;
  comment: string | null;
  is_approved: boolean;
  profile?: Pick<Profile, 'full_name' | 'avatar_url'>;
  created_at: string;
}

export interface Banner {
  id: string;
  title: string;
  subtitle: string | null;
  image_url: string;
  link_url: string | null;
  button_text: string | null;
  display_order: number;
  is_active: boolean;
}

export interface Inquiry {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  company: string | null;
  subject: string | null;
  message: string;
  type: 'general' | 'wholesale';
  is_read: boolean;
  created_at: string;
}

// Currency types
export type CurrencyCode = 'USD' | 'EUR' | 'GBP' | 'AUD' | 'INR' | 'CAD' | 'AED';

export interface CurrencyInfo {
  code: CurrencyCode;
  symbol: string;
  name: string;
  flag: string;
}

export const CURRENCIES: Record<CurrencyCode, CurrencyInfo> = {
  USD: { code: 'USD', symbol: '$', name: 'US Dollar', flag: '🇺🇸' },
  EUR: { code: 'EUR', symbol: '€', name: 'Euro', flag: '🇪🇺' },
  GBP: { code: 'GBP', symbol: '£', name: 'British Pound', flag: '🇬🇧' },
  AUD: { code: 'AUD', symbol: 'A$', name: 'Australian Dollar', flag: '🇦🇺' },
  INR: { code: 'INR', symbol: '₹', name: 'Indian Rupee', flag: '🇮🇳' },
  CAD: { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar', flag: '🇨🇦' },
  AED: { code: 'AED', symbol: 'AED', name: 'UAE Dirham', flag: '🇦🇪' },
};

// Approximate FX rates relative to INR (base)
// In production: fetch from Open Exchange Rates API
export const FX_RATES: Record<CurrencyCode, number> = {
  INR: 1,
  USD: 0.012,
  EUR: 0.011,
  GBP: 0.0095,
  AUD: 0.018,
  CAD: 0.016,
  AED: 0.044,
};
