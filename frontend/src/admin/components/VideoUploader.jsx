import React, { useRef, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { CloudArrowUpIcon, VideoCameraIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';

export default function VideoUploader({ bucketName = 'videos', onUploadComplete }) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [uploadedUrl, setUploadedUrl] = useState(null);
  const [preview, setPreview] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef();

  const handleFile = async (file) => {
    if (!file) return;
    if (!file.type.startsWith('video/')) {
      setError('Please upload a valid video file (MP4, WebM, MOV).');
      return;
    }
    if (file.size > 200 * 1024 * 1024) {
      setError('Video must be under 200MB.');
      return;
    }

    setError(null);
    setUploading(true);
    const localPreview = URL.createObjectURL(file);
    setPreview(localPreview);

    try {
      const ext = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from(bucketName)
        .upload(fileName, file, { cacheControl: '3600', upsert: false });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from(bucketName).getPublicUrl(fileName);
      setUploadedUrl(data.publicUrl);
      onUploadComplete && onUploadComplete(data.publicUrl);
    } catch (err) {
      setError(err.message || 'Upload failed. Please try again.');
      setPreview(null);
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    handleFile(file);
  };

  const reset = () => {
    setUploadedUrl(null);
    setPreview(null);
    setError(null);
    onUploadComplete && onUploadComplete(null);
  };

  if (uploadedUrl) {
    return (
      <div className="relative rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
        <video src={uploadedUrl} controls className="w-full max-h-64 object-contain bg-black" />
        <div className="absolute top-3 right-3 flex gap-2">
          <div className="flex items-center gap-1 bg-green-500 text-white text-xs font-medium px-2 py-1 rounded-full shadow">
            <CheckCircleIcon className="w-4 h-4" /> Uploaded
          </div>
          <button onClick={reset} className="bg-red-500 text-white p-1 rounded-full shadow hover:bg-red-600">
            <XCircleIcon className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
      onDragLeave={() => setDragOver(false)}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
      className={`relative cursor-pointer flex flex-col items-center justify-center gap-3 border-2 border-dashed rounded-2xl p-8 transition-all ${
        dragOver
          ? 'border-indigo-400 bg-indigo-50 dark:bg-indigo-500/10'
          : 'border-gray-300 dark:border-gray-600 hover:border-indigo-400 hover:bg-gray-50 dark:hover:bg-gray-800/50'
      }`}
    >
      <input
        ref={inputRef}
        type="file"
        accept="video/mp4,video/webm,video/quicktime,video/*"
        className="hidden"
        onChange={(e) => handleFile(e.target.files[0])}
      />

      {uploading ? (
        <>
          <div className="w-12 h-12 rounded-full border-4 border-indigo-600 border-t-transparent animate-spin" />
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Uploading video...</p>
        </>
      ) : preview ? (
        <video src={preview} className="w-full max-h-48 rounded-xl object-contain bg-black" />
      ) : (
        <>
          <div className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center">
            <VideoCameraIcon className="w-7 h-7 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div className="text-center">
            <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              Drop video here or <span className="text-indigo-600 dark:text-indigo-400">click to upload</span>
            </p>
            <p className="text-xs text-gray-500 mt-1">MP4, WebM, MOV — Max 200MB</p>
          </div>
          <div className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-4 py-2 rounded-xl transition-colors">
            <CloudArrowUpIcon className="w-4 h-4" />
            Choose Video
          </div>
        </>
      )}

      {error && (
        <p className="text-xs text-red-600 dark:text-red-400 mt-1">{error}</p>
      )}
    </div>
  );
}
