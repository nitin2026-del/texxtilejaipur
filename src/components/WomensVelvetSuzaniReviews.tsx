'use client';

import React from 'react';
import { ReviewData } from './SuzaniReviews';

const reviewsData = [
  {
    initial: 'S',
    name: 'Sarah M.',
    location: '📍 Portland, OR',
    date: 'August 10, 2026',
    stars: 5,
    title: '"Surprisingly Machine Washable!"',
    body: 'I was hesitant to buy a velvet jacket with such intricate embroidery because I hate going to the dry cleaner. I was shocked to see the care instructions say machine washable! I ran it on a delicate, cold cycle inside a mesh bag and it came out perfectly. The premium fabric held up beautifully.',
    isVerified: true
  },
  {
    initial: 'L',
    name: 'Lauren K.',
    location: '📍 New York, NY',
    date: 'August 2, 2026',
    stars: 5,
    title: '"Incredible Jaipur Craftsmanship"',
    body: 'You can instantly feel the premium quality of the fabric when you touch it. Knowing this was tailored in the historic heart of Jaipur makes it feel so special. The hand-embroidered floral motifs are raised slightly off the fabric, giving it a stunning 3D texture.',
    isVerified: true
  },
  {
    initial: 'M',
    name: 'Maya R.',
    location: '📍 Austin, TX',
    date: 'July 18, 2026',
    stars: 4,
    title: '"Beautiful contemporary structure"',
    body: 'Sometimes ethnic jackets can feel a bit boxy, but this one has a wonderful contemporary structure that flatters the shoulders. The floral motifs are bold but elegant. I took off one star because I wish the lining was silk, but it still feels great.',
    isVerified: true
  },
  {
    initial: 'J',
    name: 'Jessica W.',
    location: '📍 London, UK',
    date: 'July 5, 2026',
    stars: 5,
    title: '"Perfect styling advice"',
    body: 'I followed the brand\'s styling advice and wore this over a minimalist silk slip dress. It looked absolutely breathtaking! The vibrant embroidery commanded the room just like they promised. A true statement piece.',
    isVerified: true
  },
  {
    initial: 'E',
    name: 'Emma T.',
    location: '📍 Sydney, AU',
    date: 'June 22, 2026',
    stars: 5,
    title: '"A living canvas"',
    body: 'The description calls it a \'living canvas of breathtaking artistry\' and they aren\'t lying. The majestic symphony of colors against the dark velvet is mesmerizing. It feels like an heirloom I will pass down to my daughter.',
    isVerified: true
  }
];

export const WomensVelvetSuzaniReviews: React.FC<{ dynamicReviews?: ReviewData[] }> = ({ dynamicReviews = [] }) => {
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
        <h2 className="font-serif text-[clamp(24px,4vw,36px)] text-[#2c3e38] tracking-wide mb-2">Customer Experiences</h2>
        <p className="text-[11px] tracking-[0.2em] text-[#1e4a3b] uppercase">Women's Velvet Suzani Jacket</p>
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
          </div>
        ))}
      </div>
    </div>
  );
};
