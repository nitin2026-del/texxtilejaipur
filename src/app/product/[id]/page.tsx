'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
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
import { PremiumTntSuzaniReviews } from '@/components/PremiumTntSuzaniReviews';
import { LuxeVelvetSuzaniReviews } from '@/components/LuxeVelvetSuzaniReviews';
import { ArtisanVelvetReviews } from '@/components/ArtisanVelvetReviews';
import { ElegantVelvetReviews } from '@/components/ElegantVelvetReviews';
import { OrangeVelvetReviews } from '@/components/OrangeVelvetReviews';
import { VintageRedVelvetReviews } from '@/components/VintageRedVelvetReviews';
import { PurpleTntSuzaniReviews } from '@/components/PurpleTntSuzaniReviews';
import { LuxuryBrownVelvetReviews } from '@/components/LuxuryBrownVelvetReviews';
import { TraditionalBlackVelvetReviews } from '@/components/TraditionalBlackVelvetReviews';
import { EthnicBlackVelvetReviews } from '@/components/EthnicBlackVelvetReviews';
import { BlueTntSuzaniReviews } from '@/components/BlueTntSuzaniReviews';
import { GreenVelvetSuzaniReviews } from '@/components/GreenVelvetSuzaniReviews';
import { CyanVelvetSuzaniReviews } from '@/components/CyanVelvetSuzaniReviews';
import { BohemianVelvetReviews } from '@/components/BohemianVelvetReviews';
import { EvilEyeVelvetReviews } from '@/components/EvilEyeVelvetReviews';
import { DarkPaisleyVelvetReviews } from '@/components/DarkPaisleyVelvetReviews';
import { WomensVelvetSuzaniReviews } from '@/components/WomensVelvetSuzaniReviews';
import { CottonTntEmbroideryReviews } from '@/components/CottonTntEmbroideryReviews';
import { EmbroideredVelvetSuzaniReviews } from '@/components/EmbroideredVelvetSuzaniReviews';
import { HandcraftedVelvetCoatReviews } from '@/components/HandcraftedVelvetCoatReviews';
import { RedCottonSuzaniReviews } from '@/components/RedCottonSuzaniReviews';
import { EmeraldBohoVelvetReviews } from '@/components/EmeraldBohoVelvetReviews';
import { NavyFloralVelvetReviews } from '@/components/NavyFloralVelvetReviews';
import { VelvetSuzaniHT5EB59E11Reviews } from '@/components/VelvetSuzaniHT5EB59E11Reviews';
import { VelvetSuzaniHT7A15D83BReviews } from '@/components/VelvetSuzaniHT7A15D83BReviews';

