'use client';

import React from 'react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Star, MessageCircleHeart } from 'lucide-react';

export function ReviewsClient({ reviews, averageRating }: { reviews: any[], averageRating: string }) {
  return (
    <main className="min-h-screen bg-[#FDFBF7] flex flex-col selection:bg-brand-200">
      <Navbar onCartOpen={() => {}} />
      
      <div className="pt-32 pb-16 px-6 relative overflow-hidden border-b border-zinc-200 bg-white">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-brand-100/40 via-transparent to-transparent opacity-60 pointer-events-none"></div>
        <div className="max-w-4xl mx-auto relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-100/50 border border-brand-200/50 text-brand-800 text-xs font-bold tracking-widest uppercase mb-6">
            <MessageCircleHeart className="h-3 w-3" /> Real Customer Stories
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-zinc-900 tracking-tight leading-[1.1] mb-6">
            Loved by Women <br className="hidden md:block" /> Around the World
          </h1>
          
          <div className="flex flex-col items-center gap-2">
            <div className="flex gap-1">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-6 w-6 fill-amber-400 text-amber-400" />
              ))}
            </div>
            <p className="text-zinc-600 font-medium">
              <span className="font-bold text-zinc-900">{averageRating}/5</span> based on {reviews.length}+ reviews
            </p>
          </div>
        </div>
      </div>

      <div className="flex-1 max-w-7xl mx-auto w-full px-6 py-16">
        {reviews.length === 0 ? (
          <div className="text-center py-20 text-zinc-500">
            No reviews yet. Check back soon!
          </div>
        ) : (
          <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
            {reviews.map((review) => (
              <div key={review.id} className="break-inside-avoid bg-white border border-zinc-200 rounded-3xl p-6 md:p-8 shadow-sm hover:shadow-md transition-shadow">
                {/* Photo (if exists) */}
                {review.image_url && (
                  <div className="mb-6 rounded-2xl overflow-hidden aspect-[4/5] bg-zinc-100">
                    <img 
                      src={review.image_url} 
                      alt={`Review by ${review.reviewer_name}`}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </div>
                )}
                
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-bold text-zinc-900 text-lg flex items-center gap-2">
                      {review.reviewer_name || 'Anonymous'}
                      {review.is_verified_buyer && (
                        <span className="bg-green-100 text-green-700 text-[9px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">
                          Verified
                        </span>
                      )}
                    </h3>
                    {review.reviewer_location && (
                      <p className="text-xs text-zinc-500 mt-0.5">{review.reviewer_location}</p>
                    )}
                  </div>
                  <div className="flex gap-0.5 text-amber-400">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className={`h-3.5 w-3.5 ${i < (review.rating || 5) ? 'fill-current' : 'fill-transparent text-zinc-300'}`} />
                    ))}
                  </div>
                </div>

                {review.title && (
                  <h4 className="font-semibold text-zinc-900 mb-2 text-sm">{review.title}</h4>
                )}
                
                <p className="text-zinc-600 text-sm leading-relaxed italic">
                  "{review.comment}"
                </p>

                {review.reply && (
                  <div className="mt-6 pt-4 border-t border-zinc-100">
                    <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-2">Reply from Textile Jaipur</p>
                    <p className="text-sm text-zinc-700">{review.reply}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <Footer />
    </main>
  );
}
