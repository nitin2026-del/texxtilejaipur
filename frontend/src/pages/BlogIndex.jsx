import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import { supabase } from '../lib/supabaseClient';
import { MagnifyingGlassIcon, BookOpenIcon, CalendarIcon } from '@heroicons/react/24/outline';

export default function BlogIndex() {
  const [blogs, setBlogs] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBlogData = async () => {
      setLoading(true);
      try {
        // 1. Fetch Categories
        const { data: catData, error: catErr } = await supabase
          .from('blog_categories')
          .select('id, name, slug')
          .order('name');
        
        if (catErr) throw catErr;
        setCategories(catData || []);

        // 2. Fetch Blogs
        const { data: blogData, error: blogErr } = await supabase
          .from('blogs')
          .select(`
            id, title, slug, excerpt, content, image_url, tags, read_time, created_at,
            blog_categories (id, name, slug)
          `)
          .eq('status', 'published')
          .order('created_at', { ascending: false });

        if (blogErr) throw blogErr;
        setBlogs(blogData || []);
      } catch (err) {
        console.error('Failed to fetch blog data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchBlogData();
  }, []);

  // Filter posts based on search & category
  const filteredPosts = blogs.filter(post => {
    const matchesSearch = 
      post.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.excerpt?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.content?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.tags?.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory = 
      selectedCategory === 'all' || 
      post.blog_categories?.slug === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const featured = filteredPosts[0];
  const rest = filteredPosts.slice(1);

  return (
    <MainLayout 
      title="Stories & Style Guide — Gupta International" 
      description="Discover modern style guides, textile heritage stories, and ethical fashion updates directly from Gupta International exporter."
    >
      <div className="max-w-6xl mx-auto py-12 px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <span className="text-xs uppercase tracking-widest text-indigo-600 dark:text-indigo-400 font-bold">Gupta International Journal</span>
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white mt-2 mb-3">Stories & Style</h1>
          <p className="text-lg text-gray-500 dark:text-gray-400 max-w-xl mx-auto">Insights on premium fashion, heritage artisan weaving, and dressing well globally.</p>
        </div>

        {/* Toolbar: Category tabs and Search bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12 pb-6 border-b border-gray-100 dark:border-gray-800">
          {/* Category Tabs */}
          <div className="flex flex-wrap gap-2 order-2 md:order-1">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                selectedCategory === 'all'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-150'
                  : 'bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800'
              }`}
            >
              All Articles
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.slug)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  selectedCategory === cat.slug
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-150'
                    : 'bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>

          {/* Search Bar */}
          <div className="relative w-full md:w-80 order-1 md:order-2">
            <MagnifyingGlassIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search articles & tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 focus:ring-2 focus:ring-indigo-600 dark:text-white outline-none text-sm transition-all"
            />
          </div>
        </div>

        {/* Loading Spinner */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
            <p className="text-gray-500 dark:text-gray-400 mt-4 text-sm font-medium">Fetching our latest journals...</p>
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="text-center py-20 bg-white/50 dark:bg-gray-900/30 rounded-3xl border border-gray-200/50 dark:border-gray-800/50 p-8">
            <h3 className="text-xl font-bold text-gray-700 dark:text-gray-300 mb-2">No articles found</h3>
            <p className="text-gray-500 dark:text-gray-400 max-w-sm mx-auto">We couldn't find any articles matching your search query or chosen category. Try checking other categories!</p>
          </div>
        ) : (
          <>
            {/* Featured Post Card */}
            {featured && (
              <Link 
                to={`/blog/${featured.slug}`} 
                className="group block relative rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-500 mb-12" 
                style={{ height: 440 }}
              >
                {featured.image_url ? (
                  <img src={featured.image_url} alt={featured.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-tr from-indigo-900 to-indigo-700 flex items-center justify-center" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-6 md:p-12">
                  <span className="bg-indigo-600 text-white text-xs font-semibold px-3 py-1 rounded-full mb-4 inline-block shadow-md">
                    {featured.blog_categories?.name || 'Style'}
                  </span>
                  <h2 className="text-white text-2xl md:text-4xl font-extrabold mb-3 leading-tight max-w-3xl group-hover:text-indigo-200 transition-colors">
                    {featured.title}
                  </h2>
                  <p className="text-gray-300 text-sm md:text-base leading-relaxed line-clamp-2 max-w-2xl mb-4 font-normal">
                    {featured.excerpt || (featured.content && featured.content.substring(0, 160) + '...')}
                  </p>
                  <div className="flex items-center gap-4 text-gray-400 text-xs">
                    <span className="flex items-center gap-1.5"><CalendarIcon className="w-4 h-4" />{new Date(featured.created_at).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                    <span className="flex items-center gap-1.5"><BookOpenIcon className="w-4 h-4" />{featured.read_time || 5} min read</span>
                  </div>
                </div>
              </Link>
            )}

            {/* Grid of Remaining Posts */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {rest.map(post => (
                <Link 
                  key={post.id} 
                  to={`/blog/${post.slug}`} 
                  className="group bg-white dark:bg-gray-900 rounded-2xl overflow-hidden shadow-sm border border-gray-150 dark:border-gray-800 hover:shadow-lg transition-all duration-300 flex flex-col"
                >
                  <div className="overflow-hidden relative" style={{ height: 220 }}>
                    {post.image_url ? (
                      <img src={post.image_url} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-tr from-indigo-900 to-indigo-700 flex items-center justify-center text-white font-bold">Gupta International</div>
                    )}
                    <span className="absolute top-4 left-4 bg-white/90 backdrop-blur-md dark:bg-gray-950/90 text-indigo-700 dark:text-indigo-400 text-xs font-semibold px-2.5 py-1 rounded-lg">
                      {post.blog_categories?.name}
                    </span>
                  </div>
                  <div className="p-6 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="text-gray-900 dark:text-white font-bold text-lg leading-snug group-hover:text-indigo-600 dark:group-hover:text-indigo-450 transition-colors mb-2 line-clamp-2">
                        {post.title}
                      </h3>
                      <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed mb-4 line-clamp-3">
                        {post.excerpt || (post.content && post.content.replace(/<[^>]*>/g, '').substring(0, 120) + '...')}
                      </p>
                    </div>
                    <div className="flex items-center justify-between text-gray-400 text-xs pt-4 border-t border-gray-50 dark:border-gray-800/50">
                      <span className="flex items-center gap-1"><CalendarIcon className="w-3.5 h-3.5" />{new Date(post.created_at).toLocaleDateString()}</span>
                      <span className="flex items-center gap-1"><BookOpenIcon className="w-3.5 h-3.5" />{post.read_time || 5} min read</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </>
        )}
      </div>
    </MainLayout>
  );
}
