import React, { useState, useEffect } from 'react';
import { Cog6ToothIcon, CheckIcon } from '@heroicons/react/24/outline';
import { supabase } from '../../lib/supabaseClient';

const SETTINGS_CONFIG = [
  {
    group: 'Store Information',
    fields: [
      { key: 'store_name', label: 'Store Name', type: 'text', placeholder: 'Your Store Name' },
      { key: 'store_tagline', label: 'Tagline', type: 'text', placeholder: 'e.g. Handcrafted with love' },
      { key: 'contact_email', label: 'Contact Email', type: 'email', placeholder: 'hello@yourstore.com' },
      { key: 'contact_phone', label: 'Contact Phone', type: 'text', placeholder: '+91 98765 43210' },
      { key: 'store_address', label: 'Store Address', type: 'textarea', placeholder: '123 Main Street, City, State, India' },
    ],
  },
  {
    group: 'Social Media',
    fields: [
      { key: 'instagram_url', label: 'Instagram URL', type: 'text', placeholder: 'https://instagram.com/yourstore' },
      { key: 'facebook_url', label: 'Facebook URL', type: 'text', placeholder: 'https://facebook.com/yourstore' },
      { key: 'youtube_url', label: 'YouTube URL', type: 'text', placeholder: 'https://youtube.com/@yourstore' },
      { key: 'whatsapp_number', label: 'WhatsApp Number', type: 'text', placeholder: '+91 98765 43210' },
    ],
  },
  {
    group: 'Store Policies',
    fields: [
      { key: 'return_policy', label: 'Return Policy (days)', type: 'number', placeholder: '7' },
      { key: 'shipping_days', label: 'Estimated Shipping (days)', type: 'text', placeholder: '5-7' },
      { key: 'free_shipping_threshold', label: 'Free Shipping Above (₹)', type: 'number', placeholder: '999' },
    ],
  },
  {
    group: 'Banners & Notices',
    fields: [
      { key: 'announcement_banner', label: 'Announcement Banner Text', type: 'text', placeholder: 'FREE shipping on orders above ₹999!' },
      { key: 'maintenance_mode', label: 'Maintenance Mode', type: 'toggle' },
    ],
  },
];

export default function SettingsAdmin() {
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      setLoading(true);
      const { data } = await supabase.from('site_settings').select('*');
      if (data) {
        const map = {};
        data.forEach(s => { map[s.key] = s.value?.v ?? s.value; });
        setSettings(map);
      }
      setLoading(false);
    };
    fetchSettings();
  }, []);

  const handleChange = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    const upserts = Object.entries(settings).map(([key, value]) => ({
      key,
      value: { v: value },
      updated_at: new Date().toISOString()
    }));
    const { error } = await supabase.from('site_settings').upsert(upserts, { onConflict: 'key' });
    setSaving(false);
    if (!error) {
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } else {
      alert('Failed to save: ' + error.message);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-gray-200 dark:bg-gray-800 rounded-xl animate-pulse" />
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-40 bg-gray-100 dark:bg-gray-800 rounded-2xl animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Settings</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Manage your store-wide settings and configuration.</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className={`inline-flex items-center gap-2 px-5 py-2.5 font-medium rounded-xl transition-all ${
            saved
              ? 'bg-green-600 text-white'
              : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm shadow-indigo-200 dark:shadow-none'
          } disabled:opacity-50`}
        >
          {saved ? (
            <><CheckIcon className="w-5 h-5" /> Saved!</>
          ) : saving ? (
            'Saving...'
          ) : (
            <><Cog6ToothIcon className="w-5 h-5" /> Save All Settings</>
          )}
        </button>
      </div>

      {/* Settings Groups */}
      {SETTINGS_CONFIG.map((group) => (
        <div key={group.group} className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-5">{group.group}</h2>
          <div className="space-y-4">
            {group.fields.map((field) => (
              <div key={field.key}>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {field.label}
                </label>
                {field.type === 'toggle' ? (
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={!!settings[field.key]}
                      onChange={e => handleChange(field.key, e.target.checked)}
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-indigo-300 dark:peer-focus:ring-indigo-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-indigo-600"></div>
                    <span className="ml-3 text-sm text-gray-600 dark:text-gray-400">
                      {settings[field.key] ? 'Enabled' : 'Disabled'}
                    </span>
                  </label>
                ) : field.type === 'textarea' ? (
                  <textarea
                    rows={3}
                    value={settings[field.key] || ''}
                    onChange={e => handleChange(field.key, e.target.value)}
                    placeholder={field.placeholder}
                    className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-600 dark:text-white outline-none text-sm"
                  />
                ) : (
                  <input
                    type={field.type}
                    value={settings[field.key] || ''}
                    onChange={e => handleChange(field.key, e.target.value)}
                    placeholder={field.placeholder}
                    className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-600 dark:text-white outline-none text-sm"
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
