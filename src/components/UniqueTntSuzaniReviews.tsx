'use client';

import React from 'react';
import { ReviewData } from './SuzaniReviews';

const reviewsData = [
  {
    initial: 'S',
    name: 'Sophie M.',
    location: '📍 Portland, OR',
    date: 'June 25, 2026',
    stars: 5,
    title: '"Breathtaking botanical embroidery"',
    body: 'The deep green floral vine embroidery is absolutely breathtaking against the textured beige cotton. The open front design makes it such an effortless layer, and the smooth mustard lining is a beautiful hidden detail! It arrived so fast with the free delivery. Truly a unique handmade piece that I get compliments on everywhere.',
    reply: 'Thank you, Sophie! The raw texture paired with that deep green embroidery is one of our favorite combinations. We\'re so glad you love it! 🌿'
  },
  {
    initial: 'E',
    name: 'Emily R.',
    location: '📍 London, UK',
    date: 'June 10, 2026',
    stars: 2,
    title: '"Delicate embroidery, but amazing support"',
    body: 'I was so excited for this jacket, but when it arrived there was a small loose thread near the raised collar. Since the thick green embroidery is so intricate, I was worried it would unravel. I reached out to customer support, and they were incredible! They instantly offered a replacement or a partial refund for me to have a local tailor secure it. I chose the refund, which hit my PayPal account immediately. The jacket itself is stunning, just be aware it\'s delicate handwork!',
    reply: 'We are so sorry about that loose thread, Emily, but we\'re thrilled our support team could resolve it quickly for you! Since every piece is embroidered by hand, they can be delicate. Thank you for your understanding! ✨'
  },
  {
    initial: 'G',
    name: 'Grace K.',
    location: '📍 Sydney, AU',
    date: 'May 28, 2026',
    stars: 5,
    title: '"Obsessed with the raw texture (and the discount!)"',
    body: 'I\'m obsessed with the raw, natural texture of the coarse cotton fabric. The way the thick green vines climb up the front is just so artistic and earthy. I paired this with a dress to get my cart over $150 and got 25% off my entire order! Such an incredible deal for this level of authentic craftsmanship.',
    reply: 'Smart shopping, Grace! 🛍️ That 25% off deal is the perfect excuse to complete an outfit. Enjoy your beautiful earthy layer!'
  },
  {
    initial: 'A',
    name: 'Ava T.',
    location: '📍 Austin, TX',
    date: 'May 15, 2026',
    stars: 4,
    title: '"Gorgeous, but a slightly warmer tone"',
    body: 'The jacket is gorgeous, though the base fabric is slightly more of a warm tan/mustard tone than the cool beige I saw on my screen. I briefly considered using their 14-day return policy, but once I put it on, I fell in love with how the dimensional green floral patterns pop. It\'s an earthy, beautiful piece that I\'ve decided to keep!',
    reply: 'Thank you for your review, Ava! You are completely right—because the fabric is raw cotton, the natural dye can vary slightly in warmth from batch to batch. We\'re so glad you decided to keep it! 🥰'
  },
  {
    initial: 'L',
    name: 'Lily B.',
    location: '📍 Toronto, ON',
    date: 'April 22, 2026',
    stars: 1,
    title: '"Rocky start, but won me over completely"',
    body: 'My initial order got mixed up in shipping and I received the wrong item, which was incredibly frustrating because I needed it for a trip. However, I have never experienced such amazing customer support. I sent them an email, and they expedited the correct jacket to me that very same day. The green embroidery on the wide cuffs is absolutely stunning. A rocky start, but they won a customer for life with how they handled it!',
    reply: 'Lily, we cannot apologize enough for that initial shipping mix-up! We know how stressful that can be before a trip. We are so happy our team could expedite the right jacket to you in time! 🙏'
  },
  {
    initial: 'Z',
    name: 'Zoe H.',
    location: '📍 Denver, CO',
    date: 'April 5, 2026',
    stars: 5,
    title: '"A true masterpiece of texture"',
    body: 'This jacket is a masterpiece. I wasn\'t expecting the inside lining to be so smooth and comfortable against the skin, especially since the outside has that beautiful textured, burlap-like raw cotton feel. The green floral design is incredibly thick and dimensional. A perfect boho statement piece.',
    reply: 'That contrast between the textured outer cotton and the smooth lining is exactly what we were going for, Zoe! Thank you for the glowing review! 🤎'
  },
  {
    initial: 'M',
    name: 'Maya S.',
    location: '📍 Seattle, WA',
    date: 'March 18, 2026',
    stars: 3,
    title: '"Stunning craftsmanship, but boxy fit"',
    body: 'The craftsmanship is top-notch, and the green botanical embroidery is stunning in person. However, the open-front fit was a bit too boxy on my petite frame. I contacted support, and they made the exchange process for a more tailored style completely painless. I\'m taking away two stars just because I wish this specific pattern came in a fitted cut, but the customer service was 5/5.',
    reply: 'Thank you for your feedback, Maya! This style is definitely designed to be a relaxed, boxy layer, but we completely understand it\'s not for everyone. We\'re so glad our team could help you exchange it for something you love!'
  }
];

export const UniqueTntSuzaniReviews: React.FC<{ dynamicReviews?: ReviewData[] }> = ({ dynamicReviews = [] }) => {
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
        <p className="text-[12px] tracking-[0.25em] text-[#c9a84c88] uppercase">Verified Reviews · Unique Cotton TNT Suzani</p>
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

