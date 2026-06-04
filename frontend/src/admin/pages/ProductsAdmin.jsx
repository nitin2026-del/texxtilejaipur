import React, { useState, useEffect } from 'react';
import { PlusIcon, MagnifyingGlassIcon, PencilSquareIcon, TrashIcon, EllipsisHorizontalIcon } from '@heroicons/react/24/outline';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';

const STATUS_STYLES = {
  active: 'bg-green-100 text-green-800 dark:bg-green-500/10 dark:text-green-500',
  draft: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
  archived: 'bg-red-100 text-red-800 dark:bg-red-500/10 dark:text-red-500',
};

export default function ProductsAdmin() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const navigate = useNavigate();

  const fetchProducts = async () => {
    setLoading(true);
    const query = supabase
      .from('products')
      .select(`
        id, name, slug, sku, price, stock_quantity, status, is_featured, created_at,
        categories(name),
        product_images(url, is_primary)
      `)
      .order('created_at', { ascending: false });

    if (statusFilter !== 'all') query.eq('status', statusFilter);

    const { data, error } = await query;
    if (!error) setProducts(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchProducts(); }, [statusFilter]);

  const handleDelete = async (id) => {
    if (!confirm('Delete this product? This cannot be undone.')) return;
    await supabase.from('product_images').delete().eq('product_id', id);
    await supabase.from('products').delete().eq('id', id);
    setProducts(prev => prev.filter(p => p.id !== id));
  };

  const filtered = products.filter(p =>
    p.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.sku?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getPrimaryImage = (product) => {
    const primary = product.product_images?.find(i => i.is_primary);
    return primary?.url || product.product_images?.[0]?.url || null;
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Products</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Manage your product catalog, pricing, and inventory.</p>
        </div>
        <Link
          to="/admin/products/new"
          className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-xl transition-colors shadow-sm shadow-indigo-200 dark:shadow-none"
        >
          <PlusIcon className="w-5 h-5" />
          Add Product
        </Link>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-center gap-4 bg-white dark:bg-gray-900 p-4 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm">
        <div className="relative flex-1 w-full">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name or SKU..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-800 border-none rounded-xl text-sm focus:ring-2 focus:ring-indigo-600 dark:text-white"
          />
        </div>
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className="w-full sm:w-auto px-4 py-2 bg-gray-50 dark:bg-gray-800 border-none rounded-xl text-sm text-gray-700 dark:text-gray-300 focus:ring-2 focus:ring-indigo-600"
        >
          <option value="all">All Statuses</option>
          <option value="active">Active</option>
          <option value="draft">Draft</option>
          <option value="archived">Archived</option>
        </select>
      </div>

      {/* Products Table */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-800/50 text-gray-500 dark:text-gray-400 text-sm border-b border-gray-200 dark:border-gray-800">
                <th className="px-6 py-4 font-medium">Product</th>
                <th className="px-6 py-4 font-medium hidden md:table-cell">SKU</th>
                <th className="px-6 py-4 font-medium hidden lg:table-cell">Category</th>
                <th className="px-6 py-4 font-medium">Price</th>
                <th className="px-6 py-4 font-medium hidden sm:table-cell">Stock</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
              {loading ? (
                [...Array(4)].map((_, i) => (
                  <tr key={i}>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-lg bg-gray-100 dark:bg-gray-800 animate-pulse" />
                        <div className="h-4 w-40 bg-gray-100 dark:bg-gray-800 rounded animate-pulse" />
                      </div>
                    </td>
                    <td colSpan={6} className="px-6 py-4">
                      <div className="h-4 bg-gray-100 dark:bg-gray-800 rounded animate-pulse" />
                    </td>
                  </tr>
                ))
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-16 text-center text-gray-500 dark:text-gray-400">
                    {searchQuery ? 'No products match your search.' : 'No products yet. Click "Add Product" to create your first one.'}
                  </td>
                </tr>
              ) : (
                filtered.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        {getPrimaryImage(product) ? (
                          <img src={getPrimaryImage(product)} alt={product.name} className="w-12 h-12 rounded-lg object-cover bg-gray-100" />
                        ) : (
                          <div className="w-12 h-12 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center text-indigo-400 text-sm font-bold">
                            {product.name?.[0]}
                          </div>
                        )}
                        <div>
                          <span className="text-sm font-medium text-gray-900 dark:text-white line-clamp-1">{product.name}</span>
                          {product.is_featured && (
                            <span className="text-xs text-indigo-500 font-medium">★ Featured</span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400 hidden md:table-cell font-mono">{product.sku || '—'}</td>
                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400 hidden lg:table-cell">{product.categories?.name || '—'}</td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">₹{Number(product.price).toFixed(2)}</td>
                    <td className="px-6 py-4 text-sm hidden sm:table-cell">
                      <span className={product.stock_quantity > 0 ? 'text-gray-900 dark:text-white' : 'text-red-600 dark:text-red-400 font-medium'}>
                        {product.stock_quantity}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${STATUS_STYLES[product.status] || STATUS_STYLES.draft}`}>
                        {product.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => navigate(`/admin/products/${product.id}`)}
                          className="p-2 text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <PencilSquareIcon className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(product.id)}
                          className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-800 flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
          <span>Showing {filtered.length} of {products.length} products</span>
        </div>
      </div>
    </div>
  );
}
