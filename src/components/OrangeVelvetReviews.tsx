'use client';

import React from 'react';
import { ReviewData } from './SuzaniReviews';

const reviewsData = [
  {
    initial: 'G',
    name: 'Grace W.',
    location: '📍 Sedona, AZ',
    date: 'June 2, 2026',
    stars: 5,
    title: '"The perfect burnt orange!"',
    body: 'The color is an absolutely stunning burnt orange that looks so rich in sunlight. I was worried about cleaning velvet, but it comes with a care card that actually makes sense (gentle hand wash cold). Highly recommend.',
    isVerified: true
  },
  {
    initial: 'L',
    name: 'Lucy K.',
    location: '📍 Brooklyn, NY',
    date: 'May 18, 2026',
    stars: 4,
    title: '"AI Tailor saved me"',
    body: 'The large red floral embroidery is beautiful. It definitely has a boxy cut, which usually overwhelms my frame. However, I used the AI Tailor sizing tool and it recommended sizing down. It fits perfectly now!',
    isVerified: true
  },
  {
    initial: 'T',
    name: 'Tara M.',
    location: '📍 London, UK',
    date: 'April 30, 2026',
    stars: 1,
    title: '"Clasp issue, but overnight replacement"',
    body: 'I loved the yellow striped lining, but the front clasp was completely jammed when it arrived. I was so upset. I emailed support with a quick video, and they literally sent a free replacement overnight. Incredible service for a frustrating moment.',
    isVerified: true,
    reply: 'Oh no, Tara! We are so sorry about that clasp. Our quality control team is double-checking all hardware now. Glad we could get a new one to you so quickly! ✨'
  },
  {
    initial: 'S',
    name: 'Sophie D.',
    location: '📍 Los Angeles, CA',
    date: 'April 14, 2026',
    stars: 5,
    title: '"Automatic 25% off discount!"',
    body: 'Such an amazing value! I bought this jacket and bundled it with a matching tote bag, and the cart automatically gave me 25% off the whole order. The pale green vines pop beautifully against the orange velvet.',
    isVerified: true
  },
  {
    initial: 'E',
    name: 'Elena R.',
    location: '📍 Portland, OR',
    date: 'March 22, 2026',
    stars: 5,
    title: '"Eco-friendly dyes"',
    body: 'I am so impressed that they use high-quality natural dyes. I hand-washed this and the rich orange and red colors didn\'t bleed at all. It feels great to wear a sustainable, artisan-made piece.',
    isVerified: true
  },
  {
    initial: 'M',
    name: 'Mia C.',
    location: '📍 Sydney, AUS',
    date: 'March 5, 2026',
    stars: 3,
    title: '"Customs delay"',
    body: 'Arrived three days late due to a customs hold in Australia. Once I finally got it, I was blown away by the heavy velvet quality, but the delay was annoying. Support did refund my shipping cost though, which was nice.',
    isVerified: true,
    reply: 'Mia, we apologize again for that unexpected customs delay! We are glad you love the jacket and hope the shipping refund helped make up for it. ✈️'
  },
  {
    initial: 'J',
    name: 'Jasmine H.',
    location: '📍 Austin, TX',
    date: 'February 19, 2026',
    stars: 5,
    title: '"Custom tailoring is a lifesaver"',
    body: 'I have very broad shoulders and usually struggle with structured jackets. I emailed their team for a custom fit, sent my measurements, and it arrived fitting like an absolute glove. The bespoke service is unmatched.',
    isVerified: true
  },
  {
    initial: 'N',
    name: 'Nadia P.',
    location: '📍 Chicago, IL',
    date: 'February 2, 2026',
    stars: 2,
    title: '"Too short for tall girls, but free returns"',
    body: 'The embroidery is stunning, but the sleeves were just too short for me (I\'m 5\'10"). I used their automated portal for a free return label and dropped it off the same day. Great return policy, just wish they had a tall fit.',
    isVerified: true,
    reply: 'Hi Nadia! We are so sorry the sleeve length wasn\'t a fit. Please note that you can always email us for custom sleeve lengths on your next order! 💛'
  },
  {
    initial: 'O',
    name: 'Olivia V.',
    location: '📍 Madrid, Spain',
    date: 'January 15, 2026',
    stars: 4,
    title: '"Heavier than expected"',
    body: 'The large red flowers are stunning and the needlework is flawless. Just note that it\'s quite a heavy jacket—definitely a true winter statement piece rather than a light spring layer.',
    isVerified: true
  },
  {
    initial: 'H',
    name: 'Hannah L.',
    location: '📍 Seattle, WA',
    date: 'December 28, 2025',
    stars: 5,
    title: '"Beautiful presentation"',
    body: 'Got this as a gift for my mom. It shipped quickly and came in a beautiful complimentary cloth dust bag which made the unboxing feel so premium. She was absolutely thrilled with the burnt orange color.',
    isVerified: true
  },
  {
    initial: 'K',
    name: 'Katie B.',
    location: '📍 Vancouver, BC',
    date: 'December 10, 2025',
    stars: 5,
    title: '"Welcome discount code!"',
    body: 'I used the welcome discount code to get this and I am so happy. The colors in person are exactly as vibrant as the photos online. The yellow-striped lining is such a fun touch when you roll up the sleeves!',
    isVerified: true
  }
];

