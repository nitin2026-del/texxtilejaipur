'use client';

import React from 'react';
import { ReviewData } from './SuzaniReviews';

const reviewsData = [
  {
    initial: 'C',
    name: 'Clara W.',
    location: '📍 Sedona, AZ',
    date: 'March 10, 2026',
    stars: 5,
    title: '"Surprisingly versatile!"',
    body: 'I bought this dusty rose jacket thinking it would be a statement piece for special occasions, but I actually wear it almost every day. It looks just as good thrown over a plain white tee and vintage jeans as it does over a black slip dress. The red pomegranate embroidery is so eye-catching without being overwhelming.',
    isVerified: true
  },
  {
    initial: 'N',
    name: 'Natalie P.',
    location: '📍 Brooklyn, NY',
    date: 'March 10, 2026',
    stars: 4,
    title: '"Perfect transitional weight"',
    body: 'This is the ideal jacket for that awkward weather between seasons. The velvet is plush but not suffocatingly heavy, and the striped lining breathes really well. I deducted one star because the hook-and-eye closure at the top is a bit tricky to fasten, but I usually wear it open anyway.',
    isVerified: true
  },
  {
    initial: 'J',
    name: 'Jessica H.',
    location: '📍 Santa Fe, NM',
    date: 'June 28, 2026',
    stars: 5,
    title: '"A true heirloom piece"',
    body: 'I’ve been collecting bohemian textiles for years, and the craftsmanship here is top tier. You can clearly see the hand-guided stitching in the large floral motifs. It has the weight and feel of an antique heirloom piece that I’ll be passing down to my daughter someday.',
    isVerified: true
  }
];

export const BohemianVelvetReviews: React.FC<{ dynamicReviews?: ReviewData[] }> = ({ dynamicReviews = [] }) => {
  const allReviews = [...dynamicReviews, ...reviewsData];
  const totalReviews = allReviews.length;
  
  const avgRating = totalReviews > 0 
    ? (allReviews.reduce((sum, r) => sum + r.stars, 0) / totalReviews).toFixed(1)
    : '0.0';
    
  const starsCount = [5, 4, 3, 2, 1].map(star => {
    const count = allReviews.filter(r => r.stars === star).length;
    const pct = totalReviews > 0 ? Math.round((count / totalReviews) * 100) : 0;
    return { stars: star, pct: `${pct}%`, count };
  });

  return (
    <div className="bg-[#fcf8f8] text-[#4a2e35] font-light rounded-2xl overflow-hidden mt-12 mb-12 shadow-md border border-[#c4536633]">
      <div className="text-center py-10 px-6 border-b border-[#c4536622]">
        <div className="inline-flex items-center gap-3 mb-4">
          <div className="font-serif text-[42px] font-semibold text-[#a83246] leading-none tracking-tight">
            TJ
          </div>
          <div className="text-left leading-tight">
            <span className="font-serif text-[14px] font-semibold tracking-[0.35em] text-[#a83246] uppercase block">Textile</span>
            <span className="text-[10px] tracking-[0.3em] text-[#c45366] uppercase">Jaipur</span>
          </div>
        </div>
        <h2 className="font-serif text-[clamp(24px,4vw,36px)] text-[#4a2e35] tracking-wide mb-2">What Our Customers Say</h2>
        <p className="text-[11px] tracking-[0.2em] text-[#a83246] uppercase">Verified Reviews · Bohemian Velvet Jacket</p>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-8 py-6 px-6 border-b border-[#c4536611]">
        <div className="font-serif text-[48px] font-semibold text-[#a83246] leading-none">{avgRating}</div>
        <div className="flex flex-col gap-1">
          <div className="text-[18px] text-[#a83246] tracking-widest">
            {'★'.repeat(Math.round(Number(avgRating)))}{'☆'.repeat(5 - Math.round(Number(avgRating)))}
          </div>
          <div className="text-[10px] tracking-[0.15em] text-[#c45366] uppercase">Based on {totalReviews} reviews</div>
        </div>
        <div className="flex flex-col gap-1.5">
          {starsCount.map((bar) => (
            <div key={bar.stars} className="flex items-center gap-2 text-[10px] text-[#5c3740]">
              <span className="w-4 text-right font-medium">{bar.stars}★</span>
              <div className="w-[100px] h-1.5 bg-[#fae8eb] rounded-full overflow-hidden">
                <div className="h-full bg-[#a83246] rounded-full" style={{ width: bar.pct }}></div>
              </div>
              <span className="w-3 text-right">{bar.count}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="max-w-[800px] mx-auto py-8 px-5 sm:px-8 grid grid-cols-1 md:grid-cols-2 gap-6">
        {allReviews.map((review, idx) => (
          <div key={idx} className="bg-white p-5 rounded-xl border border-[#c4536622] shadow-sm flex flex-col h-full">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 rounded-full bg-[#fceef0] text-[#a83246] flex items-center justify-center font-serif text-[14px] font-bold border border-[#c4536633] shrink-0">
                {review.initial || review.name.charAt(0)}
              </div>
              <div className="flex-1">
                <div className="font-bold text-[13px] text-[#4a2e35]">{review.name}</div>
                <div className="text-[9px] text-[#c45366] tracking-[0.1em] uppercase">{review.date}</div>
              </div>
              <div className="text-[12px] text-[#a83246] tracking-wider">
                {'★'.repeat(review.stars)}{'☆'.repeat(5 - review.stars)}
              </div>
            </div>
            {review.title && <div className="font-serif text-[14px] font-semibold text-[#4a2e35] mb-1.5">{review.title}</div>}
            <div className="text-[12.5px] leading-relaxed text-[#5c3740] flex-grow">
              {review.body}
            </div>
            {review.isVerified && (
              <div className="text-[9px] tracking-[0.1em] font-semibold text-[#a83246] uppercase mt-3">
                ✔ Verified Buyer
              </div>
            )}
            {review.reply && (
              <div className="mt-3 p-2.5 bg-[#fcf8f8] border-l-2 border-[#a83246] rounded-r text-[#5c3740] text-[12px] leading-relaxed">
                <div className="font-bold text-[10px] uppercase tracking-wider mb-0.5">TJ Official Response</div>
                {review.reply}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

