import { supabase } from '../lib/supabaseClient';

export default function createAddressesSlice(set, get) {
  return {
    addresses: [],
    fetchAddresses: async () => {
      const userId = get().auth?.user?.id;
      if (!userId) return [];
      const { data, error } = await supabase
        .from('shipping_addresses')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Failed to fetch addresses', error);
        return [];
      }
      set({ addresses: data });
      return data;
    },
    addAddress: async (addressData) => {
      const userId = get().auth?.user?.id;
      if (!userId) throw new Error('Not logged in');
      
      const { data, error } = await supabase
        .from('shipping_addresses')
        .insert({ ...addressData, user_id: userId })
        .select()
        .single();
        
      if (error) throw error;
      set(state => ({ addresses: [data, ...state.addresses] }));
      return data;
    },
    updateAddress: async (id, addressData) => {
      const { data, error } = await supabase
        .from('shipping_addresses')
        .update(addressData)
        .eq('id', id)
        .select()
        .single();
        
      if (error) throw error;
      set(state => ({
        addresses: state.addresses.map(a => a.id === id ? data : a)
      }));
      return data;
    },
    deleteAddress: async (id) => {
      const { error } = await supabase
        .from('shipping_addresses')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
      set(state => ({
        addresses: state.addresses.filter(a => a.id !== id)
      }));
    }
  };
}
