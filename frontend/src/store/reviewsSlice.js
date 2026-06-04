// src/store/reviewsSlice.js
import { supabase } from '../lib/supabaseClient';

export default function createReviewsSlice(set, get) {
  return {
    // Map of productId -> reviews array
    reviewsByProduct: {},
    reviewsLoading: false,

    fetchReviews: async (productId) => {
      set({ reviewsLoading: true });
      try {
        const { data, error } = await supabase
          .from('reviews')
          .select(`
            id, rating, comment, created_at, is_verified_purchase,
            profiles (first_name, last_name)
          `)
          .eq('product_id', productId)
          .eq('status', 'approved')
          .order('created_at', { ascending: false });

        if (error) throw error;
        set(state => ({
          reviewsByProduct: {
            ...state.reviewsByProduct,
            [productId]: data || [],
          },
        }));
      } catch (err) {
        console.error('Failed to fetch reviews:', err);
      } finally {
        set({ reviewsLoading: false });
      }
    },

    submitReview: async ({ productId, rating, comment }) => {
      const userId = get().auth?.user?.id;
      if (!userId) throw new Error('Must be logged in to submit a review.');

      // Sanitize comment — strip HTML tags
      const safeComment = comment
        .replace(/<[^>]*>/g, '')
        .replace(/[<>]/g, '')
        .trim()
        .substring(0, 2000);

      if (!safeComment || safeComment.length < 10) {
        throw new Error('Review must be at least 10 characters.');
      }
      if (rating < 1 || rating > 5) {
        throw new Error('Rating must be between 1 and 5 stars.');
      }

      const { error } = await supabase.from('reviews').insert({
        product_id: productId,
        user_id: userId,
        rating: Math.round(rating),
        comment: safeComment,
        status: 'approved', // auto-approve; change to 'pending' for moderation
        is_verified_purchase: false,
        created_at: new Date().toISOString(),
      });

      if (error) throw error;

      // Refresh reviews for this product
      await get().fetchReviews(productId);
    },
  };
}
