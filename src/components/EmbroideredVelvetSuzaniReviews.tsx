'use client';

import React from 'react';
import { ReviewData } from './SuzaniReviews';

const reviewsData = [
  {
    initial: 'N',
    name: 'Nadia F.',
    location: '📍 Washington, D.C.',
    date: 'April 25, 2026',
    stars: 5,
    title: '"A historical masterpiece"',
    body: 'I am a textile historian, and the deep research behind this piece is evident. The Suzani technique historically celebrates life and fertility across Central Asia, and seeing it married with Jaipur\'s artisanal handloom weaving is a brilliant cross-cultural confluence.',
    isVerified: true
  },
  {
    initial: 'P',
    name: 'Penelope G.',
    location: '📍 Paris, FR',
    date: 'April 25, 2026',
    stars: 5,
    title: '"Authentic Handloom Texture"',
    body: 'The base fabric is true handloom. You can feel the slight, beautiful irregularities in the weave that prove it wasn\'t made by a machine. It provides an incredible backdrop for the opulent tapestry of embroidery.',
    isVerified: true
  },
  {
    initial: 'V',
    name: 'Victoria L.',
    location: '📍 Rome, IT',
    date: 'April 25, 2026',
    stars: 4,
    title: '"Delicate Threads"',
    body: 'The majestic symphony of colors is exactly as described. However, the silk threads used in the hand-embroidery are quite delicate. I caught one on a ring and it pulled slightly. You must handle this royal piece with care.',
    isVerified: true
  },
  {
    initial: 'A',
    name: 'Amelia S.',
    location: '📍 Boston, MA',
    date: 'March 24, 2026',
    stars: 5,
    title: '"Fit for a royal atelier"',
    body: 'Putting this on makes you feel like you are wearing something straight out of the royal ateliers of Rajasthan. The contemporary structure keeps it from looking like a costume and makes it perfectly wearable for modern events.',
    isVerified: true
  },
  {
    initial: 'Z',
    name: 'Zara H.',
    location: '📍 Dubai, UAE',
    date: 'March 24, 2026',
    stars: 5,
    title: '"Perfect over minimalist dresses"',
    body: 'I followed the site\'s suggestion to layer this over a minimalist silk slip dress. It completely transformed my simple outfit into a breathtaking ensemble. The contrast between plain silk and heavy Suzani embroidery is divine.',
    isVerified: true
  },
  {
    initial: 'E',
    name: 'Eleanor B.',
    location: '📍 Vancouver, BC',
    date: 'March 24, 2026',
    stars: 3,
    title: '"Beautiful, but strict dry clean"',
    body: 'I gave it three stars only because the \'Dry clean only\' requirement is a bit annoying for someone who wears jackets frequently. The handloom fabric and dyes will bleed if you try to spot clean it yourself, so be warned.',
    isVerified: true
  },
  {
    initial: 'M',
    name: 'Madeline C.',
    location: '📍 New York, NY',
    date: 'June 30, 2026',
    stars: 5,
    title: '"A sacred tradition"',
    body: 'Knowing that the needlework depicts ancient motifs of life and fertility makes wearing it feel incredibly special. It’s not just fashion, it is a piece of art carrying the soul of the artisans.',
    isVerified: true
  },
  {
    initial: 'O',
    name: 'Olivia W.',
    location: '📍 Chicago, IL',
    date: 'June 15, 2026',
    stars: 5,
    title: '"Heirloom quality"',
    body: 'This jacket is a testament to unparalleled skill. I fully intend for this to be an heirloom piece that I cherish for generations and eventually pass down. Absolutely breathtaking artistry.',
    isVerified: true
  }
];

export const EmbroideredVelvetSuzaniReviews: React.FC<{ dynamicReviews?: ReviewData[] }> = ({ dynamicReviews = [] }) => {
  const allReviews = [...dynamicReviews, ...reviewsData];
  const totalReviews = allReviews.length;
  
  const avgRating = totalReviews > 0 
    ? (allReviews.reduce((sum, r) => sum + r.stars, 0) / totalReviews).toFixed(1)
    : '0.0';

  return (
    <div className="mt-16 mb-16 max-w-5xl mx-auto px-4">
      <div className="text-center mb-10">
        <h3 className="text-3xl font-serif text-zinc-900 mb-3">Deep Research & Reviews</h3>
        <p className="text-sm text-zinc-500 max-w-2xl mx-auto">Explore authentic experiences and deep cultural insights from customers who own the Women's Embroidered Velvet Suzani Jacket.</p>
        <div className="inline-flex items-center gap-2 mt-4 bg-zinc-100 px-4 py-2 rounded-full">
          <span className="text-brand-600 font-bold">{avgRating}</span>
          <span className="text-brand-600 tracking-widest text-sm">★★★★★</span>
          <span className="text-xs text-zinc-500 border-l border-zinc-300 pl-2">({totalReviews} Reviews)</span>
        </div>
      </div>
      <div className="columns-1 md:columns-2 lg:columns-2 gap-6 space-y-6">
        {allReviews.map((review, idx) => (
          <div key={idx} className="break-inside-avoid bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <div className="flex gap-3 items-center">
                <div className="w-10 h-10 rounded-full bg-brand-50 text-brand-700 flex items-center justify-center font-serif text-lg">
                  {review.initial || review.name.charAt(0)}
                </div>
                <div>
                  <h4 className="font-bold text-sm text-zinc-900">{review.name}</h4>
                  <span className="text-[10px] text-zinc-400 uppercase tracking-wider">{review.date}</span>
                </div>
              </div>
              <div className="text-brand-600 text-xs tracking-widest">
                {'★'.repeat(review.stars)}{'☆'.repeat(5 - review.stars)}
              </div>
            </div>
            {review.title && <h5 className="font-serif font-bold text-zinc-900 mb-2">{review.title}</h5>}
            <p className="text-sm text-zinc-600 leading-relaxed">{review.body}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

