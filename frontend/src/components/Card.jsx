import React from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { HeartIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolid } from '@heroicons/react/24/solid';

export default function Card({ product }) {
  const { toggleWishlist, wishlist } = useStore();

  if (!product) return null;

  const isWishlisted = (wishlist || []).includes(product.id);
  const priceINR = product.price ? (product.price * 83).toFixed(0) : 0;
  const comparePriceINR = product.compare_at_price ? (product.compare_at_price * 83).toFixed(0) : null;

  const handleWishlist = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (toggleWishlist) toggleWishlist(product.id);
  };

  return (
    <Link to={`/product/${product.id}`} className="group block w-full card-luxury relative bg-transparent">
      
      {/* ── Image Container ── */}
      <div className="relative aspect-[3/4] w-full img-zoom bg-[var(--color-parchment)] dark:bg-[#161412] mb-4">
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.name}
            className="w-full h-full object-cover object-top"
            loading="lazy"
            decoding="async"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-xs tracking-widest text-[var(--color-bronze)] uppercase">
            Image Unavailable
          </div>
        )}

        {/* Wishlist Icon */}
        <button
          onClick={handleWishlist}
          className="absolute top-4 right-4 p-2 rounded-full bg-white/50 dark:bg-black/50 backdrop-blur opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-white dark:hover:bg-black"
          aria-label="Wishlist"
        >
          {isWishlisted ? (
            <HeartSolid className="w-4 h-4 text-rose-500" />
          ) : (
            <HeartIcon className="w-4 h-4 text-[var(--color-charcoal)] dark:text-[#f0ede8]" />
          )}
        </button>

        {/* Status Tags */}
        <div className="absolute bottom-4 left-4 flex flex-col gap-2">
          {!product.is_in_stock && (
            <span className="bg-black text-white text-[10px] tracking-widest uppercase px-2 py-1">Sold Out</span>
          )}
          {product.is_in_stock && comparePriceINR && Number(comparePriceINR) > Number(priceINR) && (
            <span className="bg-[var(--color-bronze)] text-white text-[10px] tracking-widest uppercase px-2 py-1">Sale</span>
          )}
        </div>
      </div>

      {/* ── Product Info ── */}
      <div className="flex flex-col gap-1 px-1">
        <h3 className="font-editorial text-lg text-[var(--color-espresso)] dark:text-[#f0ede8] truncate group-hover:text-[var(--color-bronze)] transition-colors">
          {product.name}
        </h3>
        <div className="flex items-center gap-3">
          <p className="text-sm font-medium tracking-wide">₹{priceINR}</p>
          {comparePriceINR && Number(comparePriceINR) > Number(priceINR) && (
            <p className="text-sm text-gray-400 line-through">₹{comparePriceINR}</p>
          )}
        </div>
      </div>
    </Link>
  );
}
