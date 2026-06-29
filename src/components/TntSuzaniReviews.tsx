'use client';

import React from 'react';
import { ReviewData } from './SuzaniReviews';

const reviewsData = [
  {
    initial: 'E',
    name: 'Emma L.',
    location: '📍 San Diego, CA',
    date: 'June 18, 2026',
    stars: 5,
    title: '"Stunning embroidery and free delivery!"',
    body: 'The colors on this cotton suzani jacket are so vibrant and beautiful. The intricate needlework on the soft, breathable cotton base is simply breathtaking. I was really impressed that it arrived so quickly and that delivery was completely free. A gorgeous handcrafted boho layer for the season.',
    reply: 'Thank you Emma! We love offering free delivery to our amazing customers. Enjoy your new boho layer! ✨'
  },
  {
    initial: 'O',
    name: 'Olivia S.',
    location: '📍 London, UK',
    date: 'June 5, 2026',
    stars: 1,
    title: '"Lost in transit, but saved by support"',
    body: 'My package got completely lost in transit by the carrier, which was incredibly frustrating as it was meant to be a gift. However, I reached out to customer support and they were phenomenal. They immediately overnighted a replacement at no extra charge via a different carrier. The jacket itself is a beautiful cotton piece, but the customer service is what really impressed me.',
    reply: 'Olivia, we are so sorry your original package was lost! We know how stressful that is. We are so glad our team could get a replacement to you in time for the gift! 🙏'
  },
  {
    initial: 'C',
    name: 'Chloe R.',
    location: '📍 Chicago, IL',
    date: 'June 2, 2026',
    stars: 5,
    title: '"The 25% off deal made this an absolute steal!"',
    body: 'I bought this jacket along with a matching tote to get my cart over $150, and the automatic 25% off discount applied flawlessly. The jacket itself is incredibly soft breathable cotton and the dimensional floral needlework is flawless. Highly recommend paying with PayPal for a quick checkout!',
    reply: 'Smart shopping, Chloe! 🛍️ We\'re so glad you took advantage of the discount. Thank you for the kind words about our artisans\' needlework!'
  },
  {
    initial: 'S',
    name: 'Sarah M.',
    location: '📍 Brooklyn, NY',
    date: 'May 24, 2026',
    stars: 3,
    title: '"Beautiful, but sizing was tricky"',
    body: 'The handcrafted floral embroidery on this cotton layer is stunning in person. However, I found the sizing across the bust to be a bit tighter than expected for my body type. Thankfully, their 14-day return policy is totally hassle-free. Customer support helped me process the exchange for a larger size immediately.',
    reply: 'Thank you for your feedback, Sarah! Handcrafted cotton can occasionally have slight fit variations. We\'re so glad our support team could get that larger size sent out to you quickly! 💛'
  },
  {
    initial: 'M',
    name: 'Mia D.',
    location: '📍 Sydney, AU',
    date: 'May 10, 2026',
    stars: 5,
    title: '"Secure and easy checkout with PayPal."',
    body: 'Sometimes I get nervous buying directly from international artisan shops, but seeing they accept PayPal gave me total peace of mind. The transaction was seamless. The boho layer is a work of art—the contrast stitching against the natural cotton is perfection. 10/10.',
    reply: 'Trust and security are incredibly important to us, Mia. We\'re thrilled you had a seamless experience and love your new jacket! 🙏'
  },
  {
    initial: 'R',
    name: 'Rachel K.',
    location: '📍 Toronto, ON',
    date: 'April 15, 2026',
    stars: 2,
    title: '"Small defect, handled perfectly"',
    body: 'When my jacket arrived, there was a small discoloration spot on one of the embroidered sleeves. I was so disappointed because the 100% cotton material felt so nice. I emailed customer service with a photo, and they replied within an hour offering a full replacement or a generous partial refund. I took the refund (which hit my PayPal instantly) and easily got the spot out with a gentle wash. Excellent service!',
    reply: 'Rachel, we are so sorry about that discoloration spot slipping past quality control! We are thrilled our team could resolve it quickly for you and that the jacket is perfect now! 🥰'
  },
  {
    initial: 'J',
    name: 'Jessica W.',
    location: '📍 Melbourne, AU',
    date: 'March 28, 2026',
    stars: 5,
    title: '"Gorgeous jacket, amazing perks."',
    body: 'The embroidery is top-notch. It really captures that authentic bohemian vibe on a comfortable cotton base. Between the free shipping, the PayPal option, and the highly responsive customer service when I asked about care instructions, Textile Jaipur has won a loyal customer!',
    reply: 'Welcome to the TJ family, Jessica! 🌸 Enjoy your beautiful new handcrafted jacket!'
  }
];

export const TntSuzaniReviews: React.FC<{ dynamicReviews?: ReviewData[] }> = ({ dynamicReviews = [] }) => {
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
        <p className="text-[12px] tracking-[0.25em] text-[#c9a84c88] uppercase">Verified Reviews · Cotton TNT Suzani Boho Layer</p>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-8 py-8 px-6 border-b border-[#c9a84c22]">
        <div className="font-serif text-[52px] font-semibold text-[#c9a84c] leading-none">{avgRating}</div>
        <div className="flex flex-col gap-1.5">
          <div className="text-[20px] text-[#c9a84c] tracking-widest">
            {'★'.repeat(Math.round(Number(avgRating)))}{'☆'.repeat(5 - Math.round(Number(avgRating)))}
          </div>
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
                {review.initial || review.name.charAt(0)}
              </div>
              <div className="flex-1">
                <div className="font-serif text-[16px] font-semibold text-[#f0d080] mb-0.5">{review.name}</div>
                {review.location && <div className="text-[10px] text-[#c9a84c77] tracking-[0.15em] uppercase">{review.location}</div>}
              </div>
              <div className="text-[11px] text-[#484840] tracking-[0.05em] whitespace-nowrap mt-0.5 hidden sm:block">
                {review.date}
              </div>
            </div>
            <div className="text-[13px] tracking-widest mb-1.5">
              <span className="text-[#c9a84c]">{'★'.repeat(review.stars)}</span>
              <span className="text-[#2e2e2e]">{'★'.repeat(5 - review.stars)}</span>
            </div>
            {review.title && <div className="font-serif text-[16px] italic text-[#d8cfb8] mb-1.5">{review.title}</div>}
            <div className="text-[13.5px] leading-relaxed text-[#908878] max-w-[660px]">
              {review.body}
            </div>
            <div className="inline-flex items-center gap-1.5 border border-[#c9a84c33] rounded-[3px] px-2 py-0.5 text-[9px] tracking-[0.15em] text-[#c9a84c88] uppercase mt-2">
              ✔ Verified Buyer
            </div>
            {review.reply && (
              <div className="mt-3.5 ml-4 p-3 bg-[#161208] border-l-2 border-[#c9a84c88] rounded-r text-[#857a65] text-[13px] leading-relaxed">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-serif font-semibold bg-gradient-to-br from-[#f0d080] to-[#c9a84c] bg-clip-text text-transparent tracking-[0.05em]">TJ · Textile Jaipur</span>
                  <span className="text-[9px] text-[#c9a84c55] tracking-[0.18em] uppercase">Official Response</span>
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
