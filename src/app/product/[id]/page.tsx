'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { CartSidebar } from '@/components/CartSidebar';
import { CheckoutModal } from '@/components/CheckoutModal';
import { SuzaniReviews } from '@/components/SuzaniReviews';
import { BlueFloralReviews } from '@/components/BlueFloralReviews';
import { PinkVelvetReviews } from '@/components/PinkVelvetReviews';
import { CottonSuzaniReviews } from '@/components/CottonSuzaniReviews';
import { RustVelvetReviews } from '@/components/RustVelvetReviews';
import { BohemianEleganceReviews } from '@/components/BohemianEleganceReviews';
import { TntSuzaniReviews } from '@/components/TntSuzaniReviews';
import { VintageSuzaniReviews } from '@/components/VintageSuzaniReviews';
import { UniqueTntSuzaniReviews } from '@/components/UniqueTntSuzaniReviews';
import { useCart } from '@/context/CartContext';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { ShieldCheck, Truck, ShoppingCart, Globe, Star, Minus, Plus, Check, Heart, Share2, Award, RefreshCw, Flame, Palette, User, MessageCircleQuestion, ChevronDown, ChevronUp, Sparkles, ArrowLeft, Trash2 } from 'lucide-react';

interface Product {
  id: string;
  sku: string;
  name: string;
  description: string;
  price_inr: number;
  category: string;
  images: string[];
  stock_quantity: number;
  details: { 
    material?: string; 
    origin?: string; 
    care?: string; 
    sizes?: string[]; 
    video_url?: string;
    culturalContext?: string;
    stylingAdvice?: string;
    translations?: {
      fr?: string;
      es?: string;
      ar?: string;
      de?: string;
    }
  };
}

