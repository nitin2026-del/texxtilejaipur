import React, { useState, useEffect } from 'react';
import { PlusIcon, TrashIcon, PhotoIcon } from '@heroicons/react/24/outline';
import ImageUploader from '../components/ImageUploader';
import { supabase } from '../../lib/supabaseClient';

export default function VerifiedChatsAdmin() {
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [pendingUrl, setPendingUrl] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  const fetchChats = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('verified_chats')
      .select('*')
      .order('display_order', { ascending: true });
    if (!error) setChats(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchChats(); }, []);

  const handleSave = async () => {
    if (!pendingUrl) return;
    setSaving(true);
    const { error } = await supabase.from('verified_chats').insert({
      photo_url: pendingUrl,
      display_order: chats.length,
    });
    if (!error) {
      await fetchChats();
      setIsAdding(false);
      setPendingUrl(null);
    }
    setSaving(false);
  };

  const handleDelete = async (id) => {
    setDeleteId(id);
    const { error } = await supabase.from('verified_chats').delete().eq('id', id);
    if (!error) setChats(prev => prev.filter(c => c.id !== id));
    setDeleteId(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Verified Buyer Chats</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Upload screenshots of verified buyer chats to showcase on the storefront.
          </p>
        </div>
        <button
          onClick={() => setIsAdding(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-xl transition-colors shadow-sm shadow-indigo-200 dark:shadow-none"
        >
          <PlusIcon className="w-5 h-5" />
          Upload Chat
        </button>
      </div>

      {/* Upload Panel */}
      {isAdding && (
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm space-y-4">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">Upload Chat Screenshot</h2>
          <ImageUploader bucketName="verified-chats" onUploadComplete={(url) => setPendingUrl(url)} />
          {pendingUrl && (
            <div className="rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 max-w-sm">
              <img src={pendingUrl} alt="Preview" className="w-full object-contain" />
            </div>
          )}
          <div className="flex gap-3 pt-2">
            <button
              onClick={() => { setIsAdding(false); setPendingUrl(null); }}
              className="px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={!pendingUrl || saving}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-medium rounded-xl transition-colors"
            >
              {saving ? 'Saving...' : 'Save Chat'}
            </button>
          </div>
        </div>
      )}

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="aspect-[9/16] bg-gray-100 dark:bg-gray-800 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : chats.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl">
          <PhotoIcon className="w-14 h-14 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">No chats uploaded yet</h3>
          <p className="text-gray-500 dark:text-gray-400 mt-2">Upload your first verified buyer chat screenshot above.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {chats.map((chat) => (
            <div key={chat.id} className="group relative rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm hover:shadow-md transition-shadow">
              <img
                src={chat.photo_url}
                alt="Verified chat"
                className="w-full h-64 object-cover"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                <button
                  onClick={() => handleDelete(chat.id)}
                  disabled={deleteId === chat.id}
                  className="p-3 bg-red-600 hover:bg-red-700 text-white rounded-full shadow-lg transition-colors"
                >
                  <TrashIcon className="w-5 h-5" />
                </button>
              </div>
              <div className="p-3">
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {new Date(chat.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
