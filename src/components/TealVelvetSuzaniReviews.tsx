'use client';

import React from 'react';
import { ReviewData } from './SuzaniReviews';

const reviewsData = [
  {
    initial: 'C',
    name: 'Chloe W.',
    location: '📍 Chicago, IL',
    date: 'May 3, 2026',
    stars: 5,
    title: '"Obsessed with the orange and teal combination"',
    body: 'The color palette on this jacket is beyond gorgeous. The deep teal velvet makes the orange embroidered flowers just pop off the fabric! It\'s heavy enough for a chilly evening but so comfortable.',
    reply: 'Thank you Chloe! That teal and orange combination is definitely a fan favorite! 🧡'
  },
  {
    initial: 'S',
    name: 'Sarah P.',
    location: '📍 Seattle, WA',
    date: 'April 21, 2026',
    stars: 5,
    title: '"A true piece of wearable art"',
    body: 'I was hesitant about the price, but opening this package took my breath away. The velvet is luxurious and the hand embroidery is flawless. It fits beautifully and the striped lining inside is such a chic touch.',
    reply: 'We are so happy it exceeded your expectations, Sarah! Enjoy your wearable art! ✨'
  },
  {
    initial: 'K',
    name: 'Karen L.',
    location: '📍 New York, NY',
    date: 'February 10, 2026',
    stars: 4,
    title: '"Gorgeous but quite warm"',
    body: 'This jacket is stunning. The orange fan flowers are so unique and I get compliments everywhere. Just a heads up that it is quite warm because of the velvet, so definitely a fall/winter piece for me.',
    reply: 'Thanks for the review Karen! It is indeed a wonderfully warm layer for the cooler months. 🍁'
  }
];

export const TealVelvetSuzaniReviews: React.FC<{ dynamicReviews?: ReviewData[] }> = ({ dynamicReviews = [] }) => {
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
    <div className="bg-[#111111] text-[#e8dfc8] font-light rounded-2xl overflow-hidden mt-12 mb-12 shadow-2xl">
      <div className="text-center py-12 px-6 border-b border-[#c9a84c33]">
        <div className="inline-flex items-center gap-3 mb-5">
          <div className="font-serif text-[48px] font-semibold bg-gradient-to-br from-[#f0d080] via-[#c9a84c] to-[#a07820] bg-clip-text text-transparent leading-none tracking-tight">
            TJ
          </div>
          <div className="text-left leading-tight">
            <span className="font-serif text-[15px] font-semibold tracking-[0.35em] text-[#c9a84c] uppercase block">Textile</span>
            <span className="text-[10px] tracking-[0.3em] text-[#c9a84c99] uppercase">Jaipur</span>
          </div>
        </div>
        <h2 className="font-serif text-[clamp(26px,5vw,40px)] text-[#f0d080] tracking-wide mb-2">What Our Customers Say</h2>
        <p className="text-[12px] tracking-[0.25em] text-[#c9a84c88] uppercase">Verified Reviews · Teal Embroidered Velvet Jacket</p>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-8 py-8 px-6 border-b border-[#c9a84c22]">
        <div className="font-serif text-[52px] font-semibold text-[#c9a84c] leading-none">{avgRating}</div>
        <div className="flex flex-col gap-1.5">
          <div className="text-[20px] text-[#c9a84c] tracking-widest">★★★★☆</div>
          <div className="text-[11px] tracking-[0.2em] text-[#c9a84c88] uppercase">Based on {totalReviews} reviews</div>
        </div>
        <div className="flex flex-col gap-1.5">
          {starsCount.map((bar) => (
            <div key={bar.stars} className="flex items-center gap-2.5 text-[11px] text-[#c9a84c99]">
              <span className="w-4 text-right">{bar.stars}★</span>
              <div className="w-[120px] max-w-[80px] sm:max-w-[120px] h-1 bg-[#2a2a2a] rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-[#c9a84c] to-[#f0d080] rounded-full" style={{ width: bar.pct }}></div>
              </div>
              <span className="w-2">{bar.count}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="max-w-[900px] mx-auto py-10 px-5 sm:px-10 flex flex-col">
        {allReviews.map((review, idx) => (
          <div key={idx} className="border-b border-[#c9a84c18] py-8 first:pt-0 last:border-b-0">
            <div className="flex items-start gap-3.5 mb-2.5">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#1e1a10] to-[#3a2e10] border-[1.5px] border-[#c9a84c55] flex items-center justify-center font-serif text-[17px] text-[#c9a84c] font-semibold shrink-0">
                {review.initial}
              </div>
              <div className="flex-1">
                <div className="font-serif text-[16px] font-semibold text-[#f0d080] mb-0.5">{review.name}</div>
                <div className="text-[10px] text-[#c9a84c77] tracking-[0.15em] uppercase">{review.location}</div>
              </div>
              <div className="hidden sm:block text-[11px] text-[#484840] tracking-wide whitespace-nowrap mt-0.5">
                {review.date}
              </div>
            </div>
            <div className="text-[13px] tracking-widest mb-1.5">
              <span className="text-[#c9a84c]">{'★'.repeat(review.stars)}</span>
              <span className="text-[#2e2e2e]">{'★'.repeat(5 - review.stars)}</span>
            </div>
            <div className="font-serif text-[16px] italic text-[#d8cfb8] mb-1.5">{review.title}</div>
            <div className="text-[13.5px] leading-relaxed text-[#908878] max-w-[660px]">
              {review.body}
            </div>
            <div className="inline-flex items-center gap-1.5 border border-[#c9a84c33] rounded px-2 py-0.5 text-[9px] tracking-[0.15em] text-[#c9a84c88] uppercase mt-2">
              <span>✔</span> Verified Buyer
            </div>
            {review.reply && (
              <div className="mt-3.5 ml-4 p-3 bg-[#161208] border-l-2 border-[#c9a84c88] rounded-r">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="font-serif text-[13px] font-semibold bg-gradient-to-br from-[#f0d080] to-[#c9a84c] bg-clip-text text-transparent tracking-wide">
                    TJ · Textile Jaipur
                  </span>
                  <span className="text-[9px] text-[#c9a84c55] tracking-[0.18em] uppercase">Official Response</span>
                </div>
                <div className="text-[13px] leading-relaxed text-[#857a65]">
                  {review.reply}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="text-center py-10 px-6 border-t border-[#c9a84c1a]">
        <p className="text-[11px] tracking-[0.2em] text-[#c9a84c55] uppercase mb-1">Handcrafted in Jaipur, India</p>
        <h3 className="font-serif text-[18px] text-[#c9a84c88]">Free Shipping · Secure Checkout · Genuine Artisan Craft</h3>
      </div>
    </div>
  );
};
