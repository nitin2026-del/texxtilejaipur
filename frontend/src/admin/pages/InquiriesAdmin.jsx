import React, { useState, useEffect } from 'react';
import { MagnifyingGlassIcon, InboxIcon, CheckIcon, TrashIcon } from '@heroicons/react/24/outline';
import { supabase } from '../../lib/supabaseClient';

const STATUS_STYLES = {
  new: 'bg-amber-100 text-amber-800 dark:bg-amber-500/10 dark:text-amber-400',
  read: 'bg-blue-100 text-blue-800 dark:bg-blue-500/10 dark:text-blue-400',
  resolved: 'bg-green-100 text-green-800 dark:bg-green-500/10 dark:text-green-400',
};

export default function InquiriesAdmin() {
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selected, setSelected] = useState(null);

  const fetchInquiries = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('inquiries')
      .select('*')
      .order('created_at', { ascending: false });
    if (data) setInquiries(data);
    setLoading(false);
  };

  useEffect(() => { fetchInquiries(); }, []);

  const handleMarkRead = async (id) => {
    await supabase.from('inquiries').update({ status: 'read' }).eq('id', id);
    setInquiries(prev => prev.map(i => i.id === id ? { ...i, status: 'read' } : i));
  };

  const handleMarkResolved = async (id) => {
    await supabase.from('inquiries').update({ status: 'resolved' }).eq('id', id);
    setInquiries(prev => prev.map(i => i.id === id ? { ...i, status: 'resolved' } : i));
    if (selected?.id === id) setSelected(prev => ({ ...prev, status: 'resolved' }));
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this inquiry?')) return;
    await supabase.from('inquiries').delete().eq('id', id);
    setInquiries(prev => prev.filter(i => i.id !== id));
    if (selected?.id === id) setSelected(null);
  };

  const openDetail = async (inquiry) => {
    setSelected(inquiry);
    if (inquiry.status === 'new') await handleMarkRead(inquiry.id);
  };

  const filtered = inquiries
    .filter(i => statusFilter === 'all' || i.status === statusFilter)
    .filter(i => {
      const q = searchQuery.toLowerCase();
      return (i.name || '').toLowerCase().includes(q) ||
        (i.email || '').toLowerCase().includes(q) ||
        (i.subject || '').toLowerCase().includes(q);
    });

  const unreadCount = inquiries.filter(i => i.status === 'new').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Inquiries</h1>
            {unreadCount > 0 && (
              <span className="px-2.5 py-0.5 bg-red-500 text-white text-xs font-bold rounded-full">{unreadCount} new</span>
            )}
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Manage contact form submissions and customer messages.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: List */}
        <div className="space-y-4">
          {/* Toolbar */}
          <div className="space-y-3">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl text-sm focus:ring-2 focus:ring-indigo-600 dark:text-white"
              />
            </div>
            <div className="flex gap-2">
              {['all', 'new', 'read', 'resolved'].map(s => (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  className={`px-3 py-1 text-xs font-medium rounded-lg capitalize transition-colors ${
                    statusFilter === s
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* List */}
          <div className="space-y-2">
            {loading ? (
              [...Array(4)].map((_, i) => (
                <div key={i} className="h-20 bg-gray-100 dark:bg-gray-800 rounded-2xl animate-pulse" />
              ))
            ) : filtered.length === 0 ? (
              <div className="text-center py-12 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl">
                <InboxIcon className="w-10 h-10 mx-auto text-gray-300 dark:text-gray-600 mb-2" />
                <p className="text-sm text-gray-500 dark:text-gray-400">No inquiries found.</p>
              </div>
            ) : (
              filtered.map((inquiry) => (
                <button
                  key={inquiry.id}
                  onClick={() => openDetail(inquiry)}
                  className={`w-full text-left p-4 rounded-2xl border transition-all ${
                    selected?.id === inquiry.id
                      ? 'border-indigo-300 dark:border-indigo-700 bg-indigo-50 dark:bg-indigo-500/10'
                      : 'border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 hover:border-indigo-200 dark:hover:border-gray-700'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        {inquiry.status === 'new' && (
                          <span className="w-2 h-2 rounded-full bg-red-500 shrink-0" />
                        )}
                        <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{inquiry.name || 'Anonymous'}</p>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">{inquiry.subject || inquiry.message?.slice(0, 40)}</p>
                    </div>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium shrink-0 ${STATUS_STYLES[inquiry.status] || ''}`}>
                      {inquiry.status}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
                    {new Date(inquiry.created_at).toLocaleDateString()}
                  </p>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Right: Detail */}
        <div className="lg:col-span-2">
          {selected ? (
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm space-y-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">{selected.subject || 'No Subject'}</h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    From <span className="font-medium text-gray-700 dark:text-gray-300">{selected.name}</span> · {selected.email}
                  </p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                    {new Date(selected.created_at).toLocaleString()}
                  </p>
                </div>
                <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${STATUS_STYLES[selected.status] || ''}`}>
                  {selected.status}
                </span>
              </div>

              <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
                <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">
                  {selected.message}
                </p>
              </div>

              <div className="flex gap-3 flex-wrap">
                <a
                  href={`mailto:${selected.email}?subject=Re: ${selected.subject || 'Your Inquiry'}`}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-xl transition-colors"
                >
                  Reply via Email
                </a>
                {selected.status !== 'resolved' && (
                  <button
                    onClick={() => handleMarkResolved(selected.id)}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-xl transition-colors"
                  >
                    <CheckIcon className="w-4 h-4" />
                    Mark Resolved
                  </button>
                )}
                <button
                  onClick={() => handleDelete(selected.id)}
                  className="inline-flex items-center gap-2 px-4 py-2 border border-red-200 dark:border-red-500/30 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 text-sm font-medium rounded-xl transition-colors"
                >
                  <TrashIcon className="w-4 h-4" />
                  Delete
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full min-h-64 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl">
              <InboxIcon className="w-12 h-12 text-gray-300 dark:text-gray-600 mb-3" />
              <p className="text-gray-500 dark:text-gray-400 text-sm">Select an inquiry to view details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
