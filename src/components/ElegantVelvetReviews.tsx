'use client';

import React from 'react';
import { ReviewData } from './SuzaniReviews';

const reviewsData = [
  {
    initial: 'C',
    name: 'Clara M.',
    location: '📍 Portland, OR',
    date: 'May 14, 2026',
    stars: 5,
    title: '"Complimentary dust bag was a surprise!"',
    body: 'The sage green velvet is gorgeous and looks amazing with jeans. I didn\'t realize it ships with a beautiful complimentary cloth dust bag! Such a premium touch for storing it safely in my closet during summer.',
    isVerified: true
  },
  {
    initial: 'J',
    name: 'Julia F.',
    location: '📍 London, UK',
    date: 'April 22, 2026',
    stars: 4,
    title: '"Boxy fit, but amazing custom service"',
    body: 'Love the red and dark blue embroidery. It fits a bit boxy on me, but their support team let me know that you can actually email them your exact measurements for a custom-tailored fit on future orders! Definitely doing that next time.',
    isVerified: true,
    reply: 'Yes, Julia! We love offering custom tailoring for our customers to ensure the absolute perfect fit. So glad you love the embroidery! ✨'
  },
  {
    initial: 'M',
    name: 'Maya S.',
    location: '📍 Austin, TX',
    date: 'April 5, 2026',
    stars: 5,
    title: '"The AI sizing tool works"',
    body: 'Stunning jacket. The velvet is super soft. I was nervous about the fit, but I used their AI Tailor sizing assistant on the website before buying and it nailed my size perfectly on the first try.',
    isVerified: true
  },
  {
    initial: 'K',
    name: 'Kelsey R.',
    location: '📍 Seattle, WA',
    date: 'March 18, 2026',
    stars: 2,
    title: '"Sleeves too long, but free returns"',
    body: 'The jacket is beautiful but the sleeves were simply too long for my petite frame (I\'m 5\'1"). I reached out to support and they instantly processed a free return label for me. Great service, just wish they had a dedicated petite line.',
    isVerified: true,
    reply: 'Hi Kelsey, we completely understand. We are actively working on a petite range for our Fall collection! Thank you for trying us out. 💛'
  },
  {
    initial: 'L',
    name: 'Lauren E.',
    location: '📍 Denver, CO',
    date: 'February 25, 2026',
    stars: 5,
    title: '"High-quality natural dyes"',
    body: 'I am so impressed. The vibrant reds and deep blues in the floral pattern don\'t bleed at all. You can tell they use premium, eco-friendly natural dyes. It feels good to support sustainable artisan fashion.',
    isVerified: true
  },
  {
    initial: 'S',
    name: 'Sarah P.',
    location: '📍 Chicago, IL',
    date: 'February 10, 2026',
    stars: 3,
    title: '"FedEx tracking issue"',
    body: 'The jacket itself is a 10/10 statement piece, but it arrived a day late for my vacation. The tracking link stopped updating for 48 hours. Support was responsive and checked on it for me, but the delay was stressful.',
    isVerified: true,
    reply: 'Sarah, we are so sorry about the carrier delay! We know how stressful that can be before a trip. We\'ve noted this with our shipping partners. ✈️'
  },
  {
    initial: 'A',
    name: 'Amanda T.',
    location: '📍 Sydney, AUS',
    date: 'January 28, 2026',
    stars: 5,
    title: '"Perfect weight"',
    body: 'The pale green color is exactly as pictured. It\'s the perfect weight for transitional weather—looks amazing just effortlessly thrown over a plain white tee and denim.',
    isVerified: true
  },
  {
    initial: 'B',
    name: 'Brittany C.',
    location: '📍 Miami, FL',
    date: 'January 15, 2026',
    stars: 4,
    title: '"Beautiful, but small pockets"',
    body: 'Gorgeous embroidery all around. My only tiny critique is the hidden pockets—they are deep enough for my keys and lip gloss, but my large phone peeks out the top. Still my new favorite piece!',
    isVerified: true
  },
  {
    initial: 'V',
    name: 'Vanessa H.',
    location: '📍 Toronto, ON',
    date: 'December 2, 2025',
    stars: 5,
    title: '"Flawless craftsmanship"',
    body: 'I used the 20% off welcome code to buy this. It shipped entirely for free and arrived to Canada in just 4 days. The hand-stitching is flawless. You are gaining a customer for life.',
    isVerified: true
  }
];

