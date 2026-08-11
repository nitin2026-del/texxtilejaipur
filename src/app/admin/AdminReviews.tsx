import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Loader2, Trash2, Image as ImageIcon, Star } from 'lucide-react';

export const AdminReviews = ({ products, initialProductId }: { products: any[], initialProductId?: string }) => {
  const [selectedProductId, setSelectedProductId] = useState<string>(initialProductId || '');
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    if (initialProductId) {
      setSelectedProductId(initialProductId);
    }
  }, [initialProductId]);
  
  const [newReview, setNewReview] = useState({
    name: '',
    location: '',
    rating: 5,
    title: '',
    comment: '',
    image_url: '',
    image_urls: [] as string[]
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (selectedProductId) {
      fetchReviews(selectedProductId);
    } else {
      setReviews([]);
    }
  }, [selectedProductId]);

  const fetchReviews = async (productId: string) => {
    setLoading(true);
    try {
      let query = supabase.from('reviews').select('*').order('created_at', { ascending: false });
      
      if (productId === 'general') {
        query = query.is('product_id', null);
      } else {
        query = query.eq('product_id', productId);
      }
      
      const { data, error } = await query;
        
      if (error) throw error;
      setReviews(data || []);
    } catch (err) {
      console.error('Error fetching reviews:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (reviewId: string) => {
    if (!window.confirm('Are you sure you want to delete this review?')) return;
    try {
      const { error } = await supabase.from('reviews').delete().eq('id', reviewId);
      if (error) throw error;
      setReviews(prev => prev.filter(r => r.id !== reviewId));
    } catch (err) {
      console.error('Error deleting review:', err);
      alert('Failed to delete review');
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    
    try {
      const uploadPromises = files.map(async (file) => {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `review-images/${fileName}`;
        
        const { error: uploadError } = await supabase.storage
          .from('products')
          .upload(filePath, file);
          
        if (uploadError) throw uploadError;
        
        const { data } = supabase.storage
          .from('products')
          .getPublicUrl(filePath);
          
        return data.publicUrl;
      });

      const newUrls = await Promise.all(uploadPromises);
      setNewReview(prev => ({ ...prev, image_urls: [...prev.image_urls, ...newUrls] }));
    } catch (err) {
      console.error('Upload error:', err);
      alert('Failed to upload image. Please check bucket permissions.');
    }
  };

  const removeImage = (indexToRemove: number) => {
    setNewReview(prev => ({
      ...prev,
      image_urls: prev.image_urls.filter((_, i) => i !== indexToRemove)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProductId) return alert('Select a product or General Review first');
    if (!newReview.name || !newReview.comment) return alert('Name and Comment are required');
    
    setIsSubmitting(true);
    try {
      const payload: any = {
        product_id: selectedProductId === 'general' ? null : selectedProductId,
        reviewer_name: newReview.name,
        reviewer_location: newReview.location,
        rating: newReview.rating,
        title: newReview.title,
        comment: newReview.comment,
        status: 'approved',
        image_urls: newReview.image_urls
      };

      const { data, error } = await supabase.from('reviews').insert(payload).select().single();
      
      if (error) throw error;
      
      setReviews(prev => [data, ...prev]);
      setNewReview({ name: '', location: '', rating: 5, title: '', comment: '', image_url: '', image_urls: [] });
      alert('Review added successfully');
    } catch (err: any) {
      console.error('Error adding review:', err);
      alert(`Failed to add review. Error: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fadeIn">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-serif font-bold text-zinc-900">Manage Product Reviews</h2>
      </div>

      <div className="glass-card border border-zinc-200 p-8 rounded-3xl space-y-6">
        <div>
          <label className="block text-sm font-bold text-zinc-700 mb-2">Select Product</label>
          <select 
            className="w-full p-3 rounded-xl border border-zinc-200 focus:ring-2 focus:ring-violet-600 outline-none"
            value={selectedProductId}
            onChange={(e) => setSelectedProductId(e.target.value)}
          >
            <option value="">-- Choose a Product --</option>
            <option value="general">✨ General / Site Review (No Product)</option>
            {products.map(p => (
              <option key={p.id} value={p.id}>{p.name} (SKU: {p.sku})</option>
            ))}
          </select>
        </div>

        {selectedProductId && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6 border-t border-zinc-100">
            {/* ADD REVIEW FORM */}
            <div className="space-y-4">
              <h3 className="font-bold text-lg">Add New Review</h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="Reviewer Name *"
                    required
                    className="w-full p-3 rounded-xl border border-zinc-200 focus:ring-2 focus:ring-violet-600 outline-none"
                    value={newReview.name}
                    onChange={e => setNewReview(prev => ({...prev, name: e.target.value}))}
                  />
                  <input
                    type="text"
                    placeholder="Location (e.g. New York, NY)"
                    className="w-full p-3 rounded-xl border border-zinc-200 focus:ring-2 focus:ring-violet-600 outline-none"
                    value={newReview.location}
                    onChange={e => setNewReview(prev => ({...prev, location: e.target.value}))}
                  />
                </div>
                
                <div className="flex items-center gap-4">
                  <label className="text-sm font-bold text-zinc-700">Rating:</label>
                  <select
                    className="p-3 rounded-xl border border-zinc-200 focus:ring-2 focus:ring-violet-600 outline-none"
                    value={newReview.rating}
                    onChange={e => setNewReview(prev => ({...prev, rating: Number(e.target.value)}))}
                  >
                    {[5,4,3,2,1].map(num => (
                      <option key={num} value={num}>{num} Stars</option>
                    ))}
                  </select>
                </div>

                <input
                  type="text"
                  placeholder="Review Title (Optional)"
                  className="w-full p-3 rounded-xl border border-zinc-200 focus:ring-2 focus:ring-violet-600 outline-none"
                  value={newReview.title}
                  onChange={e => setNewReview(prev => ({...prev, title: e.target.value}))}
                />
                
                <textarea
                  placeholder="Review Comment *"
                  required
                  rows={4}
                  className="w-full p-3 rounded-xl border border-zinc-200 focus:ring-2 focus:ring-violet-600 outline-none resize-none"
                  value={newReview.comment}
                  onChange={e => setNewReview(prev => ({...prev, comment: e.target.value}))}
                ></textarea>

                <div className="p-4 border-2 border-dashed border-zinc-200 rounded-xl flex flex-col">
                  <label className="flex items-center gap-2 cursor-pointer text-sm font-bold text-violet-600 w-max">
                    <ImageIcon className="h-5 w-5" />
                    <span>Upload Customer Photo(s) (Optional)</span>
                    <input type="file" accept="image/*" multiple className="hidden" onChange={handleImageUpload} />
                  </label>
                  <p className="text-xs text-zinc-500 mt-1">You can upload multiple photos at once.</p>
                  
                  {newReview.image_urls && newReview.image_urls.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-3">
                      {newReview.image_urls.map((url, idx) => (
                        <div key={idx} className="relative w-24 h-24 rounded-lg overflow-hidden border border-zinc-200">
                          <img src={url} alt={`Review ${idx}`} className="w-full h-full object-cover" />
                          <button 
                            type="button" 
                            onClick={() => removeImage(idx)}
                            className="absolute top-1 right-1 bg-black/50 text-white p-1 rounded-full text-xs"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="w-full py-3 bg-zinc-900 text-white rounded-xl font-bold hover:bg-zinc-800 disabled:opacity-50"
                >
                  {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 'Publish Review'}
                </button>
              </form>
            </div>

            {/* LIST REVIEWS */}
            <div className="space-y-4">
              <h3 className="font-bold text-lg flex items-center justify-between">
                Existing Reviews
                <span className="bg-zinc-100 text-zinc-600 text-xs px-2 py-1 rounded-full">{reviews.length} total</span>
              </h3>
              
              {loading ? (
                <div className="py-12 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-zinc-300" /></div>
              ) : reviews.length === 0 ? (
                <div className="py-8 text-center text-zinc-500 bg-zinc-50 rounded-xl border border-zinc-100">No reviews found for this product.</div>
              ) : (
                <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
                  {reviews.map(review => (
                    <div key={review.id} className="p-4 bg-white border border-zinc-200 rounded-xl shadow-sm relative group">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="font-bold text-sm text-zinc-900">{review.reviewer_name}</p>
                          <div className="flex text-yellow-500 text-xs">
                            {'★'.repeat(review.rating)}{'☆'.repeat(5-review.rating)}
                          </div>
                        </div>
                        <button 
                          onClick={() => handleDelete(review.id)}
                          className="text-red-500 opacity-0 group-hover:opacity-100 transition-opacity p-1.5 hover:bg-red-50 rounded-lg"
                          title="Delete Review"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <p className="text-sm text-zinc-600 line-clamp-3">{review.comment}</p>
                      {review.image_url && (
                        <div className="mt-3 w-16 h-16 rounded-lg overflow-hidden border border-zinc-200 flex-shrink-0">
                          <img src={review.image_url} alt="Review attachment" className="w-full h-full object-cover" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
