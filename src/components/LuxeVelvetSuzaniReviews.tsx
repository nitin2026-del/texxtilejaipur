'use client';

import React from 'react';
import { ReviewData } from './SuzaniReviews';

const reviewsData = [
  {
    initial: 'S',
    name: 'Sarah Jenkins',
    location: '📍 Austin, TX',
    date: 'February 15, 2026',
    stars: 5,
    title: '"A wearable work of art!"',
    body: 'I wore this to an art gallery opening last weekend and was stopped by three different people asking where I bought it. The weight of the velvet feels incredibly luxurious—not flimsy at all. The hand-stitched floral motifs pop beautifully against the dark background. It drapes perfectly over a simple slip dress or just with jeans.',
    isVerified: true
  },
  {
    initial: 'M',
    name: 'Maria G.',
    location: '📍 Santa Fe, NM',
    date: 'January 28, 2026',
    stars: 4,
    title: '"Stunning, but runs a bit large"',
    body: 'The craftsmanship on this jacket rivals pieces I\'ve seen in high-end boutiques downtown for triple the price. The only reason I\'m giving it 4 stars is that the fit is quite oversized. I wanted a more tailored look, so I ended up exchanging it for a size down. The exchange process was smooth though!',
    isVerified: true,
    reply: 'Thank you for the detailed feedback, Maria! We designed this silhouette to be a relaxed, bohemian fit, but we completely understand wanting a more tailored look. We\'re glad the exchange process was easy for you! ✨'
  },
  {
    initial: 'J',
    name: 'Jessica W.',
    location: '📍 Seattle, WA',
    date: 'December 12, 2025',
    stars: 1,
    title: '"Arrived with a torn lining, but support was amazing"',
    body: 'I was so disappointed when I opened my package. The embroidery was gorgeous, but there was a significant tear in the inner silk-blend lining near the armpit. However, I emailed customer support with a photo, and within 2 hours they had issued a full replacement and let me keep the original to patch up. Five stars for the customer service via PayPal, but one star for the initial quality control.',
    isVerified: true,
    reply: 'Jessica, we are so incredibly sorry about the lining! Our quality control team has been alerted so this doesn\'t happen again. We are glad we could make it right for you quickly! 💛'
  },
  {
    initial: 'L',
    name: 'Linda T.',
    location: '📍 London, UK',
    date: 'November 5, 2025',
    stars: 5,
    title: '"The ultimate fall statement piece"',
    body: 'The contrast between the deep, plush velvet and the vibrant embroidery threads is mesmerizing. It has a beautiful weight to it that keeps you warm on crisp autumn days without needing a heavy coat underneath. Honestly, the photos on the website don\'t do justice to how rich the colors are in natural sunlight.',
    isVerified: true
  },
  {
    initial: 'R',
    name: 'Rachel B.',
    location: '📍 Chicago, IL',
    date: 'October 19, 2025',
    stars: 3,
    title: '"Gorgeous but heavier than expected"',
    body: 'Don\'t get me wrong, the needlework is flawless and the velvet is incredibly soft. However, this jacket is much heavier and warmer than I anticipated. I bought it hoping to wear it on cool summer evenings, but it\'s definitely strictly a late fall/winter piece for me.',
    isVerified: true,
    reply: 'Hi Rachel! You are absolutely right—our velvet suzani jackets are fully lined and quite warm. We recommend checking out our Cotton TNT Suzani jackets for a lightweight summer option! 🌿'
  },
  {
    initial: 'A',
    name: 'Amanda C.',
    location: '📍 Denver, CO',
    date: 'September 22, 2025',
    stars: 5,
    title: '"Best gift I\'ve ever given"',
    body: 'I bought this as a 50th birthday present for my sister who loves vintage-inspired fashion. It arrived beautifully packaged, and she literally gasped when she opened it. The hand-embroidery is so meticulous, you can tell it took weeks to create. She wears it constantly.',
    isVerified: true
  },
  {
    initial: 'C',
    name: 'Chloe V.',
    location: '📍 New York, NY',
    date: 'August 14, 2025',
    stars: 4,
    title: '"Love it, but wish it had deeper pockets"',
    body: 'The luxe style is undeniable. It feels like wearing a piece of history. My only slight critique is the pockets—they are placed beautifully so they don\'t disrupt the embroidery pattern, but they are a bit too shallow to safely hold my large smartphone.',
    isVerified: true
  },
  {
    initial: 'D',
    name: 'Daniella P.',
    location: '📍 Miami, FL',
    date: 'July 3, 2025',
    stars: 5,
    title: '"Exquisite detailing!"',
    body: 'I was hesitant to buy clothing through an Instagram ad, but this exceeded all expectations. Every single flower is outlined with such precision. Even the collar is embroidered on the inside so it looks beautiful when popped up. Worth every single penny.',
    isVerified: true,
    reply: 'We love that you noticed the collar detailing, Daniella! Our artisans take immense pride in those small finishing touches. ✨'
  },
  {
    initial: 'K',
    name: 'Karen H.',
    location: '📍 Toronto, ON',
    date: 'June 10, 2025',
    stars: 5,
    title: '"Absolutely flawless"',
    body: 'This is my third purchase from Textile Jaipur and they never miss. The velvet has a gorgeous sheen that catches the light, and the interior lining is so soft against the skin. It arrived to Canada in just under a week, which was impressively fast.',
    isVerified: true
  }
];

