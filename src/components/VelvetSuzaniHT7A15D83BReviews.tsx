'use client';

import React from 'react';
import { ReviewData } from './SuzaniReviews';

const reviewsData = [
  {
    initial: 'T',
    name: 'Taylor P.',
    location: '📍 Denver, CO',
    date: 'April 22, 2026',
    stars: 5,
    title: '"Incredible attention to detail"',
    body: 'The hand-stitched detailing on this velvet jacket is second to none. Every single stitch feels deliberate, and the fabric has a luxurious, heavy drape to it. It does not have any buttons or zippers, which gives it a very elegant, relaxed fit.',
    isVerified: true
  },
  {
    initial: 'L',
    name: 'Laura D.',
    location: '📍 Seattle, WA',
    date: 'February 15, 2026',
    stars: 5,
    title: '"Super helpful sizing advice"',
    body: 'I wasn\'t sure how this would fit across my shoulders, so I reached out on WhatsApp. The customer service team replied within a minute and suggested the perfect size for me based on my measurements! I love the deep hidden pockets too.',
    isVerified: true
  },
  {
    initial: 'M',
    name: 'Michelle C.',
    location: '📍 Boston, MA',
    date: 'June 10, 2026',
    stars: 4,
    title: '"Beautiful but quite heavy"',
    body: 'This jacket is absolutely stunning and the quality is amazing, but it is quite heavy! It is definitely meant for cooler weather or evening wear. The open-front style makes it very easy to layer over a sweater or a dress.',
    isVerified: true
  },
  {
    initial: 'V',
    name: 'Victoria S.',
    location: '📍 Miami, FL',
    date: 'January 05, 2026',
    stars: 5,
    title: '"A true piece of wearable art"',
    body: 'I am blown away by the craftsmanship. The velvet is so soft, and the embroidery is vibrant and meticulously done. It fits true to the size chart, and I love that it has hidden front pockets that don\'t add any bulk.',
    isVerified: true
  }
];

export const VelvetSuzaniHT7A15D83BReviews: React.FC<{ dynamicReviews?: ReviewData[] }> = ({ dynamicReviews = [] }) => {
  const allReviews = [...dynamicReviews, ...reviewsData];
  const totalReviews = allReviews.length;
  
  const avgRating = totalReviews > 0 
    ? (allReviews.reduce((sum, r) => sum + r.stars, 0) / totalReviews).toFixed(1)
    : '0.0';

  return (
    <div className="bg-[#241a1a] text-[#f4f4f6] py-16 px-6 mt-16 rounded-3xl mb-8 border border-[#4a2d2d]">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-serif font-bold mb-4">Customer Experiences</h2>
          <div className="flex items-center justify-center gap-3">
            <span className="text-3xl font-bold">{avgRating}</span>
            <div className="flex text-brand-400">
              {'★'.repeat(Math.round(Number(avgRating)))}{'☆'.repeat(5 - Math.round(Number(avgRating)))}
            </div>
            <span className="text-sm opacity-80 border-l border-white/20 pl-3">Based on {totalReviews} reviews</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {allReviews.map((review, idx) => (
            <div key={idx} className="bg-white/5 backdrop-blur-sm p-6 rounded-2xl border border-white/10 hover:border-white/20 transition-colors">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center font-serif text-lg font-bold">
                    {review.initial}
                  </div>
                  <div>
                    <div className="font-bold text-sm flex items-center gap-2">
                      {review.name}
                      {review.isVerified && (
                        <span className="bg-brand-500/20 text-brand-300 text-[10px] px-1.5 py-0.5 rounded uppercase tracking-wider">
                          Verified
                        </span>
                      )}
                    </div>
                    <div className="text-xs opacity-60 mt-0.5">{review.location}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-brand-400 text-sm mb-1">
                    {'★'.repeat(review.stars)}{'☆'.repeat(5 - review.stars)}
                  </div>
                  <div className="text-[10px] opacity-60 uppercase">{review.date}</div>
                </div>
              </div>
              
              <h4 className="font-serif font-bold text-lg mb-2 text-white/90">
                {review.title}
              </h4>
              <p className="text-sm opacity-80 leading-relaxed">
                {review.body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
