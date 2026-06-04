import React, { useState } from 'react';
import MainLayout from '../layouts/MainLayout';
import { CheckCircleIcon, GlobeAltIcon, DocumentArrowDownIcon, TruckIcon, ShieldCheckIcon, UserGroupIcon } from '@heroicons/react/24/outline';
import { supabase } from '../lib/supabaseClient';

const SHIPPING_COUNTRIES = [
  'United States', 'United Kingdom', 'Canada', 'Australia', 'Germany', 'France',
  'Netherlands', 'UAE', 'Saudi Arabia', 'Qatar', 'Singapore', 'Malaysia',
  'South Africa', 'Kenya', 'New Zealand', 'Japan', 'Italy', 'Spain', 'Other'
];

const sanitize = (str) => String(str || '').replace(/<[^>]*>/g, '').replace(/[<>]/g, '').trim();

const PDF_CATALOGS = [
  {
    title: 'Sarees Collection 2024',
    subtitle: '48 premium Banarasi & Kanjivaram sarees',
    size: '8.2 MB',
    pages: '24 pages',
    color: 'from-indigo-500 to-purple-600',
    filename: 'sarees-catalog-2024.pdf',
  },
  {
    title: 'Ethnic Menswear 2024',
    subtitle: 'Kurtas, Sherwanis & Bandhgalas',
    size: '6.5 MB',
    pages: '18 pages',
    color: 'from-amber-500 to-orange-600',
    filename: 'menswear-catalog-2024.pdf',
  },
  {
    title: 'Bridal Collection 2024',
    subtitle: 'Lehengas, Bridal Sarees & Anarkali',
    size: '10.1 MB',
    pages: '32 pages',
    color: 'from-rose-500 to-pink-600',
    filename: 'bridal-catalog-2024.pdf',
  },
];

