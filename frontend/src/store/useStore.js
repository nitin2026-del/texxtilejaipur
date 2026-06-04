import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { supabase } from '../lib/supabaseClient';
import createWishlistSlice from './wishlistSlice';
import createProfileSlice from './profileSlice';
import createOrdersSlice from './ordersSlice';
import createAddressesSlice from './addressesSlice';
import createAdminSlice from './adminSlice';
import createReviewsSlice from './reviewsSlice';

// Auth slice – integrates Supabase auth
const createAuthSlice = (set, get) => ({
  auth: { user: null, session: null, profile: null },
  // Initialize auth state from Supabase session (called on app start)
  initAuth: async () => {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) console.error('Supabase session error', error);
    if (session) {
      const { data: profile } = await supabase.from('profiles').select('*').eq('id', session.user.id).single();
      set({ auth: { user: session.user, session, profile } });
    }
    
    // Listen for auth changes
    supabase.auth.onAuthStateChange(async (event, session) => {
      if (session) {
        const { data: profile } = await supabase.from('profiles').select('*').eq('id', session.user.id).single();
        set({ auth: { user: session.user, session, profile } });
      } else {
        set({ auth: { user: null, session: null, profile: null } });
      }
    });
  },
  // Sign-in with email/password
  signIn: async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
  },
  // Sign-up (email/password)
  signUp: async (email, password, firstName, lastName) => {
    const { data, error } = await supabase.auth.signUp({ 
      email, 
      password,
      options: {
        data: {
          first_name: firstName,
          last_name: lastName,
        }
      }
    });
    if (error) throw error;
    return data;
  },
  // Sign-in with Google
  signInWithGoogle: async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/` }
    });
    if (error) throw error;
    return data;
  },
  // Reset Password
  resetPassword: async (email) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/update-password`,
    });
    if (error) throw error;
  },
  // Update Password
  updatePassword: async (newPassword) => {
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) throw error;
  },
  // Logout
  signOut: async () => {
    const { error } = await supabase.auth.signOut();
    if (error) console.error('Sign out error', error);
    set({ auth: { user: null, session: null, profile: null } });
  },
});

// Cart slice – now includes realtime listener
const createCartSlice = (set, get) => ({
  items: [],
  addItem: (product) => {
    const existing = get().items.find((i) => i.id === product.id);
    if (existing) {
      set({
        items: get().items.map((i) =>
          i.id === product.id ? { ...i, quantity: i.quantity + 1 } : i
        ),
      });
    } else {
      set({ items: [...get().items, { ...product, quantity: 1 }] });
    }
    const userId = get().auth?.user?.id;
    if (userId) {
      supabase.from('carts').upsert({ user_id: userId, product_id: product.id, quantity: (existing?.quantity || 0) + 1 })
        .then(({ error }) => {
          if (error) console.error('Cart sync error:', error);
        });
    }
  },
  removeItem: (productId) => {
    set({ items: get().items.filter((i) => i.id !== productId) });
    supabase.from('carts').delete().eq('product_id', productId).eq('user_id', get().auth?.user?.id);
  },
  updateQuantity: (productId, delta) => {
    const existing = get().items.find((i) => i.id === productId);
    if (!existing) return;
    
    const newQuantity = existing.quantity + delta;
    if (newQuantity <= 0) {
      get().removeItem(productId);
    } else {
      set({
        items: get().items.map((i) =>
          i.id === productId ? { ...i, quantity: newQuantity } : i
        ),
      });
      const userId = get().auth?.user?.id;
      if (userId) {
        supabase.from('carts').update({ quantity: newQuantity }).eq('product_id', productId).eq('user_id', userId)
          .then(({ error }) => {
            if (error) console.error('Cart sync error:', error);
          });
      }
    }
  },
  clearCart: () => {
    set({ items: [] });
    const userId = get().auth?.user?.id;
    if (userId) {
      supabase.from('carts').delete().eq('user_id', userId);
    }
  },
  totalQuantity: () => get().items.reduce((sum, i) => sum + i.quantity, 0),
  totalPrice: () => get().items.reduce((sum, i) => sum + i.quantity * (i.price ?? 0), 0),
  _initRealtime: () => {
    const userId = get().auth?.user?.id;
    if (!userId) return;
    supabase
      .channel('public:carts')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'carts', filter: `user_id=eq.${userId}` }, (payload) => {
        const newItem = payload.new;
        const existing = get().items.find((i) => i.id === newItem.product_id);
        if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
          if (existing) {
            set({
              items: get().items.map((i) => (i.id === existing.id ? { ...i, quantity: newItem.quantity } : i)),
            });
          } else {
            supabase
              .from('products')
              .select('*')
              .eq('id', newItem.product_id)
              .single()
              .then(({ data }) => {
                if (data) set({ items: [...get().items, { ...data, quantity: newItem.quantity }] });
              });
          }
        } else if (payload.eventType === 'DELETE') {
          set({ items: get().items.filter((i) => i.id !== newItem.product_id) });
        }
      })
      .subscribe();
  },
});

