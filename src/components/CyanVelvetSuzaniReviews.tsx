'use client';

import React from 'react';
import { ReviewData } from './SuzaniReviews';

const reviewsData = [
  {
    initial: 'R',
    name: 'Rachel V.',
    location: '📍 Miami, FL',
    date: 'March 23, 2026',
    stars: 5,
    title: '"Vibrant cyan & bundle discount"',
    body: 'The bright cyan velvet is absolutely gorgeous in person, and the brown and white floral embroidery provides such a cool contrast. I bundled this with a matching tote bag and was thrilled to see the 25% off discount applied automatically at checkout!',
    isVerified: true
  },
  {
    initial: 'K',
    name: 'Kaitlyn S.',
    location: '📍 Chicago, IL',
    date: 'March 23, 2026',
    stars: 4,
    title: '"AI sizing and easy to steam"',
    body: 'The AI Tailor tool suggested a Medium, and it fits exactly how I wanted. It arrived slightly creased from shipping, but the included care card instructed me to steam it on low heat inside-out, and the wrinkles fell right out. Beautiful craftsmanship.',
    isVerified: true
  },
  {
    initial: 'M',
    name: 'Michelle T.',
    location: '📍 Vancouver, BC',
    date: 'June 20, 2026',
    stars: 3,
    title: '"Delayed shipping, excellent support"',
    body: 'Shipping to Canada was unfortunately delayed by customs for over a week. However, the support team was incredibly proactive in updating me and even refunded my shipping costs for the inconvenience. The striped lining is a really fun detail.',
    isVerified: true,
    reply: 'Hi Michelle! We are so sorry for the international customs delay, but we hope the shipping refund helped! 💙'
  },
  {
    initial: 'S',
    name: 'Samantha L.',
    location: '📍 London, UK',
    date: 'June 10, 2026',
    stars: 5,
    title: '"Free custom tailoring"',
    body: 'I am very petite and standard sizes often overwhelm my frame. I emailed them before ordering, and they actually custom tailored the sleeves for me for free! It fits perfectly. The complimentary cloth dust bag it arrived in is a nice premium touch too.',
    isVerified: true
  },
  {
    initial: 'E',
    name: 'Elena C.',
    location: '📍 Austin, TX',
    date: 'May 25, 2026',
    stars: 5,
    title: '"Sustainable dyes hold up"',
    body: 'I really respect their commitment to sustainable natural dyes. I hand washed this in cold water (following the provided care instructions) and the vibrant cyan color did not bleed or fade at all. Incredible genuine artisan work.',
    isVerified: true
  }
];

export const CyanVelvetSuzaniReviews: React.FC<{ dynamicReviews?: ReviewData[] }> = ({ dynamicReviews = [] }) => {
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
    <div className="bg-[#f0f8fb] text-[#1f4a5c] font-light rounded-2xl overflow-hidden mt-12 mb-12 shadow-md border border-[#00b4d833]">
      <div className="text-center py-10 px-6 border-b border-[#00b4d822]">
        <div className="inline-flex items-center gap-3 mb-4">
          <div className="font-serif text-[42px] font-semibold text-[#0077b6] leading-none tracking-tight">
            TJ
          </div>
          <div className="text-left leading-tight">
            <span className="font-serif text-[14px] font-semibold tracking-[0.35em] text-[#0077b6] uppercase block">Textile</span>
            <span className="text-[10px] tracking-[0.3em] text-[#0096c7] uppercase">Jaipur</span>
          </div>
        </div>
        <h2 className="font-serif text-[clamp(24px,4vw,36px)] text-[#023e8a] tracking-wide mb-2">What Our Customers Say</h2>
        <p className="text-[11px] tracking-[0.2em] text-[#0077b6] uppercase">Verified Reviews · Cyan Velvet Suzani Jacket</p>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-8 py-6 px-6 border-b border-[#00b4d811]">
        <div className="font-serif text-[48px] font-semibold text-[#0077b6] leading-none">{avgRating}</div>
        <div className="flex flex-col gap-1">
          <div className="text-[18px] text-[#0077b6] tracking-widest">
            {'★'.repeat(Math.round(Number(avgRating)))}{'☆'.repeat(5 - Math.round(Number(avgRating)))}
          </div>
          <div className="text-[10px] tracking-[0.15em] text-[#0096c7] uppercase">Based on {totalReviews} reviews</div>
        </div>
        <div className="flex flex-col gap-1.5">
          {starsCount.map((bar) => (
            <div key={bar.stars} className="flex items-center gap-2 text-[10px] text-[#03045e]">
              <span className="w-4 text-right font-medium">{bar.stars}★</span>
              <div className="w-[100px] h-1.5 bg-[#caf0f8] rounded-full overflow-hidden">
                <div className="h-full bg-[#0077b6] rounded-full" style={{ width: bar.pct }}></div>
              </div>
              <span className="w-3 text-right">{bar.count}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="max-w-[800px] mx-auto py-8 px-5 sm:px-8 grid grid-cols-1 md:grid-cols-2 gap-6">
        {allReviews.map((review, idx) => (
          <div key={idx} className="bg-white p-5 rounded-xl border border-[#00b4d822] shadow-sm flex flex-col h-full">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 rounded-full bg-[#ade8f4] text-[#0077b6] flex items-center justify-center font-serif text-[14px] font-bold border border-[#00b4d833] shrink-0">
                {review.initial || review.name.charAt(0)}
              </div>
              <div className="flex-1">
                <div className="font-bold text-[13px] text-[#023e8a]">{review.name}</div>
                <div className="text-[9px] text-[#0096c7] tracking-[0.1em] uppercase">{review.date}</div>
              </div>
              <div className="text-[12px] text-[#0077b6] tracking-wider">
                {'★'.repeat(review.stars)}{'☆'.repeat(5 - review.stars)}
              </div>
            </div>
            {review.title && <div className="font-serif text-[14px] font-semibold text-[#023e8a] mb-1.5">{review.title}</div>}
            <div className="text-[12.5px] leading-relaxed text-[#03045e] flex-grow">
              {review.body}
            </div>
            {review.isVerified && (
              <div className="text-[9px] tracking-[0.1em] font-semibold text-[#0077b6] uppercase mt-3">
                ✔ Verified Buyer
              </div>
            )}
            {review.reply && (
              <div className="mt-3 p-2.5 bg-[#f0f8fb] border-l-2 border-[#0077b6] rounded-r text-[#03045e] text-[12px] leading-relaxed">
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

