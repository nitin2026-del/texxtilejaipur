'use client';

import React from 'react';
import { ReviewData } from './SuzaniReviews';

const reviewsData = [
  {
    initial: 'R',
    name: 'Riley B.',
    location: '📍 Austin, TX',
    date: 'June 25, 2026',
    stars: 5,
    title: '"Bundle discount and whimsical design!"',
    body: 'This jacket is so fun and whimsical! The pink horse and the hearts make it such a unique piece. I bought this using the automatic bundle discount when I added a matching tote bag to my cart. Great value for genuine artisan work.',
    isVerified: true
  },
  {
    initial: 'J',
    name: 'Jessica W.',
    location: '📍 Seattle, WA',
    date: 'June 10, 2026',
    stars: 2,
    title: '"Too long in the arms, but easy returns"',
    body: 'The black velvet is incredibly plush and high quality, but the sleeves are just way too long for my petite frame. I\'m returning it, but I have to admit their automated return portal was super easy to use and gave me a free return shipping label instantly.',
    isVerified: true,
    reply: 'Hi Jessica! We are so sorry the standard sleeve length didn\'t work out. For your next order, please feel free to email our support team with your arm measurements for custom tailoring! 🖤'
  },
  {
    initial: 'C',
    name: 'Carmen L.',
    location: '📍 Madrid, Spain',
    date: 'May 28, 2026',
    stars: 4,
    title: '"Vibrant colors on black"',
    body: 'The colorful embroidery (especially the bright blue flower and red dragonfly) really pops against the black background. It felt slightly stiff right out of the package, but the included care instructions guided me to steam it, and now it drapes beautifully.',
    isVerified: true
  },
  {
    initial: 'T',
    name: 'Tessa K.',
    location: '📍 Vancouver, BC',
    date: 'May 12, 2026',
    stars: 5,
    title: '"Perfect gift presentation"',
    body: 'Bought this as a birthday gift for my best friend. It arrived in a gorgeous complimentary cloth dust bag, which made the unboxing feel so high-end and luxurious. Also, the AI Tailor tool recommended a Large for her based on her height/weight, and the fit was spot on.',
    isVerified: true
  }
];

export const TraditionalBlackVelvetReviews: React.FC<{ dynamicReviews?: ReviewData[] }> = ({ dynamicReviews = [] }) => {
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
    <div className="bg-[#1a1a1a] text-[#e0e0e0] font-light rounded-2xl overflow-hidden mt-12 mb-12 shadow-xl border border-[#333333]">
      <div className="text-center py-10 px-6 border-b border-[#333333]">
        <div className="inline-flex items-center gap-3 mb-4">
          <div className="font-serif text-[42px] font-semibold text-[#f58da5] leading-none tracking-tight">
            TJ
          </div>
          <div className="text-left leading-tight">
            <span className="font-serif text-[14px] font-semibold tracking-[0.35em] text-[#f58da5] uppercase block">Textile</span>
            <span className="text-[10px] tracking-[0.3em] text-[#a0a0a0] uppercase">Jaipur</span>
          </div>
        </div>
        <h2 className="font-serif text-[clamp(24px,4vw,36px)] text-[#ffffff] tracking-wide mb-2">What Our Customers Say</h2>
        <p className="text-[11px] tracking-[0.2em] text-[#a0a0a0] uppercase">Verified Reviews · Traditional Embroidered Velvet Jacket</p>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-8 py-6 px-6 border-b border-[#333333]">
        <div className="font-serif text-[48px] font-semibold text-[#f58da5] leading-none">{avgRating}</div>
        <div className="flex flex-col gap-1">
          <div className="text-[18px] text-[#f58da5] tracking-widest">
            {'★'.repeat(Math.round(Number(avgRating)))}{'☆'.repeat(5 - Math.round(Number(avgRating)))}
          </div>
          <div className="text-[10px] tracking-[0.15em] text-[#a0a0a0] uppercase">Based on {totalReviews} reviews</div>
        </div>
        <div className="flex flex-col gap-1.5">
          {starsCount.map((bar) => (
            <div key={bar.stars} className="flex items-center gap-2 text-[10px] text-[#888888]">
              <span className="w-4 text-right font-medium">{bar.stars}★</span>
              <div className="w-[100px] h-1.5 bg-[#333333] rounded-full overflow-hidden">
                <div className="h-full bg-[#f58da5] rounded-full" style={{ width: bar.pct }}></div>
              </div>
              <span className="w-3 text-right">{bar.count}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="max-w-[800px] mx-auto py-8 px-5 sm:px-8 grid grid-cols-1 md:grid-cols-2 gap-6">
        {allReviews.map((review, idx) => (
          <div key={idx} className="bg-[#222222] p-5 rounded-xl border border-[#333333] shadow-lg flex flex-col h-full">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 rounded-full bg-[#333333] text-[#f58da5] flex items-center justify-center font-serif text-[14px] font-bold shrink-0">
                {review.initial || review.name.charAt(0)}
              </div>
              <div className="flex-1">
                <div className="font-bold text-[13px] text-[#ffffff]">{review.name}</div>
                <div className="text-[9px] text-[#a0a0a0] tracking-[0.1em] uppercase">{review.date}</div>
              </div>
              <div className="text-[12px] text-[#f58da5] tracking-wider">
                {'★'.repeat(review.stars)}{'☆'.repeat(5 - review.stars)}
              </div>
            </div>
            {review.title && <div className="font-serif text-[14px] font-semibold text-[#ffffff] mb-1.5">{review.title}</div>}
            <div className="text-[12.5px] leading-relaxed text-[#cccccc] flex-grow">
              {review.body}
            </div>
            {review.isVerified && (
              <div className="text-[9px] tracking-[0.1em] font-semibold text-[#f58da5] uppercase mt-3">
                ✔ Verified Buyer
              </div>
            )}
            {review.reply && (
              <div className="mt-3 p-2.5 bg-[#1a1a1a] border-l-2 border-[#f58da5] rounded-r text-[#aaaaaa] text-[12px] leading-relaxed">
                <div className="font-bold text-[10px] uppercase tracking-wider mb-0.5 text-[#ffffff]">TJ Official Response</div>
                {review.reply}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

