import React, { useState, useEffect } from 'react';
import { PlusIcon, TrashIcon, PencilSquareIcon, TagIcon, ArrowTurnDownRightIcon, ChevronUpIcon, ChevronDownIcon } from '@heroicons/react/24/outline';
import ImageUploader from '../components/ImageUploader';
import { supabase } from '../../lib/supabaseClient';

export default function CategoriesAdmin() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [form, setForm] = useState({ name: '', slug: '', description: '', image_url: '', parent_id: null });
  const [saving, setSaving] = useState(false);

  const fetchCategories = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('display_order', { ascending: true })
      .order('name', { ascending: true });
    if (!error) setCategories(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchCategories(); }, []);

  const openAdd = () => {
    setEditTarget(null);
    setForm({ name: '', slug: '', description: '', image_url: '', parent_id: null });
    setIsEditing(true);
  };

  const openEdit = (cat) => {
    setEditTarget(cat);
    setForm({ 
      name: cat.name, 
      slug: cat.slug, 
      description: cat.description || '', 
      image_url: cat.image_url || '',
      parent_id: cat.parent_id || null
    });
    setIsEditing(true);
  };

  const handleSave = async () => {
    if (!form.name) return;
    setSaving(true);
    const slug = form.slug || form.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    const payload = { ...form, slug };

    let error;
    if (editTarget) {
      ({ error } = await supabase.from('categories').update(payload).eq('id', editTarget.id));
    } else {
      ({ error } = await supabase.from('categories').insert(payload));
    }

    if (!error) {
      await fetchCategories();
      setIsEditing(false);
    } else {
      alert('Failed to save: ' + error.message);
    }
    setSaving(false);
  };

  const handleMove = async (cat, direction) => {
    const siblings = categories
      .filter(c => c.parent_id === cat.parent_id)
      .sort((a, b) => (a.display_order - b.display_order) || a.name.localeCompare(b.name));
    
    const currentIndex = siblings.findIndex(c => c.id === cat.id);
    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    
    if (targetIndex < 0 || targetIndex >= siblings.length) return;
    
    const newSiblings = [...siblings];
    const temp = newSiblings[currentIndex];
    newSiblings[currentIndex] = newSiblings[targetIndex];
    newSiblings[targetIndex] = temp;
    
    setSaving(true);
    
    const updatedCategories = categories.map(c => {
      const siblingIndex = newSiblings.findIndex(s => s.id === c.id);
      if (siblingIndex !== -1) {
        return { ...c, display_order: siblingIndex };
      }
      return c;
    });
    setCategories(updatedCategories);

    const updates = newSiblings.map((s, idx) => {
      return supabase.from('categories').update({ display_order: idx }).eq('id', s.id);
    });
    
    await Promise.all(updates);
    setSaving(false);
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this category? Sub-categories and products will be affected.')) return;
    await supabase.from('categories').delete().eq('id', id);
    setCategories(prev => prev.filter(c => c.id !== id));
  };

  // Build Hierarchy
  const parents = categories.filter(c => !c.parent_id);
  // Sort them explicitly by display_order then name to ensure they match UI order
  parents.sort((a, b) => (a.display_order - b.display_order) || a.name.localeCompare(b.name));
  
  const sortedCategories = [];
  parents.forEach((p, pIdx) => {
    sortedCategories.push({ 
      ...p, 
      isChild: false,
      isFirst: pIdx === 0,
      isLast: pIdx === parents.length - 1
    });
    
    const children = categories.filter(c => c.parent_id === p.id);
    children.sort((a, b) => (a.display_order - b.display_order) || a.name.localeCompare(b.name));
    
    children.forEach((c, cIdx) => sortedCategories.push({ 
      ...c, 
      isChild: true, 
      parentName: p.name,
      isFirst: cIdx === 0,
      isLast: cIdx === children.length - 1
    }));
  });
  const orphans = categories.filter(c => c.parent_id && !parents.find(p => p.id === c.parent_id));
  orphans.forEach(o => sortedCategories.push({ ...o, isChild: false, isFirst: false, isLast: false }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Categories</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Manage product categories for the storefront.</p>
        </div>
        <button
          onClick={openAdd}
          className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-xl transition-colors shadow-sm shadow-indigo-200 dark:shadow-none"
        >
          <PlusIcon className="w-5 h-5" />
          Add Category
        </button>
      </div>

      {/* Edit / Add Panel */}
      {isEditing && (
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
            {editTarget ? 'Edit Category' : 'New Category'}
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name *</label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={e => setForm({ ...form, name: e.target.value })}
                    placeholder="e.g. Silk Sarees"
                    className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-600 dark:text-white outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Parent Category</label>
                  <select
                    value={form.parent_id || ''}
                    onChange={e => setForm({ ...form, parent_id: e.target.value || null })}
                    className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-600 dark:text-white outline-none cursor-pointer"
                  >
                    <option value="">None (Top Level)</option>
                    {parents.filter(p => !editTarget || p.id !== editTarget.id).map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Slug (auto-generated if empty)</label>
                <input
                  type="text"
                  value={form.slug}
                  onChange={e => setForm({ ...form, slug: e.target.value })}
                  placeholder="e.g. silk-sarees"
                  className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-600 dark:text-white outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                <textarea
                  rows={3}
                  value={form.description}
                  onChange={e => setForm({ ...form, description: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-600 dark:text-white outline-none"
                />
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Category Image</label>
                <ImageUploader
                  bucketName="product-images"
                  onUploadComplete={(url) => setForm(prev => ({ ...prev, image_url: url || '' }))}
                />
                {form.image_url && (
                  <img src={form.image_url} alt="preview" className="mt-3 w-full h-32 rounded-xl object-cover" />
                )}
              </div>
            </div>
          </div>
          <div className="flex gap-3 mt-6 justify-end">
            <button
              onClick={() => setIsEditing(false)}
              className="px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={!form.name || saving}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-medium rounded-xl transition-colors"
            >
              {saving ? 'Saving...' : editTarget ? 'Update Category' : 'Create Category'}
            </button>
          </div>
        </div>
      )}

      {/* Table */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-16 bg-gray-100 dark:bg-gray-800 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : categories.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl">
          <TagIcon className="w-14 h-14 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">No categories yet</h3>
          <p className="text-gray-500 dark:text-gray-400 mt-2">Create your first product category above.</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden shadow-sm">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-800/50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Category</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider hidden md:table-cell">Slug</th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {sortedCategories.map((cat) => (
                <tr key={cat.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {cat.isChild && (
                        <ArrowTurnDownRightIcon className="w-5 h-5 text-gray-300 dark:text-gray-600 ml-4" />
                      )}
                      {cat.image_url ? (
                        <img src={cat.image_url} alt={cat.name} className="w-10 h-10 rounded-xl object-cover" />
                      ) : (
                        <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center">
                          <TagIcon className="w-5 h-5 text-indigo-400" />
                        </div>
                      )}
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-gray-900 dark:text-white">{cat.name}</p>
                          {cat.isChild && (
                            <span className="text-[10px] uppercase font-bold text-gray-400 bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded">Sub-category</span>
                          )}
                        </div>
                        {cat.description && (
                          <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1 mt-0.5">{cat.description}</p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 hidden md:table-cell">
                    <span className="text-sm text-gray-500 dark:text-gray-400 font-mono">{cat.slug}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleMove(cat, 'up')}
                        disabled={cat.isFirst || saving}
                        className={`p-2 rounded-xl transition-colors ${cat.isFirst || saving ? 'text-gray-300 dark:text-gray-700 cursor-not-allowed' : 'text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-500/10'}`}
                      >
                        <ChevronUpIcon className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleMove(cat, 'down')}
                        disabled={cat.isLast || saving}
                        className={`p-2 rounded-xl transition-colors ${cat.isLast || saving ? 'text-gray-300 dark:text-gray-700 cursor-not-allowed' : 'text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-500/10'}`}
                      >
                        <ChevronDownIcon className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => openEdit(cat)}
                        className="p-2 text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 rounded-xl transition-colors"
                      >
                        <PencilSquareIcon className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(cat.id)}
                        className="p-2 text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-colors"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
