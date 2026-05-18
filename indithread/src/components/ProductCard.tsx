'use client';

import React from 'react';
import { useCart } from '@/context/CartContext';
import { ShoppingCart, Star, Globe } from 'lucide-react';

interface Product {
  id: string;
  sku: string;
  name: string;
  description: string;
  price_inr: number;
  category: string;
  images: string[];
  stock: number;
  details: { material?: string; origin?: string; care?: string };
}

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart, formatPrice } = useCart();

  return (
    <div className="relative rounded-2xl glass-card overflow-hidden flex flex-col h-full group">
      <div className="h-64 overflow-hidden relative bg-zinc-900 shrink-0">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img 
          src={product.images?.[0] || 'https://via.placeholder.com/400x300'} 
          alt={product.name}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        
        {/* Category Badge */}
        <span className="absolute top-4 left-4 bg-zinc-950/80 backdrop-blur-md text-zinc-300 text-[10px] font-semibold tracking-wider uppercase px-2.5 py-1 rounded-full border border-zinc-800/80">
          {product.category}
        </span>

        {/* Global Export Origin details */}
        {product.details?.origin && (
          <span className="absolute bottom-4 left-4 bg-violet-950/80 backdrop-blur-md text-violet-300 text-[9px] font-medium px-2 py-0.5 rounded-md border border-violet-800/50 flex items-center gap-1">
            <Globe className="h-3 w-3" />
            {product.details.origin}
          </span>
        )}
      </div>

      {/* Product Info */}
      <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
        <div className="space-y-1.5">
          <div className="flex justify-between items-center text-xs text-zinc-500">
            <span className="font-mono tracking-wider">{product.sku}</span>
            <div className="flex items-center gap-1">
              <Star className="h-3 w-3 fill-amber-500 text-amber-500" />
              <span className="text-zinc-400 font-semibold">4.8</span>
            </div>
          </div>
          <h4 className="text-lg font-bold text-white tracking-tight line-clamp-1 group-hover:text-violet-400 transition-colors">
            {product.name}
          </h4>
          <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed">
            {product.description}
          </p>

          {/* Details like material */}
          {product.details?.material && (
            <p className="text-[10px] text-gold font-medium">
              ✨ Craftsmanship: {product.details.material}
            </p>
          )}
        </div>

        {/* Price & Action */}
        <div className="flex items-center justify-between pt-2 border-t border-zinc-900/60">
          <div className="flex flex-col">
            <span className="text-xs text-zinc-500 font-medium">Global Price</span>
            <span className="text-xl font-extrabold text-white">
              {formatPrice(product.price_inr)}
            </span>
          </div>

          <button
            onClick={() => addToCart(product)}
            className="p-2.5 rounded-xl bg-zinc-900 hover:bg-violet-600 text-zinc-300 hover:text-white border border-zinc-800 hover:border-violet-500 transition-all shadow-md flex items-center justify-center gap-1.5 group/btn"
          >
            <ShoppingCart className="h-4 w-4" />
            <span className="text-xs font-semibold px-0.5">Add</span>
          </button>
        </div>
      </div>
    </div>
  );
};
