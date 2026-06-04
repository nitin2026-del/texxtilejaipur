import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import MainLayout from '../layouts/MainLayout';
import { ShoppingBagIcon, HeartIcon, ArrowLeftIcon, StarIcon, TruckIcon, ArrowPathIcon, ShieldCheckIcon, CheckIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolid, StarIcon as StarSolid } from '@heroicons/react/24/solid';

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { products, fetchProducts, addItem, wishlist, toggleWishlist, addRecentlyViewed, fetchReviews, submitReview, reviewsByProduct, auth } = useStore();
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const [activeImage, setActiveImage] = useState(null);

  // Review form state
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewHover, setReviewHover] = useState(0);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewMessage, setReviewMessage] = useState('');
  const [reviewError, setReviewError] = useState('');

  useEffect(() => {
    fetchProducts().finally(() => setLoading(false));
  }, []);

  const product = products.find(p => String(p.id) === String(id));
  const isWishlisted = (wishlist || []).includes(id);
  const reviews = reviewsByProduct?.[id] || [];

  // Track recently viewed & fetch reviews
  useEffect(() => {
    if (product) {
      addRecentlyViewed(product.id);
      fetchReviews(product.id);
      if (!activeImage) setActiveImage(product.image_url);
    }
  }, [product?.id]);

  const handleAddToCart = () => {
    for (let i = 0; i < qty; i++) addItem(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (reviewRating === 0) { setReviewError('Please select a star rating.'); return; }
    if (reviewComment.trim().length < 10) { setReviewError('Review must be at least 10 characters.'); return; }
    setReviewError('');
    setReviewSubmitting(true);
    try {
      await submitReview({ productId: product.id, rating: reviewRating, comment: reviewComment });
      setReviewMessage('Thank you! Your review has been submitted.');
      setReviewRating(0);
      setReviewComment('');
      setTimeout(() => setReviewMessage(''), 4000);
    } catch (err) {
      setReviewError(err.message || 'Failed to submit review.');
    } finally {
      setReviewSubmitting(false);
    }
  };

  const avgRating = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : null;

  if (loading) return (
    <MainLayout title="Loading...">
      <div className="max-w-5xl mx-auto py-12 px-4 grid grid-cols-1 md:grid-cols-2 gap-10">
        <div className="bg-white/40 rounded-3xl h-96 animate-pulse" />
        <div className="space-y-4">
          <div className="h-8 bg-white/40 rounded-xl animate-pulse" />
          <div className="h-6 bg-white/40 rounded-xl w-1/2 animate-pulse" />
          <div className="h-24 bg-white/40 rounded-xl animate-pulse" />
        </div>
      </div>
    </MainLayout>
  );

  if (!product) return (
    <MainLayout title="Product Not Found">
      <div className="text-center py-32">
        <h2 className="text-3xl font-bold text-gray-700 mb-4">Product Not Found</h2>
        <p className="text-gray-500 mb-6">This product may have been removed or the link is incorrect.</p>
        <button onClick={() => navigate('/shop')} className="bg-indigo-600 text-white px-8 py-3 rounded-full hover:bg-indigo-700 transition-colors">
          Back to Shop
        </button>
      </div>
    </MainLayout>
  );

  const price = typeof product.price === 'number' ? product.price : 0;
  const priceINR = (price * 83).toFixed(0);

  return (
    <MainLayout
      title={`${product.name} – Gupta International`}
      description={product.description || `Buy ${product.name} at Gupta International`}
      ogImage={product.image_url}
    >
      <div className="max-w-6xl mx-auto py-8">
        {/* Back */}
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-500 hover:text-gray-900 mb-8 transition-colors">
          <ArrowLeftIcon className="w-5 h-5" />
          <span className="text-sm font-medium">Back</span>
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
          {/* Image Gallery */}
          <div className="flex flex-col gap-4">
            <div className="rounded-3xl overflow-hidden shadow-xl bg-gray-50 border border-gray-100">
              <img
                src={activeImage || product.image_url}
                alt={product.name}
                className="w-full h-[500px] object-cover transition-opacity duration-300"
                loading="eager"
              />
            </div>
            {product.all_images?.length > 1 && (
              <div className="flex gap-4 overflow-x-auto pb-2">
                {product.all_images.map((imgUrl, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImage(imgUrl)}
                    className={`flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden border-2 transition-all ${
                      activeImage === imgUrl ? 'border-indigo-600 opacity-100' : 'border-transparent opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img src={imgUrl} alt={`${product.name} ${idx + 1}`} className="w-full h-full object-cover" loading="lazy" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details */}
          <div className="flex flex-col gap-6">
            <div>
              <p className="text-indigo-600 text-sm font-semibold uppercase tracking-widest mb-2">Premium Collection</p>
              <h1 className="text-4xl font-bold text-gray-900 mb-3">{product.name}</h1>

              {/* Rating Summary */}
              <div className="flex items-center gap-2 mb-4">
                <div className="flex gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <StarSolid key={i} className={`w-4 h-4 ${i < Math.round(avgRating || 0) ? 'text-amber-400' : 'text-gray-200'}`} />
                  ))}
                </div>
                <span className="text-sm text-gray-500">
                  {avgRating ? `${avgRating} (${reviews.length} review${reviews.length !== 1 ? 's' : ''})` : 'No reviews yet'}
                </span>
              </div>

              <div className="flex items-baseline gap-3">
                <p className="text-4xl font-bold text-indigo-700">₹{priceINR}</p>
                {product.compare_at_price && product.compare_at_price > product.price && (
                  <p className="text-lg text-gray-400 line-through">₹{(product.compare_at_price * 83).toFixed(0)}</p>
                )}
              </div>
              <p className="text-sm text-gray-400 mt-1">Inclusive of all taxes</p>
            </div>

            <p className="text-gray-600 leading-relaxed">
              {product.description || 'This exquisite piece is handcrafted by master artisans using traditional techniques passed down through generations.'}
            </p>

            {/* Quantity */}
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium text-gray-700">Quantity</span>
              <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden">
                <button onClick={() => setQty(q => Math.max(1, q - 1))} className="px-4 py-2 text-gray-600 hover:bg-gray-100 transition-colors font-bold">−</button>
                <span className="px-4 py-2 font-semibold text-gray-900">{qty}</span>
                <button onClick={() => setQty(q => q + 1)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 transition-colors font-bold">+</button>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={handleAddToCart}
                disabled={added}
                className={`flex-1 flex items-center justify-center gap-2 font-semibold py-4 rounded-2xl transition-all duration-300 ${
                  added ? 'bg-green-500 text-white shadow-lg shadow-green-500/30' : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                }`}
              >
                {added ? (
                  <><CheckIcon className="w-5 h-5 animate-bounce" /> Added to Cart!</>
                ) : (
                  <><ShoppingBagIcon className="w-5 h-5" /> Add to Cart</>
                )}
              </button>
              <button
                onClick={() => toggleWishlist && toggleWishlist(product.id)}
                className="p-4 rounded-2xl border border-gray-200 hover:border-rose-300 hover:bg-rose-50 transition-colors"
                aria-label="Toggle wishlist"
              >
                {isWishlisted
                  ? <HeartSolid className="w-6 h-6 text-rose-500" />
                  : <HeartIcon className="w-6 h-6 text-gray-400" />
                }
              </button>
            </div>

            {/* Features */}
            <div className="grid grid-cols-3 gap-3 mt-2">
              {[
                { icon: TruckIcon, text: 'Free Shipping' },
                { icon: ArrowPathIcon, text: 'Easy Returns' },
                { icon: ShieldCheckIcon, text: 'Authentic' },
              ].map(({ icon: Icon, text }) => (
                <div key={text} className="flex flex-col items-center gap-1 bg-gray-50 rounded-xl p-3 text-center">
                  <Icon className="w-5 h-5 text-indigo-500" />
                  <span className="text-xs text-gray-600 font-medium">{text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Reviews Section ── */}
        <div className="mt-20 border-t border-gray-100 pt-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">
            Customer Reviews
            {avgRating && (
              <span className="ml-3 text-xl text-amber-500 font-semibold">★ {avgRating}</span>
            )}
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Review List */}
            <div className="lg:col-span-2 space-y-6">
              {reviews.length === 0 ? (
                <div className="bg-gray-50 dark:bg-gray-900 rounded-2xl p-8 text-center border border-gray-100 dark:border-gray-800">
                  <StarIcon className="w-10 h-10 mx-auto text-gray-300 mb-3" />
                  <p className="text-gray-500 dark:text-gray-400 font-medium">No reviews yet. Be the first!</p>
                </div>
              ) : (
                reviews.map(review => (
                  <div key={review.id} className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-100 dark:border-gray-800 shadow-sm">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-indigo-100 dark:bg-indigo-500/20 flex items-center justify-center text-indigo-700 dark:text-indigo-400 font-bold text-sm">
                          {review.profiles?.first_name?.[0] || 'A'}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 dark:text-white text-sm">
                            {review.profiles?.first_name || 'Anonymous'} {review.profiles?.last_name?.[0] || ''}.
                          </p>
                          <p className="text-xs text-gray-400">{new Date(review.created_at).toLocaleDateString(undefined, { month: 'short', year: 'numeric', day: 'numeric' })}</p>
                        </div>
                      </div>
                      <div className="flex gap-0.5">
                        {[...Array(5)].map((_, i) => (
                          <StarSolid key={i} className={`w-4 h-4 ${i < review.rating ? 'text-amber-400' : 'text-gray-200'}`} />
                        ))}
                      </div>
                    </div>
                    <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">{review.comment}</p>
                    {review.is_verified_purchase && (
                      <span className="mt-2 inline-flex items-center gap-1 text-xs text-green-600 dark:text-green-400 font-medium">
                        <CheckIcon className="w-3 h-3" /> Verified Purchase
                      </span>
                    )}
                  </div>
                ))
              )}
            </div>

            {/* Write Review Panel */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-100 dark:border-gray-800 shadow-sm h-fit">
              <h3 className="font-bold text-gray-900 dark:text-white mb-4">Write a Review</h3>
              {!auth?.user ? (
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Please <a href="/login" className="text-indigo-600 hover:underline font-medium">sign in</a> to write a review.
                </p>
              ) : (
                <form onSubmit={handleReviewSubmit} className="space-y-4">
                  {/* Star Rating Selector */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Your Rating *</label>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map(star => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setReviewRating(star)}
                          onMouseEnter={() => setReviewHover(star)}
                          onMouseLeave={() => setReviewHover(0)}
                          className="transition-transform hover:scale-110"
                        >
                          <StarSolid className={`w-7 h-7 transition-colors ${
                            star <= (reviewHover || reviewRating) ? 'text-amber-400' : 'text-gray-200'
                          }`} />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Your Review *</label>
                    <textarea
                      rows={4}
                      value={reviewComment}
                      onChange={e => setReviewComment(e.target.value)}
                      maxLength={2000}
                      placeholder="Share your experience with this product..."
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 dark:text-white outline-none focus:ring-2 focus:ring-indigo-600 resize-none text-sm transition-all"
                    />
                    <p className="text-xs text-gray-400 mt-1 text-right">{reviewComment.length}/2000</p>
                  </div>

                  {reviewError && <p className="text-xs text-red-500">{reviewError}</p>}
                  {reviewMessage && <p className="text-xs text-green-600 dark:text-green-400 font-medium">{reviewMessage}</p>}

                  <button
                    type="submit"
                    disabled={reviewSubmitting}
                    className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white text-sm font-semibold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    {reviewSubmitting ? (
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      'Submit Review'
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
