import React, { useState } from 'react';
import MainLayout from '../layouts/MainLayout';
import { EnvelopeIcon, PhoneIcon, MapPinIcon, PaperAirplaneIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { supabase } from '../lib/supabaseClient';

// Sanitize plain text — strip HTML
const sanitize = (str) => String(str || '').replace(/<[^>]*>/g, '').replace(/[<>]/g, '').trim();

export default function ContactPage() {
  const [form, setForm] = useState({ first_name: '', last_name: '', email: '', subject: '', message: '' });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [serverError, setServerError] = useState('');

  const validate = () => {
    const newErrors = {};
    if (!form.first_name.trim()) newErrors.first_name = 'First name is required.';
    if (!form.last_name.trim()) newErrors.last_name = 'Last name is required.';
    if (!form.email.trim()) {
      newErrors.email = 'Email is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      newErrors.email = 'Please enter a valid email address.';
    }
    if (!form.message.trim()) {
      newErrors.message = 'Message is required.';
    } else if (form.message.trim().length < 20) {
      newErrors.message = 'Message must be at least 20 characters.';
    }
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    setErrors({});
    setSubmitting(true);
    setServerError('');

    try {
      const { error } = await supabase.from('inquiries').insert({
        name: sanitize(`${form.first_name} ${form.last_name}`),
        email: sanitize(form.email).toLowerCase(),
        subject: sanitize(form.subject) || 'General Inquiry',
        message: sanitize(form.message),
        inquiry_type: 'contact',
        status: 'new',
      });

      if (error) throw error;
      setSubmitted(true);
      setForm({ first_name: '', last_name: '', email: '', subject: '', message: '' });
    } catch (err) {
      setServerError(err.message || 'Failed to send message. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
  };

  const whatsappUrl = `https://wa.me/919876543210?text=${encodeURIComponent('Hi! I would like to get in touch regarding your collections.')}`;

  return (
    <MainLayout 
      title="Contact Gupta International — Get in Touch" 
      description="Reach out to Gupta International for wholesale inquiries, product questions, or support. We respond within 24 hours."
    >
      <div className="max-w-6xl mx-auto py-16 px-4">
        <div className="text-center mb-14">
          <span className="text-xs uppercase tracking-widest text-indigo-600 dark:text-indigo-400 font-bold">We're Here To Help</span>
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white mt-2 mb-4">Get in Touch</h1>
          <p className="text-lg text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
            Our team is here for styling advice, wholesale queries, or any questions about your order. We respond within 24 hours.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Contact Info Sidebar */}
          <div className="lg:col-span-1 space-y-5">
            {[
              {
                icon: EnvelopeIcon,
                title: 'Email Us',
                lines: ['support@guptainternational.com', 'wholesale@guptainternational.com'],
                color: 'bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400',
              },
              {
                icon: PhoneIcon,
                title: 'Call Us',
                lines: ['+91 98765 43210', 'Mon–Sat, 9am – 7pm IST'],
                color: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400',
              },
              {
                icon: MapPinIcon,
                title: 'Our Studio',
                lines: ['Fashion Hub Complex,', 'Surat, Gujarat 395002, India'],
                color: 'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400',
              },
            ].map(({ icon: Icon, title, lines, color }) => (
              <div key={title} className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-100 dark:border-gray-800 shadow-sm flex items-start gap-4">
                <div className={`p-3 rounded-xl ${color} flex-shrink-0`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 dark:text-white mb-1">{title}</h3>
                  {lines.map(l => <p key={l} className="text-sm text-gray-600 dark:text-gray-400">{l}</p>)}
                </div>
              </div>
            ))}

            {/* WhatsApp CTA */}
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-4 bg-green-500 hover:bg-green-600 text-white rounded-2xl p-5 transition-all shadow-lg shadow-green-500/25 cursor-pointer"
            >
              <div className="w-11 h-11 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
                <svg viewBox="0 0 24 24" className="w-6 h-6 fill-white" xmlns="http://www.w3.org/2000/svg">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
              </div>
              <div>
                <p className="font-bold text-sm">Chat on WhatsApp</p>
                <p className="text-xs text-green-100">Usually replies within minutes</p>
              </div>
            </a>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2 bg-white dark:bg-gray-900 rounded-3xl p-8 lg:p-10 border border-gray-100 dark:border-gray-800 shadow-sm">
            {submitted ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="w-16 h-16 bg-green-100 dark:bg-green-500/10 rounded-full flex items-center justify-center mb-5">
                  <CheckCircleIcon className="w-9 h-9 text-green-600 dark:text-green-400" />
                </div>
                <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white mb-2">Message Sent!</h2>
                <p className="text-gray-500 dark:text-gray-400 max-w-sm">
                  Thank you for reaching out. Our team will respond to your inquiry within 24 hours.
                </p>
                <button
                  onClick={() => setSubmitted(false)}
                  className="mt-8 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl transition-colors text-sm"
                >
                  Send Another Message
                </button>
              </div>
            ) : (
              <>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-7">Send Us a Message</h2>
                
                {serverError && (
                  <div className="mb-5 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400 rounded-xl px-4 py-3 text-sm">
                    {serverError}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5" noValidate>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">First Name *</label>
                      <input
                        type="text"
                        value={form.first_name}
                        onChange={e => handleChange('first_name', e.target.value)}
                        maxLength={100}
                        className={`w-full px-4 py-3 rounded-xl border bg-gray-50 dark:bg-gray-800 dark:text-white outline-none focus:ring-2 focus:ring-indigo-600 transition-all ${errors.first_name ? 'border-red-400 dark:border-red-500' : 'border-gray-200 dark:border-gray-700'}`}
                        placeholder="Priya"
                      />
                      {errors.first_name && <p className="text-xs text-red-500 mt-1">{errors.first_name}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Last Name *</label>
                      <input
                        type="text"
                        value={form.last_name}
                        onChange={e => handleChange('last_name', e.target.value)}
                        maxLength={100}
                        className={`w-full px-4 py-3 rounded-xl border bg-gray-50 dark:bg-gray-800 dark:text-white outline-none focus:ring-2 focus:ring-indigo-600 transition-all ${errors.last_name ? 'border-red-400' : 'border-gray-200 dark:border-gray-700'}`}
                        placeholder="Sharma"
                      />
                      {errors.last_name && <p className="text-xs text-red-500 mt-1">{errors.last_name}</p>}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Email Address *</label>
                    <input
                      type="email"
                      value={form.email}
                      onChange={e => handleChange('email', e.target.value)}
                      maxLength={255}
                      className={`w-full px-4 py-3 rounded-xl border bg-gray-50 dark:bg-gray-800 dark:text-white outline-none focus:ring-2 focus:ring-indigo-600 transition-all ${errors.email ? 'border-red-400' : 'border-gray-200 dark:border-gray-700'}`}
                      placeholder="priya@example.com"
                    />
                    {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Subject</label>
                    <input
                      type="text"
                      value={form.subject}
                      onChange={e => handleChange('subject', e.target.value)}
                      maxLength={200}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 dark:text-white outline-none focus:ring-2 focus:ring-indigo-600 transition-all"
                      placeholder="Order inquiry, styling advice, wholesale..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Your Message *</label>
                    <textarea
                      rows={5}
                      value={form.message}
                      onChange={e => handleChange('message', e.target.value)}
                      maxLength={3000}
                      className={`w-full px-4 py-3 rounded-xl border bg-gray-50 dark:bg-gray-800 dark:text-white outline-none focus:ring-2 focus:ring-indigo-600 transition-all resize-none ${errors.message ? 'border-red-400' : 'border-gray-200 dark:border-gray-700'}`}
                      placeholder="Tell us how we can help you..."
                    />
                    <div className="flex items-center justify-between mt-1">
                      {errors.message ? <p className="text-xs text-red-500">{errors.message}</p> : <span />}
                      <p className="text-xs text-gray-400">{form.message.length}/3000</p>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full flex items-center justify-center gap-2 py-3.5 px-6 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white font-semibold rounded-xl transition-all shadow-md shadow-indigo-200 dark:shadow-none cursor-pointer"
                  >
                    {submitting ? (
                      <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <PaperAirplaneIcon className="w-4 h-4" />
                        Send Message
                      </>
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
