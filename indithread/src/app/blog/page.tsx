import React from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { CartSidebar } from '@/components/CartSidebar';
import { CheckoutModal } from '@/components/CheckoutModal';
import { BookOpen, Calendar, ArrowRight } from 'lucide-react';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Blog | Hiyawear',
  description: 'Discover the latest trends, styling tips, and stories behind our luxury handcrafted collections.',
};

export const revalidate = 60; // Revalidate every minute

async function getBlogs() {
  const { data, error } = await supabase
    .from('blogs')
    .select('id, title, slug, excerpt, image_url, created_at')
    .eq('status', 'published')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching blogs:', error);
    return [];
  }
  return data || [];
}

export default async function BlogListingPage() {
  const blogs = await getBlogs();

  return (
    <div className="min-h-screen bg-zinc-950 selection:bg-gold/30 selection:text-gold-light font-sans flex flex-col relative overflow-hidden">
      {/* Background Ambience */}
      <div className="fixed top-0 left-0 w-full h-[500px] bg-gradient-to-b from-zinc-900/50 to-transparent pointer-events-none" />
      <div className="fixed top-[-20%] left-[-10%] w-[50%] h-[50%] bg-gold/5 blur-[120px] rounded-full pointer-events-none" />

      {/* Main Content */}
      <main className="flex-1 flex flex-col relative z-10 w-full max-w-7xl mx-auto px-6 pt-32 pb-24">
        <div className="text-center space-y-4 mb-16 animate-fade-in">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-gold/20 bg-gold/5 text-gold text-xs font-bold tracking-widest uppercase mx-auto">
            <BookOpen className="h-3.5 w-3.5" /> Editorial
          </div>
          <h1 className="text-4xl md:text-5xl font-black font-serif text-white tracking-tight">
            The <span className="text-gold font-light">Journal</span>
          </h1>
          <p className="text-zinc-400 text-sm max-w-xl mx-auto">
            Discover the latest trends, styling tips, and stories behind our luxury handcrafted collections.
          </p>
        </div>

        {blogs.length === 0 ? (
          <div className="text-center py-20">
            <BookOpen className="h-12 w-12 text-zinc-800 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">No Posts Yet</h3>
            <p className="text-zinc-500 text-sm">We are crafting our first stories. Check back soon.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {blogs.map((blog) => (
              <Link key={blog.id} href={`/blog/${blog.slug}`} className="group relative rounded-2xl overflow-hidden glass-card border border-zinc-900 hover:border-gold/30 transition-all duration-500 bg-zinc-950 flex flex-col h-full shadow-xl hover:shadow-gold/10">
                <div className="relative h-64 overflow-hidden shrink-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={blog.image_url || 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=800&auto=format&fit=crop&q=80'}
                    alt={blog.title}
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/20 to-transparent" />
                </div>
                <div className="p-6 flex flex-col flex-1 relative z-10 -mt-12 bg-gradient-to-b from-transparent via-zinc-950 to-zinc-950">
                  <div className="flex items-center gap-2 text-[10px] font-semibold text-gold tracking-widest uppercase mb-3">
                    <Calendar className="h-3 w-3" />
                    {new Date(blog.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </div>
                  <h3 className="text-xl font-bold font-serif text-white mb-3 group-hover:text-gold transition-colors duration-300">
                    {blog.title}
                  </h3>
                  <p className="text-sm text-zinc-400 mb-6 flex-1 line-clamp-3">
                    {blog.excerpt}
                  </p>
                  <div className="inline-flex items-center gap-2 text-xs font-bold text-white group-hover:text-gold transition-colors uppercase tracking-wider">
                    Read Story <ArrowRight className="h-3 w-3 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
