'use client';

import React from 'react';
import { ReviewData } from './SuzaniReviews';

const reviewsData = [
  {
    initial: 'R',
    name: 'Rachel B.',
    location: '📍 Portland, OR',
    date: 'May 18, 2026',
    stars: 5,
    title: '"Exceptional quality and warmth"',
    body: 'The velvet material is incredibly plush and provides a surprising amount of warmth. The intricate floral Suzani embroidery is clearly hand-stitched and gives the jacket a beautifully textured, artisanal feel. It is even more stunning in person than in the pictures.',
    isVerified: true
  },
  {
    initial: 'J',
    name: 'Jessica M.',
    location: '📍 Chicago, IL',
    date: 'June 02, 2026',
    stars: 5,
    title: '"Great customer service for sizing!"',
    body: 'I was hesitant about which size to get since these jackets have a relaxed fit. I messaged the WhatsApp number provided on the site and got a response immediately. They helped me choose the perfect size based on my measurements. It drapes beautifully and the open-front design makes it so versatile.',
    isVerified: true
  },
  {
    initial: 'A',
    name: 'Amanda T.',
    location: '📍 Sydney, AUS',
    date: 'April 11, 2026',
    stars: 4,
    title: '"Gorgeous detailing, runs slightly large"',
    body: 'The threadwork is flawless and the colors are very vibrant against the velvet background. It does not have any buttons or hooks, which I actually prefer for a cardigan-style look. I ordered a Large, but it runs a bit oversized, so I probably could have sized down to a Medium.',
    isVerified: true
  },
  {
    initial: 'K',
    name: 'Karen W.',
    location: '📍 Toronto, CAN',
    date: 'January 29, 2026',
    stars: 5,
    title: '"My new favorite statement piece"',
    body: 'Every time I wear this jacket, I get stopped and asked where it is from. The hidden pockets are deep and perfectly integrated into the side seams so they do not disrupt the embroidery pattern at all. The craftsmanship is truly world-class.',
    isVerified: true
  }
];

export const VelvetSuzaniHT5EB59E11Reviews: React.FC<{ dynamicReviews?: ReviewData[] }> = ({ dynamicReviews = [] }) => {
  const allReviews = [...dynamicReviews, ...reviewsData];
  const totalReviews = allReviews.length;
  
  const avgRating = totalReviews > 0 
    ? (allReviews.reduce((sum, r) => sum + r.stars, 0) / totalReviews).toFixed(1)
    : '0.0';

  return (
    <div className="bg-[#1f1a24] text-[#f4f4f6] py-16 px-6 mt-16 rounded-3xl mb-8 border border-[#3b2d4a]">
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
