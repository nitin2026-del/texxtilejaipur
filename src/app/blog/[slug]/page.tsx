import React from 'react';
import { supabase } from '@/lib/supabase';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { notFound } from 'next/navigation';
import { Calendar, ArrowLeft, BookOpen } from 'lucide-react';
import Link from 'next/link';

import { MarkdownRenderer } from '@/components/MarkdownRenderer';
import { Metadata } from 'next';

export const revalidate = 60; // Revalidate every minute

async function getBlogPost(slug: string) {
  const decodedSlug = decodeURIComponent(slug).trim();
  const { data, error } = await supabase
    .from('blogs')
    .select('*')
    .eq('slug', decodedSlug)
    .eq('status', 'published')
    .single();

  if (error || !data) {
    return null;
  }
  return data;
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const post = await getBlogPost(params.slug);
  if (!post) {
    return { title: 'Article Not Found | Textile Jaipur' };
  }
  const canonicalUrl = `https://www.textilejaipur.com/blog/${encodeURIComponent(post.slug)}`;
  const metaTitle = post.title.includes('Textile Jaipur') ? post.title : `${post.title} | Textile Jaipur`;
  const metaDesc = post.excerpt || `Read ${post.title} on the Textile Jaipur Artisan Journal — handcrafted Suzani jackets and embroidered outerwear from Jaipur, Rajasthan.`;

  return {
    title: metaTitle,
    description: metaDesc,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: metaTitle,
      description: metaDesc,
      url: canonicalUrl,
      siteName: 'Textile Jaipur',
      type: 'article',
      publishedTime: post.created_at,
      images: post.image_url ? [{ url: post.image_url, alt: post.title }] : [{ url: 'https://www.textilejaipur.com/about/img1.jpg', alt: post.title }],
    },
    twitter: {
      card: 'summary_large_image',
      title: metaTitle,
      description: metaDesc,
      images: post.image_url ? [post.image_url] : ['https://www.textilejaipur.com/about/img1.jpg'],
    },
  };
}

export default async function BlogPostPage({ params }: { params: { slug: string } }) {
  const post = await getBlogPost(params.slug);

  if (!post) {
    notFound();
  }

  const canonicalUrl = `https://www.textilejaipur.com/blog/${encodeURIComponent(post.slug)}`;
  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.excerpt || post.title,
    image: post.image_url ? [post.image_url] : ['https://www.textilejaipur.com/about/img1.jpg'],
    datePublished: post.created_at,
    dateModified: post.updated_at || post.created_at,
    author: {
      '@type': 'Organization',
      name: 'Textile Jaipur Editorial',
      url: 'https://www.textilejaipur.com',
    },
    publisher: {
      '@type': 'Organization',
      name: 'Textile Jaipur',
      logo: {
        '@type': 'ImageObject',
        url: 'https://www.textilejaipur.com/logo.png',
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': canonicalUrl,
    },
  };

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.textilejaipur.com' },
      { '@type': 'ListItem', position: 2, name: 'The Artisan Journal', item: 'https://www.textilejaipur.com/blog' },
      { '@type': 'ListItem', position: 3, name: post.title, item: canonicalUrl },
    ],
  };

  return (
    <div className="min-h-screen bg-zinc-950 selection:bg-gold/30 selection:text-gold-light font-sans flex flex-col relative overflow-hidden">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
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
          <MarkdownRenderer content={post.content} />
        </article>

        {/* Footer/Author Area */}
        <div className="mt-16 pt-8 border-t border-zinc-900 flex items-center justify-between animate-fade-in">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-gold">
              <BookOpen className="h-5 w-5" />
            </div>
            <div>
              <span className="block text-sm font-bold text-white">Textile Jaipur Editorial</span>
              <span className="block text-xs text-zinc-500">Luxury Handcrafted Fashion</span>
            </div>
          </div>
        </div>

        {/* Shop Related Hand-Embroidered Collections (SEO Internal Linking) */}
        <section className="mt-12 p-8 rounded-2xl bg-zinc-900/50 border border-zinc-800/80">
          <h2 className="text-xl font-serif font-bold text-white mb-2">
            Explore Our Hand-Embroidered Jaipur Collections
          </h2>
          <p className="text-sm text-zinc-400 mb-5">
            Discover authentic artisan-crafted Suzani jackets, velvet coats, cotton jackets, and boho kimonos handmade in Jaipur with free worldwide shipping.
          </p>
          <div className="flex flex-wrap gap-2.5">
            {[
              { label: 'Suzani Jackets', href: '/collections/suzani-jackets' },
              { label: 'Embroidered Jackets', href: '/collections/embroidered-jackets' },
              { label: 'Velvet Suzani Jackets', href: '/collections/velvet-jackets' },
              { label: 'Cotton Suzani Jackets', href: '/collections/cotton-jackets' },
              { label: 'TNT Suzani Jackets', href: '/collections/tnt-suzani-jacket' },
              { label: 'Corduroy Embroidered Jackets', href: '/collections/corduroy-jacket' },
              { label: 'Velvet Short Kimonos', href: '/collections/velvet-short-kimono' },
              { label: 'Long Suzani Kimonos', href: '/collections/velvet-long-suzani-kimono' },
              { label: 'Shop All 170+ Pieces', href: '/collection' },
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="px-4 py-2 rounded-full bg-zinc-950 border border-zinc-800 text-xs font-semibold text-zinc-200 hover:border-gold hover:text-gold transition-colors"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </section>

      </main>

      <Footer />
    </div>
  );
}
