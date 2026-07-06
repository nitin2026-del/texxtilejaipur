'use client';

import React from 'react';
import { ReviewData } from './SuzaniReviews';

const reviewsData = [
  {
    initial: 'E',
    name: 'Elena S.',
    location: '📍 Chicago, IL',
    date: 'April 22, 2026',
    stars: 5,
    title: '"Stunning contrast and drape"',
    body: 'The contrast of the bright red, green, and blue embroidery against the dark velvet is absolutely stunning in person. I wore this to an art gallery opening recently and received so many compliments. It also has a really nice weight to the fabric that makes it drape beautifully over the shoulders.',
    isVerified: true
  },
  {
    initial: 'C',
    name: 'Chloe B.',
    location: '📍 Boston, MA',
    date: 'March 21, 2026',
    stars: 4,
    title: '"Chic structured collar"',
    body: 'The mandarin-style collar gives this jacket a really chic, slightly structured look even though the embroidery gives it a bohemian vibe. I absolutely love wearing it over a simple black turtleneck and trousers. I took off one star because I personally wish the hem was just an inch or two longer, but it\'s still quickly become one of my favorite statement pieces.',
    isVerified: true
  }
];

export const DarkPaisleyVelvetReviews: React.FC<{ dynamicReviews?: ReviewData[] }> = ({ dynamicReviews = [] }) => {
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
    <div className="bg-[#f2f4f1] text-[#2c3e38] font-light rounded-2xl overflow-hidden mt-12 mb-12 shadow-md border border-[#3e5e5433]">
      <div className="text-center py-10 px-6 border-b border-[#3e5e5422]">
        <div className="inline-flex items-center gap-3 mb-4">
          <div className="font-serif text-[42px] font-semibold text-[#1e4a3b] leading-none tracking-tight">
            TJ
          </div>
          <div className="text-left leading-tight">
            <span className="font-serif text-[14px] font-semibold tracking-[0.35em] text-[#1e4a3b] uppercase block">Textile</span>
            <span className="text-[10px] tracking-[0.3em] text-[#2f6652] uppercase">Jaipur</span>
          </div>
        </div>
        <h2 className="font-serif text-[clamp(24px,4vw,36px)] text-[#2c3e38] tracking-wide mb-2">What Our Customers Say</h2>
        <p className="text-[11px] tracking-[0.2em] text-[#1e4a3b] uppercase">Verified Reviews · Dark Paisley Velvet Jacket</p>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-8 py-6 px-6 border-b border-[#3e5e5411]">
        <div className="font-serif text-[48px] font-semibold text-[#1e4a3b] leading-none">{avgRating}</div>
        <div className="flex flex-col gap-1">
          <div className="text-[18px] text-[#1e4a3b] tracking-widest">
            {'★'.repeat(Math.round(Number(avgRating)))}{'☆'.repeat(5 - Math.round(Number(avgRating)))}
          </div>
          <div className="text-[10px] tracking-[0.15em] text-[#2f6652] uppercase">Based on {totalReviews} reviews</div>
        </div>
        <div className="flex flex-col gap-1.5">
          {starsCount.map((bar) => (
            <div key={bar.stars} className="flex items-center gap-2 text-[10px] text-[#2c3e38]">
              <span className="w-4 text-right font-medium">{bar.stars}★</span>
              <div className="w-[100px] h-1.5 bg-[#dbe6e0] rounded-full overflow-hidden">
                <div className="h-full bg-[#1e4a3b] rounded-full" style={{ width: bar.pct }}></div>
              </div>
              <span className="w-3 text-right">{bar.count}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="max-w-[800px] mx-auto py-8 px-5 sm:px-8 grid grid-cols-1 md:grid-cols-2 gap-6">
        {allReviews.map((review, idx) => (
          <div key={idx} className="bg-white p-5 rounded-xl border border-[#3e5e5422] shadow-sm flex flex-col h-full">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 rounded-full bg-[#e6eee9] text-[#1e4a3b] flex items-center justify-center font-serif text-[14px] font-bold border border-[#3e5e5433] shrink-0">
                {review.initial || review.name.charAt(0)}
              </div>
              <div className="flex-1">
                <div className="font-bold text-[13px] text-[#2c3e38]">{review.name}</div>
                <div className="text-[9px] text-[#2f6652] tracking-[0.1em] uppercase">{review.date}</div>
              </div>
              <div className="text-[12px] text-[#1e4a3b] tracking-wider">
                {'★'.repeat(review.stars)}{'☆'.repeat(5 - review.stars)}
              </div>
            </div>
            {review.title && <div className="font-serif text-[14px] font-semibold text-[#2c3e38] mb-1.5">{review.title}</div>}
            <div className="text-[12.5px] leading-relaxed text-[#3e5e54] flex-grow">
              {review.body}
            </div>
            {review.isVerified && (
              <div className="text-[9px] tracking-[0.1em] font-semibold text-[#1e4a3b] uppercase mt-3">
                ✔ Verified Buyer
              </div>
            )}
            {review.reply && (
              <div className="mt-3 p-2.5 bg-[#f2f4f1] border-l-2 border-[#1e4a3b] rounded-r text-[#3e5e54] text-[12px] leading-relaxed">
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

