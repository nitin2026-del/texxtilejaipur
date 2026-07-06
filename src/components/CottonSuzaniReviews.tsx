'use client';

import React from 'react';
import { ReviewData } from './SuzaniReviews';

const reviewsData = [
  {
    initial: 'A',
    name: 'Annie R.',
    location: '📍 Taos, NM',
    date: 'January 15, 2026',
    stars: 5,
    title: '"My favourite piece from Textile Jaipur yet"',
    body: 'The cream cotton base with all that teal and red embroidery is just stunning — earthy and vibrant at the same time. Lighter than the velvet version, perfect for layering in spring.',
    reply: 'Annie, that means so much — especially from a returning customer! 🌿 The cotton really does have its own magic. Thank you! 🙏'
  },
  {
    initial: 'D',
    name: 'Dana F.',
    location: '📍 Bozeman, MT',
    date: 'February 1, 2026',
    stars: 5,
    title: '"Wore it on day one, haven\'t stopped"',
    body: 'Opened the package and put it straight on. The open-front style is so easy to wear and the embroidery detail — especially those fan-shaped florals — is really something special.',
    reply: 'Dana, straight out of the package — that\'s exactly what we hope for! 💛 Those fan florals are one of our favourite details too. Thank you! 🙏'
  },
  {
    initial: 'K',
    name: 'Kim B.',
    location: '📍 Nashville, TN',
    date: 'February 22, 2026',
    stars: 3,
    title: '"Pretty but wrinkles easily"',
    body: 'The embroidery is beautiful and the colors are even richer in person. Just know the cotton fabric wrinkles quite a bit in transit — needed a good steam before wearing. Wish that had been mentioned.',
    reply: 'Kim, that\'s a really practical point — thank you! Natural cotton does wrinkle during shipping and a light steam brings it right back. We\'ll add a care note to the listing. 🙏'
  },
  {
    initial: 'T',
    name: 'Teresa W.',
    location: '📍 Austin, TX',
    date: 'March 11, 2026',
    stars: 5,
    title: '"Perfect for Texas spring weather"',
    body: 'Not too heavy, not too light — this cotton jacket is ideal for mornings and evenings here. The yellow stripe lining is such a sweet surprise when you open it up.',
    reply: 'Teresa, that striped lining surprise is one of our favourite little details! ☀️ So glad it\'s fitting perfectly into your spring. Thank you! 🙏'
  },
  {
    initial: 'J',
    name: 'Jan H.',
    location: '📍 Denver, CO',
    date: 'April 5, 2026',
    stars: 1,
    title: '"Wrong item sent, took too long to fix"',
    body: 'I ordered the cotton jacket and received the velvet version instead. It took nearly two weeks of emails to get it sorted. The team did fix it eventually but the whole process was exhausting.',
    reply: 'Jan, we are truly sorry — a wrong item is a serious mistake on our end and the delay in resolving it made things worse. We\'ve reviewed our dispatch process because of this. Thank you for your patience, and please reach out if anything is still unresolved. 🙏'
  },
  {
    initial: 'M',
    name: 'Maggie O.',
    location: '📍 Scottsdale, AZ',
    date: 'May 14, 2026',
    stars: 4,
    title: '"Gorgeous — just wish it had pockets"',
    body: 'The cream and teal color combination is absolutely beautiful and the embroidery is so intricate up close. Only small gripe — no pockets! For a jacket this relaxed and boho, pockets would be perfect.',
    reply: 'Maggie, the pocket request is noted — and honestly, we agree! 😄 We\'ll pass this to our design team. Thank you for the lovely feedback! 💛'
  },
  {
    initial: 'S',
    name: 'Sandra T.',
    location: '📍 Santa Fe, NM',
    date: 'June 18, 2026',
    stars: 5,
    title: '"Timeless — nothing trendy about it, just beautiful"',
    body: 'This jacket doesn\'t follow any trend — it just exists in its own world of craft and color. The handwork is visible and meaningful. Already planning to order another color.',
    reply: 'Sandra, "its own world of craft and color" — our artisans would love to hear that. 🥹 Can\'t wait to welcome you back for your next piece! 🙏💛'
  }
];

export const CottonSuzaniReviews: React.FC<{ dynamicReviews?: ReviewData[] }> = ({ dynamicReviews = [] }) => {
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
        <p className="text-[12px] tracking-[0.25em] text-[#c9a84c88] uppercase">Verified Reviews · Cotton Suzani Jacket</p>
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

