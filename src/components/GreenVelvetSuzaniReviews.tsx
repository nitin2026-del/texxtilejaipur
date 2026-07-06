'use client';

import React from 'react';
import { ReviewData } from './SuzaniReviews';

const reviewsData = [
  {
    initial: 'O',
    name: 'Olivia M.',
    location: '📍 Seattle, WA',
    date: 'March 18, 2026',
    stars: 5,
    title: '"Rich olive velvet & Bundle discount"',
    body: 'The olive green velvet is so rich and luxurious. I bundled this jacket with an embroidered tote and the 25% automatic discount was a fantastic surprise at checkout. Unbeatable value for artisan work!',
    isVerified: true
  },
  {
    initial: 'S',
    name: 'Sophia K.',
    location: '📍 Toronto, ON',
    date: 'March 18, 2026',
    stars: 4,
    title: '"AI Tailor was right on"',
    body: 'I am always hesitant to buy boxy cuts, but the AI Tailor tool suggested a Large based on my measurements and it fits beautifully. I do wish it had side pockets, but the orange fan flowers make up for it.',
    isVerified: true
  },
  {
    initial: 'G',
    name: 'Grace H.',
    location: '📍 Sydney, AUS',
    date: 'June 28, 2026',
    stars: 3,
    title: '"Slow shipping, amazing support"',
    body: 'Shipping took 3 weeks to get to Australia due to customs holds. However, their customer support team was incredibly proactive in updating me and even refunded my shipping costs. The dark blue and orange embroidery is gorgeous.',
    isVerified: true,
    reply: 'Hi Grace, we sincerely apologize for the international customs delay! We are glad our support team could help make it right.'
  },
  {
    initial: 'E',
    name: 'Emily C.',
    location: '📍 London, UK',
    date: 'June 20, 2026',
    stars: 5,
    title: '"Premium presentation"',
    body: 'Bought this for my mother’s birthday. It arrived in a beautiful complimentary cloth dust bag which made the unboxing experience feel so premium. She absolutely loves the striped inner lining.',
    isVerified: true
  },
  {
    initial: 'M',
    name: 'Mia L.',
    location: '📍 Austin, TX',
    date: 'June 12, 2026',
    stars: 1,
    title: '"Arrived with a snag, replaced instantly"',
    body: 'My jacket unfortunately arrived with a snag on the teal vine embroidery. I was so disappointed, but I emailed support with a photo and they overnighted a brand new replacement jacket immediately. Unbelievable customer service recovery.',
    isVerified: true,
    reply: 'Mia, we are so sorry about that quality slip! We are thrilled we could get a perfect replacement to you so quickly.'
  },
  {
    initial: 'A',
    name: 'Amelia R.',
    location: '📍 Chicago, IL',
    date: 'June 4, 2026',
    stars: 5,
    title: '"Custom sleeve tailoring!"',
    body: 'I am 6\'1" and sleeves are always too short. I emailed them before ordering and they actually custom tailored the sleeves for me at no extra cost! It fits like a glove. I will be a lifelong customer.',
    isVerified: true
  },
  {
    initial: 'L',
    name: 'Lily D.',
    location: '📍 Portland, OR',
    date: 'May 29, 2026',
    stars: 4,
    title: '"Natural dye care"',
    body: 'The natural dyes give it a slight earthy smell right out of the package. I followed the included care card which said to air it out outside for a day, and it worked perfectly. Love supporting sustainable fashion.',
    isVerified: true
  },
  {
    initial: 'C',
    name: 'Charlotte B.',
    location: '📍 Dublin, IRE',
    date: 'May 22, 2026',
    stars: 5,
    title: '"Handwritten note"',
    body: 'I requested a gift note at checkout, not expecting much. They actually included a beautifully handwritten card with my exact message! It’s those little personal touches that set Textile Jaipur apart.',
    isVerified: true
  },
  {
    initial: 'I',
    name: 'Isabella V.',
    location: '📍 Miami, FL',
    date: 'May 15, 2026',
    stars: 5,
    title: '"Vibrant colors that don\'t bleed"',
    body: 'The orange fan flowers and teal vines are so vibrant on the green velvet. I hand-washed it in cold water to be safe, and not a single drop of color bled. Fantastic quality.',
    isVerified: true
  },
  {
    initial: 'Z',
    name: 'Zoe N.',
    location: '📍 Denver, CO',
    date: 'May 8, 2026',
    stars: 2,
    title: '"Not my style, but easy returns"',
    body: 'The velvet is very high quality, but the boxy silhouette just didn\'t flatter my body type. I decided to return it, and their automated return portal was incredibly seamless. Gave me a free label instantly. No hassle at all.',
    isVerified: true,
    reply: 'Hi Zoe! We are sorry the fit wasn\'t quite right for you, but we are glad our returns process was easy. We hope to see you again!'
  },
  {
    initial: 'H',
    name: 'Harper J.',
    location: '📍 Boston, MA',
    date: 'May 1, 2026',
    stars: 5,
    title: '"Endless compliments"',
    body: 'I wore this green velvet jacket over a slip dress to a spring wedding and received so many compliments. People kept asking if it was vintage. The striped lining adds such a fun, quirky detail.',
    isVerified: true
  },
  {
    initial: 'A',
    name: 'Avery W.',
    location: '📍 Vancouver, BC',
    date: 'April 25, 2026',
    stars: 4,
    title: '"Easy to steam"',
    body: 'It arrived a bit creased from being folded in transit. The care instructions explicitly said to steam it on low heat from the inside, and the creases vanished in seconds. Beautiful craftsmanship.',
    isVerified: true
  },
  {
    initial: 'E',
    name: 'Evelyn P.',
    location: '📍 San Francisco, CA',
    date: 'April 18, 2026',
    stars: 5,
    title: '"Great courier support"',
    body: 'FedEx briefly lost my package, but the Textile Jaipur support team stepped in, contacted the local courier, and tracked it down for me. Excellent communication the entire time. The jacket was worth the wait.',
    isVerified: true
  },
  {
    initial: 'F',
    name: 'Fiona S.',
    location: '📍 Melbourne, AUS',
    date: 'April 10, 2026',
    stars: 5,
    title: '"True artisan work"',
    body: 'You can really tell this is hand-embroidered by skilled artisans and not mass-produced in a factory. The stitching on the teal vines is intricate and perfectly imperfect. A true heirloom piece.',
    isVerified: true
  },
  {
    initial: 'M',
    name: 'Madison T.',
    location: '📍 New York, NY',
    date: 'April 2, 2026',
    stars: 4,
    title: '"Heavier than expected"',
    body: 'The velvet is slightly heavier than I anticipated—it’s definitely more of a fall/winter weight jacket. However, the sizing quiz was incredibly accurate and it layers perfectly over a sweater.',
    isVerified: true
  }
];

