'use client';

import React from 'react';
import { ReviewData } from './SuzaniReviews';

const reviewsData = [
  {
    initial: 'P',
    name: 'Penelope H.',
    location: '📍 Charleston, SC',
    date: 'June 10, 2026',
    stars: 5,
    title: '"Handwritten gift note!"',
    body: 'The deep crimson velvet is gorgeous, but what really blew me away was the service. I ordered this as a gift for my sister and requested a note at checkout—they actually included a beautifully penned, handwritten card in the package! Incredible touch.',
    isVerified: true
  },
  {
    initial: 'M',
    name: 'Melissa D.',
    location: '📍 Toronto, ON',
    date: 'May 22, 2026',
    stars: 4,
    title: '"Bold colors, easy care"',
    body: 'Love the bold orange and yellow embroidery against the red velvet. It arrived slightly wrinkled from international shipping, but the included care card instructed me to use a handheld steamer and it smoothed out perfectly in minutes.',
    isVerified: true
  },
  {
    initial: 'S',
    name: 'Sarah G.',
    location: '📍 Brooklyn, NY',
    date: 'April 15, 2026',
    stars: 5,
    title: '"AI Tailor got it right"',
    body: 'I was hesitant about sizing since velvet doesn\'t stretch. I used the AI sizing tool on the site and it recommended a Medium. It got my fit exactly right. Also, the thin purple and white striped lining is such a fun hidden detail!',
    isVerified: true
  },
  {
    initial: 'R',
    name: 'Rachel B.',
    location: '📍 Chicago, IL',
    date: 'March 8, 2026',
    stars: 3,
    title: '"Damaged box, safe jacket"',
    body: 'Beautiful piece, but the FedEx shipping box was completely crushed in transit. Luckily, the jacket was perfectly safe inside the complimentary cloth dust bag. Support proactively followed up via email to ensure the jacket wasn\'t harmed. Great service, bad courier.',
    isVerified: true,
    reply: 'Hi Rachel! We are so relieved the dust bag protected your beautiful jacket from the courier\'s rough handling. Thank you for letting us know! 🍷'
  }
];

export const VintageRedVelvetReviews: React.FC<{ dynamicReviews?: ReviewData[] }> = ({ dynamicReviews = [] }) => {
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
    <div className="bg-[#fcf5f6] text-[#4a242a] font-light rounded-2xl overflow-hidden mt-12 mb-12 shadow-md border border-[#9a384833]">
      <div className="text-center py-10 px-6 border-b border-[#9a384822]">
        <div className="inline-flex items-center gap-3 mb-4">
          <div className="font-serif text-[42px] font-semibold text-[#8b2636] leading-none tracking-tight">
            TJ
          </div>
          <div className="text-left leading-tight">
            <span className="font-serif text-[14px] font-semibold tracking-[0.35em] text-[#8b2636] uppercase block">Textile</span>
            <span className="text-[10px] tracking-[0.3em] text-[#9a3848] uppercase">Jaipur</span>
          </div>
        </div>
        <h2 className="font-serif text-[clamp(24px,4vw,36px)] text-[#4a242a] tracking-wide mb-2">What Our Customers Say</h2>
        <p className="text-[11px] tracking-[0.2em] text-[#8b2636] uppercase">Verified Reviews · Vintage Velvet Suzani Jacket</p>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-8 py-6 px-6 border-b border-[#9a384811]">
        <div className="font-serif text-[48px] font-semibold text-[#8b2636] leading-none">{avgRating}</div>
        <div className="flex flex-col gap-1">
          <div className="text-[18px] text-[#8b2636] tracking-widest">
            {'★'.repeat(Math.round(Number(avgRating)))}{'☆'.repeat(5 - Math.round(Number(avgRating)))}
          </div>
          <div className="text-[10px] tracking-[0.15em] text-[#9a3848] uppercase">Based on {totalReviews} reviews</div>
        </div>
        <div className="flex flex-col gap-1.5">
          {starsCount.map((bar) => (
            <div key={bar.stars} className="flex items-center gap-2 text-[10px] text-[#6c3039]">
              <span className="w-4 text-right font-medium">{bar.stars}★</span>
              <div className="w-[100px] h-1.5 bg-[#f4e4e6] rounded-full overflow-hidden">
                <div className="h-full bg-[#8b2636] rounded-full" style={{ width: bar.pct }}></div>
              </div>
              <span className="w-3 text-right">{bar.count}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="max-w-[800px] mx-auto py-8 px-5 sm:px-8 grid grid-cols-1 md:grid-cols-2 gap-6">
        {allReviews.map((review, idx) => (
          <div key={idx} className="bg-white p-5 rounded-xl border border-[#9a384822] shadow-sm flex flex-col h-full">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 rounded-full bg-[#fcf5f6] text-[#8b2636] flex items-center justify-center font-serif text-[14px] font-bold border border-[#9a384833] shrink-0">
                {review.initial || review.name.charAt(0)}
              </div>
              <div className="flex-1">
                <div className="font-bold text-[13px] text-[#4a242a]">{review.name}</div>
                <div className="text-[9px] text-[#9a3848] tracking-[0.1em] uppercase">{review.date}</div>
              </div>
              <div className="text-[12px] text-[#8b2636] tracking-wider">
                {'★'.repeat(review.stars)}{'☆'.repeat(5 - review.stars)}
              </div>
            </div>
            {review.title && <div className="font-serif text-[14px] font-semibold text-[#4a242a] mb-1.5">{review.title}</div>}
            <div className="text-[12.5px] leading-relaxed text-[#6c3039] flex-grow">
              {review.body}
            </div>
            {review.isVerified && (
              <div className="text-[9px] tracking-[0.1em] font-semibold text-[#8b2636] uppercase mt-3">
                ✔ Verified Buyer
              </div>
            )}
            {review.reply && (
              <div className="mt-3 p-2.5 bg-[#fdfafb] border-l-2 border-[#8b2636] rounded-r text-[#6c3039] text-[12px] leading-relaxed">
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
