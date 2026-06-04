import React, { useState, useEffect } from 'react';
import { PlusIcon, TrashIcon, FilmIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';
import VideoUploader from '../components/VideoUploader';
import ImageUploader from '../components/ImageUploader';
import { supabase } from '../../lib/supabaseClient';

export default function BehindTheScenesAdmin() {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [form, setForm] = useState({ title: '', video_url: '', thumbnail_url: '' });
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  const fetchVideos = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('behind_the_scenes')
      .select('*')
      .order('display_order', { ascending: true });
    if (!error) setVideos(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchVideos(); }, []);

  const handleSave = async () => {
    if (!form.title || !form.video_url) return;
    setSaving(true);
    const { error } = await supabase.from('behind_the_scenes').insert({
      title: form.title,
      video_url: form.video_url,
      thumbnail_url: form.thumbnail_url || null,
      display_order: videos.length,
    });
    if (!error) {
      await fetchVideos();
      setIsAdding(false);
      setForm({ title: '', video_url: '', thumbnail_url: '' });
    }
    setSaving(false);
  };

  const handleDelete = async (id) => {
    setDeleteId(id);
    const { error } = await supabase.from('behind_the_scenes').delete().eq('id', id);
    if (!error) setVideos(prev => prev.filter(v => v.id !== id));
    setDeleteId(null);
  };

  if (isAdding) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setIsAdding(false)}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
          >
            <ArrowLeftIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Add Behind the Scenes Video</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Form */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm space-y-4">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Video Details</h3>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title *</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={e => setForm({ ...form, title: e.target.value })}
                  placeholder="e.g. How our silk sarees are made..."
                  className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-600 dark:text-white outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Upload Video *</label>
                <VideoUploader
                  bucketName="videos"
                  onUploadComplete={(url) => setForm(prev => ({ ...prev, video_url: url || '' }))}
                />
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm space-y-4">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Thumbnail (Optional)</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">Upload a custom thumbnail. If not provided, the video poster will be used.</p>
              <ImageUploader
                bucketName="blog-images"
                onUploadComplete={(url) => setForm(prev => ({ ...prev, thumbnail_url: url || '' }))}
              />
            </div>

            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm">
              <button
                onClick={handleSave}
                disabled={!form.title || !form.video_url || saving}
                className="w-full px-4 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-medium rounded-xl transition-colors shadow-sm shadow-indigo-200 dark:shadow-none"
              >
                {saving ? 'Publishing...' : 'Publish Video'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Behind the Scenes</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Upload behind-the-scenes videos to showcase your craftsmanship.
          </p>
        </div>
        <button
          onClick={() => setIsAdding(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-xl transition-colors shadow-sm shadow-indigo-200 dark:shadow-none"
        >
          <PlusIcon className="w-5 h-5" />
          Add Video
        </button>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="aspect-video bg-gray-100 dark:bg-gray-800 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : videos.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl">
          <FilmIcon className="w-14 h-14 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">No videos uploaded yet</h3>
          <p className="text-gray-500 dark:text-gray-400 mt-2">Upload your first behind-the-scenes video to connect with your customers.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {videos.map((video) => (
            <div key={video.id} className="group bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
              <div className="relative aspect-video bg-black">
                {video.thumbnail_url ? (
                  <img src={video.thumbnail_url} alt={video.title} className="w-full h-full object-cover" />
                ) : (
                  <video src={video.video_url} className="w-full h-full object-cover" preload="metadata" />
                )}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/40">
                    <svg className="w-5 h-5 text-white ml-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                    </svg>
                  </div>
                </div>
              </div>
              <div className="p-4 flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white line-clamp-2 text-sm">{video.title}</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {new Date(video.created_at).toLocaleDateString()}
                  </p>
                </div>
                <button
                  onClick={() => handleDelete(video.id)}
                  disabled={deleteId === video.id}
                  className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-colors shrink-0"
                >
                  <TrashIcon className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
