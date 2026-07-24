'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useCart } from '@/context/CartContext';
import { ShoppingCart, Star, Globe, Check, Heart, Share2, Shield, Flame, Eye, X } from 'lucide-react';

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
  details: { material?: string; origin?: string; care?: string; video_url?: string };
}

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { cart, addToCart, formatPrice } = useCart();
  const isInCart = cart.some((item) => item.id === product.id);
  const [wishlisted, setWishlisted] = useState(false);
  const [shareToast, setShareToast] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);

  useEffect(() => {
    if (isQuickViewOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isQuickViewOpen]);

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
  
  // Psychological Pricing
  const originalPrice = product.price_inr * 1.30;

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
        {/* Primary Media (Image or Video) */}
        {product.details?.video_url || product.images?.[0]?.match(/\.(mp4|webm|mov|ogg)$/i) ? (
          <video 
            src={product.details?.video_url || product.images?.[0]}
            autoPlay
            loop
            muted
            playsInline
            className={`object-cover absolute inset-0 w-full h-full transition-all duration-700 ease-[cubic-bezier(0.25,0.46,0.45,0.94)] ${isHovered && product.images?.length > 1 ? 'scale-110 opacity-0' : 'scale-100 opacity-100'}`}
          />
        ) : (
          <Image 
            src={product.images?.[0] || 'https://via.placeholder.com/400x500'} 
            alt={product.name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className={`object-cover transition-all duration-700 ease-[cubic-bezier(0.25,0.46,0.45,0.94)] ${isHovered && product.images?.length > 1 ? 'scale-110 opacity-0' : 'scale-100 opacity-100'}`}
            unoptimized={true}
          />
        )}
        
        {/* Secondary Image (Crossfade) */}
        {product.images && product.images.length > 1 && !product.images[1].match(/\.(mp4|webm|mov|ogg)$/i) && (
          <Image 
            src={product.images[1]} 
            alt={`${product.name} alternate view`}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className={`object-cover absolute inset-0 transition-all duration-700 ease-[cubic-bezier(0.25,0.46,0.45,0.94)] ${isHovered ? 'scale-110 opacity-100' : 'scale-100 opacity-0'}`}
            unoptimized={true}
          />
        )}
        
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/10 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

        {/* Top-right: Brand Logo Overlay */}
        <div className="absolute top-4 right-4 z-20 opacity-90 drop-shadow-md">
          <img src="/icon.png" alt="Texxtile Jaipur" className="h-7 w-7 rounded-md object-cover border border-white/30 shadow-lg" />
        </div>

        {/* Top-left: Badges */}
        <div className="absolute top-4 left-4 flex flex-col items-start gap-2 z-10">

          {product.is_featured && (
            <span className="bg-brand-900 text-brand-50 text-[9px] font-bold tracking-widest uppercase px-3 py-1.5 shadow-sm border border-brand-800">
              New Arrival
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

        {/* Stock urgency badges */}
        {isLowStock && (
          <span className="absolute bottom-4 right-4 bg-red-600/95 backdrop-blur-md text-white text-[10px] font-bold px-3 py-1.5 rounded-full z-10 flex items-center gap-1.5 shadow-[0_0_15px_rgba(220,38,38,0.5)] animate-pulse border border-red-400">
            <Flame className="h-3 w-3" /> Only {product.stock} left!
          </span>
        )}
        {!isLowStock && isSellingFast && (
          <span className="absolute bottom-4 right-4 bg-amber-500/95 backdrop-blur-md text-white text-[10px] font-bold px-3 py-1.5 rounded-full z-10 flex items-center gap-1.5 shadow-[0_0_15px_rgba(245,158,11,0.5)] border border-amber-300">
            <Flame className="h-3 w-3" /> Selling Fast
          </span>
        )}

        {/* Origin badge */}
        {product.details?.origin && (
          <span className="absolute bottom-4 left-4 bg-zinc-900/90 backdrop-blur-sm text-white text-[9px] font-bold px-2 py-1.5 flex items-center gap-1.5 tracking-widest uppercase shadow-sm z-10 transform translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
            <Globe className="h-3 w-3 text-brand-300" />
            {product.details.origin}
          </span>
        )}

        {/* Quick View Button */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setIsQuickViewOpen(true);
            }}
            className="pointer-events-auto bg-white/95 backdrop-blur-md text-zinc-900 flex items-center gap-2 px-5 py-2.5 rounded-full shadow-xl opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 hover:bg-zinc-900 hover:text-white font-bold tracking-widest uppercase text-[10px]"
          >
            <Eye className="h-4 w-4" />
            Quick View
          </button>
        </div>

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
          {/* GI Tag + Rating row */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5">
              <span className="inline-flex items-center gap-1 bg-amber-50 border border-amber-200 text-amber-700 text-[8px] font-bold px-1.5 py-0.5 rounded tracking-wider uppercase">
                <Shield className="h-2.5 w-2.5" />
                GI Certified
              </span>
            </div>
            <div className="flex items-center gap-1">
              <Star className="h-3 w-3 fill-gold text-gold" />
              <span className="text-zinc-600 font-semibold text-[10px]">4.8</span>
            </div>
          </div>

          <Link href={`/product/${product.id}`} prefetch={true} className="block">
            <h4 className="text-lg font-serif text-zinc-900 tracking-wide line-clamp-1 group-hover:text-brand-700 transition-colors duration-300">
              {product.name}
            </h4>
          </Link>

          {/* SKU + material */}
          <div className="flex items-center gap-2 text-[9px] text-zinc-400">
            <span className="font-mono tracking-wider">{product.sku}</span>
            {product.details?.material && (
              <>
                <span>·</span>
                <span className="font-bold tracking-widest uppercase text-zinc-500">{product.details.material}</span>
              </>
            )}
          </div>
        </div>

        {/* Price & Action */}
        <div className="flex flex-col justify-between pt-3 gap-3">
          <div className="flex flex-col shrink-0">
            <div className="flex items-center gap-2">
              <span className="text-lg font-serif font-bold text-zinc-900">
                {formatPrice(product.price_inr)}
              </span>
              <span className="text-xs text-zinc-400 line-through font-medium">
                {formatPrice(originalPrice)}
              </span>
            </div>
          </div>

          <div className="flex gap-2 w-full">
            {isInCart ? (
              <button
                onClick={(e) => {
                  e.preventDefault();
                  addToCart(product);
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
      {/* Quick View Modal */}
      {isQuickViewOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm animate-fade-in cursor-pointer" onClick={() => setIsQuickViewOpen(false)}>
          <div 
            className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col md:flex-row relative cursor-default"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button 
              onClick={() => setIsQuickViewOpen(false)}
              className="absolute top-4 right-4 z-10 p-2 bg-white/90 backdrop-blur-sm rounded-full text-zinc-500 hover:text-zinc-900 shadow-md transition-colors"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Left: Image */}
            <div className="w-full md:w-1/2 aspect-[4/5] md:aspect-auto md:h-auto min-h-[40vh] relative bg-[#FDFBF7]">
              {product.details?.video_url || product.images?.[0]?.match(/\.(mp4|webm|mov|ogg)$/i) ? (
                <video src={product.details?.video_url || product.images?.[0]} autoPlay loop muted playsInline className="object-cover absolute inset-0 w-full h-full" />
              ) : (
                <Image src={product.images?.[0] || 'https://via.placeholder.com/400x500'} alt={product.name} fill className="object-cover" unoptimized={true} />
              )}
            </div>

            {/* Right: Details */}
            <div className="w-full md:w-1/2 p-6 md:p-10 flex flex-col bg-white">
              <div className="flex items-center gap-2 mb-3">
                <span className="inline-flex items-center gap-1 bg-amber-50 border border-amber-200 text-amber-700 text-[10px] font-bold px-2 py-1 rounded tracking-wider uppercase">
                  <Shield className="h-3 w-3" />
                  GI Certified
                </span>
                <div className="flex items-center gap-1">
                  <Star className="h-3.5 w-3.5 fill-gold text-gold" />
                  <span className="text-zinc-600 font-semibold text-xs">4.8 (24 Reviews)</span>
                </div>
              </div>

              <h2 className="text-2xl md:text-3xl font-serif text-zinc-900 mb-2 leading-tight">{product.name}</h2>
              <div className="flex items-center gap-3 mb-6">
                <span className="text-2xl font-serif font-bold text-zinc-900">{formatPrice(product.price_inr)}</span>
                <span className="text-sm text-zinc-400 line-through font-medium">{formatPrice(originalPrice)}</span>
              </div>

              <p className="text-zinc-600 text-sm leading-relaxed mb-6 line-clamp-4">
                {product.description || 'Experience the true essence of Jaipur with this authentic, hand-crafted piece. Perfect for any special occasion.'}
              </p>

              {/* Specs */}
              <div className="space-y-3 mb-8 bg-zinc-50 p-4 rounded-xl border border-zinc-100">
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-500">Size</span>
                  <span className="font-bold text-zinc-900 text-right">One Size Fits Most (S-XL)</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-500">Material</span>
                  <span className="font-bold text-zinc-900 text-right">{product.details?.material || 'Handloom Fabric'}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-500">Origin</span>
                  <span className="font-bold text-zinc-900 text-right">{product.details?.origin || 'Jaipur, Rajasthan'}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-500">SKU</span>
                  <span className="font-mono text-zinc-900">{product.sku}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="mt-auto flex flex-col gap-3">
                {isInCart ? (
                  <button
                    onClick={(e) => { e.preventDefault(); addToCart(product); }}
                    className="w-full px-6 py-4 bg-zinc-900 text-white text-sm font-bold uppercase tracking-widest transition-all duration-300 shadow-xl hover:shadow-2xl flex items-center justify-center gap-2 hover:bg-zinc-800"
                  >
                    <Check className="h-5 w-5 stroke-[3]" /> Added to Cart
                  </button>
                ) : (
                  <button
                    onClick={(e) => { e.preventDefault(); addToCart(product); }}
                    disabled={product.stock === 0}
                    className={`w-full px-6 py-4 text-sm font-bold uppercase tracking-widest transition-all duration-300 flex items-center justify-center gap-2 border-2 border-zinc-900 ${
                      product.stock === 0 ? 'bg-zinc-100 text-zinc-400 border-zinc-200 cursor-not-allowed' : 'bg-white text-zinc-900 hover:bg-zinc-900 hover:text-white shadow-sm hover:shadow-xl'
                    }`}
                  >
                    <ShoppingCart className="h-5 w-5" />
                    {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                  </button>
                )}
                
                <Link
                  href={`/product/${product.id}?buy=true`}
                  className={`w-full px-6 py-4 text-sm font-bold uppercase tracking-widest transition-all duration-300 flex items-center justify-center border border-brand-700 ${
                    product.stock === 0 ? 'bg-brand-50 text-brand-300 cursor-not-allowed pointer-events-none' : 'bg-brand-700 text-white hover:bg-brand-800 shadow-md'
                  }`}
                >
                  Buy Now
                </Link>

                <Link href={`/product/${product.id}`} className="text-center text-sm text-zinc-500 hover:text-zinc-900 underline underline-offset-4 mt-2 font-medium">
                  View Full Details
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
