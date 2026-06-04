import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useStore } from '../store/useStore';
import {
  UserCircleIcon,
  ShoppingBagIcon,
  MapPinIcon,
  HeartIcon,
  ArrowRightOnRectangleIcon,
  CheckCircleIcon,
  ClockIcon,
  EyeIcon,
  StarIcon,
  TrashIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { StarIcon as StarSolid, HeartIcon as HeartSolid } from '@heroicons/react/24/solid';
import MainLayout from '../layouts/MainLayout';

const TABS = [
  { id: 'profile', label: 'My Profile', icon: UserCircleIcon },
  { id: 'orders', label: 'Order History', icon: ShoppingBagIcon },
  { id: 'addresses', label: 'Address Book', icon: MapPinIcon },
  { id: 'wishlist', label: 'Wishlist', icon: HeartIcon },
  { id: 'recently_viewed', label: 'Recently Viewed', icon: EyeIcon },
  { id: 'reviews', label: 'My Reviews', icon: StarIcon },
];

export default function UserDashboard() {
  const { auth, profile, fetchProfile, orders, fetchOrders, addresses, fetchAddresses, signOut } = useStore();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('profile');

  useEffect(() => {
    if (!auth?.user) { navigate('/login'); return; }
    fetchProfile();
    fetchOrders();
    fetchAddresses();
  }, [auth, navigate]);

  if (!auth?.user) return null;

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <MainLayout title="My Account — Gupta International" description="Manage your Gupta International profile, orders, and wishlist.">
      <div className="min-h-screen pt-6 pb-12 px-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-8">My Account</h1>

          <div className="flex flex-col lg:flex-row gap-8">
            {/* Sidebar */}
            <div className="lg:w-64 shrink-0">
              <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 p-4 space-y-1 sticky top-24">
                <div className="flex items-center gap-3 p-4 mb-4 border-b border-gray-100 dark:border-gray-800">
                  <div className="w-12 h-12 rounded-full bg-indigo-100 dark:bg-indigo-500/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold text-lg">
                    {profile?.first_name?.[0] || auth.user.email?.[0].toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-semibold text-gray-900 dark:text-white truncate text-sm">
                      {profile?.first_name ? `${profile.first_name} ${profile.last_name || ''}` : 'Welcome'}
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{auth.user.email}</p>
                  </div>
                </div>

                {TABS.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                      activeTab === tab.id
                        ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-400'
                        : 'text-gray-600 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-800/50'
                    }`}
                  >
                    <tab.icon className={`w-4 h-4 ${activeTab === tab.id ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-400'}`} />
                    {tab.label}
                  </button>
                ))}

                <button
                  onClick={handleSignOut}
                  className="w-full flex items-center gap-3 px-4 py-2.5 mt-4 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                >
                  <ArrowRightOnRectangleIcon className="w-4 h-4" />
                  Sign Out
                </button>
              </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 min-w-0">
              {activeTab === 'profile' && <ProfileTab key={profile?.id || 'loading'} auth={auth} profile={profile} />}
              {activeTab === 'orders' && <OrdersTab orders={orders} />}
              {activeTab === 'addresses' && <AddressesTab addresses={addresses} />}
              {activeTab === 'wishlist' && <WishlistTab />}
              {activeTab === 'recently_viewed' && <RecentlyViewedTab />}
              {activeTab === 'reviews' && <ReviewsTab />}
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}

