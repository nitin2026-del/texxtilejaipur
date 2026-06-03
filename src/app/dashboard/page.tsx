'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { Navbar } from '@/components/Navbar';
import { Package, MapPin, User, LogOut, ChevronRight, Truck, Edit2, Trash2 } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function Dashboard() {
  const { user, profile, loading: authLoading, signOut } = useAuth();
  const router = useRouter();
  
  const [orders, setOrders] = useState<any[]>([]);
  const [addresses, setAddresses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const searchParams = useSearchParams();

  // Tracking states
  const [trackingOrder, setTrackingOrder] = useState<any>(null);
  const [trackingDetails, setTrackingDetails] = useState<any>(null);
  const [trackingLoading, setTrackingLoading] = useState(false);
  const [trackingError, setTrackingError] = useState('');

  // Edit Profile States
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editFirstName, setEditFirstName] = useState('');
  const [editLastName, setEditLastName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [updateLoading, setUpdateLoading] = useState(false);

  useEffect(() => {
    // Check if PayPal just redirected back after successful payment
    if (searchParams.get('payment') === 'success') {
      setPaymentSuccess(true);
      // Remove the query params from URL without reloading
      window.history.replaceState({}, '', '/dashboard');
      // Auto-hide after 8 seconds
      setTimeout(() => setPaymentSuccess(false), 8000);
    }
  }, [searchParams]);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push('/');
      return;
    }

    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        // Fetch Orders
        const { data: ordersData } = await supabase
          .from('orders')
          .select(`
            *,
            order_items (
              *,
              products (
                name,
                images
              )
            )
          `)
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (ordersData) setOrders(ordersData);

        // Fetch Addresses
        const { data: addressData } = await supabase
          .from('shipping_addresses')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });
          
        if (addressData) setAddresses(addressData);

      } catch (err) {
        console.error('Error fetching dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user, authLoading, router]);

  const handleLogout = async () => {
    await signOut();
    router.push('/');
  };

  const handleTrackShipment = async (order: any) => {
    // Direct link to UPS Global tracking since no API key is available
    if (order.tracking_number) {
      window.open(`https://www.ups.com/global-en/home/tracking.html?tracking-id=${order.tracking_number}`, '_blank');
    }
  };

  const handleEditProfileClick = () => {
    setIsEditingProfile(true);
    // Profile full_name might be 'First Last', let's guess
    const parts = (profile?.full_name || '').split(' ');
    setEditFirstName(profile?.first_name || parts[0] || '');
    setEditLastName(profile?.last_name || parts.slice(1).join(' ') || '');
    setEditPhone(profile?.phone || '');
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setUpdateLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          first_name: editFirstName,
          last_name: editLastName,
          full_name: `${editFirstName} ${editLastName}`.trim(),
          phone: editPhone
        })
        .eq('id', user.id);
      
      if (error) throw error;
      
      // Reload page to get fresh profile data in AuthContext
      window.location.reload();
    } catch (err) {
      console.error('Failed to update profile:', err);
      alert('Failed to update profile.');
      setUpdateLoading(false);
    }
  };

  const handleDeleteAddress = async (id: string) => {
    if (!confirm('Are you sure you want to delete this address?')) return;
    try {
      const { error } = await supabase
        .from('shipping_addresses')
        .delete()
        .eq('id', id)
        .eq('user_id', user?.id ?? '');
      
      if (error) throw error;
      setAddresses(addresses.filter(a => a.id !== id));
    } catch (err) {
      console.error('Failed to delete address:', err);
      alert('Failed to delete address.');
    }
  };

  if (!user) return null;

  return (
    <main className="min-h-screen text-zinc-900 pb-16 bg-[#FDFBF7]">
      <Navbar onCartOpen={() => {}} />

      <div className="pt-32 px-6 max-w-7xl mx-auto">
        {/* PayPal Payment Success Banner */}
        {paymentSuccess && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-3 animate-pulse">
            <span className="text-2xl">🎉</span>
            <div>
              <p className="font-bold text-green-800">Payment Successful!</p>
              <p className="text-sm text-green-600">Thank you for your order. Your order is now being processed and you will receive a confirmation email shortly.</p>
            </div>
          </div>
        )}
        <div className="mb-12 border-b border-zinc-200 pb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-serif font-medium text-zinc-900">My Account</h1>
            <p className="text-zinc-500 mt-1 tracking-wide font-light">Welcome back, {profile?.full_name || user.email}</p>
          </div>
          <button 
            onClick={handleLogout}
            className="flex items-center gap-2 text-xs font-semibold text-zinc-600 hover:text-zinc-900 transition-colors px-4 py-2 rounded border border-zinc-300 hover:border-zinc-500 bg-white shadow-sm w-fit"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Left Column: Quick Info */}
          <div className="space-y-6">
            <div className="p-6 rounded bg-white border border-zinc-200 shadow-sm flex items-start gap-4">
              <div className="p-3 bg-zinc-100 rounded-full shrink-0">
                <User className="h-6 w-6 text-brand-700" />
              </div>
              <div className="flex-1">
                <div className="flex items-start justify-between">
                  <h3 className="font-serif font-medium text-lg text-zinc-900">Profile Details</h3>
                  {!isEditingProfile && (
                    <button onClick={handleEditProfileClick} className="text-zinc-400 hover:text-brand-700 transition-colors p-1">
                      <Edit2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
                
                {isEditingProfile ? (
                  <form onSubmit={handleUpdateProfile} className="mt-4 space-y-3">
                    <input
                      type="text"
                      placeholder="First Name"
                      required
                      value={editFirstName}
                      onChange={(e) => setEditFirstName(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded p-2 text-xs text-white"
                    />
                    <input
                      type="text"
                      placeholder="Last Name"
                      value={editLastName}
                      onChange={(e) => setEditLastName(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded p-2 text-xs text-white"
                    />
                    <input
                      type="tel"
                      placeholder="Phone Number"
                      value={editPhone}
                      onChange={(e) => setEditPhone(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded p-2 text-xs text-white"
                    />
                    <div className="flex gap-2 pt-2">
                      <button type="button" onClick={() => setIsEditingProfile(false)} className="flex-1 border border-zinc-800 bg-zinc-950 text-xs py-1.5 rounded text-zinc-400 hover:text-white">Cancel</button>
                      <button type="submit" disabled={updateLoading} className="flex-1 bg-gold text-zinc-950 font-bold text-xs py-1.5 rounded">{updateLoading ? 'Saving...' : 'Save'}</button>
                    </div>
                  </form>
                ) : (
                  <div className="mt-2 space-y-1 text-sm text-zinc-400 font-light">
                    <p>{profile?.full_name || 'No Name Provided'}</p>
                    <p>{user.email}</p>
                    {profile?.phone && <p>{profile.phone}</p>}
                  </div>
                )}
              </div>
            </div>

            <div className="p-6 rounded bg-[#FDFBF7] border border-zinc-200 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-serif font-medium text-lg text-zinc-900 flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-brand-700" /> Saved Addresses
                </h3>
              </div>
              
              <div className="space-y-4">
                {addresses.length === 0 ? (
                  <p className="text-sm text-zinc-500">No saved addresses.</p>
                ) : (
                  addresses.map((addr) => (
                    <div key={addr.id} className="p-4 rounded border border-zinc-200 bg-white relative group">
                      <button
                        onClick={() => handleDeleteAddress(addr.id)}
                        className="absolute top-3 right-3 text-zinc-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Delete Address"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                      <p className="font-semibold text-zinc-900 text-sm mb-1">{addr.full_name}</p>
                      <p className="text-xs text-zinc-600 font-light">{addr.address_line1}</p>
                      {addr.address_line2 && <p className="text-xs text-zinc-600 font-light">{addr.address_line2}</p>}
                      <p className="text-xs text-zinc-600 font-light">{addr.city}, {addr.state} {addr.postal_code}</p>
                      <p className="text-xs text-zinc-600 font-light">{addr.country}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Order History */}
          <div className="lg:col-span-2 space-y-6">
            <h2 className="text-xl font-serif font-medium text-zinc-900 flex items-center gap-2 mb-6">
              <Package className="h-5 w-5 text-brand-700" /> Order History
            </h2>

            {loading ? (
              <div className="space-y-4">
                {[1, 2].map((i) => (
                  <div key={i} className="h-32 bg-zinc-100 border border-zinc-200 rounded animate-pulse" />
                ))}
              </div>
            ) : orders.length === 0 ? (
              <div className="text-center py-16 px-6 border border-zinc-200 rounded bg-[#FDFBF7]">
                <Package className="h-12 w-12 text-zinc-300 mx-auto mb-4 stroke-[1.5]" />
                <h3 className="text-zinc-900 font-medium mb-1">No orders yet</h3>
                <p className="text-sm text-zinc-500 mb-6">When you place an export order, it will appear here.</p>
                <button onClick={() => router.push('/')} className="px-6 py-2 rounded text-xs font-semibold bg-zinc-900 hover:bg-zinc-800 text-white shadow-sm transition-colors">
                  Start Exploring
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => (
                  <div key={order.id} className="border border-zinc-200 rounded bg-white overflow-hidden shadow-sm hover:border-zinc-300 transition-colors">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-zinc-50 border-b border-zinc-200 gap-4">
                      <div className="flex flex-wrap gap-x-8 gap-y-2 text-xs">
                        <div>
                          <p className="text-zinc-500 uppercase tracking-wider mb-0.5 text-[10px]">Order Date</p>
                          <p className="text-zinc-900">{new Date(order.created_at).toLocaleDateString()}</p>
                        </div>
                        <div>
                          <p className="text-zinc-500 uppercase tracking-wider mb-0.5 text-[10px]">Total Amount</p>
                          <p className="text-zinc-900 font-semibold">₹{order.total?.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-zinc-500 uppercase tracking-wider mb-0.5 text-[10px]">Order #</p>
                          <p className="text-zinc-900 font-mono">{order.order_number}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <span className={`px-2.5 py-1 rounded text-[10px] font-semibold uppercase tracking-wider ${
                          order.status === 'delivered' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' :
                          order.status === 'shipped' ? 'bg-blue-500/10 text-blue-500 border border-blue-500/20' :
                          'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                        }`}>
                          {order.status}
                        </span>
                      </div>
                    </div>
                    
                    <div className="p-4 space-y-4">
                      {order.order_items?.map((item: any) => (
                        <div key={item.id} className="flex items-center gap-4">
                          <div className="h-16 w-16 bg-zinc-100 rounded overflow-hidden shrink-0 border border-zinc-200">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img 
                              src={item.products?.images?.[0] || 'https://via.placeholder.com/64'} 
                              alt={item.product_name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-medium text-zinc-900 truncate">{item.products?.name}</h4>
                            <p className="text-xs text-zinc-500 font-mono mt-0.5">SKU: {item.products?.slug}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-zinc-900">₹{item.price_at_time?.toLocaleString()}</p>
                            <p className="text-xs text-zinc-500">Qty: {item.quantity}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    {order.tracking_number && (
                      <div className="p-3 bg-[#FDFBF7] border-t border-zinc-200 flex items-center justify-between">
                        <div className="flex items-center gap-2 text-xs">
                          <Truck className="h-4 w-4 text-brand-700" />
                          <span className="text-zinc-500">{order.shipping_provider?.toUpperCase() || 'Courier'} Tracking:</span>
                          <span className="text-zinc-900 font-mono">{order.tracking_number}</span>
                        </div>
                        <button 
                          onClick={() => handleTrackShipment(order)}
                          className="text-[10px] text-gold hover:text-white transition-colors uppercase tracking-wider font-semibold flex items-center gap-1"
                        >
                          Track Shipment <ChevronRight className="h-3 w-3" />
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Live Tracking Modal */}
      {trackingOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="bg-zinc-950 border border-zinc-800 rounded-xl max-w-lg w-full max-h-[85vh] flex flex-col">
            <div className="p-4 border-b border-zinc-800 flex justify-between items-center">
              <div>
                <h3 className="font-semibold text-white">Live Tracking</h3>
                <p className="text-[10px] text-zinc-500 font-mono mt-0.5">{trackingOrder.tracking_number} ({trackingOrder.shipping_provider?.toUpperCase()})</p>
              </div>
              <button onClick={() => { setTrackingOrder(null); setTrackingDetails(null); }} className="p-2 text-zinc-500 hover:text-white">
                ✕
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1">
              {trackingLoading ? (
                <div className="flex flex-col items-center justify-center py-10">
                  <div className="animate-spin h-6 w-6 border-2 border-gold border-t-transparent rounded-full mb-3" />
                  <p className="text-xs text-zinc-400">Fetching live updates from {trackingOrder.shipping_provider?.toUpperCase()}...</p>
                </div>
              ) : trackingError ? (
                <div className="bg-red-950/30 border border-red-900/50 p-4 rounded text-xs text-red-400">
                  {trackingError}
                </div>
              ) : trackingDetails ? (
                <div className="space-y-6">
                  <div className="flex justify-between items-center mb-6 border-b border-zinc-800 pb-4">
                    <span className="text-xs text-zinc-400 uppercase tracking-wider font-semibold">Current Status</span>
                    <span className="text-gold font-bold text-sm tracking-wide">{trackingDetails.status}</span>
                  </div>
                  
                  <div className="relative space-y-4 before:absolute before:inset-0 before:ml-2.5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-zinc-800 before:to-transparent">
                    {trackingDetails.tracking_details?.slice().reverse().map((detail: any, idx: number) => (
                      <div key={idx} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                        <div className="flex items-center justify-center w-5 h-5 rounded-full border border-zinc-800 bg-zinc-950 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2">
                           <div className="h-1.5 w-1.5 bg-gold rounded-full" />
                        </div>
                        <div className="w-[calc(100%-3rem)] md:w-[calc(50%-2.5rem)] bg-zinc-900/50 p-3 rounded border border-zinc-800">
                          <p className="font-semibold text-white text-xs">{detail.message}</p>
                          <p className="text-[10px] text-zinc-500 mt-1">
                            {new Date(detail.datetime).toLocaleString()} 
                            {detail.tracking_location?.city ? ` • ${detail.tracking_location.city}` : ''}
                          </p>
                        </div>
                      </div>
                    ))}
                    {(!trackingDetails.tracking_details || trackingDetails.tracking_details.length === 0) && (
                      <p className="text-xs text-zinc-500 text-center py-4">No tracking events recorded yet. Check back soon.</p>
                    )}
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
