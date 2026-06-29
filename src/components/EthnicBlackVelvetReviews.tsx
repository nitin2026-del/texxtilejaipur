'use client';

import React from 'react';
import { ReviewData } from './SuzaniReviews';

const reviewsData = [
  {
    initial: 'E',
    name: 'Elena M.',
    location: '📍 Chicago, IL',
    date: 'June 28, 2026',
    stars: 5,
    title: '"Stunning yellow paisley motifs"',
    body: 'The large yellow paisley embroidery and teal vines are absolutely stunning against the dark velvet. I used the AI Tailor tool to check my measurements and it recommended the perfect size. It even shipped in a complimentary cloth dust bag which is great for safe storage in my closet!',
    isVerified: true
  },
  {
    initial: 'S',
    name: 'Sarah K.',
    location: '📍 New York, NY',
    date: 'June 15, 2026',
    stars: 3,
    title: '"Damaged shipping box, safe jacket"',
    body: 'The craftsmanship is gorgeous. However, my FedEx box was crushed during transit. Thankfully, the jacket was perfectly protected inside the thick dust bag they provide. I let support know about the courier issue and they were incredibly responsive and apologetic.',
    isVerified: true,
    reply: 'Hi Sarah! We are so sorry your local courier was rough with the package, but so glad our protective dust bag did its job! We\'ve filed a complaint with FedEx. Enjoy the jacket! 💛'
  },
  {
    initial: 'M',
    name: 'Maya R.',
    location: '📍 Toronto, ON',
    date: 'June 2, 2026',
    stars: 4,
    title: '"Natural dye process"',
    body: 'The teal and yellow colors are so vibrant. It had a faint earthy odor right out of the package due to the natural dyes, but the included care card explained how to air it out properly. The smell was gone in 24 hours. I really respect their sustainable approach to fashion!',
    isVerified: true
  }
];

export const EthnicBlackVelvetReviews: React.FC<{ dynamicReviews?: ReviewData[] }> = ({ dynamicReviews = [] }) => {
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
    <div className="bg-[#1c2226] text-[#e8ecef] font-light rounded-2xl overflow-hidden mt-12 mb-12 shadow-xl border border-[#2a343b]">
      <div className="text-center py-10 px-6 border-b border-[#2a343b]">
        <div className="inline-flex items-center gap-3 mb-4">
          <div className="font-serif text-[42px] font-semibold text-[#f2c94c] leading-none tracking-tight">
            TJ
          </div>
          <div className="text-left leading-tight">
            <span className="font-serif text-[14px] font-semibold tracking-[0.35em] text-[#f2c94c] uppercase block">Textile</span>
            <span className="text-[10px] tracking-[0.3em] text-[#869ba8] uppercase">Jaipur</span>
          </div>
        </div>
        <h2 className="font-serif text-[clamp(24px,4vw,36px)] text-[#ffffff] tracking-wide mb-2">What Our Customers Say</h2>
        <p className="text-[11px] tracking-[0.2em] text-[#869ba8] uppercase">Verified Reviews · Velvet Ethnic Embroidery Jacket</p>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-8 py-6 px-6 border-b border-[#2a343b]">
        <div className="font-serif text-[48px] font-semibold text-[#f2c94c] leading-none">{avgRating}</div>
        <div className="flex flex-col gap-1">
          <div className="text-[18px] text-[#f2c94c] tracking-widest">
            {'★'.repeat(Math.round(Number(avgRating)))}{'☆'.repeat(5 - Math.round(Number(avgRating)))}
          </div>
          <div className="text-[10px] tracking-[0.15em] text-[#869ba8] uppercase">Based on {totalReviews} reviews</div>
        </div>
        <div className="flex flex-col gap-1.5">
          {starsCount.map((bar) => (
            <div key={bar.stars} className="flex items-center gap-2 text-[10px] text-[#869ba8]">
              <span className="w-4 text-right font-medium">{bar.stars}★</span>
              <div className="w-[100px] h-1.5 bg-[#2a343b] rounded-full overflow-hidden">
                <div className="h-full bg-[#f2c94c] rounded-full" style={{ width: bar.pct }}></div>
              </div>
              <span className="w-3 text-right">{bar.count}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="max-w-[800px] mx-auto py-8 px-5 sm:px-8 grid grid-cols-1 md:grid-cols-2 gap-6">
        {allReviews.map((review, idx) => (
          <div key={idx} className="bg-[#242b30] p-5 rounded-xl border border-[#2a343b] shadow-lg flex flex-col h-full">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 rounded-full bg-[#2a343b] text-[#f2c94c] flex items-center justify-center font-serif text-[14px] font-bold shrink-0">
                {review.initial || review.name.charAt(0)}
              </div>
              <div className="flex-1">
                <div className="font-bold text-[13px] text-[#ffffff]">{review.name}</div>
                <div className="text-[9px] text-[#869ba8] tracking-[0.1em] uppercase">{review.date}</div>
              </div>
              <div className="text-[12px] text-[#f2c94c] tracking-wider">
                {'★'.repeat(review.stars)}{'☆'.repeat(5 - review.stars)}
              </div>
            </div>
            {review.title && <div className="font-serif text-[14px] font-semibold text-[#ffffff] mb-1.5">{review.title}</div>}
            <div className="text-[12.5px] leading-relaxed text-[#c3d0d8] flex-grow">
              {review.body}
            </div>
            {review.isVerified && (
              <div className="text-[9px] tracking-[0.1em] font-semibold text-[#f2c94c] uppercase mt-3">
                ✔ Verified Buyer
              </div>
            )}
            {review.reply && (
              <div className="mt-3 p-2.5 bg-[#1c2226] border-l-2 border-[#f2c94c] rounded-r text-[#97aebf] text-[12px] leading-relaxed">
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
