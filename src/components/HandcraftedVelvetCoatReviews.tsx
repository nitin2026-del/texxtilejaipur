'use client';

import React from 'react';
import { ReviewData } from './SuzaniReviews';

const reviewsData = [
  {
    initial: 'G',
    name: 'Grace F.',
    location: '📍 London, UK',
    date: 'April 19, 2026',
    stars: 5,
    title: '"Unreal jewel tones"',
    body: 'The colors on this coat are absolutely unreal in person. The rich crimson, gold, and turquoise silk threads dance across the midnight-black velvet backdrop exactly as described. The intricate floral motifs and winding vines make it look like a museum piece.',
    isVerified: true
  },
  {
    initial: 'H',
    name: 'Hannah J.',
    location: '📍 San Diego, CA',
    date: 'April 19, 2026',
    stars: 5,
    title: '"Machine washable luxury!"',
    body: 'I was completely shocked to find out that a coat made from premium handloom fabric with this much regal elegance is actually machine washable. I washed it in cold water on a delicate cycle and the midnight-black velvet stayed plush and perfect.',
    isVerified: true
  }
];

export const HandcraftedVelvetCoatReviews: React.FC<{ dynamicReviews?: ReviewData[] }> = ({ dynamicReviews = [] }) => {
  const allReviews = [...dynamicReviews, ...reviewsData];
  const totalReviews = allReviews.length;
  
  const avgRating = totalReviews > 0 
    ? (allReviews.reduce((sum, r) => sum + r.stars, 0) / totalReviews).toFixed(1)
    : '0.0';

  return (
    <div className="bg-[#111111] text-zinc-300 py-16 px-6 mt-16 -mx-4 sm:-mx-8 lg:-mx-16">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="font-serif text-3xl md:text-4xl text-white mb-4">Artisan Reviews</h2>
          <p className="text-sm text-zinc-400 tracking-widest uppercase">Handcrafted Velvet Suzani Coat</p>
          <div className="mt-4 text-brand-400 text-xl tracking-widest">
            {'★'.repeat(Math.round(Number(avgRating)))}{'☆'.repeat(5 - Math.round(Number(avgRating)))}
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {allReviews.map((review, idx) => (
            <div key={idx} className="bg-zinc-900 border border-zinc-800 p-8 rounded-2xl">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-zinc-800 text-white flex items-center justify-center font-serif text-lg border border-zinc-700">
                    {review.initial || review.name.charAt(0)}
                  </div>
                  <div>
                    <div className="font-bold text-white text-sm">{review.name}</div>
                    <div className="text-xs text-zinc-500">{review.date}</div>
                  </div>
                </div>
                <div className="text-brand-400 text-sm">
                  {'★'.repeat(review.stars)}{'☆'.repeat(5 - review.stars)}
                </div>
              </div>
              {review.title && <div className="font-serif text-white font-bold mb-2">{review.title}</div>}
              <p className="text-sm leading-relaxed text-zinc-400">{review.body}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