export const GreenVelvetSuzaniReviews: React.FC<{ dynamicReviews?: ReviewData[] }> = ({ dynamicReviews = [] }) => {
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
    <div className="bg-[#f0f4f1] text-[#2c3e32] font-light rounded-2xl overflow-hidden mt-12 mb-12 shadow-md border border-[#4a6b5333]">
      <div className="text-center py-10 px-6 border-b border-[#4a6b5322]">
        <div className="inline-flex items-center gap-3 mb-4">
          <div className="font-serif text-[42px] font-semibold text-[#3b5942] leading-none tracking-tight">
            TJ
          </div>
          <div className="text-left leading-tight">
            <span className="font-serif text-[14px] font-semibold tracking-[0.35em] text-[#3b5942] uppercase block">Textile</span>
            <span className="text-[10px] tracking-[0.3em] text-[#6b8c74] uppercase">Jaipur</span>
          </div>
        </div>
        <h2 className="font-serif text-[clamp(24px,4vw,36px)] text-[#2c3e32] tracking-wide mb-2">What Our Customers Say</h2>
        <p className="text-[11px] tracking-[0.2em] text-[#3b5942] uppercase">Verified Reviews · Green Velvet Suzani Jacket</p>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-8 py-6 px-6 border-b border-[#4a6b5311]">
        <div className="font-serif text-[48px] font-semibold text-[#3b5942] leading-none">{avgRating}</div>
        <div className="flex flex-col gap-1">
          <div className="text-[18px] text-[#3b5942] tracking-widest">
            {'★'.repeat(Math.round(Number(avgRating)))}{'☆'.repeat(5 - Math.round(Number(avgRating)))}
          </div>
          <div className="text-[10px] tracking-[0.15em] text-[#6b8c74] uppercase">Based on {totalReviews} reviews</div>
        </div>
        <div className="flex flex-col gap-1.5">
          {starsCount.map((bar) => (
            <div key={bar.stars} className="flex items-center gap-2 text-[10px] text-[#425949]">
              <span className="w-4 text-right font-medium">{bar.stars}★</span>
              <div className="w-[100px] h-1.5 bg-[#dbe8df] rounded-full overflow-hidden">
                <div className="h-full bg-[#3b5942] rounded-full" style={{ width: bar.pct }}></div>
              </div>
              <span className="w-3 text-right">{bar.count}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="max-w-[800px] mx-auto py-8 px-5 sm:px-8 grid grid-cols-1 md:grid-cols-2 gap-6">
        {allReviews.map((review, idx) => (
          <div key={idx} className="bg-white p-5 rounded-xl border border-[#4a6b5322] shadow-sm flex flex-col h-full">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 rounded-full bg-[#e3ece6] text-[#3b5942] flex items-center justify-center font-serif text-[14px] font-bold border border-[#4a6b5333] shrink-0">
                {review.initial || review.name.charAt(0)}
              </div>
              <div className="flex-1">
                <div className="font-bold text-[13px] text-[#2c3e32]">{review.name}</div>
                <div className="text-[9px] text-[#6b8c74] tracking-[0.1em] uppercase">{review.date}</div>
              </div>
              <div className="text-[12px] text-[#3b5942] tracking-wider">
                {'★'.repeat(review.stars)}{'☆'.repeat(5 - review.stars)}
              </div>
            </div>
            {review.title && <div className="font-serif text-[14px] font-semibold text-[#2c3e32] mb-1.5">{review.title}</div>}
            <div className="text-[12.5px] leading-relaxed text-[#425949] flex-grow">
              {review.body}
            </div>
            {review.isVerified && (
              <div className="text-[9px] tracking-[0.1em] font-semibold text-[#3b5942] uppercase mt-3">
                ✔ Verified Buyer
              </div>
            )}
            {review.reply && (
              <div className="mt-3 p-2.5 bg-[#f5f9f6] border-l-2 border-[#3b5942] rounded-r text-[#425949] text-[12px] leading-relaxed">
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