import { useCart, FX_RATES } from '@/context/CartContext';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { ShieldCheck, Truck, Globe, Star, Minus, Plus, Check, Heart, Share2, Award, RefreshCw, Palette, User, MessageCircleQuestion, ChevronDown, ChevronUp, ChevronLeft, ChevronRight, Sparkles, ArrowLeft, Trash2, CreditCard, Info, Play, ShoppingCart, Video } from 'lucide-react';

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
  const { id } = params;
  const { cart, addToCart, formatPrice, updateQuantity } = useCart();
  
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const cached = localStorage.getItem('textilejaipur_collection_cache');
      if (cached) {
        const parsed = JSON.parse(cached);
        const found = parsed.find((p: any) => p.id === id);
        if (found) {
          setProduct({
            ...found,
            stock_quantity: found.stock || 0
          });
          setLoading(false);
        }
      }
    } catch (e) {}
  }, [id]);
  
  const [relatedProducts, setRelatedProducts] = useState<any[]>([]);
  const [quantity, setQuantity] = useState(1);
  const [selectedMediaIndex, setSelectedMediaIndex] = useState(0);

  const mediaItems = useMemo(() => {
    if (!product) return [];
    const items = (product.images || []).map((url: string) => ({ type: 'image', url }));
    if (product.details?.video_url) {
      items.push({ type: 'video', url: product.details.video_url });
    }
    return items;
  }, [product]);
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
  const [activeBadge, setActiveBadge] = useState<string | null>(null);
  const [sizingInput, setSizingInput] = useState('');
  const [sizingResult, setSizingResult] = useState('');
  const [sizingLoading, setSizingLoading] = useState(false);
  
  // Modal states
  const [cartOpen, setCartOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);

  const isInCart = product ? cart.some((item) => item.id === product.id) : false;
  const cartItem = product ? cart.find((item) => item.id === product.id) : undefined;
  const displayQuantity = cartItem ? cartItem.quantity : quantity;

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

  const trackedProductId = useRef<string | null>(null);

  useEffect(() => {
    if (product && trackedProductId.current !== product.id && typeof window !== 'undefined' && (window as any).fbq) {
      trackedProductId.current = product.id;
      const parsedPriceInr = typeof product.price_inr === 'string' ? parseFloat(product.price_inr) : product.price_inr;
      const priceUSD = Number((parsedPriceInr * FX_RATES['USD']).toFixed(2));
      
      console.log('--- [ProductPage Component] ---');
      console.log('Calling fbq("track", "ViewContent") directly from useEffect');
      console.log('Product ID:', product.id);
      console.log('URL:', window.location.href);
      console.log('-------------------------------');
      
      (window as any).fbq('track', 'ViewContent', {
        content_ids: [product.id],
        content_type: 'product',
        value: priceUSD,
        currency: 'USD'
      });
    }
  }, [product]);

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
    const qtyToAdd = quantity === 0 ? 1 : quantity;
    if (product) {
      addToCart({
        id: product.id,
        name: product.name,
        price_inr: product.price_inr,
        images: product.images,
        sku: product.sku,
        category: product.category
      }, qtyToAdd);
      if (quantity === 0) setQuantity(1);
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
        <Link 
          href={product ? `/collection#product-${product.id}` : '/collection'}
          className="flex items-center gap-2 text-zinc-500 hover:text-zinc-900 font-medium mb-6 md:mb-8 transition-colors w-max"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Collection
        </Link>
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
            {/* Cinematic Media Gallery */}
            <div className="w-full md:w-1/2 space-y-4">
              <div className="aspect-[4/5] rounded-lg bg-zinc-100 border border-zinc-200 relative overflow-hidden group">
                {mediaItems.length > 0 ? mediaItems.map((media: any, idx: number) => {
                  const isActive = idx === selectedMediaIndex;
                  return (
                    <div 
                      key={idx} 
                      className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${isActive ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'}`}
                    >
                      {media.type === 'image' ? (
                        <img 
                          src={media.url || 'https://via.placeholder.com/600x800'} 
                          alt={`${product.name} view ${idx + 1}`}
                          className="absolute inset-0 w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-black">
                          {media.url.includes('youtube.com') || media.url.includes('youtu.be') ? (
                            <iframe 
                              src={media.url.replace('watch?v=', 'embed/').replace('youtu.be/', 'youtube.com/embed/')} 
                              className="w-full h-full"
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                              allowFullScreen
                            ></iframe>
                          ) : (
                            <video 
                              src={media.url} 
                              autoPlay 
                              muted 
                              loop 
                              playsInline 
                              controls={isActive}
                              className="w-full h-full object-contain" 
                              poster={product.images?.[0] || undefined}
                            />
                          )}
                        </div>
                      )}
                    </div>
                  );
                }) : (
                  <img 
                    src="https://via.placeholder.com/600x800" 
                    alt="Placeholder"
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                )}
                
                {/* Brand Logo Overlay */}
                <div className="absolute top-4 right-4 z-20 opacity-90 drop-shadow-md pointer-events-none">
                  <img src="/icon.png" alt="Texxtile Jaipur" className="h-10 w-10 rounded-lg object-cover border border-white/30 shadow-lg" />
                </div>
                
                {/* Navigation Arrows */}
                {mediaItems.length > 1 && (
                  <>
                    <button 
                      onClick={() => setSelectedMediaIndex(prev => prev === 0 ? mediaItems.length - 1 : prev - 1)}
                      className="absolute left-4 top-1/2 -translate-y-1/2 z-30 p-2 rounded-full bg-white/80 hover:bg-white text-zinc-800 shadow-md backdrop-blur-sm transition-all hover:scale-110"
                      aria-label="Previous image"
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </button>
                    <button 
                      onClick={() => setSelectedMediaIndex(prev => prev === mediaItems.length - 1 ? 0 : prev + 1)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 z-30 p-2 rounded-full bg-white/80 hover:bg-white text-zinc-800 shadow-md backdrop-blur-sm transition-all hover:scale-110"
                      aria-label="Next image"
                    >
                      <ChevronRight className="h-5 w-5" />
                    </button>
                  </>
                )}
              </div>

              {mediaItems.length > 1 && (
                <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
                  {mediaItems.map((media: any, idx: number) => (
                    <button 
                      key={idx}
                      onClick={() => setSelectedMediaIndex(idx)}
                      className={`relative h-24 w-20 shrink-0 rounded border overflow-hidden transition-all duration-300 ${
                        selectedMediaIndex === idx 
                          ? 'border-gold ring-2 ring-gold/20' 
                          : 'border-zinc-200 opacity-60 hover:opacity-100'
                      }`}
                    >
                      <div className="absolute inset-0">
                        <img 
                          src={media.type === 'image' ? (media.url || 'https://via.placeholder.com/80') : (product.images?.[0] || 'https://via.placeholder.com/80')} 
                          alt={`Thumbnail ${idx}`} 
                          className="absolute inset-0 w-full h-full object-cover" 
                        />
                      </div>
                      {media.type === 'video' && (
                        <div className="absolute inset-0 bg-black/30 flex items-center justify-center backdrop-blur-[1px]">
                          <Play className="h-6 w-6 text-white fill-white opacity-90 drop-shadow-md" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Details */}
            <div className="w-full md:w-1/2 flex flex-col justify-center">
              <div className="space-y-6 max-w-lg">
                <div className="space-y-1">
                  <h1 className="text-3xl md:text-[34px] font-serif font-medium text-[#111] leading-tight">
                    {product.name}
                  </h1>
                  <div className="flex flex-wrap items-center justify-between gap-4 pt-1">
                    <div className="flex items-center gap-4">
                      <div className="text-xl font-bold text-[#111]">
                        {formatPrice(product.price_inr)}
                      </div>
                      {dynamicReviews.length > 0 && (
                        <div 
                          className="flex items-center gap-1.5 text-[11px] font-bold text-[#1a1464] uppercase tracking-wider cursor-pointer hover:opacity-80 transition-opacity"
                          onClick={() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })}
                        >
                          <div className="flex text-[14px] tracking-widest text-[#1a1464]">
                            {'★'.repeat(Math.round(dynamicReviews.reduce((sum, rev) => sum + rev.rating, 0) / dynamicReviews.length))}
                            {'☆'.repeat(5 - Math.round(dynamicReviews.reduce((sum, rev) => sum + rev.rating, 0) / dynamicReviews.length))}
                          </div>
                          <span className="underline underline-offset-2">{dynamicReviews.length} REVIEW{dynamicReviews.length !== 1 ? 'S' : ''}</span>
                        </div>
                      )}
                    </div>

                    {/* Language Selector */}
                    {product.details?.translations && Object.keys(product.details.translations).length > 0 && (
                      <div className="flex gap-1.5">
                        <button onClick={() => setLanguage('en')} className={`px-2 py-1 text-[10px] font-bold rounded transition-colors ${language === 'en' ? 'bg-[#1a1464] text-white' : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'}`}>EN</button>
                        {product.details.translations.fr && <button onClick={() => setLanguage('fr')} className={`px-2 py-1 text-[10px] font-bold rounded transition-colors ${language === 'fr' ? 'bg-[#1a1464] text-white' : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'}`}>FR</button>}
                        {product.details.translations.es && <button onClick={() => setLanguage('es')} className={`px-2 py-1 text-[10px] font-bold rounded transition-colors ${language === 'es' ? 'bg-[#1a1464] text-white' : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'}`}>ES</button>}
                        {product.details.translations.de && <button onClick={() => setLanguage('de')} className={`px-2 py-1 text-[10px] font-bold rounded transition-colors ${language === 'de' ? 'bg-[#1a1464] text-white' : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'}`}>DE</button>}
                        {product.details.translations.ar && <button onClick={() => setLanguage('ar')} className={`px-2 py-1 text-[10px] font-bold rounded transition-colors ${language === 'ar' ? 'bg-[#1a1464] text-white' : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'}`}>AR</button>}
                      </div>
                    )}
                  </div>
                </div>

                <p className="text-[#555] text-[13px] leading-relaxed pr-4" dir={language === 'ar' ? 'rtl' : 'ltr'}>
                  {language === 'en' ? product.description : (product.details?.translations?.[language as keyof typeof product.details.translations] || product.description)}
                </p>

                {/* Circular Badges */}
                <div className="flex flex-col gap-3 py-2">
                  <div className="flex items-center gap-10">
                    <div className="flex flex-col items-center gap-2 cursor-pointer group" onClick={() => setActiveBadge(activeBadge === 'gi' ? null : 'gi')}>
                      <div className="w-14 h-14 rounded-full border-[1.5px] border-[#1a1464] flex items-center justify-center bg-white text-[#1a1464] relative group-hover:bg-[#f5f5f7] transition-colors">
                        <Award className="h-6 w-6 relative z-10" strokeWidth={1.5} />
                        <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-[#ffe270] rounded-full -z-0"></div>
                      </div>
                      <span className="text-[11px] text-[#444] font-medium text-center leading-tight">GI Certified</span>
                    </div>
                    
                    <div className="flex flex-col items-center gap-2 cursor-pointer group" onClick={() => setActiveBadge(activeBadge === 'material' ? null : 'material')}>
                      <div className="w-14 h-14 rounded-full border-[1.5px] border-[#1a1464] flex items-center justify-center bg-white text-[#1a1464] relative group-hover:bg-[#f5f5f7] transition-colors">
                        <ShieldCheck className="h-6 w-6 relative z-10" strokeWidth={1.5} />
                        <div className="absolute -bottom-1 -left-1 w-5 h-5 bg-[#a3e635] rounded-full -z-0"></div>
                      </div>
                      <span className="text-[11px] text-[#444] font-medium text-center leading-tight line-clamp-2 max-w-[60px]">{product.details?.material || 'Premium Fabric'}</span>
                    </div>

                    <div className="flex flex-col items-center gap-2 cursor-pointer group" onClick={() => setActiveBadge(activeBadge === 'shipping' ? null : 'shipping')}>
                      <div className="w-14 h-14 rounded-full border-[1.5px] border-[#1a1464] flex items-center justify-center bg-white text-[#1a1464] relative group-hover:bg-[#f5f5f7] transition-colors">
                        <Globe className="h-6 w-6 relative z-10" strokeWidth={1.5} />
                        <div className="absolute -top-1 -right-1 w-5 h-5 bg-[#93c5fd] rounded-full -z-0"></div>
                      </div>
                      <span className="text-[11px] text-[#444] font-medium text-center leading-tight">Free Global Shipping</span>
                    </div>
                  </div>

                  {/* Badge Info Expandable Area */}
                  {activeBadge === 'gi' && (
                    <div className="bg-[#fdfbf7] p-4 rounded-lg border border-amber-200 text-xs text-zinc-700 shadow-sm animate-in fade-in slide-in-from-top-2 duration-300">
                      <strong className="text-[#1a1464] text-[13px] block mb-1">GI Certified (Geographical Indication)</strong>
                      This product holds an authentic Geographical Indication tag, guaranteeing that it is genuinely handcrafted in its traditional region of origin (Jaipur, Rajasthan) using centuries-old heritage techniques.
                    </div>
                  )}
                  {activeBadge === 'material' && (
                    <div className="bg-[#fdfbf7] p-4 rounded-lg border border-amber-200 text-xs text-zinc-700 shadow-sm animate-in fade-in slide-in-from-top-2 duration-300">
                      <strong className="text-[#1a1464] text-[13px] block mb-1">Material Details</strong>
                      This garment is made using {product.details?.material || 'Premium Fabric'}. Our materials are carefully sourced to ensure maximum breathability, durability, and a luxurious feel against your skin.
                    </div>
                  )}
                  {activeBadge === 'shipping' && (
                    <div className="bg-[#fdfbf7] p-4 rounded-lg border border-amber-200 text-xs text-zinc-700 shadow-sm animate-in fade-in slide-in-from-top-2 duration-300">
                      <strong className="text-[#1a1464] text-[13px] block mb-2">Free Global Shipping</strong>
                      We offer free, fully tracked worldwide shipping on all orders via premium couriers.
                      <div className="mt-3 bg-white p-3 rounded border border-zinc-100">
                        <strong className="block mb-1 text-zinc-800">✈️ Estimated Delivery Times:</strong>
                        <ul className="space-y-0.5 text-[11px] text-zinc-600">
                          <li>• USA: 5–9 Business Days</li>
                          <li>• UK: 4–8 Business Days</li>
                          <li>• Europe: 5–10 Business Days</li>
                          <li>• Canada: 6–10 Business Days</li>
                          <li>• Australia: 6–12 Business Days</li>
                        </ul>
                      </div>
                      <div className="mt-3 text-[11px] bg-brand-50 p-2.5 rounded border border-brand-100 text-brand-800">
                        <strong className="block mb-1 text-sm">Need it sooner?</strong>
                        We can provide expedited fast shipping at <strong>no extra cost</strong> if you have a genuine reason (like a wedding, gift, or special event). 
                        <a href="https://wa.me/919461858955" target="_blank" rel="noopener noreferrer" className="inline-block mt-2 px-3 py-1.5 bg-brand-700 text-white rounded font-bold hover:bg-brand-800 transition-colors shadow-sm">
                          Request Fast Shipping
                        </a>
                      </div>
                    </div>
                  )}
                </div>

                {/* Size Selector */}
                <div className="space-y-3 pt-4">
                  <div className="flex flex-col gap-2">
                    <div className="text-[11px] uppercase font-bold text-[#111] tracking-widest">
                      SIZE: XL
                    </div>
                    
                    <div className="text-[12px] text-[#444] bg-[#fdfbf7] p-4 rounded border border-brand-200 space-y-3 shadow-sm">
                      <div>
                        <strong className="text-[#1a1464]">Best Fit For:</strong>
                        <ul className="list-disc pl-5 mt-1 space-y-0.5 text-zinc-600">
                          <li>Recommended for women who usually wear <strong>US XL (16–18)</strong> or <strong>UK XL (18–20)</strong>.</li>
                          <li>Suitable for a <strong>bust measurement of 44–46 inches (112–117 cm)</strong>.</li>
                          <li>Ideal for those who prefer a comfortable, relaxed fit.</li>
                        </ul>
                      </div>
                      <div>
                        <strong className="text-[#1a1464]">Garment Measurements:</strong>
                        <ul className="list-disc pl-5 mt-1 space-y-0.5 text-zinc-600">
                          <li>Chest: 46 in (117 cm)</li>
                          <li>Shoulder: 19 in (48 cm)</li>
                          <li>Sleeve Length: 24.5 in (62 cm)</li>
                          <li>Jacket Length: 29 in (74 cm)</li>
                        </ul>
                      </div>
                      <p className="text-xs italic text-zinc-500">
                        Please allow a 1–2 cm variation, as each jacket is handmade.
                      </p>
                    </div>

                    <p className="text-[12px] text-[#555] bg-[#f5f5f7] p-3 rounded border border-zinc-200 mt-2">
                      <strong>Custom Size / Need Help?</strong><br/>
                      <a href="https://api.whatsapp.com/send?phone=919461858955&text=Need%20help%20with%20sizing%20and%20length" target="_blank" rel="noopener noreferrer" className="text-[#1a1464] font-bold underline underline-offset-2">Contact us on WhatsApp</a> for helping in the size and the length.
                    </p>
                  </div>
                </div>

                {/* Add to Cart Actions */}
                <div className="pt-6 pb-2">
                  <div className="flex h-14 max-w-md">
                    {isInCart ? (
                      <button
                        onClick={handleAddToCart}
                        className="flex-1 bg-white border-2 border-[#1a1464] text-[#1a1464] font-bold text-[13px] uppercase tracking-widest flex items-center justify-center gap-2 transition-colors hover:bg-[#f0f0f5]"
                      >
                        <Check className="h-4 w-4 stroke-[3]" />
                        <span>Added to Cart</span>
                      </button>
                    ) : (
                      <button
                        onClick={handleAddToCart}
                        disabled={product.stock_quantity === 0}
                        className="flex-1 bg-white border-2 border-[#1a1464] text-[#1a1464] font-bold text-[13px] uppercase tracking-widest flex items-center justify-center gap-2 transition-colors hover:bg-[#f0f0f5] disabled:opacity-50"
                      >
                        {product.stock_quantity === 0 ? 'Out of Stock' : `${formatPrice(product.price_inr)} | ADD TO CART`}
                      </button>
                    )}
                    
                    <div className="flex items-center justify-between px-4 border-2 border-l-0 border-[#1a1464] bg-white text-[#1a1464] w-28 shrink-0">
                      <button
                        onClick={() => {
                          if (cartItem && product) {
                            updateQuantity(product.id, cartItem.quantity - 1);
                          }
                          setQuantity(Math.max(0, quantity - 1));
                        }}
                        className="text-[#1a1464] hover:opacity-70 transition-opacity p-2 -ml-2"
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                      <span className="font-bold text-[15px]">{displayQuantity}</span>
                      <button
                        onClick={() => {
                          if (cartItem && product) {
                            updateQuantity(product.id, cartItem.quantity + 1);
                          } else if (quantity === 0 && product) {
                            addToCart({
                              id: product.id,
                              name: product.name,
                              price_inr: product.price_inr,
                              images: product.images,
                              sku: product.sku,
                              category: product.category
                            }, 1);
                            setQuantity(1);
                          } else {
                            setQuantity(Math.min(product.stock_quantity, quantity + 1));
                          }
                        }}
                        className="text-[#1a1464] hover:opacity-70 transition-opacity p-2 -mr-2"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  
                  {/* Payment Badges under Add to Cart */}
                  <div className="mt-3 flex items-center gap-3 bg-white px-3 py-2 rounded-lg border border-zinc-200 shadow-sm max-w-max">
                    <svg viewBox="0 0 256 83" className="h-3.5 object-contain" width="35" height="11" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M111.4 81.36L129.28 0h30.06L140.48 81.36h-29.08zM242.06 8.35c-5.74-2.23-14.73-4.58-26.31-4.58-29.35 0-50.04 15.65-50.21 38.08-.18 16.59 14.88 25.86 26.23 31.42 11.69 5.75 15.63 9.4 15.6 14.51-.04 7.84-9.39 11.45-18.06 11.45-12.38 0-18.91-1.9-28.98-6.38l-4.08-1.91-4.22 26.23c6.88 3.19 19.67 5.96 32.96 6.11 31.06 0 51.48-15.35 51.71-39.11.21-13.4-8.08-23.75-25.26-31.95-10.45-5.32-15.02-8.83-15-13.79.03-4.69 5.34-9.59 17.06-9.59 9.8 0 16.73 2.12 21.95 4.54l2.67 1.25 4.24-26.26zM203.49 81.36h28.16L213.1 0h-23.94c-6.86 0-12.72 4.02-15.53 10.33l-34.99 71.03h29.68l5.92-16.48h36.31l3.43 16.48zm-19.98-38.38l12.44-34.33h.36l6.81 34.33h-19.61zM73.54 0L53.79 55.43 51.05 41.5C46.85 24.36 31.4 10.3 12.02 5.06l16.14 76.3h29.83l45.47-81.36H73.54z" fill="#1434CB"/><path d="M31.11 0C21.71 0 5.43 .72 .03 5.06c24.58 6.03 41.69 20.35 48.74 37.69l-7.39-36.9C39.77 2.37 36.39 0 31.11 0z" fill="#F2A900"/></svg>
                    <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" alt="Mastercard" className="h-5 object-contain" />
                    <img src="https://upload.wikimedia.org/wikipedia/commons/3/30/American_Express_logo.svg" alt="American Express" className="h-4 object-contain rounded-sm" />
                    <img src="https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg" alt="PayPal" className="h-4 object-contain" />
                  </div>
                </div>

                {/* Info Banners */}
                <div className="flex flex-col gap-2 max-w-md pt-3">
                  <div className="bg-[#f5f5f7] rounded p-3.5 text-center text-[12px] font-medium text-[#444]">
                    <span className="font-bold text-[#1a1464]">25% off</span> on shop above $120. <a href="#" className="text-[#1a1464] font-bold underline underline-offset-2">Details here</a>
                  </div>
                </div>

                {/* Actions (Wishlist/Share) & AI Sizing */}
                <div className="pt-4 flex flex-col gap-4 max-w-md">
                  <div className="flex justify-between items-center">
                    <button
                      onClick={toggleWishlist}
                      className={`flex items-center gap-1.5 text-xs font-semibold transition-all ${
                        wishlisted ? 'text-red-500' : 'text-zinc-500 hover:text-red-500'
                      }`}
                    >
                      <Heart className={`h-4 w-4 ${wishlisted ? 'fill-red-500' : ''}`} />
                      {wishlisted ? 'Saved' : 'Wishlist'}
                    </button>
                    <button
                      onClick={handleWhatsAppShare}
                      className="flex items-center gap-1.5 text-xs font-semibold text-zinc-500 hover:text-green-600 transition-all"
                    >
                      <Share2 className="h-4 w-4" />
                      Share via WhatsApp
                    </button>
                  </div>
                  
                  {/* AI Sizing Assistant - Collapsed */}
                  <div className={`transition-all duration-500 overflow-hidden rounded-xl border ${sizingOpen ? 'border-brand-300 shadow-lg' : 'border-zinc-200'}`}>
                    <button 
                      onClick={() => setSizingOpen(!sizingOpen)}
                      className={`w-full flex items-center justify-between p-4 ${sizingOpen ? 'bg-brand-50' : 'bg-white hover:bg-zinc-50'}`}
                    >
                      <div className="flex items-center gap-3">
                        <Sparkles className="h-4 w-4 text-brand-600" />
                        <span className="text-sm font-bold text-zinc-900 font-serif">AI TAILOR ✨</span>
                      </div>
                      <ChevronDown className={`h-4 w-4 text-zinc-400 transition-transform ${sizingOpen ? 'rotate-180' : ''}`} />
                    </button>
                    <div className={`transition-all duration-500 ease-in-out ${sizingOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}>
                      <div className="p-4 border-t border-brand-100 bg-brand-50/50">
                        <input 
                          type="text" 
                          value={sizingInput}
                          onChange={(e) => setSizingInput(e.target.value)}
                          placeholder="e.g. US Size 6, Zara" 
                          className="w-full text-sm px-3 py-2 border border-zinc-200 rounded mb-2"
                        />
                        <button 
                          onClick={handleSizingRequest}
                          disabled={sizingLoading || !sizingInput.trim()}
                          className="w-full py-2 bg-zinc-900 text-white text-xs font-bold rounded"
                        >
                          {sizingLoading ? '...' : 'Calculate Size'}
                        </button>
                        {sizingResult && (
                          <div className="mt-3 text-sm font-medium text-brand-800">{sizingResult}</div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

                {/* Social */}
                <div className="mt-4 flex flex-col sm:flex-row items-center justify-start gap-4 max-w-md">
                  <a href="https://instagram.com/textileofjaipur" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center w-full gap-2 px-4 py-3 bg-gradient-to-r from-[#833ab4] via-[#fd1d1d] to-[#fcb045] text-white rounded-lg hover:shadow-md transition-all">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-instagram"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
                    <span className="text-[13px] font-bold tracking-wide">Follow @textileofjaipur</span>
                  </a>
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

                {/* Behind the Scenes CTA */}
                <Link href="/behind-the-scenes" className="mt-4 block group relative overflow-hidden rounded-xl border border-zinc-200">
                  <div className="absolute inset-0 bg-gradient-to-r from-zinc-900 to-zinc-800 z-0"></div>
                  <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1544816155-12df9643f363?w=800&auto=format&fit=crop&q=80')] bg-cover bg-center opacity-20 mix-blend-overlay group-hover:scale-105 transition-transform duration-700"></div>
                  <div className="relative z-10 p-5 flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-white mb-1 flex items-center gap-2">
                        <Video className="h-4 w-4 text-brand-400" />
                        Take a Tour of Our Store
                      </h4>
                      <p className="text-xs text-zinc-300">Watch how our artisans craft these pieces.</p>
                    </div>
                    <div className="h-10 w-10 shrink-0 rounded-full bg-white/10 flex items-center justify-center border border-white/20 group-hover:bg-brand-600 group-hover:border-brand-500 transition-colors">
                      <Play className="h-4 w-4 text-white fill-white ml-0.5" />
                    </div>
                  </div>
                </Link>

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

                {/* Season & Comfort Guide */}
                {(() => {
                  const cat = product.category?.toUpperCase() || '';
                  const name = product.name?.toUpperCase() || '';
                  const desc = product.description?.toUpperCase() || '';
                  
                  let guide = null;
                  if (cat.includes('COTTON') || name.includes('COTTON') || desc.includes('COTTON SUZANI')) {
                    guide = { temp: '18°C–30°C (64°F–86°F)', comfort: 'Lightweight, breathable, ideal for spring, summer evenings, and mild autumn.' };
                  } else if (cat.includes('TNT') || name.includes('TNT') || desc.includes('TNT SUZANI')) {
                    guide = { temp: '15°C–25°C (59°F–77°F)', comfort: 'Medium-weight, suitable for spring, autumn, and cool evenings.' };
                  } else if (cat.includes('VELVET') || name.includes('VELVET') || desc.includes('VELVET SUZANI')) {
                    guide = { temp: '5°C–18°C (41°F–64°F)', comfort: 'Warm, soft, and perfect for autumn, winter, and chilly evenings. Layer for temperatures below 5°C.' };
                  }

                  if (!guide) return null;

                  return (
                    <div className="mt-6 border border-sky-200 rounded-xl overflow-hidden bg-white shadow-sm">
                      <div className="bg-sky-50 px-5 py-3 border-b border-sky-200 flex items-center gap-2">
                        <svg className="h-4 w-4 text-sky-700" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 4v10.54a4 4 0 1 1-4 0V4a2 2 0 0 1 4 0Z"/><path d="M12 12v.01"/></svg>
                        <h4 className="text-sm font-bold text-sky-900">Season & Comfort Guide</h4>
                      </div>
                      <div className="p-5 space-y-4">
                        <div>
                          <h5 className="text-xs font-bold text-zinc-900 uppercase tracking-wider mb-1">Best Temperature</h5>
                          <p className="text-sm text-zinc-600 leading-relaxed font-medium">{guide.temp}</p>
                        </div>
                        <div className="pt-4 border-t border-zinc-100">
                          <h5 className="text-xs font-bold text-zinc-900 uppercase tracking-wider mb-1">Comfort Level</h5>
                          <p className="text-sm text-zinc-600 leading-relaxed">{guide.comfort}</p>
                        </div>
                      </div>
                    </div>
                  );
                })()}
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
          ) : product.sku === 'HT-ADC0D306' ? (
            <div className="mt-20 border-t border-zinc-200">
              <PremiumTntSuzaniReviews dynamicReviews={dynamicReviews} />
            </div>
          ) : product.sku === 'HT-3E213213' ? (
            <div className="mt-20 border-t border-zinc-200">
              <LuxeVelvetSuzaniReviews dynamicReviews={dynamicReviews} />
            </div>
          ) : product.sku === 'HT-67C735B7' ? (
            <div className="mt-20 border-t border-zinc-200">
              <ArtisanVelvetReviews dynamicReviews={dynamicReviews} />
            </div>
          ) : product.sku === 'HT-9583C699' ? (
            <div className="mt-20 border-t border-zinc-200">
              <ElegantVelvetReviews dynamicReviews={dynamicReviews} />
            </div>
          ) : product.sku === 'HT-AC3C5EFA' ? (
            <div className="mt-20 border-t border-zinc-200">
              <OrangeVelvetReviews dynamicReviews={dynamicReviews} />
            </div>
          ) : product.sku === 'HT-AAE2C552' ? (
            <div className="mt-20 border-t border-zinc-200">
              <VintageRedVelvetReviews dynamicReviews={dynamicReviews} />
            </div>
          ) : product.sku === 'HT-5A70D4A3' ? (
            <div className="mt-20 border-t border-zinc-200">
              <PurpleTntSuzaniReviews dynamicReviews={dynamicReviews} />
            </div>
          ) : product.sku === 'HT-546BA892' ? (
            <div className="mt-20 border-t border-zinc-200">
              <LuxuryBrownVelvetReviews dynamicReviews={dynamicReviews} />
            </div>
          ) : product.sku === 'HT-A7C17406' ? (
            <div className="mt-20 border-t border-zinc-200">
              <TraditionalBlackVelvetReviews dynamicReviews={dynamicReviews} />
            </div>
          ) : product.sku === 'HT-70FAB166' ? (
            <div className="mt-20 border-t border-zinc-200">
              <EthnicBlackVelvetReviews dynamicReviews={dynamicReviews} />
            </div>
          ) : product.sku === 'HT-6ECC305C' ? (
            <div className="mt-20 border-t border-zinc-200">
              <BlueTntSuzaniReviews dynamicReviews={dynamicReviews} />
            </div>
          ) : product.sku === 'HT-62DFD632' ? (
            <div className="mt-20 border-t border-zinc-200">
              <GreenVelvetSuzaniReviews dynamicReviews={dynamicReviews} />
            </div>
          ) : product.sku === 'HT-4D240629' ? (
            <div className="mt-20 border-t border-zinc-200">
              <CyanVelvetSuzaniReviews dynamicReviews={dynamicReviews} />
            </div>
          ) : product.sku === 'HT-3E4548B1' ? (
            <div className="mt-20 border-t border-zinc-200">
              <BohemianVelvetReviews dynamicReviews={dynamicReviews} />
            </div>
          ) : product.sku === 'HT-BFB1B936' ? (
            <div className="mt-20 border-t border-zinc-200">
              <EvilEyeVelvetReviews dynamicReviews={dynamicReviews} />
            </div>
          ) : product.sku === 'HT-745FF4DE' ? (
            <div className="mt-20 border-t border-zinc-200">
              <DarkPaisleyVelvetReviews dynamicReviews={dynamicReviews} />
            </div>
          ) : product.sku === 'HT-3CB2856C' ? (
            <div className="mt-20 border-t border-zinc-200">
              <WomensVelvetSuzaniReviews dynamicReviews={dynamicReviews} />
            </div>
          ) : product.sku === 'HT-2F2A2BCB' ? (
            <div className="mt-20 border-t border-zinc-200">
              <CottonTntEmbroideryReviews dynamicReviews={dynamicReviews} />
            </div>
          ) : product.sku === 'HT-5046D569' ? (
            <div className="mt-20 border-t border-zinc-200">
              <EmbroideredVelvetSuzaniReviews dynamicReviews={dynamicReviews} />
            </div>
          ) : product.sku === 'HT-D6AE71F0' ? (
            <div className="mt-20 border-t border-zinc-200">
              <HandcraftedVelvetCoatReviews dynamicReviews={dynamicReviews} />
            </div>
          ) : product.sku === 'HT-91807C13' ? (
            <div className="mt-20 border-t border-zinc-200">
              <RedCottonSuzaniReviews dynamicReviews={dynamicReviews} />
            </div>
          ) : product.sku === 'HT-52B60A68' ? (
            <div className="mt-20 border-t border-zinc-200">
              <EmeraldBohoVelvetReviews dynamicReviews={dynamicReviews} />
            </div>
          ) : product.sku === 'HT-9B8CB946' ? (
            <div className="mt-20 border-t border-zinc-200">
              <NavyFloralVelvetReviews dynamicReviews={dynamicReviews} />
            </div>
          ) : product.sku === 'HT-5EB59E11' ? (
            <div className="mt-20 border-t border-zinc-200">
              <VelvetSuzaniHT5EB59E11Reviews dynamicReviews={dynamicReviews} />
            </div>
          ) : product.sku === 'HT-7A15D83B' ? (
            <div className="mt-20 border-t border-zinc-200">
              <VelvetSuzaniHT7A15D83BReviews dynamicReviews={dynamicReviews} />
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
              <div className="w-full md:w-2/3 flex items-start justify-center bg-zinc-50 border border-zinc-100 rounded-2xl p-12 min-h-[300px]">
                {dynamicReviews.length > 0 ? (
                  <div className="space-y-6 w-full">
                    {dynamicReviews.map((review, idx) => (
                      <div key={idx} className="bg-white p-5 rounded-xl border border-zinc-200 shadow-sm text-left">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-8 h-8 rounded-full bg-zinc-100 text-zinc-700 flex items-center justify-center font-serif text-[14px] font-bold border border-zinc-200 shrink-0">
                            {review.initial || review.name.charAt(0)}
                          </div>
                          <div className="flex-1">
                            <div className="font-bold text-[13px] text-zinc-900">{review.name}</div>
                            <div className="text-[10px] text-zinc-500 uppercase">{review.date}</div>
                          </div>
                          <div className="text-[12px] text-brand-600 tracking-wider">
                            {'★'.repeat(review.stars)}{'☆'.repeat(5 - review.stars)}
                          </div>
                        </div>
                        {review.title && <div className="font-serif text-[14px] font-semibold text-zinc-900 mb-1.5">{review.title}</div>}
                        <div className="text-[13px] leading-relaxed text-zinc-600">
                          {review.body}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center self-center">
                    <Heart className="h-10 w-10 text-zinc-300 mx-auto mb-3" />
                    <p className="font-bold text-zinc-700 text-lg">No experiences shared yet</p>
                    <p className="text-sm text-zinc-500 mt-1">Be the first to share your experience!</p>
                  </div>
                )}
              </div>
            </div>
          </div>
          )}
          
          {/* Review Disclaimer */}
          <div className="mt-12 mb-4 flex justify-center px-4">
            <div className="max-w-2xl flex items-start gap-3 p-4 bg-zinc-50 border border-zinc-100 rounded-xl text-left">
              <div className="shrink-0 pt-0.5">
                <Info className="h-4 w-4 text-zinc-400" />
              </div>
              <p className="text-xs text-zinc-500 leading-relaxed">
                <span className="font-semibold text-zinc-600">Disclaimer:</span> Some of the reviews displayed here may have been collected from our official Instagram page or other platforms where our shop operates, such as Etsy. We consolidate these reviews to provide a complete picture of our customers' experiences.
              </p>
            </div>
          </div>

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
                      <img 
                        src={rp.image || 'https://via.placeholder.com/400x500'} 
                        alt={rp.name}
                        className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
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
                  },
                  {
                    q: 'In how many days will I receive my delivery?',
                    a: '✈️ Estimated Delivery Times:\n\n• USA: 5–9 Business Days\n• United Kingdom: 4–8 Business Days\n• Europe: 5–10 Business Days\n• Canada: 6–10 Business Days\n• Australia: 6–12 Business Days\n\nNeed it sooner? We can provide expedited shipping at no extra cost if you have a genuine reason (like a wedding, gift, or special event). Please reach out to us to request fast delivery for your order.'
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
                      <div className="p-5 pt-0 text-sm text-zinc-600 leading-relaxed bg-white border-t border-zinc-100 whitespace-pre-line">
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
