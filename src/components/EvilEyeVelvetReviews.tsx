'use client';

import React from 'react';
import { ReviewData } from './SuzaniReviews';

const reviewsData = [
  {
    initial: 'V',
    name: 'Vanessa T.',
    location: '📍 Los Angeles, CA',
    date: 'August 2, 2026',
    stars: 5,
    title: '"Wearable art!"',
    body: 'The evil eye design is an absolute showstopper! The green iris embroidery is incredibly detailed and pops beautifully against the dusty blue velvet. I get stopped in the street asking where I got this every single time I wear it. It is truly wearable art.',
    isVerified: true
  },
  {
    initial: 'R',
    name: 'Rebecca M.',
    location: '📍 Chicago, IL',
    date: 'July 18, 2026',
    stars: 2,
    title: '"Too boxy for my frame"',
    body: 'The design is bold and I love the evil eye concept, but the jacket itself is much boxier and shorter than I expected from the photos. It hits right at the widest part of my hips, which just isn\'t flattering on my curvy frame. I had to return it unfortunately.',
    isVerified: true,
    reply: 'Hi Rebecca, we understand that the cropped, boxy silhouette isn\'t for everyone! We appreciate you trying it out and are glad the return process was easy for you.'
  },
  {
    initial: 'S',
    name: 'Stella B.',
    location: '📍 Austin, TX',
    date: 'July 5, 2026',
    stars: 5,
    title: '"Perfect festival jacket"',
    body: 'I bought this specifically for a music festival and it was the perfect piece. The velvet is thick enough to keep me warm when the sun goes down, and the bold radiating eye motif gives it that perfect eclectic, bohemian vibe. Looks amazing paired with a simple slip dress or a maxi skirt.',
    isVerified: true
  },
  {
    initial: 'M',
    name: 'Maya K.',
    location: '📍 Brooklyn, NY',
    date: 'June 22, 2026',
    stars: 4,
    title: '"Incredible gift"',
    body: 'I gifted this to my sister who is obsessed with talisman and evil eye jewelry. She was absolutely blown away by it. The only reason for 4 stars instead of 5 is that I wish there was a small hidden clasp to keep it closed in the wind, but it does look gorgeous worn open.',
    isVerified: true
  },
  {
    initial: 'D',
    name: 'Diana L.',
    location: '📍 Seattle, WA',
    date: 'June 10, 2026',
    stars: 5,
    title: '"Amazing texture and 3D feel"',
    body: 'The texture of this jacket is incredible. The blue velvet is buttery soft, and the dense embroidery of the eye design gives it an amazing 3D, tactile feel. Even the striped inner lining feels high-quality and adds a fun pop of contrast. Worth every single penny.',
    isVerified: true
  }
];

export const EvilEyeVelvetReviews: React.FC<{ dynamicReviews?: ReviewData[] }> = ({ dynamicReviews = [] }) => {
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
    <div className="bg-[#f0f4f8] text-[#2c3e50] font-light rounded-2xl overflow-hidden mt-12 mb-12 shadow-md border border-[#34495e33]">
      <div className="text-center py-10 px-6 border-b border-[#34495e22]">
        <div className="inline-flex items-center gap-3 mb-4">
          <div className="font-serif text-[42px] font-semibold text-[#2980b9] leading-none tracking-tight">
            TJ
          </div>
          <div className="text-left leading-tight">
            <span className="font-serif text-[14px] font-semibold tracking-[0.35em] text-[#2980b9] uppercase block">Textile</span>
            <span className="text-[10px] tracking-[0.3em] text-[#3498db] uppercase">Jaipur</span>
          </div>
        </div>
        <h2 className="font-serif text-[clamp(24px,4vw,36px)] text-[#2c3e50] tracking-wide mb-2">What Our Customers Say</h2>
        <p className="text-[11px] tracking-[0.2em] text-[#2980b9] uppercase">Verified Reviews · Blue Evil Eye Velvet Jacket</p>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-8 py-6 px-6 border-b border-[#34495e11]">
        <div className="font-serif text-[48px] font-semibold text-[#2980b9] leading-none">{avgRating}</div>
        <div className="flex flex-col gap-1">
          <div className="text-[18px] text-[#2980b9] tracking-widest">
            {'★'.repeat(Math.round(Number(avgRating)))}{'☆'.repeat(5 - Math.round(Number(avgRating)))}
          </div>
          <div className="text-[10px] tracking-[0.15em] text-[#3498db] uppercase">Based on {totalReviews} reviews</div>
        </div>
        <div className="flex flex-col gap-1.5">
          {starsCount.map((bar) => (
            <div key={bar.stars} className="flex items-center gap-2 text-[10px] text-[#34495e]">
              <span className="w-4 text-right font-medium">{bar.stars}★</span>
              <div className="w-[100px] h-1.5 bg-[#dbe8f0] rounded-full overflow-hidden">
                <div className="h-full bg-[#2980b9] rounded-full" style={{ width: bar.pct }}></div>
              </div>
              <span className="w-3 text-right">{bar.count}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="max-w-[800px] mx-auto py-8 px-5 sm:px-8 grid grid-cols-1 md:grid-cols-2 gap-6">
        {allReviews.map((review, idx) => (
          <div key={idx} className="bg-white p-5 rounded-xl border border-[#34495e22] shadow-sm flex flex-col h-full">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 rounded-full bg-[#e3ecf3] text-[#2980b9] flex items-center justify-center font-serif text-[14px] font-bold border border-[#34495e33] shrink-0">
                {review.initial || review.name.charAt(0)}
              </div>
              <div className="flex-1">
                <div className="font-bold text-[13px] text-[#2c3e50]">{review.name}</div>
                <div className="text-[9px] text-[#3498db] tracking-[0.1em] uppercase">{review.date}</div>
              </div>
              <div className="text-[12px] text-[#2980b9] tracking-wider">
                {'★'.repeat(review.stars)}{'☆'.repeat(5 - review.stars)}
              </div>
            </div>
            {review.title && <div className="font-serif text-[14px] font-semibold text-[#2c3e50] mb-1.5">{review.title}</div>}
            <div className="text-[12.5px] leading-relaxed text-[#34495e] flex-grow">
              {review.body}
            </div>
            {review.isVerified && (
              <div className="text-[9px] tracking-[0.1em] font-semibold text-[#2980b9] uppercase mt-3">
                ✔ Verified Buyer
              </div>
            )}
            {review.reply && (
              <div className="mt-3 p-2.5 bg-[#f0f4f8] border-l-2 border-[#2980b9] rounded-r text-[#34495e] text-[12px] leading-relaxed">
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
