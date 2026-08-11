import React from 'react';
import { ReviewsClient } from './ReviewsClient';

export const revalidate = 60; // Revalidate every 60 seconds

export const metadata = {
  title: 'Customer Reviews | Textile Jaipur',
  description: 'See what our customers have to say about our handcrafted bohemian jackets, dresses, and more.',
};

export default async function ReviewsPage() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

  let reviews: any[] = [];

  try {
    const res = await fetch(`${url}/rest/v1/reviews?status=eq.approved&order=created_at.desc`, {
      headers: { apikey: key, Authorization: `Bearer ${key}` },
      next: { revalidate: 60 }
    });
    
    if (res.ok) {
      reviews = await res.json();
    }
  } catch (err) {
    console.error('Failed to fetch reviews', err);
  }

  // Calculate average rating
  const averageRating = reviews.length > 0 
    ? (reviews.reduce((acc, curr) => acc + (curr.rating || 5), 0) / reviews.length).toFixed(1)
    : '5.0';

  return (
    <ReviewsClient reviews={reviews} averageRating={averageRating} />
  );
}
