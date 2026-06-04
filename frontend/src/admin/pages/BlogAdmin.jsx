import React, { useState, useEffect, useRef } from 'react';
import { PlusIcon, MagnifyingGlassIcon, PencilSquareIcon, TrashIcon, ArrowLeftIcon, EyeIcon, DocumentTextIcon } from '@heroicons/react/24/outline';
import ImageUploader from '../components/ImageUploader';
import { supabase } from '../../lib/supabaseClient';
import useStore from '../../store/useStore';

export default function BlogAdmin() {
  const [posts, setPosts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isWriting, setIsWriting] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [activeTab, setActiveTab] = useState('edit'); // 'edit' or 'preview'
  
  const [form, setForm] = useState({
    title: '',
    slug: '',
    content: '',
    excerpt: '',
    image_url: '',
    category_id: '',
    status: 'published',
    tags: '',
    seo_title: '',
    seo_description: '',
    seo_keywords: '',
    read_time: 1,
  });
  
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  
  const editorRef = useRef(null);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const { data, error: err } = await supabase
        .from('blogs')
        .select('id, title, slug, status, created_at, image_url, category_id, excerpt, content, seo_title, seo_description, seo_keywords, tags, read_time')
        .order('created_at', { ascending: false });
      if (err) throw err;
      if (data) setPosts(data);
    } catch (err) {
      console.error('Failed to fetch posts:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const { data, error: err } = await supabase
        .from('blog_categories')
        .select('id, name, slug')
        .order('name');
      if (err) throw err;
      if (data) {
        setCategories(data);
        if (!form.category_id && data.length > 0) {
          setForm(prev => ({ ...prev, category_id: data[0].id }));
        }
      }
    } catch (err) {
      console.error('Failed to fetch categories:', err);
    }
  };

  useEffect(() => {
    fetchPosts();
    fetchCategories();
  }, []);

  // Update editor innerHTML when writing mode is activated or when editingId/content changes
  useEffect(() => {
    if (isWriting && editorRef.current && activeTab === 'edit') {
      // Avoid resetting cursor if the text is the same
      if (editorRef.current.innerHTML !== form.content) {
        editorRef.current.innerHTML = form.content || '';
      }
    }
  }, [isWriting, activeTab]);

  const handleTitleChange = (val) => {
    const generatedSlug = val
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '') // remove special characters
      .trim()
      .replace(/\s+/g, '-'); // replace spaces with hyphens

    setForm(prev => {
      // Auto-update slug if it was empty or matched the old title's slug
      const oldSlug = prev.title.toLowerCase().replace(/[^a-z0-9\s-]/g, '').trim().replace(/\s+/g, '-');
      const shouldUpdateSlug = !prev.slug || prev.slug === oldSlug;
      return {
        ...prev,
        title: val,
        slug: shouldUpdateSlug ? generatedSlug : prev.slug,
        seo_title: !prev.seo_title || prev.seo_title === prev.title ? val : prev.seo_title
      };
    });
  };

  const handleContentChange = (html) => {
    // Strip HTML to get plain text for word count
    const text = html.replace(/<[^>]*>/g, ' ');
    const words = text.trim().split(/\s+/).filter(w => w.length > 0);
    const calculatedReadTime = Math.max(1, Math.ceil(words.length / 200));

    setForm(prev => ({
      ...prev,
      content: html,
      read_time: calculatedReadTime,
      excerpt: !prev.excerpt || prev.excerpt === prev.content.replace(/<[^>]*>/g, '').substring(0, 150) + '...'
        ? text.substring(0, 150) + '...'
        : prev.excerpt
    }));
  };

  const executeCommand = (command, value = null) => {
    document.execCommand(command, false, value);
    if (editorRef.current) {
      handleContentChange(editorRef.current.innerHTML);
    }
  };

  const addLink = () => {
    const url = prompt('Enter the link URL:');
    if (url) {
      executeCommand('createLink', url);
    }
  };

  const handlePublish = async () => {
    if (!form.title) { setError('Post title is required.'); return; }
    if (!form.content) { setError('Post content is required.'); return; }
    setError(null);
    setSaving(true);

    const userId = useStore.getState().auth?.user?.id;
    const tagsArray = form.tags
      ? form.tags.split(',').map(t => t.trim()).filter(Boolean)
      : [];

    const postData = {
      title: form.title,
      slug: form.slug || form.title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
      content: form.content,
      excerpt: form.excerpt || form.content.replace(/<[^>]*>/g, '').substring(0, 150) + '...',
      image_url: form.image_url || null,
      category_id: form.category_id || null,
      status: form.status,
      author_id: userId || null,
      tags: tagsArray,
      read_time: form.read_time || 1,
      seo_title: form.seo_title || form.title,
      seo_description: form.seo_description || form.excerpt || null,
      seo_keywords: form.seo_keywords || null,
      updated_at: new Date().toISOString()
    };

    try {
      let result;
      if (editingId) {
        result = await supabase
          .from('blogs')
          .update(postData)
          .eq('id', editingId);
      } else {
        result = await supabase
          .from('blogs')
          .insert({
            ...postData,
            created_at: new Date().toISOString()
          });
      }

      if (result.error) throw result.error;

      await fetchPosts();
      setIsWriting(false);
      setEditingId(null);
      setForm({
        title: '',
        slug: '',
        content: '',
        excerpt: '',
        image_url: '',
        category_id: categories[0]?.id || '',
        status: 'published',
        tags: '',
        seo_title: '',
        seo_description: '',
        seo_keywords: '',
        read_time: 1
      });
    } catch (err) {
      setError(err.message || 'Failed to save blog post.');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (post) => {
    setEditingId(post.id);
    setForm({
      title: post.title || '',
      slug: post.slug || '',
      content: post.content || '',
      excerpt: post.excerpt || '',
      image_url: post.image_url || '',
      category_id: post.category_id || '',
      status: post.status || 'published',
      tags: post.tags ? post.tags.join(', ') : '',
      seo_title: post.seo_title || '',
      seo_description: post.seo_description || '',
      seo_keywords: post.seo_keywords || '',
      read_time: post.read_time || 1,
    });
    setIsWriting(true);
    setActiveTab('edit');
  };

  const handleWriteNew = () => {
    setEditingId(null);
    setForm({
      title: '',
      slug: '',
      content: '',
      excerpt: '',
      image_url: '',
      category_id: categories[0]?.id || '',
      status: 'published',
      tags: '',
      seo_title: '',
      seo_description: '',
      seo_keywords: '',
      read_time: 1,
    });
    setIsWriting(true);
    setActiveTab('edit');
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this post?')) return;
    try {
      const { error: err } = await supabase.from('blogs').delete().eq('id', id);
      if (err) throw err;
      setPosts(prev => prev.filter(p => p.id !== id));
    } catch (err) {
      alert(err.message || 'Failed to delete blog post.');
    }
  };

  const filtered = posts.filter(p => p.title?.toLowerCase().includes(searchQuery.toLowerCase()));

  if (isWriting) {
    return (
      <div className="space-y-6 max-w-7xl mx-auto pb-12">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-150 dark:border-gray-800 pb-4">
          <div className="flex items-center gap-4">
            <button onClick={() => setIsWriting(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors">
              <ArrowLeftIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {editingId ? 'Edit Blog Post' : 'Write New Post'}
              </h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {editingId ? 'Updating article details' : 'Drafting and designing a new journal'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab(activeTab === 'edit' ? 'preview' : 'edit')}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-xl bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-all"
            >
              {activeTab === 'edit' ? (
                <>
                  <EyeIcon className="w-4 h-4" /> Live Preview
                </>
              ) : (
                <>
                  <DocumentTextIcon className="w-4 h-4" /> Edit Content
                </>
              )}
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-xl px-4 py-3 text-sm text-red-600 dark:text-red-400">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Editing Column */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 rounded-2xl p-6 shadow-sm space-y-5">
              <div>
                <label className="block text-xs uppercase tracking-wider font-semibold text-gray-500 dark:text-gray-400 mb-1.5">Post Title *</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={e => handleTitleChange(e.target.value)}
                  placeholder="Enter a descriptive post title..."
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-600 dark:text-white outline-none font-medium"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs uppercase tracking-wider font-semibold text-gray-500 dark:text-gray-400 mb-1.5">URL Slug *</label>
                  <input
                    type="text"
                    value={form.slug}
                    onChange={e => setForm({ ...form, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
                    placeholder="url-slug"
                    className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-600 dark:text-white outline-none text-sm font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-wider font-semibold text-gray-500 dark:text-gray-400 mb-1.5">Category *</label>
                  <select
                    value={form.category_id}
                    onChange={e => setForm({ ...form, category_id: e.target.value })}
                    className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-600 dark:text-white outline-none text-sm"
                  >
                    <option value="" disabled>Select category...</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider font-semibold text-gray-500 dark:text-gray-400 mb-1.5">Excerpt (Short Summary)</label>
                <textarea
                  rows={2}
                  value={form.excerpt}
                  onChange={e => setForm({ ...form, excerpt: e.target.value })}
                  placeholder="Provide a brief summary of the article..."
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-600 dark:text-white outline-none text-sm"
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider font-semibold text-gray-500 dark:text-gray-400 mb-1.5">Article Body *</label>
                
                {activeTab === 'edit' ? (
                  <div className="flex flex-col">
                    {/* Rich text editor toolbar */}
                    <div className="flex flex-wrap gap-1 p-1.5 bg-gray-50 dark:bg-gray-800/80 border border-b-0 border-gray-200 dark:border-gray-700 rounded-t-xl">
                      <button
                        type="button"
                        onClick={() => executeCommand('bold')}
                        className="px-3 py-1.5 text-xs font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-all"
                        title="Bold"
                      >
                        B
                      </button>
                      <button
                        type="button"
                        onClick={() => executeCommand('italic')}
                        className="px-3 py-1.5 text-xs font-semibold italic text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-all"
                        title="Italic"
                      >
                        I
                      </button>
                      <button
                        type="button"
                        onClick={() => executeCommand('underline')}
                        className="px-3 py-1.5 text-xs font-semibold underline text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-all"
                        title="Underline"
                      >
                        U
                      </button>
                      <span className="w-px h-5 bg-gray-200 dark:bg-gray-750 self-center mx-1"></span>
                      <button
                        type="button"
                        onClick={() => executeCommand('formatBlock', '<h2>')}
                        className="px-2.5 py-1.5 text-xs font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-all"
                        title="Heading 2"
                      >
                        H2
                      </button>
                      <button
                        type="button"
                        onClick={() => executeCommand('formatBlock', '<h3>')}
                        className="px-2.5 py-1.5 text-xs font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-all"
                        title="Heading 3"
                      >
                        H3
                      </button>
                      <span className="w-px h-5 bg-gray-200 dark:bg-gray-750 self-center mx-1"></span>
                      <button
                        type="button"
                        onClick={() => executeCommand('insertUnorderedList')}
                        className="px-2.5 py-1.5 text-xs font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-all"
                        title="Unordered List"
                      >
                        • List
                      </button>
                      <button
                        type="button"
                        onClick={() => executeCommand('insertOrderedList')}
                        className="px-2.5 py-1.5 text-xs font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-all"
                        title="Ordered List"
                      >
                        1. List
                      </button>
                      <button
                        type="button"
                        onClick={() => executeCommand('formatBlock', '<blockquote>')}
                        className="px-2.5 py-1.5 text-xs font-medium italic text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-all"
                        title="Quote Block"
                      >
                        Quote
                      </button>
                      <span className="w-px h-5 bg-gray-200 dark:bg-gray-750 self-center mx-1"></span>
                      <button
                        type="button"
                        onClick={addLink}
                        className="px-2.5 py-1.5 text-xs font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-all"
                        title="Insert Link"
                      >
                        Link
                      </button>
                      <button
                        type="button"
                        onClick={() => executeCommand('removeFormat')}
                        className="px-2.5 py-1.5 text-xs font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-all"
                        title="Remove Formatting"
                      >
                        Clear
                      </button>
                    </div>

                    <div
                      ref={editorRef}
                      contentEditable
                      onBlur={(e) => handleContentChange(e.target.innerHTML)}
                      onInput={(e) => handleContentChange(e.target.innerHTML)}
                      placeholder="Start writing article content..."
                      className="min-h-[400px] max-h-[600px] overflow-y-auto w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-b-xl focus:ring-2 focus:ring-indigo-600 dark:text-white outline-none prose dark:prose-invert max-w-none text-base"
                    />
                  </div>
                ) : (
                  <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 min-h-[400px] max-h-[600px] overflow-y-auto prose dark:prose-invert max-w-none">
                    {form.content ? (
                      <div dangerouslySetInnerHTML={{ __html: form.content }} />
                    ) : (
                      <p className="text-gray-400 italic">No content written yet.</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Sidebar Options Column */}
          <div className="space-y-6">
            {/* Featured Image */}
            <div className="bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 rounded-2xl p-6 shadow-sm space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-gray-600 dark:text-gray-300">Featured Image</h3>
              <ImageUploader
                bucketName="blog-images"
                onUploadComplete={(url) => setForm(prev => ({ ...prev, image_url: url || '' }))}
                currentImage={form.image_url}
              />
              {form.image_url && (
                <div className="mt-2 text-xs text-gray-500 dark:text-gray-400 flex items-center justify-between bg-gray-50 dark:bg-gray-800 p-2 rounded-lg">
                  <span className="truncate max-w-[200px]">{form.image_url}</span>
                  <button onClick={() => setForm(prev => ({ ...prev, image_url: '' }))} className="text-red-500 hover:text-red-600">Remove</button>
                </div>
              )}
            </div>

            {/* Tags & Meta Details */}
            <div className="bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 rounded-2xl p-6 shadow-sm space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-gray-600 dark:text-gray-300">Attributes</h3>
              
              <div>
                <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1.5">Tags (Comma-separated)</label>
                <input
                  type="text"
                  value={form.tags}
                  onChange={e => setForm({ ...form, tags: e.target.value })}
                  placeholder="e.g. style, saree, summer, lookbook"
                  className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-600 dark:text-white outline-none text-xs"
                />
              </div>

              <div>
                <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1.5">Reading Time (Minutes)</label>
                <input
                  type="number"
                  min={1}
                  value={form.read_time}
                  onChange={e => setForm({ ...form, read_time: parseInt(e.target.value) || 1 })}
                  className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-600 dark:text-white outline-none text-xs"
                />
                <span className="text-[10px] text-gray-400 mt-1 block">Automatically calculated based on word count.</span>
              </div>
            </div>

            {/* SEO Optimization Fields */}
            <div className="bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 rounded-2xl p-6 shadow-sm space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-gray-600 dark:text-gray-300">SEO Settings</h3>
              
              <div>
                <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1.5">SEO Meta Title</label>
                <input
                  type="text"
                  value={form.seo_title}
                  onChange={e => setForm({ ...form, seo_title: e.target.value })}
                  placeholder="Search engines title..."
                  className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-600 dark:text-white outline-none text-xs"
                />
              </div>

              <div>
                <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1.5">SEO Meta Description</label>
                <textarea
                  rows={3}
                  value={form.seo_description}
                  onChange={e => setForm({ ...form, seo_description: e.target.value })}
                  placeholder="Brief synopsis for Google results..."
                  className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-600 dark:text-white outline-none text-xs"
                />
              </div>

              <div>
                <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1.5">Keywords</label>
                <input
                  type="text"
                  value={form.seo_keywords}
                  onChange={e => setForm({ ...form, seo_keywords: e.target.value })}
                  placeholder="comma, separated, keywords"
                  className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-600 dark:text-white outline-none text-xs"
                />
              </div>
            </div>

            {/* Publishing Panel */}
            <div className="bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 rounded-2xl p-6 shadow-sm space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-gray-600 dark:text-gray-300">Publishing Status</h3>
              <select
                value={form.status}
                onChange={e => setForm({ ...form, status: e.target.value })}
                className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-600 dark:text-white outline-none text-sm"
              >
                <option value="published">Published</option>
                <option value="draft">Draft</option>
                <option value="archived">Archived</option>
              </select>
              
              <button
                onClick={handlePublish}
                disabled={saving}
                className="w-full px-4 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-medium rounded-xl transition-all shadow-md shadow-indigo-200 dark:shadow-none cursor-pointer flex items-center justify-center gap-2"
              >
                {saving ? (
                  <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                ) : (
                  editingId ? 'Update Post' : 'Save & Publish'
                )}
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Blog & Content</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Manage articles, news, textile heritage updates, and style guides.</p>
        </div>
        <button
          onClick={handleWriteNew}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl transition-colors shadow-sm shadow-indigo-200 dark:shadow-none cursor-pointer"
        >
          <PlusIcon className="w-5 h-5" />
          Write Post
        </button>
      </div>

      {/* Search */}
      <div className="flex items-center gap-4 bg-white dark:bg-gray-900 p-4 rounded-2xl border border-gray-150 dark:border-gray-800 shadow-sm">
        <div className="relative flex-1">
          <MagnifyingGlassIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search articles by title or category..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 bg-gray-50 dark:bg-gray-800 border-none rounded-xl text-sm focus:ring-2 focus:ring-indigo-600 dark:text-white"
          />
        </div>
      </div>

      {/* Posts Table */}
      <div className="bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-800/50 text-gray-500 dark:text-gray-400 text-xs font-semibold uppercase tracking-wider border-b border-gray-150 dark:border-gray-800">
                <th className="px-6 py-4">Title</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4 hidden md:table-cell">Date</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-150 dark:divide-gray-800">
              {loading ? (
                [...Array(3)].map((_, i) => (
                  <tr key={i}>
                    <td colSpan={5} className="px-6 py-4">
                      <div className="h-5 bg-gray-100 dark:bg-gray-800 rounded animate-pulse w-3/4" />
                    </td>
                  </tr>
                ))
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                    No blog posts found. Click "Write Post" to create your first article!
                  </td>
                </tr>
              ) : (
                filtered.map((post) => (
                  <tr key={post.id} className="hover:bg-gray-50 dark:hover:bg-gray-850/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {post.image_url ? (
                          <img src={post.image_url} alt={post.title} className="w-10 h-10 rounded-xl object-cover" />
                        ) : (
                          <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center text-indigo-400 text-xs font-bold">B</div>
                        )}
                        <div>
                          <span className="text-sm font-semibold text-gray-900 dark:text-white line-clamp-1">{post.title}</span>
                          <span className="text-[10px] text-gray-400 font-mono block mt-0.5">/{post.slug}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">
                      {categories.find(c => c.id === post.category_id)?.name || 'Style'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400 hidden md:table-cell">
                      {new Date(post.created_at).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${
                        post.status === 'published'
                          ? 'bg-green-150 text-green-800 dark:bg-green-500/10 dark:text-green-500'
                          : post.status === 'draft'
                          ? 'bg-amber-100 text-amber-800 dark:bg-amber-500/10 dark:text-amber-500'
                          : 'bg-gray-150 text-gray-700 dark:bg-gray-700/50 dark:text-gray-450'
                      }`}>
                        {post.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleEdit(post)}
                          className="p-2 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 rounded-lg transition-colors cursor-pointer"
                        >
                          <PencilSquareIcon className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(post.id)}
                          className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors cursor-pointer"
                        >
                          <TrashIcon className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
