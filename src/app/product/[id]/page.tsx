'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { CartSidebar } from '@/components/CartSidebar';
import { CheckoutModal } from '@/components/CheckoutModal';
import { useCart } from '@/context/CartContext';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import { ShieldCheck, Truck, ShoppingCart, Globe, Star, Minus, Plus, Check, Heart, Share2, Award, RefreshCw, Flame, Palette, User, MessageCircleQuestion, ChevronDown, ChevronUp, Sparkles } from 'lucide-react';

interface Product {
  id: string;
  sku: string;
  name: string;
  description: string;
  price_inr: number;
  category: string;
  images: string[];
  stock_quantity: number;
  details: { material?: string; origin?: string; care?: string; sizes?: string[]; video_url?: string };
}

export default function ProductPage() {
  const params = useParams();
  const id = params.id as string;
  const { cart, addToCart, formatPrice } = useCart();
  
  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [wishlisted, setWishlisted] = useState(false);
  const [shareToast, setShareToast] = useState(false);
  const [expandedQa, setExpandedQa] = useState<number | null>(null);
  const [showQuestionForm, setShowQuestionForm] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [formSubmitted, setFormSubmitted] = useState<string | null>(null);
  
  // Modal states
  const [cartOpen, setCartOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);

  const isInCart = product ? cart.some((item) => item.id === product.id) : false;

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
      setLoading(true);
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
            sku: item.slug ? `HT-${item.slug.toUpperCase()}` : `HT-${item.id.slice(0, 8).toUpperCase()}`,
            name: item.name,
            description: item.description || '',
            price_inr: item.price || 0,
            category: item.categories?.name || 'Ethnic Wear',
            images: sortedImages.length > 0 ? sortedImages : ['https://images.unsplash.com/photo-1544816155-12df9643f363?w=800&auto=format&fit=crop&q=80'],
            stock_quantity: item.stock_quantity || item.stock || 0,
            details: {
              material: item.description?.includes('Silk') ? 'Pure Silk' : item.description?.includes('Cotton') ? 'Premium Cotton' : 'Handloom Fabric',
              origin: 'Jaipur, Rajasthan',
              care: 'Dry clean only',
              sizes: ['S', 'M', 'L', 'XL'],
              video_url: item.details?.video_url
            }
          });

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
              .limit(4);
              
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
                 setRelatedProducts(formatted);
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
              .limit(4);

            if (relatedData) {
              setRelatedProducts(relatedData.map((p: any) => ({
                id: p.id,
                name: p.name,
                price_inr: p.price,
                category: p.categories?.name || 'Ethnic Wear',
                image: p.product_images?.find((img: any) => img.is_primary)?.url || p.product_images?.[0]?.url || 'https://via.placeholder.com/400x500'
              })));
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

  const handleAddToCart = () => {
    if (product) {
      addToCart({
        id: product.id,
        name: product.name,
        price_inr: product.price_inr,
        images: product.images,
        sku: product.sku
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
          sku: product.sku
        }, quantity);
      }
      setCartOpen(false);
      setCheckoutOpen(true);
    }
  };

  return (
    <main className="min-h-screen text-zinc-900 pb-16">
      <Navbar onCartOpen={() => setCartOpen(true)} />

      <div className="pt-32 px-6 max-w-7xl mx-auto">
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
                      className="absolute inset-0 w-full h-full object-cover" 
                      controls 
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

                <div className="text-3xl font-serif font-bold text-zinc-900 py-4 border-y border-zinc-200">
                  {formatPrice(product.price_inr)}

                </div>

                <p className="text-zinc-600 font-light leading-relaxed">
                  {product.description}
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
              </div>
            </div>
          </div>
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
                    <Image 
                      src={rp.image} 
                      alt={rp.name}
                      fill
                      sizes="(max-width: 768px) 50vw, 25vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
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
                    <textarea 
                      placeholder="Type your question here..." 
                      className="w-full p-3 rounded-lg border border-zinc-200 text-sm focus:outline-none focus:border-brand-500"
                      rows={3}
                    ></textarea>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => {
                          setFormSubmitted('question');
                          setTimeout(() => { setFormSubmitted(null); setShowQuestionForm(false); }, 3000);
                        }}
                        className="px-4 py-2 bg-brand-700 text-white font-bold rounded-lg text-xs"
                      >
                        Submit
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

        {/* Photo Reviews Section */}
        {product && (
          <div className="mt-20 pt-16 border-t border-zinc-200">
            <div className="flex flex-col md:flex-row gap-12">
              <div className="w-full md:w-1/3">
                <h3 className="text-2xl font-serif text-zinc-900 font-bold mb-6 flex items-center gap-2">
                  <Heart className="h-6 w-6 text-brand-600 fill-brand-600" />
                  Customer Experiences
                </h3>
                {!showReviewForm ? (
                  <button 
                    onClick={() => setShowReviewForm(true)}
                    className="px-6 py-3 bg-zinc-900 text-white font-bold rounded-xl hover:bg-zinc-800 transition-colors shadow-lg text-sm w-full md:w-auto mb-6"
                  >
                    Share Your Experience
                  </button>
                ) : formSubmitted === 'review' ? (
                  <div className="p-4 bg-green-50 text-green-700 rounded-xl border border-green-200 text-sm font-bold flex items-center gap-2">
                    <Check className="h-4 w-4" /> Review submitted for moderation!
                  </div>
                ) : (
                  <div className="space-y-3 bg-zinc-50 p-5 rounded-xl border border-zinc-200">
                    <textarea 
                      placeholder="Share your experience..." 
                      className="w-full p-3 rounded-lg border border-zinc-200 text-sm focus:outline-none focus:border-brand-500"
                      rows={3}
                    ></textarea>
                    <div className="flex items-center gap-2 mb-3">
                      <button className="px-3 py-1.5 bg-white border border-dashed border-zinc-300 text-zinc-500 rounded text-xs flex items-center gap-1">
                        + Add Photo
                      </button>
                    </div>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => {
                          setFormSubmitted('review');
                          setTimeout(() => { setFormSubmitted(null); setShowReviewForm(false); }, 3000);
                        }}
                        className="px-4 py-2 bg-zinc-900 text-white font-bold rounded-lg text-xs"
                      >
                        Share Experience
                      </button>
                      <button 
                        onClick={() => setShowReviewForm(false)}
                        className="px-4 py-2 bg-white border border-zinc-200 text-zinc-600 font-bold rounded-lg text-xs"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
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
