'use client';

import React from 'react';
import { ReviewData } from './SuzaniReviews';

const reviewsData = [
  {
    initial: 'C',
    name: 'Catherine V.',
    location: '📍 Los Angeles, CA',
    date: 'March 14, 2026',
    stars: 5,
    title: '"Incredible detail and hidden pockets!"',
    body: 'The detailing on this jacket is absolutely breathtaking. The large white daisy and pomegranate embroidery completely pops against the dark navy velvet base. Plus, I was so happy to find that it has two deep patch pockets on the front! They perfectly blend into the embroidery so you almost cannot see them, but they easily fit my phone and keys.',
    isVerified: true
  },
  {
    initial: 'M',
    name: 'Monica P.',
    location: '📍 Austin, TX',
    date: 'February 22, 2026',
    stars: 5,
    title: '"Perfect open-front styling"',
    body: 'I had a question about the closure before buying. To answer anyone else wondering: no, it does not have buttons. It is a beautifully draped open-front cardigan style. The lack of closures combined with the wide sleeves makes it completely effortless to throw over a simple t-shirt or a dress.',
    isVerified: true
  },
  {
    initial: 'S',
    name: 'Sarah L.',
    location: '📍 London, UK',
    date: 'January 10, 2026',
    stars: 5,
    title: '"Amazing WhatsApp sizing support"',
    body: 'I was unsure about the sizing because of the boxy fit, so I used the WhatsApp contact number listed on the page. They replied in literally seconds and asked for my measurements. They recommended the Medium, and it fits absolutely wonderfully! The customer service is as premium as the jacket itself.',
    isVerified: true
  },
  {
    initial: 'E',
    name: 'Eleanor H.',
    location: '📍 New York, NY',
    date: 'April 05, 2026',
    stars: 5,
    title: '"Luxurious hand-stitched texture"',
    body: 'The contrast of the intricate cream-colored threadwork against the plush dark velvet is simply luxurious. You can tell the floral motifs are hand-stitched just by feeling the texture of the embroidery. It feels substantial without being too heavy.',
    isVerified: true
  }
];

export const NavyFloralVelvetReviews: React.FC<{ dynamicReviews?: ReviewData[] }> = ({ dynamicReviews = [] }) => {
  const allReviews = [...dynamicReviews, ...reviewsData];
  const totalReviews = allReviews.length;
  
  const avgRating = totalReviews > 0 
    ? (allReviews.reduce((sum, r) => sum + r.stars, 0) / totalReviews).toFixed(1)
    : '0.0';

  return (
    <div className="bg-[#1a1c29] text-[#f4f4f6] py-16 px-6 mt-16 rounded-3xl mb-8 border border-[#2d3142]">
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
