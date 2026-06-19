'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { User } from '@supabase/supabase-js';

interface Profile {
  id: string;
  email: string;
  name: string;
  full_name?: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  role: 'buyer' | 'admin';
  created_at: string;
}

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  signOut: () => Promise<void>;
  refreshSession: () => Promise<void>;
  jaiCoins: number;
  setJaiCoins: (coins: number) => void;
  userTier: 'Silver' | 'Gold' | 'Platinum';
  orderCount: number;
  setOrderCount: (count: number) => void;
  tierDiscountPercentage: number;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Request timeout wrapper to prevent auth hanging
const withTimeout = <T,>(promise: Promise<T>, ms = 3000): Promise<T> => {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => setTimeout(() => reject(new Error('Auth request timed out')), ms))
  ]);
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [jaiCoins, setJaiCoinsState] = useState<number>(500);
  const [orderCount, setOrderCountState] = useState<number>(0);

  useEffect(() => {
    // Only load/init JaiCoins from localStorage — guests start at 0
    const savedCoins = localStorage.getItem('textilejaipur_jaicoins');
    if (savedCoins !== null) {
      setJaiCoinsState(parseInt(savedCoins, 10));
    }
    // Note: 500 welcome bonus is only given on first real login (handled in onAuthStateChange)

    const savedOrders = localStorage.getItem('textilejaipur_order_count');
    if (savedOrders) {
      setOrderCountState(parseInt(savedOrders, 10));
    } else {
      localStorage.setItem('textilejaipur_order_count', '0');
    }
  }, []);

  const setJaiCoins = (coins: number) => {
    setJaiCoinsState(coins);
    localStorage.setItem('textilejaipur_jaicoins', coins.toString());
  };

  const setOrderCount = (count: number) => {
    setOrderCountState(count);
    localStorage.setItem('textilejaipur_order_count', count.toString());
  };

  const userTier = orderCount >= 2 ? 'Platinum' : orderCount === 1 ? 'Gold' : 'Silver';
  const tierDiscountPercentage = userTier === 'Platinum' ? 15 : userTier === 'Gold' ? 10 : 0;

  const fetchProfile = async (userId: string, email?: string) => {
    try {
      const { data, error } = await withTimeout<any>(
        supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single() as any,
        10000
      );

      if (!error && data) {
        const name = [data.first_name, data.last_name].filter(Boolean).join(' ').trim() || email?.split('@')[0] || 'User';
        const mappedProfile: Profile = {
          id: data.id,
          email: email || '',
          name: name,
          full_name: name,
          first_name: data.first_name || '',
          last_name: data.last_name || '',
          phone: data.phone || '',
          role: data.role === 'admin' ? 'admin' : 'buyer',
          created_at: data.created_at,
        };
        setProfile(mappedProfile);
      } else {
        console.warn('Profile fetch error:', error);
        setProfile(null);
      }
    } catch (e) {
      console.error('fetchProfile exception:', e);
      setProfile(null);
    }
  };

  const refreshSession = async () => {
    setLoading(true);
    try {
      const res = await withTimeout(supabase.auth.getSession(), 10000);
      const session = res?.data?.session;
      if (session) {
        setUser(session.user);
        // Non-blocking initialization of profile
        fetch('/api/auth/init-profile', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${session.access_token}` }
        }).then(() => {
          // Fetch profile after initialization
          fetchProfile(session.user.id, session.user.email);
        }).catch(console.error);
      } else {
        setUser(null);
        setProfile(null);
      }
    } catch (err) {
      console.error('Error refreshing session:', err);
      setUser(null);
      setProfile(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let subscription: any = null;

    try {
      // Check active sessions
      refreshSession();

      // Listen for auth changes
      const res = supabase.auth.onAuthStateChange(async (event, session) => {
        try {
          if (session) {
            setUser(session.user);
            // Non-blocking initialization
            fetch('/api/auth/init-profile', {
              method: 'POST',
              headers: { 'Authorization': `Bearer ${session.access_token}` }
            }).then(() => {
              fetchProfile(session.user.id, session.user.email);
            }).catch(console.error);
          } else {
            setUser(null);
            setProfile(null);
          }
        } catch (err) {
          console.error('Error in onAuthStateChange callback:', err);
          setUser(null);
          setProfile(null);
        } finally {
          setLoading(false);
        }
      });

      subscription = res?.data?.subscription;
    } catch (err) {
      console.error('Error initializing auth listener:', err);
      setLoading(false);
    }

    return () => {
      if (subscription) {
        subscription.unsubscribe();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const signOut = async () => {
    setLoading(true);
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.error('Error during signOut:', err);
    } finally {
      setUser(null);
      setProfile(null);
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, signOut, refreshSession, jaiCoins, setJaiCoins, userTier, orderCount, setOrderCount, tierDiscountPercentage }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
