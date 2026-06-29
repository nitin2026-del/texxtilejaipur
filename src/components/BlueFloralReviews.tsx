'use client';

import React from 'react';
import { ReviewData } from './SuzaniReviews';

import React from 'react';

const reviewsData = [
  {
    initial: 'H',
    name: 'Hannah W.',
    location: '📍 Sedona, AZ',
    date: 'January 9, 2026',
    stars: 5,
    title: '"Like wearing a garden"',
    body: 'The poppy embroidery on this blue velvet is just breathtaking — every stem and petal feels hand-placed. It\'s the kind of jacket people stop you on the street to ask about.',
    reply: '"Like wearing a garden" — Hannah, that is poetry! 🌺 Every stitch truly is placed by hand in Jaipur. Thank you so much! 🙏'
  },
  {
    initial: 'N',
    name: 'Nina C.',
    location: '📍 Portland, OR',
    date: 'January 28, 2026',
    stars: 5,
    title: '"The blue is even more beautiful in person"',
    body: 'I was worried the color might look different but it\'s actually richer and deeper in real life. The orange poppies against the dusty blue velvet are stunning — very painterly.',
    reply: 'So glad the color exceeded expectations, Nina! That dusty blue velvet is one of our favourites too. 💙 Thank you for sharing! 🙏'
  },
  {
    initial: 'P',
    name: 'Patricia L.',
    location: '📍 Santa Fe, NM',
    date: 'February 12, 2026',
    stars: 3,
    title: '"Pretty jacket, loose embroidery thread on sleeve"',
    body: 'I love the design but noticed a loose embroidery thread on one sleeve when it arrived. Easy enough to trim, but for the price I\'d expect tighter finishing. Still wearing it though!',
    reply: 'Patricia, thank you for flagging this — it\'s not the finish we aim for. We\'ve passed this to our QC team. Please reach out if we can make it right for you. 🙏'
  },
  {
    initial: 'G',
    name: 'Grace M.',
    location: '📍 Nashville, TN',
    date: 'March 3, 2026',
    stars: 5,
    title: '"My most-complimented piece this year"',
    body: 'Wore this to a brunch and couldn\'t stop answering "where did you get that jacket?" The open-front style is so relaxed and flattering, and the floral embroidery is genuinely one-of-a-kind.',
    reply: 'Grace, brunch compliments are the best kind! 🌸 So happy this piece is getting the attention it deserves. Thank you! 🙏'
  },
  {
    initial: 'E',
    name: 'Ellen B.',
    location: '📍 Denver, CO',
    date: 'March 22, 2026',
    stars: 1,
    title: '"Arrived damaged — disappointed"',
    body: 'The jacket came with a small tear near the lining seam. I contacted support and got a resolution, but the back-and-forth took over a week. Beautiful product when it\'s right, but this was a letdown.',
    reply: 'Ellen, we\'re truly sorry — a damaged item is completely unacceptable and the delay in sorting it made things worse. We\'ve reviewed this internally. Please reach out again if anything is still unresolved. 🙏'
  },
  {
    initial: 'C',
    name: 'Claire D.',
    location: '📍 Austin, TX',
    date: 'April 14, 2026',
    stars: 5,
    title: '"Exactly what bohemian style should look like"',
    body: 'The striped lining peeking out from the cuffs and collar is such a great detail — thoughtful and unexpected. Fits loosely in the best way, perfect over a simple outfit.',
    reply: 'Claire, you noticed the lining detail! 🎉 That striped contrast is one of our favourite touches on this piece. Thank you for the lovely review! 💛'
  },
  {
    initial: 'R',
    name: 'Robin S.',
    location: '📍 Albuquerque, NM',
    date: 'May 19, 2026',
    stars: 4,
    title: '"Gorgeous but runs large"',
    body: 'The embroidery and colour are absolutely beautiful — very rich and detailed. Just know it runs quite oversized, so I\'d size down if you want a more fitted look.',
    reply: 'Robin, great tip — thank you! This style is designed with an relaxed, open fit. We\'ll make the sizing note clearer on the product page. 🙏'
  },
  {
    initial: 'M',
    name: 'Mary Jo T.',
    location: '📍 Scottsdale, AZ',
    date: 'June 10, 2026',
    stars: 5,
    title: '"A true heirloom piece"',
    body: 'I\'ve bought from Textile Jaipur before and this blue floral jacket is their most beautiful work yet. The craftsmanship feels like something you\'d pass down — not just wear for a season.',
    reply: '"A heirloom piece" — Mary Jo, our artisans would be so proud to hear that. 🥹 Thank you for trusting us again. You are family! 💛🙏'
  }
];

export const BlueFloralReviews: React.FC<{ dynamicReviews?: ReviewData[] }> = ({ dynamicReviews = [] }) => {
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
        <p className="text-[12px] tracking-[0.25em] text-[#c9a84c88] uppercase">Verified Reviews · Blue Floral Velvet Suzani Jacket</p>
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
