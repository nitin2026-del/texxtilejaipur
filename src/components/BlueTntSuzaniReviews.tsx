'use client';

import React from 'react';
import { ReviewData } from './SuzaniReviews';

const reviewsData = [
  {
    initial: 'K',
    name: 'Kelsey T.',
    location: '📍 Los Angeles, CA',
    date: 'July 2, 2026',
    stars: 5,
    title: '"Bundle discount worked perfectly!"',
    body: 'The light blue fabric with the red and yellow floral embroidery is even more gorgeous in person. I bundled it with a matching tote bag and was thrilled to see the 25% off discount applied automatically at checkout!',
    isVerified: true
  },
  {
    initial: 'A',
    name: 'Amanda R.',
    location: '📍 Denver, CO',
    date: 'June 18, 2026',
    stars: 4,
    title: '"AI sizing and easy care"',
    body: 'Beautiful jacket! It arrived slightly wrinkled from transit, but the included care card clearly instructed me to steam it, and the wrinkles fell right out. The AI Tailor tool recommended a Medium and it fits exactly how I wanted.',
    isVerified: true
  },
  {
    initial: 'P',
    name: 'Penelope S.',
    location: '📍 Melbourne, AUS',
    date: 'June 5, 2026',
    stars: 2,
    title: '"Loose button, but great support"',
    body: 'The colors are vibrant and the striped lining is so cute, but one of the buttons was loose when it arrived. I contacted support and they immediately offered to cover the cost of a local tailor to fix it, or send a full replacement. Great service, but still an annoying defect.',
    isVerified: true,
    reply: 'Hi Penelope, we are so sorry about the loose button! Quality control has been alerted. We are glad our support team could resolve this quickly for you. 💙'
  },
  {
    initial: 'L',
    name: 'Laura B.',
    location: '📍 Portland, OR',
    date: 'May 22, 2026',
    stars: 5,
    title: '"Natural dyes hold up"',
    body: 'I absolutely love the sustainable, natural dyes they use. I washed it by hand in cold water (as the care card instructed), and the red and yellow threads didn\'t bleed into the light blue fabric at all. Also arrived in a lovely complimentary dust bag!',
    isVerified: true
  },
  {
    initial: 'M',
    name: 'Michelle H.',
    location: '📍 London, UK',
    date: 'May 10, 2026',
    stars: 5,
    title: '"Handwritten gift note!"',
    body: 'Stunning craftsmanship. I bought this as a gift for my sister and requested a handwritten note at checkout. They actually included a beautifully penned, personalized card in the package! She was so touched.',
    isVerified: true
  },
  {
    initial: 'J',
    name: 'Julia F.',
    location: '📍 Dublin, IRE',
    date: 'April 28, 2026',
    stars: 3,
    title: '"Slow shipping to Ireland"',
    body: 'The jacket itself is a work of art, but shipping took almost 2.5 weeks to get to me. However, their support team was incredibly proactive, kept me updated the whole time, and even refunded my shipping cost for the delay.',
    isVerified: true,
    reply: 'Julia, we apologize again for that unexpected customs delay! We hope the shipping refund helped make up for the wait.'
  },
  {
    initial: 'C',
    name: 'Chloe D.',
    location: '📍 Chicago, IL',
    date: 'April 15, 2026',
    stars: 5,
    title: '"Custom sleeve tailoring"',
    body: 'I am very petite and standard jackets usually drown me. I emailed their support team and they actually custom-tailored the sleeve length perfectly for me before shipping it out! Unbeatable customer service.',
    isVerified: true
  }
];

export const BlueTntSuzaniReviews: React.FC<{ dynamicReviews?: ReviewData[] }> = ({ dynamicReviews = [] }) => {
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
    <div className="bg-[#f0f6fa] text-[#2c4059] font-light rounded-2xl overflow-hidden mt-12 mb-12 shadow-md border border-[#5b8ab533]">
      <div className="text-center py-10 px-6 border-b border-[#5b8ab522]">
        <div className="inline-flex items-center gap-3 mb-4">
          <div className="font-serif text-[42px] font-semibold text-[#3a6894] leading-none tracking-tight">
            TJ
          </div>
          <div className="text-left leading-tight">
            <span className="font-serif text-[14px] font-semibold tracking-[0.35em] text-[#3a6894] uppercase block">Textile</span>
            <span className="text-[10px] tracking-[0.3em] text-[#5b8ab5] uppercase">Jaipur</span>
          </div>
        </div>
        <h2 className="font-serif text-[clamp(24px,4vw,36px)] text-[#2c4059] tracking-wide mb-2">What Our Customers Say</h2>
        <p className="text-[11px] tracking-[0.2em] text-[#3a6894] uppercase">Verified Reviews · Blue TNT Suzani Jacket</p>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-8 py-6 px-6 border-b border-[#5b8ab511]">
        <div className="font-serif text-[48px] font-semibold text-[#3a6894] leading-none">{avgRating}</div>
        <div className="flex flex-col gap-1">
          <div className="text-[18px] text-[#3a6894] tracking-widest">
            {'★'.repeat(Math.round(Number(avgRating)))}{'☆'.repeat(5 - Math.round(Number(avgRating)))}
          </div>
          <div className="text-[10px] tracking-[0.15em] text-[#5b8ab5] uppercase">Based on {totalReviews} reviews</div>
        </div>
        <div className="flex flex-col gap-1.5">
          {starsCount.map((bar) => (
            <div key={bar.stars} className="flex items-center gap-2 text-[10px] text-[#425a75]">
              <span className="w-4 text-right font-medium">{bar.stars}★</span>
              <div className="w-[100px] h-1.5 bg-[#dbe6f0] rounded-full overflow-hidden">
                <div className="h-full bg-[#3a6894] rounded-full" style={{ width: bar.pct }}></div>
              </div>
              <span className="w-3 text-right">{bar.count}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="max-w-[800px] mx-auto py-8 px-5 sm:px-8 grid grid-cols-1 md:grid-cols-2 gap-6">
        {allReviews.map((review, idx) => (
          <div key={idx} className="bg-white p-5 rounded-xl border border-[#5b8ab522] shadow-sm flex flex-col h-full">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 rounded-full bg-[#e3eef7] text-[#3a6894] flex items-center justify-center font-serif text-[14px] font-bold border border-[#5b8ab533] shrink-0">
                {review.initial || review.name.charAt(0)}
              </div>
              <div className="flex-1">
                <div className="font-bold text-[13px] text-[#2c4059]">{review.name}</div>
                <div className="text-[9px] text-[#5b8ab5] tracking-[0.1em] uppercase">{review.date}</div>
              </div>
              <div className="text-[12px] text-[#3a6894] tracking-wider">
                {'★'.repeat(review.stars)}{'☆'.repeat(5 - review.stars)}
              </div>
            </div>
            {review.title && <div className="font-serif text-[14px] font-semibold text-[#2c4059] mb-1.5">{review.title}</div>}
            <div className="text-[12.5px] leading-relaxed text-[#425a75] flex-grow">
              {review.body}
            </div>
            {review.isVerified && (
              <div className="text-[9px] tracking-[0.1em] font-semibold text-[#3a6894] uppercase mt-3">
                ✔ Verified Buyer
              </div>
            )}
            {review.reply && (
              <div className="mt-3 p-2.5 bg-[#f6f9fc] border-l-2 border-[#3a6894] rounded-r text-[#425a75] text-[12px] leading-relaxed">
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
