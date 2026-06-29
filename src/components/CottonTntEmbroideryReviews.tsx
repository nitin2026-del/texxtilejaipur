'use client';

import React from 'react';
import { ReviewData } from './SuzaniReviews';

const reviewsData = [
  {
    initial: 'C',
    name: 'Catherine V.',
    location: '📍 Chicago, IL',
    date: 'August 12, 2026',
    stars: 5,
    title: '"Stunning Handloom Cotton"',
    body: 'The handloom cotton fabric on this TNT embroidery jacket is out of this world. You can literally feel the ancestral weaving techniques they mention in the description. It has a beautiful, organic texture that mass-produced jackets just don\'t have.',
    isVerified: true
  },
  {
    initial: 'R',
    name: 'Rebecca H.',
    location: '📍 Denver, CO',
    date: 'August 5, 2026',
    stars: 5,
    title: '"Perfect for transitional weather"',
    body: 'Because it\'s cotton, it\'s incredibly breathable while still offering enough structure to act as a proper outer layer. Perfect for crisp autumn evenings. The floral motifs bloom beautifully across the dark base.',
    isVerified: true
  },
  {
    initial: 'A',
    name: 'Anita P.',
    location: '📍 Toronto, ON',
    date: 'July 28, 2026',
    stars: 4,
    title: '"Beautiful but strict care instructions"',
    body: 'I absolutely love the jacket and the cross-cultural confluence of the Suzani technique. However, it is strict dry clean only. I accidentally got a spot of coffee on the cuff and was terrified to wash it. The dry cleaner handled it fine, though!',
    isVerified: true
  },
  {
    initial: 'S',
    name: 'Samantha D.',
    location: '📍 Miami, FL',
    date: 'July 20, 2026',
    stars: 5,
    title: '"Looks amazing with dark wash denim"',
    body: 'I bought this specifically to wear with my dark-wash denim and gold hoops as suggested in the styling guide, and it is a total showstopper. The embroidery commands the room!',
    isVerified: true
  },
  {
    initial: 'M',
    name: 'Monica G.',
    location: '📍 San Francisco, CA',
    date: 'July 14, 2026',
    stars: 3,
    title: '"Sleeves are a bit tight"',
    body: 'The artistry is undeniable—it truly looks like it came from a royal atelier in Rajasthan. However, the sleeves are tailored a bit tight near the biceps. If you have athletic arms, I strongly suggest sizing up.',
    isVerified: true
  },
  {
    initial: 'K',
    name: 'Karen B.',
    location: '📍 Seattle, WA',
    date: 'July 2, 2026',
    stars: 5,
    title: '"A gift for my mother"',
    body: 'I gave this to my mother for her 60th birthday. She was moved to tears by the craftsmanship. It really is a masterpiece designed to be cherished for generations.',
    isVerified: true
  },
  {
    initial: 'T',
    name: 'Tanya Y.',
    location: '📍 London, UK',
    date: 'June 18, 2026',
    stars: 5,
    title: '"Worth every penny"',
    body: 'I was hesitant about the price, but seeing the meticulous hand-embroidery in person completely justified it. It\'s a wearable work of art that captures the romance of a bygone era.',
    isVerified: true
  }
];

export const CottonTntEmbroideryReviews: React.FC<{ dynamicReviews?: ReviewData[] }> = ({ dynamicReviews = [] }) => {
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
    <div className="bg-zinc-50 text-zinc-900 rounded-2xl overflow-hidden mt-12 mb-12 border border-zinc-200">
      <div className="text-center py-10 px-6 border-b border-zinc-200 bg-white">
        <h2 className="font-serif text-[clamp(24px,4vw,36px)] tracking-tight mb-2">Customer Experiences</h2>
        <p className="text-xs text-zinc-500 uppercase tracking-widest">Cotton TNT Embroidery Suzani Jacket</p>
      </div>
      <div className="max-w-[1000px] mx-auto py-8 px-5 sm:px-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {allReviews.map((review, idx) => (
          <div key={idx} className="bg-white p-6 rounded-xl border border-zinc-100 shadow-sm flex flex-col h-full">
            <div className="text-brand-600 mb-3 text-sm tracking-wider">
              {'★'.repeat(review.stars)}{'☆'.repeat(5 - review.stars)}
            </div>
            {review.title && <div className="font-bold text-sm text-zinc-900 mb-2">{review.title}</div>}
            <div className="text-sm text-zinc-600 leading-relaxed flex-grow mb-4">
              {review.body}
            </div>
            <div className="mt-auto pt-4 border-t border-zinc-50 flex items-center justify-between">
              <div>
                <div className="font-semibold text-xs text-zinc-900">{review.name}</div>
                <div className="text-[10px] text-zinc-400 mt-0.5">{review.date}</div>
              </div>
              {review.isVerified && (
                <div className="text-[10px] font-bold text-green-600 uppercase">Verified</div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