// UI slice – theme toggle persisted to localStorage
const applyTheme = (theme) => {
  if (theme === 'dark') {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
  localStorage.setItem('theme', theme);
};

const createUiSlice = (set) => ({
  loading: false,
  setLoading: (val) => set({ loading: val }),
  theme: localStorage.getItem('theme') || 'light',
  toggleTheme: () =>
    set((state) => {
      const newTheme = state.theme === 'light' ? 'dark' : 'light';
      applyTheme(newTheme);
      return { theme: newTheme };
    }),
  modal: null,
  openModal: (component) => set({ modal: component }),
  closeModal: () => set({ modal: null }),
});

// Recently Viewed slice — persisted, max 10 items
const createRecentlyViewedSlice = (set, get) => ({
  recentlyViewed: [], // array of product IDs
  addRecentlyViewed: (productId) => {
    if (!productId) return;
    const current = get().recentlyViewed || [];
    // Remove duplicate, add to front, cap at 10
    const updated = [productId, ...current.filter(id => id !== productId)].slice(0, 10);
    set({ recentlyViewed: updated });
  },
  clearRecentlyViewed: () => set({ recentlyViewed: [] }),
});

// Products slice – loads product list from Supabase
const createProductsSlice = (set, get) => ({
  products: [],
  selectedProduct: null,
  fetchProducts: async (filters = {}) => {
    let query = supabase
      .from('products')
      .select(`
        id, name, slug, price, compare_at_price, description, stock_quantity, is_featured, status,
        categories(id, name, slug),
        product_images(url, is_primary, display_order)
      `)
      .eq('status', 'active')
      .order('created_at', { ascending: false });

    if (filters.category_id) query = query.eq('category_id', filters.category_id);
    if (filters.featured) query = query.eq('is_featured', true);
    if (filters.search) query = query.ilike('name', `%${filters.search}%`);
    if (filters.limit) query = query.limit(filters.limit);

    const { data, error } = await query;
    if (error) {
      console.error('Failed to fetch products', error);
      return [];
    }

    const normalized = (data || []).map(p => ({
      ...p,
      image_url: p.product_images?.find(i => i.is_primary)?.url ||
                 p.product_images?.sort((a, b) => a.display_order - b.display_order)[0]?.url ||
                 null,
      all_images: p.product_images?.sort((a, b) => a.display_order - b.display_order).map(i => i.url) || [],
    }));

    set({ products: normalized });
    return normalized;
  },
  loadProduct: async (id) => {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single();
    if (error) {
      console.error('Failed to load product', error);
      return;
    }
    set({ selectedProduct: data });
    return data;
  },
});

// Combine slices into a single store
export const useStore = create(
  devtools(
    persist(
      (set, get) => ({
        ...createAuthSlice(set, get),
        ...createCartSlice(set, get),
        ...createUiSlice(set, get),
        ...createProductsSlice(set, get),
        ...createWishlistSlice(set, get),
        ...createProfileSlice(set, get),
        ...createOrdersSlice(set, get),
        ...createAddressesSlice(set, get),
        ...createAdminSlice(set, get),
        ...createReviewsSlice(set, get),
        ...createRecentlyViewedSlice(set, get),
      }),
      { name: 'fashion-ecom-store' }
    )
  )
);

export default useStore;