export const LuxeVelvetSuzaniReviews: React.FC<{ dynamicReviews?: ReviewData[] }> = ({ dynamicReviews = [] }) => {
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
    <div className="bg-[#1a1518] text-[#e8dfc8] font-light rounded-2xl overflow-hidden mt-12 mb-12 shadow-2xl border border-[#c9a84c22]">
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
        <p className="text-[12px] tracking-[0.25em] text-[#c9a84c88] uppercase">Verified Reviews · Luxe Velvet Suzani Jacket</p>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-8 py-8 px-6 border-b border-[#c9a84c22]">
        <div className="font-serif text-[52px] font-semibold text-[#c9a84c] leading-none">{avgRating}</div>
        <div className="flex flex-col gap-1.5">
          <div className="text-[20px] text-[#c9a84c] tracking-widest">
            {'★'.repeat(Math.round(Number(avgRating)))}{'☆'.repeat(5 - Math.round(Number(avgRating)))}
          </div>
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
                {review.initial || review.name.charAt(0)}
              </div>
              <div className="flex-1">
                <div className="font-serif text-[16px] font-semibold text-[#f0d080] mb-0.5">{review.name}</div>
                {review.location && <div className="text-[10px] text-[#c9a84c77] tracking-[0.15em] uppercase">{review.location}</div>}
              </div>
              <div className="text-[11px] text-[#484840] tracking-[0.05em] whitespace-nowrap mt-0.5 hidden sm:block">
                {review.date}
              </div>
            </div>
            <div className="text-[13px] tracking-widest mb-1.5">
              <span className="text-[#c9a84c]">{'★'.repeat(review.stars)}</span>
              <span className="text-[#2e2e2e]">{'★'.repeat(5 - review.stars)}</span>
            </div>
            {review.title && <div className="font-serif text-[16px] italic text-[#d8cfb8] mb-1.5">{review.title}</div>}
            <div className="text-[13.5px] leading-relaxed text-[#908878] max-w-[660px]">
              {review.body}
            </div>
            {review.isVerified && (
              <div className="inline-flex items-center gap-1.5 border border-[#c9a84c33] rounded-[3px] px-2 py-0.5 text-[9px] tracking-[0.15em] text-[#c9a84c88] uppercase mt-2">
                ✔ Verified Buyer
              </div>
            )}
            {review.reply && (
              <div className="mt-3.5 ml-4 p-3 bg-[#241d21] border-l-2 border-[#c9a84c88] rounded-r text-[#9e9282] text-[13px] leading-relaxed shadow-sm">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-serif font-semibold bg-gradient-to-br from-[#f0d080] to-[#c9a84c] bg-clip-text text-transparent tracking-[0.05em]">TJ · Textile Jaipur</span>
                  <span className="text-[9px] text-[#c9a84c55] tracking-[0.18em] uppercase">Official Response</span>
                </div>
                {review.reply}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
