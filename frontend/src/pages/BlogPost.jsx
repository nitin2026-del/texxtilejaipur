import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import { supabase } from '../lib/supabaseClient';
import { ArrowLeftIcon, ClockIcon, CalendarIcon, TagIcon, ShareIcon, BookmarkIcon } from '@heroicons/react/24/outline';

export default function BlogPost() {
  const { slug } = useParams();
  const [post, setPost] = useState(null);
  const [relatedPosts, setRelatedPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchPostDetails = async () => {
      setLoading(true);
      setError(null);
      try {
        // 1. Fetch Post Details by Slug
        const { data, error: fetchErr } = await supabase
          .from('blogs')
          .select(`
            id, title, slug, excerpt, content, image_url, tags, read_time, created_at, updated_at,
            category_id, seo_title, seo_description, seo_keywords,
            blog_categories (id, name, slug)
          `)
          .eq('slug', slug)
          .eq('status', 'published')
          .single();

        if (fetchErr) throw fetchErr;
        setPost(data);

        // 2. Fetch Potential Related Posts
        if (data) {
          const { data: relatedData, error: relatedErr } = await supabase
            .from('blogs')
            .select(`
              id, title, slug, excerpt, image_url, read_time, created_at, category_id, tags,
              blog_categories (id, name, slug)
            `)
            .eq('status', 'published')
            .neq('id', data.id)
            .limit(6);

          if (!relatedErr && relatedData) {
            // Sort by category match and overlapping tags
            const scored = relatedData
              .map(p => {
                const matchesCategory = p.category_id === data.category_id;
                const overlappingTags = p.tags && data.tags
                  ? p.tags.filter(t => data.tags.includes(t)).length
                  : 0;
                return { ...p, score: (matchesCategory ? 5 : 0) + overlappingTags };
              })
              .sort((a, b) => b.score - a.score)
              .slice(0, 3);
            setRelatedPosts(scored);
          }
        }
      } catch (err) {
        console.error('Error fetching blog details:', err);
        setError('Article not found or failed to load.');
      } finally {
        setLoading(false);
      }
    };

    fetchPostDetails();
  }, [slug]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <MainLayout title="Loading Article...">
        <div className="flex flex-col items-center justify-center py-32">
          <div className="w-12 h-12 border-4 border-indigo-250 border-t-indigo-650 rounded-full animate-spin"></div>
          <p className="text-gray-500 dark:text-gray-400 mt-4 text-sm font-medium">Loading article details...</p>
        </div>
      </MainLayout>
    );
  }

  if (error || !post) {
    return (
      <MainLayout title="Article Not Found">
        <div className="max-w-md mx-auto text-center py-24 px-4 bg-white dark:bg-gray-900 rounded-3xl border border-gray-150 dark:border-gray-800 shadow-sm mt-12">
          <h2 className="text-3xl font-extrabold text-gray-800 dark:text-white mb-3">Article Not Found</h2>
          <p className="text-gray-500 dark:text-gray-400 mb-8 text-sm">The article you are looking for might have been removed or is currently set to draft status.</p>
          <Link 
            to="/blog" 
            className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-6 py-3 rounded-xl transition-all shadow-md shadow-indigo-150 dark:shadow-none"
          >
            <ArrowLeftIcon className="w-4 h-4" /> Back to Journal
          </Link>
        </div>
      </MainLayout>
    );
  }

  // Define structured JSON-LD Schema Markup
  const schemaMarkup = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": window.location.href
    },
    "headline": post.title,
    "description": post.excerpt || post.seo_description,
    "image": post.image_url || 'https://images.unsplash.com/photo-1594912952549-fb93be3d5fc4?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
    "datePublished": post.created_at,
    "dateModified": post.updated_at || post.created_at,
    "author": {
      "@type": "Organization",
      "name": "Gupta International Editors"
    },
    "publisher": {
      "@type": "Organization",
      "name": "Gupta International",
      "logo": {
        "@type": "ImageObject",
        "url": `${window.location.origin}/favicon.svg`
      }
    }
  };

  return (
    <MainLayout
      title={post.seo_title || `${post.title} — Gupta International`}
      description={post.seo_description || post.excerpt || 'Read the latest fashion insights.'}
      keywords={post.seo_keywords || (post.tags && post.tags.join(', '))}
      canonicalUrl={window.location.origin + '/blog/' + post.slug}
      ogImage={post.image_url}
      ogType="article"
      schemaMarkup={schemaMarkup}
    >
      <div className="max-w-4xl mx-auto py-10 px-4">
        {/* Navigation & Share */}
        <div className="flex items-center justify-between mb-8">
          <Link to="/blog" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors">
            <ArrowLeftIcon className="w-4 h-4" /> Back to Journal
          </Link>
          <div className="flex items-center gap-2">
            <button 
              onClick={handleCopyLink} 
              className="p-2 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-all cursor-pointer text-xs flex items-center gap-1.5"
            >
              <ShareIcon className="w-4.5 h-4.5" />
              {copied ? 'Copied!' : 'Share'}
            </button>
          </div>
        </div>

        {/* Article Header */}
        <div className="text-center mb-8">
          <span className="bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-wider shadow-sm">
            {post.blog_categories?.name || 'Style'}
          </span>
          <h1 className="text-3xl md:text-5xl font-extrabold text-gray-900 dark:text-white mt-4 mb-6 leading-tight max-w-3xl mx-auto">
            {post.title}
          </h1>
          <div className="flex items-center justify-center gap-6 text-gray-500 dark:text-gray-400 text-sm">
            <span className="flex items-center gap-1.5">
              <CalendarIcon className="w-4.5 h-4.5" />
              {new Date(post.created_at).toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' })}
            </span>
            <span className="flex items-center gap-1.5">
              <ClockIcon className="w-4.5 h-4.5" />
              {post.read_time || 5} min read
            </span>
          </div>
        </div>

        {/* Hero Cover Image */}
        {post.image_url && (
          <div className="w-full rounded-3xl overflow-hidden mb-12 shadow-lg aspect-video max-h-[480px]">
            <img src={post.image_url} alt={post.title} className="w-full h-full object-cover" />
          </div>
        )}

        {/* Main Content Layout */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Author/Publisher Info Sidebar (visible on md+) */}
          <div className="hidden md:block col-span-1 space-y-6 border-r border-gray-100 dark:border-gray-800/50 pr-6">
            <div className="space-y-3">
              <span className="text-[10px] uppercase font-bold text-gray-400 tracking-widest block">Author</span>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-indigo-650 flex items-center justify-center text-white font-bold text-sm">IT</div>
                <div>
                  <h4 className="text-sm font-bold text-gray-900 dark:text-white">Gupta International Editors</h4>
                  <p className="text-[10px] text-gray-400">Curators of fine craft</p>
                </div>
              </div>
            </div>
            {post.tags && post.tags.length > 0 && (
              <div className="space-y-3 pt-6 border-t border-gray-50 dark:border-gray-800/30">
                <span className="text-[10px] uppercase font-bold text-gray-400 tracking-widest block">Filed Under</span>
                <div className="flex flex-wrap gap-1.5">
                  {post.tags.map((tag, i) => (
                    <span 
                      key={i} 
                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-md"
                    >
                      <TagIcon className="w-3 h-3 text-gray-400" />
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Article Body */}
          <div className="col-span-1 md:col-span-3">
            <article className="prose dark:prose-invert max-w-none text-gray-700 dark:text-gray-300 leading-relaxed text-base md:text-lg">
              <div dangerouslySetInnerHTML={{ __html: post.content }} />
            </article>

            {/* Mobile Tags View */}
            {post.tags && post.tags.length > 0 && (
              <div className="md:hidden mt-8 pt-6 border-t border-gray-100 dark:border-gray-800/30">
                <span className="text-[10px] uppercase font-bold text-gray-400 tracking-widest block mb-3">Tags</span>
                <div className="flex flex-wrap gap-2">
                  {post.tags.map((tag, i) => (
                    <span 
                      key={i} 
                      className="inline-flex items-center gap-1 text-xs font-semibold text-gray-650 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-2.5 py-1.5 rounded-lg"
                    >
                      <TagIcon className="w-3.5 h-3.5 text-gray-400" />
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Related Blogs Grid */}
        {relatedPosts.length > 0 && (
          <div className="mt-20 pt-10 border-t border-gray-150 dark:border-gray-850">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-8 text-center md:text-left">
              Related Articles
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedPosts.map(rel => (
                <Link 
                  key={rel.id} 
                  to={`/blog/${rel.slug}`} 
                  className="group bg-white dark:bg-gray-900 rounded-2xl overflow-hidden border border-gray-150 dark:border-gray-800 hover:shadow-lg transition-all duration-300 flex flex-col"
                >
                  <div className="h-44 overflow-hidden relative">
                    {rel.image_url ? (
                      <img src={rel.image_url} alt={rel.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-tr from-indigo-900 to-indigo-750 flex items-center justify-center text-white font-bold text-sm">Gupta International</div>
                    )}
                    <span className="absolute top-3 left-3 bg-white/90 backdrop-blur-md dark:bg-gray-950/90 text-indigo-750 dark:text-indigo-400 text-[10px] font-bold px-2 py-0.5 rounded-md">
                      {rel.blog_categories?.name}
                    </span>
                  </div>
                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <div>
                      <h4 className="text-gray-900 dark:text-white font-bold text-sm leading-snug group-hover:text-indigo-650 transition-colors line-clamp-2 mb-1.5">
                        {rel.title}
                      </h4>
                      <p className="text-gray-500 dark:text-gray-400 text-xs line-clamp-2 leading-relaxed">
                        {rel.excerpt || (rel.content && rel.content.replace(/<[^>]*>/g, '').substring(0, 80) + '...')}
                      </p>
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-gray-400 pt-3 mt-3 border-t border-gray-50 dark:border-gray-800/30">
                      <span>{new Date(rel.created_at).toLocaleDateString()}</span>
                      <span>{rel.read_time || 5} min read</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
