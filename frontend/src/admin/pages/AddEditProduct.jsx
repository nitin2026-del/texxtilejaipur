import React, { useState, useEffect } from 'react';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { useNavigate, useParams } from 'react-router-dom';
import ImageUploader from '../components/ImageUploader';
import { supabase } from '../../lib/supabaseClient';

export default function AddEditProduct() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = !!id;

  const [images, setImages] = useState([]);
  const [categories, setCategories] = useState([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [form, setForm] = useState({
    name: '',
    slug: '',
    description: '',
    price: '',
    compare_at_price: '',
    stock_quantity: '',
    sku: '',
    category_id: '',
    is_featured: false,
    status: 'active',
  });

  // Load categories
  useEffect(() => {
    supabase.from('categories').select('id, name').order('display_order', { ascending: true }).order('name', { ascending: true }).then(({ data }) => {
      if (data) setCategories(data);
    });
  }, []);

  // Load product if editing
  useEffect(() => {
    if (!id) return;
    const load = async () => {
      const { data: product } = await supabase.from('products').select('*').eq('id', id).single();
      if (product) {
        setForm({
          name: product.name || '',
          slug: product.slug || '',
          description: product.description || '',
          price: product.price || '',
          compare_at_price: product.compare_at_price || '',
          stock_quantity: product.stock_quantity || '',
          sku: product.sku || '',
          category_id: product.category_id || '',
          is_featured: product.is_featured || false,
          status: product.status || 'active',
        });
      }
      const { data: imgs } = await supabase.from('product_images').select('url').eq('product_id', id).order('display_order');
      if (imgs) setImages(imgs.map(i => i.url));
    };
    load();
  }, [id]);

  const handleImageUpload = (publicUrl) => {
    if (publicUrl) setImages(prev => [...prev, publicUrl]);
  };

  const removeImage = (index) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    if (!form.name || !form.price) {
      setError('Product name and price are required.');
      return;
    }
    setError(null);
    setSaving(true);

    const slug = form.slug || form.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    const payload = {
      ...form,
      slug,
      price: parseFloat(form.price),
      compare_at_price: form.compare_at_price ? parseFloat(form.compare_at_price) : null,
      stock_quantity: form.stock_quantity ? parseInt(form.stock_quantity) : 0,
    };

    let productId = id;

    if (isEditing) {
      const { error: updErr } = await supabase.from('products').update(payload).eq('id', id);
      if (updErr) { setError(updErr.message); setSaving(false); return; }
    } else {
      const { data, error: insErr } = await supabase.from('products').insert(payload).select().single();
      if (insErr) { setError(insErr.message); setSaving(false); return; }
      productId = data.id;
    }

    // Save images
    if (images.length > 0) {
      await supabase.from('product_images').delete().eq('product_id', productId);
      const imgRows = images.map((url, idx) => ({
        product_id: productId,
        url,
        display_order: idx,
        is_primary: idx === 0,
      }));
      await supabase.from('product_images').insert(imgRows);
    }

    setSaving(false);
    navigate('/admin/products');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/admin/products')}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
          >
            <ArrowLeftIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {isEditing ? 'Edit Product' : 'Add New Product'}
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {isEditing ? 'Update product details and images.' : 'Create a new product listing.'}
            </p>
          </div>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => navigate('/admin/products')}
            className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-medium rounded-xl hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-medium rounded-xl transition-colors shadow-sm shadow-indigo-200 dark:shadow-none"
          >
            {saving ? 'Saving...' : isEditing ? 'Update Product' : 'Save Product'}
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-xl px-4 py-3 text-sm text-red-600 dark:text-red-400">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Left Column (Main Details) */}
        <div className="lg:col-span-2 space-y-6">

          {/* General Information */}
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm space-y-4">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">General Information</h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Product Name *</label>
              <input
                type="text"
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                placeholder="e.g. Royal Banarasi Silk Saree"
                className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-600 dark:text-white outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Slug (auto-generated)</label>
              <input
                type="text"
                value={form.slug}
                onChange={e => setForm({ ...form, slug: e.target.value })}
                placeholder="e.g. royal-banarasi-silk-saree"
                className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-600 dark:text-white outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
              <textarea
                rows={5}
                value={form.description}
                onChange={e => setForm({ ...form, description: e.target.value })}
                placeholder="Describe your product..."
                className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-600 dark:text-white outline-none"
              />
            </div>
          </div>

          {/* Pricing */}
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm space-y-4">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Pricing</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Price (₹) *</label>
                <input
                  type="number"
                  value={form.price}
                  onChange={e => setForm({ ...form, price: e.target.value })}
                  placeholder="0.00"
                  className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-600 dark:text-white outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Compare at Price (₹)</label>
                <input
                  type="number"
                  value={form.compare_at_price}
                  onChange={e => setForm({ ...form, compare_at_price: e.target.value })}
                  placeholder="0.00"
                  className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-600 dark:text-white outline-none"
                />
              </div>
            </div>
          </div>

          {/* Inventory */}
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm space-y-4">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Inventory</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">SKU</label>
                <input
                  type="text"
                  value={form.sku}
                  onChange={e => setForm({ ...form, sku: e.target.value })}
                  placeholder="e.g. SKU-001"
                  className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-600 dark:text-white outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Stock Quantity</label>
                <input
                  type="number"
                  value={form.stock_quantity}
                  onChange={e => setForm({ ...form, stock_quantity: e.target.value })}
                  placeholder="0"
                  className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-600 dark:text-white outline-none"
                />
              </div>
            </div>
          </div>

          {/* Product Images */}
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm space-y-4">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Product Images</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">First image will be the primary/cover image.</p>
            <ImageUploader bucketName="product-images" onUploadComplete={handleImageUpload} resetAfterUpload={true} />
            {images.length > 0 && (
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 mt-4">
                {images.map((url, index) => (
                  <div key={index} className="relative group rounded-xl overflow-hidden aspect-square border border-gray-200 dark:border-gray-700">
                    <img src={url} alt={`Product ${index + 1}`} className="w-full h-full object-cover" />
                    {index === 0 && (
                      <span className="absolute top-1 left-1 bg-indigo-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">Primary</span>
                    )}
                    <button
                      onClick={() => removeImage(index)}
                      className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Status */}
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm space-y-4">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Product Status</h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
              <select
                value={form.status}
                onChange={e => setForm({ ...form, status: e.target.value })}
                className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-600 dark:text-white outline-none"
              >
                <option value="active">Active (Visible)</option>
                <option value="draft">Draft (Hidden)</option>
                <option value="archived">Archived</option>
              </select>
            </div>
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="is_featured"
                checked={form.is_featured}
                onChange={e => setForm({ ...form, is_featured: e.target.checked })}
                className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-600 w-4 h-4"
              />
              <label htmlFor="is_featured" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Featured Product
              </label>
            </div>
          </div>

          {/* Category */}
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm space-y-4">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Category</h3>
            <select
              value={form.category_id}
              onChange={e => setForm({ ...form, category_id: e.target.value })}
              className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-600 dark:text-white outline-none"
            >
              <option value="">Select a category...</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>

          {/* Save Button */}
          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full px-4 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-medium rounded-xl transition-colors shadow-sm shadow-indigo-200 dark:shadow-none"
          >
            {saving ? 'Saving...' : isEditing ? 'Update Product' : 'Save Product'}
          </button>
        </div>
      </div>
    </div>
  );
}
