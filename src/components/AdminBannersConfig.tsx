'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Loader2, UploadCloud, Image as ImageIcon, Info } from 'lucide-react';
import imageCompression from 'browser-image-compression';

export const AdminBannersConfig = () => {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [bannerActive, setBannerActive] = useState(false);
  const [bannerUrl, setBannerUrl] = useState('');
  const [message, setMessage] = useState({ text: '', type: '' });
  const [uploading, setUploading] = useState(false);

  const CONFIG_CODE = 'SYS_BANNER_CONFIG';

  useEffect(() => {
    fetchBannerConfig();
  }, []);

  const fetchBannerConfig = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('coupons')
        .select('*')
        .eq('code', CONFIG_CODE)
        .single();

      if (data) {
        setBannerActive(data.is_active || false);
        const ts = data.discount_value || Date.now();
        setBannerUrl(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/products/sale-banner.png?v=${ts}`);
      }
    } catch (err) {
      console.error('Error fetching banner config', err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (active: boolean) => {
    setBannerActive(active);
    handleSave(active);
  };

  const handleSave = async (active = bannerActive, newTs?: number) => {
    setSaving(true);
    try {
      const { data: existing } = await supabase
        .from('coupons')
        .select('id, discount_value')
        .eq('code', CONFIG_CODE)
        .single();

      const ts = newTs || (existing?.discount_value || Date.now());

      const payload = {
        code: CONFIG_CODE,
        discount_type: 'fixed',
        discount_value: ts,
        is_active: active
      };

      if (existing) {
        await supabase.from('coupons').update(payload).eq('id', existing.id);
      } else {
        await supabase.from('coupons').insert([payload]);
      }
      setMessage({ text: 'Banner settings saved successfully!', type: 'success' });
      setTimeout(() => setMessage({ text: '', type: '' }), 3000);
    } catch (err) {
      console.error(err);
      setMessage({ text: 'Failed to save settings', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    setUploading(true);
    
    try {
      const file = e.target.files[0];
      const options = {
        maxSizeMB: 1,
        maxWidthOrHeight: 1920,
        useWebWorker: true,
      };
      
      const compressedFile = await imageCompression(file, options);
      
      const { error } = await supabase.storage
        .from('products')
        .upload('sale-banner.png', compressedFile, {
          cacheControl: '3600',
          upsert: true,
          contentType: 'image/png'
        });

      if (error) throw error;
      
      const newTs = Date.now();
      setBannerUrl(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/products/sale-banner.png?v=${newTs}`);
      await handleSave(bannerActive, newTs);
      
      setMessage({ text: 'Banner uploaded successfully!', type: 'success' });
      setTimeout(() => setMessage({ text: '', type: '' }), 3000);
    } catch (err) {
      console.error('Error uploading banner:', err);
      setMessage({ text: 'Error uploading banner.', type: 'error' });
    } finally {
      setUploading(false);
    }
  };

  if (loading) return <div className="p-8 text-center"><Loader2 className="h-6 w-6 animate-spin mx-auto text-zinc-400" /></div>;

  return (
    <div className="bg-white rounded-3xl border border-zinc-200 p-8 shadow-sm">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-serif font-bold text-zinc-900 flex items-center gap-2">
            <ImageIcon className="h-6 w-6 text-brand-700" />
            Homepage Sale Banner
          </h2>
          <p className="text-sm text-zinc-500 mt-1">
            Upload a promotional banner to display at the top of the homepage.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm font-semibold text-zinc-700">Display Banner</span>
          <button
            onClick={() => handleToggle(!bannerActive)}
            className={`w-12 h-6 rounded-full transition-colors relative flex items-center ${bannerActive ? 'bg-brand-600' : 'bg-zinc-300'}`}
          >
            <div className={`w-4 h-4 rounded-full bg-white absolute transition-transform ${bannerActive ? 'translate-x-7' : 'translate-x-1'}`} />
          </button>
        </div>
      </div>

      {message.text && (
        <div className={`p-4 rounded-lg mb-6 text-sm font-bold ${message.type === 'success' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
          {message.text}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-4 mb-6">
            <h4 className="flex items-center gap-2 text-sm font-bold text-blue-800 mb-2">
              <Info className="h-4 w-4" /> Recommended Aspect Ratio
            </h4>
            <p className="text-xs text-blue-600 leading-relaxed">
              For best results across all devices, we recommend a <strong>16:9</strong> or <strong>21:9</strong> wide aspect ratio. 
              <br/><br/>
              <strong>Desktop:</strong> 1920 x 600 pixels (or 1920 x 1080)<br/>
              <strong>Mobile:</strong> The banner will automatically scale down. Keep important text near the center.
            </p>
          </div>

          <div className="space-y-4">
            <label className="block text-sm font-bold text-zinc-700">Upload New Banner Image</label>
            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-zinc-300 border-dashed rounded-xl cursor-pointer bg-zinc-50 hover:bg-zinc-100 transition-colors">
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                {uploading ? (
                  <Loader2 className="h-8 w-8 text-zinc-400 animate-spin mb-2" />
                ) : (
                  <UploadCloud className="w-8 h-8 mb-2 text-zinc-400" />
                )}
                <p className="mb-2 text-sm text-zinc-500">
                  <span className="font-semibold">Click to upload</span> or drag and drop
                </p>
                <p className="text-xs text-zinc-500">PNG, JPG or WEBP (Max. 1MB)</p>
              </div>
              <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} disabled={uploading} />
            </label>
          </div>
        </div>

        <div>
          <label className="block text-sm font-bold text-zinc-700 mb-4">Current Banner Preview</label>
          <div className="w-full aspect-[21/9] bg-zinc-100 rounded-xl border border-zinc-200 overflow-hidden flex items-center justify-center relative">
            {bannerUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={bannerUrl} alt="Sale Banner" className="w-full h-full object-cover" />
            ) : (
              <span className="text-zinc-400 text-sm font-medium">No banner uploaded</span>
            )}
            
            {bannerActive && (
              <div className="absolute top-3 right-3 bg-emerald-500 text-white text-[10px] font-bold px-2 py-1 rounded shadow-sm">
                ACTIVE ON HOMEPAGE
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
