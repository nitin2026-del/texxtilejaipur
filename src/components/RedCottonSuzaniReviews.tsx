'use client';

import React from 'react';
import { ReviewData } from './SuzaniReviews';

const reviewsData = [
  {
    initial: 'I',
    name: 'Isabella C.',
    location: '📍 Montreal, QC',
    date: 'April 25, 2026',
    stars: 5,
    title: '"Deep cultural meaning"',
    body: 'I did some deep research before purchasing, and the vibrant red palette of this cotton jacket is considered highly auspicious in Indian culture, symbolizing passion and prosperity. Wearing it feels incredibly powerful and uplifting.',
    isVerified: true
  },
  {
    initial: 'F',
    name: 'Fiona M.',
    location: '📍 Sydney, AU',
    date: 'April 25, 2026',
    stars: 5,
    title: '"Premium, breathable cotton"',
    body: 'The premium cotton sourced from Jaipur is highly breathable, making it the perfect jacket for transitioning from casual daytime styling to elevated evening looks. The vivid character of the sweeping embroidery is breathtaking.',
    isVerified: true
  },
  {
    initial: 'D',
    name: 'Diana P.',
    location: '📍 Chicago, IL',
    date: 'March 10, 2026',
    stars: 3,
    title: '"Strict Dry Clean Only / Very bright"',
    body: 'The jacket is beautiful, but I am leaving a mixed review. First, the dry clean only requirement on a cotton jacket is frustrating. Second, the striking red color palette is extremely vibrant—almost neon in direct sunlight. It can be a bit too bold for a conservative office setting.',
    isVerified: true
  },
  {
    initial: 'C',
    name: 'Clara S.',
    location: '📍 Atlanta, GA',
    date: 'March 10, 2026',
    stars: 5,
    title: '"Truly one of a kind"',
    body: 'The artisanal details are spectacular. You can tell that no two pieces are exactly alike because of the meticulous hand-embroidery. It serves as a true centerpiece when layered over a crisp white dress.',
    isVerified: true
  }
];

export const RedCottonSuzaniReviews: React.FC<{ dynamicReviews?: ReviewData[] }> = ({ dynamicReviews = [] }) => {
  const allReviews = [...dynamicReviews, ...reviewsData];
  const totalReviews = allReviews.length;
  
  const avgRating = totalReviews > 0 
    ? (allReviews.reduce((sum, r) => sum + r.stars, 0) / totalReviews).toFixed(1)
    : '0.0';

  return (
    <div className="mt-16 mb-16 border-t border-b border-red-100 py-12 bg-red-50/30">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center gap-8 mb-12">
          <div className="md:w-1/3 text-center md:text-left">
            <h3 className="text-3xl font-serif text-red-900 mb-2">Detailed Reviews</h3>
            <p className="text-red-700/70 text-sm mb-4">Cotton Suzani Jacket - Red Edition</p>
            <div className="text-4xl font-bold text-red-600 mb-1">{avgRating}</div>
            <div className="text-red-500 tracking-widest text-lg mb-2">
              {'★'.repeat(Math.round(Number(avgRating)))}{'☆'.repeat(5 - Math.round(Number(avgRating)))}
            </div>
            <p className="text-xs text-red-900/50">From {totalReviews} global reviews</p>
          </div>
          
          <div className="md:w-2/3 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {allReviews.map((review, idx) => (
              <div key={idx} className="bg-white p-5 rounded-xl border border-red-100 shadow-sm">
                <div className="flex justify-between mb-2">
                  <span className="font-bold text-red-900 text-sm">{review.name}</span>
                  <span className="text-red-500 text-xs tracking-widest">
                    {'★'.repeat(review.stars)}{'☆'.repeat(5 - review.stars)}
                  </span>
                </div>
                {review.title && <div className="font-serif text-sm font-bold text-red-800 mb-1.5">{review.title}</div>}
                <p className="text-xs text-red-900/70 leading-relaxed mb-3">{review.body}</p>
                <div className="text-[10px] text-red-400 uppercase tracking-wider font-semibold">{review.date}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