export default function WholesalePage() {
  const [form, setForm] = useState({
    company_name: '',
    contact_name: '',
    email: '',
    whatsapp_number: '',
    country: '',
    website: '',
    message: '',
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [serverError, setServerError] = useState('');

  const validate = () => {
    const e = {};
    if (!form.company_name.trim()) e.company_name = 'Business name is required.';
    if (!form.contact_name.trim()) e.contact_name = 'Contact name is required.';
    if (!form.email.trim()) {
      e.email = 'Email is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      e.email = 'Please enter a valid email.';
    }
    if (!form.country) e.country = 'Please select your country.';
    if (!form.message.trim() || form.message.trim().length < 20) {
      e.message = 'Please provide at least 20 characters about your business.';
    }
    return e;
  };

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setErrors({});
    setSubmitting(true);
    setServerError('');
    try {
      const { error } = await supabase.from('inquiries').insert({
        name: sanitize(form.contact_name),
        email: sanitize(form.email).toLowerCase(),
        subject: `Wholesale Application — ${sanitize(form.company_name)}`,
        message: sanitize(form.message),
        company_name: sanitize(form.company_name),
        country: sanitize(form.country),
        whatsapp_number: sanitize(form.whatsapp_number),
        inquiry_type: 'wholesale',
        status: 'new',
      });
      if (error) throw error;
      setSubmitted(true);
    } catch (err) {
      setServerError(err.message || 'Failed to submit. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDownload = (filename) => {
    // In production, replace with actual signed Supabase storage URL
    const url = `/catalogs/${filename}`;
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.target = '_blank';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const whatsappUrl = `https://wa.me/919876543210?text=${encodeURIComponent('Hi! I am a retailer interested in wholesale pricing for your ethnic wear collections.')}`;

  return (
    <MainLayout
      title="Wholesale Partnership — Gupta International Export"
      description="Partner with Gupta International for premium Indian ethnic wear wholesale. Exclusive collections, competitive pricing, global shipping to 50+ countries."
      keywords="wholesale Indian ethnic wear, bulk ethnic clothing export, saree wholesale, kurta wholesale supplier"
    >
      <div className="max-w-7xl mx-auto py-12 px-4">
        
        {/* Hero Section */}
        <div className="relative rounded-3xl overflow-hidden mb-16">
          <img
            src="https://images.unsplash.com/photo-1594912952549-fb93be3d5fc4?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80"
            alt="Wholesale Partnership"
            className="w-full h-72 object-cover object-center"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-950/90 via-indigo-900/70 to-transparent flex items-center px-10 md:px-16">
            <div>
              <span className="text-amber-300 text-xs font-bold uppercase tracking-widest block mb-2">Global Export Partner</span>
              <h1 className="text-white text-4xl md:text-5xl font-extrabold leading-tight mb-4 max-w-xl">
                Partner With Gupta International
              </h1>
              <p className="text-indigo-200 text-base md:text-lg max-w-lg mb-6">
                Bring authentic Indian craftsmanship to your boutique. Shipping to 50+ countries with dedicated wholesale support.
              </p>
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white font-semibold px-6 py-3 rounded-full transition-all shadow-lg shadow-green-500/30"
              >
                <svg viewBox="0 0 24 24" className="w-5 h-5 fill-white" xmlns="http://www.w3.org/2000/svg">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                Chat on WhatsApp
              </a>
            </div>
          </div>
        </div>

        {/* Benefits Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-5 mb-16">
          {[
            { icon: GlobeAltIcon, title: 'Ships to 50+ Countries', sub: 'DHL, FedEx & Indian Post' },
            { icon: TruckIcon, title: 'Flexible MOQ', sub: 'Starting from 10 pieces' },
            { icon: UserGroupIcon, title: 'Dedicated Account Manager', sub: 'Personal support team' },
            { icon: ShieldCheckIcon, title: 'Quality Guaranteed', sub: '100% artisan-verified' },
          ].map(({ icon: Icon, title, sub }) => (
            <div key={title} className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-100 dark:border-gray-800 shadow-sm text-center">
              <div className="w-10 h-10 mx-auto mb-3 bg-indigo-50 dark:bg-indigo-500/10 rounded-xl flex items-center justify-center">
                <Icon className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              </div>
              <p className="font-bold text-sm text-gray-900 dark:text-white">{title}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{sub}</p>
            </div>
          ))}
        </div>

        {/* PDF Catalogs */}
        <div className="mb-16">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-2">Download Product Catalogs</h2>
            <p className="text-gray-500 dark:text-gray-400">Browse our full range offline. All catalogs are updated for the 2024–25 season.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {PDF_CATALOGS.map(cat => (
              <div key={cat.filename} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden group hover:shadow-lg transition-all">
                <div className={`h-36 bg-gradient-to-br ${cat.color} flex items-center justify-center`}>
                  <DocumentArrowDownIcon className="w-14 h-14 text-white/80 group-hover:text-white transition-colors" />
                </div>
                <div className="p-5">
                  <h3 className="font-bold text-gray-900 dark:text-white mb-1">{cat.title}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">{cat.subtitle}</p>
                  <div className="flex items-center gap-3 text-xs text-gray-400 mb-4">
                    <span>PDF • {cat.size}</span>
                    <span>•</span>
                    <span>{cat.pages}</span>
                  </div>
                  <button
                    onClick={() => handleDownload(cat.filename)}
                    className={`w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-gradient-to-r ${cat.color} text-white text-sm font-semibold rounded-xl hover:opacity-90 transition-all cursor-pointer`}
                  >
                    <DocumentArrowDownIcon className="w-4 h-4" />
                    Download Catalog
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Wholesale Application Form */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          {/* Left: Info */}
          <div>
            <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-4">Apply for Wholesale</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-8 leading-relaxed">
              Fill out the application form and our wholesale team will reach out within 48 hours with pricing tiers, minimum order quantities, and an exclusive catalog.
            </p>
            <ul className="space-y-4">
              {[
                'Exclusive pricing for verified retailers',
                'Access to unreleased & limited collections',
                'Global shipping with full tracking',
                'Net 30 payment terms for established partners',
                'Custom labeling & private label options',
              ].map(item => (
                <li key={item} className="flex items-start gap-3">
                  <CheckCircleIcon className="w-5 h-5 text-indigo-600 dark:text-indigo-400 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700 dark:text-gray-300 text-sm">{item}</span>
                </li>
              ))}
            </ul>

            {/* International Shipping destinations */}
            <div className="mt-8 bg-indigo-50 dark:bg-indigo-500/10 rounded-2xl p-5 border border-indigo-100 dark:border-indigo-500/20">
              <h3 className="font-bold text-indigo-800 dark:text-indigo-300 mb-3 flex items-center gap-2">
                <GlobeAltIcon className="w-5 h-5" /> We Ship To
              </h3>
              <div className="flex flex-wrap gap-2">
                {['USA', 'UK', 'Canada', 'Australia', 'UAE', 'Germany', 'France', 'Singapore', 'South Africa', '+40 more'].map(c => (
                  <span key={c} className="bg-white dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 text-xs font-medium px-2.5 py-1 rounded-lg border border-indigo-100 dark:border-indigo-500/20">
                    {c}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Form */}
          <div className="bg-white dark:bg-gray-900 rounded-3xl p-8 border border-gray-100 dark:border-gray-800 shadow-sm">
            {submitted ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="w-16 h-16 bg-green-100 dark:bg-green-500/10 rounded-full flex items-center justify-center mb-5">
                  <CheckCircleIcon className="w-9 h-9 text-green-600 dark:text-green-400" />
                </div>
                <h3 className="text-2xl font-extrabold text-gray-900 dark:text-white mb-2">Application Submitted!</h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm max-w-xs">
                  Our wholesale team will contact you within 48 hours. Check your inbox — including spam folder!
                </p>
              </div>
            ) : (
              <>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Wholesale Application</h3>

                {serverError && (
                  <div className="mb-5 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400 rounded-xl px-4 py-3 text-sm">
                    {serverError}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Business / Company Name *</label>
                    <input
                      type="text" value={form.company_name} onChange={e => handleChange('company_name', e.target.value)}
                      maxLength={200}
                      className={`w-full px-4 py-2.5 rounded-xl border bg-gray-50 dark:bg-gray-800 dark:text-white outline-none focus:ring-2 focus:ring-indigo-600 transition-all ${errors.company_name ? 'border-red-400' : 'border-gray-200 dark:border-gray-700'}`}
                      placeholder="Your Store or Company Name"
                    />
                    {errors.company_name && <p className="text-xs text-red-500 mt-1">{errors.company_name}</p>}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Contact Name *</label>
                      <input
                        type="text" value={form.contact_name} onChange={e => handleChange('contact_name', e.target.value)}
                        maxLength={100}
                        className={`w-full px-4 py-2.5 rounded-xl border bg-gray-50 dark:bg-gray-800 dark:text-white outline-none focus:ring-2 focus:ring-indigo-600 transition-all ${errors.contact_name ? 'border-red-400' : 'border-gray-200 dark:border-gray-700'}`}
                        placeholder="Your Name"
                      />
                      {errors.contact_name && <p className="text-xs text-red-500 mt-1">{errors.contact_name}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Email *</label>
                      <input
                        type="email" value={form.email} onChange={e => handleChange('email', e.target.value)}
                        maxLength={255}
                        className={`w-full px-4 py-2.5 rounded-xl border bg-gray-50 dark:bg-gray-800 dark:text-white outline-none focus:ring-2 focus:ring-indigo-600 transition-all ${errors.email ? 'border-red-400' : 'border-gray-200 dark:border-gray-700'}`}
                        placeholder="email@store.com"
                      />
                      {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">WhatsApp Number</label>
                      <input
                        type="tel" value={form.whatsapp_number} onChange={e => handleChange('whatsapp_number', e.target.value)}
                        maxLength={20}
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 dark:text-white outline-none focus:ring-2 focus:ring-indigo-600 transition-all"
                        placeholder="+1 555 000 0000"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Country / Region *</label>
                      <select
                        value={form.country} onChange={e => handleChange('country', e.target.value)}
                        className={`w-full px-4 py-2.5 rounded-xl border bg-gray-50 dark:bg-gray-800 dark:text-white outline-none focus:ring-2 focus:ring-indigo-600 transition-all ${errors.country ? 'border-red-400' : 'border-gray-200 dark:border-gray-700'}`}
                      >
                        <option value="" disabled>Select country...</option>
                        {SHIPPING_COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                      {errors.country && <p className="text-xs text-red-500 mt-1">{errors.country}</p>}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Website / Social Handle</label>
                    <input
                      type="url" value={form.website} onChange={e => handleChange('website', e.target.value)}
                      maxLength={300}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 dark:text-white outline-none focus:ring-2 focus:ring-indigo-600 transition-all"
                      placeholder="https://yourstore.com or @handle"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Tell Us About Your Business *</label>
                    <textarea
                      rows={4} value={form.message} onChange={e => handleChange('message', e.target.value)}
                      maxLength={2000}
                      className={`w-full px-4 py-2.5 rounded-xl border bg-gray-50 dark:bg-gray-800 dark:text-white outline-none focus:ring-2 focus:ring-indigo-600 transition-all resize-none ${errors.message ? 'border-red-400' : 'border-gray-200 dark:border-gray-700'}`}
                      placeholder="Describe your business, what you sell, your target market, estimated monthly order volume..."
                    />
                    {errors.message && <p className="text-xs text-red-500 mt-1">{errors.message}</p>}
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full flex items-center justify-center gap-2 py-3.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white font-semibold rounded-xl transition-all shadow-md shadow-indigo-200 dark:shadow-none cursor-pointer"
                  >
                    {submitting ? (
                      <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      'Submit Wholesale Application'
                    )}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
