import React, { useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { PhotoIcon, ArrowUpTrayIcon, XMarkIcon } from '@heroicons/react/24/outline';

export default function ImageUploader({ bucketName, onUploadComplete, currentImage, resetAfterUpload = false }) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(currentImage || null);

  const handleFileChange = async (e) => {
    try {
      setError(null);
      const file = e.target.files[0];
      if (!file) return;

      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      setUploading(true);

      // Create a local preview immediately for better UX
      const objectUrl = URL.createObjectURL(file);
      setPreviewUrl(objectUrl);

      // Upload to Supabase Storage
      const { error: uploadError, data } = await supabase.storage
        .from(bucketName)
        .upload(filePath, file, { cacheControl: '3600', upsert: false });

      if (uploadError) {
        throw uploadError;
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from(bucketName)
        .getPublicUrl(filePath);

      // Pass the public URL back to the parent component
      if (onUploadComplete) {
        onUploadComplete(publicUrl);
      }

      if (resetAfterUpload) {
        setPreviewUrl(null);
      }
    } catch (err) {
      console.error('Error uploading image:', err);
      setError(err.message || 'Failed to upload image. Make sure you are an admin.');
      setPreviewUrl(currentImage || null); // Revert preview on failure
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = () => {
    setPreviewUrl(null);
    if (onUploadComplete) onUploadComplete('');
  };

  return (
    <div className="w-full">
      {previewUrl ? (
        <div className="relative group rounded-2xl overflow-hidden bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 aspect-video flex items-center justify-center">
          <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gray-900/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4 backdrop-blur-sm">
            <label className="cursor-pointer p-3 bg-white text-gray-900 rounded-full hover:bg-gray-100 transition-colors shadow-lg">
              <ArrowUpTrayIcon className="w-5 h-5" />
              <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" disabled={uploading} />
            </label>
            <button type="button" onClick={handleRemove} className="p-3 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors shadow-lg">
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>
          {uploading && (
            <div className="absolute inset-0 bg-white/80 dark:bg-gray-900/80 flex items-center justify-center backdrop-blur-sm">
              <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}
        </div>
      ) : (
        <label className={`relative cursor-pointer rounded-2xl flex flex-col items-center justify-center gap-2 aspect-video border-2 border-dashed transition-colors ${
          error ? 'border-red-400 bg-red-50 dark:border-red-500/50 dark:bg-red-500/10' : 
          'border-gray-300 dark:border-gray-700 hover:border-indigo-500 hover:bg-indigo-50 dark:hover:border-indigo-500 dark:hover:bg-indigo-500/10 bg-gray-50 dark:bg-gray-800/50'
        }`}>
          <PhotoIcon className={`w-10 h-10 mb-1 ${error ? 'text-red-400' : 'text-gray-400'}`} />
          <span className={`font-medium ${error ? 'text-red-600 dark:text-red-400' : 'text-gray-600 dark:text-gray-400'}`}>
            {uploading ? 'Uploading...' : 'Click or drag image to upload'}
          </span>
          <span className="text-xs text-gray-500">PNG, JPG, GIF up to 5MB</span>
          <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" disabled={uploading} />
          {error && <p className="absolute bottom-2 text-xs text-red-600 dark:text-red-400 text-center px-4">{error}</p>}
        </label>
      )}
    </div>
  );
}
