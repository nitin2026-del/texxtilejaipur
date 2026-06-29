'use client';

import React from 'react';
import { ReviewData } from './SuzaniReviews';

const reviewsData = [
  {
    initial: 'L',
    name: 'Lily O.',
    location: '📍 San Francisco, CA',
    date: 'August 28, 2026',
    stars: 5,
    title: '"Stunning emerald green velvet"',
    body: 'The deep emerald green velvet base is incredibly rich and shimmers beautifully in the light. The contrasting fuchsia and marigold floral medallions absolutely pop against it. It truly feels like a wearable art piece as described.',
    isVerified: true
  },
  {
    initial: 'M',
    name: 'Maria S.',
    location: '📍 Austin, TX',
    date: 'August 15, 2026',
    stars: 5,
    title: '"Amazing that it is machine washable"',
    body: 'I was very nervous about cleaning this because of the intricate hand-stitched vines and velvet base, but I followed the care instructions and machine washed it on a delicate, cold cycle. It came out looking brand new!',
    isVerified: true
  },
  {
    initial: 'S',
    name: 'Sophia W.',
    location: '📍 Chicago, IL',
    date: 'August 2, 2026',
    stars: 4,
    title: '"Elevates any simple outfit"',
    body: 'I wear this exactly as the styling guide suggested—over a simple white tee and my favorite tailored denim. It instantly transforms a boring outfit into a statement of refined bohemian luxury. I took off one star because the sleeves run a tiny bit long on me.',
    isVerified: true
  },
  {
    initial: 'E',
    name: 'Elena K.',
    location: '📍 New York, NY',
    date: 'July 20, 2026',
    stars: 5,
    title: '"Incredible Jaipur craftsmanship"',
    body: 'You can really feel the fusion of Central Asian Suzani inspiration with the traditional Jaipur handloom weaving. The texture of the handloom velvet has a unique depth that you just don\'t see in mass-produced clothing.',
    isVerified: true
  }
];

export const EmeraldBohoVelvetReviews: React.FC<{ dynamicReviews?: ReviewData[] }> = ({ dynamicReviews = [] }) => {
  const allReviews = [...dynamicReviews, ...reviewsData];
  const totalReviews = allReviews.length;
  
  const avgRating = totalReviews > 0 
    ? (allReviews.reduce((sum, r) => sum + r.stars, 0) / totalReviews).toFixed(1)
    : '0.0';

  return (
    <div className="bg-[#0f2e21] text-[#e8f0eb] py-16 px-6 mt-16 rounded-3xl mb-8 border border-[#1e4a3b]">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="font-serif text-3xl md:text-4xl text-[#a4d4b4] mb-4 tracking-wide">Customer Experiences</h2>
          <p className="text-sm text-[#73a88a] tracking-widest uppercase">Boho Chic Velvet Suzani Coat</p>
          <div className="mt-6 flex flex-col items-center justify-center">
            <div className="text-5xl font-serif text-white mb-2">{avgRating}</div>
            <div className="text-[#f7b733] text-xl tracking-widest">
              {'★'.repeat(Math.round(Number(avgRating)))}{'☆'.repeat(5 - Math.round(Number(avgRating)))}
            </div>
            <p className="text-xs text-[#73a88a] mt-2 tracking-wider">Based on {totalReviews} reviews</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {allReviews.map((review, idx) => (
            <div key={idx} className="bg-[#163c2c] border border-[#21523d] p-6 rounded-2xl shadow-lg hover:border-[#327357] transition-colors">
              <div className="flex justify-between items-start mb-4">
                <div className="flex gap-3 items-center">
                  <div className="w-10 h-10 rounded-full bg-[#0a1f16] text-[#a4d4b4] flex items-center justify-center font-serif text-lg border border-[#21523d]">
                    {review.initial || review.name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-white">{review.name}</h4>
                    <span className="text-[10px] text-[#73a88a] uppercase tracking-wider">{review.date}</span>
                  </div>
                </div>
                <div className="text-[#f7b733] text-xs tracking-widest">
                  {'★'.repeat(review.stars)}{'☆'.repeat(5 - review.stars)}
                </div>
              </div>
              {review.title && <h5 className="font-serif font-bold text-[#e8f0eb] mb-2">{review.title}</h5>}
              <p className="text-sm text-[#a4c9b6] leading-relaxed">{review.body}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