export const OrangeVelvetReviews: React.FC<{ dynamicReviews?: ReviewData[] }> = ({ dynamicReviews = [] }) => {
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
    <div className="bg-[#fcf8f2] text-[#4a3424] font-light rounded-2xl overflow-hidden mt-12 mb-12 shadow-md border border-[#d46d2e33]">
      <div className="text-center py-10 px-6 border-b border-[#d46d2e22]">
        <div className="inline-flex items-center gap-3 mb-4">
          <div className="font-serif text-[42px] font-semibold text-[#c85a17] leading-none tracking-tight">
            TJ
          </div>
          <div className="text-left leading-tight">
            <span className="font-serif text-[14px] font-semibold tracking-[0.35em] text-[#c85a17] uppercase block">Textile</span>
            <span className="text-[10px] tracking-[0.3em] text-[#d46d2e] uppercase">Jaipur</span>
          </div>
        </div>
        <h2 className="font-serif text-[clamp(24px,4vw,36px)] text-[#4a3424] tracking-wide mb-2">What Our Customers Say</h2>
        <p className="text-[11px] tracking-[0.2em] text-[#c85a17] uppercase">Verified Reviews · Elegant Women's Velvet Jacket</p>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-8 py-6 px-6 border-b border-[#d46d2e11]">
        <div className="font-serif text-[48px] font-semibold text-[#c85a17] leading-none">{avgRating}</div>
        <div className="flex flex-col gap-1">
          <div className="text-[18px] text-[#c85a17] tracking-widest">
            {'★'.repeat(Math.round(Number(avgRating)))}{'☆'.repeat(5 - Math.round(Number(avgRating)))}
          </div>
          <div className="text-[10px] tracking-[0.15em] text-[#d46d2e] uppercase">Based on {totalReviews} reviews</div>
        </div>
        <div className="flex flex-col gap-1.5">
          {starsCount.map((bar) => (
            <div key={bar.stars} className="flex items-center gap-2 text-[10px] text-[#8a5d3b]">
              <span className="w-4 text-right font-medium">{bar.stars}★</span>
              <div className="w-[100px] h-1.5 bg-[#f0e6d8] rounded-full overflow-hidden">
                <div className="h-full bg-[#c85a17] rounded-full" style={{ width: bar.pct }}></div>
              </div>
              <span className="w-3 text-right">{bar.count}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="max-w-[800px] mx-auto py-8 px-5 sm:px-8 grid grid-cols-1 md:grid-cols-2 gap-6">
        {allReviews.map((review, idx) => (
          <div key={idx} className="bg-white p-5 rounded-xl border border-[#d46d2e22] shadow-sm flex flex-col h-full">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 rounded-full bg-[#fdf5eb] text-[#c85a17] flex items-center justify-center font-serif text-[14px] font-bold border border-[#d46d2e33] shrink-0">
                {review.initial || review.name.charAt(0)}
              </div>
              <div className="flex-1">
                <div className="font-bold text-[13px] text-[#4a3424]">{review.name}</div>
                <div className="text-[9px] text-[#d46d2e] tracking-[0.1em] uppercase">{review.date}</div>
              </div>
              <div className="text-[12px] text-[#c85a17] tracking-wider">
                {'★'.repeat(review.stars)}{'☆'.repeat(5 - review.stars)}
              </div>
            </div>
            {review.title && <div className="font-serif text-[14px] font-semibold text-[#4a3424] mb-1.5">{review.title}</div>}
            <div className="text-[12.5px] leading-relaxed text-[#6a5444] flex-grow">
              {review.body}
            </div>
            {review.isVerified && (
              <div className="text-[9px] tracking-[0.1em] font-semibold text-[#c85a17] uppercase mt-3">
                ✔ Verified Buyer
              </div>
            )}
            {review.reply && (
              <div className="mt-3 p-2.5 bg-[#fffaf5] border-l-2 border-[#c85a17] rounded-r text-[#8a5d3b] text-[12px] leading-relaxed">
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

