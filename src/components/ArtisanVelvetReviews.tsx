'use client';

import React from 'react';
import { ReviewData } from './SuzaniReviews';

const reviewsData = [
  {
    initial: 'N',
    name: 'Natalie O.',
    location: '📍 San Francisco, CA',
    date: 'April 12, 2026',
    stars: 5,
    title: '"A true masterpiece of embroidery"',
    body: 'I am blown away by this jacket. The deep, rich blue velvet is the perfect background for the pale mint and grey threading. What really caught my eye were the large, circular daisy-like floral motifs—it feels so much more unique than standard floral patterns. Every stitch is perfect.',
    isVerified: true
  },
  {
    initial: 'E',
    name: 'Emily S.',
    location: '📍 Brooklyn, NY',
    date: 'March 30, 2026',
    stars: 4,
    title: '"Boxier than I expected, but gorgeous"',
    body: 'The artisan quality is undeniable. The interior striped lining is such a chic hidden detail! My only issue was the fit; it has a very boxy, straight-cut silhouette. If you prefer a more tailored look, I definitely recommend sizing down. I exchanged mine for a smaller size and it fits perfectly now.',
    isVerified: true,
    reply: 'Thanks for the tip, Emily! Our artisan jackets are designed with a relaxed bohemian fit, so sizing down is a great suggestion for those wanting a sharper silhouette. ✨'
  },
  {
    initial: 'P',
    name: 'Penelope R.',
    location: '📍 Vancouver, BC',
    date: 'March 15, 2026',
    stars: 1,
    title: '"Loose seam on arrival, but 10/10 customer service"',
    body: 'When I first opened the package, I noticed a 2-inch gap on the inner shoulder seam where the striped lining hadn\'t been sewn properly to the velvet. I was super frustrated given the price point. However, I reached out to their support team via PayPal, and they immediately shipped a brand new replacement via express shipping and let me keep the original. Flawed quality control, but the best customer service I\'ve ever experienced.',
    isVerified: true,
    reply: 'Penelope, we are so sorry that slipped past our quality check! We are glad we were able to resolve it quickly for you. Thank you for your patience! 💙'
  },
  {
    initial: 'S',
    name: 'Samantha W.',
    location: '📍 Charleston, SC',
    date: 'February 28, 2026',
    stars: 5,
    title: '"The interior stripes sold me"',
    body: 'It\'s all about the details! The dark blue velvet is so luxurious, but rolling up the sleeves to show off that black and white striped cotton lining gives it such a cool, modern edge. It perfectly balances the traditional ethnic embroidery.',
    isVerified: true
  },
  {
    initial: 'L',
    name: 'Laura B.',
    location: '📍 Paris, France',
    date: 'February 10, 2026',
    stars: 5,
    title: '"Perfect transitional weather piece"',
    body: 'The velvet has a beautiful weight to it. It\'s not overly bulky, but it provides just the right amount of warmth for a breezy spring day or a cool autumn evening in the city. The craftsmanship is superb.',
    isVerified: true
  },
  {
    initial: 'M',
    name: 'Michelle T.',
    location: '📍 Sydney, AUS',
    date: 'January 22, 2026',
    stars: 3,
    title: '"Thread color is different in person"',
    body: 'In the photos, the embroidery thread looked almost pure white to me. In person, it\'s definitively a pale, icy mint green and cool grey. I still really like it and decided to keep it, but it wasn\'t exactly what I thought I was ordering.',
    isVerified: true,
    reply: 'Hi Michelle! You are completely correct—the embroidery uses pale mint and grey threads to contrast with the deep blue velvet. Sometimes bright studio lighting can wash out the subtle greens in photography. We appreciate the feedback! 🌿'
  },
  {
    initial: 'A',
    name: 'Anna K.',
    location: '📍 Chicago, IL',
    date: 'December 5, 2025',
    stars: 5,
    title: '"An absolute compliment magnet"',
    body: 'I wore this out to dinner on Saturday and had literally four different women stop me to ask where I got my jacket. It looks incredibly expensive and high-end. The velvet catches the light beautifully.',
    isVerified: true
  },
  {
    initial: 'C',
    name: 'Carmen V.',
    location: '📍 Madrid, Spain',
    date: 'November 18, 2025',
    stars: 4,
    title: '"A bit stiff at first"',
    body: 'The jacket is stunning and the embroidery is clearly hand-done. When it first arrived, the fabric felt a little stiff, likely due to the dense stitching. However, after wearing it for a couple of days, it softened up beautifully and now drapes perfectly.',
    isVerified: true
  },
  {
    initial: 'T',
    name: 'Tanya L.',
    location: '📍 Melbourne, AUS',
    date: 'October 29, 2025',
    stars: 2,
    title: '"Took over 2 weeks to arrive"',
    body: 'The jacket itself is gorgeous—exactly as pictured with the beautiful blue velvet. But it took almost 16 days to get to Australia. I bought it for a specific event and it didn\'t arrive in time, which was a huge letdown.',
    isVerified: true,
    reply: 'Tanya, we are so sorry the jacket missed your event! While we do offer free worldwide shipping, international customs can occasionally cause unexpected delays. We have sent a discount code to your email for your next purchase as an apology! ✈️'
  },
  {
    initial: 'H',
    name: 'Hannah G.',
    location: '📍 Boston, MA',
    date: 'September 14, 2025',
    stars: 5,
    title: '"Exceeded my expectations"',
    body: 'I was hesitant to buy something like this online without feeling it first, but I am so glad I did. The velvet is thick and plush, and the embroidery is dense and high-quality. It does not feel like a mass-produced item at all; it feels like genuine artisan work.',
    isVerified: true
  }
];

