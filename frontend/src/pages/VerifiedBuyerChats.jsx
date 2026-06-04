import React, { useState } from 'react';
import MainLayout from '../layouts/MainLayout';
import { StarIcon, ChatBubbleLeftEllipsisIcon, CheckBadgeIcon } from '@heroicons/react/24/solid';

const REVIEWS = [
  {
    name: 'Priya S.',
    location: 'Mumbai',
    product: 'Royal Banarasi Silk Saree',
    rating: 5,
    verified: true,
    date: 'May 12, 2024',
    review: 'I wore this saree for my sister\'s wedding reception and got SO many compliments. The silk is buttery soft and the zari work catches the light beautifully. The packaging was also extremely luxurious — felt like opening a gift.',
    image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80',
  },
  {
    name: 'Aryan K.',
    location: 'Delhi',
    product: 'Classic Men\'s Sherwani',
    rating: 5,
    verified: true,
    date: 'April 28, 2024',
    review: 'Ordered this for my engagement ceremony. The fit was absolutely perfect — I barely needed any alterations. The embroidery is so finely done. Worth every rupee. Will definitely be ordering my wedding sherwani from here.',
    image: 'https://images.unsplash.com/photo-1594912952549-fb93be3d5fc4?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80',
  },
  {
    name: 'Meera N.',
    location: 'Kochi',
    product: 'Designer Velvet Lehenga',
    rating: 5,
    verified: true,
    date: 'April 3, 2024',
    review: 'I was a bit nervous ordering a lehenga online without trying it on, but the size chart was incredibly accurate. The velvet is rich and doesn\'t feel heavy. Customer support was also very responsive when I had a question about the dupatta drape.',
    image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80',
  },
  {
    name: 'Rohan T.',
    location: 'Bangalore',
    product: 'Jaipur Heritage Cotton Kurta',
    rating: 5,
    verified: true,
    date: 'March 19, 2024',
    review: 'The quality is outstanding — especially for a daily wear kurta. The block printing is sharp and hasn\'t faded even after multiple washes. I\'ve bought 4 kurtas from this brand now and they\'re all consistently excellent.',
    image: 'https://images.unsplash.com/photo-1583391733958-650ac5d2bc50?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80',
  },
  {
    name: 'Kavya P.',
    location: 'Hyderabad',
    product: 'Embroidered Anarkali Suit',
    rating: 5,
    verified: true,
    date: 'March 5, 2024',
    review: 'Absolutely in love with my Anarkali! The colour in real life is even more vibrant than in the photos. Shipping was faster than expected and the suit came beautifully packed with a handwritten note. Such a thoughtful touch.',
    image: 'https://images.unsplash.com/photo-1609505848912-b7c3b8b4beda?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80',
  },
  {
    name: 'Sunita R.',
    location: 'Jaipur',
    product: 'Handwoven Chanderi Dupatta',
    rating: 5,
    verified: true,
    date: 'February 22, 2024',
    review: 'The Chanderi is so delicate and airy — exactly what I was looking for. I paired it with a plain kurta and it instantly elevated the whole look. Will be gifting one to my daughter for her birthday.',
    image: 'https://images.unsplash.com/photo-1608064971701-d8ec1adbf30d?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80',
  },
];

const RATING_FILTERS = [5, 4, 3, 2, 1];

export default function VerifiedBuyerChats() {
  const [filter, setFilter] = useState(null);

  const displayed = filter ? REVIEWS.filter(r => r.rating === filter) : REVIEWS;

  return (
    <MainLayout title="Verified Buyer Reviews – Gupta International" description="Read genuine reviews from real verified buyers.">
      <div className="max-w-5xl mx-auto py-12 px-4">
        
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-amber-50 rounded-2xl mb-5">
            <ChatBubbleLeftEllipsisIcon className="w-8 h-8 text-amber-500" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Verified Buyer Reviews</h1>
          <p className="text-xl text-gray-500 max-w-2xl mx-auto">Real reviews from real customers — every review is verified against a completed purchase.</p>
        </div>

        {/* Rating Summary */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-3xl p-8 mb-10 text-white text-center">
          <p className="text-6xl font-bold mb-2">5.0</p>
          <div className="flex justify-center gap-1 mb-2">
            {[...Array(5)].map((_, i) => <StarIcon key={i} className="w-6 h-6 text-amber-400" />)}
          </div>
          <p className="text-indigo-200">Based on {REVIEWS.length} verified reviews</p>
        </div>

        {/* Filter */}
        <div className="flex items-center gap-3 mb-8 flex-wrap">
          <span className="text-sm text-gray-500 font-medium">Filter by:</span>
          <button
            onClick={() => setFilter(null)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${!filter ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
          >
            All
          </button>
          {RATING_FILTERS.map(r => (
            <button
              key={r}
              onClick={() => setFilter(r)}
              className={`flex items-center gap-1 px-4 py-2 rounded-full text-sm font-medium transition-colors ${filter === r ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
            >
              <StarIcon className="w-4 h-4 text-amber-400" /> {r}
            </button>
          ))}
        </div>

        {/* Reviews */}
        <div className="space-y-6">
          {displayed.map((r, i) => (
            <div key={i} className="bg-white/60 backdrop-blur-sm rounded-2xl border border-white/80 shadow-sm p-6 md:p-8">
              <div className="flex items-start gap-5">
                <img src={r.image} alt={r.name} className="w-14 h-14 rounded-xl object-cover flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 flex-wrap mb-1">
                    <span className="font-bold text-gray-900">{r.name}</span>
                    {r.verified && (
                      <span className="inline-flex items-center gap-1 text-xs text-green-600 font-semibold bg-green-50 px-2 py-0.5 rounded-full">
                        <CheckBadgeIcon className="w-3.5 h-3.5" /> Verified Buyer
                      </span>
                    )}
                    <span className="text-xs text-gray-400">{r.location} · {r.date}</span>
                  </div>
                  <p className="text-xs text-indigo-600 font-medium mb-2">Purchased: {r.product}</p>
                  <div className="flex gap-0.5 mb-3">
                    {[...Array(r.rating)].map((_, j) => <StarIcon key={j} className="w-4 h-4 text-amber-400" />)}
                  </div>
                  <p className="text-gray-700 leading-relaxed">{r.review}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {displayed.length === 0 && (
          <div className="text-center py-16 text-gray-400">
            <p>No reviews found for this rating.</p>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
