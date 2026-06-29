'use client';

import React from 'react';
import { ReviewData } from './SuzaniReviews';

const reviewsData = [
  {
    initial: 'V',
    name: 'Victoria L.',
    location: '📍 Denver, CO',
    date: 'June 20, 2026',
    stars: 5,
    title: '"AI sizing and beautiful packaging"',
    body: 'The taupe velvet paired with the bright blue floral embroidery is such a unique and stunning combination. I was unsure about sizing, but the AI Tailor tool on the site recommended the perfect fit. Also, I love that it ships with a complimentary cloth dust bag for safe storage!',
    isVerified: true
  },
  {
    initial: 'D',
    name: 'Diana C.',
    location: '📍 London, UK',
    date: 'June 8, 2026',
    stars: 4,
    title: '"Stunning, great customer support"',
    body: 'The hand-stitching is impeccable. It arrived with a slight crease from international shipping, but the included care card explained exactly how to steam it out safely. I even emailed support to ask about getting custom sleeve lengths for my next order and they were incredibly helpful and accommodating.',
    isVerified: true
  }
];

export const LuxuryBrownVelvetReviews: React.FC<{ dynamicReviews?: ReviewData[] }> = ({ dynamicReviews = [] }) => {
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
    <div className="bg-[#f5f2ee] text-[#4a3e35] font-light rounded-2xl overflow-hidden mt-12 mb-12 shadow-md border border-[#8a725833]">
      <div className="text-center py-10 px-6 border-b border-[#8a725822]">
        <div className="inline-flex items-center gap-3 mb-4">
          <div className="font-serif text-[42px] font-semibold text-[#665440] leading-none tracking-tight">
            TJ
          </div>
          <div className="text-left leading-tight">
            <span className="font-serif text-[14px] font-semibold tracking-[0.35em] text-[#665440] uppercase block">Textile</span>
            <span className="text-[10px] tracking-[0.3em] text-[#8a7258] uppercase">Jaipur</span>
          </div>
        </div>
        <h2 className="font-serif text-[clamp(24px,4vw,36px)] text-[#4a3e35] tracking-wide mb-2">What Our Customers Say</h2>
        <p className="text-[11px] tracking-[0.2em] text-[#665440] uppercase">Verified Reviews · Women's Luxury Velvet Suzani Jacket</p>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-8 py-6 px-6 border-b border-[#8a725811]">
        <div className="font-serif text-[48px] font-semibold text-[#665440] leading-none">{avgRating}</div>
        <div className="flex flex-col gap-1">
          <div className="text-[18px] text-[#665440] tracking-widest">
            {'★'.repeat(Math.round(Number(avgRating)))}{'☆'.repeat(5 - Math.round(Number(avgRating)))}
          </div>
          <div className="text-[10px] tracking-[0.15em] text-[#8a7258] uppercase">Based on {totalReviews} reviews</div>
        </div>
        <div className="flex flex-col gap-1.5">
          {starsCount.map((bar) => (
            <div key={bar.stars} className="flex items-center gap-2 text-[10px] text-[#554636]">
              <span className="w-4 text-right font-medium">{bar.stars}★</span>
              <div className="w-[100px] h-1.5 bg-[#e8e2da] rounded-full overflow-hidden">
                <div className="h-full bg-[#665440] rounded-full" style={{ width: bar.pct }}></div>
              </div>
              <span className="w-3 text-right">{bar.count}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="max-w-[800px] mx-auto py-8 px-5 sm:px-8 grid grid-cols-1 md:grid-cols-2 gap-6">
        {allReviews.map((review, idx) => (
          <div key={idx} className="bg-white p-5 rounded-xl border border-[#8a725822] shadow-sm flex flex-col h-full">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 rounded-full bg-[#f0eadd] text-[#665440] flex items-center justify-center font-serif text-[14px] font-bold border border-[#8a725833] shrink-0">
                {review.initial || review.name.charAt(0)}
              </div>
              <div className="flex-1">
                <div className="font-bold text-[13px] text-[#4a3e35]">{review.name}</div>
                <div className="text-[9px] text-[#8a7258] tracking-[0.1em] uppercase">{review.date}</div>
              </div>
              <div className="text-[12px] text-[#665440] tracking-wider">
                {'★'.repeat(review.stars)}{'☆'.repeat(5 - review.stars)}
              </div>
            </div>
            {review.title && <div className="font-serif text-[14px] font-semibold text-[#4a3e35] mb-1.5">{review.title}</div>}
            <div className="text-[12.5px] leading-relaxed text-[#554636] flex-grow">
              {review.body}
            </div>
            {review.isVerified && (
              <div className="text-[9px] tracking-[0.1em] font-semibold text-[#665440] uppercase mt-3">
                ✔ Verified Buyer
              </div>
            )}
            {review.reply && (
              <div className="mt-3 p-2.5 bg-[#faf6f0] border-l-2 border-[#665440] rounded-r text-[#554636] text-[12px] leading-relaxed">
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
