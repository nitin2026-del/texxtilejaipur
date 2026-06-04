// src/store/profileSlice.js
import { supabase } from '../lib/supabaseClient';

export default function createProfileSlice(set, get) {
  return {
    profile: null,
    fetchProfile: async () => {
      const userId = get().auth?.user?.id;
      if (!userId) return null;
      const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).single();
      if (error) {
        console.error('Failed to fetch profile', error);
        return null;
      }
      set({ profile: data });
      return data;
    },
    updateProfile: async (updates) => {
      console.log('profileSlice: updateProfile called with updates:', updates);
      const userId = get().auth?.user?.id;
      console.log('profileSlice: userId is:', userId);
      if (!userId) {
        console.error('profileSlice: No user ID found in store auth!');
        return null;
      }
      try {
        console.log('profileSlice: Sending update request to Supabase...');
        const { data, error } = await supabase.from('profiles').update(updates).eq('id', userId).select().single();
        if (error) {
          console.error('profileSlice: Failed to update profile from Supabase:', error);
          return null;
        }
        console.log('profileSlice: Profile updated successfully. Data:', data);
        set({ profile: data });
        return data;
      } catch (err) {
        console.error('profileSlice: Exception caught during updateProfile:', err);
        throw err;
      }
    },
  };
}