export default function ProductPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const { cart, addToCart, formatPrice } = useCart();
  
  const [product, setProduct] = useState<Product | null>(() => {
    if (typeof window !== 'undefined') {
      try {
        const cached = localStorage.getItem('textilejaipur_collection_cache');
        if (cached) {
          const parsed = JSON.parse(cached);
          const found = parsed.find((p: any) => p.id === id);
          if (found) {
            // Need to map structure from collection cache to Product page structure
            return {
              ...found,
              stock_quantity: found.stock || 0
            };
          }
        }
      } catch (e) {}
    }
    return null;
  });

  const [loading, setLoading] = useState(() => {
    if (typeof window !== 'undefined') {
      try {
        const cached = localStorage.getItem('textilejaipur_collection_cache');
        if (cached) {
          const parsed = JSON.parse(cached);
          if (parsed.find((p: any) => p.id === id)) return false;
        }
      } catch (e) {}
    }
    return true;
  });
  
  const [relatedProducts, setRelatedProducts] = useState<any[]>([]);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [wishlisted, setWishlisted] = useState(false);
  const [shareToast, setShareToast] = useState(false);
  const [expandedQa, setExpandedQa] = useState<number | null>(null);
  const [showQuestionForm, setShowQuestionForm] = useState(false);
  const [inquiryEmail, setInquiryEmail] = useState('');
  const [inquiryQuestion, setInquiryQuestion] = useState('');
  const [isSubmittingInquiry, setIsSubmittingInquiry] = useState(false);
  const [inquiryError, setInquiryError] = useState('');
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [formSubmitted, setFormSubmitted] = useState<string | null>(null);
  const [dynamicReviews, setDynamicReviews] = useState<any[]>([]);
  const [reviewFormData, setReviewFormData] = useState({
    name: '', location: '', rating: 5, title: '', comment: ''
  });
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [reviewError, setReviewError] = useState('');
  const [myReviews, setMyReviews] = useState<string[]>([]);

  const handleInquirySubmit = async () => {
    setIsSubmittingInquiry(true);
    setInquiryError('');
    try {
      // Simulate submission
      await new Promise(resolve => setTimeout(resolve, 1000));
      setShowQuestionForm(false);
      setInquiryQuestion('');
    } catch (err) {
      setInquiryError('Failed to submit. Try again.');
    } finally {
      setIsSubmittingInquiry(false);
    }
  };

  const handleReviewSubmit = async () => {
    if (!product || !reviewFormData.name || !reviewFormData.comment) {
      setReviewError('Name and review comment are required.');
      return;
    }
    setIsSubmittingReview(true);
    setReviewError('');
    try {
      const { data, error } = await supabase.from('reviews').insert({
        product_id: product.id,
        reviewer_name: reviewFormData.name,
        reviewer_location: reviewFormData.location,
        rating: reviewFormData.rating,
        title: reviewFormData.title,
        comment: reviewFormData.comment,
        status: 'approved'
      }).select().single();
      if (error) throw error;
      
      if (data && data.id) {
        const stored = JSON.parse(localStorage.getItem('textilejaipur_my_reviews') || '[]');
        localStorage.setItem('textilejaipur_my_reviews', JSON.stringify([...stored, data.id]));
        setMyReviews(prev => [...prev, data.id]);
        
        // Add to dynamic reviews immediately
        setDynamicReviews(prev => [{
          id: data.id,
          initial: data.reviewer_name ? data.reviewer_name.charAt(0).toUpperCase() : 'A',
          name: data.reviewer_name || 'Anonymous',
          location: data.reviewer_location || undefined,
          date: new Date(data.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
          stars: data.rating || 5,
          title: data.title ? `"${data.title}"` : undefined,
          body: data.comment || '',
          reply: data.reply || undefined,
          isVerified: data.is_verified_buyer || false
        }, ...prev]);
      }
      
      setFormSubmitted('review');
      setReviewFormData({ name: '', location: '', rating: 5, title: '', comment: '' });
      setTimeout(() => { setFormSubmitted(null); setShowReviewForm(false); }, 3000);
    } catch (err) {
      console.error(err);
      setReviewError('Failed to submit review. Try again.');
    } finally {
      setIsSubmittingReview(false);
    }
  };
  
  const handleDeleteReview = async (reviewId: string) => {
    try {
      const { error } = await supabase.from('reviews').delete().eq('id', reviewId);
      if (error) throw error;
      setDynamicReviews(prev => prev.filter(r => r.id !== reviewId));
      
      const stored = JSON.parse(localStorage.getItem('textilejaipur_my_reviews') || '[]');
      const updated = stored.filter((id: string) => id !== reviewId);
      localStorage.setItem('textilejaipur_my_reviews', JSON.stringify(updated));
      setMyReviews(updated);
    } catch (err) {
      console.error('Failed to delete review:', err);
      alert('Failed to delete review');
    }
  };
  
  // International AI features
  const [language, setLanguage] = useState<'en' | 'fr' | 'es' | 'ar' | 'de'>('en');
  const [sizingOpen, setSizingOpen] = useState(false);
  const [sizingInput, setSizingInput] = useState('');
  const [sizingResult, setSizingResult] = useState('');
  const [sizingLoading, setSizingLoading] = useState(false);
  
  // Modal states
  const [cartOpen, setCartOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);

  const isInCart = product ? cart.some((item) => item.id === product.id) : false;

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem('textilejaipur_my_reviews') || '[]');
      setMyReviews(stored);
    } catch {}
  }, []);

  useEffect(() => {
    if (!product) return;
    try {
      const wl = JSON.parse(localStorage.getItem('textilejaipur_wishlist') || '[]');
      setWishlisted(wl.includes(product.id));
    } catch {}
  }, [product]);

  const toggleWishlist = () => {
    if (!product) return;
    try {
      const wl: string[] = JSON.parse(localStorage.getItem('textilejaipur_wishlist') || '[]');
      const updated = wishlisted ? wl.filter((id) => id !== product.id) : [...wl, product.id];
      localStorage.setItem('textilejaipur_wishlist', JSON.stringify(updated));
      const wlProducts: Record<string, unknown> = JSON.parse(localStorage.getItem('textilejaipur_wishlist_products') || '{}');
      if (!wishlisted) wlProducts[product.id] = product;
      else delete wlProducts[product.id];
      localStorage.setItem('textilejaipur_wishlist_products', JSON.stringify(wlProducts));
      setWishlisted(!wishlisted);
    } catch {}
  };

  const handleWhatsAppShare = () => {
    if (!product) return;
    const url = `${window.location.origin}/product/${product.id}`;
    const text = `Check out this beautiful Jaipur textile! 🎨\n*${product.name}*\n${formatPrice(product.price_inr)}\n\n${url}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
    setShareToast(true);
    setTimeout(() => setShareToast(false), 3000);
  };

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) return;
      if (!product) setLoading(true);
      try {
        const { data, error } = await supabase
          .from('products')
          .select(`
            *,
            categories (
              name
            ),
            product_images (
              url,
              is_primary,
              display_order
            )
          `)
          .eq('id', id)
          .single();

        if (error) throw error;
        if (data) {
          const item = data as any;
          const sortedImages = item.product_images
            ? [...item.product_images]
                .sort((a, b) => (a.display_order || 0) - (b.display_order || 0))
                .map((img) => img.url)
            : [];

          setProduct({
            id: item.id,
            sku: `HT-${item.id.slice(0, 8).toUpperCase()}`,
            name: item.name,
            description: item.description || '',
            price_inr: item.price || 0,
            category: item.categories?.name || 'Ethnic Wear',
            images: sortedImages.length > 0 ? sortedImages : ['https://images.unsplash.com/photo-1544816155-12df9643f363?w=800&auto=format&fit=crop&q=80'],
            stock_quantity: item.stock_quantity || item.stock || 0,
            details: {
              ...item.details,
              material: item.details?.material || (item.description?.includes('Silk') ? 'Pure Silk' : item.description?.includes('Cotton') ? 'Premium Cotton' : 'Handloom Fabric'),
              origin: item.details?.origin || 'Jaipur, Rajasthan',
              care: item.details?.care || 'Dry clean only',
              sizes: item.details?.sizes || ['S', 'M', 'L', 'XL'],
              video_url: item.details?.video_url,
              culturalContext: item.details?.culturalContext,
              stylingAdvice: item.details?.stylingAdvice,
              translations: item.details?.translations
            }
          });

          // Fetch dynamic reviews
          try {
            const { data: reviewsData, error: reviewsError } = await supabase
              .from('reviews')
              .select('*')
              .eq('product_id', item.id)
              .eq('status', 'approved')
              .order('created_at', { ascending: false });
              
            if (!reviewsError && reviewsData) {
              setDynamicReviews(reviewsData.map(r => ({
                id: r.id,
                initial: r.reviewer_name ? r.reviewer_name.charAt(0).toUpperCase() : 'A',
                name: r.reviewer_name || 'Anonymous',
                location: r.reviewer_location || undefined,
                date: new Date(r.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
                stars: r.rating || 5,
                title: r.title ? `"${r.title}"` : undefined,
                body: r.comment || '',
                reply: r.reply || undefined,
                isVerified: r.is_verified_buyer || false
              })));
            }
          } catch (e) {
            console.error('Error fetching reviews:', e);
          }

          // Fetch related products
          try {
            let query = supabase
              .from('products')
              .select(`
                id, name, price,
                categories (name),
                product_images (url, is_primary)
              `)
              .neq('id', item.id)
              .limit(20);
              
            // If category exists, try fetching from same category first
            if (item.category_id) {
              const { data: categoryData } = await query.eq('category_id', item.category_id);
              if (categoryData && categoryData.length >= 2) {
                 // Use category data if we have at least 2 products
                 const formatted = categoryData.map((p: any) => ({
                    id: p.id,
                    name: p.name,
                    price_inr: p.price,
                    category: p.categories?.name || 'Ethnic Wear',
                    image: p.product_images?.find((img: any) => img.is_primary)?.url || p.product_images?.[0]?.url || 'https://via.placeholder.com/400x500'
                 }));
                 // Shuffle randomly and take 4
                 const shuffled = formatted.sort(() => 0.5 - Math.random()).slice(0, 4);
                 setRelatedProducts(shuffled);
                 return;
              }
            }
            
            // Fallback: fetch any products
            const { data: relatedData } = await supabase
              .from('products')
              .select(`
                id, name, price,
                categories (name),
                product_images (url, is_primary)
              `)
              .neq('id', item.id)
              .limit(20);

            if (relatedData) {
              const formatted = relatedData.map((p: any) => ({
                id: p.id,
                name: p.name,
                price_inr: p.price,
                category: p.categories?.name || 'Ethnic Wear',
                image: p.product_images?.find((img: any) => img.is_primary)?.url || p.product_images?.[0]?.url || 'https://via.placeholder.com/400x500'
              }));
              // Shuffle randomly and take 4
              const shuffled = formatted.sort(() => 0.5 - Math.random()).slice(0, 4);
              setRelatedProducts(shuffled);
            }
          } catch (e) {
            console.error('Error fetching related products:', e);
          }
        }
      } catch (err) {
        console.error('Error fetching product:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const handleSizingRequest = async () => {
    if (!product || !sizingInput.trim()) return;
    setSizingLoading(true);
    setSizingResult('');
    try {
      const res = await fetch('/api/ai/size-assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userSize: sizingInput,
          brand: 'standard western brands',
          productName: product.name,
          material: product.details?.material,
          category: product.category
        })
      });
      const data = await res.json();
      if (data.success) {
        setSizingResult(data.recommendation);
      } else {
        setSizingResult("Sorry, I couldn't determine the size right now. Please check our standard size chart.");
      }
    } catch (err) {
      setSizingResult("Sorry, I couldn't determine the size right now. Please check our standard size chart.");
    } finally {
      setSizingLoading(false);
    }
  };

  const handleAddToCart = () => {
    if (product) {
      addToCart({
        id: product.id,
        name: product.name,
        price_inr: product.price_inr,
        images: product.images,
        sku: product.sku,
        category: product.category
      }, quantity);
      setCartOpen(true);
    }
  };

  const handleBuyNow = () => {
    if (product) {
      if (!isInCart) {
        addToCart({
          id: product.id,
          name: product.name,
          price_inr: product.price_inr,
          images: product.images,
          sku: product.sku,
          category: product.category
        }, quantity);
      }
      setCartOpen(false);
      setCheckoutOpen(true);
    }
  };

  return (
    <main className="min-h-screen text-zinc-900 pb-16">
      <Navbar onCartOpen={() => setCartOpen(true)} />

      <div className="pt-4 md:pt-8 px-4 md:px-6 max-w-7xl mx-auto">
        {/* Back Button */}
        <button 
          onClick={() => router.back()} 
          className="flex items-center gap-2 text-zinc-500 hover:text-zinc-900 font-medium mb-6 md:mb-8 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Collection
        </button>
        {loading ? (
          <div className="animate-pulse flex flex-col md:flex-row gap-12">
            <div className="w-full md:w-1/2 h-[600px] bg-zinc-100/50 rounded-lg" />
            <div className="w-full md:w-1/2 space-y-6">
              <div className="h-8 bg-zinc-100/50 rounded w-3/4" />
              <div className="h-6 bg-zinc-100/50 rounded w-1/4" />
              <div className="h-24 bg-zinc-100/50 rounded w-full" />
            </div>
          </div>
        ) : !product ? (
          <div className="text-center py-20">
            <h2 className="text-2xl font-serif text-zinc-900">Product Not Found</h2>
            <p className="text-zinc-500 mt-2">The product you're looking for does not exist or has been removed.</p>
          </div>
        ) : (
          <div className="flex flex-col md:flex-row gap-12 lg:gap-20">
            {/* Image Gallery */}
            <div className="w-full md:w-1/2 space-y-4">
              <div className="aspect-[4/5] rounded-lg overflow-hidden bg-zinc-100 border border-zinc-200 relative">
                <Image 
                  src={product.images?.[selectedImage] || 'https://via.placeholder.com/600x800'} 
                  alt={product.name}
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover"
                  priority
                  unoptimized={true}
                />
                
                {/* Brand Logo Overlay */}
                <div className="absolute top-4 right-4 z-10 opacity-90 drop-shadow-md">
                  <img src="/icon.png" alt="Texxtile Jaipur" className="h-10 w-10 rounded-lg object-cover border border-white/30 shadow-lg" />
                </div>
              </div>
              {product.images && product.images.length > 1 && (
                <div className="flex gap-4 overflow-x-auto pb-2">
                  {product.images.map((img, idx) => (
                    <button 
                      key={idx}
                      onClick={() => setSelectedImage(idx)}
                      className={`h-24 w-20 shrink-0 rounded border ${selectedImage === idx ? 'border-gold' : 'border-zinc-200 opacity-60'} overflow-hidden transition-all`}
                    >
                      <div className="relative w-full h-full">
                        <Image 
                          src={img} 
                          alt={`Thumbnail ${idx}`} 
                          fill
                          sizes="80px"
                          className="object-cover" 
                          unoptimized={true}
                        />
                      </div>
                    </button>
                  ))}
                </div>
              )}
              
              {product.details?.video_url && (
                <div className="mt-4 border border-zinc-200 rounded-lg overflow-hidden bg-black/5 aspect-video relative">
                  {product.details.video_url.includes('youtube.com') || product.details.video_url.includes('youtu.be') ? (
                    <iframe 
                      src={product.details.video_url.replace('watch?v=', 'embed/').replace('youtu.be/', 'youtube.com/embed/')} 
                      className="absolute inset-0 w-full h-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    ></iframe>
                  ) : (
                    <video 
                      src={product.details.video_url} 
                      className="absolute inset-0 w-full h-full object-cover bg-black" 
                      controls 
                      preload="none"
                      poster={product.images?.[0] || undefined}
                    />
                  )}
                </div>
              )}
            </div>

            {/* Product Details */}
            <div className="w-full md:w-1/2 flex flex-col justify-center">
              <div className="space-y-6">
                <div className="space-y-3">
                  {/* Trust badges row */}
                  <div className="flex flex-wrap gap-2">
                    <span className="inline-flex items-center gap-1 bg-amber-50 border border-amber-200 text-amber-700 text-[10px] font-bold px-2.5 py-1 rounded-full tracking-wider uppercase">
                      <Award className="h-3 w-3" /> GI Certified Jaipur Craft
                    </span>
                    <span className="inline-flex items-center gap-1 bg-green-50 border border-green-200 text-green-700 text-[10px] font-bold px-2.5 py-1 rounded-full tracking-wider uppercase">
                      <ShieldCheck className="h-3 w-3" /> Handloom Mark
                    </span>
                  </div>

                  <div className="flex items-center gap-3 text-xs text-gold uppercase tracking-wider font-semibold">
                    <span>{product.category}</span>
                    <span className="w-1 h-1 bg-gold rounded-full" />
                    <span className="font-mono">{product.sku}</span>
                  </div>
                  <h1 className="text-4xl md:text-5xl font-serif font-medium text-zinc-900 leading-tight">
                    {product.name}
                  </h1>
                  <div className="flex items-center justify-end">
                    {/* Wishlist + Share actions */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={toggleWishlist}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-semibold transition-all ${
                          wishlisted
                            ? 'bg-red-50 border-red-200 text-red-600'
                            : 'bg-white border-zinc-200 text-zinc-600 hover:border-red-200 hover:text-red-500'
                        }`}
                      >
                        <Heart className={`h-3.5 w-3.5 ${wishlisted ? 'fill-red-500' : ''}`} />
                        {wishlisted ? 'Saved' : 'Wishlist'}
                      </button>
                      <button
                        onClick={handleWhatsAppShare}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-zinc-200 bg-white text-zinc-600 hover:border-green-300 hover:text-green-600 text-xs font-semibold transition-all"
                      >
                        <Share2 className="h-3.5 w-3.5" />
                        Share
                      </button>
                    </div>
                  </div>
                  {shareToast && (
                    <div className="bg-green-50 border border-green-200 text-green-700 text-xs font-medium px-3 py-2 rounded-lg">
                      ✅ Opening WhatsApp to share this product...
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between py-4 border-y border-zinc-200">
                  <div className="text-3xl font-serif font-bold text-zinc-900">
                    {formatPrice(product.price_inr)}
                  </div>
                  
                  {product.details?.translations && Object.keys(product.details.translations).length > 0 && (
                    <div className="flex gap-1.5">
                      <button onClick={() => setLanguage('en')} className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors ${language === 'en' ? 'bg-brand-700 text-white' : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'}`}>EN</button>
                      {product.details.translations.fr && <button onClick={() => setLanguage('fr')} className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors ${language === 'fr' ? 'bg-brand-700 text-white' : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'}`}>FR</button>}
                      {product.details.translations.es && <button onClick={() => setLanguage('es')} className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors ${language === 'es' ? 'bg-brand-700 text-white' : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'}`}>ES</button>}
                      {product.details.translations.de && <button onClick={() => setLanguage('de')} className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors ${language === 'de' ? 'bg-brand-700 text-white' : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'}`}>DE</button>}
                      {product.details.translations.ar && <button onClick={() => setLanguage('ar')} className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors ${language === 'ar' ? 'bg-brand-700 text-white' : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'}`}>AR</button>}
                    </div>
                  )}
                </div>

                <p className="text-zinc-600 font-light leading-relaxed whitespace-pre-wrap" dir={language === 'ar' ? 'rtl' : 'ltr'}>
                  {language === 'en' ? product.description : (product.details?.translations?.[language as keyof typeof product.details.translations] || product.description)}
                </p>

                {/* Details list */}
                <div className="space-y-3 bg-zinc-50 border border-zinc-200 p-6 rounded-lg">
                  {product.details?.material && (
                    <div className="flex justify-between border-b border-zinc-200 pb-2 text-sm">
                      <span className="text-zinc-500">Material</span>
                      <span className="text-zinc-900 text-right">{product.details.material}</span>
                    </div>
                  )}
                  {product.details?.origin && (
                    <div className="flex justify-between border-b border-zinc-200 pb-2 text-sm">
                      <span className="text-zinc-500">Origin</span>
                      <span className="text-zinc-900 text-right flex items-center gap-1">
                        <Globe className="h-3 w-3 text-gold" /> {product.details.origin}
                      </span>
                    </div>
                  )}
                  {product.details?.care && (
                    <div className="flex justify-between text-sm">
                      <span className="text-zinc-500">Care Instructions</span>
                      <span className="text-zinc-900 text-right">{product.details.care}</span>
                    </div>
                  )}
                </div>

                {/* Specific Category Sizing Details */}
                {((product.category && product.category.toLowerCase().includes('suzani jacket')) || 
                  (product.category && product.category.toLowerCase().includes('suani jacket')) ||
                  (product.name && product.name.toLowerCase().includes('suzani jacket'))) && (
                  <div className="bg-zinc-50 border border-zinc-200 p-6 rounded-lg text-sm text-zinc-700 mt-4">
                    <h3 className="font-bold text-zinc-900 mb-2 font-serif text-lg">Size: XL</h3>
                    
                    <p className="font-bold text-zinc-900 mt-4 mb-2">Best Fit For:</p>
                    <ul className="list-disc pl-5 space-y-1">
                      <li>Recommended for women who usually wear <strong>US XL (16–18)</strong> or <strong>UK XL (18–20)</strong>.</li>
                      <li>Suitable for a <strong>bust measurement of 44–46 inches (112–117 cm)</strong>.</li>
                      <li>Ideal for those who prefer a comfortable, relaxed fit.</li>
                    </ul>

                    <p className="font-bold text-zinc-900 mt-4 mb-2">Garment Measurements:</p>
                    <ul className="list-disc pl-5 space-y-1">
                      <li>Chest: 46 in (117 cm)</li>
                      <li>Shoulder: 19 in (48 cm)</li>
                      <li>Sleeve Length: 24.5 in (62 cm)</li>
                      <li>Jacket Length: 29 in (74 cm)</li>
                    </ul>

                    <p className="mt-4 text-xs italic text-zinc-500">
                      *Please allow a 1–2 cm variation, as each jacket is handmade.
                    </p>
                  </div>
                )}

                {/* AI Sizing Assistant - Highlighted */}
                <div className="pt-4 pb-2">
                  <div className={`transition-all duration-500 overflow-hidden rounded-xl border ${sizingOpen ? 'border-brand-300 shadow-lg shadow-brand-500/10' : 'border-zinc-200 hover:border-brand-300'}`}>
                    {/* Header Button (Always visible) */}
                    <button 
                      onClick={() => setSizingOpen(!sizingOpen)}
                      className={`w-full flex items-center justify-between p-4 transition-colors ${sizingOpen ? 'bg-gradient-to-r from-brand-50 to-white' : 'bg-white hover:bg-zinc-50'}`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="relative flex h-8 w-8 items-center justify-center rounded-full bg-brand-100 text-brand-700">
                          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand-400 opacity-20"></span>
                          <Sparkles className="h-4 w-4 relative z-10" />
                        </div>
                        <div className="text-left">
                          <span className="text-sm font-bold text-zinc-900 block font-serif tracking-wide">
                            AI TAILOR ✨
                          </span>
                          <span className="text-xs text-zinc-500">Unsure about your size? Let AI decide.</span>
                        </div>
                      </div>
                      <ChevronDown className={`h-5 w-5 text-zinc-400 transition-transform duration-300 ${sizingOpen ? 'rotate-180' : ''}`} />
                    </button>
                    
                    {/* Expandable Content */}
                    <div className={`transition-all duration-500 ease-in-out ${sizingOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}>
                      <div className="p-5 border-t border-brand-100 bg-gradient-to-br from-white to-brand-50/50">
                        <p className="text-xs text-zinc-600 mb-4 leading-relaxed">
                          Tell us your usual size in western brands (e.g. "I wear US Size 6 at Zara"), and our AI will calculate the exact Indian size to buy based on the stretch and cut of this {product.details?.material || 'fabric'}.
                        </p>
                        <div className="flex gap-2">
                          <input 
                            type="text" 
                            value={sizingInput}
                            onChange={(e) => setSizingInput(e.target.value)}
                            placeholder="e.g. US Size 6, Zara" 
                            className="flex-1 text-sm px-4 py-2.5 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all shadow-sm"
                          />
                          <button 
                            onClick={handleSizingRequest}
                            disabled={sizingLoading || !sizingInput.trim()}
                            className="px-5 py-2.5 bg-zinc-900 text-white font-bold text-xs rounded-lg disabled:opacity-50 flex items-center justify-center min-w-[110px] hover:bg-brand-900 transition-colors shadow-md active:scale-95"
                          >
                            {sizingLoading ? <RefreshCw className="h-4 w-4 animate-spin" /> : 'Calculate Size'}
                          </button>
                        </div>
                        
                        {sizingResult && (
                          <div className="mt-5 p-4 bg-white border border-brand-200 rounded-lg shadow-sm relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-1 h-full bg-brand-500"></div>
                            <p className="text-sm text-zinc-800 leading-relaxed font-medium pl-2">
                              <span className="font-bold text-brand-700 block mb-1 uppercase tracking-wider text-[10px]">AI Recommendation</span>
                              {sizingResult}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Add to Cart Actions */}
                <div className="space-y-4 pt-6">
                  <div className="flex flex-col xl:flex-row items-center gap-4">
                    <div className="flex items-center border border-zinc-200 bg-[#FDFBF7] rounded h-12 shrink-0">
                      <button
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        aria-label="Decrease Quantity"
                        className="px-4 text-zinc-500 hover:text-gold transition-colors"
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                      <span className="w-8 text-center font-semibold text-zinc-900">{quantity}</span>
                      <button
                        onClick={() => setQuantity(Math.min(product.stock_quantity, quantity + 1))}
                        aria-label="Increase Quantity"
                        className="px-4 text-zinc-500 hover:text-gold transition-colors"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 w-full">
                      {isInCart ? (
                        <button
                          onClick={handleAddToCart}
                          className="flex-1 h-14 md:h-12 rounded font-bold text-zinc-950 bg-gold border border-gold hover:opacity-95 flex items-center justify-center gap-2 shadow-lg transition-all"
                        >
                          <Check className="h-4 w-4 stroke-[3]" />
                          <span>Added</span>
                        </button>
                      ) : (
                        <button
                          onClick={handleAddToCart}
                          disabled={product.stock_quantity === 0}
                          className="flex-1 h-14 md:h-12 rounded font-semibold text-zinc-950 btn-premium flex items-center justify-center gap-2 shadow-lg disabled:opacity-50"
                        >
                          <ShoppingCart className="h-4 w-4" />
                          {product.stock_quantity === 0 ? 'Out of Stock' : 'Add to Cart'}
                        </button>
                      )}
                      
                      <button
                        onClick={handleBuyNow}
                        disabled={product.stock_quantity === 0}
                        className="flex-1 h-14 md:h-12 rounded font-bold text-white bg-brand-700 hover:bg-brand-800 border border-brand-700 flex items-center justify-center gap-2 shadow-lg transition-all disabled:opacity-50"
                      >
                        Buy Now
                      </button>
                    </div>
                  </div>
                  
                  {product.stock_quantity < 5 && product.stock_quantity > 0 && (
                    <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-xs font-bold px-3 py-2 rounded-lg">
                      <Flame className="h-4 w-4 animate-pulse" />
                      Only {product.stock_quantity} left in stock — order soon!
                    </div>
                  )}
                </div>

                {/* Trust Badges */}
                <div className="grid grid-cols-2 gap-3 pt-4">
                  <div className="flex items-start gap-2 p-3 bg-zinc-50 rounded-lg border border-zinc-100">
                    <ShieldCheck className="h-4 w-4 text-gold shrink-0 mt-0.5" />
                    <div>
                      <h5 className="text-xs font-semibold text-zinc-900">Authenticity Guaranteed</h5>
                      <p className="text-[10px] text-zinc-500 mt-0.5">Directly from master artisans.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2 p-3 bg-zinc-50 rounded-lg border border-zinc-100">
                    <Truck className="h-4 w-4 text-gold shrink-0 mt-0.5" />
                    <div>
                      <h5 className="text-xs font-semibold text-zinc-900">Global Express Delivery</h5>
                      <p className="text-[10px] text-zinc-500 mt-0.5">Shipped with UPS Express.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2 p-3 bg-green-50 rounded-lg border border-green-100">
                    <RefreshCw className="h-4 w-4 text-green-600 shrink-0 mt-0.5" />
                    <div>
                      <h5 className="text-xs font-semibold text-zinc-900">30-Day Money Back</h5>
                      <p className="text-[10px] text-zinc-500 mt-0.5">100% refund, no questions asked.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2 p-3 bg-amber-50 rounded-lg border border-amber-100">
                    <Award className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <h5 className="text-xs font-semibold text-zinc-900">GI Certified Craft</h5>
                      <p className="text-[10px] text-zinc-500 mt-0.5">Govt. of India verified origin.</p>
                    </div>
                  </div>
                </div>

                {/* Artisan Story Section */}
                <div className="mt-6 p-5 bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-xl">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-amber-100 rounded-full">
                      <User className="h-4 w-4 text-amber-700" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-zinc-900">Meet the Artisan</h4>
                      <p className="text-[10px] text-amber-700 font-semibold uppercase tracking-wider">Crafted by hand in Jaipur, Rajasthan</p>
                    </div>
                  </div>
                  <p className="text-xs text-zinc-700 leading-relaxed mb-3">
                    This piece was handcrafted by skilled artisans from Jaipur's heritage weaving community, carrying forward a tradition that spans over 400 years. Each thread is carefully selected and every pattern is block-printed or embroidered by hand — a process that can take 3–7 days per piece.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <span className="inline-flex items-center gap-1 bg-white/70 text-amber-800 text-[9px] font-bold px-2 py-1 rounded-full border border-amber-200">
                      <Palette className="h-2.5 w-2.5" /> Hand Block Printed
                    </span>
                    <span className="inline-flex items-center gap-1 bg-white/70 text-amber-800 text-[9px] font-bold px-2 py-1 rounded-full border border-amber-200">
                      🏺 Jaipur Heritage Craft
                    </span>
                    <span className="inline-flex items-center gap-1 bg-white/70 text-amber-800 text-[9px] font-bold px-2 py-1 rounded-full border border-amber-200">
                      ✅ Zero Middlemen
                    </span>
                  </div>
                </div>

                {/* AI Heritage & Styling Guide */}
                {(product.details?.culturalContext || product.details?.stylingAdvice) && (
                  <div className="mt-6 border border-brand-200 rounded-xl overflow-hidden bg-white shadow-sm">
                    <div className="bg-brand-50 px-5 py-3 border-b border-brand-200 flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-brand-700" />
                      <h4 className="text-sm font-bold text-brand-900">The Heritage & Styling Guide</h4>
                    </div>
                    <div className="p-5 space-y-4">
                      {product.details.culturalContext && (
                        <div>
                          <h5 className="text-xs font-bold text-zinc-900 uppercase tracking-wider mb-1">Cultural Context</h5>
                          <p className="text-sm text-zinc-600 leading-relaxed">{product.details.culturalContext}</p>
                        </div>
                      )}
                      {product.details.stylingAdvice && (
                        <div className={product.details.culturalContext ? "pt-4 border-t border-zinc-100" : ""}>
                          <h5 className="text-xs font-bold text-zinc-900 uppercase tracking-wider mb-1">How to Style</h5>
                          <p className="text-sm text-zinc-600 leading-relaxed">{product.details.stylingAdvice}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Photo Reviews Section */}
        {product && (
          <>
          {product.sku === 'HT-F355E192' ? (
            <div className="mt-20 border-t border-zinc-200">
              <SuzaniReviews dynamicReviews={dynamicReviews} />
            </div>
          ) : product.sku === 'HT-24DD340C' ? (
            <div className="mt-20 border-t border-zinc-200">
              <BlueFloralReviews dynamicReviews={dynamicReviews} />
            </div>
          ) : product.sku === 'HT-4E174E27' ? (
            <div className="mt-20 border-t border-zinc-200">
              <PinkVelvetReviews dynamicReviews={dynamicReviews} />
            </div>
          ) : product.sku === 'HT-EADEC91A' ? (
            <div className="mt-20 border-t border-zinc-200">
              <CottonSuzaniReviews dynamicReviews={dynamicReviews} />
            </div>
          ) : product.sku === 'HT-20D55B39' ? (
            <div className="mt-20 border-t border-zinc-200">
              <RustVelvetReviews dynamicReviews={dynamicReviews} />
            </div>
          ) : product.sku === 'HT-97C9E512' ? (
            <div className="mt-20 border-t border-zinc-200">
              <BohemianEleganceReviews dynamicReviews={dynamicReviews} />
            </div>
          ) : product.sku === 'HT-4934F30C' ? (
            <div className="mt-20 border-t border-zinc-200">
              <TntSuzaniReviews dynamicReviews={dynamicReviews} />
            </div>
          ) : product.sku === 'HT-DC120E55' ? (
            <div className="mt-20 border-t border-zinc-200">
              <VintageSuzaniReviews dynamicReviews={dynamicReviews} />
            </div>
          ) : product.sku === 'HT-D55D59E3' ? (
            <div className="mt-20 border-t border-zinc-200">
              <UniqueTntSuzaniReviews dynamicReviews={dynamicReviews} />
            </div>
          ) : (
          <div className="mt-20 pt-16 border-t border-zinc-200">
            <div className="flex flex-col md:flex-row gap-12">
              <div className="w-full md:w-1/3">
                <h3 className="text-2xl font-serif text-zinc-900 font-bold mb-6 flex items-center gap-2">
                  <Heart className="h-6 w-6 text-brand-600 fill-brand-600" />
                  Customer Experiences
                </h3>
                <p className="text-zinc-600 text-sm mb-6">
                  Share your experience with this beautiful piece. We'd love to hear from you!
                </p>
              </div>
              <div className="w-full md:w-2/3 flex items-center justify-center bg-zinc-50 border border-zinc-100 rounded-2xl p-12 h-full min-h-[300px]">
                <div className="text-center">
                  <Heart className="h-10 w-10 text-zinc-300 mx-auto mb-3" />
                  <p className="font-bold text-zinc-700 text-lg">No experiences shared yet</p>
                  <p className="text-sm text-zinc-500 mt-1">Be the first to share your experience!</p>
                </div>
              </div>
            </div>
          </div>
          )}
          
          {/* Review Form (Appears below either the custom or generic review section) */}
          <div className="mt-8 mb-20 flex justify-center">
            {!showReviewForm ? (
              <button 
                onClick={() => setShowReviewForm(true)}
                className="px-8 py-4 bg-zinc-900 text-white font-bold rounded-xl hover:bg-zinc-800 transition-colors shadow-lg text-sm"
              >
                Share Your Experience
              </button>
            ) : formSubmitted === 'review' ? (
              <div className="p-4 bg-green-50 text-green-700 rounded-xl border border-green-200 text-sm font-bold flex items-center gap-2">
                <Check className="h-4 w-4" /> Review submitted for moderation!
              </div>
            ) : (
              <div className="w-full max-w-2xl space-y-4 bg-zinc-50 p-8 rounded-2xl border border-zinc-200 shadow-sm">
                <h4 className="font-serif text-xl font-bold text-zinc-900 mb-4">Share Your Experience</h4>
                <div className="grid grid-cols-2 gap-4">
                  <input 
                    type="text" 
                    placeholder="Your Name *" 
                    value={reviewFormData.name}
                    onChange={(e) => setReviewFormData({...reviewFormData, name: e.target.value})}
                    className="w-full p-3 rounded-xl border border-zinc-200 text-sm focus:outline-none focus:border-brand-500 bg-white shadow-sm"
                  />
                  <input 
                    type="text" 
                    placeholder="Location (e.g. Dallas, TX)" 
                    value={reviewFormData.location}
                    onChange={(e) => setReviewFormData({...reviewFormData, location: e.target.value})}
                    className="w-full p-3 rounded-xl border border-zinc-200 text-sm focus:outline-none focus:border-brand-500 bg-white shadow-sm"
                  />
                </div>
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-sm font-medium text-zinc-700">Rating:</span>
                  <select 
                    value={reviewFormData.rating}
                    onChange={(e) => setReviewFormData({...reviewFormData, rating: Number(e.target.value)})}
                    className="p-2 rounded-lg border border-zinc-200 text-sm focus:outline-none bg-white shadow-sm"
                  >
                    <option value="5">5 Stars</option>
                    <option value="4">4 Stars</option>
                    <option value="3">3 Stars</option>
                    <option value="2">2 Stars</option>
                    <option value="1">1 Star</option>
                  </select>
                </div>
                <input 
                  type="text" 
                  placeholder="Review Title" 
                  value={reviewFormData.title}
                  onChange={(e) => setReviewFormData({...reviewFormData, title: e.target.value})}
                  className="w-full p-3 rounded-xl border border-zinc-200 text-sm focus:outline-none focus:border-brand-500 bg-white shadow-sm"
                />
                <textarea 
                  placeholder="Share your experience... *" 
                  value={reviewFormData.comment}
                  onChange={(e) => setReviewFormData({...reviewFormData, comment: e.target.value})}
                  className="w-full p-4 rounded-xl border border-zinc-200 text-sm focus:outline-none focus:border-brand-500 bg-white shadow-sm"
                  rows={4}
                ></textarea>
                {reviewError && <p className="text-red-500 text-xs font-medium">{reviewError}</p>}
                <div className="flex gap-3 pt-4">
                  <button 
                    onClick={handleReviewSubmit}
                    disabled={isSubmittingReview}
                    className="px-6 py-3 bg-zinc-900 text-white font-bold rounded-xl text-sm disabled:opacity-50 hover:bg-zinc-800 shadow-md transition-all"
                  >
                    {isSubmittingReview ? 'Submitting...' : 'Submit Review'}
                  </button>
                  <button 
                    onClick={() => setShowReviewForm(false)}
                    className="px-6 py-3 bg-white border border-zinc-200 text-zinc-600 font-bold rounded-xl text-sm hover:bg-zinc-50 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>

          {dynamicReviews.filter(r => r.id && myReviews.includes(r.id)).length > 0 && (
            <div className="mt-8 mb-20 max-w-2xl mx-auto p-6 bg-brand-50 border border-brand-100 rounded-2xl">
              <h3 className="font-bold text-brand-800 mb-4 flex items-center gap-2">
                <Trash2 className="h-5 w-5" /> Manage Your Reviews
              </h3>
              <div className="space-y-3">
                {dynamicReviews.filter(r => r.id && myReviews.includes(r.id)).map((r, i) => (
                  <div key={i} className="flex items-center justify-between bg-white p-3 rounded-lg border border-brand-100">
                    <div>
                      <p className="font-bold text-sm text-zinc-800">{r.name}</p>
                      <p className="text-xs text-zinc-500 line-clamp-1">{r.body}</p>
                    </div>
                    <button
                      onClick={() => r.id && handleDeleteReview(r.id)}
                      className="px-3 py-1.5 bg-red-100 text-red-600 hover:bg-red-200 text-xs font-bold rounded-md transition-colors shrink-0 ml-4"
                    >
                      Delete
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
          </>
        )}


        {/* You May Also Like Section */}
        {relatedProducts.length > 0 && (
          <div className="mt-20 pt-16 border-t border-zinc-200">
            <div className="flex items-center gap-2 mb-8">
              <Sparkles className="h-6 w-6 text-brand-600" />
              <h3 className="text-2xl font-serif text-zinc-900 font-bold">You May Also Like</h3>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {relatedProducts.map((rp) => (
                <a key={rp.id} href={`/product/${rp.id}`} className="group block bg-white border border-zinc-200 rounded-xl overflow-hidden hover:border-brand-300 hover:shadow-xl transition-all">
                  <div className="aspect-[4/5] relative bg-zinc-100 overflow-hidden">
                    {rp.image.match(/\.(mp4|webm)(\?.*)?$/i) ? (
                      <video
                        src={rp.image}
                        autoPlay
                        muted
                        loop
                        playsInline
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <Image 
                        src={rp.image || 'https://via.placeholder.com/400x500'} 
                        alt={rp.name}
                        fill
                        sizes="(max-width: 768px) 50vw, 25vw"
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                        unoptimized={true}
                      />
                    )}
                  </div>
                  <div className="p-4">
                    <p className="text-[10px] font-bold text-brand-600 uppercase tracking-wider mb-1">{rp.category}</p>
                    <h4 className="text-sm font-semibold text-zinc-900 line-clamp-1 group-hover:text-brand-700 transition-colors">{rp.name}</h4>
                    <p className="text-zinc-900 font-bold mt-2 font-serif">{formatPrice(rp.price_inr)}</p>
                  </div>
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Product Q&A Section */}
        {product && (
          <div className="mt-20 pt-16 border-t border-zinc-200">
            <div className="flex flex-col md:flex-row gap-12">
              <div className="w-full md:w-1/3">
                <h3 className="text-2xl font-serif text-zinc-900 font-bold mb-3 flex items-center gap-2">
                  <MessageCircleQuestion className="h-6 w-6 text-brand-600" />
                  Customer Q&A
                </h3>
                <p className="text-zinc-600 text-sm leading-relaxed mb-6">
                  Have a question about this product? We're here to help. Check our most frequently asked questions or ask a new one.
                </p>
                {!showQuestionForm ? (
                  <button 
                    onClick={() => setShowQuestionForm(true)}
                    className="px-6 py-3 bg-white border border-brand-700 text-brand-700 font-bold rounded-xl hover:bg-brand-50 transition-colors shadow-sm text-sm"
                  >
                    Ask a Question
                  </button>
                ) : formSubmitted === 'question' ? (
                  <div className="p-4 bg-green-50 text-green-700 rounded-xl border border-green-200 text-sm font-bold flex items-center gap-2">
                    <Check className="h-4 w-4" /> Question submitted! We'll email you soon.
                  </div>
                ) : (
                  <div className="space-y-3 bg-zinc-50 p-5 rounded-xl border border-zinc-200">
                    <input 
                      type="email"
                      placeholder="Your email address (so we can reply)" 
                      value={inquiryEmail}
                      onChange={(e) => setInquiryEmail(e.target.value)}
                      className="w-full p-3 rounded-lg border border-zinc-200 text-sm focus:outline-none focus:border-brand-500"
                    />
                    <textarea 
                      placeholder="Type your question here..." 
                      value={inquiryQuestion}
                      onChange={(e) => setInquiryQuestion(e.target.value)}
                      className="w-full p-3 rounded-lg border border-zinc-200 text-sm focus:outline-none focus:border-brand-500"
                      rows={3}
                    ></textarea>
                    {inquiryError && (
                      <p className="text-red-500 text-xs font-semibold">{inquiryError}</p>
                    )}
                    <div className="flex gap-2">
                      <button 
                        onClick={handleInquirySubmit}
                        disabled={isSubmittingInquiry}
                        className="px-4 py-2 bg-brand-700 text-white font-bold rounded-lg text-xs disabled:opacity-50"
                      >
                        {isSubmittingInquiry ? 'Submitting...' : 'Submit'}
                      </button>
                      <button 
                        onClick={() => setShowQuestionForm(false)}
                        className="px-4 py-2 bg-white border border-zinc-200 text-zinc-600 font-bold rounded-lg text-xs"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
              <div className="w-full md:w-2/3 space-y-4">
                {[
                  {
                    q: 'Will the color bleed or fade after washing?',
                    a: 'Since this is authentic hand-block printed using natural dyes, some initial color bleeding is normal. We recommend dry cleaning for the first wash, and thereafter a gentle hand wash in cold water with mild detergent.'
                  },
                  {
                    q: 'How do I know my correct size?',
                    a: 'Please refer to our detailed size chart. Our garments usually run true to size, but since they are handcrafted, there might be a slight 0.5-inch variation. If you are between sizes, we suggest sizing up for a comfortable fit.'
                  },
                  {
                    q: 'Is this fabric suitable for summer?',
                    a: 'Absolutely! This is crafted from 100% pure, breathable cotton that is exceptionally comfortable and airy, making it perfect for hot and humid weather.'
                  },
                  {
                    q: 'Do you offer returns if it doesn\'t fit?',
                    a: 'Yes, we offer a 30-day hassle-free return and exchange policy. You can easily initiate a return through our self-service portal as long as the product is unused and has its original tags.'
                  }
                ].map((qa, i) => (
                  <div key={i} className="border border-zinc-200 rounded-xl overflow-hidden bg-white">
                    <button 
                      onClick={() => setExpandedQa(expandedQa === i ? null : i)}
                      className="w-full flex items-center justify-between p-5 text-left bg-white hover:bg-zinc-50 transition-colors"
                    >
                      <span className="font-semibold text-zinc-900">{qa.q}</span>
                      {expandedQa === i ? (
                        <ChevronUp className="h-5 w-5 text-zinc-400 shrink-0" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-zinc-400 shrink-0" />
                      )}
                    </button>
                    {expandedQa === i && (
                      <div className="p-5 pt-0 text-sm text-zinc-600 leading-relaxed bg-white border-t border-zinc-100">
                        {qa.a}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

      </div>

      <CartSidebar 
        isOpen={cartOpen} 
        onClose={() => setCartOpen(false)}
        onCheckout={() => { setCartOpen(false); setCheckoutOpen(true); }}
      />

      <CheckoutModal 
        isOpen={checkoutOpen} 
        onClose={() => setCheckoutOpen(false)} 
      />

      <Footer />

      {/* Sticky Mobile Add-to-Cart Bar */}
      {product && (
        <div className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-zinc-200 shadow-2xl p-3 flex items-center gap-3 md:hidden">
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-zinc-900 truncate">{product.name}</p>
            <p className="text-sm font-serif font-bold text-brand-700">{formatPrice(product.price_inr)}</p>
          </div>
          <button
            onClick={toggleWishlist}
            className={`p-2.5 rounded-lg border shrink-0 transition-all ${wishlisted ? 'bg-red-50 border-red-200 text-red-500' : 'border-zinc-200 text-zinc-500'}`}
          >
            <Heart className={`h-4 w-4 ${wishlisted ? 'fill-red-500' : ''}`} />
          </button>
          <button
            onClick={handleAddToCart}
            disabled={product.stock_quantity === 0}
            className="flex items-center gap-2 px-4 py-2.5 bg-brand-700 text-white text-xs font-bold rounded-lg disabled:opacity-50 shrink-0"
          >
            <ShoppingCart className="h-3.5 w-3.5" />
            {isInCart ? 'Add More' : 'Add to Cart'}
          </button>
          <button
            onClick={handleBuyNow}
            disabled={product.stock_quantity === 0}
            className="px-4 py-2.5 bg-zinc-900 text-white text-xs font-bold rounded-lg disabled:opacity-50 shrink-0"
          >
            Buy Now
          </button>
        </div>
      )}
    </main>
  );
}