export const ArtisanVelvetReviews: React.FC<{ dynamicReviews?: ReviewData[] }> = ({ dynamicReviews = [] }) => {
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
    <div className="bg-[#0b1320] text-[#e8dfc8] font-light rounded-2xl overflow-hidden mt-12 mb-12 shadow-2xl border border-[#c9a84c22]">
      <div className="text-center py-12 px-6 border-b border-[#c9a84c33]">
        <div className="inline-flex items-center gap-3 mb-5">
          <div className="font-serif text-[48px] font-semibold bg-gradient-to-br from-[#80c8f0] via-[#4c8ac9] to-[#204a90] bg-clip-text text-transparent leading-none tracking-tight">
            TJ
          </div>
          <div className="text-left leading-tight">
            <span className="font-serif text-[15px] font-semibold tracking-[0.35em] text-[#80c8f0] uppercase block">Textile</span>
            <span className="text-[10px] tracking-[0.3em] text-[#80c8f099] uppercase">Jaipur</span>
          </div>
        </div>
        <h2 className="font-serif text-[clamp(26px,5vw,40px)] text-[#b0d8f0] tracking-wide mb-2">What Our Customers Say</h2>
        <p className="text-[12px] tracking-[0.25em] text-[#80c8f088] uppercase">Verified Reviews · Artisan Embroidered Velvet Jacket</p>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-8 py-8 px-6 border-b border-[#c9a84c22]">
        <div className="font-serif text-[52px] font-semibold text-[#80c8f0] leading-none">{avgRating}</div>
        <div className="flex flex-col gap-1.5">
          <div className="text-[20px] text-[#80c8f0] tracking-widest">
            {'★'.repeat(Math.round(Number(avgRating)))}{'☆'.repeat(5 - Math.round(Number(avgRating)))}
          </div>
          <div className="text-[11px] tracking-[0.2em] text-[#80c8f088] uppercase">Based on {totalReviews} reviews</div>
        </div>
        <div className="flex flex-col gap-1.5">
          {starsCount.map((bar) => (
            <div key={bar.stars} className="flex items-center gap-2.5 text-[11px] text-[#80c8f099]">
              <span className="w-4 text-right">{bar.stars}★</span>
              <div className="w-[120px] max-w-[80px] sm:max-w-[120px] h-1 bg-[#1a2535] rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-[#4c8ac9] to-[#80c8f0] rounded-full" style={{ width: bar.pct }}></div>
              </div>
              <span className="w-2">{bar.count}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="max-w-[900px] mx-auto py-10 px-5 sm:px-10 flex flex-col">
        {allReviews.map((review, idx) => (
          <div key={idx} className="border-b border-[#4c8ac933] py-8 first:pt-0 last:border-b-0">
            <div className="flex items-start gap-3.5 mb-2.5">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#101e35] to-[#1a2d4c] border-[1.5px] border-[#4c8ac966] flex items-center justify-center font-serif text-[17px] text-[#80c8f0] font-semibold shrink-0">
                {review.initial || review.name.charAt(0)}
              </div>
              <div className="flex-1">
                <div className="font-serif text-[16px] font-semibold text-[#b0d8f0] mb-0.5">{review.name}</div>
                {review.location && <div className="text-[10px] text-[#80c8f077] tracking-[0.15em] uppercase">{review.location}</div>}
              </div>
              <div className="text-[11px] text-[#556985] tracking-[0.05em] whitespace-nowrap mt-0.5 hidden sm:block">
                {review.date}
              </div>
            </div>
            <div className="text-[13px] tracking-widest mb-1.5">
              <span className="text-[#80c8f0]">{'★'.repeat(review.stars)}</span>
              <span className="text-[#2a3c55]">{'★'.repeat(5 - review.stars)}</span>
            </div>
            {review.title && <div className="font-serif text-[16px] italic text-[#d8e8f5] mb-1.5">{review.title}</div>}
            <div className="text-[13.5px] leading-relaxed text-[#9ab0cd] max-w-[660px]">
              {review.body}
            </div>
            {review.isVerified && (
              <div className="inline-flex items-center gap-1.5 border border-[#4c8ac944] rounded-[3px] px-2 py-0.5 text-[9px] tracking-[0.15em] text-[#80c8f099] uppercase mt-2">
                ✔ Verified Buyer
              </div>
            )}
            {review.reply && (
              <div className="mt-3.5 ml-4 p-3 bg-[#0d182b] border-l-2 border-[#4c8ac988] rounded-r text-[#7b93b5] text-[13px] leading-relaxed shadow-sm">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-serif font-semibold bg-gradient-to-br from-[#b0d8f0] to-[#4c8ac9] bg-clip-text text-transparent tracking-[0.05em]">TJ · Textile Jaipur</span>
                  <span className="text-[9px] text-[#4c8ac977] tracking-[0.18em] uppercase">Official Response</span>
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

