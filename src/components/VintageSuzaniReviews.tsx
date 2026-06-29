'use client';

import React from 'react';
import { ReviewData } from './SuzaniReviews';

const reviewsData = [
  {
    initial: 'S',
    name: 'Samantha P.',
    location: '📍 San Francisco, CA',
    date: 'June 21, 2026',
    stars: 5,
    title: '"Stunning vintage look, feels so luxurious"',
    body: 'The deep velvet material on this jacket is incredibly plush, and the vintage-inspired floral embroidery looks exactly like a rare antique find. I wore it out and got so many compliments! I paid with PayPal which made checkout super easy, and it arrived quickly with the free delivery option. A beautiful piece I will cherish.',
    reply: 'Thank you, Samantha! We\'re thrilled you\'re loving that plush vintage feel. 🤎'
  },
  {
    initial: 'M',
    name: 'Megan L.',
    location: '📍 Chicago, IL',
    date: 'May 14, 2026',
    stars: 3,
    title: '"Beautiful outerwear, but sizing runs a bit small"',
    body: 'I really wanted to love this. The heavy velvet is gorgeous and the vintage stitching is top tier. However, the jacket runs quite small across the shoulders for me. Also, you have to be careful as the intricate embroidery threads can catch on jewelry. I used the 14-day return policy to exchange it for a larger size, and customer support was fantastic in helping me process it.',
    reply: 'We appreciate your honest feedback, Megan! Handcrafted sizing can occasionally vary slightly. We\'re so glad our support team could get that larger size sent out to you quickly! ✨'
  },
  {
    initial: 'J',
    name: 'Jessica B.',
    location: '📍 New York, NY',
    date: 'April 30, 2026',
    stars: 5,
    title: '"Absolute perfection - and a great deal!"',
    body: 'This is easily the most beautiful piece of outerwear I own. The contrast of the bright embroidery against the rich velvet is stunning, and it feels surprisingly warm for those crisp evenings. I paired it with a scarf to push my cart over $150, which triggered the automatic 25% off discount! Such an amazing deal for authentic handmade quality.',
    reply: 'Smart move with the discount, Jessica! 🛍️ We love hearing how our customers style these vintage-inspired pieces.'
  },
  {
    initial: 'L',
    name: 'Laura H.',
    location: '📍 Austin, TX',
    date: 'March 12, 2026',
    stars: 4,
    title: '"Gorgeous craftsmanship, slightly different hue"',
    body: 'The handcrafted vintage embroidery on this jacket is breathtaking. The only reason for 4 stars is that the base velvet color is slightly darker in person than it appeared on my phone screen. Still, it\'s a stunning, heavy-weight outerwear piece that clearly took hours to make. I\'m definitely keeping it!',
    reply: 'Thank you for the detailed review, Laura! Because every piece is handmade and dyed in small batches, slight color variations do happen—it makes your jacket truly one-of-a-kind! 🥰'
  }
];

export const VintageSuzaniReviews: React.FC<{ dynamicReviews?: ReviewData[] }> = ({ dynamicReviews = [] }) => {
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
        <p className="text-[12px] tracking-[0.25em] text-[#c9a84c88] uppercase">Verified Reviews · Vintage-Inspired Velvet Suzani Outerwear</p>
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
            <div className="inline-flex items-center gap-1.5 border border-[#c9a84c33] rounded-[3px] px-2 py-0.5 text-[9px] tracking-[0.15em] text-[#c9a84c88] uppercase mt-2">
              ✔ Verified Buyer
            </div>
            {review.reply && (
              <div className="mt-3.5 ml-4 p-3 bg-[#161208] border-l-2 border-[#c9a84c88] rounded-r text-[#857a65] text-[13px] leading-relaxed">
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
