import React, { useState, useEffect } from 'react';
import {
  CurrencyDollarIcon,
  ShoppingBagIcon,
  UsersIcon,
  ArrowTrendingUpIcon,
  CubeIcon,
} from '@heroicons/react/24/outline';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { supabase } from '../../lib/supabaseClient';
import { Link } from 'react-router-dom';

const STATUS_STYLES = {
  pending: 'bg-amber-100 text-amber-800 dark:bg-amber-500/10 dark:text-amber-400',
  confirmed: 'bg-blue-100 text-blue-800 dark:bg-blue-500/10 dark:text-blue-400',
  processing: 'bg-purple-100 text-purple-800 dark:bg-purple-500/10 dark:text-purple-400',
  shipped: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-500/10 dark:text-indigo-400',
  delivered: 'bg-green-100 text-green-800 dark:bg-green-500/10 dark:text-green-400',
  cancelled: 'bg-red-100 text-red-800 dark:bg-red-500/10 dark:text-red-400',
};

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [salesData, setSalesData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboard = async () => {
      setLoading(true);
      try {
        // Parallel fetch all stats
        const [
          { count: ordersCount },
          { count: productsCount },
          { count: customersCount },
          { data: allOrders },
          { data: recentOrdersData },
        ] = await Promise.all([
          supabase.from('orders').select('*', { count: 'exact', head: true }),
          supabase.from('products').select('*', { count: 'exact', head: true }).eq('status', 'active'),
          supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'customer'),
          supabase.from('orders').select('total, created_at').in('status', ['confirmed', 'processing', 'shipped', 'delivered']),
          supabase.from('orders')
            .select(`id, order_number, total, status, created_at, profiles(first_name, last_name)`)
            .order('created_at', { ascending: false })
            .limit(5),
        ]);

        // Revenue calculation
        const totalRevenue = allOrders?.reduce((sum, o) => sum + (Number(o.total) || 0), 0) || 0;

        setStats({
          totalRevenue,
          totalOrders: ordersCount || 0,
          activeProducts: productsCount || 0,
          totalCustomers: customersCount || 0,
        });

        setRecentOrders(recentOrdersData || []);

        // Build sales chart data (last 7 days)
        const days = [];
        for (let i = 6; i >= 0; i--) {
          const date = new Date();
          date.setDate(date.getDate() - i);
          const dayLabel = date.toLocaleDateString('en', { weekday: 'short' });
          const dayRevenue = allOrders?.filter(o => {
            const d = new Date(o.created_at);
            return d.toDateString() === date.toDateString();
          }).reduce((sum, o) => sum + (Number(o.total) || 0), 0) || 0;
          days.push({ name: dayLabel, total: dayRevenue });
        }
        setSalesData(days);

        // Top products by order count
        const { data: orderItems } = await supabase
          .from('order_items')
          .select('product_id, quantity, products(name)');

        if (orderItems) {
          const productMap = {};
          orderItems.forEach(item => {
            const name = item.products?.name || 'Unknown';
            productMap[name] = (productMap[name] || 0) + (item.quantity || 1);
          });
          const sorted = Object.entries(productMap)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([name, sales]) => ({ name: name.length > 20 ? name.slice(0, 20) + '…' : name, sales }));
          setTopProducts(sorted);
        }

      } catch (err) {
        console.error('Dashboard load error:', err);
      }
      setLoading(false);
    };

    loadDashboard();
  }, []);

  const formatCurrency = (val) => {
    if (val >= 100000) return `₹${(val / 100000).toFixed(1)}L`;
    if (val >= 1000) return `₹${(val / 1000).toFixed(1)}K`;
    return `₹${val.toFixed(0)}`;
  };

  const STAT_CARDS = stats ? [
    { name: 'Total Revenue', value: formatCurrency(stats.totalRevenue), icon: CurrencyDollarIcon, color: 'text-indigo-600 dark:text-indigo-400', bg: 'bg-indigo-50 dark:bg-indigo-500/10' },
    { name: 'Total Orders', value: stats.totalOrders.toLocaleString(), icon: ShoppingBagIcon, color: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-50 dark:bg-purple-500/10' },
    { name: 'Active Products', value: stats.activeProducts.toLocaleString(), icon: CubeIcon, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-500/10' },
    { name: 'Customers', value: stats.totalCustomers.toLocaleString(), icon: UsersIcon, color: 'text-rose-600 dark:text-rose-400', bg: 'bg-rose-50 dark:bg-rose-500/10' },
  ] : [];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard Overview</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Live data from your Supabase backend.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {loading ? (
          [...Array(4)].map((_, i) => (
            <div key={i} className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm animate-pulse">
              <div className="w-12 h-12 rounded-xl bg-gray-100 dark:bg-gray-800 mb-4" />
              <div className="h-4 w-24 bg-gray-100 dark:bg-gray-800 rounded mb-2" />
              <div className="h-7 w-32 bg-gray-100 dark:bg-gray-800 rounded" />
            </div>
          ))
        ) : (
          STAT_CARDS.map((stat) => (
            <div key={stat.name} className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm">
              <div className={`w-12 h-12 rounded-xl ${stat.bg} flex items-center justify-center mb-4`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
              <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium">{stat.name}</h3>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{stat.value}</p>
            </div>
          ))
        )}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Chart */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Revenue — Last 7 Days</h3>
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={salesData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#374151" opacity={0.2} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#6b7280' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6b7280' }} tickFormatter={formatCurrency} width={60} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#111827', borderColor: '#374151', color: '#f3f4f6', borderRadius: '8px' }}
                  itemStyle={{ color: '#818cf8' }}
                  formatter={(val) => [formatCurrency(val), 'Revenue']}
                />
                <Area type="monotone" dataKey="total" stroke="#4f46e5" strokeWidth={3} fillOpacity={1} fill="url(#colorTotal)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Products */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Top Products</h3>
          {loading ? (
            <div className="space-y-3">
              {[...Array(4)].map((_, i) => <div key={i} className="h-8 bg-gray-100 dark:bg-gray-800 rounded animate-pulse" />)}
            </div>
          ) : topProducts.length === 0 ? (
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">No order data yet.</p>
          ) : (
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topProducts} layout="vertical" margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#374151" opacity={0.2} />
                  <XAxis type="number" hide />
                  <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 11 }} width={120} />
                  <Tooltip
                    cursor={{ fill: '#374151', opacity: 0.1 }}
                    contentStyle={{ backgroundColor: '#111827', borderColor: '#374151', color: '#f3f4f6', borderRadius: '8px' }}
                  />
                  <Bar dataKey="sales" fill="#8b5cf6" radius={[0, 4, 4, 0]} barSize={20} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>

      {/* Recent Orders */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">Recent Orders</h3>
          <Link to="/admin/orders" className="text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-700">
            View All →
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-800/50 text-gray-500 dark:text-gray-400 text-sm">
                <th className="px-6 py-4 font-medium">Order</th>
                <th className="px-6 py-4 font-medium">Customer</th>
                <th className="px-6 py-4 font-medium hidden md:table-cell">Date</th>
                <th className="px-6 py-4 font-medium">Amount</th>
                <th className="px-6 py-4 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
              {loading ? (
                [...Array(4)].map((_, i) => (
                  <tr key={i}>
                    <td colSpan={5} className="px-6 py-4">
                      <div className="h-4 bg-gray-100 dark:bg-gray-800 rounded animate-pulse" />
                    </td>
                  </tr>
                ))
              ) : recentOrders.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">No orders yet.</td>
                </tr>
              ) : (
                recentOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white font-mono">
                      #{order.order_number || order.id?.substring(0, 8)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                      {order.profiles?.first_name
                        ? `${order.profiles.first_name} ${order.profiles.last_name || ''}`
                        : 'Guest'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400 hidden md:table-cell">
                      {new Date(order.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-gray-900 dark:text-white">
                      ₹{Number(order.total || 0).toFixed(2)}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${STATUS_STYLES[order.status] || ''}`}>
                        {order.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
