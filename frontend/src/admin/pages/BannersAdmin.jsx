import React, { useEffect, useState } from 'react';
import { PlusIcon, PhotoIcon, TrashIcon, PencilSquareIcon, CheckIcon, XMarkIcon } from '@heroicons/react/24/outline';
import ImageUploader from '../components/ImageUploader';
import { useStore } from '../../store/useStore';

export default function BannersAdmin() {
  const { fetchBanners, saveBanner, deleteBanner } = useStore();
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingBanner, setEditingBanner] = useState(null);

  useEffect(() => {
    loadBanners();
  }, []);

  const loadBanners = async () => {
    setLoading(true);
    const data = await fetchBanners();
    setBanners(data || []);
    setLoading(false);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      await saveBanner({
        id: editingBanner.id,
        title: editingBanner.title,
        subtitle: editingBanner.subtitle,
        image_url: editingBanner.image_url,
        link_url: editingBanner.link_url,
        position: editingBanner.position || 'hero',
        display_order: parseInt(editingBanner.display_order) || 0,
        is_active: editingBanner.is_active !== undefined ? editingBanner.is_active : true,
      });
      setEditingBanner(null);
      loadBanners();
    } catch (err) {
      console.error(err);
      alert('Failed to save banner');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this banner?')) {
      try {
        await deleteBanner(id);
        loadBanners();
      } catch (err) {
        console.error(err);
        alert('Failed to delete banner');
      }
    }
  };

  return (
    <div className="space-y-6">
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Banners</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Manage homepage carousel and promotional banners.</p>
        </div>
        <button 
          onClick={() => setEditingBanner({})}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-xl transition-colors shadow-sm shadow-indigo-200 dark:shadow-none"
        >
          <PlusIcon className="w-5 h-5" />
          Add Banner
        </button>
      </div>

      {editingBanner && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 w-full max-w-lg shadow-xl overflow-y-auto max-h-[90vh]">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
              {editingBanner.id ? 'Edit Banner' : 'New Banner'}
            </h2>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title</label>
                <input
                  type="text"
                  required
                  value={editingBanner.title || ''}
                  onChange={(e) => setEditingBanner({ ...editingBanner, title: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Subtitle</label>
                <input
                  type="text"
                  value={editingBanner.subtitle || ''}
                  onChange={(e) => setEditingBanner({ ...editingBanner, subtitle: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Link URL</label>
                <input
                  type="text"
                  value={editingBanner.link_url || ''}
                  onChange={(e) => setEditingBanner({ ...editingBanner, link_url: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Display Order</label>
                  <input
                    type="number"
                    value={editingBanner.display_order || 0}
                    onChange={(e) => setEditingBanner({ ...editingBanner, display_order: e.target.value })}
                    className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Position</label>
                  <select
                    value={editingBanner.position || 'hero'}
                    onChange={(e) => setEditingBanner({ ...editingBanner, position: e.target.value })}
                    className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="hero">Hero Carousel</option>
                    <option value="promo">Promo Banner</option>
                  </select>
                </div>
              </div>
              
              <div className="flex items-center gap-2 mt-2">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={editingBanner.is_active !== false}
                  onChange={(e) => setEditingBanner({ ...editingBanner, is_active: e.target.checked })}
                  className="w-4 h-4 text-indigo-600 rounded"
                />
                <label htmlFor="is_active" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Banner is active
                </label>
              </div>

              <div className="pt-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Image</label>
                {editingBanner.image_url ? (
                  <div className="relative aspect-video rounded-xl overflow-hidden mb-2 group">
                    <img src={editingBanner.image_url} alt="Banner" className="w-full h-full object-cover" />
                    <button 
                      type="button"
                      onClick={() => setEditingBanner({ ...editingBanner, image_url: '' })}
                      className="absolute top-2 right-2 p-1.5 bg-red-600 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="bg-gray-50 dark:bg-gray-800 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl p-4">
                    <ImageUploader 
                      bucketName="banners" 
                      onUploadComplete={(url) => setEditingBanner({ ...editingBanner, image_url: url })}
                    />
                  </div>
                )}
              </div>

              <div className="flex gap-3 pt-4 border-t border-gray-100 dark:border-gray-800">
                <button
                  type="button"
                  onClick={() => setEditingBanner(null)}
                  className="flex-1 px-4 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-900 dark:text-white font-medium rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!editingBanner.title || !editingBanner.image_url}
                  className="flex-1 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-medium rounded-xl transition-colors"
                >
                  Save Banner
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {loading ? (
        <div className="text-center py-12">
          <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-500">Loading banners...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {banners.map((banner) => (
            <div key={banner.id} className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden shadow-sm group">
              <div className="relative aspect-video">
                <img src={banner.image_url} alt={banner.title} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 to-transparent flex flex-col justify-end p-4">
                  <h3 className="text-white font-bold text-lg">{banner.title}</h3>
                  <p className="text-gray-300 text-sm">{banner.subtitle}</p>
                </div>
                <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button 
                    onClick={() => setEditingBanner(banner)}
                    className="p-1.5 bg-white/90 text-indigo-600 hover:bg-white rounded-lg backdrop-blur-sm shadow-sm transition-colors"
                  >
                    <PencilSquareIcon className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => handleDelete(banner.id)}
                    className="p-1.5 bg-white/90 text-red-600 hover:bg-white rounded-lg backdrop-blur-sm shadow-sm transition-colors"
                  >
                    <TrashIcon className="w-4 h-4" />
                  </button>
                </div>
                <span className={`absolute top-2 left-2 px-2 py-1 text-xs font-bold uppercase tracking-wider rounded backdrop-blur-md text-white
                  ${banner.is_active ? 'bg-green-500/80' : 'bg-gray-900/80'}
                `}>
                  {banner.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>
              <div className="p-4 flex items-center justify-between border-t border-gray-200 dark:border-gray-800">
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400 capitalize">Position: {banner.position}</span>
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Order: {banner.display_order}</span>
              </div>
            </div>
          ))}

          <div 
            onClick={() => setEditingBanner({})}
            className="bg-gray-50 dark:bg-gray-800/50 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-2xl flex flex-col items-center justify-center p-8 transition-colors hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer group min-h-[250px]"
          >
            <PlusIcon className="w-10 h-10 text-gray-400 group-hover:text-indigo-500 transition-colors mb-2" />
            <p className="font-medium text-gray-500 dark:text-gray-400 text-center group-hover:text-indigo-500 transition-colors">Add New Banner</p>
          </div>
        </div>
      )}

    </div>
  );
}
