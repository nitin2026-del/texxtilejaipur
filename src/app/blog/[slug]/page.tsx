import React from 'react';
import { supabase } from '@/lib/supabase';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { notFound } from 'next/navigation';
import { Calendar, ArrowLeft, BookOpen } from 'lucide-react';
import Link from 'next/link';

// Use standard Markdown rendering
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export const revalidate = 60; // Revalidate every minute

async function getBlogPost(slug: string) {
  const { data, error } = await supabase
    .from('blogs')
    .select('*')
    .eq('slug', slug)
    .eq('status', 'published')
    .single();

  if (error || !data) {
    return null;
  }
  return data;
}

export default async function BlogPostPage({ params }: { params: { slug: string } }) {
  const post = await getBlogPost(params.slug);

  if (!post) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-zinc-950 selection:bg-gold/30 selection:text-gold-light font-sans flex flex-col relative overflow-hidden">
      {/* Top Gradient */}
      <div className="fixed top-0 left-0 w-full h-[500px] bg-gradient-to-b from-zinc-900/50 to-transparent pointer-events-none" />

      {/* Main Content */}
      <main className="flex-1 flex flex-col relative z-10 w-full max-w-4xl mx-auto px-6 pt-32 pb-24">
        
        {/* Back Button */}
        <Link 
          href="/blog" 
          className="inline-flex items-center gap-2 text-xs font-bold text-zinc-400 hover:text-white transition-colors uppercase tracking-wider mb-8 w-fit"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Journal
        </Link>

        {/* Header Section */}
        <header className="space-y-6 mb-12 animate-fade-in">
          <div className="flex items-center gap-4 text-[10px] font-bold text-gold tracking-widest uppercase">
            <span className="flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5" /> {new Date(post.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black font-serif text-white tracking-tight leading-tight">
            {post.title}
          </h1>
          <p className="text-lg md:text-xl text-zinc-400 font-light leading-relaxed max-w-3xl">
            {post.excerpt}
          </p>
        </header>

        {/* Hero Image */}
        {post.image_url && (
          <div className="relative w-full h-[40vh] md:h-[60vh] min-h-[300px] rounded-3xl overflow-hidden mb-16 shadow-2xl border border-zinc-800 animate-fade-in">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img 
              src={post.image_url} 
              alt={post.title}
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/10" />
          </div>
        )}

        {/* Article Body */}
        <article className="prose prose-invert prose-zinc max-w-none lg:prose-lg
          prose-headings:font-serif prose-headings:font-bold prose-headings:text-white
          prose-p:text-zinc-300 prose-p:leading-relaxed
          prose-a:text-gold prose-a:no-underline hover:prose-a:text-gold-light
          prose-strong:text-white prose-strong:font-bold
          prose-ul:text-zinc-300 prose-ol:text-zinc-300
          prose-blockquote:border-gold prose-blockquote:bg-gold/5 prose-blockquote:text-white prose-blockquote:py-2 prose-blockquote:px-6 prose-blockquote:rounded-r-xl
          animate-fade-in"
        >
          {/* We use ReactMarkdown to safely render the content */}
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {post.content}
          </ReactMarkdown>
        </article>

        {/* Footer/Author Area */}
        <div className="mt-16 pt-8 border-t border-zinc-900 flex items-center justify-between animate-fade-in">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-gold">
              <BookOpen className="h-5 w-5" />
            </div>
            <div>
              <span className="block text-sm font-bold text-white">Hiyawear Editorial</span>
              <span className="block text-xs text-zinc-500">Luxury Handcrafted Fashion</span>
            </div>
          </div>
        </div>

      </main>

      <Footer />
    </div>
  );
}
