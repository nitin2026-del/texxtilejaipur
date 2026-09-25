'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Loader2, UploadCloud, X, Plus } from 'lucide-react';
import imageCompression from 'browser-image-compression';

export const AdminFreeGiftsConfig = () => {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [active, setActive] = useState(false);
  const [images, setImages] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);

  const CONFIG_CODE = 'SYS_FREE_RING_IMAGES';

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    setLoading(true);
    try {
      const { data } = await supabase
        .from('site_settings')
        .select('*')
        .eq('key', CONFIG_CODE)
        .single();

      if (data && data.value) {
        setActive(data.value.is_active || false);
        setImages(data.value.images || []);
      }
    } catch (err) {
      console.error('Error fetching free gift config', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (newActive = active, newImages = images) => {
    setSaving(true);
    try {
      const { data: existing } = await supabase
        .from('site_settings')
        .select('key')
        .eq('key', CONFIG_CODE)
        .single();

      const payload = {
        key: CONFIG_CODE,
        value: {
          is_active: newActive,
          images: newImages
        }
      };

      if (existing) {
        await supabase.from('site_settings').update(payload).eq('key', CONFIG_CODE);
      } else {
        await supabase.from('site_settings').insert([payload]);
      }
    } catch (err) {
      console.error('Error saving config', err);
    } finally {
      setSaving(false);
    }
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    try {
      const newUrls: string[] = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const compressedFile = await imageCompression(file, {
          maxSizeMB: 0.5,
          maxWidthOrHeight: 800,
          useWebWorker: true
        });

        const fileName = `free-rings/ring-${Date.now()}-${i}.jpg`;
        const { error } = await supabase.storage
          .from('products')
          .upload(fileName, compressedFile, { contentType: file.type });

        if (!error) {
          const url = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/products/${fileName}`;
          newUrls.push(url);
        }
      }

      const updatedImages = [...images, ...newUrls];
      setImages(updatedImages);
      await handleSave(active, updatedImages);
    } catch (err) {
      console.error('Upload failed', err);
    } finally {
      setUploading(false);
    }
  };

  const removeImage = async (indexToRemove: number) => {
    const updatedImages = images.filter((_, idx) => idx !== indexToRemove);
    setImages(updatedImages);
    await handleSave(active, updatedImages);
  };

  if (loading) return <div className="p-8 flex justify-center"><Loader2 className="animate-spin text-zinc-400" /></div>;

  return (
    <div className="glass-card p-6 rounded-3xl border border-zinc-200">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold font-serif text-zinc-900">Free Gift Rings (Overlay)</h2>
          <p className="text-sm text-zinc-500 mt-1">Upload 20-30 ring images here. These will auto-cycle on product pages to offer a free ring with every purchase.</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm font-semibold text-zinc-700">{active ? 'Active' : 'Disabled'}</span>
          <button 
            onClick={() => { setActive(!active); handleSave(!active, images); }}
            className={`w-12 h-6 rounded-full transition-colors relative ${active ? 'bg-emerald-500' : 'bg-zinc-300'}`}
          >
            <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${active ? 'left-7' : 'left-1'}`} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-6">
        {images.map((url, idx) => (
          <div key={idx} className="relative group aspect-square rounded-xl overflow-hidden border border-zinc-200 bg-zinc-50">
            <img src={url} alt="Ring" className="w-full h-full object-cover" />
            <button 
              onClick={() => removeImage(idx)}
              className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        ))}

        <label className="aspect-square rounded-xl border-2 border-dashed border-zinc-300 flex flex-col items-center justify-center text-zinc-500 hover:bg-zinc-50 hover:text-brand-600 transition-colors cursor-pointer">
          {uploading ? (
            <Loader2 className="w-6 h-6 animate-spin" />
          ) : (
            <>
              <Plus className="w-8 h-8 mb-2" />
              <span className="text-xs font-semibold">Add Rings</span>
              <input type="file" multiple accept="image/*" className="hidden" onChange={handleUpload} disabled={uploading} />
            </>
          )}
        </label>
      </div>
      
      {saving && <p className="text-xs text-brand-600 animate-pulse">Saving changes...</p>}
    </div>
  );
};
