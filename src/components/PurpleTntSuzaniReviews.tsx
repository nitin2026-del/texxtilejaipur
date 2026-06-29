'use client';

import React from 'react';
import { ReviewData } from './SuzaniReviews';

const reviewsData = [
  {
    initial: 'E',
    name: 'Emma T.',
    location: '📍 San Diego, CA',
    date: 'June 18, 2026',
    stars: 5,
    title: '"Beautiful Lavender Color!"',
    body: 'The light purple color is absolutely gorgeous in person. I bundled this jacket with a matching tote bag and was so happy to see the 25% off discount automatically applied in my cart!',
    isVerified: true
  },
  {
    initial: 'L',
    name: 'Lauren M.',
    location: '📍 Austin, TX',
    date: 'June 5, 2026',
    stars: 4,
    title: '"AI sizing tool was spot on"',
    body: 'The yellow and red fan-shaped flowers are stunning against the purple background. The cut is quite boxy, which I usually avoid, but the AI Tailor sizing tool on the site recommended exactly what I needed. It fits effortlessly.',
    isVerified: true
  },
  {
    initial: 'C',
    name: 'Chloe S.',
    location: '📍 Melbourne, AUS',
    date: 'May 20, 2026',
    stars: 1,
    title: '"Arrived with loose stitching, replaced instantly"',
    body: 'I loved the striped inner lining, but unfortunately, mine arrived with a section of loose stitching on the shoulder. I was frustrated, but I emailed support and they immediately sent a brand new replacement via express shipping. The best customer service recovery I\'ve ever experienced.',
    isVerified: true,
    reply: 'Chloe, we are so incredibly sorry about that stitching defect! Our quality team has been alerted. We are thrilled you received your perfect replacement quickly. 💜'
  },
  {
    initial: 'N',
    name: 'Nina R.',
    location: '📍 Portland, OR',
    date: 'May 2, 2026',
    stars: 5,
    title: '"Sustainable natural dyes"',
    body: 'I am so impressed that Textile Jaipur uses eco-friendly natural dyes. I hand-washed this in cold water (following the provided care instructions) and the vibrant yellow and red threads didn\'t bleed into the lavender fabric at all.',
    isVerified: true
  },
  {
    initial: 'A',
    name: 'Alyssa J.',
    location: '📍 London, UK',
    date: 'April 15, 2026',
    stars: 3,
    title: '"Held up in customs"',
    body: 'The craftsmanship is top-notch—truly artisan work. However, my package was delayed in customs for over a week. Support was very proactive and actually refunded my shipping costs for the inconvenience, which I really appreciated.',
    isVerified: true,
    reply: 'Hi Alyssa! We hate when international customs causes delays. We hope the shipping refund helped, and that you love your new artisan jacket! ✈️'
  },
  {
    initial: 'M',
    name: 'Megan V.',
    location: '📍 Chicago, IL',
    date: 'April 1, 2026',
    stars: 5,
    title: '"Custom tailored perfectly"',
    body: 'I am quite tall with long arms, so standard jackets rarely fit me. I emailed their team for a custom order and they tailored the sleeves to my exact measurements. It arrived in a beautiful complimentary dust bag and fits like a dream.',
    isVerified: true
  }
];

export const PurpleTntSuzaniReviews: React.FC<{ dynamicReviews?: ReviewData[] }> = ({ dynamicReviews = [] }) => {
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
    <div className="bg-[#f8f5fc] text-[#3b2a4a] font-light rounded-2xl overflow-hidden mt-12 mb-12 shadow-md border border-[#7a5c9633]">
      <div className="text-center py-10 px-6 border-b border-[#7a5c9622]">
        <div className="inline-flex items-center gap-3 mb-4">
          <div className="font-serif text-[42px] font-semibold text-[#664b82] leading-none tracking-tight">
            TJ
          </div>
          <div className="text-left leading-tight">
            <span className="font-serif text-[14px] font-semibold tracking-[0.35em] text-[#664b82] uppercase block">Textile</span>
            <span className="text-[10px] tracking-[0.3em] text-[#7a5c96] uppercase">Jaipur</span>
          </div>
        </div>
        <h2 className="font-serif text-[clamp(24px,4vw,36px)] text-[#3b2a4a] tracking-wide mb-2">What Our Customers Say</h2>
        <p className="text-[11px] tracking-[0.2em] text-[#664b82] uppercase">Verified Reviews · Purple TNT Suzani Jacket</p>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-8 py-6 px-6 border-b border-[#7a5c9611]">
        <div className="font-serif text-[48px] font-semibold text-[#664b82] leading-none">{avgRating}</div>
        <div className="flex flex-col gap-1">
          <div className="text-[18px] text-[#664b82] tracking-widest">
            {'★'.repeat(Math.round(Number(avgRating)))}{'☆'.repeat(5 - Math.round(Number(avgRating)))}
          </div>
          <div className="text-[10px] tracking-[0.15em] text-[#7a5c96] uppercase">Based on {totalReviews} reviews</div>
        </div>
        <div className="flex flex-col gap-1.5">
          {starsCount.map((bar) => (
            <div key={bar.stars} className="flex items-center gap-2 text-[10px] text-[#543b6c]">
              <span className="w-4 text-right font-medium">{bar.stars}★</span>
              <div className="w-[100px] h-1.5 bg-[#e8e2f0] rounded-full overflow-hidden">
                <div className="h-full bg-[#664b82] rounded-full" style={{ width: bar.pct }}></div>
              </div>
              <span className="w-3 text-right">{bar.count}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="max-w-[800px] mx-auto py-8 px-5 sm:px-8 grid grid-cols-1 md:grid-cols-2 gap-6">
        {allReviews.map((review, idx) => (
          <div key={idx} className="bg-white p-5 rounded-xl border border-[#7a5c9622] shadow-sm flex flex-col h-full">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 rounded-full bg-[#f4eef9] text-[#664b82] flex items-center justify-center font-serif text-[14px] font-bold border border-[#7a5c9633] shrink-0">
                {review.initial || review.name.charAt(0)}
              </div>
              <div className="flex-1">
                <div className="font-bold text-[13px] text-[#3b2a4a]">{review.name}</div>
                <div className="text-[9px] text-[#7a5c96] tracking-[0.1em] uppercase">{review.date}</div>
              </div>
              <div className="text-[12px] text-[#664b82] tracking-wider">
                {'★'.repeat(review.stars)}{'☆'.repeat(5 - review.stars)}
              </div>
            </div>
            {review.title && <div className="font-serif text-[14px] font-semibold text-[#3b2a4a] mb-1.5">{review.title}</div>}
            <div className="text-[12.5px] leading-relaxed text-[#543b6c] flex-grow">
              {review.body}
            </div>
            {review.isVerified && (
              <div className="text-[9px] tracking-[0.1em] font-semibold text-[#664b82] uppercase mt-3">
                ✔ Verified Buyer
              </div>
            )}
            {review.reply && (
              <div className="mt-3 p-2.5 bg-[#faf8fc] border-l-2 border-[#664b82] rounded-r text-[#543b6c] text-[12px] leading-relaxed">
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
