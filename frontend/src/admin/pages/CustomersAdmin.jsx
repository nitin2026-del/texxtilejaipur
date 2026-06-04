import React, { useState, useEffect } from 'react';
import { MagnifyingGlassIcon, UsersIcon, EnvelopeIcon, PhoneIcon } from '@heroicons/react/24/outline';
import { supabase } from '../../lib/supabaseClient';

export default function CustomersAdmin() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    const fetchCustomers = async () => {
      setLoading(true);
      const { data } = await supabase
        .from('profiles')
        .select('*, orders(id, total, status)')
        .eq('role', 'customer')
        .order('created_at', { ascending: false });
      if (data) setCustomers(data);
      setLoading(false);
    };
    fetchCustomers();
  }, []);

  const filtered = customers.filter(c => {
    const name = `${c.first_name || ''} ${c.last_name || ''}`.toLowerCase();
    const email = (c.email || '').toLowerCase();
    const q = searchQuery.toLowerCase();
    return name.includes(q) || email.includes(q);
  });

  const getTotalSpend = (orders) =>
    orders?.filter(o => !['cancelled', 'refunded'].includes(o.status))
      .reduce((sum, o) => sum + (Number(o.total) || 0), 0) || 0;

  if (selected) {
    const totalSpend = getTotalSpend(selected.orders);
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <button onClick={() => setSelected(null)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors">
            <svg className="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </button>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Customer Profile</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm text-center">
            <div className="w-16 h-16 rounded-full bg-indigo-100 dark:bg-indigo-500/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400 text-2xl font-bold mx-auto mb-3">
              {selected.first_name?.[0] || '?'}
            </div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">{selected.first_name} {selected.last_name}</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{selected.email}</p>
            {selected.phone && <p className="text-sm text-gray-500 dark:text-gray-400">{selected.phone}</p>}
            <div className="mt-4 grid grid-cols-2 gap-4 text-center pt-4 border-t border-gray-100 dark:border-gray-800">
              <div>
                <p className="text-xl font-bold text-gray-900 dark:text-white">{selected.orders?.length || 0}</p>
                <p className="text-xs text-gray-500">Total Orders</p>
              </div>
              <div>
                <p className="text-xl font-bold text-gray-900 dark:text-white">₹{totalSpend.toFixed(0)}</p>
                <p className="text-xs text-gray-500">Total Spend</p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Order History</h3>
            {selected.orders?.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400 text-sm">No orders placed yet.</p>
            ) : (
              <div className="space-y-3">
                {selected.orders?.map(order => (
                  <div key={order.id} className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-800 last:border-0">
                    <span className="text-sm font-mono text-gray-700 dark:text-gray-300">#{order.id.substring(0, 8)}</span>
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                      order.status === 'delivered' ? 'bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-400' :
                      order.status === 'cancelled' ? 'bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400' :
                      'bg-indigo-100 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-400'
                    }`}>{order.status}</span>
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">₹{Number(order.total).toFixed(2)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Customers</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">View all registered customers and their order history.</p>
      </div>

      {/* Search */}
      <div className="bg-white dark:bg-gray-900 p-4 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm">
        <div className="relative">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-800 border-none rounded-xl text-sm focus:ring-2 focus:ring-indigo-600 dark:text-white"
          />
        </div>
      </div>

      {/* Customers Table */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-800/50">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Customer</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider hidden md:table-cell">Orders</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider hidden sm:table-cell">Total Spend</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider hidden lg:table-cell">Joined</th>
              <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">View</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
            {loading ? (
              [...Array(5)].map((_, i) => (
                <tr key={i}>
                  <td colSpan={5} className="px-6 py-4">
                    <div className="h-5 bg-gray-100 dark:bg-gray-800 rounded animate-pulse" />
                  </td>
                </tr>
              ))
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-16 text-center">
                  <UsersIcon className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600 mb-3" />
                  <p className="text-gray-500 dark:text-gray-400">No customers found.</p>
                </td>
              </tr>
            ) : (
              filtered.map((customer) => (
                <tr key={customer.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-500/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold text-sm shrink-0">
                        {customer.first_name?.[0] || customer.email?.[0]?.toUpperCase() || '?'}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {customer.first_name ? `${customer.first_name} ${customer.last_name || ''}` : 'No Name'}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                          <EnvelopeIcon className="w-3 h-3" />
                          {customer.email || '—'}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300 hidden md:table-cell">
                    {customer.orders?.length || 0}
                  </td>
                  <td className="px-6 py-4 text-sm font-semibold text-gray-900 dark:text-white hidden sm:table-cell">
                    ₹{getTotalSpend(customer.orders).toFixed(0)}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400 hidden lg:table-cell">
                    {customer.created_at ? new Date(customer.created_at).toLocaleDateString() : '—'}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => setSelected(customer)}
                      className="text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 font-medium"
                    >
                      View →
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-800 text-sm text-gray-500 dark:text-gray-400">
          {filtered.length} of {customers.length} customers
        </div>
      </div>
    </div>
  );
}
