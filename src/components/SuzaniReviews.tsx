'use client';

import React from 'react';

const reviewsData = [
  {
    initial: 'M',
    name: 'Madison R.',
    location: '📍 Texas, USA',
    date: 'January 4, 2026',
    stars: 5,
    title: '"Absolutely obsessed with this jacket!"',
    body: 'Every little motif — the cowboy boot, the moon, the smiley face — is so charming and detailed. The velvet feels luxurious and it arrived faster than I expected.',
    reply: 'Thank you so much, Madison! Every motif is hand-crafted with care in Jaipur — so happy it found the right home. 🙏'
  },
  {
    initial: 'C',
    name: 'Carly J.',
    location: '📍 Nashville, TN',
    date: 'January 18, 2026',
    stars: 4,
    title: '"Unique piece, great quality"',
    body: 'This jacket turns heads every time I wear it. Sizing runs a little relaxed — true to size if you like a looser fit. Customer support was quick and helpful when I had a question.',
    reply: 'Carly, this made our day! 💛 Our team is always here for you — see you on your next order.'
  },
  {
    initial: 'B',
    name: 'Brenda K.',
    location: '📍 Oklahoma City, OK',
    date: 'February 3, 2026',
    stars: 3,
    title: '"Beautiful but took a while to arrive"',
    body: 'The cowboy boot and star motifs are gorgeous — very Western and artistic. Took about 12 days to arrive which felt long, though the quality made it worth the wait.',
    reply: 'Thank you for your patience, Brenda! Our pieces ship internationally from Jaipur and we\'re working on faster options. Glad the quality delivered! 🙏'
  },
  {
    initial: 'S',
    name: 'Savannah T.',
    location: '📍 Austin, TX',
    date: 'February 17, 2026',
    stars: 5,
    title: '"Best purchase of 2026 so far!"',
    body: 'Picked up the Velvet Suzani and the TNT Suzani together — both incredible, but the velvet one is next level. I\'ve worn it to three events and got compliments every time.',
    reply: 'Savannah, the Velvet + TNT combo is iconic — you have great taste! Three events, three rounds of compliments. 🌟 See you again soon!'
  },
  {
    initial: 'D',
    name: 'Deborah M.',
    location: '📍 Denver, CO',
    date: 'March 5, 2026',
    stars: 2,
    title: '"Colors looked different in person"',
    body: 'The teal and red patches were more muted than they appeared on screen. Still a nice piece, but I wish the product photos were a little more true-to-life.',
    reply: 'Hi Deborah, thank you for this honest feedback — we\'re updating our product photography to better show the true richness of the velvet. Please reach out if we can help further. 🙏'
  },
  {
    initial: 'A',
    name: 'Amber L.',
    location: '📍 Phoenix, AZ',
    date: 'March 19, 2026',
    stars: 5,
    title: '"Statement piece of the season"',
    body: 'I\'ve collected Suzani pieces for years and this velvet jacket is one of the most special things I own. The zip front is practical, the collar beautiful, and the embroidery incredibly intricate. 10/10.',
    reply: 'A Suzani collector giving us 10/10 — that is the highest compliment! 🌟 Thank you endlessly, Amber. 🙏'
  },
  {
    initial: 'R',
    name: 'Rachel H.',
    location: '📍 Bozeman, MT',
    date: 'April 2, 2026',
    stars: 3,
    title: '"Gorgeous, but runs small"',
    body: 'I ordered my usual size and it was snug across the shoulders — definitely size up. The velvet is soft and well-made though, and support responded the same day I reached out.',
    reply: 'Rachel, we recommend sizing up for a relaxed or layered fit — adding this note to the product page thanks to you! Happy to help with an exchange anytime. 💛'
  },
  {
    initial: 'T',
    name: 'Tanya W.',
    location: '📍 Santa Fe, NM',
    date: 'April 21, 2026',
    stars: 5,
    title: '"Art you can wear!"',
    body: 'Living in Santa Fe, I\'m surrounded by art — and this jacket holds its own. The snake, the eye, the crescent moon all feel intentional and full of meaning. Already recommended it to four friends.',
    reply: '"Art you can wear" — we might borrow that! 🎨 Thank you for spreading the word, Tanya. Welcome your friends to the Textile Jaipur family! 🙏'
  },
  {
    initial: 'K',
    name: 'Karen P.',
    location: '📍 Tulsa, OK',
    date: 'May 8, 2026',
    stars: 1,
    title: '"Loose stitch on arrival, slow response"',
    body: 'One of the appliqué stars was already coming unstitched when I received it, and it took several days to get a reply. It was eventually resolved, but the experience was frustrating.',
    reply: 'Karen, we sincerely apologize — this is not the standard we hold ourselves to. We\'ve tightened our quality checks and improved response times. Please reach out directly anytime and we\'ll prioritize you. 🙏'
  },
  {
    initial: 'J',
    name: 'Jessica F.',
    location: '📍 Albuquerque, NM',
    date: 'May 27, 2026',
    stars: 4,
    title: '"Fun, bold, and very me!"',
    body: 'Ordered this as a birthday treat and I\'m so glad I did. The appliqué symbols feel like they\'re telling a story. Only wish it came in more colors!',
    reply: 'Happy birthday Jessica! 🎂 We\'ve heard the "more colors" request before — something may be in the works. Stay tuned! 👀'
  },
  {
    initial: 'L',
    name: 'Louise M.',
    location: '📍 Scottsdale, AZ',
    date: 'June 14, 2026',
    stars: 5,
    title: '"Worth every penny and more"',
    body: 'Got the Velvet Suzani and the Cotton Suzani together — two completely different vibes, both exceptional. The velvet one is my evening go-to. This shop has a customer for life.',
    reply: '"A customer for life" — that brought our whole team so much joy! 🥹 Our artisans pour their soul into every stitch. Thank you, Louise. See you soon! 💛'
  }
];