// ── Profile Tab ──────────────────────────────────────────────
function ProfileTab({ auth, profile }) {
  const { updateProfile, fetchProfile } = useStore();
  const [formData, setFormData] = useState({
    first_name: profile?.first_name || '',
    last_name: profile?.last_name || '',
    phone: profile?.phone || '',
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (profile) {
      setFormData({ first_name: profile.first_name || '', last_name: profile.last_name || '', phone: profile.phone || '' });
    }
  }, [profile]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    try {
      await updateProfile(formData);
      await fetchProfile();
      setMessage('Profile updated successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setMessage('Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 p-6 sm:p-8">
      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Profile Details</h2>
      <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">First Name</label>
            <input type="text" value={formData.first_name} onChange={e => setFormData({...formData, first_name: e.target.value})}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:ring-2 focus:ring-indigo-600 outline-none dark:text-white" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Last Name</label>
            <input type="text" value={formData.last_name} onChange={e => setFormData({...formData, last_name: e.target.value})}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:ring-2 focus:ring-indigo-600 outline-none dark:text-white" />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Email Address</label>
          <input type="email" disabled value={auth.user.email}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800/50 text-gray-500 cursor-not-allowed outline-none" />
          <p className="text-xs text-gray-500 mt-1">Email address cannot be changed.</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Phone Number</label>
          <input type="tel" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:ring-2 focus:ring-indigo-600 outline-none dark:text-white" />
        </div>
        <div className="pt-4 flex items-center justify-between">
          <p className={`text-sm font-medium ${message.includes('success') ? 'text-green-600' : 'text-red-600'}`}>{message}</p>
          <button type="submit" disabled={saving}
            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-medium rounded-xl transition-colors shadow-sm shadow-indigo-200 dark:shadow-none">
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
}

// ── Orders Tab ───────────────────────────────────────────────
function OrdersTab({ orders }) {
  if (!orders || orders.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 p-12 text-center">
        <ShoppingBagIcon className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">No orders yet</h3>
        <p className="text-gray-500 dark:text-gray-400 mb-6">Looks like you haven't made your first purchase yet.</p>
        <Link to="/shop" className="inline-flex px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl transition-colors">
          Start Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {orders.map((order) => (
        <div key={order.id} className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden">
          <div className="p-5 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/20 flex flex-wrap gap-4 items-center justify-between">
            <div className="flex flex-wrap gap-6">
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">Order</p>
                <p className="font-bold text-gray-900 dark:text-white text-sm">#{order.order_number || order.id.substring(0, 8).toUpperCase()}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">Date</p>
                <p className="font-medium text-gray-900 dark:text-white text-sm">{new Date(order.created_at).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">Total</p>
                <p className="font-bold text-indigo-600 dark:text-indigo-400 text-sm">₹{((order.total || 0) * 83).toFixed(0)}</p>
              </div>
            </div>
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold capitalize ${
              order.status === 'delivered' ? 'bg-green-100 text-green-800 dark:bg-green-500/10 dark:text-green-400' :
              order.status === 'shipped' ? 'bg-blue-100 text-blue-800 dark:bg-blue-500/10 dark:text-blue-400' :
              order.status === 'cancelled' ? 'bg-red-100 text-red-800 dark:bg-red-500/10 dark:text-red-400' :
              'bg-amber-100 text-amber-800 dark:bg-amber-500/10 dark:text-amber-400'
            }`}>
              <CheckCircleIcon className="w-3.5 h-3.5" />
              {order.status || 'Processing'}
            </span>
          </div>
          {order.items && order.items.length > 0 && (
            <div className="p-5 flex gap-3 overflow-x-auto">
              {order.items.slice(0, 4).map((item, i) => (
                <div key={i} className="flex-shrink-0 w-14 h-14 rounded-xl overflow-hidden bg-gray-100">
                  {item.image_url && <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" loading="lazy" />}
                </div>
              ))}
              {order.items.length > 4 && (
                <div className="flex-shrink-0 w-14 h-14 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-xs font-bold text-gray-600">
                  +{order.items.length - 4}
                </div>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// ── Addresses Tab ────────────────────────────────────────────
function AddressesTab({ addresses }) {
  const { addAddress, updateAddress, deleteAddress } = useStore();
  const [isEditing, setIsEditing] = useState(false);
  const [currentAddress, setCurrentAddress] = useState(null);
  const defaultForm = { full_name: '', address_line1: '', address_line2: '', city: '', state: '', postal_code: '', country: '', phone: '', is_default: false };
  const [formData, setFormData] = useState(defaultForm);

  const handleEdit = (addr) => { setCurrentAddress(addr); setFormData({ ...addr }); setIsEditing(true); };
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (currentAddress) { await updateAddress(currentAddress.id, formData); } else { await addAddress(formData); }
      setIsEditing(false);
    } catch (err) { console.error(err); }
  };

  if (isEditing) return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 p-6 sm:p-8">
      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">{currentAddress ? 'Edit Address' : 'Add New Address'}</h2>
      <form onSubmit={handleSubmit} className="space-y-4 max-w-lg">
        {[['Full Name', 'full_name', 'text', true], ['Address Line 1', 'address_line1', 'text', true], ['Address Line 2 (Optional)', 'address_line2', 'text', false]].map(([label, field, type, req]) => (
          <div key={field}>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{label}</label>
            <input required={req} type={type} value={formData[field] || ''} onChange={e => setFormData({...formData, [field]: e.target.value})}
              className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-xl dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-indigo-600 outline-none" />
          </div>
        ))}
        <div className="grid grid-cols-2 gap-4">
          {[['City', 'city'], ['State', 'state']].map(([label, field]) => (
            <div key={field}>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{label}</label>
              <input required type="text" value={formData[field] || ''} onChange={e => setFormData({...formData, [field]: e.target.value})}
                className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-xl dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-indigo-600 outline-none" />
            </div>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-4">
          {[['Postal Code', 'postal_code'], ['Country', 'country']].map(([label, field]) => (
            <div key={field}>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{label}</label>
              <input required type="text" value={formData[field] || ''} onChange={e => setFormData({...formData, [field]: e.target.value})}
                className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-xl dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-indigo-600 outline-none" />
            </div>
          ))}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Phone</label>
          <input required type="tel" value={formData.phone || ''} onChange={e => setFormData({...formData, phone: e.target.value})}
            className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-xl dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-indigo-600 outline-none" />
        </div>
        <div className="flex items-center gap-2">
          <input type="checkbox" id="is_default" checked={formData.is_default || false} onChange={e => setFormData({...formData, is_default: e.target.checked})
          } className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-600" />
          <label htmlFor="is_default" className="text-sm font-medium text-gray-700 dark:text-gray-300">Set as default address</label>
        </div>
        <div className="flex justify-end gap-3 pt-4">
          <button type="button" onClick={() => setIsEditing(false)} className="px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 text-sm">Cancel</button>
          <button type="submit" className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-medium">Save Address</button>
        </div>
      </form>
    </div>
  );

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 p-6 sm:p-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Address Book</h2>
        <button onClick={() => { setCurrentAddress(null); setFormData(defaultForm); setIsEditing(true); }}
          className="text-indigo-600 dark:text-indigo-400 font-medium text-sm hover:text-indigo-700">+ Add New</button>
      </div>
      {addresses && addresses.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {addresses.map(addr => (
            <div key={addr.id} className={`border rounded-xl p-5 relative ${addr.is_default ? 'border-indigo-200 dark:border-indigo-500/30 bg-indigo-50/50 dark:bg-indigo-500/5' : 'border-gray-200 dark:border-gray-800'}`}>
              {addr.is_default && <span className="absolute top-3 right-3 bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300 text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">Default</span>}
              <h3 className="font-bold text-gray-900 dark:text-white mb-2 text-sm">{addr.full_name}</h3>
              <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                {addr.address_line1}<br />
                {addr.address_line2 && <>{addr.address_line2}<br /></>}
                {addr.city}, {addr.state} {addr.postal_code}<br />
                {addr.country} — {addr.phone}
              </p>
              <div className="mt-3 flex gap-4 text-xs font-medium">
                <button onClick={() => handleEdit(addr)} className="text-indigo-600 dark:text-indigo-400 hover:underline">Edit</button>
                <button onClick={() => deleteAddress(addr.id)} className="text-red-600 hover:underline">Delete</button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <MapPinIcon className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
          <p className="text-gray-500 dark:text-gray-400">No addresses saved yet.</p>
        </div>
      )}
    </div>
  );
}

// ── Wishlist Tab ─────────────────────────────────────────────
function WishlistTab() {
  const { wishlist, products, fetchProducts, toggleWishlist, addItem } = useStore();
  const [added, setAdded] = useState({});

  useEffect(() => { if (products.length === 0) fetchProducts(); }, []);

  const wishlistProducts = products.filter(p => (wishlist || []).includes(p.id));

  const handleAdd = (product) => {
    addItem(product);
    setAdded(prev => ({ ...prev, [product.id]: true }));
    setTimeout(() => setAdded(prev => ({ ...prev, [product.id]: false })), 2000);
  };

  if (wishlistProducts.length === 0) return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 p-12 text-center">
      <HeartIcon className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Wishlist is empty</h3>
      <p className="text-gray-500 dark:text-gray-400 mb-6">Save items you love to find them later.</p>
      <Link to="/shop" className="inline-flex px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl transition-colors">
        Discover Products
      </Link>
    </div>
  );

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 p-6">
      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">My Wishlist ({wishlistProducts.length} items)</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {wishlistProducts.map(product => (
          <div key={product.id} className="flex gap-4 border border-gray-100 dark:border-gray-800 rounded-2xl p-4 hover:shadow-md transition-shadow">
            <Link to={`/product/${product.id}`} className="flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden bg-gray-100">
              {product.image_url && <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" loading="lazy" />}
            </Link>
            <div className="flex-1 min-w-0 flex flex-col justify-between">
              <div>
                <Link to={`/product/${product.id}`}>
                  <h3 className="font-semibold text-gray-900 dark:text-white text-sm hover:text-indigo-600 transition-colors truncate">{product.name}</h3>
                </Link>
                <p className="text-indigo-600 font-bold text-sm mt-0.5">₹{(product.price * 83).toFixed(0)}</p>
              </div>
              <div className="flex items-center gap-2 mt-2">
                <button
                  onClick={() => handleAdd(product)}
                  className={`flex-1 text-xs font-semibold py-1.5 px-3 rounded-lg transition-colors ${added[product.id] ? 'bg-green-500 text-white' : 'bg-indigo-600 hover:bg-indigo-700 text-white'}`}
                >
                  {added[product.id] ? '✓ Added' : 'Add to Cart'}
                </button>
                <button
                  onClick={() => toggleWishlist(product.id)}
                  className="p-1.5 text-rose-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-lg transition-colors"
                  aria-label="Remove from wishlist"
                >
                  <XMarkIcon className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Recently Viewed Tab ──────────────────────────────────────
function RecentlyViewedTab() {
  const { recentlyViewed, products, fetchProducts } = useStore();

  useEffect(() => { if (products.length === 0) fetchProducts(); }, []);

  const viewedProducts = (recentlyViewed || [])
    .map(id => products.find(p => p.id === id))
    .filter(Boolean);

  if (viewedProducts.length === 0) return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 p-12 text-center">
      <EyeIcon className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">No recently viewed products</h3>
      <p className="text-gray-500 dark:text-gray-400 mb-6">Browse our collection and your recently viewed items will appear here.</p>
      <Link to="/shop" className="inline-flex px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl transition-colors">
        Browse Shop
      </Link>
    </div>
  );

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 p-6">
      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Recently Viewed ({viewedProducts.length})</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {viewedProducts.map(product => (
          <Link key={product.id} to={`/product/${product.id}`} className="flex gap-4 border border-gray-100 dark:border-gray-800 rounded-2xl p-4 hover:shadow-md hover:border-indigo-200 dark:hover:border-indigo-500/30 transition-all group">
            <div className="flex-shrink-0 w-16 h-16 rounded-xl overflow-hidden bg-gray-100">
              {product.image_url && <img src={product.image_url} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" loading="lazy" />}
            </div>
            <div className="min-w-0">
              <h3 className="font-semibold text-gray-900 dark:text-white text-sm group-hover:text-indigo-600 transition-colors truncate">{product.name}</h3>
              <p className="text-indigo-600 font-bold text-sm mt-0.5">₹{(product.price * 83).toFixed(0)}</p>
              <p className="text-xs text-gray-400 mt-0.5 truncate">{product.categories?.name || 'Collection'}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

// ── Reviews Tab ──────────────────────────────────────────────
function ReviewsTab() {
  const { auth } = useStore();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const { supabase: _s } = useStore();

  useEffect(() => {
    const fetchMyReviews = async () => {
      try {
        const { createClient } = await import('@supabase/supabase-js');
        const { supabase } = await import('../lib/supabaseClient');
        const { data, error } = await supabase
          .from('reviews')
          .select('id, rating, comment, created_at, products(name, product_images(url))')
          .eq('user_id', auth?.user?.id)
          .order('created_at', { ascending: false });
        if (!error) setReviews(data || []);
      } catch (err) {
        console.error('Failed to fetch reviews:', err);
      } finally {
        setLoading(false);
      }
    };
    if (auth?.user?.id) fetchMyReviews();
  }, [auth?.user?.id]);

  if (loading) return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 p-12 text-center">
      <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto" />
    </div>
  );

  if (reviews.length === 0) return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 p-12 text-center">
      <StarIcon className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">No reviews yet</h3>
      <p className="text-gray-500 dark:text-gray-400 mb-6">Purchase a product and leave a review to help other shoppers.</p>
      <Link to="/shop" className="inline-flex px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl transition-colors">
        Browse Shop
      </Link>
    </div>
  );

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 p-6">
      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">My Reviews ({reviews.length})</h2>
      <div className="space-y-4">
        {reviews.map(review => {
          const productImg = review.products?.product_images?.[0]?.url;
          return (
            <div key={review.id} className="flex gap-4 border border-gray-100 dark:border-gray-800 rounded-2xl p-5">
              <div className="flex-shrink-0 w-14 h-14 rounded-xl overflow-hidden bg-gray-100">
                {productImg && <img src={productImg} alt={review.products?.name} className="w-full h-full object-cover" loading="lazy" />}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <p className="font-semibold text-gray-900 dark:text-white text-sm">{review.products?.name}</p>
                  <p className="text-xs text-gray-400">{new Date(review.created_at).toLocaleDateString()}</p>
                </div>
                <div className="flex gap-0.5 mb-2">
                  {[...Array(5)].map((_, i) => (
                    <StarSolid key={i} className={`w-3.5 h-3.5 ${i < review.rating ? 'text-amber-400' : 'text-gray-200'}`} />
                  ))}
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{review.comment}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
