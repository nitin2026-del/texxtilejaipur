'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { ShoppingCart, Star, Globe, Check, Heart, Share2, Shield, Flame, Eye, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { getOptimizedUrl } from '@/utils/imageUtils';

interface Product {
  id: string;
  sku: string;
  name: string;
  description: string;
  price_inr: number;
  category: string;
  images: string[];
  stock: number;
  is_featured?: boolean;
  details: { material?: string; origin?: string; care?: string; video_url?: string; isBestseller?: boolean; };
}

interface ProductCardProps {
  product: Product;
  onCartOpen?: () => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onCartOpen }) => {
  const { cart, addToCart, formatPrice } = useCart();
  const router = useRouter();
  const isInCart = cart.some((item) => item.id === product.id);
  const [wishlisted, setWishlisted] = useState(false);
  const [shareToast, setShareToast] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  // Load wishlist state from localStorage
  useEffect(() => {
    try {
      const wl = JSON.parse(localStorage.getItem('textilejaipur_wishlist') || '[]');
      setWishlisted(wl.includes(product.id));
    } catch {}
  }, [product.id]);

  const toggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      const wl: string[] = JSON.parse(localStorage.getItem('textilejaipur_wishlist') || '[]');
      const updated = wishlisted
        ? wl.filter((id) => id !== product.id)
        : [...wl, product.id];
      localStorage.setItem('textilejaipur_wishlist', JSON.stringify(updated));
      // Store full product data for wishlist page
      const wlProducts: Record<string, Product> = JSON.parse(localStorage.getItem('textilejaipur_wishlist_products') || '{}');
      if (!wishlisted) wlProducts[product.id] = product;
      else delete wlProducts[product.id];
      localStorage.setItem('textilejaipur_wishlist_products', JSON.stringify(wlProducts));
      setWishlisted(!wishlisted);
    } catch {}
  };

  const handleWhatsAppShare = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const url = `${window.location.origin}/product/${product.id}`;
    const text = `Check out this beautiful Jaipur textile! 🎨\n*${product.name}*\n${formatPrice(product.price_inr)}\n\n${url}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
    setShareToast(true);
    setTimeout(() => setShareToast(false), 2000);
  };

  // Track recently viewed
  useEffect(() => {
    try {
      const rv: string[] = JSON.parse(localStorage.getItem('textilejaipur_recently_viewed') || '[]');
      const updated = [product.id, ...rv.filter((id) => id !== product.id)].slice(0, 10);
      localStorage.setItem('textilejaipur_recently_viewed', JSON.stringify(updated));
      const rvProducts: Record<string, Product> = JSON.parse(localStorage.getItem('textilejaipur_rv_products') || '{}');
      rvProducts[product.id] = product;
      localStorage.setItem('textilejaipur_rv_products', JSON.stringify(rvProducts));
    } catch {}
  }, [product]);

  // Stock badge logic
  const isLowStock = product.stock > 0 && product.stock <= 4;
  const isSellingFast = product.stock > 4 && product.stock <= 10;
  
  // Is this product a jacket? (Ensure it's not a Kimono)
  const isJacket = (product.category?.toLowerCase().includes('jacket') || product.name.toLowerCase().includes('jacket')) 
    && !product.name.toLowerCase().includes('kimono') 
    && !product.category?.toLowerCase().includes('kimono');
  
  // Psychological Pricing
  const originalPrice = isJacket ? product.price_inr * 1.30 : null;

  return (
    <>
      <div 
        id={`product-${product.id}`}
      className="relative bg-white flex flex-col h-full group transition-all duration-500" 
      onMouseEnter={() => setIsHovered(true)} 
      onMouseLeave={() => setIsHovered(false)}
      onTouchStart={() => setIsHovered(true)}
      onTouchEnd={() => setIsHovered(false)}
      onTouchCancel={() => setIsHovered(false)}
    >
      <Link href={`/product/${product.id}`} prefetch={true} className="block aspect-[4/5] overflow-hidden relative bg-[#FDFBF7] shrink-0">
        {/* Filter out any videos from the images array for the product card display */}
        {(() => {
          const validImages = (product.images || []).filter(img => !img.match(/\.(mp4|webm|mov|ogg)$/i));
          const primaryImage = validImages[0] || 'https://via.placeholder.com/800x1000?text=No+Image';
          const secondaryImage = validImages.length > 1 ? validImages[1] : null;

          return (
            <>
              {/* Primary Image */}
              <img 
                src={getOptimizedUrl(primaryImage)} 
                alt={product.name}
                loading="lazy"
                className={`object-cover absolute inset-0 w-full h-full transition-all duration-700 ease-[cubic-bezier(0.25,0.46,0.45,0.94)] ${isHovered && secondaryImage ? 'scale-110 opacity-0' : 'scale-100 opacity-100'}`}
              />
              
              {/* Secondary Image (Crossfade) */}
              {secondaryImage && (
                <img 
                  src={getOptimizedUrl(secondaryImage)} 
                  alt={`${product.name} alternate view`}
                  loading="lazy"
                  className={`object-cover absolute inset-0 w-full h-full transition-all duration-700 ease-[cubic-bezier(0.25,0.46,0.45,0.94)] ${isHovered ? 'scale-110 opacity-100' : 'scale-100 opacity-0'}`}
                />
              )}
            </>
          );
        })()}
        
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/10 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

        {/* Top-right: Brand Logo Overlay */}
        <div className="absolute top-4 right-4 z-20 opacity-90 drop-shadow-md">
          <img src="/icon.png" alt="Textile Jaipur" className="h-7 w-7 rounded-md object-cover border border-white/30 shadow-lg" />
        </div>

        {/* Top-left: Badges */}
        <div className="absolute top-4 left-4 flex flex-col items-start gap-2 z-10">
          {product.is_featured && (
            <span className="bg-blue-600 text-white text-[9px] font-bold tracking-widest uppercase px-3 py-1 shadow-[2px_2px_0_rgba(0,0,0,1)] border border-black transform -skew-x-6">
              New Drop
            </span>
          )}
          {product.details?.isBestseller && (
            <span className="bg-gradient-to-r from-amber-400 to-orange-500 text-white text-[10px] font-black tracking-widest uppercase px-3 py-1.5 shadow-[2px_2px_10px_rgba(245,158,11,0.5)] border border-orange-300 flex items-center gap-1.5 rounded-r-xl">
              <Flame className="h-3 w-3 fill-white animate-pulse" /> Bestseller
            </span>
          )}
          <span className="bg-white/95 backdrop-blur-sm text-zinc-900 text-[9px] font-bold tracking-widest uppercase px-3 py-1.5 shadow-sm border border-zinc-200">
            {product.category}
          </span>
        </div>

        {/* Right-side: Wishlist + Share buttons */}
        <div className="absolute top-14 right-4 flex flex-col gap-2 z-10 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-2 group-hover:translate-x-0">
          <button
            onClick={toggleWishlist}
            className={`p-2 rounded-full shadow-md backdrop-blur-sm transition-all duration-200 ${
              wishlisted ? 'bg-red-500 text-white' : 'bg-white/90 text-zinc-600 hover:text-red-500'
            }`}
            title={wishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}
          >
            <Heart className={`h-3.5 w-3.5 ${wishlisted ? 'fill-white' : ''}`} />
          </button>
          <button
            onClick={handleWhatsAppShare}
            className="p-2 rounded-full bg-white/90 text-zinc-600 hover:text-green-600 shadow-md backdrop-blur-sm transition-all duration-200"
            title="Share on WhatsApp"
          >
            <Share2 className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Stock urgency badges removed per feedback */}

        {/* Origin badge */}
        {product.details?.origin && (
          <span className="absolute bottom-4 left-4 bg-zinc-900/90 backdrop-blur-sm text-white text-[9px] font-bold px-2 py-1.5 flex items-center gap-1.5 tracking-widest uppercase shadow-sm z-10 transform translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
            <Globe className="h-3 w-3 text-brand-300" />
            {product.details.origin}
          </span>
        )}



        {/* Share toast */}
        {shareToast && (
          <div className="absolute inset-0 flex items-center justify-center z-20">
            <span className="bg-green-600 text-white text-xs font-bold px-4 py-2 rounded-full shadow-xl">
              Opening WhatsApp...
            </span>
          </div>
        )}
      </Link>

      {/* Product Info */}
      <div className="pt-5 flex-1 flex flex-col justify-between space-y-3 bg-white">
        <div className="space-y-1.5">
          {/* GI Tag + Rating row removed per feedback */}

          <Link href={`/product/${product.id}`} prefetch={true} className="block">
            <h4 className="text-lg font-serif text-zinc-900 tracking-wide line-clamp-1 group-hover:text-brand-700 transition-colors duration-300">
              {product.name}
            </h4>
          </Link>

          {/* Subtitle */}
          <div className="flex items-center gap-1.5 text-[11px] text-zinc-500 font-medium tracking-wide">
            <span>Handcrafted {product.details?.material || 'Cotton'}</span>
            <span>·</span>
            <span>Jaipur, India</span>
          </div>
        </div>

        {/* Price & Action */}
        <div className="flex flex-col justify-between pt-3 gap-3">
          <div className="flex flex-col shrink-0">
            <div className="flex items-center gap-2">
              <span className={`text-xl font-black tracking-tight ${isJacket ? 'text-red-600' : 'text-zinc-900'}`}>
                {formatPrice(product.price_inr)}
              </span>
              {originalPrice && (
                <span className="text-sm text-zinc-500 line-through font-medium">
                  {formatPrice(originalPrice)}
                </span>
              )}
            </div>
          </div>

          <div className="flex gap-2 w-full">
            {isInCart ? (
              <button
                onClick={(e) => {
                  e.preventDefault();
                  router.push(`/product/${product.id}`);
                }}
                className="flex-1 px-3 py-2 bg-zinc-900 text-white text-[10px] sm:text-xs font-bold uppercase tracking-wider transition-all duration-300 shadow-md flex items-center justify-center gap-1.5 hover:bg-zinc-800"
              >
                <Check className="h-3 w-3 sm:h-3.5 sm:w-3.5 stroke-[3]" /> Added
              </button>
            ) : (
              <button
                onClick={(e) => {
                  e.preventDefault();
                  addToCart(product);
                  onCartOpen?.();
                }}
                disabled={product.stock === 0}
                className={`flex-1 px-3 py-2 text-[10px] sm:text-xs font-bold uppercase tracking-wider transition-all duration-300 flex items-center justify-center gap-1.5 border border-zinc-900 ${
                  product.stock === 0
                    ? 'bg-zinc-100 text-zinc-400 border-zinc-200 cursor-not-allowed'
                    : 'bg-transparent text-zinc-900 hover:bg-zinc-900 hover:text-white'
                }`}
              >
                <ShoppingCart className="h-3 w-3 sm:h-3.5 sm:w-3.5 shrink-0" />
                <span className="truncate">{product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}</span>
              </button>
            )}

            <Link
              href={`/product/${product.id}?buy=true`}
              className={`flex-1 px-3 py-2 text-[10px] sm:text-xs font-bold uppercase tracking-wider transition-all duration-300 flex items-center justify-center border border-brand-700 ${
                product.stock === 0
                  ? 'bg-brand-50 text-brand-300 border-brand-200 cursor-not-allowed pointer-events-none'
                  : 'bg-brand-700 text-white hover:bg-brand-800 shadow-md'
              }`}
            >
              Buy Now
            </Link>
          </div>
        </div>
        </div>
      </div>

    </>
  );
};
