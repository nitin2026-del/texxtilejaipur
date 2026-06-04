import { supabase } from '../lib/supabaseClient';

export default function createAdminSlice(set, get) {
  return {
    dashboardStats: null,
    fetchDashboardStats: async () => {
      try {
        const { count: ordersCount } = await supabase.from('orders').select('*', { count: 'exact', head: true });
        const { count: productsCount } = await supabase.from('products').select('*', { count: 'exact', head: true });
        const { count: customersCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'customer');
        const { data: orders } = await supabase.from('orders').select('total').eq('status', 'confirmed');
        
        const totalRevenue = orders?.reduce((sum, order) => sum + (order.total || 0), 0) || 0;

        const stats = {
          totalSales: totalRevenue,
          totalOrders: ordersCount || 0,
          activeProducts: productsCount || 0,
          totalCustomers: customersCount || 0,
        };
        set({ dashboardStats: stats });
        return stats;
      } catch (err) {
        console.error('Failed to fetch dashboard stats', err);
        return null;
      }
    },

    saveProduct: async (productData) => {
      // productData includes images as well, assuming it's structured properly
      const { id, images, ...rest } = productData;
      let productId = id;

      // 1. Upsert product
      if (id) {
        const { error } = await supabase.from('products').update(rest).eq('id', id);
        if (error) throw error;
      } else {
        const { data, error } = await supabase.from('products').insert(rest).select().single();
        if (error) throw error;
        productId = data.id;
      }

      // 2. Handle images
      if (images && images.length > 0) {
        // Simple approach: delete existing and insert new
        await supabase.from('product_images').delete().eq('product_id', productId);
        const imageRows = images.map((url, index) => ({
          product_id: productId,
          url,
          display_order: index,
          is_primary: index === 0
        }));
        const { error: imgError } = await supabase.from('product_images').insert(imageRows);
        if (imgError) throw imgError;
      }

      return productId;
    },

    saveBlog: async (blogData) => {
      const { id, ...rest } = blogData;
      if (id) {
        const { error } = await supabase.from('blogs').update(rest).eq('id', id);
        if (error) throw error;
        return id;
      } else {
        const { data, error } = await supabase.from('blogs').insert(rest).select().single();
        if (error) throw error;
        return data.id;
      }
    },

    saveCategory: async (categoryData) => {
      const { id, ...rest } = categoryData;
      if (id) {
        const { error } = await supabase.from('categories').update(rest).eq('id', id);
        if (error) throw error;
        return id;
      } else {
        const { data, error } = await supabase.from('categories').insert(rest).select().single();
        if (error) throw error;
        return data.id;
      }
    },

    saveSetting: async (key, value) => {
      const { error } = await supabase.from('site_settings').upsert({ key, value });
      if (error) throw error;
    },

    saveVerifiedChat: async (chatData) => {
      const { error } = await supabase.from('verified_chats').insert(chatData);
      if (error) throw error;
    },

    saveBehindTheScenes: async (videoData) => {
      const { error } = await supabase.from('behind_the_scenes').insert(videoData);
      if (error) throw error;
    },

    fetchBanners: async () => {
      const { data, error } = await supabase
        .from('banners')
        .select('*')
        .order('display_order', { ascending: true });
      if (error) {
        console.error('Failed to fetch banners', error);
        return [];
      }
      return data;
    },

    saveBanner: async (bannerData) => {
      const { id, ...rest } = bannerData;
      if (id) {
        const { error } = await supabase.from('banners').update(rest).eq('id', id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('banners').insert(rest);
        if (error) throw error;
      }
    },

    deleteBanner: async (id) => {
      const { error } = await supabase.from('banners').delete().eq('id', id);
      if (error) throw error;
    }
  };
}
