// src/store/ordersSlice.js
import { supabase } from '../lib/supabaseClient';

export default function createOrdersSlice(set, get) {
  return {
    orders: [],

    fetchOrders: async () => {
      const userId = get().auth?.user?.id;
      if (!userId) return [];
      const { data, error } = await supabase
        .from('orders')
        .select('*, order_items(id, product_id, quantity, price_at_time)')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      if (error) {
        console.error('Failed to fetch orders', error);
        return [];
      }
      set({ orders: data });
      return data;
    },

    getOrderById: async (orderId) => {
      const { data, error } = await supabase
        .from('orders')
        .select('*, order_items(id, product_id, quantity, price_at_time)')
        .eq('id', orderId)
        .single();
      if (error) {
        console.error('Failed to get order', error);
        return null;
      }
      return data;
    },

    placeOrder: async (checkoutData) => {
      const { auth, items, clearCart } = get();
      const userId = auth?.user?.id;

      if (!userId || items.length === 0) {
        throw new Error('Cannot place order: Not logged in or cart is empty');
      }

      const subtotal = items.reduce((sum, i) => sum + i.quantity * (i.price ?? 0), 0);
      const shipping = subtotal >= 999 ? 0 : 99;
      const total = subtotal + shipping;

      // 1. Create Order
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: userId,
          shipping_address_id: checkoutData.shipping_address_id,
          subtotal,
          shipping_cost: shipping,
          total,
          status: checkoutData.payment_method === 'cod' ? 'confirmed' : 'pending',
          payment_method: checkoutData.payment_method,
          payment_status: checkoutData.payment_method === 'cod' ? 'pending' : 'pending',
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // 2. Create Order Items
      const orderItems = items.map(item => ({
        order_id: orderData.id,
        product_id: item.id,
        quantity: item.quantity,
        price_at_time: item.price,
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) throw itemsError;

      // 3. Clear Cart
      clearCart();

      // 4. Refresh orders list
      get().fetchOrders();

      // Return the order ID for payment flow
      return orderData.id;
    },

    updateOrderStatus: async (orderId, status) => {
      const { error } = await supabase
        .from('orders')
        .update({ status })
        .eq('id', orderId);
      if (error) throw error;
      // Refresh
      await get().fetchOrders();
    },
  };
}
