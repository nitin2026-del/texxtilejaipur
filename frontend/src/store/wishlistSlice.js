// src/store/wishlistSlice.js
import { supabase } from '../lib/supabaseClient';

export default function createWishlistSlice(set, get) {
  return {
    wishlist: [],
    fetchWishlist: async () => {
      const userId = get().auth?.user?.id;
      if (!userId) return [];
      const { data, error } = await supabase
        .from('wishlist')
        .select('product_id')
        .eq('user_id', userId);
      if (error) {
        console.error('Failed to fetch wishlist', error);
        return [];
      }
      // Assume product details fetched elsewhere; store ids for now
      set({ wishlist: data.map((row) => row.product_id) });
      return data;
    },
    addToWishlist: async (productId) => {
      const userId = get().auth?.user?.id;
      if (!userId) return;
      const { error } = await supabase.from('wishlist').insert({ user_id: userId, product_id: productId });
      if (error) console.error('Add wishlist error', error);
      set((state) => ({ wishlist: [...state.wishlist, productId] }));
    },
    removeFromWishlist: async (productId) => {
      const userId = get().auth?.user?.id;
      if (!userId) return;
      const { error } = await supabase.from('wishlist').delete().eq('user_id', userId).eq('product_id', productId);
      if (error) console.error('Remove wishlist error', error);
      set((state) => ({ wishlist: state.wishlist.filter((id) => id !== productId) }));
    },
    toggleWishlist: (productId) => {
      const state = get();
      const current = state.wishlist || [];
      const isIn = current.includes(productId);
      if (isIn) {
        set({ wishlist: current.filter(id => id !== productId) });
        const userId = state.auth?.user?.id;
        if (userId) supabase.from('wishlist').delete().eq('user_id', userId).eq('product_id', productId);
      } else {
        set({ wishlist: [...current, productId] });
        const userId = state.auth?.user?.id;
        if (userId) supabase.from('wishlist').insert({ user_id: userId, product_id: productId });
      }
    },
  };
}