export const ElegantVelvetReviews: React.FC<{ dynamicReviews?: ReviewData[] }> = ({ dynamicReviews = [] }) => {
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
    <div className="bg-[#f2f4f1] text-[#2c3e38] font-light rounded-2xl overflow-hidden mt-12 mb-12 shadow-md border border-[#8da59855]">
      <div className="text-center py-10 px-6 border-b border-[#8da59844]">
        <div className="inline-flex items-center gap-3 mb-4">
          <div className="font-serif text-[42px] font-semibold text-[#5a7668] leading-none tracking-tight">
            TJ
          </div>
          <div className="text-left leading-tight">
            <span className="font-serif text-[14px] font-semibold tracking-[0.35em] text-[#5a7668] uppercase block">Textile</span>
            <span className="text-[10px] tracking-[0.3em] text-[#8da598] uppercase">Jaipur</span>
          </div>
        </div>
        <h2 className="font-serif text-[clamp(24px,4vw,36px)] text-[#2c3e38] tracking-wide mb-2">What Our Customers Say</h2>
        <p className="text-[11px] tracking-[0.2em] text-[#5a7668] uppercase">Verified Reviews · Elegant Velvet Suzani Jacket</p>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-8 py-6 px-6 border-b border-[#8da59833]">
        <div className="font-serif text-[48px] font-semibold text-[#5a7668] leading-none">{avgRating}</div>
        <div className="flex flex-col gap-1">
          <div className="text-[18px] text-[#5a7668] tracking-widest">
            {'★'.repeat(Math.round(Number(avgRating)))}{'☆'.repeat(5 - Math.round(Number(avgRating)))}
          </div>
          <div className="text-[10px] tracking-[0.15em] text-[#8da598] uppercase">Based on {totalReviews} reviews</div>
        </div>
        <div className="flex flex-col gap-1.5">
          {starsCount.map((bar) => (
            <div key={bar.stars} className="flex items-center gap-2 text-[10px] text-[#5a7668]">
              <span className="w-4 text-right font-medium">{bar.stars}★</span>
              <div className="w-[100px] h-1.5 bg-[#e2e6e3] rounded-full overflow-hidden">
                <div className="h-full bg-[#8da598] rounded-full" style={{ width: bar.pct }}></div>
              </div>
              <span className="w-3 text-right">{bar.count}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="max-w-[800px] mx-auto py-8 px-5 sm:px-8 grid grid-cols-1 md:grid-cols-2 gap-6">
        {allReviews.map((review, idx) => (
          <div key={idx} className="bg-white p-5 rounded-xl border border-[#8da59833] shadow-sm flex flex-col h-full">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 rounded-full bg-[#e2e6e3] text-[#5a7668] flex items-center justify-center font-serif text-[14px] font-bold shrink-0">
                {review.initial || review.name.charAt(0)}
              </div>
              <div className="flex-1">
                <div className="font-bold text-[13px] text-[#2c3e38]">{review.name}</div>
                <div className="text-[9px] text-[#8da598] tracking-[0.1em] uppercase">{review.date}</div>
              </div>
              <div className="text-[12px] text-[#5a7668] tracking-wider">
                {'★'.repeat(review.stars)}{'☆'.repeat(5 - review.stars)}
              </div>
            </div>
            {review.title && <div className="font-serif text-[14px] font-semibold text-[#2c3e38] mb-1.5">{review.title}</div>}
            <div className="text-[12.5px] leading-relaxed text-[#4a5e56] flex-grow">
              {review.body}
            </div>
            {review.isVerified && (
              <div className="text-[9px] tracking-[0.1em] font-semibold text-[#8da598] uppercase mt-3">
                ✔ Verified Buyer
              </div>
            )}
            {review.reply && (
              <div className="mt-3 p-2.5 bg-[#f5f7f4] border-l-2 border-[#8da598] rounded-r text-[#5a7668] text-[12px] leading-relaxed">
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