export const SuzaniReviews: React.FC = () => {
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
        <h2 className="font-serif text-[clamp(28px,5vw,42px)] text-[#f0d080] tracking-wide mb-2">What Our Customers Say</h2>
        <p className="text-[12px] tracking-[0.25em] text-[#c9a84c88] uppercase">Verified Reviews · Velvet Suzani Jacket</p>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-8 py-8 px-6 border-b border-[#c9a84c22]">
        <div className="font-serif text-[52px] font-semibold text-[#c9a84c] leading-none">4.2</div>
        <div className="flex flex-col gap-1.5">
          <div className="text-[20px] text-[#c9a84c] tracking-widest">★★★★☆</div>
          <div className="text-[11px] tracking-[0.2em] text-[#c9a84c88] uppercase">Based on 11 reviews</div>
        </div>
        <div className="flex flex-col gap-1.5">
          {[
            { stars: 5, pct: "55%", count: 6 },
            { stars: 4, pct: "27%", count: 3 },
            { stars: 3, pct: "18%", count: 2 },
            { stars: 2, pct: "9%", count: 1 },
            { stars: 1, pct: "9%", count: 1 },
          ].map((bar) => (
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
        {reviewsData.map((review, idx) => (
          <div key={idx} className="border-b border-[#c9a84c18] py-8 first:pt-0 last:border-b-0">
            <div className="flex items-start gap-3.5 mb-2.5">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#1e1a10] to-[#3a2e10] border-[1.5px] border-[#c9a84c55] flex items-center justify-center font-serif text-[17px] text-[#c9a84c] font-semibold shrink-0">
                {review.initial}
              </div>
              <div className="flex-1">
                <div className="font-serif text-[16px] font-semibold text-[#f0d080] mb-0.5">{review.name}</div>
                <div className="text-[10px] text-[#c9a84c77] tracking-[0.15em] uppercase">{review.location}</div>
              </div>
              <div className="hidden sm:block text-[11px] text-[#484840] tracking-wide whitespace-nowrap mt-0.5">
                {review.date}
              </div>
            </div>
            <div className="text-[13px] tracking-widest mb-1.5">
              <span className="text-[#c9a84c]">{'★'.repeat(review.stars)}</span>
              <span className="text-[#2e2e2e]">{'★'.repeat(5 - review.stars)}</span>
            </div>
            <div className="font-serif text-[16px] italic text-[#d8cfb8] mb-1.5">{review.title}</div>
            <div className="text-[13.5px] leading-relaxed text-[#908878] max-w-[660px]">
              {review.body}
            </div>
            <div className="inline-flex items-center gap-1.5 border border-[#c9a84c33] rounded px-2 py-0.5 text-[9px] tracking-[0.15em] text-[#c9a84c88] uppercase mt-2">
              <span>✔</span> Verified Buyer
            </div>
            {review.reply && (
              <div className="mt-3.5 ml-4 p-3 bg-[#161208] border-l-2 border-[#c9a84c88] rounded-r">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="font-serif text-[13px] font-semibold bg-gradient-to-br from-[#f0d080] to-[#c9a84c] bg-clip-text text-transparent tracking-wide">
                    TJ · Textile Jaipur
                  </span>
                  <span className="text-[9px] text-[#c9a84c55] tracking-[0.18em] uppercase">Official Response</span>
                </div>
                <div className="text-[13px] leading-relaxed text-[#857a65]">
                  {review.reply}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="text-center py-10 px-6 border-t border-[#c9a84c1a]">
        <p className="text-[11px] tracking-[0.2em] text-[#c9a84c55] uppercase mb-1">Handcrafted in Jaipur, India</p>
        <h3 className="font-serif text-[18px] text-[#c9a84c88]">Free Shipping · Secure Checkout · Genuine Artisan Craft</h3>
      </div>
    </div>
  );
};
